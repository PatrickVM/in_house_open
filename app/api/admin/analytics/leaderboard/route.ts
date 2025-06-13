import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view") || "users"; // Default to users view

    if (view === "users") {
      // Get user leaderboard data

      // Top converters (successful invitations / scans)
      const topConverters = await db.invitationAnalytics.findMany({
        where: { userInvitesScanned: { gt: 0 } }, // Only consider users with scans
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              churchId: true,
              church: {
                select: { name: true },
              },
            },
          },
          userInvitesSent: true,
          userInvitesScanned: true,
          userInvitesCompleted: true,
        },
        orderBy: [
          { userInvitesCompleted: "desc" }, // Primary sort by completed
          { userInvitesScanned: "desc" }, // Secondary sort by scans
        ],
        take: 3, // Top 3
      });

      // Process converters to add conversion rate
      const processedConverters = topConverters.map((item) => ({
        userId: item.user.id,
        name:
          item.user.firstName && item.user.lastName
            ? `${item.user.firstName} ${item.user.lastName}`
            : item.user.email,
        email: item.user.email,
        churchName: item.user.church?.name || null,
        invitesSent: item.userInvitesSent,
        invitesScanned: item.userInvitesScanned,
        invitesCompleted: item.userInvitesCompleted,
        conversionRate:
          item.userInvitesScanned > 0
            ? Math.round(
                (item.userInvitesCompleted / item.userInvitesScanned) * 100
              )
            : 0,
      }));

      // Top scanners (most QR code scans)
      const topScanners = await db.invitationAnalytics.findMany({
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              churchId: true,
              church: {
                select: { name: true },
              },
            },
          },
          userInvitesScanned: true,
        },
        orderBy: { userInvitesScanned: "desc" },
        take: 3, // Top 3
      });

      // Process scanners
      const processedScanners = topScanners.map((item) => ({
        userId: item.user.id,
        name:
          item.user.firstName && item.user.lastName
            ? `${item.user.firstName} ${item.user.lastName}`
            : item.user.email,
        email: item.user.email,
        churchName: item.user.church?.name || null,
        invitesScanned: item.userInvitesScanned,
      }));

      return NextResponse.json({
        topConverters: processedConverters,
        topScanners: processedScanners,
      });
    } else {
      // Get church leaderboard data

      // Get all churches with members that have invitation analytics
      const churches = await db.church.findMany({
        where: {
          applicationStatus: "APPROVED",
          members: {
            some: {
              invitationAnalytics: {
                isNot: null,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          members: {
            select: {
              invitationAnalytics: true,
            },
          },
        },
      });

      // Process church data to calculate conversion rates
      const churchStats = churches.map((church) => {
        // Aggregate stats from all church members
        const totalScans = church.members.reduce(
          (sum, member) =>
            sum + (member.invitationAnalytics?.userInvitesScanned || 0),
          0
        );

        const totalCompleted = church.members.reduce(
          (sum, member) =>
            sum + (member.invitationAnalytics?.userInvitesCompleted || 0),
          0
        );

        const conversionRate =
          totalScans > 0 ? Math.round((totalCompleted / totalScans) * 100) : 0;

        return {
          churchId: church.id,
          churchName: church.name,
          totalScans,
          totalCompleted,
          conversionRate,
        };
      });

      // Sort for top converters
      const topChurchConverters = [...churchStats]
        .filter((church) => church.totalScans > 0) // Only include churches with scans
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 3); // Top 3

      // Sort for top scanners
      const topChurchScanners = [...churchStats]
        .sort((a, b) => b.totalScans - a.totalScans)
        .slice(0, 3); // Top 3

      return NextResponse.json({
        topConverters: topChurchConverters,
        topScanners: topChurchScanners,
      });
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}

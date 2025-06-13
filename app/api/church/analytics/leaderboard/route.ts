import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has church role
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CHURCH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Get church members for filtering
    const churchMembers = await db.user.findMany({
      where: {
        churchId: church.id,
        churchMembershipStatus: "VERIFIED",
      },
      select: { id: true },
    });

    const churchMemberIds = churchMembers.map((member) => member.id);

    // Get invitation analytics for church members only
    const memberAnalytics = await db.invitationAnalytics.findMany({
      where: { userId: { in: churchMemberIds } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Process analytics to create leaderboard data
    const processedAnalytics = memberAnalytics.map((analytics) => ({
      userId: analytics.user.id,
      memberName:
        analytics.user.firstName && analytics.user.lastName
          ? `${analytics.user.firstName} ${analytics.user.lastName}`
          : analytics.user.email,
      email: analytics.user.email,
      churchInvitesSent: analytics.churchInvitesSent,
      userInvitesSent: analytics.userInvitesSent,
      userInvitesScanned: analytics.userInvitesScanned,
      userInvitesCompleted: analytics.userInvitesCompleted,
      conversionRate:
        analytics.userInvitesScanned > 0
          ? Math.round(
              (analytics.userInvitesCompleted / analytics.userInvitesScanned) *
                100
            )
          : 0,
    }));

    // Top converters (highest conversion rate, minimum 1 scan)
    const topConverters = processedAnalytics
      .filter((member) => member.userInvitesScanned > 0)
      .sort((a, b) => {
        // Primary sort by conversion rate
        if (b.conversionRate !== a.conversionRate) {
          return b.conversionRate - a.conversionRate;
        }
        // Secondary sort by completed invites
        return b.userInvitesCompleted - a.userInvitesCompleted;
      })
      .slice(0, 3);

    // Top scanners (most QR code scans)
    const topScanners = processedAnalytics
      .sort((a, b) => b.userInvitesScanned - a.userInvitesScanned)
      .slice(0, 3);

    // Calculate church-wide statistics
    const churchWideStats = {
      totalChurchInvitesSent: processedAnalytics.reduce(
        (sum, member) => sum + member.churchInvitesSent,
        0
      ),
      totalUserInvitesSent: processedAnalytics.reduce(
        (sum, member) => sum + member.userInvitesSent,
        0
      ),
      totalScans: processedAnalytics.reduce(
        (sum, member) => sum + member.userInvitesScanned,
        0
      ),
      totalConversions: processedAnalytics.reduce(
        (sum, member) => sum + member.userInvitesCompleted,
        0
      ),
      churchConversionRate:
        processedAnalytics.reduce(
          (sum, member) => sum + member.userInvitesScanned,
          0
        ) > 0
          ? Math.round(
              (processedAnalytics.reduce(
                (sum, member) => sum + member.userInvitesCompleted,
                0
              ) /
                processedAnalytics.reduce(
                  (sum, member) => sum + member.userInvitesScanned,
                  0
                )) *
                100
            )
          : 0,
      activeMembersCount: memberAnalytics.length,
    };

    return NextResponse.json({
      topConverters,
      topScanners,
      churchWideStats,
    });
  } catch (error) {
    console.error("Error fetching church leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}

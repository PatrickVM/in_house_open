import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

function buildDateFilter(dateRange: string | null) {
  if (!dateRange || dateRange === "all") return null;

  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return null;
  }

  return { gte: startDate };
}

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const status = searchParams.getAll("status");
    const dateRange = searchParams.get("dateRange");
    const type = searchParams.get("type") || "church"; // Default to church invitations

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build date filter
    const dateFilter = buildDateFilter(dateRange);

    // Get church members for filtering
    const churchMembers = await db.user.findMany({
      where: {
        churchId: church.id,
        churchMembershipStatus: "VERIFIED",
      },
      select: { id: true, email: true },
    });

    const churchMemberIds = churchMembers.map((member) => member.id);
    const churchMemberEmails = churchMembers.map((member) => member.email);

    let invitationsData;
    let totalCount;

    // Process based on invitation type
    if (type === "church") {
      const whereClause: any = {
        inviterEmail: { in: churchMemberEmails },
      };

      // Apply filters
      if (status && status.length) {
        whereClause.status = { in: status };
      }

      if (dateFilter) {
        whereClause.createdAt = dateFilter;
      }

      // Get church invitations
      [invitationsData, totalCount] = await Promise.all([
        db.churchInvitation.findMany({
          skip,
          take: limit,
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: {
            inviter: {
              select: { firstName: true, lastName: true, email: true },
            },
            claimedBy: {
              select: { email: true },
            },
          },
        }),
        db.churchInvitation.count({ where: whereClause }),
      ]);
    } else {
      // User invitations through invite codes
      const whereClause: any = {
        userId: { in: churchMemberIds },
      };

      if (dateFilter) {
        whereClause.createdAt = dateFilter;
      }

      // Get user invitations
      [invitationsData, totalCount] = await Promise.all([
        db.inviteCode.findMany({
          skip,
          take: limit,
          where: whereClause,
          orderBy: { createdAt: "desc" },
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
        }),
        db.inviteCode.count({ where: whereClause }),
      ]);

      // For user invitations, we need to fetch invitees separately
      const invitationsWithInvitees = await Promise.all(
        invitationsData.map(async (invitation: any) => {
          const invitees = await db.user.findMany({
            where: { inviterId: invitation.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          });

          return {
            ...invitation,
            invitees,
          };
        })
      );

      invitationsData = invitationsWithInvitees;
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      invitations: invitationsData,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching church invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

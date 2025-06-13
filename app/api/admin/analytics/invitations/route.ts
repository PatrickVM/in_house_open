import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

// Helper to build date filter from preset options
function buildDateFilter(dateRange: string | null) {
  if (!dateRange) return null;

  const now = new Date();

  switch (dateRange) {
    case "7days":
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return { gte: sevenDaysAgo };

    case "month":
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return { gte: thirtyDaysAgo };

    case "all":
    default:
      return null;
  }
}

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const churchId = searchParams.get("churchId");
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

    let invitationsData;
    let totalCount;

    // Process based on invitation type
    if (type === "church") {
      const whereClause: any = {};

      // Apply filters
      if (churchId) {
        whereClause.claimedByUserId = {
          in: await db.user
            .findMany({
              where: { churchId },
              select: { id: true },
            })
            .then((users) => users.map((user) => user.id)),
        };
      }

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
      const whereClause: any = {};

      if (churchId) {
        // Find users associated with the church
        whereClause.user = { churchId };
      }

      // Status mapping for invite codes is different than church invitations
      if (status && status.length) {
        // For invite codes, we don't have a direct status field
        // This would need a more complex query or post-processing
      }

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
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

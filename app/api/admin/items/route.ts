import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const moderationStatus = searchParams.get("moderationStatus");
    const churchId = searchParams.get("church");
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    // Filter by moderation status (exclude rejected items from public view)
    if (moderationStatus && moderationStatus !== "all") {
      whereClause.moderationStatus = moderationStatus;
    } else {
      // By default, show all items including rejected for admin view
      // This differs from public view where rejected items are hidden
    }

    // Filter by church if specified
    if (churchId && churchId !== "all") {
      whereClause.churchId = churchId;
    }

    // Get items with pagination and filtering
    const [items, totalItems] = await Promise.all([
      db.item.findMany({
        where: whereClause,
        include: {
          church: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          claimer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { moderationStatus: "asc" }, // Pending first
          { createdAt: "desc" },
        ],
        skip: offset,
        take: limit,
      }),
      db.item.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Get counts for filter badges
    const [approvedCount, pendingCount, rejectedCount] = await Promise.all([
      db.item.count({ where: { moderationStatus: "APPROVED" } }),
      db.item.count({ where: { moderationStatus: "PENDING" } }),
      db.item.count({ where: { moderationStatus: "REJECTED" } }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      counts: {
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        total: approvedCount + pendingCount + rejectedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

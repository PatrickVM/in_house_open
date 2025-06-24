import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import {
  ActivityLogFilter,
  ActivityLogResponse,
} from "@/lib/activity-logs/types";

// GET - Fetch activity logs with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse filter parameters
    const userId = searchParams.get("userId") || undefined;
    const categories = searchParams.getAll("category");
    const actions = searchParams.getAll("action");
    const dateRange =
      (searchParams.get("dateRange") as "1h" | "24h" | "7d" | "30d" | "all") ||
      "7d";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build date filter
    let dateFilter = {};
    if (dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "1h":
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      dateFilter = {
        timestamp: {
          gte: startDate,
          lte: now,
        },
      };
    }

    // Build where clause
    const where: any = {
      ...dateFilter,
    };

    if (userId) {
      where.userId = userId;
    }

    if (categories.length > 0) {
      where.category = {
        in: categories,
      };
    }

    if (actions.length > 0) {
      where.action = {
        in: actions,
      };
    }

    try {
      // Fetch logs
      const logs = await db.activityLog.findMany({
        where,
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await db.activityLog.count({ where });

      // Transform response
      const responseData: ActivityLogResponse[] = logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userRole: log.userRole,
        userName: log.userName,
        userEmail: log.userEmail,
        category: log.category as any,
        action: log.action as any,
        description: log.description,
        details: log.details as any,
        metadata: log.metadata as any,
        timestamp: log.timestamp,
      }));

      return NextResponse.json({
        logs: responseData,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + logs.length < totalCount,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch activity logs" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new activity log
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      userRole,
      userName,
      userEmail,
      category,
      action,
      description,
      details,
      metadata,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !userRole ||
      !userName ||
      !userEmail ||
      !category ||
      !action ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category and action
    const validCategories = [
      "walkthrough",
      "invitation",
      "church",
      "content",
      "user",
      "admin",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    try {
      // Create activity log
      const activityLog = await db.activityLog.create({
        data: {
          userId,
          userRole,
          userName,
          userEmail,
          category,
          action,
          description,
          details: details || null,
          metadata: metadata || null,
        },
      });

      return NextResponse.json({
        success: true,
        id: activityLog.id,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create activity log" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

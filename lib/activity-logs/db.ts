import { db } from "@/lib/db";
import { ActivityLogData } from "./types";
import { Prisma } from "@prisma/client";

/**
 * Create a new activity log entry directly in the database
 */
export async function createActivityLog(
  data: ActivityLogData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate required fields
    if (
      !data.userId ||
      !data.userRole ||
      !data.userName ||
      !data.userEmail ||
      !data.category ||
      !data.action ||
      !data.description
    ) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate category
    const validCategories = [
      "walkthrough",
      "invitation",
      "church",
      "content",
      "user",
      "admin",
      "member_requests",
    ];

    if (!validCategories.includes(data.category)) {
      return {
        success: false,
        error: "Invalid category",
      };
    }

    // Create activity log
    const activityLog = await db.activityLog.create({
      data: {
        userId: data.userId,
        userRole: data.userRole,
        userName: data.userName,
        userEmail: data.userEmail,
        category: data.category,
        action: data.action,
        description: data.description,
        details: data.details ? (data.details as Prisma.JsonObject) : undefined,
        metadata: data.metadata
          ? (data.metadata as Prisma.JsonObject)
          : undefined,
      },
    });

    console.log("TEST: ACTIVITY LOG CREATED:", activityLog);

    return {
      success: true,
      id: activityLog.id,
    };
  } catch (error) {
    console.error("Database error creating activity log:", error);
    return {
      success: false,
      error: "Failed to create activity log",
    };
  }
}

/**
 * Get activity logs with filtering (for future use)
 */
export async function getActivityLogs(filters: {
  userId?: string;
  category?: string[];
  dateRange?: { startDate?: Date; endDate?: Date };
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.category && filters.category.length > 0) {
      where.category = {
        in: filters.category,
      };
    }

    if (filters.dateRange) {
      where.timestamp = {};
      if (filters.dateRange.startDate) {
        where.timestamp.gte = filters.dateRange.startDate;
      }
      if (filters.dateRange.endDate) {
        where.timestamp.lte = filters.dateRange.endDate;
      }
    }

    const logs = await db.activityLog.findMany({
      where,
      orderBy: {
        timestamp: "desc",
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
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

    const totalCount = await db.activityLog.count({ where });

    return {
      success: true,
      logs,
      totalCount,
    };
  } catch (error) {
    console.error("Database error fetching activity logs:", error);
    return {
      success: false,
      logs: [],
      totalCount: 0,
      error: "Failed to fetch activity logs",
    };
  }
}

import { db } from "@/lib/db";

interface GetAdminMessagesParams {
  messageType?: string;
  church?: string;
  status?: string;
  dateRange?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getAdminMessages(params: GetAdminMessagesParams) {
  const {
    messageType = "all",
    church = "all",
    status = "all",
    dateRange = "7d",
    category = "all",
    page = 1,
    limit = 20,
  } = params;

  const offset = (page - 1) * limit;

  // Build where clause based on filters
  const whereClause: any = {};

  // Message type filtering
  if (messageType === "church") {
    whereClause.messageType = { in: ["DAILY_MESSAGE", "ANNOUNCEMENT"] };
  } else if (messageType === "user") {
    whereClause.messageType = "USER_SHARE";
  } else if (
    ["DAILY_MESSAGE", "ANNOUNCEMENT", "USER_SHARE"].includes(messageType)
  ) {
    whereClause.messageType = messageType;
  }

  // Church filtering
  if (church !== "all") {
    whereClause.churchId = church;
  }

  // Status filtering
  const now = new Date();
  if (status === "active") {
    whereClause.status = "PUBLISHED";
    whereClause.expiresAt = { gt: now };
  } else if (status === "expired") {
    whereClause.status = "PUBLISHED";
    whereClause.expiresAt = { lte: now };
  } else if (status === "scheduled") {
    whereClause.status = "SCHEDULED";
  }

  // Date range filtering
  if (dateRange !== "all") {
    let startDate: Date;
    if (dateRange === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0); // All time
    }
    whereClause.createdAt = { gte: startDate };
  }

  // Category filtering (for user messages)
  if (
    category !== "all" &&
    ["TESTIMONY", "PRAYER_REQUEST", "GOD_WINK"].includes(category)
  ) {
    whereClause.category = category;
  }

  // Get messages with pagination
  const [messages, totalCount] = await Promise.all([
    db.message.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    db.message.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Get basic statistics for dashboard
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalMessages,
    messagesLast7Days,
    activeMessages,
    userMessages,
    churchMessages,
    churches,
  ] = await Promise.all([
    db.message.count(),
    db.message.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    db.message.count({
      where: {
        status: "PUBLISHED",
        expiresAt: { gt: now },
      },
    }),
    db.message.count({
      where: {
        messageType: "USER_SHARE",
      },
    }),
    db.message.count({
      where: {
        messageType: { in: ["DAILY_MESSAGE", "ANNOUNCEMENT"] },
      },
    }),
    db.church.findMany({
      where: {
        applicationStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    stats: {
      total: totalMessages,
      last7Days: messagesLast7Days,
      active: activeMessages,
      userMessages,
      churchMessages,
    },
    churches,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import {
  createMessageSchema,
  messagesQuerySchema,
} from "@/lib/validators/message";
import {
  calculateExpirationDate,
  validateMessageConstraints,
} from "@/lib/messages";
import { MESSAGE_CONSTRAINTS } from "@/types/message";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const query = messagesQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      messageType: searchParams.get("messageType"),
      includeExpired: searchParams.get("includeExpired"),
    });

    // Build where clause
    const whereClause: any = {
      churchId: church.id,
    };

    // Filter by status
    if (query.status && query.status !== "all") {
      whereClause.status = query.status;
    }

    // Filter by message type
    if (query.messageType && query.messageType !== "all") {
      whereClause.messageType = query.messageType;
    }

    // Include/exclude expired messages
    if (!query.includeExpired) {
      whereClause.status = {
        not: "EXPIRED",
      };
    }

    const skip = (query.page - 1) * query.limit;

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
        },
        orderBy: [
          { status: "asc" }, // Drafts first, then scheduled, then published
          { createdAt: "desc" },
        ],
        skip,
        take: query.limit,
      }),
      db.message.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    // Get message statistics for the dashboard
    const stats = await Promise.all([
      db.message.count({ where: { churchId: church.id } }),
      db.message.count({
        where: {
          churchId: church.id,
          status: "PUBLISHED",
          expiresAt: { gt: new Date() },
        },
      }),
      db.message.count({ where: { churchId: church.id, status: "SCHEDULED" } }),
      db.message.count({ where: { churchId: church.id, status: "EXPIRED" } }),
      db.message.count({ where: { churchId: church.id, status: "DRAFT" } }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems: totalCount,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
      stats: {
        totalMessages: stats[0],
        activeMessages: stats[1],
        scheduledMessages: stats[2],
        expiredMessages: stats[3],
        draftMessages: stats[4],
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Check message constraints
    const existingMessages = await db.message.findMany({
      where: {
        churchId: church.id,
        status: { in: ["DRAFT", "SCHEDULED"] },
      },
    });

    const constraintCheck = validateMessageConstraints(
      existingMessages,
      validatedData.messageType
    );
    if (!constraintCheck.valid) {
      return NextResponse.json(
        { error: constraintCheck.error },
        { status: 400 }
      );
    }

    // Determine message status and scheduling
    let status: "DRAFT" | "SCHEDULED" | "PUBLISHED" = "DRAFT";
    let publishedAt: Date | null = null;
    let expiresAt: Date | null = null;

    if (validatedData.scheduledFor) {
      status = "SCHEDULED";
    } else {
      // If no scheduling, publish immediately
      status = "PUBLISHED";
      publishedAt = new Date();
      expiresAt = calculateExpirationDate(publishedAt);
    }

    // Create the message
    const message = await db.message.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        messageType: validatedData.messageType,
        status,
        churchId: church.id,
        createdById: session.user.id,
        scheduledFor: validatedData.scheduledFor,
        publishedAt,
        expiresAt,
      },
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
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid message data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

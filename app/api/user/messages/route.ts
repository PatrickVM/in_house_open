import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { createUserMessageSchema } from "@/lib/validators/message";
import { calculateExpirationDate } from "@/lib/messages";
import { ActivityLogService } from "@/lib/activity-logs/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user with church information
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only verified church members can create user messages
    if (user.churchMembershipStatus !== "VERIFIED" || !user.church) {
      return NextResponse.json(
        { error: "Only verified church members can share messages" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserMessageSchema.parse(body);

    // Create the user message with auto-approval
    const publishedAt = new Date();
    const expiresAt = calculateExpirationDate(publishedAt);

    const message = await db.message.create({
      data: {
        content: validatedData.content,
        messageType: "USER_SHARE",
        status: "PUBLISHED", // Auto-approved
        churchId: user.church.id,
        createdById: session.user.id,
        category: validatedData.category,
        isAnonymous: validatedData.isAnonymous,
        moderationStatus: "AUTO_APPROVED",
        publishedAt,
        expiresAt,
        targetAudience: "CHURCH_MEMBERS",
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

    // Log content posted to ActivityLog
    try {
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email;

      // Use first 50 characters of content as title
      const contentTitle =
        validatedData.content.length > 50
          ? validatedData.content.substring(0, 50) + "..."
          : validatedData.content;

      await ActivityLogService.logContentPosted(
        session.user.id,
        "USER",
        userName,
        user.email,
        "message",
        message.id,
        contentTitle
      );
    } catch (error) {
      console.error("Failed to log content posted:", error);
      // Don't fail message creation if activity logging fails
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating user message:", error);

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

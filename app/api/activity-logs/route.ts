import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { ActivityLogData } from "@/lib/activity-logs/types";

// POST - Create new activity log (public endpoint for authenticated users)
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
    }: ActivityLogData = body;

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

    // Security check: Users can only log activities for themselves
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Can only log activities for yourself" },
        { status: 403 }
      );
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
          details: details ? (details as any) : undefined,
          metadata: metadata ? (metadata as any) : undefined,
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

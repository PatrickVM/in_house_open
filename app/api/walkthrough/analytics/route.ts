import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stepId, action, errorMessage } = body;

    if (!stepId || !action) {
      return NextResponse.json(
        { error: "stepId and action are required" },
        { status: 400 }
      );
    }

    if (!["started", "completed", "skipped", "error"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Log to database (will work after Prisma generation)
    try {
      await db.walkthroughAnalytics.create({
        data: {
          userId: session.user.id,
          stepId,
          action,
          userRole: session.user.role,
          errorMessage: errorMessage || null,
          timestamp: new Date(),
        },
      });
    } catch (dbError) {
      console.error(
        "Database error (expected before Prisma generation):",
        dbError
      );
      // Return success anyway to not break the flow during development
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging walkthrough analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

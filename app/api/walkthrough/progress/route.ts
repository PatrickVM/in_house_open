import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

const WALKTHROUGH_VERSION = "walkthrough_v1";

// GET - Get user's walkthrough progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const progress = await db.walkthroughProgress.findMany({
        where: {
          userId: session.user.id,
          version: WALKTHROUGH_VERSION,
        },
        select: {
          stepId: true,
          completed: true,
          skipped: true,
        },
      });

      const completedSteps = progress
        .filter((p) => p.completed)
        .map((p) => p.stepId);
      const skippedSteps = progress
        .filter((p) => p.skipped)
        .map((p) => p.stepId);

      return NextResponse.json({
        completedSteps,
        skippedSteps,
        isFirstTime: progress.length === 0,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return default values if database fails
      return NextResponse.json({
        completedSteps: [],
        skippedSteps: [],
        isFirstTime: true,
      });
    }
  } catch (error) {
    console.error("Error fetching walkthrough progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save step progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stepId, completed, skipped } = body;

    if (!stepId) {
      return NextResponse.json(
        { error: "stepId is required" },
        { status: 400 }
      );
    }

    try {
      await db.walkthroughProgress.upsert({
        where: {
          userId_stepId_version: {
            userId: session.user.id,
            stepId,
            version: WALKTHROUGH_VERSION,
          },
        },
        update: {
          completed: completed || false,
          skipped: skipped || false,
          completedAt: completed ? new Date() : null,
        },
        create: {
          userId: session.user.id,
          stepId,
          version: WALKTHROUGH_VERSION,
          completed: completed || false,
          skipped: skipped || false,
          completedAt: completed ? new Date() : null,
        },
      });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ success: true }); // Don't break the flow
    }
  } catch (error) {
    console.error("Error saving walkthrough progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Reset walkthrough progress
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await db.walkthroughProgress.deleteMany({
        where: {
          userId: session.user.id,
          version: WALKTHROUGH_VERSION,
        },
      });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ success: true }); // Don't break the flow
    }
  } catch (error) {
    console.error("Error resetting walkthrough progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

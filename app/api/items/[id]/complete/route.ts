import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only church users can complete items
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CHURCH") {
      return NextResponse.json(
        { message: "Forbidden - Church access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get current user's church
    const userChurch = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!userChurch) {
      return NextResponse.json(
        { message: "Church not found or not approved" },
        { status: 404 }
      );
    }

    // Find the item and verify it belongs to this church
    const item = await db.item.findFirst({
      where: {
        id,
        churchId: userChurch.id,
      },
      include: {
        claimer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Item not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify item is currently claimed
    if (item.status !== "CLAIMED") {
      return NextResponse.json(
        { message: "Item must be claimed before it can be completed" },
        { status: 400 }
      );
    }

    if (!item.claimerId) {
      return NextResponse.json(
        { message: "Item has no claimer" },
        { status: 400 }
      );
    }

    // Get claiming church info for logging
    const claimingChurch = await db.church.findFirst({
      where: {
        leadContactId: item.claimerId,
        applicationStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Update item status to COMPLETED
    const updatedItem = await db.item.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        claimer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // TODO: Enhancement - Add transaction logging for analytics
    // This should log the completion event with details like:
    // - ItemId, originChurchId, claimingChurchId
    // - completedAt timestamp, completedBy (session.user.id)
    // - transaction type: "ITEM_COMPLETED"
    // For future analytics dashboard implementation

    return NextResponse.json({
      message: "Item marked as completed successfully",
      item: {
        id: updatedItem.id,
        title: updatedItem.title,
        status: updatedItem.status,
        completedAt: updatedItem.completedAt,
        claimer: updatedItem.claimer,
        claimingChurch: claimingChurch,
      },
    });
  } catch (error) {
    console.error("Error completing item:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

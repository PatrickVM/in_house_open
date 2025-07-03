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

    // Find the item - allow claiming church to complete (not just posting church)
    const item = await db.item.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
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
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Verify user has permission to complete this item
    // Either: 1) User's church claimed the item, OR 2) User's church posted the item
    const canComplete =
      item.claimerId === session.user.id || // Claiming church
      item.churchId === userChurch.id; // Posting church

    if (!canComplete) {
      return NextResponse.json(
        {
          message:
            "Unauthorized - You can only complete items your church claimed or posted",
        },
        { status: 403 }
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

    // Log the completion event for admin analytics
    console.log(`Item completion by church lead`, {
      itemId: item.id,
      itemTitle: item.title,
      completedBy: "CHURCH_LEAD",
      completedByUserId: session.user.id,
      completedByChurchId: userChurch.id,
      completedByChurchName: userChurch.name,
      originChurchId: item.church.id,
      originChurchName: item.church.name,
      claimingChurchId: claimingChurch?.id,
      claimingChurchName: claimingChurch?.name,
      completedAt: updatedItem.completedAt,
      transactionType: "ITEM_COMPLETED_BY_CHURCH",
    });

    return NextResponse.json({
      message: "Item marked as completed successfully",
      item: {
        id: updatedItem.id,
        title: updatedItem.title,
        status: updatedItem.status,
        completedAt: updatedItem.completedAt,
        claimer: updatedItem.claimer,
        claimingChurch: claimingChurch,
        completedBy: "church",
        completedByChurchName: userChurch.name,
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

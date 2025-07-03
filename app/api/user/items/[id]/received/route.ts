import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: itemId } = await params;

    // Get user with church membership information
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
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is a verified church member
    if (user.churchMembershipStatus !== "VERIFIED" || !user.church?.id) {
      return NextResponse.json(
        { message: "Only verified church members can mark items as received" },
        { status: 403 }
      );
    }

    // Find the user's active request for this item
    const memberRequest = await db.memberItemRequest.findFirst({
      where: {
        itemId,
        userId: user.id,
        status: "REQUESTED",
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            claimerId: true,
            church: {
              select: {
                id: true,
                name: true,
                leadContact: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!memberRequest) {
      return NextResponse.json(
        { message: "No active request found for this item" },
        { status: 404 }
      );
    }

    // Verify the item is still claimed and in the correct state
    if (memberRequest.item.status !== "CLAIMED") {
      return NextResponse.json(
        { message: "Item is no longer available for pickup" },
        { status: 400 }
      );
    }

    // Get the claiming church info for logging
    const claimingChurch = await db.church.findFirst({
      where: {
        leadContactId: memberRequest.item.claimerId!,
        applicationStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Use transaction to update both member request and item status
    const result = await db.$transaction(async (tx) => {
      // Update the request status to received
      const updatedRequest = await tx.memberItemRequest.update({
        where: { id: memberRequest.id },
        data: { status: "RECEIVED" },
        include: {
          item: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Auto-complete the item when member marks as received
      const completedItem = await tx.item.update({
        where: { id: itemId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return { updatedRequest, completedItem };
    });

    // Log the completion event for admin analytics
    console.log(`Item completion by member`, {
      itemId: memberRequest.item.id,
      itemTitle: memberRequest.item.title,
      completedBy: "MEMBER",
      completedByUserId: user.id,
      completedByUserName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
      memberChurchId: user.church.id,
      memberChurchName: user.church.name,
      originChurchId: memberRequest.item.church.id,
      originChurchName: memberRequest.item.church.name,
      claimingChurchId: claimingChurch?.id,
      claimingChurchName: claimingChurch?.name,
      completedAt: result.completedItem.completedAt,
      transactionType: "ITEM_COMPLETED_BY_MEMBER",
      memberRequestId: memberRequest.id,
    });

    return NextResponse.json({
      success: true,
      request: result.updatedRequest,
      item: {
        id: result.completedItem.id,
        status: result.completedItem.status,
        completedAt: result.completedItem.completedAt,
        completedBy: "member",
        completedByChurchName: user.church.name,
      },
      message: "Item marked as received and completed successfully",
    });
  } catch (error) {
    console.error("Error marking item as received:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

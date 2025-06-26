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
          select: { id: true },
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
            church: {
              select: {
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

    // Update the request status to received
    const updatedRequest = await db.memberItemRequest.update({
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

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Item marked as received successfully",
    });
  } catch (error) {
    console.error("Error marking item as received:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: itemId } = await params;
    const { memberNotes } = await request.json();

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
        { message: "Only verified church members can request items" },
        { status: 403 }
      );
    }

    // Check if user has reached the request limit (max 3 active requests)
    const activeRequestsCount = await db.memberItemRequest.count({
      where: {
        userId: user.id,
        status: {
          in: ["REQUESTED", "RECEIVED"],
        },
      },
    });

    if (activeRequestsCount >= 3) {
      return NextResponse.json(
        {
          message: "You have reached the maximum of 3 active requests",
          currentCount: activeRequestsCount,
        },
        { status: 400 }
      );
    }

    // Verify the item exists and is eligible for member requests
    const item = await db.item.findUnique({
      where: { id: itemId },
      include: {
        memberRequests: {
          where: {
            status: {
              in: ["REQUESTED", "RECEIVED"],
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Validate item eligibility
    if (
      item.status !== "CLAIMED" ||
      item.churchId !== user.church.id ||
      !item.offerToMembers ||
      item.moderationStatus !== "APPROVED"
    ) {
      return NextResponse.json(
        { message: "Item is not available for member requests" },
        { status: 400 }
      );
    }

    // Check if item already has an active request
    if (item.memberRequests.length > 0) {
      return NextResponse.json(
        { message: "Item has already been requested by another member" },
        { status: 409 }
      );
    }

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the member request
    const memberRequest = await db.memberItemRequest.create({
      data: {
        itemId,
        userId: user.id,
        churchId: user.church.id,
        expiresAt,
        memberNotes: memberNotes || null,
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            description: true,
            memberDescription: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: memberRequest,
      message: "Item request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating member item request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { message: "Only verified church members can cancel requests" },
        { status: 403 }
      );
    }

    // Find the user's active request for this item
    const memberRequest = await db.memberItemRequest.findFirst({
      where: {
        itemId,
        userId: user.id,
        status: {
          in: ["REQUESTED", "RECEIVED"],
        },
      },
    });

    if (!memberRequest) {
      return NextResponse.json(
        { message: "No active request found for this item" },
        { status: 404 }
      );
    }

    // Update the request status to cancelled
    await db.memberItemRequest.update({
      where: { id: memberRequest.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Item request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling member item request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

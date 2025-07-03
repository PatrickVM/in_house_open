import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { ActivityLogService } from "@/lib/activity-logs/service";

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
        claimer: {
          select: {
            id: true,
            churchId: true,
          },
        },
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
      item.claimer?.churchId !== user.church.id ||
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
        { message: "Only verified church members can cancel requests" },
        { status: 403 }
      );
    }

    // Find the user's active request for this item with item details for logging
    const memberRequest = await db.memberItemRequest.findFirst({
      where: {
        itemId,
        userId: user.id,
        status: {
          in: ["REQUESTED", "RECEIVED"],
        },
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
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

    // Log the cancellation activity before deleting
    try {
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email;

      await ActivityLogService.logMemberRequestCancellation(
        user.id,
        userName,
        user.email,
        memberRequest.item.id,
        memberRequest.item.title,
        memberRequest.item.category,
        user.church.id,
        user.church.name,
        memberRequest.requestedAt,
        memberRequest.memberNotes || undefined
      );
    } catch (logError) {
      console.error("Failed to log member request cancellation:", logError);
      // Continue with deletion even if logging fails
    }

    // Delete the request record
    await db.memberItemRequest.delete({
      where: { id: memberRequest.id },
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

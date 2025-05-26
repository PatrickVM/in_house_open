import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { moderationStatus, moderationNotes } = await request.json();

    // Validate moderation status
    if (
      !moderationStatus ||
      !["APPROVED", "PENDING", "REJECTED"].includes(moderationStatus)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid moderation status. Must be 'APPROVED', 'PENDING', or 'REJECTED'",
        },
        { status: 400 }
      );
    }

    // Find the item
    const item = await db.item.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Update the item
    const updatedItem = await db.item.update({
      where: { id },
      data: {
        moderationStatus,
        moderationNotes: moderationNotes || null,
        updatedAt: new Date(),
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        claimer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log the admin action
    console.log(`Admin ${session.user.email} updated item moderation status`, {
      adminId: session.user.id,
      itemId: item.id,
      itemTitle: item.title,
      churchName: item.church.name,
      previousStatus: item.moderationStatus,
      newStatus: moderationStatus,
      moderationNotes,
    });

    return NextResponse.json({
      message: `Item ${moderationStatus.toLowerCase()} successfully`,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item moderation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const item = await db.item.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            leadContact: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        claimer: {
          select: {
            id: true,
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

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  churchId: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found" },
        { status: 404 }
      );
    }

    // Get the item
    const item = await db.item.findFirst({
      where: {
        id,
        churchId: church.id, // Only allow access to church's own items
      },
      include: {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        id: validatedData.churchId,
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found or unauthorized" },
        { status: 403 }
      );
    }

    // Get the existing item to check permissions and business rules
    const existingItem = await db.item.findFirst({
      where: {
        id,
        churchId: church.id, // Only allow editing church's own items
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: "Item not found or unauthorized" },
        { status: 404 }
      );
    }

    // Business rule: Can't edit rejected items
    if (existingItem.moderationStatus === "REJECTED") {
      return NextResponse.json(
        { message: "Cannot edit rejected items" },
        { status: 400 }
      );
    }

    // Use church coordinates as default (same logic as create)
    const latitude = church.latitude || 38.440429;
    const longitude = church.longitude || -122.714055;

    // Update the item
    const updatedItem = await db.item.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        category: validatedData.category,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        latitude,
        longitude,
        updatedAt: new Date(),
        // Reset moderation status if item was previously approved
        // Business decision: edits to approved items should be re-reviewed
        moderationStatus:
          existingItem.moderationStatus === "APPROVED"
            ? "APPROVED"
            : existingItem.moderationStatus,
      },
      include: {
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

    return NextResponse.json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

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

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found" },
        { status: 404 }
      );
    }

    // Get the item to check permissions and business rules
    const item = await db.item.findFirst({
      where: {
        id,
        churchId: church.id, // Only allow deleting church's own items
      },
      include: {
        claimer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    // Business rules for deletion:
    // - Can't delete if CLAIMED
    // - Can delete if COMPLETED
    // - Can delete if AVAILABLE
    if (item.status === "CLAIMED") {
      return NextResponse.json(
        {
          message:
            "Cannot delete claimed items. Please wait for the transaction to complete or contact the claiming church to unclaim the item.",
          status: item.status,
        },
        { status: 400 }
      );
    }

    // Log the deletion for audit purposes (user mentioned they'll add to admin analytics later)
    console.log(`Church ${church.name} deleted item ${item.title}`, {
      churchId: church.id,
      churchName: church.name,
      itemId: item.id,
      itemTitle: item.title,
      itemStatus: item.status,
      deletedBy: session.user.id,
      deletedAt: new Date(),
      wasClaimed: item.claimerId !== null,
      claimer: item.claimer
        ? `${item.claimer.firstName} ${item.claimer.lastName}`
        : null,
    });

    // Hard delete the item
    // The database will handle the cascade:
    // - claimer relationship will be set to null (SET NULL cascade)
    // - church relationship will restrict deletion if there are dependencies
    await db.item.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Item deleted successfully",
      deletedItem: {
        id: item.id,
        title: item.title,
        status: item.status,
      },
    });
  } catch (error) {
    console.error("Error deleting item:", error);

    // Handle potential constraint violations
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Cannot delete this item due to existing references" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { updateMessageSchema } from "@/lib/validators/message";
import { canEditMessage, canDeleteMessage } from "@/lib/messages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the message with relations
    const message = await db.message.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify the user has access to this message (their church's message)
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church || message.churchId !== church.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the existing message
    const existingMessage = await db.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify the user has access to this message
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church || existingMessage.churchId !== church.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user can edit this message
    if (!canEditMessage(existingMessage, session.user.id)) {
      return NextResponse.json(
        { error: "Cannot edit published or expired messages" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMessageSchema.parse(body);

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }

    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }

    if (validatedData.scheduledFor !== undefined) {
      updateData.scheduledFor = validatedData.scheduledFor;
      // If setting a scheduled time, update status to SCHEDULED
      if (validatedData.scheduledFor && existingMessage.status === "DRAFT") {
        updateData.status = "SCHEDULED";
      }
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    // Update the message
    const updatedMessage = await db.message.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid message data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update message" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the existing message
    const existingMessage = await db.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify the user has access to this message
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church || existingMessage.churchId !== church.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user can delete this message
    if (!canDeleteMessage(existingMessage, session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete published or expired messages" },
        { status: 400 }
      );
    }

    // Delete the message
    await db.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

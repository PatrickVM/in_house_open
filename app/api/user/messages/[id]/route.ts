import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the existing message
    const existingMessage = await db.message.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            id: true,
            leadContactId: true,
          },
        },
      },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only allow deletion of USER_SHARE messages
    if (existingMessage.messageType !== "USER_SHARE") {
      return NextResponse.json(
        { error: "Can only delete user-shared messages" },
        { status: 400 }
      );
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN";
    const isChurchLeadContact =
      session.user.role === "CHURCH" &&
      existingMessage.church.leadContactId === session.user.id;

    if (!isAdmin && !isChurchLeadContact) {
      return NextResponse.json(
        {
          error:
            "Only church lead contacts and admins can delete user messages",
        },
        { status: 403 }
      );
    }

    // Delete the message
    await db.message.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

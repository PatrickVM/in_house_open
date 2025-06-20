import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get the message details before deletion for logging
    const message = await db.message.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        church: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Delete the message
    await db.message.delete({
      where: { id },
    });

    // Log the admin action for audit trail
    console.log(`Admin ${session.user.email} deleted message`, {
      adminId: session.user.id,
      messageId: id,
      messageType: message.messageType,
      churchName: message.church.name,
      authorName: `${message.createdBy.firstName} ${message.createdBy.lastName}`,
      authorEmail: message.createdBy.email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

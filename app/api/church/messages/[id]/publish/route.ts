import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { calculateExpirationDate, canPublishMessage } from "@/lib/messages";
import { publishMessageSchema } from "@/lib/validators/message";

export async function POST(
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

    // Check if user can publish this message
    if (!canPublishMessage(existingMessage, session.user.id)) {
      return NextResponse.json(
        { error: "Can only publish draft messages" },
        { status: 400 }
      );
    }

    // Parse request body (optional parameters)
    const body = await request.json().catch(() => ({}));
    const validatedData = publishMessageSchema.parse(body);

    // Publish the message
    const publishedAt = new Date();
    const expiresAt = calculateExpirationDate(publishedAt);

    const publishedMessage = await db.message.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt,
        expiresAt,
        updatedAt: new Date(),
      },
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

    return NextResponse.json({
      message: publishedMessage,
      publishedAt,
      expiresAt,
    });
  } catch (error) {
    console.error("Error publishing message:", error);
    return NextResponse.json(
      { error: "Failed to publish message" },
      { status: 500 }
    );
  }
}

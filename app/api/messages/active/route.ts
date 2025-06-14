import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { activeMessagesQuerySchema } from "@/lib/validators/message";
import { isMessageActive } from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user with church information
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only verified church members can see messages
    if (user.churchMembershipStatus !== "VERIFIED" || !user.church) {
      return NextResponse.json({
        messages: [],
        churchName: null,
      });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = activeMessagesQuerySchema.parse({
      limit: searchParams.get("limit"),
    });

    // Get active messages for the user's church
    const messages = await db.message.findMany({
      where: {
        churchId: user.church.id,
        status: "PUBLISHED",
        expiresAt: {
          gt: new Date(), // Only non-expired messages
        },
        targetAudience: "CHURCH_MEMBERS", // Only messages for church members
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
      },
      orderBy: {
        publishedAt: "desc", // Most recent first
      },
      take: query.limit,
    });

    // Filter to only truly active messages (double-check with utility function)
    const activeMessages = messages.filter(isMessageActive);

    return NextResponse.json({
      messages: activeMessages,
      churchName: user.church.name,
      totalCount: activeMessages.length,
    });
  } catch (error) {
    console.error("Error fetching active messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch active messages" },
      { status: 500 }
    );
  }
}

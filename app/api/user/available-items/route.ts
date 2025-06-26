import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user with church membership information
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        church: {
          select: {
            id: true,
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
        { message: "Only verified church members can access this feature" },
        { status: 403 }
      );
    }

    // Get items that meet all criteria:
    // - Claimed by someone from member's church
    // - Offered to members
    // - Approved moderation status
    const items = await db.item.findMany({
      where: {
        status: "CLAIMED",
        offerToMembers: true,
        moderationStatus: "APPROVED",
        claimer: {
          churchId: user.church.id,
        },
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            leadContact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
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
            phone: true,
            churchId: true,
          },
        },
        memberRequests: {
          where: {
            status: {
              in: ["REQUESTED", "RECEIVED"],
            },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items,
      hasMore: false, // Simple implementation for now
    });
  } catch (error) {
    console.error("Error fetching available items:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

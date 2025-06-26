import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
        { message: "Only verified church members can view requests" },
        { status: 403 }
      );
    }

    // Get member's active requests
    const requests = await db.memberItemRequest.findMany({
      where: {
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
            description: true,
            memberDescription: true,
            address: true,
            city: true,
            state: true,
            church: {
              select: {
                name: true,
                leadContact: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    // Calculate days remaining for each request
    const requestsWithTimeInfo = requests.map((request) => {
      const now = new Date();
      const expiresAt = new Date(request.expiresAt);
      const daysRemaining = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...request,
        daysRemaining: Math.max(0, daysRemaining),
        isExpiringSoon: daysRemaining <= 2,
      };
    });

    return NextResponse.json({
      requests: requestsWithTimeInfo,
      activeCount: requests.length,
      maxAllowed: 3,
    });
  } catch (error) {
    console.error("Error fetching member requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

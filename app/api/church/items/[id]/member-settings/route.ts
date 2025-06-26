import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: itemId } = await params;
    const { offerToMembers, memberDescription } = await request.json();

    // Validate input
    if (typeof offerToMembers !== "boolean") {
      return NextResponse.json(
        { message: "offerToMembers must be a boolean" },
        { status: 400 }
      );
    }

    // Get the item and verify ownership
    const item = await db.item.findUnique({
      where: { id: itemId },
      include: {
        church: {
          select: {
            id: true,
            leadContactId: true,
            name: true,
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
                email: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Verify user claimed the item AND is a church lead
    if (item.claimerId !== session.user.id) {
      return NextResponse.json(
        {
          message:
            "Only the church lead who claimed this item can modify member settings",
        },
        { status: 403 }
      );
    }

    // Verify user is a church lead
    if (session.user.role !== "CHURCH") {
      return NextResponse.json(
        { message: "Only church leads can modify member settings" },
        { status: 403 }
      );
    }

    // Update the item settings
    const updatedItem = await db.item.update({
      where: { id: itemId },
      data: {
        offerToMembers,
        memberDescription: offerToMembers ? memberDescription || null : null,
      },
      include: {
        church: {
          select: {
            name: true,
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
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Prepare response with warning if disabling with active requests
    const response: any = {
      success: true,
      item: updatedItem,
      message: `Member offering ${offerToMembers ? "enabled" : "disabled"} successfully`,
    };

    // Add warning if disabling with active requests
    if (!offerToMembers && item.memberRequests.length > 0) {
      response.warning = {
        message: "Member offering disabled with active requests",
        activeRequests: item.memberRequests.length,
        requesters: item.memberRequests.map((req) => ({
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          status: req.status,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating member settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

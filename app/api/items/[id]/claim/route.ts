import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only church users can claim
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CHURCH") {
      return NextResponse.json(
        { message: "Forbidden - Church access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { churchId } = await request.json();

    // Verify the user is the lead contact for the requesting church
    const requestingChurch = await db.church.findFirst({
      where: {
        id: churchId,
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!requestingChurch) {
      return NextResponse.json(
        { message: "Invalid church or unauthorized access" },
        { status: 403 }
      );
    }

    // Get the item
    const item = await db.item.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            leadContact: {
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

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Check if item is approved and available
    if (item.moderationStatus !== "APPROVED") {
      return NextResponse.json(
        { message: "Item is not approved for claiming" },
        { status: 400 }
      );
    }

    if (item.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Item is not available for claiming" },
        { status: 400 }
      );
    }

    // Check if the requesting church is not the owner
    if (item.churchId === churchId) {
      return NextResponse.json(
        { message: "Cannot claim your own item" },
        { status: 400 }
      );
    }

    // Claim the item by setting claimerId to the requesting church's leadContactId
    const updatedItem = await db.item.update({
      where: { id },
      data: {
        status: "CLAIMED",
        claimerId: session.user.id, // Using leadContactId as claimerId
        claimedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
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

    // Log the claiming action
    console.log(`Church ${requestingChurch.name} claimed item ${item.title}`, {
      claimingChurchId: churchId,
      claimingChurchName: requestingChurch.name,
      providingChurchId: item.church.id,
      providingChurchName: item.church.name,
      itemId: item.id,
      itemTitle: item.title,
      claimedBy: session.user.id,
      claimedAt: updatedItem.claimedAt,
    });

    // TODO: Implement Option C - Email notification system
    // Future enhancement: Send email to providing church with:
    // - Item details
    // - Claiming church contact info
    // - Optional message from claiming church
    /*
    const emailData = {
      to: item.church.leadContact.email,
      subject: `Your item "${item.title}" has been claimed`,
      providingChurchName: item.church.name,
      claimingChurchName: requestingChurch.name,
      claimingChurchContact: {
        name: `${session.user.firstName} ${session.user.lastName}`,
        email: session.user.email,
        phone: session.user.phone || 'Not provided'
      },
      itemTitle: item.title,
      itemDescription: item.description,
      claimedAt: updatedItem.claimedAt,
      // message: Optional message from claiming church
    };
    
    await sendClaimNotificationEmail(emailData);
    */

    return NextResponse.json({
      message: "Item claimed successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error claiming item:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

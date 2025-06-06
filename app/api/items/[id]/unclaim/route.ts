import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only church users can unclaim
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

    // Get the item with current claim information
    const item = await db.item.findUnique({
      where: { id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
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
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Check if item is approved
    if (item.moderationStatus !== "APPROVED") {
      return NextResponse.json(
        { message: "Item is not approved" },
        { status: 400 }
      );
    }

    // Check if item is claimed
    if (item.status !== "CLAIMED") {
      return NextResponse.json(
        { message: "Item is not claimed" },
        { status: 400 }
      );
    }

    // Check if the current user is the claimer
    if (item.claimerId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only unclaim items claimed by your church" },
        { status: 403 }
      );
    }

    // Get the claiming church name for logging
    const claimingChurch = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Unclaim the item
    const updatedItem = await db.item.update({
      where: { id },
      data: {
        status: "AVAILABLE",
        claimerId: null,
        claimedAt: null,
        updatedAt: new Date(),
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
        claimer: true,
      },
    });

    // Log the unclaiming action
    console.log(`Church ${claimingChurch?.name} unclaimed item ${item.title}`, {
      claimingChurchId: claimingChurch?.id,
      claimingChurchName: claimingChurch?.name,
      providingChurchId: item.church.id,
      providingChurchName: item.church.name,
      itemId: item.id,
      itemTitle: item.title,
      unclaimedBy: session.user.id,
      unclaimedAt: new Date(),
    });

    // TODO: Implement email notification to providing church
    // Future enhancement: Notify providing church that item is available again
    /*
    const emailData = {
      to: item.church.leadContact.email,
      subject: `Item "${item.title}" is available again`,
      providingChurchName: item.church.name,
      claimingChurchName: claimingChurch?.name,
      itemTitle: item.title,
      unclaimedAt: new Date(),
      message: `${claimingChurch?.name} has released their claim on "${item.title}". The item is now available for other churches to claim.`
    };
    
    await sendUnclaimNotificationEmail(emailData);
    */

    return NextResponse.json({
      message: "Item unclaimed successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error unclaiming item:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

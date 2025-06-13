import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is authenticated and has admin role
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { type } = await request.json();

    if (type === "church") {
      // Expire church invitation
      const invitation = await db.churchInvitation.findUnique({
        where: { id },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation not found" },
          { status: 404 }
        );
      }

      if (invitation.status !== "PENDING") {
        return NextResponse.json(
          {
            error: `Cannot expire invitation with status: ${invitation.status}`,
          },
          { status: 400 }
        );
      }

      // Update to expired
      await db.churchInvitation.update({
        where: { id },
        data: {
          status: "EXPIRED",
        },
      });
    } else {
      // User invitations (InviteCode)
      const inviteCode = await db.inviteCode.findUnique({
        where: { id },
      });

      if (!inviteCode) {
        return NextResponse.json(
          { error: "Invite code not found" },
          { status: 404 }
        );
      }

      // For InviteCode, we set the expiration date to now
      await db.inviteCode.update({
        where: { id },
        data: {
          expiresAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation expired successfully",
    });
  } catch (error) {
    console.error("Error expiring invitation:", error);
    return NextResponse.json(
      { error: "Failed to expire invitation" },
      { status: 500 }
    );
  }
}

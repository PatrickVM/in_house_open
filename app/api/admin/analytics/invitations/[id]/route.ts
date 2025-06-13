import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const type = request.nextUrl.searchParams.get("type") || "church";

    if (type === "church") {
      // Delete church invitation
      const invitation = await db.churchInvitation.findUnique({
        where: { id },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation not found" },
          { status: 404 }
        );
      }

      // Delete the church invitation
      await db.churchInvitation.delete({
        where: { id },
      });
    } else {
      // Delete user invitation (InviteCode)
      const inviteCode = await db.inviteCode.findUnique({
        where: { id },
      });

      if (!inviteCode) {
        return NextResponse.json(
          { error: "Invite code not found" },
          { status: 404 }
        );
      }

      // Delete the invite code
      await db.inviteCode.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invitation:", error);

    // Check for constraint violations or foreign key errors
    if (error instanceof Error && error.message.includes("constraint")) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this invitation as it's being referenced by other records.",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    );
  }
}

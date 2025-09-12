import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        claimedItems: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            claimedAt: true,
          },
          orderBy: {
            claimedAt: "desc",
          },
        },
        ledChurch: {
          select: {
            id: true,
            name: true,
            applicationStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { action, role } = await request.json();

    // Validate action
    if (!action || !["activate", "deactivate", "changeRole", "exempt", "remove_exempt", "reactivate"].includes(action)) {
      return NextResponse.json(
        {
          message:
            "Invalid action. Must be 'activate', 'deactivate', 'changeRole', 'exempt', 'remove_exempt', or 'reactivate'",
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (action === "deactivate" && user.id === session.user.id) {
      return NextResponse.json(
        { message: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role (unless there are other admins)
    if (action === "changeRole" && user.id === session.user.id) {
      const adminCount = await db.user.count({
        where: { role: "ADMIN", isActive: true },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "Cannot change role - you are the only active admin" },
          { status: 400 }
        );
      }
    }

    let updateData: any = {};

    if (action === "activate") {
      updateData.isActive = true;
    } else if (action === "deactivate") {
      updateData.isActive = false;
    } else if (action === "changeRole") {
      // Validate role
      if (!role || !["USER", "CHURCH", "ADMIN"].includes(role)) {
        return NextResponse.json(
          { message: "Invalid role. Must be 'USER', 'CHURCH', or 'ADMIN'" },
          { status: 400 }
        );
      }
      updateData.role = role as UserRole;
    } else if (action === "exempt") {
      updateData.membershipEnforcementExempt = true;
    } else if (action === "remove_exempt") {
      updateData.membershipEnforcementExempt = false;
    } else if (action === "reactivate") {
      updateData.isActive = true;
      updateData.disabledReason = null;
      updateData.warningEmailSentAt = null;
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Log the admin action (optional - could be added to an audit log table)
    console.log(
      `Admin ${session.user.email} performed ${action} on user ${user.email}`,
      {
        adminId: session.user.id,
        targetUserId: user.id,
        action,
        previousRole: user.role,
        newRole: updateData.role,
        previousStatus: user.isActive,
        newStatus: updateData.isActive,
      }
    );

    return NextResponse.json({
      message: `User ${
        action === "changeRole" ? "role updated" : action + "d"
      } successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

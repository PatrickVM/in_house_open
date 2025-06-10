import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Check for existing invitation
    const existingInvitation = await db.churchInvitation.findFirst({
      where: {
        churchEmail: email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!existingInvitation) {
      return NextResponse.json({
        exists: false,
      });
    }

    // Check if invitation is expired
    const now = new Date();
    const isExpired = existingInvitation.expiresAt < now;

    let status = existingInvitation.status;

    // Update status to EXPIRED if needed
    if (isExpired && status === "PENDING") {
      await db.churchInvitation.update({
        where: { id: existingInvitation.id },
        data: { status: "EXPIRED" },
      });
      status = "EXPIRED";
    }

    return NextResponse.json({
      exists: true,
      status,
      createdAt: existingInvitation.createdAt,
      expiresAt: existingInvitation.expiresAt,
    });
  } catch (error) {
    console.error("Error checking church invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

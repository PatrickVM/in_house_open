import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    // Find the invite code
    const inviteCode = await db.inviteCode.findUnique({
      where: { code },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            church: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Get inviter name
    const inviterName =
      inviteCode.user.firstName && inviteCode.user.lastName
        ? `${inviteCode.user.firstName} ${inviteCode.user.lastName}`
        : inviteCode.user.email;

    return NextResponse.json({
      valid: true,
      inviter: {
        name: inviterName,
        email: inviteCode.user.email,
        church: inviteCode.user.church?.name || null,
      },
      inviteCode: code,
    });
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

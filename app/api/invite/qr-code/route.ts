import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { generateQRCode } from "@/lib/qr-code";
import {
  isUserEligibleToInvite,
  getOrCreateInviteCode,
} from "@/lib/invite-analytics";

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

    // Check if user is eligible to invite (verified church member)
    const isEligible = await isUserEligibleToInvite(session.user.id);
    if (!isEligible) {
      return NextResponse.json(
        {
          error: "Only verified church members can generate invite codes",
          eligible: false,
        },
        { status: 403 }
      );
    }

    // Get or create invite code for the user
    const inviteCode = await getOrCreateInviteCode(session.user.id);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(inviteCode);

    return NextResponse.json({
      success: true,
      qrCodeDataUrl,
      inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register/${inviteCode}`,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

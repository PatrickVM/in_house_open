import { NextRequest, NextResponse } from "next/server";
import { trackInviteCodeScan } from "@/lib/invite-analytics";

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    // Track the scan
    await trackInviteCodeScan(code);

    return NextResponse.json({
      success: true,
      message: "Scan tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking invite code scan:", error);
    return NextResponse.json(
      { error: "Failed to track scan" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getUserInviteAnalytics,
  isUserEligibleToInvite,
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
          error: "Only verified church members can access invite analytics",
          eligible: false,
        },
        { status: 403 }
      );
    }

    // Get user invite analytics
    const analytics = await getUserInviteAnalytics(session.user.id);

    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    console.error("Error fetching invite analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite analytics" },
      { status: 500 }
    );
  }
}

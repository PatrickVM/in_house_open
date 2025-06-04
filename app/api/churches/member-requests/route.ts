import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  isUserEligibleToVerify,
  getVerificationRequestsForMember,
  getVerificationProgress,
} from "@/lib/verification-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is eligible to verify (verified member for 7+ days)
    const isEligible = await isUserEligibleToVerify(session.user.id);

    if (!isEligible) {
      return NextResponse.json(
        {
          error:
            "You must be a verified church member for at least 7 days to verify others",
          eligible: false,
          requests: [],
        },
        { status: 403 }
      );
    }

    // Get user's church ID
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json(
        {
          error: "Church ID is required",
        },
        { status: 400 }
      );
    }

    // Get verification requests for this member using rotation algorithm
    const requests = await getVerificationRequestsForMember(
      session.user.id,
      churchId
    );

    // Add verification progress to each request
    const requestsWithProgress = await Promise.all(
      requests.map(async (request) => {
        const progress = await getVerificationProgress(
          request.userId,
          request.churchId
        );

        return {
          id: request.id,
          user: request.user,
          church: request.church,
          createdAt: request.createdAt,
          notes: request.notes,
          progress: {
            current: progress.currentVerifications,
            required: progress.requiredVerifications,
            remaining: Math.max(
              0,
              progress.requiredVerifications - progress.currentVerifications
            ),
            verifierNames: progress.verifierNames,
          },
        };
      })
    );

    return NextResponse.json({
      eligible: true,
      requests: requestsWithProgress,
      totalRequests: requestsWithProgress.length,
    });
  } catch (error) {
    console.error("Error fetching member verification requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification requests" },
      { status: 500 }
    );
  }
}

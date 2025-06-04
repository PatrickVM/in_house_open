import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  isUserEligibleToVerify,
  setUserVerifiedAt,
} from "@/lib/verification-utils";

const verifyMemberSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
  memberNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = verifyMemberSchema.parse(body);

    // Get the verification request
    const verificationRequest = await db.churchVerificationRequest.findUnique({
      where: { id: validatedData.requestId },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            minVerificationsRequired: true,
            leadContactId: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: "Verification request not found" },
        { status: 404 }
      );
    }

    if (verificationRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Check if the current user is a member of this church or the lead contact
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        churchId: true,
        churchMembershipStatus: true,
        role: true,
        verifiedAt: true,
      },
    });

    const isLeadContact =
      verificationRequest.church.leadContactId === session.user.id;
    const isChurchMember =
      currentUser?.churchId === verificationRequest.churchId &&
      currentUser?.churchMembershipStatus === "VERIFIED";

    if (!isLeadContact && !isChurchMember) {
      return NextResponse.json(
        { error: "You are not authorized to verify members for this church" },
        { status: 403 }
      );
    }

    // For regular members, check 7-day eligibility
    if (!isLeadContact) {
      const isEligible = await isUserEligibleToVerify(session.user.id);
      if (!isEligible) {
        return NextResponse.json(
          {
            error:
              "You must be a verified church member for at least 7 days to verify others",
          },
          { status: 403 }
        );
      }

      // Check if this member has already verified this request
      const existingVerification = await db.churchVerificationRequest.findFirst(
        {
          where: {
            userId: verificationRequest.userId,
            churchId: verificationRequest.churchId,
            verifierId: session.user.id,
            status: { in: ["APPROVED", "REJECTED"] },
          },
        }
      );

      if (existingVerification) {
        return NextResponse.json(
          { error: "You have already verified this request" },
          { status: 400 }
        );
      }
    }

    if (validatedData.action === "reject") {
      // For regular members, create a separate rejection record
      if (!isLeadContact) {
        await db.churchVerificationRequest.create({
          data: {
            userId: verificationRequest.userId,
            churchId: verificationRequest.churchId,
            requesterId: verificationRequest.requesterId,
            verifierId: session.user.id,
            status: "REJECTED",
            rejectedAt: new Date(),
            memberNotes: validatedData.memberNotes,
          },
        });

        return NextResponse.json({
          message: "Your rejection has been recorded",
          userApproved: false,
        });
      }

      // Lead contact rejection - reject the entire request
      await db.$transaction(async (tx) => {
        await tx.churchVerificationRequest.update({
          where: { id: validatedData.requestId },
          data: {
            status: "REJECTED",
            verifierId: session.user.id,
            rejectedAt: new Date(),
            notes: validatedData.notes,
          },
        });

        await tx.user.update({
          where: { id: verificationRequest.userId },
          data: {
            churchMembershipStatus: "REJECTED",
          },
        });
      });

      return NextResponse.json({
        message: "Request rejected successfully",
      });
    }

    // Approve the verification
    if (!isLeadContact) {
      // For regular members, create a separate approval record
      await db.churchVerificationRequest.create({
        data: {
          userId: verificationRequest.userId,
          churchId: verificationRequest.churchId,
          requesterId: verificationRequest.requesterId,
          verifierId: session.user.id,
          status: "APPROVED",
          verifiedAt: new Date(),
          memberNotes: validatedData.memberNotes,
        },
      });
    } else {
      // For lead contact, update the original request
      await db.churchVerificationRequest.update({
        where: { id: validatedData.requestId },
        data: {
          status: "APPROVED",
          verifierId: session.user.id,
          verifiedAt: new Date(),
          notes: validatedData.notes,
        },
      });
    }

    // Check if this user now has enough verifications or if lead contact approved
    const approvedVerifications = await db.churchVerificationRequest.count({
      where: {
        userId: verificationRequest.userId,
        churchId: verificationRequest.churchId,
        status: "APPROVED",
      },
    });

    const minRequired = verificationRequest.church.minVerificationsRequired;
    const shouldApproveUser =
      isLeadContact || approvedVerifications >= minRequired;

    if (shouldApproveUser) {
      // Add user to church and set verifiedAt timestamp
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: verificationRequest.userId },
          data: {
            churchId: verificationRequest.churchId,
            churchMembershipStatus: "VERIFIED",
            verifiedAt: new Date(),
          },
        });
      });

      return NextResponse.json({
        message: "User has been approved and added to the church",
        userApproved: true,
      });
    }

    return NextResponse.json({
      message: `Verification recorded. ${approvedVerifications}/${minRequired} verifications completed.`,
      userApproved: false,
      verificationsCount: approvedVerifications,
      verificationsRequired: minRequired,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error processing verification:", error);
    return NextResponse.json(
      { error: "Failed to process verification" },
      { status: 500 }
    );
  }
}

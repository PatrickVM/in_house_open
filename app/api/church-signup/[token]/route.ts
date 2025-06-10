import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { churchSignupSchema } from "@/lib/validators/church-invitation";

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Validate invitation token
    const invitation = await db.churchInvitation.findUnique({
      where: { id: token },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const isExpired = invitation.expiresAt < now;

    if (isExpired) {
      // Update status to EXPIRED
      await db.churchInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    // Check if already claimed
    if (invitation.status === "CLAIMED") {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 410 }
      );
    }

    const inviterName =
      invitation.inviter.firstName && invitation.inviter.lastName
        ? `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
        : invitation.inviter.email;

    return NextResponse.json({
      valid: true,
      inviterName,
      inviterEmail: invitation.inviter.email,
      customMessage: invitation.customMessage,
    });
  } catch (error) {
    console.error("Error validating invitation token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Validate invitation token
    const invitation = await db.churchInvitation.findUnique({
      where: { id: token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const isExpired = invitation.expiresAt < now;

    if (isExpired || invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation is no longer valid" },
        { status: 410 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = churchSignupSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone || null,
          role: "USER", // Will be updated to CHURCH after approval
        },
      });

      // Create church application
      const church = await tx.church.create({
        data: {
          name: validatedData.churchName,
          leadPastorName: validatedData.leadPastorName,
          website: validatedData.churchWebsite || null,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          leadContactId: user.id,
          applicationStatus: "PENDING",
        },
      });

      // Mark invitation as claimed
      await tx.churchInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "CLAIMED",
          claimedAt: new Date(),
          claimedByUserId: user.id,
        },
      });

      // Update invitation analytics
      const inviterUser = await tx.user.findUnique({
        where: { email: invitation.inviterEmail },
        select: { id: true },
      });

      if (inviterUser) {
        await tx.invitationAnalytics.upsert({
          where: { userId: inviterUser.id },
          update: {
            churchInvitesSent: {
              increment: 0, // Don't increment here, already done when sent
            },
          },
          create: {
            userId: inviterUser.id,
            churchInvitesSent: 0,
          },
        });
      }

      return { user, church };
    });

    return NextResponse.json({
      success: true,
      message: "Account created and church application submitted successfully",
      userId: result.user.id,
      churchId: result.church.id,
    });
  } catch (error) {
    console.error("Error processing church signup:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

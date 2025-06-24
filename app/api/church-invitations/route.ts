import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { render } from "@react-email/render";
import { db } from "@/lib/db";
import { authOptions } from "@/auth";
import { emailService } from "@/lib/email/email-service";
import { churchInvitationSchema } from "@/lib/validators/church-invitation";
import { ChurchInvitationEmail } from "@/lib/email/templates/church-invitation";
import { ActivityLogService } from "@/lib/activity-logs/service";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = churchInvitationSchema.parse(body);

    // Check for existing invitation
    const existingInvitation = await db.churchInvitation.findFirst({
      where: {
        churchEmail: validatedData.churchEmail,
        status: {
          in: ["PENDING", "CLAIMED"],
        },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === "CLAIMED") {
        return NextResponse.json(
          { error: "This church has already joined InHouse" },
          { status: 400 }
        );
      }
      if (existingInvitation.status === "PENDING") {
        return NextResponse.json(
          { error: "A pending invitation has already been sent to this email" },
          { status: 400 }
        );
      }
    }

    // Create invitation record
    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;

    const invitation = await db.churchInvitation.create({
      data: {
        inviterEmail: user.email,
        inviterName: userName,
        inviterPhone: user.phone,
        churchEmail: validatedData.churchEmail,
        customMessage: validatedData.customMessage,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate signup URL with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signupUrl = `${baseUrl}/church-signup/${invitation.id}`;

    // Render email template
    const emailHtml = await render(
      ChurchInvitationEmail({
        inviterName: userName,
        inviterEmail: user.email,
        inviterPhone: user.phone || undefined,
        customMessage: validatedData.customMessage || undefined,
        signupUrl,
        appName: "InHouse",
      })
    );

    // Send email
    const fromEmail = process.env.FROM_EMAIL || "noreply@inhouse.com";
    const emailResult = await emailService.sendEmail({
      to: validatedData.churchEmail,
      from: fromEmail,
      subject: `You've been invited to join InHouse by ${userName}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      // Rollback invitation creation if email fails
      await db.churchInvitation.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json(
        { error: `Failed to send invitation email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // Log invitation sent to ActivityLog
    try {
      await ActivityLogService.logInvitationSent(
        user.id,
        "USER", // User role since only verified users can send invitations
        userName,
        user.email,
        validatedData.churchEmail,
        "church",
        invitation.id
      );
    } catch (error) {
      console.error("Failed to log invitation sent:", error);
      // Don't fail invitation if activity logging fails
    }

    // Update invitation analytics
    await db.invitationAnalytics.upsert({
      where: { userId: user.id },
      update: {
        churchInvitesSent: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        churchInvitesSent: 1,
      },
    });

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      message: "Church invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending church invitation:", error);

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

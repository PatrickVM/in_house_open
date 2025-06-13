import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { render } from "@react-email/render";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email/email-service";
import { ChurchInvitationEmail } from "@/lib/email/templates/church-invitation";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is authenticated and has admin role
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { type } = await request.json();

    // Currently only church invitations can be resent
    if (type === "church") {
      // Get church invitation
      const invitation = await db.churchInvitation.findUnique({
        where: { id },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation not found" },
          { status: 404 }
        );
      }

      if (invitation.status !== "PENDING") {
        return NextResponse.json(
          {
            error: `Cannot resend invitation with status: ${invitation.status}`,
          },
          { status: 400 }
        );
      }

      // Reset expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Update the invitation
      await db.churchInvitation.update({
        where: { id },
        data: {
          expiresAt,
        },
      });

      // Generate signup URL with token
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const signupUrl = `${baseUrl}/church-signup/${invitation.id}`;

      // Render email template
      const emailHtml = await render(
        ChurchInvitationEmail({
          inviterName: invitation.inviterName,
          inviterEmail: invitation.inviterEmail,
          inviterPhone: invitation.inviterPhone || undefined,
          customMessage: invitation.customMessage || undefined,
          signupUrl,
          appName: "InHouse",
        })
      );

      // Send email
      const fromEmail = process.env.FROM_EMAIL || "noreply@inhouse.com";
      const emailResult = await emailService.sendEmail({
        to: invitation.churchEmail,
        from: fromEmail,
        subject: `Reminder: You've been invited to join InHouse by ${invitation.inviterName}`,
        html: emailHtml,
      });

      if (!emailResult.success) {
        return NextResponse.json(
          { error: `Failed to send invitation email: ${emailResult.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Invitation resent successfully",
      });
    } else {
      // User invitations cannot be resent in the same way
      return NextResponse.json(
        { error: "Resending user invitations is not supported" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}

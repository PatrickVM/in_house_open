import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email/email-service";
import { render } from "@react-email/render";
import PasswordResetEmail from "@/lib/email/templates/password-reset";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Always return success to prevent email enumeration
    // (don't reveal if email exists or not)
    const successResponse = NextResponse.json({
      message:
        "If an account with that email exists, you will receive a password reset link shortly.",
    });

    // If user doesn't exist, return success without sending email
    if (!user) {
      return successResponse;
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Get user name for email
    const userName = user.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : undefined;

    // Render email HTML
    const emailHtml = render(
      PasswordResetEmail({
        userName,
        resetUrl,
        appName: "InHouse",
      })
    );

    // Send email
    const emailResult = await emailService.sendEmail({
      to: user.email,
      from: process.env.EMAIL_FROM || "noreply@inhouse.com",
      subject: "Reset Your Password - InHouse",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      // Still return success to user, but log the error
    }

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

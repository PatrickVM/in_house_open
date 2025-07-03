import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { emailService } from "@/lib/email/email-service";
import { z } from "zod";

const reportSchema = z.object({
  type: z.enum(["bug", "suggestion", "comment"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pageUrl: z.string().url("Invalid page URL"),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // Get user info
    const user = session.user;
    const userName =
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email;

    // Format report type for display
    const reportTypeDisplay = {
      bug: "Bug Report",
      suggestion: "Suggestion",
      comment: "Comment",
    }[validatedData.type];

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          New ${reportTypeDisplay} from InHouse
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Report Details</h3>
          <p><strong>Type:</strong> ${reportTypeDisplay}</p>
          <p><strong>Page:</strong> <a href="${validatedData.pageUrl}">${validatedData.pageUrl}</a></p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">User Information</h3>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role || "USER"}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Description</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${validatedData.description}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px;">
          <p>This report was automatically generated from the InHouse platform.</p>
        </div>
      </div>
    `;

    // Send email
    const fromEmail = process.env.FROM_EMAIL || "noreply@inhouse.com";
    const emailResult = await emailService.sendEmail({
      to: "patrick.v.murray@gmail.com",
      from: fromEmail,
      subject: `InHouse ${reportTypeDisplay}: ${validatedData.type === "bug" ? "Bug Report" : validatedData.type === "suggestion" ? "Feature Suggestion" : "User Comment"}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send report: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid report data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

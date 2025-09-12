import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email/email-service";
import { MembershipWarningEmail } from "@/lib/email/templates/membership-warning";
import { AccountDisabledEmail } from "@/lib/email/templates/account-disabled";
import { render } from "@react-email/render";

const SUPPORT_EMAIL = "support@inhouse-app.com";
const CHURCH_SEARCH_URL = `${process.env.NEXTAUTH_URL}/dashboard/churches`;

export async function POST(request: NextRequest) {
  try {
    // Simple security check
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || "development-secret";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const results = {
      warningsProcessed: 0,
      accountsDisabled: 0,
      errors: [] as string[],
    };

    // Calculate dates
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // STEP 1: Send Day 5 warnings
    const usersNeedingWarning = await db.user.findMany({
      where: {
        AND: [
          { membershipEnforcementExempt: false },
          { isActive: true },
          { warningEmailSentAt: null }, // Haven't sent warning yet
          {
            OR: [
              // NONE users - 5 days since registration
              {
                churchMembershipStatus: "NONE",
                createdAt: { lte: fiveDaysAgo },
              },
              // REQUESTED users - 5 days since join request
              {
                churchMembershipStatus: "REQUESTED",
                churchJoinRequestedAt: { lte: fiveDaysAgo },
              },
              // REJECTED users - 5 days since last status update
              {
                churchMembershipStatus: "REJECTED",
                updatedAt: { lte: fiveDaysAgo },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        churchMembershipStatus: true,
        createdAt: true,
        churchJoinRequestedAt: true,
        updatedAt: true,
      },
    });

    // Send warning emails
    for (const user of usersNeedingWarning) {
      try {
        const warningEmailHtml = await render(
          MembershipWarningEmail({
            firstName: user.firstName || undefined,
            daysRemaining: 2,
            churchSearchUrl: CHURCH_SEARCH_URL,
            supportEmail: SUPPORT_EMAIL,
          })
        );

        const emailResult = await emailService.sendEmail({
          to: user.email,
          from: "noreply@inhouse-app.com",
          subject:
            "Action Required: Church Membership Needed (2 Days Remaining)",
          html: warningEmailHtml,
        });

        if (emailResult.success) {
          // Mark warning as sent
          await db.user.update({
            where: { id: user.id },
            data: { warningEmailSentAt: now },
          });
          results.warningsProcessed++;
        } else {
          results.errors.push(
            `Warning email failed for ${user.email}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(`Warning error for ${user.email}: ${error}`);
      }
    }

    // STEP 2: Disable Day 7 accounts
    const usersToDisable = await db.user.findMany({
      where: {
        AND: [
          { membershipEnforcementExempt: false },
          { isActive: true },
          {
            OR: [
              // NONE users - 7 days since registration
              {
                churchMembershipStatus: "NONE",
                createdAt: { lte: sevenDaysAgo },
              },
              // REQUESTED users - 7 days since join request
              {
                churchMembershipStatus: "REQUESTED",
                churchJoinRequestedAt: { lte: sevenDaysAgo },
              },
              // REJECTED users - 7 days since last status update
              {
                churchMembershipStatus: "REJECTED",
                updatedAt: { lte: sevenDaysAgo },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        churchMembershipStatus: true,
      },
    });

    // Disable accounts and send emails
    for (const user of usersToDisable) {
      try {
        // Disable account
        await db.user.update({
          where: { id: user.id },
          data: {
            isActive: false,
            disabledReason: "CHURCH_MEMBERSHIP_REQUIRED",
          },
        });

        // Send disabled email
        const disabledEmailHtml = await render(
          AccountDisabledEmail({
            firstName: user.firstName || undefined,
            disabledReason: "CHURCH_MEMBERSHIP_REQUIRED",
            churchSearchUrl: CHURCH_SEARCH_URL,
            supportEmail: SUPPORT_EMAIL,
          })
        );

        const emailResult = await emailService.sendEmail({
          to: user.email,
          from: "noreply@inhouse-app.com",
          subject: "Account Temporarily Disabled - Church Membership Required",
          html: disabledEmailHtml,
        });

        if (!emailResult.success) {
          results.errors.push(
            `Disabled email failed for ${user.email}: ${emailResult.error}`
          );
        }

        results.accountsDisabled++;
      } catch (error) {
        results.errors.push(`Disable error for ${user.email}: ${error}`);
      }
    }

    // Log results
    console.log("Church membership enforcement completed:", results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.warningsProcessed} warnings, disabled ${results.accountsDisabled} accounts`,
      ...results,
    });
  } catch (error) {
    console.error("Error enforcing church membership:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

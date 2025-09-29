# Church Membership Enforcement - Implementation Checklist

## 📊 **Database Migration**

### **Step 1: Create Migration File**
```bash
# Create new migration
npx prisma migrate dev --name add_membership_enforcement_fields
```

### **Step 2: Migration SQL**
```sql
-- File: prisma/migrations/[timestamp]_add_membership_enforcement_fields/migration.sql
ALTER TABLE "User" ADD COLUMN "membershipEnforcementExempt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "membershipDeadlineDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "warningEmailSentAt" TIMESTAMP(3);  
ALTER TABLE "User" ADD COLUMN "disabledReason" TEXT;
```

### **Step 3: Update Prisma Schema**
```typescript
// File: prisma/schema.prisma - Add to User model
model User {
  // ... existing fields
  isActive      Boolean     @default(true)
  
  // Church membership enforcement fields
  membershipEnforcementExempt Boolean   @default(false)
  membershipDeadlineDate      DateTime?
  warningEmailSentAt          DateTime?
  disabledReason             String?
  
  // ... rest of model
}
```

---

## 🔐 **Authentication System**

### **File: `auth.ts`**
```typescript
// Lines 35-45: After password validation, before return
if (!user.isActive) {
  // Instead of returning null, return error info for better UX
  return {
    error: 'ACCOUNT_DISABLED',
    reason: user.disabledReason || 'CHURCH_MEMBERSHIP_REQUIRED',
    email: user.email
  };
}

// Update return type to include error handling
return {
  id: user.id,
  email: user.email,
  name: user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email,
  role: user.role as any,
};
```

### **File: `app/login/page.tsx`**
```typescript
// Add after line 64 (in handleSubmit catch block)
if (error.error === 'ACCOUNT_DISABLED') {
  // Don't show generic error, redirect to disabled page
  router.push(`/account-disabled?reason=${error.reason}&email=${error.email}`);
  return;
}
```

---

## 🚫 **Account Disabled Experience**

### **NEW FILE: `app/account-disabled/page.tsx`**
```typescript
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, Mail, ArrowRight } from "lucide-react";

export default function AccountDisabledPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const email = searchParams.get('email');

  const getDisabledInfo = () => {
    switch (reason) {
      case 'CHURCH_MEMBERSHIP_REQUIRED':
        return {
          title: "Church Membership Required",
          description: "Your account has been temporarily disabled because you need to be a verified member of a church to access the platform.",
          steps: [
            "Search for and request to join a church below",
            "Wait for church members to verify your request", 
            "Your account will be automatically reactivated once verified"
          ]
        };
      default:
        return {
          title: "Account Temporarily Disabled", 
          description: "Your account has been temporarily disabled.",
          steps: ["Contact support for assistance"]
        };
    }
  };

  const info = getDisabledInfo();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{info.title}</CardTitle>
          <p className="text-muted-foreground">{info.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Steps to Reactivate:</h3>
            <ol className="space-y-2">
              {info.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-sm rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {reason === 'CHURCH_MEMBERSHIP_REQUIRED' && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard/churches">
                  <Search className="w-4 h-4 mr-2" />
                  Search for Churches
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/church/apply">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Register Your Church
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Need help? Contact support:
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="mailto:support@inhouse-app.com">
                <Mail className="w-4 h-4 mr-2" />
                support@inhouse-app.com
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📧 **Email Templates**

### **NEW FILE: `lib/email/templates/membership-warning.tsx`**
```typescript
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text
} from "@react-email/components";

interface MembershipWarningEmailProps {
  firstName?: string;
  daysRemaining: number;
  churchSearchUrl: string;
  supportEmail: string;
}

export const MembershipWarningEmail = ({
  firstName,
  daysRemaining,
  churchSearchUrl,
  supportEmail,
}: MembershipWarningEmailProps) => {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  
  return (
    <Html>
      <Head />
      <Preview>Action Required: Church Membership Needed ({daysRemaining} Days Left)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Action Required</Heading>
          
          <Text style={text}>{greeting},</Text>
          
          <Text style={text}>
            Your InHouse account will be temporarily disabled in <strong>{daysRemaining} days</strong> 
            because you need to be a verified member of a church to access our platform.
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>What you need to do:</strong>
            </Text>
            <ol style={list}>
              <li>Search for and request to join a church</li>
              <li>Wait for church members to verify your request</li>
              <li>Your account stays active once you're verified!</li>
            </ol>
          </Section>
          
          <Section style={buttonSection}>
            <Button style={button} href={churchSearchUrl}>
              Find Churches Near Me
            </Button>
          </Section>
          
          <Text style={text}>
            If you have any questions, please contact us at {supportEmail}.
          </Text>
          
          <Text style={footerText}>
            This is an automated reminder. Your account will be disabled if no action is taken.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Reuse styles from existing church-invitation.tsx with modifications
const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const h1 = {
  color: "#d97706", // Warning orange
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px", 
  lineHeight: "26px",
  margin: "16px 0",
};

const warningBox = {
  backgroundColor: "#fef3c7", // Light yellow warning
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const list = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
  paddingLeft: "20px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#d97706",
  borderRadius: "8px", 
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px", 
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default MembershipWarningEmail;
```

### **NEW FILE: `lib/email/templates/account-disabled.tsx`**
```typescript
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text
} from "@react-email/components";

interface AccountDisabledEmailProps {
  firstName?: string;
  disabledReason: string;
  churchSearchUrl: string;
  supportEmail: string;
}

export const AccountDisabledEmail = ({
  firstName,
  disabledReason,
  churchSearchUrl, 
  supportEmail,
}: AccountDisabledEmailProps) => {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  
  return (
    <Html>
      <Head />
      <Preview>Account Temporarily Disabled - Church Membership Required</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Account Temporarily Disabled</Heading>
          
          <Text style={text}>{greeting},</Text>
          
          <Text style={text}>
            Your InHouse account has been temporarily disabled because you need to be 
            a verified member of a church to access our platform.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoTitle}>How to Reactivate Your Account:</Text>
            <ol style={list}>
              <li>Search for and request to join a church</li>
              <li>Wait for church members to verify your request</li> 
              <li>Your account will be automatically reactivated once verified</li>
            </ol>
          </Section>
          
          <Section style={buttonSection}>
            <Button style={button} href={churchSearchUrl}>
              Reactivate My Account
            </Button>
          </Section>
          
          <Text style={text}>
            Your account and all data remain secure. Once you become a verified church member,
            you'll regain full access immediately.
          </Text>
          
          <Text style={text}>
            Questions? Contact us at {supportEmail}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Similar styles with red theme for disabled state
const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto", 
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const h1 = {
  color: "#dc2626", // Red for disabled
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px", 
  margin: "16px 0",
};

const infoBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const infoTitle = {
  color: "#991b1b",
  fontSize: "16px",
  fontWeight: "bold",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const list = {
  color: "#991b1b",
  fontSize: "16px", 
  lineHeight: "26px",
  margin: "8px 0",
  paddingLeft: "20px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#fff", 
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

export default AccountDisabledEmail;
```

---

## ⏰ **Cron Job Implementation**

### **NEW FILE: `app/api/cron/enforce-church-membership/route.ts`**
```typescript
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
                createdAt: { lte: fiveDaysAgo }
              },
              // REQUESTED users - 5 days since join request
              {
                churchMembershipStatus: "REQUESTED", 
                churchJoinRequestedAt: { lte: fiveDaysAgo }
              },
              // REJECTED users - 5 days since last status update
              {
                churchMembershipStatus: "REJECTED",
                updatedAt: { lte: fiveDaysAgo }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        churchMembershipStatus: true,
        createdAt: true,
        churchJoinRequestedAt: true,
        updatedAt: true,
      }
    });

    // Send warning emails
    for (const user of usersNeedingWarning) {
      try {
        const warningEmailHtml = render(MembershipWarningEmail({
          firstName: user.firstName || undefined,
          daysRemaining: 2,
          churchSearchUrl: CHURCH_SEARCH_URL,
          supportEmail: SUPPORT_EMAIL,
        }));

        const emailResult = await emailService.sendEmail({
          to: user.email,
          from: "noreply@inhouse-app.com",
          subject: "Action Required: Church Membership Needed (2 Days Remaining)",
          html: warningEmailHtml,
        });

        if (emailResult.success) {
          // Mark warning as sent
          await db.user.update({
            where: { id: user.id },
            data: { warningEmailSentAt: now }
          });
          results.warningsProcessed++;
        } else {
          results.errors.push(`Warning email failed for ${user.email}: ${emailResult.error}`);
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
                createdAt: { lte: sevenDaysAgo }
              },
              // REQUESTED users - 7 days since join request  
              {
                churchMembershipStatus: "REQUESTED",
                churchJoinRequestedAt: { lte: sevenDaysAgo }
              },
              // REJECTED users - 7 days since last status update
              {
                churchMembershipStatus: "REJECTED", 
                updatedAt: { lte: sevenDaysAgo }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        churchMembershipStatus: true,
      }
    });

    // Disable accounts and send emails
    for (const user of usersToDisable) {
      try {
        // Disable account
        await db.user.update({
          where: { id: user.id },
          data: {
            isActive: false,
            disabledReason: "CHURCH_MEMBERSHIP_REQUIRED"
          }
        });

        // Send disabled email
        const disabledEmailHtml = render(AccountDisabledEmail({
          firstName: user.firstName || undefined,
          disabledReason: "CHURCH_MEMBERSHIP_REQUIRED", 
          churchSearchUrl: CHURCH_SEARCH_URL,
          supportEmail: SUPPORT_EMAIL,
        }));

        const emailResult = await emailService.sendEmail({
          to: user.email,
          from: "noreply@inhouse-app.com",
          subject: "Account Temporarily Disabled - Church Membership Required",
          html: disabledEmailHtml,
        });

        if (!emailResult.success) {
          results.errors.push(`Disabled email failed for ${user.email}: ${emailResult.error}`);
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
      ...results
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
```

---

## 🔄 **Auto Re-activation**

### **File: `app/api/churches/verify-member/route.ts`**
```typescript
// Around line 225, in the transaction where user becomes VERIFIED
await tx.user.update({
  where: { id: verificationRequest.userId },
  data: {
    churchId: verificationRequest.churchId,
    churchMembershipStatus: "VERIFIED",
    verifiedAt: new Date(),
    // ADD THESE LINES FOR RE-ACTIVATION:
    isActive: true, // Ensure account is reactivated
    disabledReason: null, // Clear disabled reason
    warningEmailSentAt: null, // Reset warning state
    // Clear manual church fields since user now has official church relationship
    churchName: null,
    churchWebsite: null,
  },
});

// AFTER the transaction, send welcome back email if account was disabled
const wasDisabled = user.disabledReason !== null;
if (wasDisabled) {
  try {
    const welcomeBackEmailHtml = render(AccountReactivatedEmail({
      firstName: user.firstName || undefined,
      churchName: church.name,
      loginUrl: `${process.env.NEXTAUTH_URL}/login`,
    }));

    await emailService.sendEmail({
      to: user.email,
      from: "noreply@inhouse-app.com", 
      subject: "🎉 Welcome Back - Your Account Has Been Reactivated!",
      html: welcomeBackEmailHtml,
    });
  } catch (error) {
    console.error("Failed to send reactivation email:", error);
    // Don't fail the verification if email fails
  }
}
```

---

## 👨‍💼 **Admin Controls**

### **File: `app/admin/users/[id]/page.tsx`**
```typescript
// Add to the user details section, around the existing status badges:

{/* Membership Enforcement Section */}
<div className="grid gap-4 md:grid-cols-2">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Membership Enforcement</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Enforcement Status:</span>
        <Badge variant={user.membershipEnforcementExempt ? "secondary" : "default"}>
          {user.membershipEnforcementExempt ? "Exempt" : "Active"}
        </Badge>
      </div>
      
      {user.membershipDeadlineDate && (
        <div className="flex items-center justify-between">
          <span className="text-sm">Deadline:</span>
          <span className="text-sm font-mono">
            {new Date(user.membershipDeadlineDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {user.disabledReason && (
        <div className="flex items-center justify-between">
          <span className="text-sm">Disabled Reason:</span>
          <Badge variant="destructive">{user.disabledReason}</Badge>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          variant={user.membershipEnforcementExempt ? "default" : "secondary"}
          size="sm"
          onClick={() => handleMembershipAction(
            user.membershipEnforcementExempt ? "remove_exempt" : "exempt"
          )}
        >
          {user.membershipEnforcementExempt ? "Remove Exemption" : "Grant Exemption"}
        </Button>
        
        {!user.isActive && (
          <Button
            variant="default"
            size="sm" 
            onClick={() => handleMembershipAction("reactivate")}
          >
            Reactivate Account
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
</div>
```

### **File: `app/api/admin/users/[id]/route.ts`**
```typescript
// Add to the existing action handlers:

} else if (action === "exempt") {
  updateData.membershipEnforcementExempt = true;
} else if (action === "remove_exempt") {
  updateData.membershipEnforcementExempt = false;
} else if (action === "reactivate") {
  updateData.isActive = true;
  updateData.disabledReason = null;
  updateData.warningEmailSentAt = null;
}
```

---

## ✅ **Testing Checklist**

### **Manual Testing Steps**
- [ ] **New User Registration**: Verify 7-day countdown starts
- [ ] **Day 5 Warning**: Create user with createdAt = 5 days ago, run cron
- [ ] **Day 7 Disable**: Create user with createdAt = 7 days ago, run cron  
- [ ] **Login While Disabled**: Verify redirect to account-disabled page
- [ ] **Church Join & Verify**: Verify auto-reactivation works
- [ ] **Admin Exemption**: Test exemption toggle and reactivation
- [ ] **Email Templates**: Test all email rendering and delivery

### **Database Verification**
```sql
-- Check enforcement fields are added
\d "User";

-- Test deadline calculation
SELECT 
  email,
  "churchMembershipStatus",
  "createdAt",
  "churchJoinRequestedAt", 
  "isActive",
  "membershipEnforcementExempt"
FROM "User" 
WHERE "churchMembershipStatus" IN ('NONE', 'REQUESTED', 'REJECTED');
```

---

**Ready for implementation!** Each file change is isolated and can be deployed incrementally. Start with the database migration, then auth changes, then cron job, then UI enhancements.
# Invitation System - Setup and Configuration Guide

## Overview

This guide provides step-by-step instructions for setting up and configuring the InHouse Invitation System, including email service integration, database setup, and environment configuration.

## Prerequisites

### System Requirements

- Node.js 18+
- PostgreSQL 14+
- Next.js 13+ (App Router)
- Prisma ORM
- Email service account (Resend recommended)

### Dependencies

The invitation system requires the following npm packages:

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "@react-email/components": "^0.0.7",
    "@react-email/render": "^0.0.7",
    "zod": "^3.22.4",
    "prisma": "^5.4.2"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.2"
  }
}
```

## Database Setup

### 1. Prisma Schema Migration

The invitation system requires specific database models. Ensure your `prisma/schema.prisma` includes:

```prisma
model ChurchInvitation {
  id              String    @id @default(cuid())
  inviterEmail    String
  inviterName     String
  inviterPhone    String?
  churchEmail     String
  customMessage   String?
  status          ChurchInvitationStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  expiresAt       DateTime
  claimedAt       DateTime?
  claimedByUserId String?

  inviter         User      @relation("ChurchInvitations", fields: [inviterEmail], references: [email])
  claimedBy       User?     @relation("ClaimedChurchInvitations", fields: [claimedByUserId], references: [id])
}

model InviteCode {
  id            String    @id @default(cuid())
  code          String    @unique
  createdAt     DateTime  @default(now())
  expiresAt     DateTime?
  userId        String    @unique
  scans         Int       @default(0)
  lastScannedAt DateTime?
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model InvitationAnalytics {
  id                  String    @id @default(cuid())
  userId              String
  churchInvitesSent   Int       @default(0)
  userInvitesSent     Int       @default(0)
  userInvitesScanned  Int       @default(0)
  userInvitesCompleted Int      @default(0)
  lastUpdated         DateTime  @updatedAt

  user                User      @relation(fields: [userId], references: [id])

  @@unique([userId])
}

enum ChurchInvitationStatus {
  PENDING
  CLAIMED
  EXPIRED
  CANCELLED
}
```

### 2. Update User Model

Add these relations to your existing User model:

```prisma
model User {
  // ... existing fields ...

  // New invitation relations
  churchInvitationsSent       ChurchInvitation[] @relation("ChurchInvitations")
  claimedChurchInvitations    ChurchInvitation[] @relation("ClaimedChurchInvitations")
  invitationAnalytics         InvitationAnalytics?
}
```

### 3. Run Database Migration

```bash
# Generate and apply migration
npx prisma migrate dev --name add_invitation_system

# Generate Prisma client
npx prisma generate
```

### 4. Database Indexes (Optional but Recommended)

Add these indexes for optimal performance:

```sql
-- Index for church invitation queries
CREATE INDEX idx_church_invitations_status ON "ChurchInvitation"("status");
CREATE INDEX idx_church_invitations_email ON "ChurchInvitation"("churchEmail");
CREATE INDEX idx_church_invitations_inviter ON "ChurchInvitation"("inviterEmail");

-- Index for invite code queries
CREATE INDEX idx_invite_codes_scans ON "InviteCode"("scans");
CREATE INDEX idx_invite_codes_userid ON "InviteCode"("userId");

-- Index for analytics queries
CREATE INDEX idx_invitation_analytics_userid ON "InvitationAnalytics"("userId");
```

## Email Service Configuration

### Resend Setup (Recommended)

1. **Create Resend Account**

   - Go to [resend.com](https://resend.com)
   - Sign up for free account (3,000 emails/month)
   - Verify your email domain

2. **Get API Key**

   - Navigate to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Domain Verification**
   - Add your domain in Resend dashboard
   - Configure DNS records for deliverability
   - Verify domain ownership

### Email Service Implementation

Create the email service file:

```typescript
// lib/email/email-service.ts
interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private apiKey: string;
  private baseUrl = "https://api.resend.com";

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY!;
    if (!this.apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const emailService = new EmailService();
```

## Environment Variables

### Required Environment Variables

Create or update your `.env.local` file:

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (if not already configured)
DATABASE_URL=postgresql://username:password@localhost:5432/inhouse_db

# NextAuth (if not already configured)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
```

### Environment Variable Validation

Add validation to ensure required variables are set:

```typescript
// lib/env-validation.ts
function validateEnvVars() {
  const required = [
    "RESEND_API_KEY",
    "FROM_EMAIL",
    "NEXT_PUBLIC_APP_URL",
    "DATABASE_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Call this in your app initialization
validateEnvVars();
```

## File Structure Setup

### Create Required Directories

```bash
# Create invitation-related directories
mkdir -p inhouse_app/app/invite-church/success
mkdir -p inhouse_app/app/church-signup
mkdir -p inhouse_app/app/invite
mkdir -p inhouse_app/app/register
mkdir -p inhouse_app/components/invite
mkdir -p inhouse_app/components/church
mkdir -p inhouse_app/components/admin/analytics
mkdir -p inhouse_app/components/church/analytics
mkdir -p inhouse_app/lib/email/templates
mkdir -p inhouse_app/lib/validators
```

### Required Files Checklist

Ensure all these files exist and are properly configured:

**API Routes:**

- ✅ `/app/api/church-invitations/route.ts`
- ✅ `/app/api/church-invitations/check/route.ts`
- ✅ `/app/api/church-signup/[token]/route.ts`
- ✅ `/app/api/invite/qr-code/route.ts`
- ✅ `/app/api/invite/analytics/route.ts`
- ✅ `/app/api/invite-code/[code]/route.ts`
- ✅ `/app/api/admin/analytics/invitations/route.ts`
- ✅ `/app/api/church/analytics/invitations/route.ts`

**Page Components:**

- ✅ `/app/invite-church/page.tsx`
- ✅ `/app/invite-church/success/page.tsx`
- ✅ `/app/church-signup/[token]/page.tsx`
- ✅ `/app/invite/page.tsx`
- ✅ `/app/register/[code]/page.tsx`
- ✅ `/app/church/dashboard/invitations/page.tsx`

**Utility Libraries:**

- ✅ `/lib/email/email-service.ts`
- ✅ `/lib/email/templates/church-invitation.tsx`
- ✅ `/lib/qr-code.ts`
- ✅ `/lib/invite-analytics.ts`
- ✅ `/lib/validators/church-invitation.ts`

## Development Setup

### 1. Install Dependencies

```bash
cd inhouse_app
npm install qrcode @react-email/components @react-email/render
npm install -D @types/qrcode
```

### 2. Database Seeding

Add invitation system data to your seed file:

```typescript
// prisma/seed.ts additions
async function seedInvitationData() {
  // Create some invite codes
  const inviteCodes = await Promise.all([
    prisma.inviteCode.create({
      data: {
        code: "DEMO2024",
        userId: "existing_user_id",
        scans: 5,
        lastScannedAt: new Date(),
      },
    }),
  ]);

  // Create invitation analytics
  const analytics = await Promise.all([
    prisma.invitationAnalytics.create({
      data: {
        userId: "existing_user_id",
        churchInvitesSent: 3,
        userInvitesSent: 10,
        userInvitesScanned: 25,
        userInvitesCompleted: 8,
      },
    }),
  ]);

  console.log("✅ Invitation data seeded");
}
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test Email Service

Create a test script to verify email configuration:

```typescript
// scripts/test-email.ts
import { emailService } from "../lib/email/email-service";

async function testEmail() {
  try {
    const result = await emailService.sendEmail({
      to: "test@example.com",
      from: process.env.FROM_EMAIL!,
      subject: "Test Email",
      html: "<p>This is a test email from the invitation system.</p>",
    });

    console.log("Email test result:", result);
  } catch (error) {
    console.error("Email test failed:", error);
  }
}

testEmail();
```

## Production Deployment

### 1. Environment Setup

Ensure all environment variables are properly set in your production environment:

```bash
# Production environment variables
export RESEND_API_KEY="re_production_api_key"
export FROM_EMAIL="noreply@yourdomain.com"
export NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 2. Database Migration

Run migrations in production:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. DNS Configuration for Email

For optimal email deliverability, configure these DNS records:

**SPF Record:**

```
TXT @ "v=spf1 include:_spf.resend.com ~all"
```

**DKIM Record:**

```
TXT resend._domainkey "v=DKIM1; k=rsa; p=[your_dkim_key]"
```

**DMARC Record:**

```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### 4. Performance Optimization

Configure caching and optimization:

```typescript
// next.config.js additions
const nextConfig = {
  // Enable image optimization for QR codes
  images: {
    domains: ["yourdomain.com"],
  },

  // Cache QR codes
  async headers() {
    return [
      {
        source: "/api/invite/qr-code",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
};
```

## Testing Setup

### 1. Unit Tests

Create test files for invitation functionality:

```typescript
// tests/api/church-invitations.test.ts
import { POST } from "../../app/api/church-invitations/route";

describe("/api/church-invitations", () => {
  it("should send church invitation", async () => {
    // Test implementation
  });

  it("should prevent duplicate invitations", async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests

Test the complete invitation flow:

```typescript
// tests/integration/invitation-flow.test.ts
describe("Invitation Flow", () => {
  it("should complete church invitation flow", async () => {
    // 1. Send invitation
    // 2. Receive email
    // 3. Complete signup
    // 4. Verify analytics update
  });
});
```

### 3. E2E Tests

Use Playwright or Cypress for end-to-end testing:

```typescript
// e2e/invitation.spec.ts
test("invitation system end-to-end", async ({ page }) => {
  // Test complete user journey
});
```

## Monitoring and Maintenance

### 1. Analytics Monitoring

Set up monitoring for key metrics:

```typescript
// lib/monitoring/invitation-metrics.ts
export async function trackInvitationMetrics() {
  const metrics = await db.invitationAnalytics.aggregate({
    _sum: {
      churchInvitesSent: true,
      userInvitesSent: true,
      userInvitesCompleted: true,
    },
  });

  // Send to monitoring service
  console.log("Invitation metrics:", metrics);
}
```

### 2. Error Tracking

Implement error tracking for invitation failures:

```typescript
// lib/error-tracking.ts
export function trackInvitationError(error: Error, context: any) {
  console.error("Invitation error:", {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to error tracking service (Sentry, etc.)
}
```

### 3. Regular Maintenance Tasks

Create scheduled tasks for system maintenance:

```typescript
// lib/maintenance/cleanup-invitations.ts
export async function cleanupExpiredInvitations() {
  const result = await db.churchInvitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });

  console.log(`Expired ${result.count} invitations`);
}
```

## Troubleshooting

### Common Issues

**Email Delivery Issues:**

- Verify RESEND_API_KEY is correct
- Check domain verification status
- Review email logs in Resend dashboard

**QR Code Generation Errors:**

- Ensure NEXT_PUBLIC_APP_URL is set
- Check QRCode library installation
- Verify user eligibility (verified church member)

**Database Errors:**

- Run `npx prisma migrate reset` if needed
- Check database connection
- Verify schema is up to date

**Performance Issues:**

- Add database indexes
- Implement caching for QR codes
- Optimize large queries with pagination

### Support Resources

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)
- **QRCode Library**: [github.com/soldair/node-qrcode](https://github.com/soldair/node-qrcode)

## Security Considerations

### Data Protection

- Never log email content or sensitive data
- Implement rate limiting on invitation endpoints
- Validate all input data with Zod schemas
- Use HTTPS in production

### Access Control

- Verify user roles before allowing actions
- Church-scope data access appropriately
- Implement session-based authentication
- Regular security audits

This setup guide provides everything needed to successfully configure and deploy the InHouse Invitation System. Follow the steps in order and refer to the troubleshooting section if you encounter any issues.

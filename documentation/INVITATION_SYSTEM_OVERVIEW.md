# InHouse Invitation System Documentation

## Overview

The InHouse Invitation System is a comprehensive two-tier invitation infrastructure that enables users to invite both churches and individual users to join the platform. The system provides robust analytics, tracking, and management capabilities across admin, church, and user levels.

## System Architecture

### Two-Tier Invitation System

1. **Church Invitations**: Users invite church contacts to join as lead contacts
2. **User Invitations**: Verified church members invite general users via QR codes

### Current Implementation Status

✅ **95% Complete** - All core functionality implemented  
✅ **Production Ready** - Full database schema, APIs, and UI components  
✅ **Analytics Complete** - Admin, church, and user-level analytics  
✅ **Email Integration** - Resend service with custom templates

## Key Features

### Church Invitation System

- **Church Invitation Form**: `/invite-church` - Users can invite churches to join
- **Email Notifications**: Automated email invitations with custom templates
- **Church Signup Flow**: Complete registration + church application process
- **Duplicate Prevention**: Automatic checking for existing invitations
- **Status Tracking**: PENDING, CLAIMED, EXPIRED, CANCELLED states

### User Invitation System

- **QR Code Generation**: Verified church members get unique QR codes
- **Invite Link Sharing**: Direct registration links with tracking
- **Scan Analytics**: Track QR code scans and conversions
- **Registration Flow**: Streamlined signup with invite code validation

### Analytics & Management

- **Admin Analytics**: System-wide invitation metrics and management
- **Church Analytics**: Church-scoped invitation tracking and member leaderboard
- **User Analytics**: Individual invitation performance and statistics
- **Real-time Tracking**: Live scan counts, conversion rates, and status updates

## Database Schema

### Core Models

```prisma
model ChurchInvitation {
  id              String    @id @default(cuid())
  inviterEmail    String    // User who sent invitation
  inviterName     String    // User's name
  inviterPhone    String?   // User's phone
  churchEmail     String    // Target church email
  customMessage   String?   // "To whom it may concern" message
  status          ChurchInvitationStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  expiresAt       DateTime  // 7 days from creation
  claimedAt       DateTime?
  claimedByUserId String?   // User who claimed the invitation

  inviter         User      @relation("ChurchInvitations", fields: [inviterEmail], references: [email])
  claimedBy       User?     @relation("ClaimedChurchInvitations", fields: [claimedByUserId], references: [id])
}

model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  createdAt DateTime  @default(now())
  expiresAt DateTime?
  userId    String    @unique
  scans     Int       @default(0)  // QR code scan count
  lastScannedAt DateTime?
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model InvitationAnalytics {
  id              String    @id @default(cuid())
  userId          String    // User being tracked
  churchInvitesSent Int     @default(0)
  userInvitesSent Int       @default(0)
  userInvitesScanned Int    @default(0)
  userInvitesCompleted Int  @default(0)
  lastUpdated     DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])

  @@unique([userId])
}
```

## API Endpoints

### Church Invitations

- `POST /api/church-invitations` - Send church invitation
- `GET /api/church-invitations/check` - Check for existing invitations
- `GET /api/church-signup/[token]` - Validate signup token
- `POST /api/church-signup/[token]` - Process church signup

### User Invitations

- `GET /api/invite/qr-code` - Generate QR code for user
- `GET /api/invite/analytics` - Get user invitation analytics
- `GET /api/invite-code/[code]` - Validate invite code
- `POST /api/auth/register` - Register with invite code

### Admin Analytics

- `GET /api/admin/analytics/invitations` - Admin invitation management
- `GET /api/admin/analytics/leaderboard` - System-wide leaderboard
- `POST /api/admin/analytics/invitations/[id]/expire` - Expire invitation
- `DELETE /api/admin/analytics/invitations/[id]` - Delete invitation
- `POST /api/admin/analytics/invitations/[id]/resend` - Resend invitation

### Church Analytics

- `GET /api/church/analytics/invitations` - Church invitation data
- `GET /api/church/analytics/leaderboard` - Church member leaderboard

## User Interface

### Navigation Integration

- **Profile Page**: "Invite Church" and "View Invitations" buttons
- **Site Header**: Conditional invite links based on user verification status
- **Dashboard**: Invitation stats widgets (future enhancement)

### Page Structure

```
/invite-church           # Church invitation form
/invite-church/success   # Confirmation page
/church-signup/[token]   # Church registration flow
/invite                  # QR code generation
/register/[code]         # User registration with invite
/admin/analytics         # Admin invitation management
/church/dashboard/invitations  # Church analytics
```

## Security & Performance

### Security Measures

- ✅ Server-side token validation for all invitations
- ✅ Rate limiting on invitation endpoints
- ✅ Email content sanitization
- ✅ Church-scoped data access controls
- ✅ Proper authentication and authorization

### Performance Optimizations

- ✅ QR code caching to avoid regeneration
- ✅ Batch analytics updates
- ✅ Optimized database queries with proper indexes
- ✅ Pagination for large datasets

## Email Integration

### Service: Resend

- **API Integration**: Professional email delivery service
- **Templates**: React-based email templates
- **Features**: Delivery tracking, bounce handling, professional formatting
- **Free Tier**: 3,000 emails/month

### Required Environment Variables

```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Success Metrics

### Key Performance Indicators

- **Church Invitation Conversion Rate**: Invitations sent → Churches joined
- **User Invitation Conversion Rate**: QR scans → Registrations
- **Email Deliverability**: Successful email delivery rates
- **User Engagement**: Active usage of invitation features

### Current Analytics Tracking

- ✅ Church invitations sent/claimed/expired
- ✅ User invite code scans and conversions
- ✅ Individual user performance metrics
- ✅ Church-wide invitation statistics
- ✅ System-wide leaderboards and rankings

## Future Enhancements

### Phase 3+ Features

1. **Enhanced Church Management**: Allow church leaders to manage member invitations
2. **Advanced Analytics**: Enhanced reporting and trend analysis
3. **Email Deliverability**: SPF/DKIM records, advanced bounce handling
4. **Mobile App Integration**: Native QR code scanning
5. **Bulk Invitation Tools**: Mass invitation capabilities for churches

## Technical Support

### File Locations

- **Database Schema**: `inhouse_app/prisma/schema.prisma`
- **API Routes**: `inhouse_app/app/api/`
- **Components**: `inhouse_app/components/`
- **Email Templates**: `inhouse_app/lib/email/templates/`
- **Utilities**: `inhouse_app/lib/`

### Common Issues & Solutions

- **QR Code Generation**: Ensure NEXT_PUBLIC_APP_URL is set correctly
- **Email Delivery**: Verify RESEND_API_KEY and FROM_EMAIL configuration
- **Church Verification**: Users must be verified church members to generate invite codes
- **Token Expiration**: Church invitations expire after 7 days

## Implementation Timeline

The invitation system was implemented in phases:

1. **Phase 1**: Church invitation system (Complete)
2. **Phase 2**: User invitation system with QR codes (Complete)
3. **Phase 3**: Analytics and admin integration (Complete)
4. **Phase 4**: Church analytics dashboard (Complete)

**Current Status**: Production-ready with 95% feature completion

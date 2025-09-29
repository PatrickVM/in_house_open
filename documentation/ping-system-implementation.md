# Ping System Implementation Strategy

## Overview
Implementation of a user-to-user ping system for the church directory application, allowing verified church members to send connection requests to other members within their local directory. Upon acceptance, contact information (email/phone) becomes visible to the requesting user.

## Current System Analysis

### Existing Architecture
- **Framework**: Next.js 15.2.4 with React 19 (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v4 with JWT strategy
- **UI**: Radix UI components with Tailwind CSS
- **Deployment**: Vercel (serverless limitations apply)

### Directory Implementation Location
- **Main Directory Page**: `/inhouse_app/app/directory/page.tsx`
- **Directory Search Component**: `/inhouse_app/components/directory/DirectorySearch.tsx`
- **Contact Info Display**: Lines 249-259 in DirectorySearch component

### Current Contact Info Structure
```typescript
// Currently displayed in user cards
{(user.phone || user.email) && (
  <div>
    <p className="text-xs text-muted-foreground mb-2">CONTACT</p>
    <div className="text-sm space-y-1">
      {user.phone && <p>{user.phone}</p>}
      <p>{user.email}</p>
    </div>
  </div>
)}
```

## Strategic Implementation Approach

### Phase 1: Core Ping System (MVP)
**Timeline**: 2-3 weeks
**Goal**: Basic ping functionality with Vercel-compatible notifications

#### Technology Stack Decision
- **Notification System**: Firebase Cloud Messaging (FCM)
  - ✅ Vercel serverless compatible
  - ✅ Cross-platform (web + future mobile)
  - ✅ Free tier sufficient for church directory scale
  - ✅ Instant delivery without persistent connections

- **Fallback Strategy**: API polling every 30 seconds when user is active
- **UI Feedback**: Existing Sonner toast system

### Phase 2: Enhanced Features
**Timeline**: 1-2 weeks additional
**Goal**: User preferences, ping history, rate limiting

## Database Schema Changes

### New Tables Required

#### 1. Pings Table
```sql
model Ping {
  id          String      @id @default(cuid())
  senderId    String      // User who sent the ping
  receiverId  String      // User who received the ping
  status      PingStatus  @default(PENDING)
  message     String?     // Optional ping message
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  expiresAt   DateTime    // Auto-reject after 7 days
  
  sender      User        @relation("SentPings", fields: [senderId], references: [id])
  receiver    User        @relation("ReceivedPings", fields: [receiverId], references: [id])
  
  @@unique([senderId, receiverId])
  @@index([receiverId, status])
  @@index([senderId, status])
}

enum PingStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

#### 2. Ping Preferences Table
```sql
model PingPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  autoAccept            Boolean @default(false)
  autoReject            Boolean @default(false)
  allowPingsFromAnyone  Boolean @default(true)
  dailyPingLimit        Int     @default(10)
  
  user                  User    @relation(fields: [userId], references: [id])
}
```

#### 3. FCM Tokens Table
```sql
model FCMToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  device    String?  // web, android, ios
  createdAt DateTime @default(now())
  lastUsed  DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}
```

#### 4. User Model Updates
```sql
model User {
  // ... existing fields
  
  // New ping-related relations
  sentPings           Ping[]            @relation("SentPings")
  receivedPings       Ping[]            @relation("ReceivedPings")
  pingPreferences     PingPreferences?
  fcmTokens           FCMToken[]
}
```

## File Modifications Required

### 1. Database Schema
**File**: `/inhouse_app/prisma/schema.prisma`
**Changes**: Add new models above

### 2. Directory Search Component
**File**: `/inhouse_app/components/directory/DirectorySearch.tsx`

**Changes**:
- Hide contact info section for all users initially
- Add ping button to user cards
- Replace contact section with ping status indicator
- Add ping acceptance/rejection UI

**New UI Structure**:
```tsx
// Replace contact section with:
{!isCurrentUser && (
  <div>
    <PingButton 
      targetUserId={user.id}
      currentPingStatus={pingStatus}
      onPingUpdate={handlePingUpdate}
    />
    {pingStatus === 'ACCEPTED' && (
      <ContactInfo phone={user.phone} email={user.email} />
    )}
  </div>
)}
```

### 3. New Components to Create

#### `/inhouse_app/components/ping/PingButton.tsx`
- Send ping functionality
- Show ping status (pending, accepted, rejected)
- Rate limiting UI feedback

#### `/inhouse_app/components/ping/PingNotification.tsx`
- Accept/reject incoming pings
- Display ping sender info
- Integration with toast system

#### `/inhouse_app/components/ping/ContactInfo.tsx`
- Extracted contact display component
- Only shown when ping is accepted

### 4. API Routes to Create

#### `/inhouse_app/app/api/ping/send/route.ts`
- Send ping to another user
- Rate limiting validation
- FCM notification trigger
- Database ping creation

#### `/inhouse_app/app/api/ping/respond/route.ts`
- Accept/reject ping requests
- Update ping status
- FCM notification to sender

#### `/inhouse_app/app/api/ping/status/route.ts`
- Get ping status between users
- Polling endpoint for real-time updates

#### `/inhouse_app/app/api/ping/list/route.ts`
- Get user's sent/received pings
- Pagination support

#### `/inhouse_app/app/api/fcm/register/route.ts`
- Register FCM tokens
- Device type tracking

### 5. Firebase Configuration
**File**: `/inhouse_app/lib/firebase.ts` (new)
- FCM initialization
- Token management
- Notification sending utilities

**Environment Variables**:
```env
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

## User Experience Flow

### Sending a Ping
1. User browses directory
2. Sees other users without contact info visible
3. Clicks "Send Ping" button
4. Optional: Adds personal message
5. Ping sent → FCM notification to recipient
6. UI shows "Ping Sent" status

### Receiving a Ping
1. User receives FCM notification
2. Toast notification appears in browser
3. Click notification opens ping details
4. Accept/Reject options presented
5. Response triggers FCM to sender
6. If accepted: Contact info becomes visible

### Contact Info Visibility
- **Default**: Contact section hidden for all users
- **After Accepted Ping**: Contact info visible to ping sender only
- **Duration**: Permanent until manually revoked (future feature)

## Rate Limiting Strategy

### Per-User Limits
- **Daily ping limit**: 10 pings per user per day
- **Per-target limit**: 1 ping per target per 7 days
- **Acceptance timeout**: Auto-expire pings after 7 days

### Implementation
- Database-level constraints
- API route validation
- UI prevention of excessive pings

## Security Considerations

### Data Privacy
- Contact info only visible after explicit acceptance
- Ping history logged for moderation
- Church admin oversight capabilities

### Spam Prevention
- Rate limiting at multiple levels
- Church verification required for ping access
- Report/block functionality (Phase 2)

### FCM Token Security
- Secure token storage
- Automatic token rotation
- Device-specific token management

## Testing Strategy

### Unit Tests
- API routes (ping CRUD operations)
- FCM notification utilities
- Rate limiting functions

### Integration Tests
- End-to-end ping workflow
- FCM delivery testing
- Database constraint validation

### Performance Tests
- Directory loading with ping status
- FCM notification delivery speed
- Database query optimization

## Deployment Considerations

### Vercel Compatibility
- All components designed for serverless functions
- No persistent connections required
- Static generation compatible

### Firebase Setup
- Service account key configuration
- FCM project setup
- Web push certificate generation

### Database Migration
- Prisma migration files
- Seed data for ping preferences
- Backward compatibility maintained

## Monitoring and Analytics

### Key Metrics
- Ping success/failure rates
- Average acceptance rate
- FCM delivery success
- API response times

### Logging Strategy
- Ping actions audit trail
- FCM notification status
- Error tracking and alerts

## Future Enhancements (Phase 2+)

### Advanced Features
- Ping message customization
- Contact info expiration dates
- Block/report user functionality
- Ping analytics dashboard

### Mobile App Integration
- React Native FCM integration
- Push notification handling
- Offline ping queue management

### Scalability Improvements
- Redis caching for ping status
- WebSocket fallback for large churches
- Advanced rate limiting with Redis

## Risk Assessment

### Technical Risks
- FCM delivery reliability (Mitigation: Polling fallback)
- Vercel function timeout (Mitigation: Async processing)
- Database performance (Mitigation: Proper indexing)

### User Experience Risks
- Notification fatigue (Mitigation: Smart rate limiting)
- Privacy concerns (Mitigation: Clear consent flow)
- Feature complexity (Mitigation: Phased rollout)

## Success Metrics

### Phase 1 Success Criteria
- ✅ Users can send pings to directory members
- ✅ Real-time notifications via FCM
- ✅ Contact info hidden until ping accepted
- ✅ Rate limiting prevents spam
- ✅ 99% uptime on Vercel deployment

### User Adoption Targets
- 50% of active users send at least one ping
- 70% ping acceptance rate
- <5% spam/inappropriate ping reports

## Conclusion

This implementation strategy provides a comprehensive roadmap for building a robust, scalable ping system that leverages Vercel's strengths while providing the real-time functionality users expect. The FCM-based approach ensures cross-platform compatibility and future mobile app integration while maintaining the simplicity and reliability required for a church community application.
# InHouse Invitation System - API Reference

## Overview

This document provides detailed information about all API endpoints in the InHouse Invitation System. All endpoints require authentication unless otherwise specified.

## Authentication

All API endpoints use NextAuth.js session-based authentication. Include the session token in requests.

```typescript
// Example session check
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Church Invitation Endpoints

### Send Church Invitation

**POST** `/api/church-invitations`

Send an invitation to a church email address.

**Request Body:**

```json
{
  "churchEmail": "pastor@example.org",
  "customMessage": "Optional custom message"
}
```

**Response:**

```json
{
  "success": true,
  "invitationId": "cuid_invitation_id",
  "message": "Invitation sent successfully"
}
```

**Error Responses:**

- `400` - Invalid email or existing invitation
- `401` - Authentication required
- `500` - Email sending failed

**Example:**

```typescript
const response = await fetch("/api/church-invitations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    churchEmail: "pastor@example.org",
    customMessage: "We would love to have your church join our community!",
  }),
});
```

### Check Existing Invitation

**GET** `/api/church-invitations/check?email={email}`

Check if an invitation has already been sent to a church email.

**Query Parameters:**

- `email` (required): Church email address to check

**Response:**

```json
{
  "exists": true,
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-08T00:00:00.000Z"
}
```

**Status Values:**

- `PENDING` - Invitation sent but not claimed
- `CLAIMED` - Church has registered
- `EXPIRED` - Invitation has expired
- `CANCELLED` - Invitation was cancelled

### Validate Church Signup Token

**GET** `/api/church-signup/[token]`

Validate a church signup token and return invitation details.

**Path Parameters:**

- `token`: Church invitation ID

**Response:**

```json
{
  "valid": true,
  "invitation": {
    "id": "invitation_id",
    "inviterName": "John Doe",
    "inviterEmail": "john@example.com",
    "customMessage": "Welcome message",
    "churchEmail": "pastor@example.org",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `404` - Invalid or expired token
- `400` - Token already claimed

### Process Church Signup

**POST** `/api/church-signup/[token]`

Process church registration and application.

**Path Parameters:**

- `token`: Church invitation ID

**Request Body:**

```json
{
  "email": "pastor@example.org",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Pastor",
  "phone": "555-0123",
  "churchName": "Example Church",
  "leadPastorName": "John Pastor",
  "churchWebsite": "https://example.org",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345"
}
```

**Response:**

```json
{
  "success": true,
  "userId": "user_id",
  "churchId": "church_id",
  "message": "Church application submitted successfully"
}
```

## User Invitation Endpoints

### Generate QR Code

**GET** `/api/invite/qr-code`

Generate a QR code for the authenticated user (verified church members only).

**Response:**

```json
{
  "success": true,
  "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "inviteCode": "UNIQUE_CODE_123",
  "inviteUrl": "https://yourdomain.com/register/UNIQUE_CODE_123"
}
```

**Error Responses:**

- `401` - Authentication required
- `403` - User not eligible (not verified church member)

### Get User Invitation Analytics

**GET** `/api/invite/analytics`

Get invitation analytics for the authenticated user.

**Response:**

```json
{
  "analytics": {
    "churchInvitesSent": 5,
    "userInvitesSent": 10,
    "userInvitesScanned": 25,
    "userInvitesCompleted": 8
  },
  "inviteCode": {
    "code": "UNIQUE_CODE_123",
    "scans": 25,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastScannedAt": "2024-01-15T10:30:00.000Z"
  },
  "invitees": [
    {
      "id": "user_id",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

### Validate Invite Code

**GET** `/api/invite-code/[code]`

Validate an invite code and return inviter information.

**Path Parameters:**

- `code`: Invite code to validate

**Response:**

```json
{
  "valid": true,
  "inviter": {
    "name": "John Doe",
    "email": "john@example.com",
    "church": "Example Church"
  },
  "inviteCode": "UNIQUE_CODE_123"
}
```

**Error Responses:**

- `404` - Invalid invite code

## Admin Analytics Endpoints

### Get Invitation Analytics

**GET** `/api/admin/analytics/invitations`

Get paginated invitation data for admin dashboard (Admin only).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 15)
- `type` (optional): 'church' or 'user' (default: 'church')
- `status[]` (optional): Filter by status (multiple values allowed)
- `churchId` (optional): Filter by church ID
- `dateRange` (optional): '7d', '30d', '90d', 'all'

**Response:**

```json
{
  "invitations": [
    {
      "id": "invitation_id",
      "type": "church",
      "inviterName": "John Doe",
      "inviterEmail": "john@example.com",
      "recipientEmail": "pastor@example.org",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-08T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "totalItems": 100,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Admin Leaderboard

**GET** `/api/admin/analytics/leaderboard`

Get system-wide invitation leaderboard (Admin only).

**Response:**

```json
{
  "topConverters": [
    {
      "userId": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "church": "Example Church",
      "invitesSent": 20,
      "invitesScanned": 50,
      "invitesCompleted": 15,
      "conversionRate": 30.0
    }
  ],
  "topScanners": [
    {
      "userId": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "church": "Another Church",
      "totalScans": 75,
      "invitesSent": 25
    }
  ],
  "churchStats": [
    {
      "churchId": "church_id",
      "churchName": "Example Church",
      "totalMembers": 25,
      "totalScans": 150,
      "totalConversions": 35,
      "conversionRate": 23.3
    }
  ]
}
```

### Expire Invitation

**POST** `/api/admin/analytics/invitations/[id]/expire`

Expire a specific invitation (Admin only).

**Path Parameters:**

- `id`: Invitation ID

**Request Body:**

```json
{
  "type": "church"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Invitation expired successfully"
}
```

### Delete Invitation

**DELETE** `/api/admin/analytics/invitations/[id]?type=church`

Delete a specific invitation (Admin only).

**Path Parameters:**

- `id`: Invitation ID

**Query Parameters:**

- `type`: 'church' or 'user'

**Response:**

```json
{
  "success": true,
  "message": "Invitation deleted successfully"
}
```

### Resend Invitation

**POST** `/api/admin/analytics/invitations/[id]/resend`

Resend a church invitation (Admin only).

**Path Parameters:**

- `id`: Invitation ID

**Request Body:**

```json
{
  "type": "church"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Invitation resent successfully"
}
```

## Church Analytics Endpoints

### Get Church Invitation Data

**GET** `/api/church/analytics/invitations`

Get invitation data scoped to the authenticated church (Church role only).

**Query Parameters:**
Same as admin endpoint but automatically scoped to church members.

**Response:**
Same structure as admin endpoint but filtered to church members only.

### Get Church Leaderboard

**GET** `/api/church/analytics/leaderboard`

Get church member invitation leaderboard (Church role only).

**Response:**

```json
{
  "memberStats": [
    {
      "userId": "user_id",
      "memberName": "John Doe",
      "email": "john@example.com",
      "churchInvitesSent": 5,
      "userInvitesSent": 10,
      "userInvitesScanned": 25,
      "userInvitesCompleted": 8,
      "conversionRate": 32.0
    }
  ],
  "churchWideStats": {
    "totalChurchInvitations": 25,
    "totalUserInvitations": 100,
    "totalScans": 300,
    "totalConversions": 75,
    "churchConversionRate": 25.0
  }
}
```

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "details": "Optional additional details"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors, invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side error)

## Rate Limiting

Invitation endpoints are rate-limited to prevent abuse:

- **Church Invitations**: 10 per hour per user
- **QR Code Generation**: 5 per minute per user
- **Email Resending**: 3 per hour per invitation

## Webhook Events

Future enhancement: Webhook support for invitation events.

```json
{
  "event": "invitation.claimed",
  "data": {
    "invitationId": "invitation_id",
    "type": "church",
    "claimedAt": "2024-01-01T00:00:00.000Z",
    "claimedBy": "user_id"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Church invitation
async function sendChurchInvitation(email: string, message?: string) {
  const response = await fetch("/api/church-invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ churchEmail: email, customMessage: message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send invitation");
  }

  return response.json();
}

// Generate QR code
async function generateQRCode() {
  const response = await fetch("/api/invite/qr-code");

  if (!response.ok) {
    throw new Error("Failed to generate QR code");
  }

  return response.json();
}
```

## Testing

All endpoints include comprehensive test coverage. See `/tests/api/` for test files.

```bash
# Run API tests
npm test -- --testPathPattern=api

# Run specific invitation tests
npm test -- --testPathPattern=invitations
```

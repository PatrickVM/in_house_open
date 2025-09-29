# InHouse Connect - Mobile App Phase 1 Scope

## Project Overview

**App Name:** InHouse Connect
**Platform:** React Native (iOS & Android)
**Target:** Mobile companion to InHouse web application
**Focus:** Community connection through profile management, church directory, and member pinging

---

## Phase 1: Core Infrastructure & Essential Features

### **Phase 1 Goals**
Build foundational mobile app infrastructure with essential features that enable users to:
1. Authenticate and manage their profile
2. Join and view their church directory
3. Connect with church members via ping system

### **What's INCLUDED in Phase 1**
✅ Mobile-specific authentication endpoints
✅ User login and registration
✅ Profile viewing and editing (full feature parity with web)
✅ Church selection and membership request
✅ Church directory with member search
✅ Ping system (send, accept, reject pings)
✅ Contact info visibility after ping acceptance
✅ Basic error handling and loading states
✅ Offline data caching (view cached data)
✅ Pull-to-refresh functionality

### **What's DEFERRED to Phase 2**
⏸️ Push notifications (FCM setup)
⏸️ QR code generation and sharing
⏸️ QR code scanning for invitations
⏸️ Church invitation flow
⏸️ Biometric authentication (Face ID/Touch ID)
⏸️ Deep linking for invite codes

### **What's DEFERRED to Phase 3**
⏸️ Analytics integration (Firebase Analytics, Mixpanel)
⏸️ Daily messages from churches
⏸️ User-generated content sharing (testimonies, prayer requests)
⏸️ Advanced offline mode (queue actions when offline)
⏸️ In-app messaging system

---

## Technical Architecture

### **Technology Stack**

**Frontend (Mobile):**
```
React Native (Expo SDK 52+)
├── Navigation: React Navigation 7
├── State Management: React Context + TanStack Query v5
├── Forms: React Hook Form + Zod
├── UI Library: React Native Paper (Material Design)
├── Styling: StyleSheet + theme system (extracted from web)
├── HTTP Client: Axios
├── Storage:
│   ├── Expo SecureStore (authentication tokens)
│   └── AsyncStorage (cache, preferences)
├── Icons: lucide-react-native
└── Testing: Jest + React Native Testing Library
```

**Backend (API):**
```
Existing Next.js 15 API + New Mobile Endpoints
├── Production URL: https://in-house.tech
├── New Auth Endpoints: /api/mobile/auth/* (ISOLATED - won't affect web)
├── New Directory Endpoint: /api/directory/members
├── Reuse: Profile, Ping, Church APIs (add JWT auth)
└── Database: Existing PostgreSQL + Prisma
```

**Repository Structure:**
```
Web App (Existing): PatrickVM/in_house_open
├── inhouse_app/ (unchanged)
└── Deployment: Vercel (automatic)

Mobile App (New): PatrickVM/inhouse-mobile
├── src/
├── app.json
└── Deployment: EAS Build (Phase 2)
```

**Development Tools:**
```
├── API Access: Production (https://in-house.tech)
├── Version Control: Git (separate repositories)
├── iOS Development: Xcode + iOS Simulator
├── Code Sharing: Manual copy of TypeScript types
└── Type Safety: TypeScript
```

---

## Authentication Strategy

### **Implementation Approach**
**Decision:** Create mobile-specific authentication endpoints

**Why?**
- NextAuth.js is web-only (session cookies don't work in mobile)
- Cleaner separation of concerns
- JWT-based auth is mobile-standard
- Easier to debug and maintain

### **New Backend Endpoints Required**

#### 1. Mobile Login
```typescript
POST /api/mobile/auth/login
Request: { email: string, password: string }
Response: {
  token: string,           // JWT token
  refreshToken: string,    // For token refresh
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    churchMembershipStatus: ChurchMembershipStatus
  }
}
```

#### 2. Mobile Registration
```typescript
POST /api/mobile/auth/register
Request: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  inviteCode?: string  // Optional invite code
}
Response: {
  token: string,
  refreshToken: string,
  user: User
}
```

#### 3. Token Refresh
```typescript
POST /api/mobile/auth/refresh
Request: { refreshToken: string }
Response: {
  token: string,
  refreshToken: string
}
```

#### 4. Get Current User
```typescript
GET /api/mobile/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }
```

#### 5. Logout
```typescript
POST /api/mobile/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### **Token Storage**
- **JWT Access Token:** Stored in `expo-secure-store` (encrypted, secure)
- **Refresh Token:** Stored in `expo-secure-store`
- **Token Expiry:** 7 days (access), 30 days (refresh)

### **API Request Flow**
```typescript
// All authenticated requests include:
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}

// On 401 Unauthorized:
// 1. Attempt token refresh with refreshToken
// 2. If refresh succeeds, retry original request
// 3. If refresh fails, redirect to login
```

---

## API Access During Development

### **Solution: Production API (https://in-house.tech)**

**Why This Works Perfectly:**
- ✅ Already deployed and accessible
- ✅ HTTPS secure by default
- ✅ Works from any device, any network
- ✅ No VPN or networking setup needed
- ✅ Real production environment for testing

**Configuration:**
```typescript
// Mobile app config: src/config/api.ts
export const API_BASE_URL = 'https://in-house.tech';

// All API calls:
// https://in-house.tech/api/mobile/auth/login
// https://in-house.tech/api/users/profile
// https://in-house.tech/api/directory/members
// etc.
```

**Development Flow:**
1. Start Expo dev server: `npx expo start`
2. Press `i` for iOS Simulator (Mac)
3. Mobile app calls production API
4. Hot reload for instant updates
5. Test on physical device with Expo Go (optional)

---

## Backend Changes Required

### **1. New API Routes to Create**

#### `/api/mobile/auth/*` (5 endpoints)
- Login, Register, Refresh, Me, Logout
- JWT generation and validation logic
- Password hashing with bcryptjs (reuse existing)

#### `/api/directory/members`
```typescript
GET /api/directory/members
Headers: { Authorization: Bearer <token> }

Response: {
  isVerifiedMember: boolean,
  churchId: string | null,
  churchName: string,
  churchMembershipStatus: ChurchMembershipStatus,
  members: User[],  // Same church members if verified
  totalMembers: number
}

// Logic moved from app/directory/page.tsx server-side
```

### **2. JWT Middleware**
Create `/lib/mobile-auth.ts`:
- JWT generation (jsonwebtoken library)
- JWT verification middleware
- Token refresh logic
- Extract user from token

### **3. Database Changes**
**New Table: RefreshToken**
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### **4. Existing APIs to Reuse**

**Profile:**
- ✅ `GET /api/users/profile` - Fetch profile
- ✅ `PUT /api/users/profile` - Update profile
- ✅ `DELETE /api/users/profile` - Delete account

**Churches:**
- ✅ `GET /api/churches/approved` - List churches for selection
- ✅ `POST /api/churches/join-request` - Request church membership
- ✅ `GET /api/churches/member-requests` - Check verification status

**Ping:**
- ✅ `POST /api/ping/send` - Send ping
- ✅ `POST /api/ping/respond` - Accept/reject ping
- ✅ `GET /api/ping/status` - Check ping status with user
- ✅ `GET /api/ping/count` - Get pending ping count
- ✅ `GET /api/ping/pending` - List pending pings

**All existing endpoints need:** JWT middleware added to validate Bearer token instead of NextAuth session.

---

## Mobile App Structure

### **Project Structure**
```
inhouse-mobile/
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
│
├── src/
│   ├── api/                      # API layer
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── auth.ts               # Auth API calls
│   │   ├── profile.ts            # Profile API calls
│   │   ├── directory.ts          # Directory API calls
│   │   ├── ping.ts               # Ping API calls
│   │   └── church.ts             # Church API calls
│   │
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx   # Profile editing form
│   │   │   └── ProfileHeader.tsx # Profile display component
│   │   │
│   │   ├── directory/
│   │   │   ├── MemberCard.tsx    # Similar to web UserCard
│   │   │   ├── DirectorySearch.tsx
│   │   │   └── EmptyDirectory.tsx
│   │   │
│   │   └── ping/
│   │       ├── PingButton.tsx    # Send/respond to pings
│   │       └── PingStatusBadge.tsx
│   │
│   ├── screens/                  # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx      # View profile
│   │   │   ├── EditProfileScreen.tsx  # Edit profile
│   │   │   └── ChurchSelectionScreen.tsx
│   │   │
│   │   ├── directory/
│   │   │   ├── DirectoryScreen.tsx    # Main directory
│   │   │   └── MemberDetailScreen.tsx # Member profile
│   │   │
│   │   └── ping/
│   │       └── PingListScreen.tsx     # List of pending pings
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx      # Root navigator
│   │   ├── AuthStack.tsx         # Auth flow screens
│   │   └── MainTabs.tsx          # Bottom tab navigation
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Auth context + operations
│   │   ├── useProfile.ts         # Profile queries (React Query)
│   │   ├── useDirectory.ts       # Directory queries
│   │   ├── usePing.ts            # Ping operations
│   │   └── useChurches.ts        # Church queries
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # Global auth state
│   │
│   ├── utils/
│   │   ├── storage.ts            # SecureStore wrapper
│   │   ├── validation.ts         # Zod schemas (from web)
│   │   ├── constants.ts          # App constants
│   │   └── formatters.ts         # Date, phone formatting
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript types (from web)
│   │
│   └── theme/
│       ├── colors.ts             # Color palette
│       ├── spacing.ts            # Spacing constants
│       └── typography.ts         # Font styles
│
├── assets/                       # Images, fonts
│   ├── images/
│   └── fonts/
│
└── app/                          # Expo Router (optional)
    └── index.tsx
```

---

## Feature Specifications

### **1. Authentication Flow**

#### Login Screen
**UI Elements:**
- Email input (with keyboard type: email)
- Password input (with secure entry)
- "Login" button
- "Don't have an account? Register" link
- Error message display
- Loading state

**Validation:**
- Email: Valid email format
- Password: Minimum 8 characters

**Flow:**
1. User enters email + password
2. Tap "Login" button
3. Show loading spinner
4. Call `POST /api/mobile/auth/login`
5. On success:
   - Store JWT + refresh token in SecureStore
   - Set axios auth header
   - Navigate to MainTabs
6. On error:
   - Show error message ("Invalid credentials", "Account disabled")
   - If account disabled, show reason

#### Register Screen
**UI Elements:**
- First name input
- Last name input
- Email input
- Password input
- Confirm password input
- "Create Account" button
- "Already have an account? Login" link
- Terms of service checkbox (optional)

**Validation:**
- All fields required
- Email: Valid format
- Password: Min 8 chars, 1 uppercase, 1 number
- Confirm password: Must match

**Flow:**
1. User fills form
2. Tap "Create Account"
3. Show loading
4. Call `POST /api/mobile/auth/register`
5. On success:
   - Store tokens
   - Navigate to profile setup
6. On error:
   - Show error ("Email already exists")

---

### **2. Profile Management**

#### Profile Screen (View Mode)
**Sections:**
1. **Header:**
   - User initials avatar (colored circle)
   - Full name
   - Email
   - Church name (if member)
   - Church membership status badge

2. **Personal Info:**
   - Bio
   - Services/Skills (comma-separated)
   - Phone number (if provided)

3. **Location:**
   - Address
   - City, State ZIP

4. **Church Status Card:**
   - If NONE: "Not connected to a church" + "Find Church" button
   - If REQUESTED: "Verification pending" + status icon
   - If VERIFIED: Church name + verified checkmark

5. **Actions:**
   - "Edit Profile" button (primary)
   - "Logout" button (secondary)

#### Edit Profile Screen
**Form Fields:**
- First Name (required)
- Last Name (required)
- Bio (textarea, 500 chars max)
- Services/Skills (text input)
- Phone Number (phone keyboard)
- Address (text input)
- City (text input)
- State (text input)
- ZIP Code (numeric keyboard)

**Church Selection:**
- Dropdown: List of approved churches
- Option: "Other (not listed)"
- If "Other": Show church name + website fields

**Actions:**
- "Save Changes" button
- "Cancel" button
- "Delete Account" (danger zone at bottom)

**Validation:**
- Reuse Zod schema from web ProfileForm
- Show inline error messages

**Flow:**
1. Fetch user profile + church list on mount
2. Pre-fill form with current data
3. User edits fields
4. Tap "Save Changes"
5. Show loading
6. Call `PUT /api/users/profile`
7. On success:
   - Show success toast
   - Invalidate profile query (React Query)
   - Navigate back to Profile screen
8. On error:
   - Show error message

#### Church Selection Flow
**If user selects a church from dropdown:**
1. Save church selection in form
2. On "Save Changes", call `POST /api/churches/join-request`
3. Show message: "Church verification request submitted"
4. churchMembershipStatus = REQUESTED

**If user selects "Other":**
1. Show churchName + churchWebsite fields
2. Save as manual entry (not linked to church)

---

### **3. Church Directory**

#### Directory Screen
**States:**

**A. Not Verified Member:**
- Show empty state
- Icon: Church building
- Message: "Join a Church Community"
- Description: "To access the community directory, you need to be a verified member of a church."
- Button: "Find Churches" → Navigate to church selection

**B. Verified Member (No Members Yet):**
- Show empty state
- Icon: Users
- Message: "No members found"
- Description: "Be the first to complete your profile and appear in the {ChurchName} directory!"
- Button: "Complete Your Profile"

**C. Verified Member (Has Members):**

**Header:**
- Title: "{ChurchName} Directory"
- Subtitle: "X verified members"

**Search Bar:**
- Placeholder: "Search by name or service..."
- Search icon on left
- Clear button (X) on right when text entered
- Search in: name, services, bio
- Debounced search (300ms delay)

**Member List:**
- ScrollView with pull-to-refresh
- Each member shown as MemberCard component

**MemberCard Component:**
```
┌─────────────────────────────┐
│ [JD] John Doe               │ ← Initials avatar + name
│ Carpentry, Plumbing         │ ← Services
│ Anytown, CA                 │ ← Location
│                             │
│ [Ping Status Badge/Button]  │ ← Dynamic ping UI
└─────────────────────────────┘
```

**Ping Integration:**
- If no ping: Show "Send Ping" button
- If ping sent: Show "Ping Sent" badge
- If ping received from this user: Show "Accept" / "Decline" buttons
- If ping accepted: Show "Connected" badge + contact info

**Contact Info Visibility:**
- **Before ping acceptance:** Phone/email hidden
- **After ping acceptance:** Phone/email visible, tappable
  - Tap phone → Open phone dialer
  - Tap email → Open email client

**Performance:**
- Virtual list for large directories (FlatList)
- Cache member list with React Query
- Refresh on pull-to-refresh gesture

---

### **4. Ping System**

#### Ping Status Flow

**State 1: No Ping Relationship**
- UI: "Send Ping" button
- Action: Tap button → Call `POST /api/ping/send`
- Result: Button changes to "Ping Sent" badge

**State 2: Ping Sent (Pending)**
- UI: "Ping Sent" badge (blue, with clock icon)
- Action: None (waiting for recipient)
- Auto-expires after 7 days

**State 3: Ping Received (Pending)**
- UI: "Ping Received" badge (orange) + Two buttons
  - "Accept" button (green)
  - "Decline" button (red)
- Action: Tap button → Call `POST /api/ping/respond`
- Result:
  - Accept → Show "Connected" badge + reveal contact info
  - Decline → Remove ping, back to "Send Ping" button

**State 4: Ping Accepted (Connected)**
- UI: "Connected" badge (green, with checkmark)
- Contact Info: Phone + email visible and tappable
- Action: Tap phone/email → Open native app

**State 5: Ping Rejected**
- UI: Back to "Send Ping" button
- User can send again after cooldown (24 hours)

#### Ping List Screen (Optional)
Shows all pending pings in one place:
- Tab badge on directory tab shows count
- Dedicated screen to view all pending pings
- Filter by: Sent, Received
- Swipe actions: Accept, Decline

---

### **5. Church Membership Request Flow**

#### From Profile Edit Screen
**When user selects a church:**
1. User saves profile with church selected
2. Backend checks if church requires verification
3. If yes:
   - Create ChurchVerificationRequest (status: PENDING)
   - Update user.churchMembershipStatus = REQUESTED
   - Return success with `verificationRequested: true`
4. Mobile shows toast: "Church verification request submitted"

#### Status Tracking
**User can check status in Profile screen:**
- Badge: "Verification Pending" (yellow)
- Check via: `GET /api/churches/member-requests` (existing endpoint)

**When verification approved (by church members on web):**
- churchMembershipStatus → VERIFIED
- User can now access directory
- Refresh profile to see updated status

**Verification happens on web app** (not in mobile Phase 1)

---

## UI/UX Design Guidelines

### **Design Philosophy**
"Match web styling, enhance mobile UX where possible for innovative feel"

### **Visual Design**

**Color Palette** (from web):
```typescript
colors: {
  primary: '#your-primary-color',    // From web Tailwind config
  secondary: '#your-secondary-color',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: {
    primary: '#1a1a1a',
    secondary: '#6b7280',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}
```

**Typography:**
- Headings: Bold, similar to web
- Body: Regular weight
- Match font sizes to web (scaled for mobile)

**Spacing:**
- Use 4px grid system (like Tailwind)
- Consistent padding: 16px (containers), 12px (cards)

### **Mobile-Specific UX Enhancements**

**1. Gestures:**
- Pull-to-refresh on directory and profile screens
- Swipe-to-delete on ping list (Phase 2)

**2. Haptic Feedback:**
- Light haptic on button presses
- Success haptic on ping acceptance
- Error haptic on failed actions

**3. Loading States:**
- Skeleton screens for profile/directory loading
- Inline spinners for button actions
- Progress indicators for form submissions

**4. Empty States:**
- Illustrative icons
- Helpful messaging
- Clear call-to-action buttons

**5. Error Handling:**
- Toast notifications for errors (auto-dismiss after 4s)
- Inline validation errors on forms
- Retry buttons for failed network requests

**6. Animations:**
- Smooth screen transitions (300ms)
- Fade-in for cards
- Slide-up for modals
- Subtle button press animations

**7. Accessibility:**
- Minimum touch target: 44x44pt (iOS HIG)
- Proper contrast ratios (WCAG AA)
- Screen reader labels on all interactive elements
- Dynamic type support (font scaling)

**8. Offline Experience:**
- Show cached data when offline
- "You're offline" banner at top
- Disable actions that require network
- Queue actions for when online (Phase 2)

---

## Development Phases & Timeline

### **Phase 1.1: Foundation (Weeks 1-2)**

**Backend (Web Repo - ISOLATED changes):**
- [ ] Create `/api/mobile/auth/*` endpoints (5 routes) - NEW routes only
- [ ] Add RefreshToken model to Prisma schema - NEW table only
- [ ] Create JWT middleware (`/lib/mobile-auth.ts`) - NEW file only
- [ ] Add CORS middleware for mobile - NEW middleware config
- [ ] Create `/api/directory/members` endpoint - NEW route only
- [ ] Test all new endpoints with Postman
- [ ] **ZERO changes to existing web functionality**

**Mobile (New Repo: inhouse-mobile):**
- [ ] Create GitHub repository: `inhouse-mobile`
- [ ] Initialize Expo project (`npx create-expo-app`)
- [ ] Install dependencies (React Navigation, React Query, etc.)
- [ ] Set up project structure (folders, files)
- [ ] Configure TypeScript
- [ ] Create theme system (colors, spacing, typography)
- [ ] Copy TypeScript types from web repo
- [ ] Create API client with Axios + interceptors
- [ ] Configure API: `https://in-house.tech`

**Deliverables:**
- ✅ Mobile app runs on iOS Simulator
- ✅ Can call production API (https://in-house.tech)
- ✅ Auth endpoints functional
- ✅ Web app completely unaffected

---

### **Phase 1.2: Authentication (Week 3)**

**Mobile:**
- [ ] Create AuthContext + provider
- [ ] Build LoginScreen UI
- [ ] Build RegisterScreen UI
- [ ] Implement login flow with token storage
- [ ] Implement registration flow
- [ ] Add form validation (Zod)
- [ ] Create protected route wrapper
- [ ] Test auth flows end-to-end

**Deliverables:**
- ✅ Users can register new accounts
- ✅ Users can login with credentials
- ✅ Tokens stored securely
- ✅ Auto-login on app restart (if token valid)

---

### **Phase 1.3: Profile Management (Weeks 4-5)**

**Mobile:**
- [ ] Create ProfileScreen (view mode)
- [ ] Create EditProfileScreen with form
- [ ] Integrate church selection dropdown
- [ ] Implement profile update API call
- [ ] Add profile image avatar (initials-based)
- [ ] Church membership status display
- [ ] Add "Delete Account" functionality
- [ ] Add logout functionality
- [ ] Test profile flows

**Deliverables:**
- ✅ Users can view their profile
- ✅ Users can edit all profile fields
- ✅ Users can select/request church membership
- ✅ Profile updates sync with backend

---

### **Phase 1.4: Church Directory (Week 6)**

**Backend:**
- [ ] Ensure `/api/directory/members` returns correct data

**Mobile:**
- [ ] Create DirectoryScreen with states
- [ ] Build MemberCard component
- [ ] Implement search functionality
- [ ] Add pull-to-refresh
- [ ] Handle empty states (not verified, no members)
- [ ] Use FlatList for performance
- [ ] Implement React Query caching
- [ ] Test with large member lists

**Deliverables:**
- ✅ Verified users see church directory
- ✅ Search works by name/services
- ✅ Pull-to-refresh updates member list
- ✅ Empty states guide users correctly

---

### **Phase 1.5: Ping System (Week 7)**

**Backend:**
- [ ] Add JWT auth to ping API routes
- [ ] Test ping endpoints with Bearer token

**Mobile:**
- [ ] Create PingButton component with states
- [ ] Integrate ping status check (`GET /api/ping/status`)
- [ ] Implement send ping (`POST /api/ping/send`)
- [ ] Implement respond to ping (`POST /api/ping/respond`)
- [ ] Add contact info visibility logic
- [ ] Show phone/email as tappable links
- [ ] Add ping count badge (optional)
- [ ] Create PingListScreen (optional)
- [ ] Test ping flows end-to-end

**Deliverables:**
- ✅ Users can send pings to members
- ✅ Users can accept/decline received pings
- ✅ Contact info revealed after ping acceptance
- ✅ Phone/email tappable (opens native apps)

---

### **Phase 1.6: Polish & Testing (Week 8)**

**Tasks:**
- [ ] Add loading skeletons to all screens
- [ ] Implement error boundaries
- [ ] Add haptic feedback
- [ ] Improve animations/transitions
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Fix bugs from testing
- [ ] Optimize performance (FlatList, images)
- [ ] Add offline data caching
- [ ] Create app icon + splash screen
- [ ] Update app.json with metadata
- [ ] Prepare app store assets (screenshots, descriptions)

**Deliverables:**
- ✅ App feels polished and smooth
- ✅ All core features working on iOS + Android
- ✅ Bugs fixed
- ✅ Ready for app store submission (Phase 2)

---

## Testing Strategy

### **Manual Testing Checklist**

**Authentication:**
- [ ] Register new account (valid data)
- [ ] Register with existing email (should fail)
- [ ] Register with weak password (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Auto-login after app restart
- [ ] Logout and return to login screen

**Profile:**
- [ ] View profile with incomplete data
- [ ] Edit profile and save changes
- [ ] Select church from dropdown
- [ ] Submit church verification request
- [ ] Save profile with validation errors (should fail)
- [ ] Delete account (confirm deletion)

**Directory:**
- [ ] View directory as unverified user (empty state)
- [ ] View directory as verified user
- [ ] Search members by name
- [ ] Search members by service
- [ ] Clear search
- [ ] Pull to refresh directory

**Ping:**
- [ ] Send ping to member
- [ ] Receive ping (test with second account)
- [ ] Accept ping
- [ ] Decline ping
- [ ] View contact info after ping acceptance
- [ ] Tap phone number (opens dialer)
- [ ] Tap email (opens email client)

**Edge Cases:**
- [ ] Test with slow network (throttle)
- [ ] Test with no network (offline)
- [ ] Test with expired JWT token (should refresh)
- [ ] Test with invalid token (should logout)
- [ ] Test with account disabled (should show reason)

---

## Security Considerations

### **Token Security**
- ✅ JWT access token: 7 day expiry
- ✅ Refresh token: 30 day expiry
- ✅ Tokens stored in SecureStore (encrypted)
- ✅ Tokens not logged or exposed
- ✅ HTTPS only (enforce in production)

### **API Security**
- ✅ All authenticated endpoints require valid JWT
- ✅ JWT verification middleware checks signature
- ✅ User ID extracted from token (not request body)
- ✅ Rate limiting on auth endpoints (prevent brute force)
- ✅ CORS configured for mobile origin

### **Data Validation**
- ✅ All inputs validated server-side
- ✅ Zod schemas for form validation
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (sanitize inputs)

### **Privacy**
- ✅ Contact info hidden until ping acceptance
- ✅ Only verified church members see directory
- ✅ User can delete account (GDPR compliance)
- ✅ No tracking/analytics in Phase 1

---

## App Store Requirements

### **App Metadata**

**App Name:** InHouse Connect

**Bundle Identifier:**
- iOS: `com.inhouse.connect`
- Android: `com.inhouse.connect`

**Description (Short):**
"Connect with your church community through a private member directory."

**Description (Full):**
```
InHouse Connect helps you discover and connect with verified members of your church community.

FEATURES:
• Private church directory with verified members
• Search members by skills and services
• Connect with members via ping system
• Manage your profile and church membership
• Secure and private - only your church members can see you

Perfect for finding trusted service providers, connecting with fellow members, and building stronger church communities.
```

**Keywords:**
church, community, directory, members, connect, services, Christian, fellowship

**Category:** Social Networking (Primary), Lifestyle (Secondary)

**Age Rating:** 4+ (no objectionable content)

**Privacy Policy URL:** https://in-house.tech/privacy (Phase 2 - create before app store submission)

**Support URL:** https://in-house.tech/support (Phase 2 - create before app store submission)

### **App Store Assets Needed (Phase 2)**

**iOS:**
- App icon (1024x1024)
- Screenshots (6.5", 5.5", 12.9" iPad)
- Preview video (optional)

**Android:**
- Feature graphic (1024x500)
- Icon (512x512)
- Screenshots (phone, 7" tablet, 10" tablet)
- Promo video (optional)

### **Minimum OS Versions**
- **iOS:** 13.0+ (supports 95% of devices)
- **Android:** API 29 (Android 10+, supports 80% of devices)

---

## Phase 2 Preview (Post-Phase 1)

Once Phase 1 is complete and stable, Phase 2 will include:

**Phase 2 Features:**
- 🔔 Push notifications (FCM setup, ping alerts)
- 📱 QR code generation and sharing (invite codes)
- 📷 QR code scanning for registration
- 🔐 Biometric authentication (Face ID/Touch ID)
- 🔗 Deep linking (handle invite URLs)
- 🍎 App Store submission (iOS)
- 🤖 Google Play submission (Android)

**Phase 3 Features:**
- 📊 Analytics integration (Firebase Analytics)
- 💬 Daily messages from churches
- 📝 User-generated content (testimonies, prayers)
- 📴 Advanced offline mode (action queue)
- 🌙 Dark mode support

---

## Success Metrics

### **Phase 1 Completion Criteria**

**Functional:**
- ✅ Users can register and login from mobile
- ✅ Users can view and edit their complete profile
- ✅ Users can request church membership
- ✅ Verified users can view church directory
- ✅ Users can search directory by name/services
- ✅ Users can send and respond to pings
- ✅ Contact info revealed after ping acceptance
- ✅ All core features work on iOS and Android

**Technical:**
- ✅ Zero crashes in testing
- ✅ API response time < 500ms (local)
- ✅ App startup time < 3 seconds
- ✅ Smooth scrolling (60fps)
- ✅ Offline caching works

**Quality:**
- ✅ All manual tests pass
- ✅ No major UX issues
- ✅ Consistent styling across screens
- ✅ Error messages are clear and helpful

---

## Next Steps After Scope Approval

1. **Environment Setup:**
   - Set up Tailscale on dev machine + mobile device
   - Verify API accessible via Tailscale IP
   - Create Expo project
   - Configure TypeScript + dependencies

2. **Backend Development:**
   - Create mobile auth endpoints
   - Add JWT middleware
   - Update existing routes with JWT auth
   - Create directory members endpoint
   - Test all endpoints

3. **Mobile Development:**
   - Build authentication screens
   - Implement profile management
   - Build directory + search
   - Integrate ping system
   - Polish and test

4. **Testing & Iteration:**
   - Manual testing on real devices
   - Bug fixes
   - Performance optimization
   - Final polish

---

## Questions & Clarifications

Before starting implementation, confirm:

1. ✅ **Scope approved?** All features in Phase 1 agreed upon?
2. ✅ **Timeline realistic?** 8 weeks for Phase 1 completion?
3. ✅ **Tailscale setup?** Ready to install and configure?
4. ✅ **Backend changes?** Can modify Next.js API as needed?
5. ✅ **Design assets?** Need app icon/logo or create placeholder?
6. ✅ **Monorepo?** Keep mobile separate or integrate in existing repo?

---

## Document Version

**Version:** 1.0
**Date:** 2025-09-29
**Status:** Draft - Awaiting Approval
**Next Review:** After implementation start

---

**End of Phase 1 Scope Document**

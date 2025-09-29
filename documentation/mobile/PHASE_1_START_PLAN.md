# InHouse Connect Mobile - Phase 1 Start Plan

## 📋 Documentation Summary

All documentation is now finalized and ready for implementation:

### **Core Documents**
1. ✅ `MOBILE_APP_PHASE_1_SCOPE.md` - Complete feature scope (UPDATED)
2. ✅ `MOBILE_APP_ARCHITECTURE_DECISIONS.md` - Technical decisions
3. ✅ `BACKEND_SAFETY_GUARANTEE.md` - Web app protection guarantee

### **Key Decisions Confirmed**
- ✅ Production API: `https://in-house.tech`
- ✅ Repository: Separate (`PatrickVM/inhouse-mobile`)
- ✅ Platform: iOS first (Mac + Xcode)
- ✅ Timeline: 8 weeks for Phase 1
- ✅ Safety: Zero impact to web app (guaranteed)

---

## 🎯 Implementation Priority Discussion

Now that documentation is complete, let's discuss **where to start**:

---

## Option A: Backend First (Recommended)

### **Start with Backend Mobile Endpoints**

**Why Backend First:**
1. ✅ **Foundation** - Mobile app needs API to connect to
2. ✅ **Validation** - Can test endpoints before mobile code
3. ✅ **Parallel Work** - You work on backend, I guide mobile setup
4. ✅ **Safety** - Backend changes tested in isolation before mobile uses them
5. ✅ **No Blockers** - Mobile dev can start once endpoints exist

**Week 1 Backend Tasks (Estimated: 8-12 hours):**

**Day 1-2: Mobile Auth Endpoints (4-6 hours)**
```bash
# Create 5 new API routes:
app/api/mobile/auth/login/route.ts
app/api/mobile/auth/register/route.ts
app/api/mobile/auth/refresh/route.ts
app/api/mobile/auth/me/route.ts
app/api/mobile/auth/logout/route.ts

# Create JWT utility:
lib/mobile-auth.ts

# Install dependency:
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

**Day 3: Database Migration (2-3 hours)**
```bash
# Update Prisma schema:
# Add RefreshToken model

# Run migration:
npx prisma migrate dev --name add_refresh_tokens

# Deploy to production:
git push  # Vercel auto-deploys
npx prisma migrate deploy  # Run on production DB
```

**Day 4: CORS Middleware (1-2 hours)**
```bash
# Create or update:
middleware.ts

# Deploy:
git push
```

**Day 5: Test Everything (2-3 hours)**
```bash
# Test with Postman:
# - Login endpoint
# - Register endpoint
# - Token refresh
# - Get current user

# Verify web app:
# - Login still works
# - Profile still works
# - Directory still works
```

**Deliverable:**
- ✅ 5 mobile auth endpoints live at `https://in-house.tech/api/mobile/auth/*`
- ✅ JWT system working
- ✅ Web app untouched and working
- ✅ Ready for mobile app to connect

---

## Option B: Mobile Setup First

### **Start with Mobile Repository Setup**

**Why Mobile First:**
1. ✅ **Quick Win** - See app running in simulator fast
2. ✅ **Parallel Work** - Set up while backend is being built
3. ✅ **Validation** - Confirm Expo/React Native works on your Mac
4. ✅ **Momentum** - Visual progress motivates

**Week 1 Mobile Tasks (Estimated: 6-8 hours):**

**Day 1: Repository & Project Setup (2-3 hours)**
```bash
# 1. Create GitHub repo
# 2. Initialize Expo project
# 3. Set up folder structure
# 4. Install dependencies
# 5. Configure TypeScript
```

**Day 2-3: Theme & UI Foundation (3-4 hours)**
```bash
# 1. Create theme files (colors, spacing, etc.)
# 2. Build basic UI components (Button, Input, Card)
# 3. Set up navigation structure
# 4. Create empty screens
```

**Day 4: API Client Setup (1-2 hours)**
```bash
# 1. Create Axios client
# 2. Configure for https://in-house.tech
# 3. Add interceptors
# 4. Mock auth flow (until backend ready)
```

**Deliverable:**
- ✅ Mobile app running in iOS Simulator
- ✅ Navigation working
- ✅ Basic screens created
- ✅ Waiting for backend API to connect

**Downside:**
- ⚠️ Can't fully test login until backend is ready
- ⚠️ More mock code to write (then replace later)

---

## Option C: Parallel (Both Simultaneously)

### **You: Backend | Me: Mobile**

**Why Parallel:**
1. ✅ **Fastest** - Both workstreams moving
2. ✅ **Efficient** - No waiting on each other
3. ✅ **Team Approach** - Divide and conquer

**Week 1 Parallel Tasks:**

**You (Backend):**
- Days 1-2: Create mobile auth endpoints
- Day 3: Database migration
- Day 4: CORS middleware
- Day 5: Testing

**Me (Mobile):**
- Day 1: Repository setup + Expo init
- Day 2: Theme system + UI components
- Day 3: Navigation + screen structure
- Day 4: API client + mock auth
- Day 5: Integration testing (once backend ready)

**Deliverable:**
- ✅ Backend endpoints live
- ✅ Mobile app ready to connect
- ✅ Integration in Week 2

**Coordination Needed:**
- 🤝 Daily sync on progress
- 🤝 API contract agreement (request/response formats)
- 🤝 Clear handoff points

---

## My Recommendation: **Option A - Backend First**

### **Why I Recommend Backend First:**

1. **Clear Foundation**
   - Mobile app needs API to function
   - Building mobile without API = writing throw-away mock code
   - Backend first = mobile can build real features from day 1

2. **Safety First**
   - Backend changes tested in isolation
   - Web app safety verified before mobile touches it
   - Less risk of breaking production

3. **Efficient Development**
   - No context switching between backend/mobile
   - Each workstream completes fully before next
   - Cleaner code (no mocks to replace)

4. **Better Testing**
   - Backend endpoints tested with Postman
   - Mobile can test against real API immediately
   - Fewer integration issues

5. **Your Time Investment**
   - Backend: 8-12 hours (your time)
   - Mobile: 40+ hours (mostly my guidance)
   - Better to get your 8-12 hours done first

---

## Detailed Backend First Plan

### **Week 1: Backend Development**

#### **Task 1: Create Mobile Auth Endpoints (4-6 hours)**

**What to Create:**

**File 1: `lib/mobile-auth.ts`**
```typescript
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;
const JWT_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateJWT(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function generateRefreshToken(): string {
  return jwt.sign(
    { type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyJWT(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function validateMobileAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.substring(7);
  const payload = verifyJWT(token);

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  return user;
}
```

**File 2: `app/api/mobile/auth/login/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { generateJWT, generateRefreshToken } from '@/lib/mobile-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          error: 'Account disabled',
          reason: user.disabledReason || 'CHURCH_MEMBERSHIP_REQUIRED',
        },
        { status: 403 }
      );
    }

    // Generate tokens
    const token = generateJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();

    // Save refresh token
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Return response
    return NextResponse.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        churchId: user.churchId,
        churchMembershipStatus: user.churchMembershipStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Similar files for:**
- `register/route.ts`
- `refresh/route.ts`
- `me/route.ts`
- `logout/route.ts`

**I can provide full code for all files if you want to start with this task first.**

---

#### **Task 2: Database Migration (2-3 hours)**

**Update `prisma/schema.prisma`:**
```prisma
// Add to User model:
model User {
  // ... existing fields ...

  // Add new relation:
  refreshTokens RefreshToken[]
}

// Add new model:
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

**Run migration:**
```bash
npx prisma migrate dev --name add_refresh_tokens
npx prisma generate
```

---

#### **Task 3: CORS Middleware (1-2 hours)**

**Create or update `middleware.ts` in root:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apply CORS to all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // CORS headers for mobile
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

#### **Task 4: Test with Postman (2-3 hours)**

**Test Login:**
```bash
POST https://in-house.tech/api/mobile/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# Expected: 200 OK with token + user
```

**Test Protected Route:**
```bash
GET https://in-house.tech/api/users/profile
Authorization: Bearer <token_from_login>

# Expected: 200 OK with profile data
```

**Verify Web App Still Works:**
```bash
# Open browser:
https://in-house.tech/login
# Log in with web interface
# Verify it works normally
```

---

### **Week 2: Mobile Development Begins**

Once backend is ready, I'll guide you through:
1. Creating mobile repository
2. Setting up Expo project
3. Building login screen
4. Connecting to production API
5. Testing end-to-end authentication

---

## What Do You Think?

**Questions to Decide Next Steps:**

1. **Priority:** Do you agree with **Backend First** approach?

2. **Backend Work:** Are you comfortable creating the backend endpoints? (I can provide full code for all files)

3. **Timeline:** Can you dedicate 8-12 hours this week to backend work?

4. **Support Level:** Do you want:
   - **Option A:** Full code provided (copy/paste ready)
   - **Option B:** Guided implementation (I explain, you code)
   - **Option C:** Review only (you code, I review)

5. **Start Date:** When do you want to begin? (This week? Next week?)

---

## Next Steps Based on Your Answer

**If you choose Backend First:**
→ I'll create complete code for all backend files
→ You implement and test
→ Then we start mobile development

**If you choose Mobile First:**
→ I'll guide mobile repository setup
→ You create mobile project
→ Backend comes later

**If you choose Parallel:**
→ We coordinate on API contracts
→ Split work between backend/mobile
→ Integration testing together

**Let me know your preference, and we'll create the detailed implementation checklist!**

---

## Document Metadata

**Version:** 1.0
**Date:** 2025-09-29
**Status:** Ready for Decision
**Next Action:** Awaiting your priority decision

---

**End of Phase 1 Start Plan**
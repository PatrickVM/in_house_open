# InHouse Connect - Mobile App Architecture Decisions

## Document Purpose
This document analyzes architectural decisions for the InHouse Connect mobile app based on the existing Next.js web application deployment and infrastructure.

---

## 1. Public API Access - CONFIRMED ✅

### Your Production Environment

**Production URL:** `https://in-house.tech`
**Status:** ✅ Live and accessible
**API Base:** `https://in-house.tech/api`

**Current Configuration:**
- ✅ Vercel deployment (auto-deploy from GitHub)
- ✅ Custom domain configured
- ✅ HTTPS enabled
- ✅ Neon PostgreSQL (production database)
- ✅ GitHub repo: `PatrickVM/in_house_open`

### Mobile App API Configuration

**This is PERFECT for mobile development!**

```typescript
// src/config/api.ts
export const API_CONFIG = {
  // Production API (use for all development and production)
  BASE_URL: 'https://in-house.tech',

  // API endpoints will be:
  // https://in-house.tech/api/mobile/auth/login
  // https://in-house.tech/api/mobile/auth/register
  // https://in-house.tech/api/users/profile
  // https://in-house.tech/api/directory/members
  // etc.

  TIMEOUT: 30000, // 30 seconds
};

// Usage in API client
export const API_BASE_URL = API_CONFIG.BASE_URL;
```

### Why This is Ideal

✅ **Always accessible** - Works from any device, any network
✅ **HTTPS secure** - Encrypted connections by default
✅ **No VPN needed** - Tailscale not required
✅ **Stable URL** - Never changes (unlike ngrok)
✅ **Zero setup** - Already working, just use it
✅ **Real production data** - Same DB as web app
✅ **Fast** - Direct connection to Vercel edge network

### Development Flow

**iOS Simulator (Mac):**
```bash
# Start Expo dev server
npx expo start

# Press 'i' for iOS Simulator
# Mobile app calls: https://in-house.tech/api/*
# Works immediately - no configuration needed
```

**Physical Device (iPhone/Android):**
```bash
# Install Expo Go from App Store / Play Store
# Scan QR code from Expo dev server
# Mobile app calls: https://in-house.tech/api/*
# Works on any WiFi or cellular network
```

**No localhost issues, no networking complexity!** 🎉

---

## 2. Monorepo vs Separate Repository Analysis

### Your Current Setup

**Existing Infrastructure:**
- Single Next.js app in `inhouse_app/`
- Vercel deployment (automatic on push to main)
- No CI/CD pipelines (no `.github/workflows/`)
- pnpm package manager
- TypeScript + Prisma ORM
- Production domain: `https://in-house.tech`

### Option A: Monorepo with Turborepo

**Structure:**
```
inhouse_app/
├── apps/
│   ├── web/              # Move existing Next.js app here
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   └── mobile/           # New Expo/React Native app
│       ├── src/
│       ├── app.json
│       └── package.json
│
├── packages/
│   ├── shared-types/     # TypeScript interfaces
│   │   └── src/
│   │       ├── user.ts
│   │       ├── church.ts
│   │       ├── ping.ts
│   │       └── index.ts
│   │
│   ├── shared-validation/# Zod schemas
│   │   └── src/
│   │       ├── profile.ts
│   │       ├── auth.ts
│   │       └── index.ts
│   │
│   └── shared-utils/     # Common utilities
│       └── src/
│           ├── formatters.ts
│           └── index.ts
│
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # Workspace definition
└── package.json          # Root package.json
```

**Detailed Pros:**
✅ **Single Source of Truth** - Types defined once, used everywhere
✅ **Atomic Changes** - Update API endpoint + mobile client in one PR
✅ **Type Safety Guaranteed** - TypeScript catches API/client mismatches
✅ **Better Refactoring** - Change a type, see all affected files
✅ **Shared Code** - Zod validation schemas used in both web + mobile
✅ **Turborepo Caching** - Faster builds (only rebuild changed packages)
✅ **One Git Clone** - New developers get entire codebase
✅ **Easier Versioning** - Track web + mobile versions together
✅ **Better for Teams** - Clear code ownership with packages

**Detailed Cons:**
❌ **Migration Required** - Must restructure existing Next.js app
  - Move all files from root to `apps/web/`
  - Update import paths
  - Update Vercel configuration
  - **Risk:** Could break existing deployment
  - **Time:** 4-6 hours of careful work

❌ **Vercel Configuration Changes**
  - Update `vercel.json` to point to `apps/web`
  - Must specify root directory in Vercel dashboard
  - Test deployment thoroughly before merging

❌ **CI/CD Complexity**
  - Need separate workflows for web vs mobile
  - Must detect which app changed (path filters)
  - More complex GitHub Actions setup

❌ **Learning Curve**
  - Team must understand monorepo concepts
  - Workspace dependencies can be confusing
  - Troubleshooting is more complex

❌ **Larger Repo Size**
  - All apps/packages in one repo
  - Longer `git clone` times
  - More files to navigate

**CI/CD Required (If Choosing Monorepo):**
```yaml
# .github/workflows/deploy-web.yml
name: Deploy Web to Vercel
on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'
      - 'turbo.json'
      - 'pnpm-workspace.yaml'
jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm turbo build --filter=web
      # Vercel auto-deploys from this

# .github/workflows/build-mobile.yml
name: Build Mobile
on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - 'packages/**'
jobs:
  build-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm turbo build --filter=mobile
      # EAS Build for app stores (Phase 2)
```

**Estimated Setup Time:**
- Turborepo setup: 1 hour
- Move web app to apps/web: 2 hours
- Update Vercel config: 30 min
- Create shared packages: 2 hours
- Extract shared code: 1-2 hours
- Test everything: 1-2 hours
- **Total: 7-9 hours**

---

### Option B: Separate Repository (RECOMMENDED)

**Structure:**
```
# Existing repo: PatrickVM/in_house_open
inhouse_app/
├── app/
├── components/
├── lib/
├── prisma/
└── ... (all existing files stay exactly as-is)

# New repo: PatrickVM/inhouse-mobile
inhouse-mobile/
├── src/
│   ├── api/              # API client layer
│   ├── components/       # React Native components
│   ├── screens/          # App screens
│   ├── navigation/       # React Navigation
│   ├── hooks/            # React Query hooks
│   ├── contexts/         # React Context
│   ├── types/            # TypeScript types (copied from web)
│   ├── utils/            # Utilities
│   └── theme/            # Colors, spacing, typography
├── assets/               # Images, fonts
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

**Detailed Pros:**
✅ **Zero Risk to Production** - Web app completely untouched
✅ **Fast Start** - Create repo and begin coding in 15 minutes
✅ **Simple Mental Model** - Standard single-app repository
✅ **No Migration Work** - Web app stays exactly where it is
✅ **Independent Deployments** - Mobile releases don't affect web
✅ **Vercel Config Unchanged** - Current deployment keeps working
✅ **Easy Rollback** - Can delete mobile repo without affecting web
✅ **Clear Separation** - Web and mobile are completely independent
✅ **Smaller Clones** - Faster `git clone` for mobile-only work
✅ **No CI/CD Setup Needed** - Each repo is self-contained
✅ **Easier for Contractors** - Give mobile repo access only if needed

**Detailed Cons:**
❌ **Code Duplication**
  - TypeScript types copied from web to mobile
  - Zod schemas duplicated
  - Utility functions may be duplicated

❌ **Manual Synchronization**
  - When API changes, must manually update mobile types
  - Risk of types drifting out of sync
  - Requires discipline to keep in sync

❌ **Multiple Pull Requests**
  - API change: PR in web repo
  - Mobile update: PR in mobile repo
  - Must coordinate across 2 repos

❌ **More Context Switching**
  - Switch repos to work on different parts
  - Two terminals, two IDE windows
  - More git remotes to manage

❌ **No Shared Packages**
  - Can't easily extract common code
  - Harder to reuse complex logic

**Code Sharing Strategy:**
```typescript
// Web repo: types/mobile-api.ts
// Export mobile-friendly types
export interface MobileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  churchId: string | null;
  churchMembershipStatus: ChurchMembershipStatus;
}

export interface MobilePing {
  id: string;
  senderId: string;
  receiverId: string;
  status: PingStatus;
  createdAt: Date;
}

// Mobile repo: src/types/api.ts
// ⚠️ COPIED FROM WEB REPO - Keep in sync!
// Last synced: 2025-09-29
// Source: web repo types/mobile-api.ts
export interface MobileUser {
  // ... (paste from web)
}
```

**Sync Process:**
1. When API changes in web repo, update types/mobile-api.ts
2. Copy to mobile repo src/types/api.ts
3. Update "Last synced" comment with date
4. Commit to mobile repo
5. (Future: Automate with GitHub Actions to alert on changes)

**Estimated Setup Time:**
- Create GitHub repo: 5 min
- Initialize Expo project: 10 min
- Copy shared types: 5 min
- Set up project structure: 10 min
- **Total: 30 minutes**

---

### Comparison Matrix

| Factor | Monorepo | Separate | Winner |
|--------|----------|----------|--------|
| **Time to Start** | 7-9 hours | 30 minutes | **Separate** 🏆 |
| **Risk to Web App** | ⚠️ Medium (requires migration) | ✅ Zero | **Separate** 🏆 |
| **Type Safety** | ✅ Always in sync | ⚠️ Manual sync required | **Monorepo** |
| **Code Sharing** | ✅ Automatic | ❌ Manual copy | **Monorepo** |
| **Refactoring** | ✅ Cross-app updates | ❌ Update each separately | **Monorepo** |
| **Deployment** | ⚠️ Needs reconfiguration | ✅ Web unchanged | **Separate** 🏆 |
| **CI/CD Setup** | ⚠️ Complex (must create) | ✅ None needed | **Separate** 🏆 |
| **Team Onboarding** | ❌ More complex | ✅ Simple | **Separate** 🏆 |
| **Long-term Maintenance** | ✅ Easier with scale | ⚠️ More manual work | **Monorepo** |
| **Production Stability** | ⚠️ Risk during migration | ✅ No risk | **Separate** 🏆 |

**Score: Separate (7) vs Monorepo (2)**

---

### Final Recommendation: **Separate Repository**

**Primary Reasons:**
1. ⚡ **Speed** - Start building today, not next week
2. 🛡️ **Safety** - Zero risk to production web app at `https://in-house.tech`
3. 🎯 **Focus** - Phase 1 goal is mobile app, not repo restructuring
4. ✅ **Simplicity** - No CI/CD needed, no complex setup

**When to Reconsider Monorepo:**
- Phase 2 or Phase 3 (after mobile is stable)
- When you have time for proper migration
- When you set up CI/CD for both apps
- When code duplication becomes painful
- When you have multiple mobile developers

**Migration Path (Future):**
```
Phase 1 (Now): Separate repos → Get mobile working
Phase 2-3: Mobile is stable, proven, generating value
Phase 4: Evaluate if monorepo is worth migration effort
  - If yes: Migrate both apps to monorepo
  - If no: Keep separate (it's working!)
```

---

## 3. Development Environment Setup (Mac)

### Your Mac Setup - Optimal for React Native

**What You Have:**
✅ Mac computer (best for React Native development)
✅ Can develop for **both** iOS and Android
✅ Production API at `https://in-house.tech` (ready to use)

### Required Software

**1. Xcode (for iOS development)**
```bash
# Install from Mac App Store (free)
# Or download from: https://developer.apple.com/xcode/

# After installation, install command line tools:
xcode-select --install

# Open Xcode once to accept license:
sudo xcodebuild -license accept

# Verify iOS Simulator is available:
xcrun simctl list devices
```

**2. Expo CLI**
```bash
# Install globally:
npm install -g expo-cli

# Or use with npx (recommended):
npx expo --version
```

**3. Android Studio (for Android development - optional for Phase 1)**
```bash
# Download from: https://developer.android.com/studio
# Install Android SDK
# Set up Android Emulator

# (Can focus on iOS first, add Android testing later)
```

### Do You Need Tailscale? **NO ❌**

**Why Not:**
✅ You have `https://in-house.tech` (public, accessible everywhere)
✅ Mac can run iOS Simulator (works with production API)
✅ Physical devices can access production API directly
✅ No need for VPN or local networking

**Tailscale Would Only Be Needed If:**
- ❌ You only had localhost API (you don't)
- ❌ You needed to test local code before deploying (can still deploy)
- ❌ You were working offline (rare for API-dependent app)

### Development Workflow

**Daily Development (Recommended):**
```bash
# Terminal 1: Start Expo dev server
cd inhouse-mobile
npx expo start

# Press 'i' to open iOS Simulator
# App loads and calls: https://in-house.tech/api/*

# Make changes to code → Hot reload updates instantly
# All API calls go to production → Real data, real responses
```

**Physical Device Testing (iPhone):**
```bash
# 1. Install "Expo Go" from App Store (free)
# 2. Run: npx expo start
# 3. Scan QR code with Camera app
# 4. App opens in Expo Go
# 5. Works on WiFi or cellular data
```

**Physical Device Testing (Android):**
```bash
# Same as iOS but from Play Store
# Works identically
```

**Optional: Test with Local API Changes**
```bash
# Rarely needed, but if you want to test API changes before deploying:

# 1. Get your Mac's IP address:
ipconfig getifaddr en0
# Example output: 192.168.1.100

# 2. Update mobile config temporarily:
const API_BASE_URL = 'http://192.168.1.100:3000';

# 3. Ensure iPhone is on same WiFi network
# 4. Test local changes
# 5. Revert to production URL before committing
```

**Recommendation:** Use production API 99% of the time. It's simpler and matches real environment.

---

## 4. Color Scheme & Theme Extraction

### Your Web App Theme (from Tailwind Config)

**Extracted from `tailwind.config.ts` and `app/globals.css`:**

**Light Mode (Primary Theme):**
```css
/* From globals.css :root */
--background: 0 0% 100%;        /* #ffffff - White background */
--foreground: 0 0% 3.9%;        /* #0a0a0a - Almost black text */

--primary: 0 0% 9%;             /* #171717 - Dark gray (main brand) */
--primary-foreground: 0 0% 98%; /* #fafafa - Light text on primary */

--secondary: 0 0% 96.1%;        /* #f5f5f5 - Light gray */
--secondary-foreground: 0 0% 9%;/* #171717 - Dark text on secondary */

--muted: 0 0% 96.1%;            /* #f5f5f5 - Muted backgrounds */
--muted-foreground: 0 0% 45.1%; /* #737373 - Muted text (gray) */

--destructive: 0 84.2% 60.2%;   /* #ef4444 - Red (errors, delete) */
--border: 0 0% 89.8%;           /* #e5e5e5 - Border color */
--radius: 0.5rem;               /* 8px - Border radius */
```

**Status Colors (from components/ping/PingButton.tsx and badges):**
```typescript
success: '#10b981',  // Green - Connected, success states
warning: '#f59e0b',  // Orange - Pending, warnings
error: '#ef4444',    // Red - Errors, destructive actions
info: '#3b82f6',     // Blue - Info, pending sent
```

### Mobile Theme Implementation

**Create: `src/theme/colors.ts`**
```typescript
/**
 * InHouse Connect Mobile Theme
 * Matches web app (https://in-house.tech) styling
 */

export const colors = {
  // Backgrounds
  background: '#ffffff',    // Main app background
  surface: '#f5f5f5',       // Card backgrounds
  card: '#ffffff',          // Elevated card surfaces

  // Text
  text: {
    primary: '#0a0a0a',     // Main text color
    secondary: '#737373',   // Secondary/muted text
    disabled: '#a3a3a3',    // Disabled text
    inverse: '#fafafa',     // Text on dark backgrounds
  },

  // Primary Brand Color (Dark Gray/Black)
  primary: {
    main: '#171717',        // Primary buttons, headers
    light: '#525252',       // Hover/pressed state
    dark: '#0a0a0a',        // Very dark variant
    contrast: '#fafafa',    // Text color on primary
  },

  // Secondary (Light Gray)
  secondary: {
    main: '#f5f5f5',        // Secondary buttons
    dark: '#e5e5e5',        // Border color
    contrast: '#171717',    // Text on secondary
  },

  // Status Colors
  success: {
    main: '#10b981',        // Green - ping accepted, success
    light: '#d1fae5',       // Light green background
    dark: '#059669',        // Dark green
    contrast: '#ffffff',    // Text on success
  },

  error: {
    main: '#ef4444',        // Red - errors, delete
    light: '#fee2e2',       // Light red background
    dark: '#dc2626',        // Dark red
    contrast: '#ffffff',    // Text on error
  },

  warning: {
    main: '#f59e0b',        // Orange - pending, warnings
    light: '#fef3c7',       // Light orange background
    dark: '#d97706',        // Dark orange
    contrast: '#ffffff',    // Text on warning
  },

  info: {
    main: '#3b82f6',        // Blue - ping sent, info
    light: '#dbeafe',       // Light blue background
    dark: '#2563eb',        // Dark blue
    contrast: '#ffffff',    // Text on info
  },

  // UI Elements
  border: '#e5e5e5',        // Border color
  input: '#e5e5e5',         // Input border color
  divider: '#e5e5e5',       // Divider lines
  ring: '#0a0a0a',          // Focus ring color

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlay
  backdrop: 'rgba(0, 0, 0, 0.25)',    // Light backdrop
  scrim: 'rgba(0, 0, 0, 0.1)',        // Very light overlay

  // Ping-specific colors (matching web)
  ping: {
    connected: '#10b981',   // Green - connected badge
    pending: '#3b82f6',     // Blue - ping sent badge
    received: '#f59e0b',    // Orange - ping received badge
  },
};
```

**Create: `src/theme/spacing.ts`**
```typescript
/**
 * Spacing system (8px base grid)
 * Matches web app spacing conventions
 */
export const spacing = {
  none: 0,
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 12,     // 0.75rem
  lg: 16,     // 1rem
  xl: 24,     // 1.5rem
  xxl: 32,    // 2rem
  xxxl: 48,   // 3rem
};

// Container padding
export const containerPadding = spacing.lg; // 16px

// Card padding
export const cardPadding = spacing.md; // 12px
```

**Create: `src/theme/borderRadius.ts`**
```typescript
/**
 * Border radius values
 * Matches web --radius: 0.5rem (8px)
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,      // Default (matches web 0.5rem)
  xl: 12,
  xxl: 16,
  full: 9999, // Fully rounded (pills, circles)
};
```

**Create: `src/theme/typography.ts`**
```typescript
/**
 * Typography system
 * Font: System default (matches web Arial fallback)
 */
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // UI text
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.25,
  },
};
```

**Create: `src/theme/index.ts`**
```typescript
/**
 * Main theme export
 * Import this to access all theme values
 */
export { colors } from './colors';
export { spacing, containerPadding, cardPadding } from './spacing';
export { borderRadius } from './borderRadius';
export { typography } from './typography';

// Combined theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;

export type Theme = typeof theme;
```

---

## 5. Updated Phase 1 Scope Summary

### Key Decisions Finalized

| Decision | Choice | Details |
|----------|--------|---------|
| **Production API** | `https://in-house.tech` | ✅ Live, secure, ready to use |
| **Repository Structure** | Separate Repo | `PatrickVM/inhouse-mobile` (new) |
| **Development Setup** | Mac + Xcode + Expo | ✅ iOS Simulator ready |
| **Networking Solution** | None needed | Use production API directly |
| **Color Scheme** | Extracted from web | Match brand, mobile-optimized |
| **App Name** | InHouse Connect | Mobile companion branding |
| **Minimum OS** | iOS 13+, Android 10+ | Standard mobile support |

### What Changed from Original Scope

**Removed:**
- ❌ Tailscale setup (not needed)
- ❌ Monorepo migration (deferred)
- ❌ Local API networking configuration

**Simplified:**
- ✅ Use `https://in-house.tech` for all development
- ✅ Separate repository (faster start)
- ✅ Direct API access (no VPN, no complex networking)

### Updated Timeline (Faster!)

**Phase 1.1: Foundation (Weeks 1-2)**
- Backend: Create mobile auth endpoints → Deploy to Vercel
- Mobile: Create repo → Init Expo → Connect to production API
- **Saved Time:** 30-60 minutes (no Tailscale setup)

**Phase 1.2-1.6: Unchanged**
- Authentication, Profile, Directory, Ping, Polish
- Same scope, same features, same 8-week timeline

---

## 6. API Configuration for Mobile App

### Environment Configuration

**Create: `src/config/api.ts`**
```typescript
/**
 * API Configuration
 * All requests go to production: https://in-house.tech
 */

// Production API base URL
export const API_BASE_URL = 'https://in-house.tech';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Mobile Auth
  AUTH: {
    LOGIN: '/api/mobile/auth/login',
    REGISTER: '/api/mobile/auth/register',
    REFRESH: '/api/mobile/auth/refresh',
    ME: '/api/mobile/auth/me',
    LOGOUT: '/api/mobile/auth/logout',
  },

  // Profile
  PROFILE: {
    GET: '/api/users/profile',
    UPDATE: '/api/users/profile',
    DELETE: '/api/users/profile',
  },

  // Churches
  CHURCHES: {
    APPROVED: '/api/churches/approved',
    JOIN_REQUEST: '/api/churches/join-request',
    MEMBER_REQUESTS: '/api/churches/member-requests',
  },

  // Directory
  DIRECTORY: {
    MEMBERS: '/api/directory/members', // New endpoint to create
  },

  // Ping
  PING: {
    SEND: '/api/ping/send',
    RESPOND: '/api/ping/respond',
    STATUS: '/api/ping/status',
    COUNT: '/api/ping/count',
    PENDING: '/api/ping/pending',
  },
};
```

**Axios Client Setup:**
```typescript
// src/api/client.ts
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { getAuthToken, refreshAuthToken } from '@/utils/auth';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle token refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet, try refreshing token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAuthToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        // (will implement in auth context)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 7. Next.js API Changes Required

### CORS Configuration for Mobile

**Update or Create: `middleware.ts`**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply CORS to all /api/* routes (including mobile endpoints)
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    const origin = request.headers.get('origin');

    // Allow requests from:
    // 1. Web app (https://in-house.tech)
    // 2. Mobile app (will have same origin when using WebView, or no origin)
    // 3. Development (localhost)

    if (origin) {
      // Allow same-origin requests
      if (origin === 'https://in-house.tech' || origin.includes('localhost')) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    } else {
      // No origin header (native mobile requests)
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### New Backend Endpoints Required

**List of endpoints to create:**

1. ✅ `POST /api/mobile/auth/login` - JWT login
2. ✅ `POST /api/mobile/auth/register` - JWT registration
3. ✅ `POST /api/mobile/auth/refresh` - Refresh JWT token
4. ✅ `GET /api/mobile/auth/me` - Get current user
5. ✅ `POST /api/mobile/auth/logout` - Invalidate refresh token
6. ✅ `GET /api/directory/members` - Get church members (move logic from page.tsx)

**JWT Middleware to create:**
- `lib/mobile-auth.ts` - JWT generation, validation, middleware

---

## 8. Repository Setup Checklist

### Immediate Next Steps (30 minutes)

**1. Create New GitHub Repository:**
```bash
# On GitHub.com:
# - Repository name: inhouse-mobile
# - Description: InHouse Connect mobile app (React Native)
# - Private repository
# - Don't initialize with README (we'll create with Expo)
```

**2. Initialize Expo Project Locally:**
```bash
# Navigate to your projects folder
cd ~/Documents/BUILDS25/IN-HOUSE/

# Create new Expo project
npx create-expo-app inhouse-mobile --template blank-typescript

# Navigate into project
cd inhouse-mobile

# Connect to GitHub repo
git remote add origin https://github.com/PatrickVM/inhouse-mobile.git
git branch -M main
git push -u origin main
```

**3. Install Core Dependencies:**
```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# API & State Management
npm install axios @tanstack/react-query

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Storage
npm install expo-secure-store @react-native-async-storage/async-storage

# UI Components (React Native Paper)
npm install react-native-paper react-native-vector-icons

# Date utilities (if needed)
npm install date-fns
```

**4. Update `.env` in Web Repo:**
```bash
# In inhouse_app/.env
# Add/update production URL
NEXT_PUBLIC_APP_URL=https://in-house.tech
```

---

## 9. Success Metrics & Validation

### How to Validate This Setup Works

**Step 1: Verify Production API (NOW)**
```bash
# Test from terminal - should return 401 Unauthorized
curl https://in-house.tech/api/users/profile

# If you get 401: ✅ API is accessible
# If you get timeout/connection error: ❌ Check domain DNS
```

**Step 2: After Mobile Project Created**
```typescript
// In mobile app, create test API call:
import axios from 'axios';

const testAPI = async () => {
  try {
    const response = await axios.get('https://in-house.tech/api/users/profile');
    console.log('API accessible!', response.status);
  } catch (error) {
    console.log('Expected 401:', error.response?.status);
    // Should see 401 (means API is working, just need auth)
  }
};
```

**Step 3: After Auth Endpoints Created**
```typescript
// Test login endpoint
const response = await axios.post('https://in-house.tech/api/mobile/auth/login', {
  email: 'test@example.com',
  password: 'password123',
});
// Should return JWT token
```

---

## 10. Final Architecture Summary

### The Perfect Setup ✨

**Your Infrastructure:**
```
Production Web App: https://in-house.tech
    ├── Next.js 15 + React 19
    ├── Hosted on Vercel (auto-deploy)
    ├── PostgreSQL (Neon)
    └── API: /api/* endpoints

Mobile App (New): React Native + Expo
    ├── Repository: PatrickVM/inhouse-mobile
    ├── API Client: Axios
    ├── API Target: https://in-house.tech/api/*
    └── Auth: JWT tokens (secure store)
```

**Why This Works:**
1. ✅ **Production-ready API** - Already deployed and stable
2. ✅ **HTTPS secure** - Encrypted by default
3. ✅ **Always accessible** - From any device, any network
4. ✅ **No infrastructure setup** - Just start coding
5. ✅ **Zero risk to web app** - Mobile is separate repo
6. ✅ **Fast iteration** - Change code, hot reload, see results

**Development Flow:**
```
1. Write mobile code (React Native)
2. Save file
3. Hot reload updates instantly
4. API calls go to https://in-house.tech
5. See real data from production database
6. Test on iOS Simulator
7. (Optional) Test on physical device
```

**Deployment Flow (Phase 2):**
```
1. Build with EAS Build (Expo)
2. Submit to App Store / Play Store
3. Users download InHouse Connect
4. App calls https://in-house.tech/api/*
5. Same backend, separate client
```

---

## 11. Questions Before Implementation

### Final Confirmations Needed:

1. ✅ **Production URL confirmed:** `https://in-house.tech` - Correct?

2. **Repository naming:**
   - Suggested: `PatrickVM/inhouse-mobile`
   - Or prefer different name?

3. **Development priority:**
   - Start with iOS only (Mac Simulator)?
   - Or need Android emulator setup too?

4. **Backend access:**
   - Can you create new API routes in Next.js app?
   - Can you deploy changes to Vercel?

5. **Timeline confirmation:**
   - 8 weeks for Phase 1 still realistic?
   - Any hard deadlines?

---

## Document Metadata

**Version:** 2.0 (Final)
**Date:** 2025-09-29
**Status:** Ready for Implementation
**Production URL:** https://in-house.tech
**Recommended Approach:** Separate Repository + Production API

**Supersedes:**
- Previous recommendation for Tailscale (not needed)
- Previous consideration for monorepo (deferred to Phase 2+)

**Next Document:**
- `MOBILE_APP_PHASE_1_IMPLEMENTATION_GUIDE.md` (to be created when starting development)

---

**End of Architecture Decisions Document**
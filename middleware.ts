import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const authRoutes = ["/dashboard"];
// Routes that require admin access
const adminRoutes = ["/admin"];
// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // For now, we'll implement a simpler check without token validation
  // Just redirect unprotected routes like login/register if cookies exist
  const hasCookies =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  // If user has cookies and trying to access login/register, redirect to dashboard
  if (hasCookies && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. All files in /public (.ico, .png, etc)
     */
    "/((?!api|_next|static|.*\\..*|_vercel).*)",
  ],
};

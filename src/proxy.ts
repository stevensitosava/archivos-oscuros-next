import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 edge "proxy" (formerly middleware).
 * Graceful: when Clerk isn't configured (demo mode) this is a no-op
 * pass-through. When Clerk keys are present, clerkMiddleware attaches the auth
 * context and protects the account/admin routes (redirects to sign-in).
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtected = createRouteMatcher(["/biblioteca(.*)", "/admin(.*)", "/checkout(.*)"]);

const proxy = clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) await auth.protect();
    })
  : function proxy() {
      return NextResponse.next();
    };

export default proxy;

export const config = {
  matcher: [
    // Skip Next internals + static files; run on app routes…
    "/((?!_next|.*\\.[\\w]+$).*)",
    // …always on API routes…
    "/(api|trpc)(.*)",
    // …and Clerk's auto-proxy path.
    "/__clerk/:path*",
  ],
};

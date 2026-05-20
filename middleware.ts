import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that logged-in users should NOT visit (redirect them away)
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Routes that require a logged-in session
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/onboarding(.*)",
  "/items/add(.*)",
  "/checkout(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Logged-in users visiting sign-in/sign-up → send straight to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Unauthenticated users on protected routes → send to sign-in
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Enforce role selection as the very first thing for new visitors
  if (req.nextUrl.pathname === '/') {
    const hasRoleCookie = req.cookies.has('rento_role');
    if (!hasRoleCookie) {
      return NextResponse.redirect(new URL('/role-selection', req.url));
    }
  }

  // Inject current URL so server layout can detect pathname without headers()
  const response = NextResponse.next();
  response.headers.set('x-url', req.url);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

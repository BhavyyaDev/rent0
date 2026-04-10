import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/search(.*)",
  "/items/(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Inject current URL for server layout path detection
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

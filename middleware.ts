import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/podcast(.*)", // Podcast metadata is public
]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      const signInUrl = new URL("/sign-in", request.url);
      await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
    }
  },
  {
    // Route Clerk API through our domain to fix dev-browser-missing on Vercel
    frontendApiProxy: {
      enabled: (url) => url.hostname.includes("vercel.app"),
    },
  },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes and Clerk proxy
    "/(api|trpc|__clerk)(.*)",
  ],
};

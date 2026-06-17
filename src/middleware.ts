export { auth as middleware } from "@/auth";

/**
 * Next.js middleware — protects routes with Auth.js.
 * Only the admin and API routes are protected by default.
 * Customize the matcher below for additional routes.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

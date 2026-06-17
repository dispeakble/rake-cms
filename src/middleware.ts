import { auth } from "@/auth";
import { securityHeaders } from "@/lib/security/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Combined middleware: Auth.js + security headers.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Route protection via Auth.js.
 */
export { auth as authMiddleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

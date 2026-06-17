/**
 * Rake CMS — Combined Middleware
 *
 * 1. Multi-tenant: detects subdomain from Host header, resolves site from DB
 * 2. Security headers: CSP, HSTS, X-Frame-Options, etc.
 */
import { securityHeaders } from "@/lib/security/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "alexawebservers.com";
const ALLOWED_PARENT_DOMAINS = new Set([
  "alexawebservers.com",
  "www.alexawebservers.com",
]);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const host = request.headers.get("host") || "";
  const url = new URL(request.url);

  // Apply security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Multi-tenant subdomain resolution
  // Pattern: [slug].alexawebservers.com
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = host.replace(`.${ROOT_DOMAIN}`, "").split(":")[0]; // strip port

    // Skip root domains and known service subdomains
    const isServiceSubdomain = ALLOWED_PARENT_DOMAINS.has(host.split(":")[0]) ||
      ["www", "mail", "webmail", "admin"].includes(subdomain);

    if (!isServiceSubdomain && subdomain && !subdomain.includes(".")) {
      // Set site context headers for server components to read
      response.headers.set("x-site-slug", subdomain);

      // Inline DB lookup for the site ID — lightweight query
      try {
        const { db } = await import("@/db");
        const { sites } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        const site = await db
          .select({ id: sites.id })
          .from(sites)
          .where(eq(sites.slug, subdomain))
          .limit(1)
          .then((r) => r[0]);

        if (site) {
          response.headers.set("x-site-id", String(site.id));
        }
      } catch {
        // DB not available — proceed without site ID
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/**
 * Site Context — resolves the current site from request headers.
 *
 * Middleware in multi-tenant mode extracts the subdomain from the Host header
 * and sets x-site-slug and x-site-id for server components and API routes.
 */
import { headers } from "next/headers";

export interface SiteContext {
  siteId: number;
  slug: string;
  subdomain: string;
}

/**
 * Get the current site context from the request headers.
 * Set by middleware in multi-tenant mode.
 */
export async function getSiteContext(): Promise<SiteContext | null> {
  try {
    const h = await headers();
    const slug = h.get("x-site-slug");
    const siteId = h.get("x-site-id");

    if (!slug || !siteId) return null;

    return {
      siteId: parseInt(siteId, 10),
      slug,
      subdomain: slug,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a clean slug from a business name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-{2,}/g, "-");
}

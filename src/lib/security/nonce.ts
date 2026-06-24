/**
 * Rake CMS — Nonce / CSRF Protection
 *
 * WordPress-compatible nonce system for form/request verification.
 * Uses HMAC-SHA256 with a site secret + user session + action + time window.
 *
 * Nonces have a 24-hour lifetime (12h half-life for tick comparison).
 * They are NOT cryptographic secrets — they verify intent, not identity.
 *
 * Usage:
 *   import { createNonce, verifyNonce, nonceField, nonceUrl } from "@/lib/security/nonce";
 *
 *   // Generate for a form
 *   const nonce = createNonce("delete_post_123");
 *   // <input type="hidden" name="_wpnonce" value={nonce} />
 *
 *   // Verify on submit
 *   if (!verifyNonce(formNonce, "delete_post_123")) {
 *     return new Response("Invalid nonce", { status: 403 });
 *   }
 */

import crypto from "crypto";

/**
 * Get the site-wide secret key for nonce generation.
 * Falls back to AUTH_SECRET, then a hardcoded (but stable) dev value.
 */
function getNonceKey(): string {
  return process.env.AUTH_SECRET || process.env.NONCE_KEY || "rake-cms-nonce-key-dev";
}

/**
 * Get the current nonce "tick" — a time bucket with 12-hour windows.
 * Nonces created in tick N are valid in tick N and N+1 (24h total).
 */
function getNonceTick(time: number = Date.now()): number {
  return Math.floor(time / (12 * 60 * 60 * 1000));
}

/**
 * Generate a nonce for a given action.
 *
 * @param action - A unique string identifying the action (e.g., "delete_post_42")
 * @param userId - Current user ID (default: 0 for anonymous)
 * @returns A 10-character alphanumeric nonce string
 */
export function createNonce(action: string, userId: number = 0): string {
  const tick = getNonceTick();
  const hash = crypto
    .createHmac("sha256", getNonceKey())
    .update(`${tick}|${action}|${userId}`)
    .digest("hex");

  // Return first 10 chars (like WordPress)
  return hash.substring(0, 10);
}

/**
 * Verify a nonce value for a given action.
 *
 * Checks both the current tick window and the previous one (24h validity).
 *
 * @param nonce - The nonce value to verify
 * @param action - The action string to verify against
 * @param userId - Current user ID (default: 0)
 * @returns true if the nonce is valid
 */
export function verifyNonce(
  nonce: string,
  action: string,
  userId: number = 0
): boolean {
  if (!nonce || nonce.length !== 10) return false;

  const currentTick = getNonceTick();
  const action_normalized = normalizeNonceAction(action);

  // Check current and previous tick (24h window)
  for (const tick of [currentTick, currentTick - 1]) {
    const expected = crypto
      .createHmac("sha256", getNonceKey())
      .update(`${tick}|${action_normalized}|${userId}`)
      .digest("hex")
      .substring(0, 10);

    // Use timing-safe comparison
    if (crypto.timingSafeEqual(Buffer.from(nonce), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Normalize an action string for consistent nonce generation.
 * Converts "delete_post_42" to "delete-post-42" format.
 */
function normalizeNonceAction(action: string): string {
  return action.replace(/_/g, "-").toLowerCase();
}

/**
 * Generate a hidden form field with the nonce.
 * WordPress-compatible: <input type="hidden" name="_wpnonce" value="..." />
 *
 * @param action - The action string
 * @param userId - Current user ID
 * @param fieldName - Hidden field name (default: "_wpnonce")
 * @returns HTML string for the hidden input
 */
export function nonceField(
  action: string,
  userId: number = 0,
  fieldName: string = "_wpnonce"
): string {
  const nonce = createNonce(action, userId);
  return `<input type="hidden" name="${fieldName}" value="${nonce}" />`;
}

/**
 * Append a nonce to a URL as a query parameter.
 * WordPress-compatible: "?action=delete&_wpnonce=abc123"
 *
 * @param url - The base URL
 * @param action - The action string
 * @param userId - Current user ID
 * @param paramName - Query parameter name (default: "_wpnonce")
 * @returns URL with nonce parameter appended
 */
export function nonceUrl(
  url: string,
  action: string,
  userId: number = 0,
  paramName: string = "_wpnonce"
): string {
  const nonce = createNonce(action, userId);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${paramName}=${nonce}`;
}

/**
 * Extract a nonce from a Request (FormData or JSON body, or query params).
 *
 * @param request - The incoming request
 * @returns The nonce value, or null if not found
 */
export async function extractNonceFromRequest(
  request: Request
): Promise<string | null> {
  const url = new URL(request.url);
  const queryNonce = url.searchParams.get("_wpnonce");
  if (queryNonce) return queryNonce;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      return (formData.get("_wpnonce") as string) || null;
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      return body?._wpnonce || null;
    }
  } catch {
    // Body parsing failed, try headers
  }

  // Check X-WP-Nonce header (WordPress REST API convention)
  return request.headers.get("X-WP-Nonce") || null;
}

/**
 * Middleware to verify a nonce from a request.
 * Returns 403 response if invalid, null if valid.
 *
 * Usage in API routes:
 *   const nonceError = await requireNonce(request, "delete_post");
 *   if (nonceError) return nonceError;
 */
export async function requireNonce(
  request: Request,
  action: string
): Promise<Response | null> {
  const nonce = await extractNonceFromRequest(request);
  if (!nonce || !verifyNonce(nonce, action)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing nonce" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return null;
}

/**
 * Rake CMS — Nonce Middleware for API Routes
 *
 * Provides middleware-style nonce validation for API routes.
 * Nonces are generated server-side and validated on each mutation request.
 *
 * Usage:
 *   import { requirePostNonce } from "@/lib/security/nonce-middleware";
 *
 *   export async function POST(request: Request) {
 *     const nonceError = requirePostNonce(request, "save_post");
 *     if (nonceError) return nonceError;
 *     // ... handle request
 *   }
 */

import { extractNonceFromRequest, verifyNonce } from "./nonce";

/**
 * Common nonce actions used across the app.
 */
export const NONCE_ACTIONS = {
  SAVE_POST: "save_post",
  DELETE_POST: "delete_post",
  RESTORE_POST: "untrash_post",
  UPLOAD_MEDIA: "upload_media",
  DELETE_MEDIA: "delete_media",
  SUBMIT_COMMENT: "submit_comment",
  APPROVE_COMMENT: "approve_comment",
  DELETE_COMMENT: "delete_comment",
  SAVE_SETTINGS: "save_settings",
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",
  MANAGE_MENUS: "manage_menus",
  MANAGE_TAGS: "manage_tags",
} as const;

/**
 * Validate a nonce from a request.
 * Returns a 403 Response if invalid, null if valid.
 *
 * @param request - The incoming request
 * @param action - The nonce action string
 * @param userId - Current user ID (default: 0)
 */
export async function requirePostNonce(
  request: Request,
  action: string,
  userId: number = 0
): Promise<Response | null> {
  const nonce = await extractNonceFromRequest(request);

  if (!nonce) {
    return new Response(
      JSON.stringify({ error: "Missing security token (nonce)" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!verifyNonce(nonce, action, userId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired security token" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}

/**
 * Generate a nonce for client-side use and return it as a script tag.
 * To be called from server components and rendered with dangerouslySetInnerHTML.
 */
export function generateNonceScript(nonce: string, action: string): string {
  return `<script>window._wpnonce = ${JSON.stringify(nonce)}; window._wpnonceAction = ${JSON.stringify(action)};</script>`;
}

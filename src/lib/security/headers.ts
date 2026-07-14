/**
 * Security headers configuration.
 * Applied via Next.js middleware for all routes.
 */

/**
 * Content Security Policy (CSP).
 * Restricts which resources can be loaded.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https: http:",
  "font-src 'self' data:",
  "connect-src 'self' https: http:",
  "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://maps.google.com https://www.openstreetmap.org",
  "media-src 'self' https: http:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Security headers map for Next.js middleware.
 */
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "unsafe-url",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

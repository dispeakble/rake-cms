/**
 * Input validation and sanitization for all API endpoints.
 * Uses Zod schemas to validate, sanitize, and type-check all user inputs.
 */

import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens and underscores")
    .transform((u) => u.trim()),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .transform((e) => e.toLowerCase().trim()),
  displayName: z
    .string()
    .max(100, "Display name too long")
    .optional()
    .transform((d) => d?.trim() || ""),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ─── Media Schemas ──────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "application/pdf",
  "application/zip",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Must be a file" })
    .refine((f) => f.size > 0, "File is empty")
    .refine((f) => f.size <= MAX_FILE_SIZE, `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`)
    .refine((f) => ALLOWED_MIME_TYPES.includes(f.type), { message: "File type not allowed" }),
});

export const fileDeleteSchema = z.object({
  path: z
    .string()
    .min(1, "File path is required")
    .max(500, "File path too long")
    .regex(/^[a-zA-Z0-9_\/\-\.]+$/, "Invalid file path characters")
    .transform((p) => p.replace(/\.\.\//g, "")), // Prevent path traversal
});

// ─── Scraper Schemas ────────────────────────────────────────────

const SAFE_URL_REGEX = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?$/;

export const scrapeUrlSchema = z
  .string()
  .min(1, "URL is required")
  .max(2000, "URL too long")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        // Block internal/private IP ranges (SSRF protection)
        const hostname = parsed.hostname.toLowerCase();
        const blockedPatterns = [
          /^localhost$/i,
          /^127\./,
          /^10\./,
          /^172\.(1[6-9]|2\d|3[01])\./,
          /^192\.168\./,
          /^169\.254\./,
          /^0\.0\.0\.0$/,
          /^::1$/,
          /^fc00:/,
          /^fe80:/,
          /\.local$/,
          /\.internal$/,
          /\.localhost$/,
        ];
        return !blockedPatterns.some((p) => p.test(hostname));
      } catch {
        return false;
      }
    },
    "Invalid or blocked URL (internal/private addresses not allowed)"
  );

export const businessQuerySchema = z
  .string()
  .min(2, "Business query too short")
  .max(200, "Business query too long")
  .transform((q) => q.trim());

// ─── Post Schemas ───────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title too long")
    .transform((t) => t.trim()),
  content: z
    .string()
    .max(16777215, "Content too large")
    .default(""),
  status: z
    .enum(["draft", "publish", "pending"])
    .default("draft"),
  type: z
    .enum(["post", "page"])
    .default("post"),
});

// ─── Sanitization Utilities ─────────────────────────────────────

/**
 * Strip HTML tags from a string (prevent XSS).
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize scraped content before storing in the database.
 * Removes potential XSS vectors from scraped HTML.
 */
export function sanitizeScrapedContent(input: string): string {
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove on* event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    // Remove data: URLs in dangerous contexts
    .replace(/src\s*=\s*["']data:text\/html[^"']*["']/gi, 'src=""')
    // Remove iframes from non-whitelisted sources
    .replace(/<iframe\b[^>]*>(?:.*?<\/iframe>)?/gi, (match) => {
      const src = match.match(/src\s*=\s*["']([^"']+)["']/i);
      if (src) {
        const whitelisted = ["youtube.com", "youtu.be", "player.vimeo.com", "maps.google.com", "open.spotify.com"];
        const isSafe = whitelisted.some((d) => src[1].includes(d));
        if (isSafe) return match;
      }
      return "<!-- iframe removed for security -->";
    })
    // Remove object/embed tags
    .replace(/<object\b[^>]*>(?:.*?<\/object>)?/gi, "")
    .replace(/<embed\b[^>]*>/gi, "");
}

/**
 * Sanitize a filename — remove path traversal and dangerous characters.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\.\//g, "")
    .replace(/\.\.\\/g, "")
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * Validate and extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Sliding-window rate limiter with IP-based tracking.
 * Prevents brute force attacks on auth endpoints and API abuse.
 *
 * Usage:
 *   const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 10 });
 *   const result = limiter.check("login:127.0.0.1");
 *   if (result.blocked) return 429;
 */

export interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60s) */
  windowMs?: number;
  /** Max requests allowed in the window (default: 10) */
  maxRequests?: number;
  /** Block duration after exceeding limit (ms). 0 = permanent until window resets (default: 300s) */
  blockDurationMs?: number;
}

interface Bucket {
  timestamps: number[];
  blockedUntil: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private windowMs: number;
  private maxRequests: number;
  private blockDurationMs: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs || 60_000; // 1 minute default
    this.maxRequests = options.maxRequests || 10;
    this.blockDurationMs = options.blockDurationMs || 300_000; // 5 min block

    // Cleanup stale buckets every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300_000);

    // Allow cleanup to not keep process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check if a key (e.g. "login:1.2.3.4") has exceeded its rate limit.
   */
  check(key: string): { blocked: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { timestamps: [], blockedUntil: 0 };
      this.buckets.set(key, bucket);
    }

    // Check if currently blocked
    if (bucket.blockedUntil > now) {
      return {
        blocked: true,
        remaining: 0,
        resetInMs: bucket.blockedUntil - now,
      };
    }

    // Remove timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < this.windowMs);

    // Check limits
    if (bucket.timestamps.length >= this.maxRequests) {
      bucket.blockedUntil = now + this.blockDurationMs;
      return {
        blocked: true,
        remaining: 0,
        resetInMs: this.blockDurationMs,
      };
    }

    // Record this request
    bucket.timestamps.push(now);

    return {
      blocked: false,
      remaining: this.maxRequests - bucket.timestamps.length,
      resetInMs: this.windowMs - (now - bucket.timestamps[0]),
    };
  }

  /**
   * Reset a key's rate limit (e.g. after successful login).
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Get the current number of tracked keys.
   */
  get size(): number {
    return this.buckets.size;
  }

  /**
   * Remove expired entries to prevent memory leaks.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      const allExpired = bucket.timestamps.every((t) => now - t > this.windowMs * 2);
      const notBlocked = bucket.blockedUntil < now;
      if (allExpired && notBlocked) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Destroy the limiter (cleanup interval).
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.buckets.clear();
  }
}

/**
 * Pre-built rate limiters for different endpoints.
 */

/** Login: 5 attempts per minute, blocked for 15 min after */
export const loginLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
  blockDurationMs: 900_000, // 15 minutes
});

/** Registration: 3 per hour per IP */
export const registerLimiter = new RateLimiter({
  windowMs: 3_600_000, // 1 hour
  maxRequests: 3,
  blockDurationMs: 3_600_000, // 1 hour block
});

/** API: 60 requests per minute */
export const apiLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
  blockDurationMs: 120_000, // 2 min block
});

/** Media upload: 20 uploads per minute */
export const uploadLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  blockDurationMs: 300_000, // 5 min block
});

/** Scraper: 10 scrapes per hour (external API limits) */
export const scraperLimiter = new RateLimiter({
  windowMs: 3_600_000, // 1 hour
  maxRequests: 10,
  blockDurationMs: 3_600_000, // 1 hour block
});

/**
 * Retry with exponential backoff + circuit breaker pattern.
 * For reliable external API calls (scraping, S3, Google Places).
 */

export interface RetryOptions {
  /** Max retry attempts (default: 3) */
  maxAttempts?: number;
  /** Base delay in ms (default: 1000) */
  baseDelayMs?: number;
  /** Max delay in ms (default: 30000) */
  maxDelayMs?: number;
  /** Which HTTP status codes to retry on (default: [408, 429, 500, 502, 503, 504]) */
  retryOnStatus?: number[];
  /** Logger function */
  logger?: (msg: string) => void;
}

const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

/**
 * Calculate delay with exponential backoff + jitter.
 */
function calculateDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  // Add ±25% jitter
  const jitter = exponential * 0.25 * (Math.random() * 2 - 1);
  return Math.round(exponential + jitter);
}

/**
 * Check if an error is retryable.
 */
function isRetryable(error: unknown, retryOnStatus: number[]): boolean {
  if (error instanceof TypeError && error.message === "fetch failed") {
    return true; // Network error
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return false; // Don't retry timeouts that we explicitly triggered
  }
  if (error && typeof error === "object" && "status" in error) {
    return retryOnStatus.includes((error as { status: number }).status);
  }
  // Response errors
  if (error && typeof error === "object" && "response" in error) {
    const resp = (error as { response: { status: number } }).response;
    if (resp?.status) return retryOnStatus.includes(resp.status);
  }
  return false;
}

/**
 * Retry an async function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1_000,
    maxDelayMs = 30_000,
    retryOnStatus = DEFAULT_RETRY_STATUSES,
    logger = () => {},
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts || !isRetryable(error, retryOnStatus)) {
        throw error;
      }

      const delay = calculateDelay(attempt, baseDelayMs, maxDelayMs);
      logger(`Retry ${attempt}/${maxAttempts - 1} after ${delay}ms: ${(error as Error).message}`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ─── Circuit Breaker ────────────────────────────────────────────

type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  /** Failure threshold before opening (default: 5) */
  failureThreshold?: number;
  /** Success threshold to close after half-open (default: 3) */
  successThreshold?: number;
  /** Time in ms to wait before half-open (default: 30000) */
  resetTimeoutMs?: number;
  /** Logger */
  logger?: (msg: string) => void;
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private failureThreshold: number;
  private successThreshold: number;
  private resetTimeoutMs: number;
  private logger: (msg: string) => void;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 30_000;
    this.logger = options.logger || ((msg: string) => console.log(`[CircuitBreaker:${name}] ${msg}`));
  }

  /**
   * Execute a function through the circuit breaker.
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = "half-open";
        this.logger("Entering half-open state");
      } else {
        throw new CircuitBreakerError("Circuit is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "closed";
        this.failureCount = 0;
        this.successCount = 0;
        this.logger("Circuit closed (recovered)");
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "half-open" || this.failureCount >= this.failureThreshold) {
      this.state = "open";
      this.logger(`Circuit opened (${this.failureCount} failures)`);
    }
  }

  get currentState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
    this.logger("Circuit manually reset");
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

// ─── Retry with proper fetch timeout ────────────────────────────

export interface FetchWithRetryOptions extends RetryOptions {
  /** Request timeout in ms (default: 15000) */
  timeoutMs?: number;
}

/**
 * Fetch with retry, timeout, and circuit breaker support.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & FetchWithRetryOptions = {}
): Promise<Response> {
  const { timeoutMs = 15_000, ...retryOptions } = options;

  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });

      // Throw for retryable status codes
      if (!response.ok && DEFAULT_RETRY_STATUSES.includes(response.status)) {
        const err = new Error(`HTTP ${response.status}`) as Error & { status: number; response: Response };
        err.status = response.status;
        err.response = response;
        throw err;
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }, retryOptions);
}

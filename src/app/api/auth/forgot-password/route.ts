import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp } from "@/lib/security/validation";
import { apiLimiter } from "@/lib/security/rate-limiter";

// In-memory token store (in production, store in DB)
const resetTokens = new Map<string, { email: string; expires: number }>();

// Cleanup old tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens) {
    if (data.expires < now) resetTokens.delete(token);
  }
}, 600_000);

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email if the email exists.
 * Always returns success to prevent email enumeration.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limitCheck = apiLimiter.check(`forgot:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { message: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "If an account with that email exists, a reset link has been sent." }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists (silently)
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, cleanEmail))
      .limit(1)
      .then((r) => r[0]);

    if (user) {
      // Generate a reset token
      const token = crypto.randomBytes(32).toString("hex");
      resetTokens.set(token, {
        email: cleanEmail,
        expires: Date.now() + 3_600_000, // 1 hour
      });

      await sendPasswordResetEmail(cleanEmail, token);

      // Log the reset link in dev mode
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      console.log(`[PASSWORD RESET] Link for ${cleanEmail}: ${siteUrl}/reset-password?token=${token}`);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/reset-password
 * Validates reset token and updates password.
 */
export async function PUT(request: Request) {
  const ip = getClientIp(request);
  const limitCheck = apiLimiter.check(`reset:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Validate token
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12);
    await db
      .update(users)
      .set({ userPass: hashedPassword })
      .where(eq(users.userEmail, tokenData.email));

    // Clean up used token
    resetTokens.delete(token);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Reset failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Validates a reset token (for page-level checking).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const tokenData = resetTokens.get(token);
  const valid = !!tokenData && tokenData.expires > Date.now();

  return NextResponse.json({ valid });
}

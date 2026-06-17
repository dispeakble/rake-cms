import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { loginLimiter } from "@/lib/security/rate-limiter";
import { loginSchema } from "@/lib/security/validation";

/**
 * Track login attempts per user email for additional protection.
 * Resets on successful login.
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_EMAIL_ATTEMPTS = 10;
const EMAIL_LOCKOUT_MS = 900_000; // 15 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rawEmail = credentials.email as string;
        const password = credentials.password as string;

        // Validate email format
        const parsed = loginSchema.safeParse({ email: rawEmail, password });
        if (!parsed.success) return null;

        const { email } = parsed.data;

        // Check email-specific lockout (additional brute force protection)
        const attempts = loginAttempts.get(email);
        if (attempts && attempts.count >= MAX_EMAIL_ATTEMPTS) {
          if (Date.now() - attempts.lastAttempt < EMAIL_LOCKOUT_MS) {
            // Silently fail — don't reveal if user exists
            return null;
          }
          // Reset after lockout period
          loginAttempts.delete(email);
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.userEmail, email))
          .limit(1)
          .then((rows) => rows[0]);

        if (!user) {
          // Track non-existent email attempts too (prevents enumeration)
          trackFailedAttempt(email);
          // Use constant-time response to prevent user enumeration
          await bcrypt.compare(password, "$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QpLJ5m4yQpLJ5m4yQpLJ5m4yQpO");
          return null;
        }

        const isValid = await bcrypt.compare(password, user.userPass);
        if (!isValid) {
          trackFailedAttempt(email);
          return null;
        }

        // Success — reset attempts
        loginAttempts.delete(email);
        loginLimiter.reset(`login:${email}`);

        return {
          id: String(user.id),
          email: user.userEmail,
          name: user.displayName || user.userLogin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Add token issue time for session freshness checks
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

/**
 * Track failed login attempts for a specific email.
 * Automatically cleans up entries after lockout period.
 */
function trackFailedAttempt(email: string) {
  const existing = loginAttempts.get(email);
  if (existing) {
    existing.count++;
    existing.lastAttempt = Date.now();
  } else {
    loginAttempts.set(email, { count: 1, lastAttempt: Date.now() });
  }

  // Auto-cleanup old entries
  if (loginAttempts.size > 10000) {
    const now = Date.now();
    for (const [key, val] of loginAttempts) {
      if (now - val.lastAttempt > EMAIL_LOCKOUT_MS * 2) {
        loginAttempts.delete(key);
      }
    }
  }
}

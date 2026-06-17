import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema, getClientIp, stripHtml } from "@/lib/security/validation";
import { registerLimiter } from "@/lib/security/rate-limiter";

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);
  const limitCheck = registerLimiter.check(`register:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limitCheck.resetInMs / 1000)) } }
    );
  }

  try {
    const formData = await request.formData();
    const rawData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      displayName: formData.get("displayName") as string || undefined,
      password: formData.get("password") as string,
    };

    // Validate with Zod
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message);
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const { username, email, displayName, password } = parsed.data;
    const safeDisplayName = stripHtml(displayName || username);

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check username uniqueness
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.userLogin, username))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      userLogin: username,
      userEmail: email,
      userPass: hashedPassword,
      displayName: safeDisplayName,
      userNicename: username.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });

    // Reset rate limiter on success
    registerLimiter.reset(`register:${ip}`);

    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

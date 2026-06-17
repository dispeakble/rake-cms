import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const displayName = formData.get("displayName") as string || username;
    const password = formData.get("password") as string;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      userLogin: username,
      userEmail: email,
      userPass: hashedPassword,
      displayName,
      userNicename: username.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });

    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}

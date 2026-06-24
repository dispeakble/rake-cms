import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, usermeta } from "@/db/schema";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const displayName = formData.get("displayName") as string;
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const userId = parseInt(session.user.id as string);

    // Verify current password for any change
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.userPass);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const updateData: Record<string, string> = {};
    if (displayName) updateData.displayName = displayName;
    if (email) updateData.userEmail = email;
    if (newPassword && newPassword.length >= 8) {
      updateData.userPass = await bcrypt.hash(newPassword, 12);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    // Save user meta fields
    const metaFields = ["first_name", "last_name", "nickname", "description", "phone", "location"];
    for (const field of metaFields) {
      const value = formData.get(field) as string;
      if (value !== null) {
        const existing = await db
          .select()
          .from(usermeta)
          .where(and(eq(usermeta.userId, userId), eq(usermeta.metaKey, field)))
          .limit(1)
          .then((r) => r[0]);

        if (existing) {
          await db
            .update(usermeta)
            .set({ metaValue: value })
            .where(eq(usermeta.id, existing.id));
        } else {
          await db.insert(usermeta).values({
            userId,
            metaKey: field,
            metaValue: value,
          });
        }
      }
    }

    return NextResponse.redirect(new URL("/profile", request.url));
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

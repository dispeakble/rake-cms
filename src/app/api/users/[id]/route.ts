import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const userLogin = formData.get("userLogin") as string;
  const displayName = formData.get("displayName") as string;
  const userEmail = formData.get("userEmail") as string;
  const password = formData.get("password") as string;

  const updateData: Record<string, string> = {};
  if (userLogin) updateData.userLogin = userLogin;
  if (displayName) updateData.displayName = displayName;
  if (userEmail) updateData.userEmail = userEmail;
  if (password && password.length >= 8) {
    updateData.userPass = await bcrypt.hash(password, 12);
  }

  await db.update(users).set(updateData).where(eq(users.id, parseInt(id)));

  return NextResponse.redirect(new URL("/admin/users", request.url));
}

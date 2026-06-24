/**
 * Rake CMS — User Meta API
 *
 * GET  /api/users/[id]/meta — List user meta
 * POST /api/users/[id]/meta — Create/update user meta
 * DELETE /api/users/[id]/meta?key=xxx — Delete user meta
 */

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { usermeta } from "@/db/schema";
import { auth } from "@/auth";
import { USER_META_KEYS } from "@/db/schema/usermeta";

/**
 * Allowed meta keys that can be set via the API.
 */
const ALLOWED_KEYS = new Set(Object.values(USER_META_KEYS));

/**
 * GET /api/users/[id]/meta — Get all meta for a user
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id);

  // Users can only view their own meta unless admin
  const sessionUserId = parseInt(session.user.id as string);
  if (sessionUserId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const meta = await db
    .select({ key: usermeta.metaKey, value: usermeta.metaValue })
    .from(usermeta)
    .where(eq(usermeta.userId, userId));

  const metaObj: Record<string, string> = {};
  for (const m of meta) {
    if (m.key) metaObj[m.key] = m.value || "";
  }

  return NextResponse.json({ meta: metaObj });
}

/**
 * POST /api/users/[id]/meta — Create or update user meta
 * body: { key, value }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id);

  const sessionUserId = parseInt(session.user.id as string);
  if (sessionUserId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: "Invalid meta key" }, { status: 400 });
    }

    // Check if meta exists
    const existing = await db
      .select()
      .from(usermeta)
      .where(and(eq(usermeta.userId, userId), eq(usermeta.metaKey, key)))
      .limit(1)
      .then((r) => r[0]);

    if (existing) {
      await db
        .update(usermeta)
        .set({ metaValue: String(value || "") })
        .where(eq(usermeta.id, existing.id));
    } else {
      await db.insert(usermeta).values({
        userId,
        metaKey: key,
        metaValue: String(value || ""),
      });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("[User Meta API] Error:", error);
    return NextResponse.json({ error: "Failed to save user meta" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]/meta?key=xxx — Delete user meta
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id);

  const sessionUserId = parseInt(session.user.id as string);
  if (sessionUserId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "key parameter required" }, { status: 400 });
  }

  await db
    .delete(usermeta)
    .where(and(eq(usermeta.userId, userId), eq(usermeta.metaKey, key)));

  return NextResponse.json({ success: true });
}

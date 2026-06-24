import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { auth } from "@/auth";
import { doAction } from "@/lib/hooks";
import { requirePostNonce, NONCE_ACTIONS } from "@/lib/security/nonce-middleware";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id);

  // Verify nonce
  const userId = parseInt(session.user.id as string) || 0;
  const nonceError = await requirePostNonce(request, NONCE_ACTIONS.RESTORE_POST, userId);
  if (nonceError) return nonceError;

  await db
    .update(posts)
    .set({ postStatus: "draft" })
    .where(eq(posts.id, postId));

  await doAction("untrash_post", postId);

  return NextResponse.redirect(new URL("/admin/posts", request.url));
}

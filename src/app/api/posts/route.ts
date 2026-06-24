import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta, revisions } from "@/db/schema";
import { auth } from "@/auth";
import { getClientIp } from "@/lib/security/validation";
import { apiLimiter } from "@/lib/security/rate-limiter";
import { doAction } from "@/lib/hooks";
import { requirePostNonce, NONCE_ACTIONS } from "@/lib/security/nonce-middleware";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200);
}

/**
 * GET /api/posts?type=post&status=publish&limit=10
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "post";
  const status = searchParams.get("status");

  let query = db
    .select()
    .from(posts)
    .where(eq(posts.postType, type));

  // Can't easily chain multiple where clauses with Drizzle, so we filter post-query
  const allPosts = await query;

  let filtered = allPosts;
  if (status) {
    filtered = filtered.filter((p) => p.postStatus === status);
  }

  return NextResponse.json({ posts: filtered.slice(0, 50) });
}

/**
 * POST /api/posts — Create a new post
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify nonce
  const userId = parseInt(session.user.id as string) || 0;
  const nonceError = await requirePostNonce(request, NONCE_ACTIONS.SAVE_POST, userId);
  if (nonceError) return nonceError;

  const ip = getClientIp(request);
  const limitCheck = apiLimiter.check(`api:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const title = (formData.get("title") as string) || "Untitled";
    const content = (formData.get("content") as string) || "";
    const excerpt = (formData.get("excerpt") as string) || "";
    const status = (formData.get("status") as string) || "draft";
    const type = (formData.get("type") as string) || "post";
    const slug = (formData.get("slug") as string) || slugify(title);
    const parentId = parseInt(formData.get("parentId") as string) || 0;
    const featuredImage = (formData.get("featuredImage") as string) || "";
    const categoryIds = JSON.parse((formData.get("categoryIds") as string) || "[]") as number[];
    const tagIds = JSON.parse((formData.get("tagIds") as string) || "[]") as number[];

    const now = new Date().toISOString();

    const [post] = await db
      .insert(posts)
      .values({
        postTitle: title,
        postContent: content,
        postExcerpt: excerpt,
        postStatus: status,
        postType: type,
        postName: slug,
        postAuthor: parseInt(session.user.id as string),
        postParent: parentId,
        postDate: now,
        postDateGmt: now,
        postModified: now,
        postModifiedGmt: now,
      })
      .returning();

    // Save featured image as postmeta
    if (featuredImage) {
      await db.insert(postmeta).values({
        postId: post.id,
        metaKey: "_thumbnail_id",
        metaValue: featuredImage,
      });
    }

    // Fire hooks
    await doAction("wp_insert_post", post.id, post, true);
    await doAction("save_post", post.id, post, true);

    // Connect categories
    for (const catId of categoryIds) {
      await db.insert(termRelationships).values({
        objectId: post.id,
        termTaxonomyId: catId,
      });
      // Increment count
      const taxonomy = await db
        .select()
        .from(termTaxonomy)
        .where(eq(termTaxonomy.id, catId))
        .limit(1)
        .then((r) => r[0]);
      if (taxonomy) {
        await db
          .update(termTaxonomy)
          .set({ count: (taxonomy.count || 0) + 1 })
          .where(eq(termTaxonomy.id, catId));
      }
    }

    // Connect tags
    for (const tagId of tagIds) {
      await db.insert(termRelationships).values({
        objectId: post.id,
        termTaxonomyId: tagId,
      });
      const taxonomy = await db
        .select()
        .from(termTaxonomy)
        .where(eq(termTaxonomy.id, tagId))
        .limit(1)
        .then((r) => r[0]);
      if (taxonomy) {
        await db
          .update(termTaxonomy)
          .set({ count: (taxonomy.count || 0) + 1 })
          .where(eq(termTaxonomy.id, tagId));
      }
    }

    return NextResponse.json({ post, redirect: `/admin/${post.postType}/${post.id}/edit` });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

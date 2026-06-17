import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { posts, termRelationships, postmeta, revisions, comments } from "@/db/schema";
import { auth } from "@/auth";

/**
 * PUT /api/posts/[id] — Update a post
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id);

  try {
    const formData = await request.formData();
    const title = (formData.get("title") as string) || "Untitled";
    const content = (formData.get("content") as string) || "";
    const excerpt = (formData.get("excerpt") as string) || "";
    const status = (formData.get("status") as string) || "draft";
    const slug = (formData.get("slug") as string) || "";
    const parentId = parseInt(formData.get("parentId") as string) || 0;
    const featuredImage = (formData.get("featuredImage") as string) || "";
    const categoryIds = JSON.parse((formData.get("categoryIds") as string) || "[]") as number[];
    const tagIds = JSON.parse((formData.get("tagIds") as string) || "[]") as number[];

    const now = new Date().toISOString();

    // Get existing post for revision tracking
    const oldPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
      .then((r) => r[0]);

    if (oldPost) {
      // Save revision
      await db.insert(revisions).values({
        postId: oldPost.id,
        postTitle: oldPost.postTitle,
        postContent: oldPost.postContent,
        postExcerpt: oldPost.postExcerpt,
        postStatus: "inherit",
        postAuthor: parseInt(session.user.id as string),
        postDate: now,
        postDateGmt: now,
      });
    }

    const updateData: Record<string, unknown> = {
      postTitle: title,
      postContent: content,
      postExcerpt: excerpt,
      postStatus: status,
      postModified: now,
      postModifiedGmt: now,
    };

    if (slug) updateData.postName = slug;
    if (parentId) updateData.postParent = parentId;

    await db.update(posts).set(updateData).where(eq(posts.id, postId));

    // Update featured image
    if (featuredImage) {
      const existingMeta = await db
        .select()
        .from(postmeta)
        .where(and(eq(postmeta.metaKey, "_thumbnail_id"), eq(postmeta.postId, postId)))
        .limit(1)
        .then((r) => r[0]);

      if (existingMeta) {
        await db
          .update(postmeta)
          .set({ metaValue: featuredImage })
          .where(eq(postmeta.id, existingMeta.id));
      } else {
        await db.insert(postmeta).values({
          postId,
          metaKey: "_thumbnail_id",
          metaValue: featuredImage,
        });
      }
    }

    // Update categories
    await db
      .delete(termRelationships)
      .where(eq(termRelationships.objectId, postId));

    // Reconnect
    for (const catId of [...categoryIds, ...tagIds]) {
      if (catId) {
        await db.insert(termRelationships).values({
          objectId: postId,
          termTaxonomyId: catId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      redirect: `/admin/posts/${postId}/edit`,
    });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id] — Trash or delete a post
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
  const postId = parseInt(id);

  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      // Permanently delete
      await db.delete(comments).where(eq(comments.commentPostId, postId));
      await db.delete(postmeta).where(eq(postmeta.postId, postId));
      await db.delete(termRelationships).where(eq(termRelationships.objectId, postId));
      await db.delete(revisions).where(eq(revisions.postId, postId));
      await db.delete(posts).where(eq(posts.id, postId));
    } else {
      // Move to trash
      await db
        .update(posts)
        .set({ postStatus: "trash" })
        .where(eq(posts.id, postId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

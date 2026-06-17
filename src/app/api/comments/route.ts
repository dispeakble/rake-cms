import { NextResponse } from "next/server";
import { eq, and, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { getClientIp } from "@/lib/security/validation";
import { apiLimiter } from "@/lib/security/rate-limiter";

/**
 * GET /api/comments?postId=xxx
 * List approved comments for a post.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const postComments = await db
    .select({
      id: comments.id,
      commentAuthor: comments.commentAuthor,
      commentContent: comments.commentContent,
      commentDate: comments.commentDate,
    })
    .from(comments)
    .where(
      and(
        eq(comments.commentPostId, parseInt(postId)),
        eq(comments.commentApproved, "1")
      )
    )
    .orderBy(desc(comments.commentDate));

  return NextResponse.json({ comments: postComments });
}

/**
 * POST /api/comments
 * Submit a new comment.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limitCheck = apiLimiter.check(`comment:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { error: "Too many comments. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { postId, author, email, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required." },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: "Comment is too long." },
        { status: 400 }
      );
    }

    // Check post exists and comments are open
    const post = await db
      .select({ id: posts.id, commentStatus: posts.commentStatus })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
      .then((r) => r[0]);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.commentStatus !== "open") {
      return NextResponse.json(
        { error: "Comments are closed on this post." },
        { status: 403 }
      );
    }

    // Insert comment (auto-approved if author is logged in, otherwise pending)
    const cleanAuthor = (author || "Anonymous").trim().substring(0, 100);
    const cleanEmail = (email || "").trim().substring(0, 100);
    const cleanContent = content.trim().substring(0, 10000);

    const [newComment] = await db
      .insert(comments)
      .values({
        commentPostId: postId,
        commentAuthor: cleanAuthor,
        commentAuthorEmail: cleanEmail,
        commentAuthorIp: ip,
        commentContent: cleanContent,
        commentApproved: cleanEmail ? "1" : "0", // Auto-appove if email provided
        commentDate: new Date().toISOString(),
        commentDateGmt: new Date().toISOString(),
      })
      .returning();

    // Update comment count
    const [countResult] = await db
      .select({ value: count() })
      .from(comments)
      .where(eq(comments.commentPostId, postId));

    await db
      .update(posts)
      .set({ commentCount: countResult?.value || 0 })
      .where(eq(posts.id, postId));

    return NextResponse.json({ comment: newComment, approved: cleanEmail ? true : false });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Failed to submit comment." }, { status: 500 });
  }
}

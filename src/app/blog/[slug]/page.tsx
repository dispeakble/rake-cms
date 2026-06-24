import { db } from "@/db";
import { posts, comments as commentsTable, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import RenderBlocks from "@/components/editor/RenderBlocks";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import CommentForm from "@/components/comment/CommentForm";
import type { Metadata } from "next";
import Link from "next/link";

export default async function SinglePost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await db
    .select()
    .from(posts)
    .where(and(eq(posts.postName, slug), eq(posts.postStatus, "publish")))
    .limit(1)
    .then((r) => r[0]);

  if (!post) notFound();

  const postComments = await db
    .select({
      id: commentsTable.id,
      commentAuthor: commentsTable.commentAuthor,
      commentContent: commentsTable.commentContent,
      commentDate: commentsTable.commentDate,
    })
    .from(commentsTable)
    .where(and(eq(commentsTable.commentPostId, post.id), eq(commentsTable.commentApproved, "1")))
    .orderBy(desc(commentsTable.commentDate));

  const author = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, post.postAuthor))
    .limit(1)
    .then((r) => r[0]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-light)] cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Post header */}
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h1 className="mb-4 text-4xl font-bold gradient-text">{post.postTitle}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {author?.displayName || "Unknown"}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.postDate).toLocaleDateString()}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>

          {/* Post content */}
          <div className="prose prose-invert max-w-none border border-white/10 bg-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="text-gray-300 leading-relaxed">
              <RenderBlocks blocksJson={post.postContent} />
            </div>
          </div>
        </article>

        {/* Comments section */}
        <section className="border-t border-white/10 py-12">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Comments{" "}
                <span className="text-[var(--color-gold)]">({postComments.length})</span>
              </h2>

              {postComments.length === 0 && (
                <p className="mb-6 text-gray-400">No comments yet. Be the first to share your thoughts!</p>
              )}

              <div className="space-y-4">
                {postComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/30"
                  >
                    <div className="mb-3 flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gold)]/20 text-xs font-bold text-[var(--color-gold)]">
                        {comment.commentAuthor.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-white">{comment.commentAuthor}</span>
                        <span className="ml-2 text-gray-500">{new Date(comment.commentDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{comment.commentContent}</p>
                  </div>
                ))}
              </div>

              {/* Comment Form */}
              <div className="mt-8 border-t border-white/10 pt-8">
                <CommentForm postId={post.id} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db
    .select({ postTitle: posts.postTitle, postExcerpt: posts.postExcerpt })
    .from(posts)
    .where(and(eq(posts.postName, slug), eq(posts.postStatus, "publish")))
    .limit(1)
    .then((r) => r[0]);

  return {
    title: post?.postTitle || "Post",
    description: post?.postExcerpt || "",
  };
}

import { db } from "@/db";
import { posts, comments as commentsTable, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import RenderBlocks from "@/components/editor/RenderBlocks";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import CommentForm from "@/components/comment/CommentForm";
import type { Metadata } from "next";

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-4 text-4xl font-bold">{post.postTitle}</h1>
          <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {author?.displayName || "Unknown"}</span>
            <span>{new Date(post.postDate).toLocaleDateString()}</span>
            <span>{post.commentCount} comments</span>
          </div>
          <div className="prose max-w-none">
            <RenderBlocks blocksJson={post.postContent} />
          </div>
        </article>

        <section className="border-t py-12">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 text-2xl font-bold">Comments ({postComments.length})</h2>
            {postComments.length === 0 && <p className="text-muted-foreground">No comments yet.</p>}
            <div className="space-y-4">
              {postComments.map((comment) => (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <span className="font-medium">{comment.commentAuthor}</span>
                    <span className="text-muted-foreground">{new Date(comment.commentDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.commentContent}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <CommentForm postId={post.id} />
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

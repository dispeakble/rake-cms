import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { desc, eq, and, or } from "drizzle-orm";

export default async function AdminComments() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allComments = await db
    .select({
      id: comments.id,
      commentAuthor: comments.commentAuthor,
      commentContent: comments.commentContent,
      commentDate: comments.commentDate,
      commentApproved: comments.commentApproved,
      commentPostId: comments.commentPostId,
      postTitle: posts.postTitle,
    })
    .from(comments)
    .leftJoin(posts, eq(comments.commentPostId, posts.id))
    .orderBy(desc(comments.commentDate))
    .limit(100);

  const pendingComments = allComments.filter((c) => c.commentApproved !== "1");
  const approvedComments = allComments.filter((c) => c.commentApproved === "1");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comments</h1>
        <span className="text-sm text-muted-foreground">{allComments.length} total</span>
      </div>

      {pendingComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-600">
            Pending Review ({pendingComments.length})
          </h2>
          <div className="rounded-lg border divide-y">
            {pendingComments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {pendingComments.length > 0 ? "Approved" : "All Comments"}
        </h2>
        {approvedComments.length === 0 && pendingComments.length === 0 ? (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            No comments yet.
          </div>
        ) : (
          <div className="rounded-lg border divide-y">
            {approvedComments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
}: {
  comment: {
    id: number;
    commentAuthor: string;
    commentContent: string;
    commentDate: string;
    commentApproved: string;
    commentPostId: number;
    postTitle: string | null;
  };
}) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.commentAuthor}</span>
            <span className="text-xs text-muted-foreground">
              on &ldquo;{comment.postTitle || "Untitled"}&rdquo;
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.commentDate).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap">{comment.commentContent}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {comment.commentApproved !== "1" && (
            <form action={`/api/comments/${comment.id}/approve`} method="POST">
              <button className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90">
                Approve
              </button>
            </form>
          )}
          <form action={`/api/comments/${comment.id}/delete`} method="POST">
            <button className="rounded bg-destructive/10 px-3 py-1 text-xs text-destructive hover:bg-destructive/20">
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

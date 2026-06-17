import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const post = await db.select().from(posts).where(eq(posts.id, parseInt(id))).limit(1).then(r => r[0]);
  if (!post) notFound();

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Post</h1>
      <div className="space-y-4 rounded-lg border p-6">
        <input
          type="text"
          defaultValue={post.postTitle}
          placeholder="Post title"
          className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status: {post.postStatus}</span>
          <span>Type: {post.postType}</span>
          <span>ID: {post.id}</span>
        </div>
        <div className="min-h-[300px] rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          Block editor will render here with existing content.
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Update</button>
          <button className="rounded-md border px-4 py-2 text-sm">Move to Draft</button>
        </div>
      </div>
    </div>
  );
}

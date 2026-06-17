import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminPosts() {
  const allPosts = await db
    .select({
      id: posts.id,
      postTitle: posts.postTitle,
      postStatus: posts.postStatus,
      postType: posts.postType,
      postDate: posts.postDate,
      commentCount: posts.commentCount,
    })
    .from(posts)
    .orderBy(desc(posts.postDate))
    .limit(50);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/admin/posts/new" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Add New</Link>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Comments</div>
        </div>
        <div className="divide-y">
          {allPosts.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No posts found.</p>}
          {allPosts.map((post) => (
            <Link key={post.id} href={`/admin/posts/${post.id}/edit`} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-muted/50">
              <div className="col-span-5 truncate font-medium">{post.postTitle || "(untitled)"}</div>
              <div className="col-span-2 text-muted-foreground">{post.postType}</div>
              <div className="col-span-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{post.postStatus}</span>
              </div>
              <div className="col-span-2 text-muted-foreground">{post.postDate}</div>
              <div className="col-span-1 text-right text-muted-foreground">{post.commentCount}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

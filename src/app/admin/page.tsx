import { auth } from "@/auth";
import { db } from "@/db";
import { posts, comments, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [postCount] = await db.select({ value: count() }).from(posts);
  const [commentCount] = await db.select({ value: count() }).from(comments);
  const [userCount] = await db.select({ value: count() }).from(users);

  const recentPosts = await db
    .select({ id: posts.id, postTitle: posts.postTitle, postStatus: posts.postStatus, postDate: posts.postDate })
    .from(posts)
    .orderBy(posts.postDate)
    .limit(5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {session?.user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Posts</p>
          <p className="text-3xl font-bold">{postCount?.value || 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Comments</p>
          <p className="text-3xl font-bold">{commentCount?.value || 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Users</p>
          <p className="text-3xl font-bold">{userCount?.value || 0}</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">Recent Posts</h2>
          <Link href="/admin/posts/new" className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">New Post</Link>
        </div>
        <div className="divide-y">
          {recentPosts.length === 0 && <p className="p-4 text-sm text-muted-foreground">No posts yet.</p>}
          {recentPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{post.postTitle || "(untitled)"}</p>
                <p className="text-xs text-muted-foreground">{post.postDate}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{post.postStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

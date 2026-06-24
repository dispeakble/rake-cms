import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, usermeta, posts, comments } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt(session.user.id as string);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((r) => r[0]);

  if (!user) redirect("/login");

  // Fetch user meta
  const userMetaRows = await db
    .select()
    .from(usermeta)
    .where(eq(usermeta.userId, userId));

  const userMeta: Record<string, string> = {};
  for (const m of userMetaRows) {
    if (m.metaKey) userMeta[m.metaKey] = m.metaValue || "";
  }

  const [postCount] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.postAuthor, user.id));

  const recentPosts = await db
    .select({ id: posts.id, postTitle: posts.postTitle, postStatus: posts.postStatus, postDate: posts.postDate })
    .from(posts)
    .where(eq(posts.postAuthor, user.id))
    .orderBy(desc(posts.postDate))
    .limit(10);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border bg-card p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {(user.displayName || user.userLogin)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.displayName || user.userLogin}</h1>
              <p className="text-sm text-muted-foreground">{user.userEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(user.userRegistered).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Posts</p>
            <p className="text-3xl font-bold">{postCount?.value || 0}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Quick Links</p>
            <div className="mt-2 space-y-1">
              <Link href="/admin" className="block text-sm text-primary underline">Dashboard</Link>
              <Link href="/admin/posts/new" className="block text-sm text-primary underline">New Post</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-8">
          <h2 className="text-xl font-bold mb-4">My Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="divide-y">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-sm font-medium hover:text-primary">
                      {post.postTitle || "(untitled)"}
                    </Link>
                    <p className="text-xs text-muted-foreground">{new Date(post.postDate).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{post.postStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border bg-card p-8">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <form action="/api/profile" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                name="displayName"
                defaultValue={user.displayName}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user.userEmail}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={userMeta.first_name || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={userMeta.last_name || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nickname</label>
              <input
                type="text"
                name="nickname"
                defaultValue={userMeta.nickname || ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About / Bio</label>
              <textarea
                name="description"
                defaultValue={userMeta.description || ""}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                defaultValue={userMeta.phone || ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                defaultValue={userMeta.location || ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Required to change settings"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Leave blank to keep current"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getPostType, initializePostTypes, getPostTypeLabels } from "@/lib/cpt";
import { notFound } from "next/navigation";

export default async function AdminPostTypeList({
  params,
}: {
  params: Promise<{ postType: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { postType } = await params;

  // Check if this is a valid post type
  initializePostTypes();
  const ptConfig = getPostType(postType);
  if (!ptConfig) {
    notFound();
  }

  const labels = getPostTypeLabels(postType, ptConfig);

  const allPosts = await db
    .select({
      id: posts.id,
      postTitle: posts.postTitle,
      postStatus: posts.postStatus,
      postDate: posts.postDate,
      postAuthor: posts.postAuthor,
      commentCount: posts.commentCount,
    })
    .from(posts)
    .where(eq(posts.postType, postType))
    .orderBy(desc(posts.postDate))
    .limit(100);

  const activePosts = allPosts.filter((p) => p.postStatus !== "trash");
  const trashedPosts = allPosts.filter((p) => p.postStatus === "trash");

  const isHierarchical = ptConfig.hierarchical;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{labels.name}</h1>
        <div className="flex items-center gap-3">
          {trashedPosts.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {trashedPosts.length} in trash
            </span>
          )}
          <Link
            href={`/admin/${postType}/new`}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {labels.addNewItem}
          </Link>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className={`${isHierarchical ? "col-span-7" : "col-span-5"}`}>
            Title
          </div>
          {!isHierarchical && (
            <div className="col-span-2">Author</div>
          )}
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Comments</div>
        </div>
        <div className="divide-y">
          {activePosts.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {labels.notFound}.
            </p>
          )}
          {activePosts.map((post) => (
            <div
              key={post.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-muted/50 items-center"
            >
              <Link
                href={`/admin/${postType}/${post.id}/edit`}
                className={`truncate font-medium hover:text-primary ${
                  isHierarchical ? "col-span-7" : "col-span-5"
                }`}
              >
                {post.postTitle || "(untitled)"}
              </Link>
              {!isHierarchical && (
                <div className="col-span-2 text-muted-foreground">
                  User #{post.postAuthor}
                </div>
              )}
              <div className="col-span-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    post.postStatus === "publish"
                      ? "bg-green-100 text-green-700"
                      : post.postStatus === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {post.postStatus}
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground text-xs">
                {new Date(post.postDate).toLocaleDateString()}
              </div>
              <div className="col-span-1 text-right text-muted-foreground">
                {post.commentCount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trash Section */}
      {trashedPosts.length > 0 && (
        <div className="rounded-lg border border-destructive/20">
          <div className="border-b bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive">
            Trash ({trashedPosts.length})
          </div>
          <div className="divide-y">
            {trashedPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="text-muted-foreground line-through">
                  {post.postTitle || "(untitled)"}
                </span>
                <div className="flex gap-2">
                  <form
                    action={`/api/posts/${post.id}/restore`}
                    method="POST"
                    className="inline"
                  >
                    <button className="text-xs text-primary hover:underline">
                      Restore
                    </button>
                  </form>
                  <form
                    action={`/api/posts/${post.id}`}
                    method="POST"
                    className="inline"
                  >
                    <input type="hidden" name="_method" value="DELETE" />
                    <input type="hidden" name="force" value="true" />
                    <button className="text-xs text-destructive hover:underline">
                      Delete Permanently
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

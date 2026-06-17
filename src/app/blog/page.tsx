import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";

const POSTS_PER_PAGE = 10;

export default async function BlogArchive({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1"));
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.postStatus, "publish"))
    .orderBy(desc(posts.postDate))
    .limit(POSTS_PER_PAGE)
    .offset(offset);

  const [totalResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.postStatus, "publish"));
  const totalPosts = totalResult?.value || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Blog</h1>

      <div className="space-y-8">
        {allPosts.map((post) => (
          <article key={post.id} className="border-b pb-8">
            <Link href={`/blog/${post.postName}`} className="group">
              <h2 className="text-2xl font-semibold group-hover:text-primary">{post.postTitle || "(untitled)"}</h2>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {new Date(post.postDate).toLocaleDateString()} — {post.commentCount} comments
            </p>
            <p className="mt-2 text-muted-foreground">{post.postExcerpt || post.postContent.substring(0, 200)}</p>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <Link href={`/blog?page=${currentPage - 1}`} className="rounded-md border px-4 py-2 text-sm">Previous</Link>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/blog?page=${currentPage + 1}`} className="rounded-md border px-4 py-2 text-sm">Next</Link>
          )}
        </div>
      )}
    </div>
  );
}

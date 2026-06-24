import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";

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
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Dark header with glassmorphism */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h1 className="text-4xl font-bold gradient-text">Blog</h1>
            <p className="mt-2 text-gray-400">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"} published
            </p>
          </div>

          <div className="space-y-6">
            {allPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/40 hover:shadow-[0_0_30px_rgba(var(--color-gold-rgb),0.08)]"
              >
                <Link href={`/blog/${post.postName}`} className="cursor-pointer">
                  <h2 className="text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {post.postTitle || "(untitled)"}
                  </h2>
                </Link>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                  <span>{new Date(post.postDate).toLocaleDateString()}</span>
                  <span className="text-white/20">•</span>
                  <span>{post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}</span>
                </div>
                <p className="mt-3 leading-relaxed text-gray-300">
                  {post.postExcerpt || post.postContent.substring(0, 200)}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.postName}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-light)] cursor-pointer"
                  >
                    Read more
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:text-[var(--color-gold)] hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.15)] cursor-pointer"
                >
                  ← Previous
                </Link>
              )}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/blog?page=${pageNum}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                      pageNum === currentPage
                        ? "border border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)] shadow-[0_0_15px_rgba(var(--color-gold-rgb),0.2)]"
                        : "border border-white/10 bg-white/5 text-gray-400 hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-gold)]/50 hover:text-[var(--color-gold)] hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.15)] cursor-pointer"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

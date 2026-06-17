import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const searchResults = q
    ? await db
        .select({ id: posts.id, postTitle: posts.postTitle, postName: posts.postName, postDate: posts.postDate, postExcerpt: posts.postExcerpt })
        .from(posts)
        .where(and(eq(posts.postStatus, "publish"), or(ilike(posts.postTitle, `%${q}%`), ilike(posts.postContent, `%${q}%`))))
        .orderBy(desc(posts.postDate))
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Search</h1>
      
      <form className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={q || ""}
          placeholder="Search posts..."
          className="w-full max-w-md rounded-md border border-input bg-background px-4 py-2 text-sm"
        />
        <button type="submit" className="ml-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Search</button>
      </form>

      {q && (
        <p className="mb-6 text-sm text-muted-foreground">
          Search results for: <strong>{q}</strong> ({searchResults.length} found)
        </p>
      )}

      <div className="space-y-6">
        {searchResults.map((post) => (
          <article key={post.id} className="border-b pb-6">
            <Link href={`/blog/${post.postName}`} className="group">
              <h2 className="text-xl font-semibold group-hover:text-primary">{post.postTitle}</h2>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{new Date(post.postDate).toLocaleDateString()}</p>
            <p className="mt-2 text-muted-foreground">{post.postExcerpt}</p>
          </article>
        ))}
        {q && searchResults.length === 0 && <p className="text-muted-foreground">No results found.</p>}
      </div>
    </div>
  );
}

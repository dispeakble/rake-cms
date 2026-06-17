import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const term = await db
    .select()
    .from(terms)
    .where(eq(terms.slug, slug))
    .limit(1)
    .then((r) => r[0]);

  if (!term) notFound();

  const taxonomy = await db
    .select()
    .from(termTaxonomy)
    .where(and(eq(termTaxonomy.termId, term.id), eq(termTaxonomy.taxonomy, "category")))
    .limit(1)
    .then((r) => r[0]);

  if (!taxonomy) notFound();

  const categoryPosts = await db
    .select({ id: posts.id, postTitle: posts.postTitle, postName: posts.postName, postDate: posts.postDate, postExcerpt: posts.postExcerpt })
    .from(posts)
    .innerJoin(termRelationships, eq(posts.id, termRelationships.objectId))
    .where(and(eq(termRelationships.termTaxonomyId, taxonomy.id), eq(posts.postStatus, "publish")))
    .orderBy(desc(posts.postDate));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="mb-2 text-3xl font-bold">{term.name}</h1>
          <p className="mb-8 text-sm text-muted-foreground">{categoryPosts.length} posts</p>

          <div className="space-y-6">
            {categoryPosts.map((post) => (
              <article key={post.id} className="border-b pb-6">
                <Link href={`/blog/${post.postName}`} className="group">
                  <h2 className="text-xl font-semibold group-hover:text-primary">{post.postTitle}</h2>
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{new Date(post.postDate).toLocaleDateString()}</p>
                <p className="mt-2 text-muted-foreground">{post.postExcerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

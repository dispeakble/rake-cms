import { db } from "@/db";
import { terms, termTaxonomy } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export default async function AdminCategories() {
  const categories = await db
    .select({
      id: termTaxonomy.id,
      name: terms.name,
      slug: terms.slug,
      taxonomy: termTaxonomy.taxonomy,
      count: termTaxonomy.count,
    })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "category"));

  const tags = await db
    .select({
      id: termTaxonomy.id,
      name: terms.name,
      slug: terms.slug,
      taxonomy: termTaxonomy.taxonomy,
      count: termTaxonomy.count,
    })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "post_tag"));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Categories & Tags</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
        <div className="rounded-lg border divide-y">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">/{cat.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">{cat.count} posts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tags ({tags.length})</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-muted px-3 py-1 text-xs">
              {tag.name} ({tag.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import { db } from "@/db";
import { terms, termTaxonomy } from "@/db/schema";
import { eq } from "drizzle-orm";
import AddTagForm from "@/components/admin/AddTagForm";

export default async function AdminCategories() {
  const categories = await db
    .select({
      id: termTaxonomy.id,
      termId: terms.id,
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
      termId: terms.id,
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
          <div className="rounded-lg border divide-y">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{cat.count} posts</span>
                  <form action="/api/tags" method="POST" className="inline">
                    <input type="hidden" name="_method" value="DELETE" />
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="hidden" name="taxonomy" value="category" />
                    <button className="text-xs text-destructive hover:underline">Delete</button>
                  </form>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
          <AddTagForm taxonomy="category" label="Category" />
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tags ({tags.length})</h2>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {tag.name} ({tag.count})
                  <form action="/api/tags" method="POST" className="inline">
                    <input type="hidden" name="_method" value="DELETE" />
                    <input type="hidden" name="id" value={tag.id} />
                    <input type="hidden" name="taxonomy" value="post_tag" />
                    <button className="ml-1 text-destructive hover:font-bold">&times;</button>
                  </form>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags yet.</p>
          )}
          <AddTagForm taxonomy="post_tag" label="Tag" />
        </div>
      </div>
    </div>
  );
}

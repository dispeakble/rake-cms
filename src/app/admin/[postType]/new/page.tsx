import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { terms, termTaxonomy, posts as postsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { listFiles } from "@/lib/media/storage";
import PostEditor from "@/components/admin/PostEditor";
import { getPostType, initializePostTypes, getPostTypeLabels, getObjectTaxonomies } from "@/lib/cpt";
import { isTaxonomyHierarchical } from "@/lib/cpt/taxonomies";
import { notFound } from "next/navigation";
import { initializeTaxonomies } from "@/lib/cpt/taxonomies";

export default async function NewPostTypeContent({
  params,
}: {
  params: Promise<{ postType: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { postType } = await params;
  initializePostTypes();
  initializeTaxonomies();

  const ptConfig = getPostType(postType);
  if (!ptConfig) notFound();

  const labels = getPostTypeLabels(postType, ptConfig);

  // Fetch associated taxonomies
  const associatedTaxonomies = getObjectTaxonomies(postType);
  let fetchedCategories: { id: number; name: string; slug: string }[] = [];
  let fetchedTags: { id: number; name: string; slug: string }[] = [];

  for (const tax of associatedTaxonomies) {
    const isHierarchical = isTaxonomyHierarchical(tax);
    const items = await db
      .select({ id: termTaxonomy.id, name: terms.name, slug: terms.slug })
      .from(termTaxonomy)
      .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
      .where(eq(termTaxonomy.taxonomy, tax));

    if (isHierarchical) {
      fetchedCategories = [...fetchedCategories, ...items];
    } else {
      fetchedTags = [...fetchedTags, ...items];
    }
  }

  // Fetch pages (for hierarchical types only)
  const pages = ptConfig.hierarchical
    ? await db
        .select({
          id: postsTable.id,
          postTitle: postsTable.postTitle,
          postParent: postsTable.postParent,
        })
        .from(postsTable)
        .where(
          and(eq(postsTable.postType, postType), eq(postsTable.postStatus, "publish"))
        )
        .orderBy(desc(postsTable.postDate))
    : [];

  // Fetch media files
  let mediaList: { url: string; path: string }[] = [];
  try {
    mediaList = await listFiles();
  } catch {
    // Media library might not be available
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{labels.addNewItem}</h1>
      <PostEditor
        categories={fetchedCategories}
        tags={fetchedTags}
        pages={pages}
        media={mediaList}
        defaultType={postType}
      />
    </div>
  );
}

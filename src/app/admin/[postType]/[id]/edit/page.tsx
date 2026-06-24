import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { listFiles } from "@/lib/media/storage";
import PostEditor from "@/components/admin/PostEditor";
import { getPostType, initializePostTypes, getPostTypeLabels, getObjectTaxonomies } from "@/lib/cpt";
import { isTaxonomyHierarchical } from "@/lib/cpt/taxonomies";
import { initializeTaxonomies } from "@/lib/cpt/taxonomies";

export default async function EditPostTypeContent({
  params,
}: {
  params: Promise<{ postType: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { postType, id } = await params;
  initializePostTypes();
  initializeTaxonomies();

  const ptConfig = getPostType(postType);
  if (!ptConfig) notFound();

  const labels = getPostTypeLabels(postType, ptConfig);

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, parseInt(id)))
    .limit(1)
    .then((r) => r[0]);

  if (!post) notFound();

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

  // Fetch pages of the same type (for hierarchical types)
  const pages = ptConfig.hierarchical
    ? await db
        .select({
          id: posts.id,
          postTitle: posts.postTitle,
          postParent: posts.postParent,
        })
        .from(posts)
        .where(
          and(eq(posts.postType, postType), eq(posts.postStatus, "publish"))
        )
        .orderBy(desc(posts.postDate))
    : [];

  // Fetch media
  let mediaList: { url: string; path: string }[] = [];
  try {
    mediaList = await listFiles();
  } catch {
    // Media library might not be available
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Edit {ptConfig.singularLabel}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Status: <span className="font-medium">{post.postStatus}</span>
          </span>
          <span>
            Type: <span className="font-medium">{postType}</span>
          </span>
          <span>ID: {post.id}</span>
        </div>
      </div>
      <PostEditor
        initialData={post}
        categories={fetchedCategories}
        tags={fetchedTags}
        pages={pages}
        media={mediaList}
        defaultType={postType}
      />
    </div>
  );
}

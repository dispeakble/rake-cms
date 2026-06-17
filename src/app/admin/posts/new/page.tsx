import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { terms, termTaxonomy, posts as postsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { listFiles } from "@/lib/media/storage";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPost() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all categories
  const categories = await db
    .select({ id: termTaxonomy.id, name: terms.name, slug: terms.slug })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "category"));

  // Fetch all tags
  const tags = await db
    .select({ id: termTaxonomy.id, name: terms.name, slug: terms.slug })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "post_tag"));

  // Fetch all pages (for parent selection)
  const pages = await db
    .select({ id: postsTable.id, postTitle: postsTable.postTitle, postParent: postsTable.postParent })
    .from(postsTable)
    .where(and(eq(postsTable.postType, "page"), eq(postsTable.postStatus, "publish")))
    .orderBy(desc(postsTable.postDate));

  // Fetch media files
  let mediaList: { url: string; path: string }[] = [];
  try {
    mediaList = await listFiles();
  } catch {
    // Media library might not be available
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Post</h1>
      <PostEditor categories={categories} tags={tags} pages={pages} media={mediaList} />
    </div>
  );
}

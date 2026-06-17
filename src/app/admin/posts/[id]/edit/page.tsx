import { db } from "@/db";
import { posts, terms, termTaxonomy, termRelationships, postmeta } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listFiles } from "@/lib/media/storage";
import PostEditor from "@/components/admin/PostEditor";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const post = await db.select().from(posts).where(eq(posts.id, parseInt(id))).limit(1).then(r => r[0]);
  if (!post) notFound();

  // Fetch categories
  const categories = await db
    .select({ id: termTaxonomy.id, name: terms.name, slug: terms.slug })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "category"));

  // Fetch tags
  const tags = await db
    .select({ id: termTaxonomy.id, name: terms.name, slug: terms.slug })
    .from(termTaxonomy)
    .innerJoin(terms, eq(terms.id, termTaxonomy.termId))
    .where(eq(termTaxonomy.taxonomy, "post_tag"));

  // Fetch pages
  const pages = await db
    .select({ id: posts.id, postTitle: posts.postTitle, postParent: posts.postParent })
    .from(posts)
    .where(and(eq(posts.postType, "page"), eq(posts.postStatus, "publish")))
    .orderBy(desc(posts.postDate));

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
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Status: <span className="font-medium">{post.postStatus}</span></span>
          <span>Type: <span className="font-medium">{post.postType}</span></span>
          <span>ID: {post.id}</span>
        </div>
      </div>
      <PostEditor
        initialData={post}
        categories={categories}
        tags={tags}
        pages={pages}
        media={mediaList}
      />
    </div>
  );
}

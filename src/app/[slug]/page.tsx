import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import RenderBlocks from "@/components/editor/RenderBlocks";
import Header from "@/components/theme/Header";
import Footer from "@/components/theme/Footer";
import type { Metadata } from "next";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await db
    .select()
    .from(posts)
    .where(and(eq(posts.postName, slug), eq(posts.postType, "page"), eq(posts.postStatus, "publish")))
    .limit(1)
    .then((r) => r[0]);

  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-4xl font-bold">{page.postTitle}</h1>
          <div className="prose max-w-none">
            <RenderBlocks blocksJson={page.postContent} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await db
    .select({ postTitle: posts.postTitle })
    .from(posts)
    .where(and(eq(posts.postName, slug), eq(posts.postType, "page")))
    .limit(1)
    .then((r) => r[0]);

  return { title: page?.postTitle || "Page" };
}

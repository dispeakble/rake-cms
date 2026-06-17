/**
 * RSS 2.0 feed for published posts.
 * Available at /feed.xml or /feed/
 */
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const siteName = "Rake CMS";

  const allPosts = await db
    .select({
      id: posts.id,
      postTitle: posts.postTitle,
      postContent: posts.postContent,
      postExcerpt: posts.postExcerpt,
      postName: posts.postName,
      postDate: posts.postDate,
      postDateGmt: posts.postDateGmt,
      guid: posts.guid,
    })
    .from(posts)
    .where(eq(posts.postStatus, "publish"))
    .orderBy(desc(posts.postDate))
    .limit(50);

  const escapeXml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = allPosts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.postTitle || "Untitled")}</title>
      <link>${siteUrl}/blog/${escapeXml(post.postName)}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${escapeXml(post.postName)}</guid>
      <pubDate>${new Date(post.postDateGmt || post.postDate).toUTCString()}</pubDate>
      <description>${escapeXml(post.postExcerpt || post.postContent?.substring(0, 500) || "")}</description>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <link>${siteUrl}</link>
    <description>Latest posts from ${escapeXml(siteName)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

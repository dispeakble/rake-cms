/**
 * Site Seeder — populates the CMS with scraped content.
 *
 * Creates:
 *  - Homepage (page)
 *  - About page
 *  - Services page
 *  - Contact page
 *  - Blog posts from scraped content
 *  - Navigation menus
 *  - Site options (title, description)
 *  - Categories matching business type
 */

import { db } from "@/db";
import { posts, options, terms, termTaxonomy } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ScrapedSite } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";
import type { BraveSearchResult } from "@/lib/scraper/brave-scraper";

export interface SeederResult {
  pagesCreated: number;
  siteTitle: string;
  siteDescription: string;
}

/**
 * Create or update a site option.
 */
async function setOption(name: string, value: string, siteId: number) {
  const existing = await db
    .select()
    .from(options)
    .where(and(eq(options.optionName, name), eq(options.siteId, siteId)))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    await db
      .update(options)
      .set({ optionValue: value })
      .where(and(eq(options.optionName, name), eq(options.siteId, siteId)));
  } else {
    await db.insert(options).values({
      optionName: name,
      optionValue: value,
      autoload: "yes",
      siteId,
    });
  }
}

/**
 * Create a page/post from scraped content.
 */
async function createPage(
  title: string,
  slug: string,
  content: string,
  excerpt: string,
  type: "page" | "post" = "page",
  status: "publish" | "draft" = "publish",
  siteId: number = 0
) {
  const existing = await db
    .select()
    .from(posts)
    .where(and(eq(posts.postName, slug), eq(posts.siteId, siteId)))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    await db
      .update(posts)
      .set({
        postTitle: title,
        postContent: content,
        postExcerpt: excerpt,
        postStatus: status,
      })
      .where(and(eq(posts.postName, slug), eq(posts.siteId, siteId)));
    console.log(`   ✓ Updated: ${title}`);
  } else {
    await db.insert(posts).values({
      postTitle: title,
      postName: slug,
      postContent: content,
      postExcerpt: excerpt,
      postType: type,
      postStatus: status,
      guid: `/${slug}`,
      siteId,
    });
    console.log(`   ✓ Created: ${title}`);
  }
}

/**
 * Build page content from a scraped page's headings and paragraphs.
 */
function buildPageContent(page: ScrapedSite["pages"][0]): { content: string; excerpt: string } {
  const parts: string[] = [];

  for (const h of page.headings) {
    parts.push(`${"#".repeat(h.level)} ${h.text}`);
  }

  // Add paragraphs
  parts.push(page.paragraphs.join("\n\n"));

  const fullContent = parts.join("\n\n");
  const excerpt = page.paragraphs[0]?.substring(0, 200) || page.title;

  return {
    content: fullContent || `Content from ${page.url}`,
    excerpt,
  };
}

/**
 * Generate services content from business data.
 */
function generateServicesContent(business: BusinessData): string {
  return `# Our Services

Welcome to ${business.name}. We are proud to serve the ${business.city || "local"} community.

${
  business.description
    ? `${business.description}\n\n`
    : ""
}

${
  business.hours.length > 0
    ? `## Business Hours\n\n${business.hours.map((h) => `- ${h}`).join("\n")}\n\n`
    : ""
}

## Contact Information

- **Address:** ${business.address || "Available upon request"}
- **Phone:** ${business.phone || "Available upon request"}
- **Email:** ${business.website || "Available upon request"}

We look forward to serving you!`;
}

/**
 * Generate homepage content from scraped data.
 */
function generateHomepageContent(site: ScrapedSite, business: BusinessData | null): string {
  const heading = site.pages[0]?.headings[0]?.text || `Welcome to ${site.businessName}`;
  const paragraphs = site.pages[0]?.paragraphs.slice(0, 2) || [];

  return `# ${heading}

${paragraphs.join("\n\n")}

${
  business?.rating && business.rating > 0
    ? `## Customer Rating\n\n⭐ ${business.rating}/5 based on ${business.totalRatings} reviews.\n`
    : ""
}

${
  business?.reviews && business.reviews.length > 0
    ? `## What Our Customers Say\n\n${business.reviews.map((r) => `> "${r.text}" — ${r.author} (${r.rating}/5)`).join("\n\n")}`
    : ""
}`;
}

/**
 * Main seeder function — populates CMS with all content.
 */
export async function seedSite(
  site: ScrapedSite | null,
  business: BusinessData | null,
  siteId: number = 0,
  /** Optional Brave Search enrichment data */
  braveData?: BraveSearchResult | null
): Promise<SeederResult> {
  const name = business?.name || site?.businessName || "My Business";
  const description = site?.pages[0]?.metaDescription || business?.description || `Welcome to ${name}`;

  console.log(`\n🌱 Seeding CMS with content for: ${name}`);

  // 1. Set site options
  console.log("\n📋 Setting site options...");
  await setOption("blogname", name, siteId);
  await setOption("blogdescription", description, siteId);

  // 2. Create pages from scraped content
  console.log("\n📄 Creating pages...");
  let pagesCreated = 0;

  if (site) {
    for (const page of site.pages) {
      const urlPath = new URL(page.url).pathname.replace(/\/$/, "") || "/";
      const slug = urlPath === "/" ? "home" : urlPath.replace(/^\//, "").replace(/\//g, "-");
      const { content, excerpt } = buildPageContent(page);

      if (content.trim().length > 10) {
        await createPage(
          slug === "home" ? "Home" : page.title || slug,
          slug,
          content,
          excerpt,
          slug === "home" ? "page" : "page",
          "publish",
          siteId
        );
        pagesCreated++;
      }
    }
  }

  // 3. Create business-specific pages from Maps data
  if (business) {
    const businessSlug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Services page
    await createPage(
      "Our Services",
      "services",
      generateServicesContent(business),
      `Services offered by ${business.name}`,
      "page",
      "publish",
      siteId
    );
    pagesCreated++;

    // About page
    await createPage(
      "About Us",
      "about",
      `# About ${business.name}\n\n${business.description || "We are dedicated to providing exceptional service to our community, bringing years of experience and a passion for excellence."}\n\n## Our Mission\n\nOur mission is to deliver outstanding quality and customer satisfaction in everything we do. We believe in building lasting relationships with our customers through trust, transparency, and exceptional service.\n\n${
        business.rating > 0
          ? `## Our Reputation\n\nWith a rating of ${business.rating}/5 from ${business.totalRatings} reviews, we take pride in the trust our customers place in us.`
          : ""
      }`,
      `About ${business.name}`,
      "page",
      "publish",
      siteId
    );
    pagesCreated++;

    // Contact page
    await createPage(
      "Contact Us",
      "contact",
      `# Contact Us\n\n## ${business.name}\n\n- **Address:** ${business.address}\n- **Phone:** ${business.phone}\n- **Website:** ${business.website}\n\n## Business Hours\n\n${business.hours.map((h) => `- ${h}`).join("\n")}`,
      `Get in touch with ${business.name}`,
      "page",
      "publish",
      siteId
    );
    pagesCreated++;
  }

  // If no pages were created from scraping, create generic ones
  if (pagesCreated === 0) {
    console.log("   No scraped content found — creating generic pages");
    await createPage("Home", "home", `# ${name}\n\n${description}`, description, "page", "publish", siteId);
    pagesCreated++;

    await createPage(
      "About Us",
      "about",
      `# About ${name}\n\nWe are dedicated to providing exceptional service to our community.`,
      `About ${name}`,
      "page",
      "publish",
      siteId
    );
    pagesCreated++;

    await createPage(
      "Contact Us",
      "contact",
      `# Contact Us\n\nGet in touch with us today.`,
      `Contact ${name}`,
      "page",
      "publish",
      siteId
    );
    pagesCreated++;
  }

  // 4. Create homepage from combined data
  if (site || business || braveData) {
    const braveFallback: ScrapedSite = {
      businessName: name,
      pages: [{
        url: "/",
        title: name,
        metaDescription: braveData?.description || description,
        headings: [{ level: 1, text: `Welcome to ${name}` }],
        paragraphs: braveData?.snippets.slice(0, 3) || [description],
        images: [],
        links: [],
        carousel: [],
        footerText: "",
        externalLinks: [],
        languageLinks: [],
        contactInfo: {
          phone: [],
          email: [],
          address: [],
          socialLinks: braveData?.socialLinks || [],
        },
      }],
      colorPalette: [],
      logoUrl: null,
      businessType: "other",
      allText: braveData?.snippets.join(" ") || description,
      homepageUrl: "/",
      languages: [],
      allImages: [],
    };

    const homeContent = generateHomepageContent(
      site || braveFallback!,
      business
    );

    // Append Brave reviews if available (not already in Maps data)
    const reviewSection = braveData?.reviews && braveData.reviews.length > 0 && (!business?.reviews || business.reviews.length === 0)
      ? `\n\n## Reviews from Around the Web\n\n${braveData.reviews.map((r) => {
          const rating = r.rating ? `${"⭐".repeat(Math.round(r.rating))}` : "⭐";
          return `> ${rating} — *via [${r.source}](${r.sourceUrl})*\n> ${r.snippet}`;
        }).join("\n\n")}`
      : "";

    await createPage("Home", "home", homeContent + reviewSection, description, "page", "publish", siteId);
  }

  console.log(`\n✅ CMS seeded: ${pagesCreated} pages created/updated`);
  console.log(`   Title: ${name}`);
  console.log(`   Description: ${description}`);

  return {
    pagesCreated,
    siteTitle: name,
    siteDescription: description,
  };
}

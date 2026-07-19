/**
 * Quick test: Generate a WordPress theme from the DB data for an existing site.
 */
import { scrapeWebsite } from "@/lib/scraper/web-scraper";
import { searchBusiness } from "@/lib/scraper/maps-scraper";
import { scrapePhotos } from "@/lib/scraper/photo-scraper";
import { generateTheme } from "@/lib/theme-generator/index";
import { searchBusinessWithBrave } from "@/lib/scraper/brave-scraper";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const slug = process.argv[2] || "darias-bakery-bistro";
  const siteRecord = await db.select().from(sites).where(eq(sites.slug, slug)).limit(1).then(r => r[0]);
  if (!siteRecord) {
    console.error(`Site not found: ${slug}`);
    process.exit(1);
  }
  console.log(`\n📦 Generating WordPress theme for: ${siteRecord.name} (ID=${siteRecord.id})`);

  // Try to scrape the site
  let site = null;
  let business = null;
  let photos: any[] = [];

  if (siteRecord.domain) {
    try {
      site = await scrapeWebsite(`https://${siteRecord.domain}`);
      console.log(`   ✓ Scraped website: ${siteRecord.domain}`);
    } catch (e) {
      console.log(`   ⚠️  Could not scrape site: ${(e as Error).message}`);
    }
  }

  // Use the site name to search business
  try {
    business = await searchBusiness(siteRecord.name);
  } catch (e) {
    console.log(`   ⚠️  Maps lookup: ${(e as Error).message}`);
  }

  // Try Brave search for enrichment
  try {
    await searchBusinessWithBrave(siteRecord.name);
  } catch { /* ok */ }

  // Scrape photos
  try {
    photos = await scrapePhotos(site, business, siteRecord.businessType || "other", siteRecord.name);
  } catch (e) {
    console.log(`   ⚠️  Photos: ${(e as Error).message}`);
  }

  // Generate WordPress theme
  const config = await generateTheme(
    site,
    business,
    process.cwd(),
    photos as any,
    [],
    siteRecord.businessType || undefined,
  );
  console.log(`\n✅ Theme config: ${config.name} (primary=${config.primaryColor})`);
}

main().catch(e => {
  console.error("FAILED:", e);
  process.exit(1);
});

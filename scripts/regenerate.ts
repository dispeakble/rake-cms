#!/usr/bin/env tsx
import { scrapeWebsite } from "../src/lib/scraper/web-scraper";
import { generateTheme } from "../src/lib/theme-generator/index";
import { slugify } from "../src/lib/site-context";

async function main() {
  const url = "https://karting-las-americas.alexawebservers.com/";
  const name = "Karting Las Américas";
  const slug = slugify(name);

  console.log(`🌐 Rescraping: ${url}`);
  const site = await scrapeWebsite(url);
  console.log(`   Business type detected: ${site?.businessType}`);

  // Override the business type — this is NOT a restaurant
  const overrideType = "service";
  console.log(`   Overriding to: ${overrideType}`);

  const outputDir = process.cwd();
  // Pass a mock business with the correct name so generateTheme uses it
  const mockBusiness = { name, city: "", address: "", phone: "", email: "", website: "", rating: 0, totalRatings: 0, priceLevel: "", hours: [], categories: [], reviews: [], photos: [], description: "", placeId: "", state: "", zipCode: "", country: "", latitude: 0, longitude: 0 };
  const config = await generateTheme(site, mockBusiness, outputDir, [], [], overrideType as any);

  console.log(`\n✅ Theme regenerated for ${name} (${overrideType})`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

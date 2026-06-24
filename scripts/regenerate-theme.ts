#!/usr/bin/env tsx
/**
 * Quick script to regenerate theme for mario-viajes.
 */
import { scrapeWebsite } from "@/lib/scraper/web-scraper";
import { generateTheme } from "@/lib/theme-generator/index";

async function main() {
  const url = "https://marioviajes.com";
  console.log("🌐 Scraping", url);
  const site = await scrapeWebsite(url);
  console.log(`   Business: ${site.businessName}`);
  console.log(`   Languages: ${site.languages.join(", ")}`);

  console.log("\n🎨 Generating theme...");
  const config = await generateTheme(
    site,
    null,
    process.cwd(),
    [],
    [
      { slug: "home", label: "Home" },
      { slug: "about", label: "About" },
      { slug: "services", label: "Services" },
      { slug: "contact", label: "Contact" },
    ],
    "travel" as any
  );
  console.log(`✅ Theme generated: ${config.name}`);
}

main().catch(console.error);

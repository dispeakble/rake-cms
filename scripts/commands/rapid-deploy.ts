#!/usr/bin/env tsx
/**
 * Rapid Deploy — one-command website generation + deployment.
 *
 * Orchestrates the full pipeline:
 *   scrape → generate theme → seed CMS → deploy
 *
 * Usage:
 *   npm run cli rapid:deploy -- --url https://customer-website.com
 *   npm run cli rapid:deploy -- --business "Joe's Pizza, New York"
 *   npm run cli rapid:deploy -- --url https://oldsite.com --business "Joe's Pizza"
 *   npm run cli rapid:deploy -- --business "Downtown Dental, Austin" --deploy
 */

import { Command } from "commander";
import { intro, text, select, confirm, isCancel, cancel, outro, spinner } from "@clack/prompts";
import { scrapeWebsite } from "@/lib/scraper/web-scraper";
import { searchBusiness } from "@/lib/scraper/maps-scraper";
import { generateTheme } from "@/lib/theme-generator/index";
import { seedSite } from "@/lib/seeder/site-seeder";
import { deployToVercel, buildOnly } from "@/lib/deployer/deploy";
import path from "path";

export const rapidDeployCommand = new Command("rapid:deploy")
  .description("One-command: scrape → theme → seed → deploy a customer website")
  .option("-u, --url <url>", "Customer's existing website URL to scrape")
  .option("-b, --business <query>", "Business name and location for Google Maps data")
  .option("-n, --name <name>", "Override business name")
  .option("-d, --deploy", "Deploy to Vercel after building")
  .option("--no-build", "Skip build step")
  .option("--no-seed", "Skip seeding content to CMS")
  .option("--dry-run", "Show what would be done without writing anything")
  .action(async (options) => {
    intro("🚀 Rake CMS — Rapid Deploy");

    console.log("");
    console.log("  ╔══════════════════════════════════════════╗");
    console.log("  ║   Rapid Website Generation Pipeline      ║");
    console.log("  ║   scrape → generate → seed → deploy     ║");
    console.log("  ╚══════════════════════════════════════════╝");
    console.log("");

    // Collect inputs
    let url = options.url;
    let businessQuery = options.business;

    if (!url && !businessQuery) {
      const sourceType = await select({
        message: "Where should we get the customer data?",
        options: [
          { value: "url", label: "Scrape their existing website" },
          { value: "maps", label: "Search Google Maps / Places" },
          { value: "both", label: "Both (website + Google Maps)" },
        ],
      });

      if (isCancel(sourceType)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      if (sourceType === "url" || sourceType === "both") {
        url = await text({
          message: "Customer website URL:",
          placeholder: "https://example.com",
          validate: (v: string | undefined) => (!v ? "URL is required" : undefined),
        });
        if (isCancel(url)) process.exit(0);
      }

      if (sourceType === "maps" || sourceType === "both") {
        businessQuery = await text({
          message: "Business name + location (for Google Maps):",
          placeholder: "Joe's Pizza, New York",
          validate: (v: string | undefined) => (!v ? "Business query is required" : undefined),
        });
        if (isCancel(businessQuery)) process.exit(0);
      }
    }

    const deployChoice = options.deploy !== undefined
      ? options.deploy
      : await confirm({
          message: "Deploy to Vercel after building?",
          initialValue: false,
        });
    if (isCancel(deployChoice)) process.exit(0);

    const customerName = options.name || "Customer Site";
    const outputDir = process.cwd();

    // Phase 1: Scrape
    let site = null;
    let business = null;

    if (url) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 1: Scraping Website");
      console.log("=".repeat(50));
      try {
        site = await scrapeWebsite(url);
      } catch (error) {
        console.error(`\n❌ Website scraping failed: ${(error as Error).message}`);
        console.log("   Continuing with available data...");
      }
    }

    if (businessQuery) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 1b: Google Maps Data");
      console.log("=".repeat(50));
      try {
        business = await searchBusiness(businessQuery);
        if (business && business.rating > 0) {
          console.log(`   ⭐ Rating: ${business.rating}/5 (${business.totalRatings} reviews)`);
        }
      } catch (error) {
        console.error(`\n❌ Maps lookup failed: ${(error as Error).message}`);
      }
    }

    if (!site && !business) {
      console.log("\n⚠️  No data could be scraped. Using generated content instead.");
    }

    // Phase 2: Generate Theme
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 2: Generating Theme");
    console.log("=".repeat(50));

    const themeSpinner = spinner();
    themeSpinner.start("Creating business-specific theme...");

    try {
      const themeConfig = await generateTheme(site, business, outputDir);
      themeSpinner.stop(`✨ Theme generated: ${themeConfig.name} (${themeConfig.businessType})`);
    } catch (error) {
      themeSpinner.stop(`❌ Theme generation failed: ${(error as Error).message}`);
    }

    // Phase 3: Seed CMS
    if (options.seed !== false) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 3: Seeding CMS Content");
      console.log("=".repeat(50));

      const seedSpinner = spinner();
      seedSpinner.start("Populating CMS with content...");

      try {
        const result = await seedSite(site, business);
        seedSpinner.stop(`✅ CMS seeded: ${result.pagesCreated} pages created`);

        if (site || business) {
          const name = business?.name || site?.businessName || customerName;
          console.log(`\n📋 Site Summary:`);
          console.log(`   Name: ${name}`);
          console.log(`   Pages: ${result.pagesCreated}`);
          console.log(`   Rating: ${business?.rating ? `${business.rating}/5 ⭐` : "—"}`);
          console.log(`   Contact: ${business?.phone || site?.pages[0]?.contactInfo.phone[0] || "—"}`);
        }
      } catch (error) {
        seedSpinner.stop(`❌ Seeding failed: ${(error as Error).message}`);
      }
    }

    // Phase 4: Build & Deploy
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 4: Build & Deploy");
    console.log("=".repeat(50));

    if (options.build !== false) {
      const built = await buildOnly();
      if (built && deployChoice) {
        const result = await deployToVercel({
          projectName: (business?.name || site?.businessName || "rake-cms-site")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        });

        if (result.success) {
          console.log(`\n🎉 SITE IS LIVE: ${result.url}`);
        }
      } else if (built) {
        console.log("\n📦 Build complete. Run with --deploy to ship to Vercel.");
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(50));
    console.log("  ✅ RAPID DEPLOY COMPLETE");
    console.log("=".repeat(50));
    console.log("");
    console.log("  📊 What was done:");
    console.log(`     ${site ? "✓" : " "} Website scraped: ${site?.homepageUrl || "—"}`);
    console.log(`     ${business ? "✓" : " "} Business data: ${business?.name || "—"}`);
    console.log(`     ✓ Theme generated for: ${business?.name || site?.businessName || customerName}`);
    console.log(`     ✓ Content seeded to CMS`);
    console.log(`     ✓ Project built`);

    if (deployChoice) {
      console.log(`     ✓ Deployed to Vercel`);
    }

    console.log("");
    console.log("  💡 Next steps:");
    console.log("     1. npm run dev  — Preview locally");
    console.log("     2. Visit /admin — Customize content");
    console.log("     3. Customize components/theme/ for branding");
    console.log("");

    outro("Ready to show your customer! 🎉");
  });

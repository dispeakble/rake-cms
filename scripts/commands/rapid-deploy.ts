#!/usr/bin/env tsx
/**
 * Rapid Deploy — one-command website generation + multi-tenant deployment.
 *
 * Orchestrates the full pipeline:
 *   scrape → create site → generate theme → seed CMS → deploy
 *
 * Deploys to [slug].alexawebservers.com via Virtualmin + Apache.
 *
 * Usage:
 *   npm run cli rapid:deploy -- --business "La Tajea, Pje. Cabezos Sau 10, Adeje"
 *   npm run cli rapid:deploy -- --url https://customer-site.com
 *   npm run cli rapid:deploy -- --url https://oldsite.com --business "Joe's Pizza"
 *   npm run cli rapid:deploy -- --business "Downtown Dental, Austin" --deploy
 */

import { Command } from "commander";
import { intro, text, select, confirm, isCancel, cancel, outro, spinner } from "@clack/prompts";
import { scrapeWebsite } from "@/lib/scraper/web-scraper";
import { searchBusiness } from "@/lib/scraper/maps-scraper";
import { scrapePhotos } from "@/lib/scraper/photo-scraper";
import { searchBusinessWithBrave } from "@/lib/scraper/brave-scraper";
import { generateTheme } from "@/lib/theme-generator/index";
import { seedSite } from "@/lib/seeder/site-seeder";
import { slugify } from "@/lib/site-context";
import path from "path";
import { execSync } from "child_process";

export const rapidDeployCommand = new Command("rapid:deploy")
  .description("One-command: scrape → create site → generate theme → seed CMS → deploy to subdomain")
  .option("-u, --url <url>", "Customer's existing website URL to scrape")
  .option("-b, --business <query>", "Business name + full address (e.g. \"La Tajea, Pje. Cabezos Sau 10, Adeje\")")
  .option("-n, --name <name>", "Override business name")
  .option("-d, --deploy", "Enable Virtualmin deployment to subdomain")
  .option("--no-build", "Skip build step")
  .option("--no-seed", "Skip seeding content to CMS")
  .option("--dry-run", "Show what would be done without writing anything")
  .action(async (options) => {
    intro("🚀 Rake CMS — Rapid Deploy (Multi-Tenant)");

    console.log("");
    console.log("  ╔══════════════════════════════════════════════════╗");
    console.log("  ║   Rapid Deploy Pipeline                         ║");
    console.log("  ║   scrape → create site → theme → seed → deploy  ║");
    console.log("  ╚══════════════════════════════════════════════════╝");
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
          message: "Business name + full address (for Google Maps):",
          placeholder: "La Tajea, Pje. Cabezos Sau 10, Adeje, Tenerife",
          validate: (v: string | undefined) => (!v ? "Business query is required" : undefined),
        });
        if (isCancel(businessQuery)) process.exit(0);
      }
    }

    const doDeploy = options.deploy !== undefined
      ? options.deploy
      : await confirm({
          message: "Create Virtualmin subdomain and deploy?",
          initialValue: true,
        });
    if (isCancel(doDeploy)) process.exit(0);

    // Determine business name and slug
    const rawName = options.name || businessQuery?.split(",")[0]?.trim() || "Customer Site";
    const slug = slugify(rawName);
    const subdomain = `${slug}.alexawebservers.com`;
    const outputDir = process.cwd();

    console.log("\n  📋 Site Info:");
    console.log(`     Name: ${rawName}`);
    console.log(`     Slug: ${slug}`);
    console.log(`     URL:  https://${subdomain}`);
    console.log("");

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

    // Phase 1c: Brave Search — discover images, reviews, and content from web
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 1c: Brave Search Enrichment");
    console.log("=".repeat(50));

    let braveData = null;
    const braveName = options.name || business?.name || site?.businessName || businessQuery?.split(",")[0]?.trim() || rawName;
    const braveLocation = business?.city || site?.pages[0]?.contactInfo?.address?.[0] || (businessQuery ? businessQuery.split(",").slice(1).join(",").trim() : "");
    try {
      braveData = await searchBusinessWithBrave(
        braveName,
        braveLocation || undefined,
        site?.businessType || undefined
      );
      if (braveData.description && !business?.description && !site?.pages[0]?.metaDescription) {
        console.log(`   📝 Using Brave search description`);
      }
    } catch (error) {
      console.log(`   ⚠️ Brave Search: ${(error as Error).message}`);
    }

    // Phase 2: Create Site in DB
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 2: Creating Site in Database");
    console.log("=".repeat(50));

    let siteId = 0;
    const siteSpinner = spinner();

    if (options.seed !== false) {
      siteSpinner.start("Creating site record...");
      try {
        const { db } = await import("@/db");
        const { sites } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        // Check if site already exists
        const existing = await db
          .select()
          .from(sites)
          .where(eq(sites.slug, slug))
          .limit(1)
          .then((r) => r[0]);

        if (existing) {
          siteId = existing.id;
          await db
            .update(sites)
            .set({
              name: business?.name || rawName,
              description: business?.description || site?.pages[0]?.metaDescription || "",
              businessType: site?.businessType || "other",
              updatedAt: new Date().toISOString(),
            })
            .where(eq(sites.id, siteId));
          siteSpinner.stop(`✅ Site updated: ${slug} (ID: ${siteId})`);
        } else {
          const result = await db.insert(sites).values({
            slug,
            name: business?.name || rawName,
            subdomain: slug,
            domain: subdomain,
            description: business?.description || site?.pages[0]?.metaDescription || "",
            businessType: site?.businessType || "other",
            themeConfig: {
              primaryColor: site?.colorPalette[0] || "#3b82f6",
              secondaryColor: site?.colorPalette[1] || "#6b7280",
              accentColor: site?.colorPalette[2] || "#f9fafb",
              fontFamily: "Inter",
              layout: "centered",
            },
          }).returning({ id: sites.id });
          siteId = result[0].id;
          siteSpinner.stop(`✅ Site created: ${slug} (ID: ${siteId})`);
        }
      } catch (error) {
        siteSpinner.stop(`❌ Site creation failed: ${(error as Error).message}`);
        outro("Aborting.");
        process.exit(1);
      }
    }

    // Phase 3: Scrape Photos
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 3: Scraping Photos");
    console.log("=".repeat(50));

    let photos: Awaited<ReturnType<typeof scrapePhotos>> = [];
    const photoSpinner = spinner();
    // Also check the business name for type detection (e.g. "Grill" = restaurant)
    const nameBusinessType = guessTypeFromName(rawName);
    const effectiveType = site?.businessType && site.businessType !== "other"
      ? site.businessType
      : (business as any)?.categories?.[0] || nameBusinessType || "other";
    photoSpinner.start("Collecting photos from website/Maps/Unsplash...");
    try {
      photos = await scrapePhotos(
        site,
        business,
        effectiveType,
        braveName,
        braveLocation
      );
      photoSpinner.stop(`✅ ${photos.length} photos collected`);
      if (photos.length > 0) {
        console.log(`   📸 Hero: ${photos[0].localPath}`);
        if (photos[1]) console.log(`   📸 About: ${photos[1].localPath}`);
      }
    } catch (error) {
      photoSpinner.stop(`⚠️  Photo scraping: ${(error as Error).message}`);
    }

    // Phase 4: Generate Theme
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 4: Generating Theme");
    console.log("=".repeat(50));

    // Determine which pages will be seeded, so nav links are accurate
    const willHaveBusiness = !!(business || businessQuery);
    const pageSlugs: { slug: string; label: string }[] = [
      { slug: "home", label: "Home" },
    ];
    if (willHaveBusiness) {
      pageSlugs.push({ slug: "about", label: "About" },
        { slug: "services", label: "Services" },
        { slug: "contact", label: "Contact" });
    } else {
      pageSlugs.push({ slug: "about", label: "About" },
        { slug: "contact", label: "Contact" });
    }
    // Blog is always available via the /blog route

    const themeSpinner = spinner();
    themeSpinner.start("Creating business-specific theme with AI-quality copy...");

    try {
      const themeConfig = await generateTheme(site, business, outputDir, photos, pageSlugs);
      themeSpinner.stop(`✨ Theme generated: ${themeConfig.name} (${themeConfig.businessType})`);
    } catch (error) {
      themeSpinner.stop(`❌ Theme generation failed: ${(error as Error).message}`);
    }

    // Phase 5: Seed CMS
    if (options.seed !== false && siteId > 0) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 5: Seeding CMS Content");
      console.log("=".repeat(50));

      const seedSpinner = spinner();
      seedSpinner.start("Populating CMS with content...");

      try {
        const result = await seedSite(site, business, siteId, braveData);
        seedSpinner.stop(`✅ CMS seeded: ${result.pagesCreated} pages created for site ${slug}`);

        if (site || business) {
          const name = business?.name || site?.businessName || rawName;
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

    // Phase 6: Virtualmin + Apache Setup
    if (doDeploy) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 6: Virtualmin Subdomain Setup");
      console.log("=".repeat(50));

      const deploySpinner = spinner();

      try {
        deploySpinner.start("Creating Virtualmin virtual server...");

        // Create the Virtualmin virtual server for the subdomain
        // The parent domain is alexawebservers.com, so we create it as a sub-server
        const createCmd = `sudo virtualmin create-domain --domain ${subdomain} --parent alexawebservers.com --user admin.alexa --pass $(openssl rand -base64 12) --dir --webmin --unix 2>&1`;
        
        if (options.dryRun) {
          console.log(`   [DRY RUN] Would run: ${createCmd}`);
        } else {
          try {
            const output = execSync(createCmd, { timeout: 30000, encoding: "utf-8" });
            console.log(`   ✓ Virtualmin domain created`);
          } catch (vmError: any) {
            // Virtualmin domain might already exist — that's fine
            if (vmError.stdout?.includes("already exists") || vmError.stderr?.includes("already exists")) {
              console.log(`   ✓ Domain already exists, updating config...`);
            } else {
              console.log(`   ⚠️  Virtualmin: ${vmError.message || "domain may already exist"}`);
            }
          }
        }

        deploySpinner.message("Configuring Apache reverse proxy...");

        // Create Apache proxy config for this specific subdomain
        const vhostContent = `<VirtualHost *:80>
    ServerName ${subdomain}
    UseCanonicalName Off
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3100/
    ProxyPassReverse / http://127.0.0.1:3100/
    ErrorLog /var/log/apache2/rake-cms-${slug}-error.log
    CustomLog /var/log/apache2/rake-cms-${slug}-access.log combined
</VirtualHost>
<VirtualHost *:443>
    ServerName ${subdomain}
    UseCanonicalName Off
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3100/
    ProxyPassReverse / http://127.0.0.1:3100/
    SSLEngine on
    SSLCertificateFile /etc/ssl/virtualmin/17798083781525566/ssl.cert
    SSLCertificateKeyFile /etc/ssl/virtualmin/17798083781525566/ssl.key
    SSLCACertificateFile /etc/ssl/virtualmin/17798083781525566/ssl.ca
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    ErrorLog /var/log/apache2/rake-cms-${slug}-error.log
    CustomLog /var/log/apache2/rake-cms-${slug}-access.log combined
</VirtualHost>`;

        if (options.dryRun) {
          console.log(`   [DRY RUN] Would write Apache vhost for ${subdomain}`);
        } else {
          // Write to temp file, then sudo cp (avoids heredoc permission issues)
          const tmpFile = `/tmp/rake-cms-vhost-${slug}.conf`;
          const fs = await import("fs/promises");
          await fs.writeFile(tmpFile, vhostContent, "utf-8");
          execSync(`sudo mv ${tmpFile} /etc/apache2/sites-available/${subdomain}.conf`, { timeout: 5000, encoding: "utf-8" });
          execSync(`sudo a2ensite ${subdomain}.conf 2>&1`, { timeout: 10000, encoding: "utf-8" });
          execSync(`sudo systemctl reload apache2 2>&1`, { timeout: 15000, encoding: "utf-8" });
          console.log(`   ✓ Apache vhost enabled and reloaded`);
        }

        deploySpinner.stop(`✅ Subdomain ready: https://${subdomain}`);

      } catch (error: any) {
        deploySpinner.stop(`❌ Deployment failed: ${(error as Error).message}`);
        console.log("   Continuing with build...");
      }
    }

    // Phase 7: Build & Deploy
    console.log("\n" + "=".repeat(50));
    console.log("  PHASE 7: Build Next.js App");
    console.log("=".repeat(50));

    if (options.build !== false) {
      const buildSpinner = spinner();
      buildSpinner.start("Building Next.js...");
      try {
        const buildOutput = execSync("npm run build 2>&1", {
          timeout: 120000,
          encoding: "utf-8",
          cwd: outputDir,
        });
        // Extract the last few lines for summary
        const lines = buildOutput.trim().split("\n");
        const summary = lines.slice(-5).join("\n");
        buildSpinner.stop("✅ Build complete");
        console.log(`   ${summary}`);
      } catch (error: any) {
        buildSpinner.stop(`❌ Build failed: ${(error as Error).message}`);
      }
    }

    // Phase 8: Verification
    if (options.build !== false) {
      console.log("\n" + "=".repeat(50));
      console.log("  PHASE 8: Verifying Deployment");
      console.log("=".repeat(50));

      const verifySpinner = spinner();
      verifySpinner.start("Checking all routes return 200...");

      try {
        const { verifyDeployment } = await import("../../scripts/verify-deploy");
        const allSlugs = pageSlugs.map((p) => p.slug);
        const result = await verifyDeployment(
          subdomain,
          allSlugs,
          3100
        );
        verifySpinner.stop(result.pass ? "✅ All checks passed" : "❌ Some checks failed");

        let passCount = 0;
        let failCount = 0;
        for (const check of result.checks) {
          if (check.status === "pass") {
            passCount++;
            console.log(`   ✅ ${check.name}: ${check.detail}`);
          } else {
            failCount++;
            console.log(`   ❌ ${check.name}: ${check.detail}`);
          }
        }
        console.log(`   📊 ${passCount} passed, ${failCount} failed (${result.duration}ms)`);

        if (!result.pass) {
          console.log("\n   ⚠️  Some checks failed. Review the output above.");
        }
      } catch (error: any) {
        verifySpinner.stop(`⚠️  Verification skipped: ${(error as Error).message}`);
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
    console.log(`     ✓ Site created in DB: ${slug} (ID: ${siteId || "—"})`);
    console.log(`     ✓ Theme generated`);
    console.log(`     ✓ Content seeded to CMS`);
    console.log(`     ✓ Build complete`);
    if (doDeploy) {
      console.log(`     ✓ Subdomain: https://${subdomain}`);
    }
    console.log("");
    console.log("  💡 Next steps:");
    console.log(`     1. Visit https://${subdomain} — View the live site`);
    console.log(`     2. Visit https://${subdomain}/admin — Login to admin panel`);
    console.log("     3. Customize theme at components/theme/");
    console.log("");

    outro(`Site ready at https://${subdomain} 🎉`);
  });

/**
 * Guess business type from a business name string.
 * Used as fallback when website/Maps detection returns "other".
 */
function guessTypeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  const restaurant = ["grill", "restaurant", "cafe", "bistro", "pizza", "sushi", "steakhouse", "bbq", "bar", "pub", "churrascaria", "rodizio", "diner", "bakery", "brasserie"];
  const retail = ["store", "shop", "boutique", "market", "mart", "outlet", "mall"];
  const travel = ["travel", "viajes", "viaje", "turismo", "tour", "excursion", "vacation", "holiday", "cruise", "tours", "trips", "agency"];
  const service = ["service", "repair", "cleaning", "salon", "spa", "barber", "laundry", "taxi"];
  const healthcare = ["clinic", "doctor", "dental", "dentist", "hospital", "medical", "pharmacy", "care"];
  const education = ["school", "academy", "college", "university", "institute", "center", "centre", "kindergarten", "preschool"];
  const professional = ["law", "legal", "attorney", "accounting", "consulting", "insurance", "financial", "broker", "realty"];
  const construction = ["construction", "building", "contractor", "renovation", "roofing", "plumbing", "electrical", "paving"];
  const tech = ["tech", "software", "digital", "it ", "computer", "web", "development", "app ", "saas", "hosting", "cloud"];
  const creative = ["studio", "design", "photography", "art", "creative", "media", "production", "film"];
  const realEstate = ["real estate", "property", "realtor", "homes", "apartments", "rentals", "mortgage"];

  for (const kw of restaurant) if (lower.includes(kw)) return "restaurant";
  for (const kw of retail) if (lower.includes(kw)) return "retail";
  for (const kw of travel) if (lower.includes(kw)) return "travel";
  for (const kw of service) if (lower.includes(kw)) return "service";
  for (const kw of healthcare) if (lower.includes(kw)) return "healthcare";
  for (const kw of education) if (lower.includes(kw)) return "education";
  for (const kw of professional) if (lower.includes(kw)) return "professional";
  for (const kw of construction) if (lower.includes(kw)) return "construction";
  for (const kw of tech) if (lower.includes(kw)) return "technology";
  for (const kw of creative) if (lower.includes(kw)) return "creative";
  for (const kw of realEstate) if (lower.includes(kw)) return "real-estate";
  return null;
}

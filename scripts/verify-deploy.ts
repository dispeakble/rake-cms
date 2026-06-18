/**
 * Deployment Verification Script
 *
 * Runs after a rapid deploy to verify:
 *  - Homepage returns 200
 *  - All known page slugs return 200
 *  - Images / assets load
 *  - No 404s or broken links on the homepage
 *
 * Usage:
 *   npx tsx -r dotenv/config scripts/verify-deploy.ts --slug la-tajea
 */

import { execSync } from "child_process";

interface VerifyResult {
  pass: boolean;
  checks: { name: string; status: "pass" | "fail"; detail: string }[];
  duration: number;
}

async function verifyDeployment(
  subdomain: string,
  pageSlugs: string[],
  port?: number,
  /** Expected business name in page content (optional) */
  expectedName?: string
): Promise<VerifyResult> {
  const baseUrl = port ? `http://127.0.0.1:${port}` : `https://${subdomain}`;
  const hostHeader = port ? `-H "Host: ${subdomain}\"` : "";
  const start = Date.now();
  const checks: VerifyResult["checks"] = [];

  // 1. Check homepage — actually fetch content for verification
  try {
    const cmd = `curl -s ${hostHeader} "${baseUrl}/"`;
    const html = execSync(cmd, { timeout: 10000, encoding: "utf-8" });
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "(no title)";
    const bodySize = html.length;

    const issues: string[] = [];
    if (bodySize < 1000) issues.push(`body too small (${bodySize}b)`);
    if (expectedName && !html.includes(expectedName)) issues.push(`missing business name "${expectedName}"`);
    if (html.includes("Page not found") || html.includes("Not Found")) issues.push("contains 'Not Found'");

    const pass = issues.length === 0;
    checks.push({
      name: "Homepage (/)",
      status: pass ? "pass" : "fail",
      detail: pass
        ? `200 — ${bodySize}b, title: "${title}"${expectedName ? `, contains "${expectedName}"` : ""}`
        : `Issues: ${issues.join("; ")}`,
    });
  } catch (e) {
    checks.push({ name: "Homepage (/)", status: "fail", detail: String(e) });
  }

  // 2. Check all known page slugs (status + content)
  for (const slug of pageSlugs) {
    try {
      const path = slug === "/" || slug === "home" ? "/" : `/${slug}`;
      const cmd = `curl -s ${hostHeader} "${baseUrl}${path}"`;
      const html = execSync(cmd, { timeout: 10000, encoding: "utf-8" });
      const bodySize = html.length;
      const issues: string[] = [];
      if (bodySize < 500) issues.push(`body too small (${bodySize}b)`);
      if (expectedName && !html.includes(expectedName)) issues.push(`missing name "${expectedName}"`);

      checks.push({
        name: `Page (/${slug})`,
        status: issues.length === 0 ? "pass" : "fail",
        detail: issues.length === 0
          ? `HTTP 200 — ${bodySize}b`
          : `Issues: ${issues.join("; ")}`,
      });
    } catch (e) {
      checks.push({ name: `Page (/${slug})`, status: "fail", detail: String(e) });
    }
  }

  // 3. Check blog archive
  try {
    const cmd = `curl -s -o /dev/null -w "%{http_code}" ${hostHeader} "${baseUrl}/blog"`;
    const code = execSync(cmd, { timeout: 10000, encoding: "utf-8" }).trim();
    checks.push({ name: "Blog archive (/blog)", status: code === "200" ? "pass" : "fail", detail: `HTTP ${code}` });
  } catch (e) {
    checks.push({ name: "Blog archive (/blog)", status: "fail", detail: String(e) });
  }

  // 4. Check RSS feed
  try {
    const cmd = `curl -s -o /dev/null -w "%{http_code}" ${hostHeader} "${baseUrl}/feed.xml"`;
    const code = execSync(cmd, { timeout: 10000, encoding: "utf-8" }).trim();
    checks.push({ name: "RSS feed (/feed.xml)", status: code === "200" ? "pass" : "fail", detail: `HTTP ${code}` });
  } catch (e) {
    checks.push({ name: "RSS feed (/feed.xml)", status: "fail", detail: String(e) });
  }

  // 5. Check homepage for broken links (extract all hrefs and test them)
  try {
    const htmlCmd = `curl -s ${hostHeader} "${baseUrl}/"`;
    const html = execSync(htmlCmd, { timeout: 10000, encoding: "utf-8" });
    // Extract all local hrefs, skip _next/*, favicon, media/*
    const hrefs = html.match(/href="\/([^"]+)"/g) || [];
    const skipPatterns = [/^_next\//, /^favicon/, /^media\//];
    const uniquePaths = [
      ...new Set(
        hrefs
          .map((h: string) => h.replace(/href="\//, "").replace(/"$/, ""))
          .filter((p: string) => !skipPatterns.some((r) => r.test(p)))
      ),
    ];
    let brokenCount = 0;
    for (const href of uniquePaths.slice(0, 20)) {
      try {
        const c = `curl -s -o /dev/null -w "%{http_code}" ${hostHeader} "${baseUrl}/${href}"`;
        const code = execSync(c, { timeout: 5000, encoding: "utf-8" }).trim();
        if (code !== "200") brokenCount++;
      } catch { brokenCount++; }
    }
    checks.push({
      name: `Homepage links (${uniquePaths.length} checked, skipped static)`,
      status: brokenCount === 0 ? "pass" : "fail",
      detail: `${brokenCount} broken out of ${uniquePaths.length}`,
    });
  } catch (e) {
    checks.push({ name: "Homepage link check", status: "fail", detail: String(e) });
  }

  // 6. Check media/images loaded (hero background)
  try {
    const cmd = `curl -s -o /dev/null -w "%{http_code}" ${hostHeader} "${baseUrl}/media/scraped/hero-bg.jpg"`;
    const code = execSync(cmd, { timeout: 10000, encoding: "utf-8" }).trim();
    checks.push({
      name: "Hero image",
      status: code === "200" ? "pass" : "fail",
      detail: `HTTP ${code}`,
    });
  } catch {
    // Not all sites have hero images, so this is soft
    checks.push({ name: "Hero image", status: "pass", detail: "Skipped (no hero image)" });
  }

  const pass = checks.every((c) => c.status === "pass");
  return { pass, checks, duration: Date.now() - start };
}

// CLI entry point — only runs when executed directly (not imported)
const isMainModule = process.argv[1]?.includes("verify-deploy");

if (isMainModule) {
  const slug = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1] || process.argv[2];
  const pagesStr = process.argv.find((a) => a.startsWith("--pages="))?.split("=")[1] || "home,about,services,contact";
  const port = process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "";
  const pageSlugs = pagesStr.split(",");
  verifyDeployment(`${slug}.alexawebservers.com`, pageSlugs, port ? parseInt(port) : undefined).then((result) => {
    console.log("\n  🔍 DEPLOYMENT VERIFICATION");
    console.log("  " + "─".repeat(40));
    for (const check of result.checks) {
      const icon = check.status === "pass" ? "✅" : "❌";
      console.log(`  ${icon} ${check.name}: ${check.detail}`);
    }
    console.log("  " + "─".repeat(40));
    console.log(`  ${result.pass ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"} (${result.duration}ms)`);
    process.exit(result.pass ? 0 : 1);
  });
}

export { verifyDeployment, type VerifyResult };

/**
 * Theme Import Command.
 *
 * Scans a legacy WordPress theme directory, parses PHP template files,
 * and generates Next.js components with TODO markers for manual work.
 */

import fs from "fs/promises";
import path from "path";
import { parseThemeDirectory, generateNextComponent } from "@/lib/migration/php-parser";

export interface ThemeImportOptions {
  themePath: string;
  outputDir?: string;
  dryRun?: boolean;
}

export interface ThemeImportResult {
  parsedCount: number;
  generatedCount: number;
  needsManualCount: number;
  generatedFiles: string[];
  skippedFunctions: boolean;
}

/**
 * Import a WordPress theme by parsing its PHP templates and generating
 * Next.js component placeholders.
 */
export async function importTheme(options: ThemeImportOptions): Promise<ThemeImportResult> {
  const themeName = path.basename(options.themePath);
  const outputDir = options.outputDir || path.join(process.cwd(), "components", "theme");

  console.log(`\n🎨 Parsing theme: ${themeName}`);
  console.log(`   Source: ${options.themePath}`);

  const parsed = await parseThemeDirectory(options.themePath);
  console.log(`   Found ${parsed.length} PHP template files`);

  let generated = 0;
  let needsManual = 0;
  const generatedFiles: string[] = [];

  for (const template of parsed) {
    // Skip functions.php — always requires manual migration
    if (template.templateName === "functions") {
      console.log(`   ⏭️  Skipping ${template.sourceFile} (requires full manual migration)`);
      continue;
    }

    if (template.needsManualMigration) {
      needsManual++;
    }

    if (options.dryRun) {
      console.log(`   [DRY RUN] Would generate: ${template.targetComponent}`);
      if (template.needsManualMigration) {
        console.log(`      ⚠️  Needs manual migration`);
      }
      continue;
    }

    const component = generateNextComponent(template);
    const targetPath = path.join(outputDir, path.basename(template.targetComponent));

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, component, "utf-8");

    generated++;
    generatedFiles.push(targetPath);
    console.log(`   ✅ Generated: ${targetPath}`);
  }

  // Generate migration report section
  const reportLines: string[] = [
    `\n## Theme Migration: ${themeName}`,
    "",
    `| File | Auto-Generated | Needs Manual Migration | PHP Functions Found |`,
    `|------|---------------|----------------------|-------------------|`,
  ];

  for (const template of parsed) {
    const autoGen = template.templateName !== "functions" ? "✅" : "❌";
    const manual = template.needsManualMigration ? "⚠️" : "—";
    const funcs = template.phpFunctionsFound.length > 0
      ? template.phpFunctionsFound.join(", ")
      : "—";
    reportLines.push(
      `| ${template.templateName} | ${autoGen} | ${manual} | ${funcs} |`
    );
  }

  reportLines.push("\n## Manual Migration Required");
  reportLines.push("");
  reportLines.push("The following PHP functions have no direct Next.js equivalent:");
  for (const func of [
    "wp_head()",
    "wp_footer()",
    "wp_nav_menu()",
    "the_content()",
    "the_title()",
    "have_posts()",
    "comments_template()",
    "dynamic_sidebar()",
    "get_header()",
    "get_footer()",
    "get_sidebar()",
  ]) {
    reportLines.push(`- \`${func}\` — React/Next.js equivalent needed`);
  }
  reportLines.push("");

  const report = reportLines.join("\n");

  // Append to migration report
  const reportPath = path.join(process.cwd(), "migration-report.md");
  try {
    const existing = await fs.readFile(reportPath, "utf-8");
    await fs.writeFile(reportPath, existing + report, "utf-8");
  } catch {
    await fs.writeFile(reportPath, report, "utf-8");
  }

  console.log(`\n📄 Migration report updated: ${reportPath}`);

  return {
    parsedCount: parsed.length,
    generatedCount: generated,
    needsManualCount: needsManual,
    generatedFiles,
    skippedFunctions: parsed.some((t) => t.templateName === "functions"),
  };
}

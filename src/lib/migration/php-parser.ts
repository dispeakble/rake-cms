/**
 * PHP Template Parser.
 *
 * Statically analyzes legacy WordPress PHP theme files to extract
 * HTML structure and generate corresponding Next.js components.
 *
 * Falls back to // TODO: Manual Migration Required comments when
 * complex PHP logic cannot be automatically interpolated.
 */

import fs from "fs/promises";
import path from "path";

export interface ParsedTemplate {
  /** Original PHP file path */
  sourceFile: string;
  /** Template name derived from filename */
  templateName: string;
  /** Extracted HTML structure (PHP tags stripped) */
  htmlStructure: string;
  /** PHP functions found that need manual migration */
  phpFunctionsFound: string[];
  /** Whether this template has complex logic requiring manual migration */
  needsManualMigration: boolean;
  /** Suggested Next.js component path */
  targetComponent: string;
  /** TODO notes for manual migration */
  manualTodos: string[];
}

/**
 * Known WordPress PHP functions that have no direct Next.js equivalent.
 */
const WP_SPECIFIC_FUNCTIONS = [
  "wp_head()",
  "wp_footer()",
  "the_content()",
  "the_title()",
  "the_permalink()",
  "the_excerpt()",
  "the_post_thumbnail()",
  "wp_nav_menu()",
  "dynamic_sidebar()",
  "get_sidebar()",
  "get_header()",
  "get_footer()",
  "have_posts()",
  "the_post()",
  "wp_link_pages()",
  "post_class()",
  "body_class()",
  "comments_template()",
  "wp_list_comments()",
  "comment_form()",
  "the_tags()",
  "the_category()",
  "wp_meta()",
  "wp_loginout()",
  "wp_register()",
  "wp_generator()",
];

/**
 * Parse a single PHP template file and extract its HTML structure.
 */
export async function parsePhpTemplate(
  filePath: string,
  themeName: string
): Promise<ParsedTemplate> {
  const content = await fs.readFile(filePath, "utf-8");
  const fileName = path.basename(filePath, ".php");
  const baseName = fileName === "index" ? "page" : fileName;

  const foundFunctions: string[] = [];
  const todos: string[] = [];

  // Find all PHP function calls
  for (const func of WP_SPECIFIC_FUNCTIONS) {
    const escaped = func.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    if (regex.test(content)) {
      foundFunctions.push(func);
      todos.push(`// TODO: Manual Migration Required — "${func}" has no Next.js equivalent`);
    }
  }

  // Detect complex PHP logic (loops, conditionals)
  const hasComplexLogic =
    /\bwhile\s*\(/.test(content) ||
    /\bforeach\s*\(/.test(content) ||
    /\bif\s*\(/.test(content) ||
    foundFunctions.length > 3;

  // Strip PHP tags and extract HTML
  let htmlStructure = content
    // Remove PHP opening/closing tags
    .replace(/<\?php[\s\S]*?\?>/g, "")
    // Remove standalone <?php tags
    .replace(/<\?php[\s\S]*?(?:\?>|$)/g, "")
    // Clean up short tags
    .replace(/<\?(?!xml|=)/g, "")
    .replace(/\?>/g, "")
    // Clean whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Map filename to target component
  const targetMap: Record<string, string> = {
    header: "components/theme/Header.tsx",
    footer: "components/theme/Footer.tsx",
    sidebar: "components/theme/Sidebar.tsx",
    index: "components/theme/Layout.tsx",
    single: "app/blog/[slug]/page.tsx",
    page: "app/[slug]/page.tsx",
    archive: "app/blog/page.tsx",
    search: "app/search/page.tsx",
    "404": "app/not-found.tsx",
    functions: "lib/theme/functions.ts",
  };

  const targetComponent = targetMap[fileName] || `components/theme/${baseName}.tsx`;

  // If the file is functions.php, flag it as requiring full manual migration
  const needsManual = fileName === "functions" || hasComplexLogic;

  if (fileName === "functions") {
    todos.push(
      "// TODO: Manual Migration Required — functions.php needs full manual porting.",
      "// Theme functions (wp_enqueue_style, add_theme_support, etc.) have no Next.js equivalent."
    );
  }

  return {
    sourceFile: filePath,
    templateName: fileName,
    htmlStructure,
    phpFunctionsFound: foundFunctions,
    needsManualMigration: needsManual,
    targetComponent,
    manualTodos: todos,
  };
}

/**
 * Generate a Next.js component shell from a parsed PHP template.
 */
export function generateNextComponent(parsed: ParsedTemplate): string {
  const lines: string[] = [
    "// Auto-generated from WordPress theme — Rake CMS Migration",
    `// Source: ${parsed.sourceFile}`,
    "",
  ];

  if (parsed.manualTodos.length > 0) {
    lines.push(...parsed.manualTodos.map((t) => t));
    lines.push("");
  }

  // Determine imports based on template type
  if (parsed.templateName === "header") {
    lines.push('import Link from "next/link";');
    lines.push("");
    lines.push("export default function Header() {");
    lines.push("  return (");
    lines.push("    <header className=\"site-header\">");
    lines.push("      <div className=\"container mx-auto px-4\">");
    lines.push("        <nav className=\"flex items-center justify-between py-4\">");

    if (parsed.htmlStructure.includes("logo") || parsed.htmlStructure.toLowerCase().includes("logo")) {
      lines.push('          <Link href="/" className="text-2xl font-bold">');
      lines.push("            Site Logo");
      lines.push("          </Link>");
    }

    if (parsed.phpFunctionsFound.includes("wp_nav_menu()")) {
      lines.push("          {/* TODO: Navigation menu — replace with Next.js Link components */}");
      lines.push("          <div className=\"flex gap-4\">");
      lines.push('            <Link href="/">Home</Link>');
      lines.push('            <Link href="/blog">Blog</Link>');
      lines.push('            <Link href="/about">About</Link>');
      lines.push("          </div>");
    }

    lines.push("        </nav>");
    lines.push("      </div>");
    lines.push("    </header>");
    lines.push("  );");
    lines.push("}");
  } else if (parsed.templateName === "footer") {
    lines.push("export default function Footer() {");
    lines.push("  return (");
    lines.push("    <footer className=\"site-footer border-t py-8\">");
    lines.push("      <div className=\"container mx-auto px-4 text-center text-sm text-muted-foreground\">");

    if (parsed.phpFunctionsFound.includes("wp_footer()")) {
      lines.push("        {/* TODO: wp_footer() — scripts and analytics */}");
    }

    lines.push("        <p>&copy; {new Date().getFullYear()} Your Site. All rights reserved.</p>");
    lines.push("      </div>");
    lines.push("    </footer>");
    lines.push("  );");
    lines.push("}");
  } else {
    // Generic component
    lines.push("// Extracted HTML from original PHP template:");
    lines.push("/*");
    if (parsed.htmlStructure.length > 500) {
      lines.push(parsed.htmlStructure.substring(0, 500) + "...");
    } else {
      lines.push(parsed.htmlStructure);
    }
    lines.push("*/");
    lines.push("");

    // Add component body
    lines.push("export default function " +
      parsed.templateName.charAt(0).toUpperCase() + parsed.templateName.slice(1) +
      "() {");
    lines.push("  return (");
    lines.push("    <div className=\"prose max-w-none\">");
    lines.push("      <p>Migrated from WordPress template: {parsed.templateName}</p>");
    lines.push("    </div>");
    lines.push("  );");
    lines.push("}");
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Parse all PHP templates in a theme directory.
 */
export async function parseThemeDirectory(
  themePath: string
): Promise<ParsedTemplate[]> {
  const themeName = path.basename(themePath);
  const results: ParsedTemplate[] = [];

  const entries = await fs.readdir(themePath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".php")) continue;

    const filePath = path.join(themePath, entry.name);
    try {
      const parsed = await parsePhpTemplate(filePath, themeName);
      results.push(parsed);
    } catch (error) {
      console.warn(`⚠️  Could not parse ${entry.name}: ${(error as Error).message}`);
    }
  }

  return results;
}

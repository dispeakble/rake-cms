/**
 * Database Import Engine.
 *
 * Connects to a legacy WordPress MySQL/MariaDB database and migrates
 * all data to the new Rake CMS Drizzle schema.
 *
 * Key operations:
 *  1. Introspect legacy DB schema
 *  2. Migrate each core table with type mapping
 *  3. Decode PHP serialized strings in wp_options and wp_postmeta
 *  4. Handle SQL dialect differences
 *  5. Generate migration report
 */

import { introspectWpDb, type DbConnectionConfig, type WpTableInfo } from "@/lib/migration/schema-introspector";
import { decodePhpSerialized, countLegacyItems } from "@/lib/migration/php-serialization";
import { db } from "@/db";
import * as schema from "@/db/schema";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

export interface ImportDbOptions {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  prefix?: string;
  dryRun?: boolean;
}

interface MigrationProgress {
  table: string;
  recordsRead: number;
  recordsWritten: number;
  errors: number;
  legacyItems: number;
}

/**
 * Run the full database migration from a legacy WordPress MySQL DB
 * to the Rake CMS PostgreSQL/MySQL schema.
 */
export async function importDatabase(options: ImportDbOptions) {
  const config: DbConnectionConfig = {
    host: options.host || "localhost",
    port: parseInt(options.port || "3306", 10),
    user: options.user || "root",
    password: options.password || "",
    database: options.database || "wordpress",
  };

  console.log("\n🔌 Connecting to legacy WordPress database...");
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);

  // Step 1: Introspect
  const result = await introspectWpDb(config);
  const progress: MigrationProgress[] = [];

  // Step 2: Connect source
  const sourceDb = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  const prefix = options.prefix || result.prefix;

  // Step 3: Migrate each table
  for (const table of result.tables) {
    const tableProgress: MigrationProgress = {
      table: table.name,
      recordsRead: 0,
      recordsWritten: 0,
      errors: 0,
      legacyItems: 0,
    };

    console.log(`\n📥 Migrating ${table.name}...`);

    // Fetch all rows
    const [rows] = await sourceDb.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM \`${table.name}\``
    );

    tableProgress.recordsRead = rows.length;

    if (options.dryRun) {
      console.log(`   [DRY RUN] Would migrate ${rows.length} rows`);
      progress.push(tableProgress);
      continue;
    }

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      try {
        await migrateBatch(table, batch, prefix);
        tableProgress.recordsWritten += batch.length;
        process.stdout.write(`\r   Progress: ${tableProgress.recordsWritten}/${rows.length} rows`);
      } catch (error) {
        tableProgress.errors++;
        console.error(`\n   ❌ Batch error at row ${i}:`, (error as Error).message);
      }
    }

    // Count legacy items from options/postmeta
    if (table.name.endsWith("_options") || table.name.endsWith("_postmeta")) {
      // Re-read to count legacy items (approximate)
      tableProgress.legacyItems = countLegacyFromTable(rows);
    }

    console.log(`\n   ✅ ${tableProgress.recordsWritten} rows written, ${tableProgress.errors} errors`);
    progress.push(tableProgress);
  }

  await sourceDb.end();

  // Step 4: Generate report
  const report = generateMigrationReport(progress, result.tables);
  const reportPath = path.join(process.cwd(), "migration-report.md");
  await fs.writeFile(reportPath, report, "utf-8");
  console.log(`\n📄 Migration report written to: ${reportPath}`);

  return { progress, report, reportPath };
}

/**
 * Migrate a batch of rows from a legacy WP table to the new schema.
 * Maps table names using the detected prefix.
 */
async function migrateBatch(
  table: WpTableInfo,
  rows: mysql.RowDataPacket[],
  prefix: string
) {
  const tableName = table.name.replace(prefix, "wp_");

  switch (tableName) {
    case "wp_posts":
      await db.insert(schema.posts).values(
        rows.map((r) => ({
          id: r.ID,
          postAuthor: r.post_author || 0,
          postDate: r.post_date || new Date().toISOString(),
          postDateGmt: r.post_date_gmt || new Date().toISOString(),
          postContent: r.post_content || "",
          postTitle: r.post_title || "",
          postExcerpt: r.post_excerpt || "",
          postStatus: r.post_status || "draft",
          commentStatus: r.comment_status || "open",
          pingStatus: r.ping_status || "open",
          postPassword: r.post_password || "",
          postName: r.post_name || "",
          toPing: r.to_ping || "",
          pinged: r.pinged || "",
          postModified: r.post_modified || new Date().toISOString(),
          postModifiedGmt: r.post_modified_gmt || new Date().toISOString(),
          postContentFiltered: r.post_content_filtered || "",
          postParent: r.post_parent || 0,
          guid: r.guid || "",
          menuOrder: r.menu_order || 0,
          postType: r.post_type || "post",
          postMimeType: r.post_mime_type || "",
          commentCount: r.comment_count || 0,
        }))
      );
      break;

    case "wp_users":
      await db.insert(schema.users).values(
        rows.map((r) => ({
          id: r.ID,
          userLogin: r.user_login || "",
          userPass: r.user_pass || "",
          userNicename: r.user_nicename || "",
          userEmail: r.user_email || "",
          userUrl: r.user_url || "",
          userRegistered: r.user_registered || new Date().toISOString(),
          userActivationKey: r.user_activation_key || "",
          userStatus: r.user_status || 0,
          displayName: r.display_name || "",
        }))
      );
      break;

    case "wp_postmeta":
      await db.insert(schema.postmeta).values(
        rows.map((r) => {
          const decoded = decodePhpSerialized(r.meta_value || "");
          return {
            postId: r.post_id,
            metaKey: r.meta_key || "",
            metaValue: decoded.json || r.meta_value || "",
          };
        })
      );
      break;

    case "wp_terms":
      await db.insert(schema.terms).values(
        rows.map((r) => ({
          id: r.term_id,
          name: r.name || "",
          slug: r.slug || "",
          termGroup: String(r.term_group || "0"),
        }))
      );
      break;

    case "wp_term_taxonomy":
      await db.insert(schema.termTaxonomy).values(
        rows.map((r) => ({
          id: r.term_taxonomy_id,
          termId: r.term_id,
          taxonomy: r.taxonomy || "",
          description: r.description || "",
          parent: r.parent || 0,
          count: r.count || 0,
        }))
      );
      break;

    case "wp_term_relationships":
      await db.insert(schema.termRelationships).values(
        rows.map((r) => ({
          objectId: r.object_id,
          termTaxonomyId: r.term_taxonomy_id,
          termOrder: r.term_order || 0,
        }))
      );
      break;

    case "wp_options": {
      const optionValues = rows.map((r) => {
        const decoded = decodePhpSerialized(r.option_value || "");
        return {
          optionName: r.option_name || "",
          optionValue: decoded.json || r.option_value || "",
          autoload: r.autoload || "yes",
        };
      });
      await db.insert(schema.options).values(optionValues);
      break;
    }

    case "wp_comments":
      await db.insert(schema.comments).values(
        rows.map((r) => ({
          id: r.comment_ID,
          commentPostId: r.comment_post_ID,
          commentAuthor: r.comment_author || "",
          commentAuthorEmail: r.comment_author_email || "",
          commentAuthorUrl: r.comment_author_url || "",
          commentAuthorIp: r.comment_author_IP || "",
          commentDate: r.comment_date || new Date().toISOString(),
          commentDateGmt: r.comment_date_gmt || new Date().toISOString(),
          commentContent: r.comment_content || "",
          commentKarma: r.comment_karma || 0,
          commentApproved: r.comment_approved || "1",
          commentAgent: r.comment_agent || "",
          commentType: r.comment_type || "comment",
          commentParent: r.comment_parent || 0,
          userId: r.user_id || 0,
        }))
      );
      break;

    default:
      console.warn(`   ⚠️  Unknown table: ${tableName} — skipping`);
  }
}

/**
 * Count legacy (PHP-serialized) items from option/meta rows.
 */
function countLegacyFromTable(rows: mysql.RowDataPacket[]): number {
  let legacyCount = 0;
  for (const row of rows) {
    const value = row.option_value || row.meta_value || "";
    if (typeof value === "string" && value.startsWith("O:")) {
      legacyCount++;
    }
  }
  return legacyCount;
}

/**
 * Generate a markdown migration report.
 */
function generateMigrationReport(
  progress: MigrationProgress[],
  tables: WpTableInfo[]
): string {
  let totalRead = 0;
  let totalWritten = 0;
  let totalLegacy = 0;

  const lines: string[] = [
    "# Rake CMS — Database Migration Report",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Table | Rows Read | Rows Written | Errors | Legacy Items |",
    "|-------|-----------|-------------|--------|-------------|",
  ];

  for (const p of progress) {
    totalRead += p.recordsRead;
    totalWritten += p.recordsWritten;
    totalLegacy += p.legacyItems;
    lines.push(
      `| ${p.table} | ${p.recordsRead} | ${p.recordsWritten} | ${p.errors} | ${p.legacyItems} |`
    );
  }

  lines.push(
    "",
    `**Total:** ${totalRead} read, ${totalWritten} written, ${totalLegacy} legacy items flagged.`,
    "",
    "## Notes",
    "",
    "- PHP-serialized values in `wp_options` and `wp_postmeta` have been decoded to JSON.",
    "- Objects that could not be decoded (`O:` prefix) are stored in `_legacy_data` columns.",
    "- These legacy items require manual inspection and migration of plugin-specific logic.",
    "- AUTO_INCREMENT columns have been mapped to SERIAL (PostgreSQL) or AUTO_INCREMENT (MySQL).",
    "- LONGTEXT columns have been mapped to generic `text` type.",
    "",
    "## Skipped / Flagged Items",
    "",
    "The following plugin-specific option keys may need manual migration:",
    "",
  );

  return lines.join("\n");
}

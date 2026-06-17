import { Command } from "commander";
import { intro, text, password, select, isCancel, cancel, outro } from "@clack/prompts";

export const importWpCommand = new Command("import:wp")
  .description("Migrate an existing WordPress database and wp-content files")
  .option("--db-host <host>", "MySQL/MariaDB host")
  .option("--db-port <port>", "MySQL/MariaDB port")
  .option("--db-user <user>", "Database username")
  .option("--db-password <password>", "Database password")
  .option("--db-name <name>", "Database name")
  .option("--db-prefix <prefix>", "Table prefix", "wp_")
  .option("--wp-content <path>", "Path to wp-content directory")
  .option("--s3-bucket <bucket>", "S3 bucket for media files")
  .option("--dry-run", "Preview migration without writing data")
  .action(async (options) => {
    intro("Rake CMS — WordPress Import");

    const dbHost =
      options.dbHost ||
      (await text({
        message: "MySQL/MariaDB host:",
        initialValue: "localhost",
      }));
    if (isCancel(dbHost)) process.exit(0);

    const dbPort =
      options.dbPort ||
      (await text({
        message: "Port:",
        initialValue: "3306",
      }));
    if (isCancel(dbPort)) process.exit(0);

    const dbUser =
      options.dbUser ||
      (await text({
        message: "Database username:",
        initialValue: "root",
      }));
    if (isCancel(dbUser)) process.exit(0);

    const dbPass = options.dbPassword || (await password({ message: "Database password:" }));
    if (isCancel(dbPass)) process.exit(0);

    const dbName =
      options.dbName ||
      (await text({ message: "Database name:", placeholder: "wordpress" }));
    if (isCancel(dbName)) process.exit(0);

    const wpContent = options.wpContent
      ? undefined
      : await select({
          message: "Import wp-content/uploads?",
          options: [
            { value: true, label: "Yes — sync media files" },
            { value: false, label: "No — skip files" },
          ],
        });
    if (isCancel(wpContent)) process.exit(0);

    console.log("\n📋 Migration Plan:");
    console.log(`  • DB: ${dbHost}:${dbPort}/${dbName} (prefix: ${options.dbPrefix})`);
    console.log(`  • Files: ${wpContent ? "Yes" : "No"}`);
    console.log(`  • Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);

    if (options.dryRun) {
      console.log("\n🔍 Tables to migrate:");
      const tables = [
        "wp_posts",
        "wp_users",
        "wp_postmeta",
        "wp_terms",
        "wp_term_taxonomy",
        "wp_term_relationships",
        "wp_options",
        "wp_comments",
      ];
      for (const table of tables) {
        console.log(`  • ${options.dbPrefix}${table.replace("wp_", "")}`);
      }
    }

    // Placeholder: actual migration logic will be in Issue 5-6
    console.log("\n⚠️  DB import engine — to be implemented (Issues 5 & 6)");
    outro(`✅ Migration plan complete (${options.dryRun ? "dry run" : "ready"})`);
  });

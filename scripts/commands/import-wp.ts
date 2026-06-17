import { Command } from "commander";
import { intro, text, password, select, isCancel, cancel, outro, spinner } from "@clack/prompts";
import { importDatabase } from "./import-db";

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
      (await text({ message: "MySQL/MariaDB host:", initialValue: "localhost" }));
    if (isCancel(dbHost)) process.exit(0);

    const dbPort =
      options.dbPort ||
      (await text({ message: "Port:", initialValue: "3306" }));
    if (isCancel(dbPort)) process.exit(0);

    const dbUser =
      options.dbUser ||
      (await text({ message: "Database username:", initialValue: "root" }));
    if (isCancel(dbUser)) process.exit(0);

    const dbPass =
      options.dbPassword ||
      (await password({ message: "Database password:" }));
    if (isCancel(dbPass)) process.exit(0);

    const dbName =
      options.dbName ||
      (await text({ message: "Database name:", placeholder: "wordpress" }));
    if (isCancel(dbName)) process.exit(0);

    const importFiles =
      options.wpContent !== undefined
        ? true
        : await select({
            message: "Import wp-content/uploads?",
            options: [
              { value: true, label: "Yes — sync media files" },
              { value: false, label: "No — skip files" },
            ],
          });
    if (isCancel(importFiles)) process.exit(0);

    // Run database import
    console.log("\n📦 Starting database import...");
    const s = spinner();
    s.start("Migrating database");

    try {
      const result = await importDatabase({
        host: dbHost as string,
        port: dbPort as string,
        user: dbUser as string,
        password: dbPass as string,
        database: dbName as string,
        prefix: options.dbPrefix,
        dryRun: options.dryRun,
      });

      s.stop(`✅ Database migration complete`);

      // Print summary
      const totalRead = result.progress.reduce((a, p) => a + p.recordsRead, 0);
      const totalWritten = result.progress.reduce((a, p) => a + p.recordsWritten, 0);
      console.log(`\n📊 Summary: ${totalRead} records read, ${totalWritten} records migrated`);

      if (importFiles && options.wpContent) {
        console.log("\n📁 File import will be added in a future step.");
        console.log(`   Source: ${options.wpContent}`);
      }

      if (options.dryRun) {
        console.log("\n⚠️  This was a DRY RUN — no data was written.");
      }
    } catch (error) {
      s.stop("❌ Migration failed");
      console.error(`\nError: ${(error as Error).message}`);
      process.exit(1);
    }

    outro("Import complete. See migration-report.md for details.");
  });

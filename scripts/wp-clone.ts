#!/usr/bin/env tsx
/**
 * Rake CMS CLI — WordPress migration and site scaffolding tool.
 *
 * Usage:
 *   npx tsx scripts/wp-clone.ts create:site
 *   npx tsx scripts/wp-clone.ts create:post --title "Hello" --status publish
 *   npx tsx scripts/wp-clone.ts import:wp
 *   npx tsx scripts/wp-clone.ts theme:activate my-theme
 */
import { Command } from "commander";
import { createSiteCommand } from "./commands/create-site";
import { createPostCommand } from "./commands/create-post";
import { importWpCommand } from "./commands/import-wp";
import { themeActivateCommand } from "./commands/theme-activate";
import { rapidDeployCommand } from "./commands/rapid-deploy";
import pkg from "../package.json";

const program = new Command();

program
  .name("wp-clone")
  .description("Rake CMS — WordPress clone CLI tools")
  .version(pkg.version || "0.1.0");

program.addCommand(createSiteCommand);
program.addCommand(createPostCommand);
program.addCommand(importWpCommand);
program.addCommand(themeActivateCommand);
program.addCommand(rapidDeployCommand);

program.parse();

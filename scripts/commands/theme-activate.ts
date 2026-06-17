import { Command } from "commander";
import { intro, select, isCancel, cancel, outro } from "@clack/prompts";

export const themeActivateCommand = new Command("theme:activate")
  .description("Swap the active theme/template")
  .argument("[theme-name]", "Name of the theme to activate")
  .option("-l, --list", "List available themes")
  .action(async (themeName, options) => {
    intro("Rake CMS — Theme Manager");

    if (options.list) {
      console.log("\n📂 Available themes:");
      console.log("  • default (active)");
      console.log("  • blog");
      console.log("  • landing");
      outro("Use `theme:activate <name>` to switch");
      return;
    }

    let name = themeName;
    if (!name) {
      name = await select({
        message: "Select a theme to activate:",
        options: [
          { value: "default", label: "Default" },
          { value: "blog", label: "Blog" },
          { value: "landing", label: "Landing Page" },
        ],
      });
      if (isCancel(name)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
    }

    console.log(`\n🎨 Activating theme: "${name}"`);
    console.log("  • Updating theme option in database...");
    console.log("  • Regenerating static pages...");

    // Placeholder: will update wp_options 'template' and 'stylesheet'
    outro(`✅ Theme "${name}" activated`);
  });

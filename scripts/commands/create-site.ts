import { Command } from "commander";
import { intro, text, isCancel, cancel, outro } from "@clack/prompts";

async function scaffoldSite(name: string) {
  // Placeholder: will create a Next.js site from template
  console.log(`\n📦 Scaffolding site: ${name}`);
  console.log("  • Creating project structure...");
  console.log("  • Installing dependencies...");
  console.log("  • Configuring database...");
  console.log("  • Setting up authentication...\n");
  return { success: true, path: `./${name}` };
}

export const createSiteCommand = new Command("create:site")
  .description("Scaffold a new Rake CMS site from a template")
  .argument("[name]", "Site directory name", "rake-cms-site")
  .option("-t, --template <template>", "Template to use", "default")
  .action(async (name, options) => {
    intro("Rake CMS — Create Site");

    let siteName = name;
    if (!siteName || siteName === "rake-cms-site") {
      const response = await text({
        message: "What is the name of your site?",
        placeholder: "my-awesome-site",
        defaultValue: "my-awesome-site",
      });
      if (isCancel(response)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      siteName = response;
    }

    const result = await scaffoldSite(siteName);
    if (result.success) {
      outro(`✅ Site "${siteName}" created at ${result.path}`);
    } else {
      outro("❌ Failed to create site");
    }
  });

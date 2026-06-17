import { Command } from "commander";
import { intro, text, select, isCancel, cancel, outro } from "@clack/prompts";

export const createPostCommand = new Command("create:post")
  .description("Generate a new post/page via command line")
  .option("-t, --title <title>", "Post title")
  .option("-c, --content <content>", "Post content")
  .option("-s, --status <status>", "Post status (draft|publish|pending)")
  .option("--type <type>", "Post type (post|page)", "post")
  .option("--author <authorId>", "Author ID")
  .action(async (options) => {
    intro("Rake CMS — Create Post");

    const title =
      options.title ||
      (await text({
        message: "Post title:",
        placeholder: "My New Post",
        validate: (v: string | undefined) => (!v ? "Title is required" : undefined),
      }));

    if (isCancel(title)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    const content =
      options.content ||
      (await text({
        message: "Post content (markdown or block JSON):",
        placeholder: "Write your content here...",
      }));

    if (isCancel(content)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    const status =
      options.status ||
      (await select({
        message: "Post status:",
        options: [
          { value: "draft", label: "Draft" },
          { value: "publish", label: "Publish" },
          { value: "pending", label: "Pending Review" },
        ],
      }));

    if (isCancel(status)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    console.log(`\n📝 Creating ${options.type}: "${title}"`);
    console.log(`  • Status: ${status}`);
    console.log(`  • Content length: ${(content as string).length} chars`);
    console.log(`  • Type: ${options.type}`);

    // Placeholder: actual DB insertion will be implemented
    outro(`✅ Post "${title}" created (${status})`);
  });

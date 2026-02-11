import { buildBlog } from "./src/cli/build.ts";
import { createNewPost } from "./src/cli/commands.ts";
import { initBlog } from "./src/cli/init.ts";

/**
 * Show help message
 */
function showHelp() {
  console.log("Deno QuickBlog\n");
  console.log("Usage:");
  console.log(
    "  deno run -A jsr:@simonneutert/quickblog [command]\n",
  );
  console.log("Commands:");
  console.log("  build       Build your blog (default)");
  console.log("  new         Create a new blog post");
  console.log("  init        Initialize a new blog directory");
  console.log("  help        Show this help message\n");
  console.log("Options for 'new' command:");
  console.log("  --yaml, -y  Use YAML frontmatter instead of TOML (default)\n");
  console.log("Examples:");
  console.log(
    '  deno run -A jsr:@simonneutert/quickblog new "My Post Title"',
  );
  console.log(
    '  deno run -A jsr:@simonneutert/quickblog new "My Post" --yaml',
  );
  console.log("  deno run -A jsr:@simonneutert/quickblog build");
  console.log("  deno run -A jsr:@simonneutert/quickblog init");
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const command = Deno.args[0] || "build";

  try {
    switch (command) {
      case "build":
        await buildBlog();
        break;

      case "new":
        createNewPost();
        break;

      case "init":
        initBlog();
        break;

      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}\n`);
        showHelp();
        Deno.exit(1);
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("\n❌ Error:", err.message);
    Deno.exit(1);
  }
}

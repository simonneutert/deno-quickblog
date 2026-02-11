import { checkLangSupport } from "../i18n/i18n.ts";
import { checkNamingCollisionsPublicAndPages } from "../ingest-files.ts";
import {
  cleanUpDistDirectory,
  copyDirRecursive,
  createPages,
  createPosts,
  writeIndex,
} from "../write-files.ts";

/**
 * Validates that the current directory contains required blog structure
 */
function validateBlogDirectory() {
  const requiredPaths = [
    { path: "posts", type: "directory" },
    { path: "pages", type: "directory" },
    { path: "index.md", type: "file" },
  ];

  const missing: string[] = [];

  for (const { path, type } of requiredPaths) {
    try {
      const stat = Deno.statSync(path);
      if (type === "directory" && !stat.isDirectory) {
        missing.push(`${path}/ (expected directory, found file)`);
      } else if (type === "file" && !stat.isFile) {
        missing.push(`${path} (expected file, found directory)`);
      }
    } catch {
      missing.push(path);
    }
  }

  if (missing.length > 0) {
    console.error("❌ This doesn't look like a blog directory!\n");
    console.error("Missing required files/folders:");
    missing.forEach((item) => console.error(`  - ${item}`));
    console.error("\nRun this command to create a new blog:");
    console.error("  deno run -A jsr:@simonneutert/quickblog init");
    Deno.exit(1);
  }
}

/**
 * Main build function - generates the static blog
 */
export async function buildBlog() {
  validateBlogDirectory();
  checkNamingCollisionsPublicAndPages();
  console.log("Deno-QuickBlog - Building blog...\n");
  checkLangSupport();
  cleanUpDistDirectory();
  console.log("Cleaned up files.");
  Deno.mkdirSync("dist", { recursive: true });
  const posts = createPosts();
  posts.sort((a, b) => b.postKey.localeCompare(a.postKey));
  console.log("Read posts.");
  console.log("Writing blog posts.");
  await createPages(posts);
  console.log("Writing pages.");
  writeIndex(posts);
  console.log("Writing index page.");
  copyDirRecursive("public", "dist");
  console.log("Copied public folder.");
  console.log("\n✅ Blog build complete!");
  console.log("\nTo preview locally:");
  console.log(
    "  deno run --allow-net --allow-read jsr:@std/http/file-server dist/",
  );
}

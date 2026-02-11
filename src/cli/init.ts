function checkCleanDirectory(): string[] {
  // Check if current directory already has blog structure
  const existingPaths: string[] = [];
  const pathsToCheck = [
    "posts",
    "pages",
    "public",
    "index.md",
    "nav.md",
    "footer.md",
  ];

  for (const path of pathsToCheck) {
    try {
      Deno.statSync(path);
      existingPaths.push(path);
    } catch {
      // Path doesn't exist, which is what we want
    }
  }
  return existingPaths;
}

function errorOnExistingPaths(existingPaths: string[]) {
  if (existingPaths.length > 0) {
    console.error("⚠️  Some blog files/folders already exist:");
    existingPaths.forEach((path) => console.error(`  - ${path}`));
    console.error(
      "\nTo avoid overwriting existing content, please run this command in an empty directory.",
    );
    Deno.exit(1);
  }
}

function createDirectoryStructure() {
  console.log("Creating directory structure...");
  Deno.mkdirSync("posts", { recursive: true });
  Deno.mkdirSync("pages", { recursive: true });
  Deno.mkdirSync("public/img", { recursive: true });
}

function createIndexMd() {
  Deno.writeTextFileSync(
    "index.md",
    `+++
title = "Welcome to My Blog"
+++

This is your blog's homepage. Edit this file to customize it!

## Recent Posts

{{ POSTS_LIST(5) }}
`,
  );
}

function createNavMd() {
  // Create nav.md
  Deno.writeTextFileSync(
    "nav.md",
    `[Home](/) | [About](/about.html) | [Posts](/posts.html)`,
  );
}

function createFooterMd() {
  Deno.writeTextFileSync(
    "footer.md",
    `Built with [Deno QuickBlog](https://github.com/simonneutert/deno-quickblog)`,
  );
}

function createAboutPage() {
  Deno.writeTextFileSync(
    "pages/about.md",
    `+++
title = "About me"
+++

Write something about yourself here!
`,
  );
}

function createPostsPage() {
  Deno.writeTextFileSync(
    "pages/posts.md",
    `+++
title = "All Posts"
+++

{{ POSTS_LIST }}
`,
  );
}

function createExamplePost() {
  // Create example post
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const examplePostFile = `posts/${year}-${month}-${day}-welcome.md`;

  Deno.writeTextFileSync(
    examplePostFile,
    `+++
title = "Welcome to My New Blog!"
+++

This is your first blog post. Edit or delete this file to get started.

You can use **Markdown** to format your posts:

- Lists
- _Italic text_
- **Bold text**
- [Links](https://example.com)

\`\`\`javascript
// Code blocks with syntax highlighting
console.log("Hello, world!");
\`\`\`

To create a new post, run:

\`\`\`bash
# Create post with TOML frontmatter (default)
deno run -A jsr:@simonneutert/quickblog new "Your Post Title"

# Or with YAML frontmatter
deno run -A jsr:@simonneutert/quickblog new "Your Post Title" --yaml
\`\`\`

To build your blog, run:

\`\`\`bash
deno run -A jsr:@simonneutert/quickblog build
\`\`\`
`,
  );
  return examplePostFile;
}

/**
 * Scaffolds a new blog directory structure with example content
 */
export function initBlog() {
  console.log("📝 Initializing new blog...\n");
  const existingPaths = checkCleanDirectory();
  errorOnExistingPaths(existingPaths);
  createDirectoryStructure();

  createIndexMd();
  createNavMd();
  createFooterMd();
  createAboutPage();
  createPostsPage();
  const examplePostFile = createExamplePost();

  console.log("\n✅ Blog initialized successfully!\n");
  console.log("Created:");
  console.log("  📁 posts/");
  console.log("  📁 pages/");
  console.log("  📁 public/img/");
  console.log("  📄 index.md");
  console.log("  📄 nav.md");
  console.log("  📄 footer.md");
  console.log(`  📄 ${examplePostFile}`);
  console.log("\n\nNext steps:");
  console.log("  1. Edit the content files to customize your blog");
  console.log(
    "  2. Run: deno run -A jsr:@simonneutert/quickblog build",
  );
  console.log(
    "  3. Preview: deno run --allow-net --allow-read jsr:@std/http/file-server dist/",
  );
  console.log("\n\nHappy blogging! 🚀");
}

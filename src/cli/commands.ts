import { formatDateString, titleToSlug } from "../helpers.ts";

/**
 * Validates that the posts directory exists
 */
function validatePostsDirectory() {
  try {
    const stat = Deno.statSync("posts");
    if (!stat.isDirectory) {
      console.error("❌ 'posts' exists but is not a directory");
      Deno.exit(1);
    }
  } catch {
    console.error("❌ 'posts' directory not found");
    console.error("\nRun this command to create a new blog:");
    console.error("  deno run -A jsr:@simonneutert/quickblog init");
    Deno.exit(1);
  }
}

/**
 * Creates a new blog post with the given title
 */
export function createNewPost() {
  validatePostsDirectory();

  // Get title from arguments or use default
  const args = Deno.args.slice(1); // Skip the "new" command

  // Check for format flag
  const useYaml = args.includes("--yaml") || args.includes("-y");
  const filteredArgs = args.filter((arg) => arg !== "--yaml" && arg !== "-y");
  const title = filteredArgs.join(" ").trim() || "New Post";
  const slug = titleToSlug(title);

  const now = new Date();
  const year = `${now.getFullYear()}`;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const fileName = `posts/${formatDateString(year, month, day)}-${slug}.md`;

  // Check if file already exists
  try {
    Deno.statSync(fileName);
    console.error(`❌ Post already exists: ${fileName}`);
    console.error("\nTry a different title or edit the existing post.");
    Deno.exit(1);
  } catch {
    // File does not exist, continue
  }

  // Create the post file with TOML (default) or YAML frontmatter
  const frontmatter = useYaml
    ? `---\ntitle: "${title}"\n---`
    : `+++\ntitle = "${title}"\n+++`;

  Deno.writeTextFileSync(
    fileName,
    `${frontmatter}\n\nWrite your post content here!`,
  );

  const format = useYaml ? "YAML" : "TOML";
  console.log(`✅ New post created: ${fileName} (${format} format)`);
}

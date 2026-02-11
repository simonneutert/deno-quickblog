import { assert, assertEquals } from "@std/assert";
import {
  createHtmlPageFromMarkdown,
  createHtmlPostFromMarkdown,
  createHtmlPostFromMarkdownToHTML,
  createLatestPostsMarkdown,
  createPostListMarkdown,
  renderFooter,
  renderMarkdownFileToHtml,
} from "../src/render-markdown.ts";

Deno.test("createHtmlPostFromMarkdown creates correct HTML from markdown", () => {
  const markdown = `This is a **test** post.`;
  const result = createHtmlPostFromMarkdown(
    "Test Post",
    markdown,
    "2024",
    "06",
    "01",
  );
  assertEquals(
    result,
    `
<article>
  <p><em>2024-06-01</em></p>
  <h1>Test Post</h1>
  <p>This is a <strong>test</strong> post.</p>
</article>
`,
  );
});

Deno.test("createLatestPostsMarkdown creates correct HTML for latest posts", () => {
  const posts = [
    {
      postKey: "20240628",
      postDate: "2024-06-28",
      title: "Post 2",
      content: "Content of post 2",
      url: "/posts/2024-06-28-post2",
      nextUrl: null,
      prevUrl: null,
    },
    {
      postKey: "20240528",
      postDate: "2024-05-28",
      title: "Post 1",
      content: "Content of post 1",
      url: "/posts/2024-05-28-post1",
      nextUrl: null,
      prevUrl: null,
    },
  ];
  posts.sort((a, b) => b.postKey.localeCompare(a.postKey)); // Sort posts by date descending
  const result = createLatestPostsMarkdown(posts);
  assertEquals(
    result,
    `
<article>
  <p><em>2024-06-28</em></p>
  <h1>Post 2</h1>
  <p>Content of post 2</p>
</article>

<article>
  <p><em>2024-05-28</em></p>
  <h1>Post 1</h1>
  <p>Content of post 1</p>
</article>
`,
  );
});

Deno.test("createHtmlPostFromMarkdown handles empty markdown", () => {
  const markdown = ``;
  const result = createHtmlPostFromMarkdown(
    "Empty Post",
    markdown,
    "2024",
    "06",
    "01",
  );
  assertEquals(
    result,
    `
<article>
  <p><em>2024-06-01</em></p>
  <h1>Empty Post</h1>
  </article>
`,
  );
});

Deno.test("renderMarkdownFileToHtml handles non-existent file", () => {
  const res = renderMarkdownFileToHtml("non-existent-file.md");
  assertEquals(res, ""); // Should return empty string for non-existent file
});

Deno.test("renderMarkdownFileToHtml handles file", () => {
  // create tmp file
  const tempfile = Deno.makeTempFileSync({
    prefix: "test-nav-",
    suffix: ".md",
  });
  Deno.writeTextFileSync(tempfile, "# Test Nav\n\nThis is a test nav.");
  const res = renderMarkdownFileToHtml(tempfile);
  // Assuming nav.md exists and contains some markdown content
  // You might want to adjust the expected output based on the actual content of nav.md
  assertEquals(typeof res, "string");
});

Deno.test("createHtmlPostFromMarkdownToHTML creates html with prevurl and nexturl", () => {
  const markdown = `This is a **test** post.`;
  const result = createHtmlPostFromMarkdownToHTML(
    "Test Post",
    markdown,
    "2024",
    "06",
    "01",
    "/posts/2024-06-01-test-post",
    "/posts/2024-05-28-post1",
  );
  assert(result.length > 54000);
  assert(result.includes("<!DOCTYPE html>"));
  assert(result.includes("<body"));
  assert(result.includes("</body>"));
  assert(result.includes('a href="/posts/2024-05-28-post1"'));
  assert(result.includes("</footer>"));
  assert(result.includes("</html>"));
});

Deno.test("createHtmlPostFromMarkdownToHTML creates html with prevurl", () => {
  const markdown = `This is a **test** post.`;
  const result = createHtmlPostFromMarkdownToHTML(
    "Test Post",
    markdown,
    "2024",
    "06",
    "01",
    undefined,
    "/posts/2024-05-28-post1",
  );
  assert(result.length > 54000);
  assert(result.includes("<!DOCTYPE html>"));
  assert(result.includes("<body"));
  assert(result.includes("</body>"));
  assert(result.includes('a href="/posts/2024-05-28-post1"'));
  assert(result.includes("</footer>"));
  assert(result.includes("</html>"));
});

Deno.test("createHtmlPostFromMarkdownToHTML creates html with nexturl", () => {
  const markdown = `This is a **test** post.`;
  const result = createHtmlPostFromMarkdownToHTML(
    "Test Post",
    markdown,
    "2024",
    "06",
    "01",
    "/posts/2024-05-28-post1",
    undefined,
  );
  assert(result.length > 54000);
  assert(result.includes("<!DOCTYPE html>"));
  assert(result.includes("<body"));
  assert(result.includes("</body>"));
  assert(result.includes('a href="/posts/2024-05-28-post1"'));
  assert(result.includes("</footer>"));
  assert(result.includes("</html>"));
});

Deno.test("createHtmlPageFromMarkdown works correctly", () => {
  const markdown = `This is a **test** page.`;
  const result = createHtmlPageFromMarkdown(
    "Test Page",
    markdown,
  );
  assert(result.length > 54000);
  assert(result.includes("<!DOCTYPE html>"));
  assert(result.includes("<body"));
  assert(result.includes("</body>"));
  assert(result.includes("</footer>"));
  assert(result.includes("</html>"));
});

Deno.test("createPostListMarkdown creates correct markdown list", () => {
  const posts = [
    {
      postKey: "20240628",
      postDate: "2024-06-28",
      title: "Post 2",
      content: "Content of post 2",
      url: "/posts/2024-06-28-post2",
      nextUrl: null,
      prevUrl: null,
    },
    {
      postKey: "20240528",
      postDate: "2024-05-28",
      title: "Post 1",
      content: "Content of post 1",
      url: "/posts/2024-05-28-post1",
      nextUrl: null,
      prevUrl: null,
    },
  ];
  posts.sort((a, b) => b.postKey.localeCompare(a.postKey)); // Sort posts by date descending
  const result = createPostListMarkdown(posts);
  assertEquals(
    result,
    `- <small>2024-06-28</small> [Post 2](/posts/2024-06-28-post2)\n` +
      `- <small>2024-05-28</small> [Post 1](/posts/2024-05-28-post1)\n`,
  );
});

Deno.test("renderFooter returns empty string when DENO_QUICKBLOG_HIDE_FOOTER is true", () => {
  Deno.env.set("DENO_QUICKBLOG_HIDE_FOOTER", "true");
  const footer = renderFooter();
  assertEquals(footer, ""); // Should return empty string when the environment variable is set to true
  Deno.env.delete("DENO_QUICKBLOG_HIDE_FOOTER"); // Clean up environment variable after test
});

Deno.test("renderFooter returns footer content when DENO_QUICKBLOG_HIDE_FOOTER is not set", () => {
  Deno.env.delete("DENO_QUICKBLOG_HIDE_FOOTER"); // Ensure the environment variable is not set
  const footer = renderFooter();
  assert(footer.includes("<footer>")); // Should include footer content when the environment variable is not set
});

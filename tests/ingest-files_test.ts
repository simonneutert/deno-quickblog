import { assertEquals } from "@std/assert";
import {
  checkCollisionsBetweenPublicAndPages,
  checkNamingCollisionsPublicAndPages,
  checkReservedPostsName,
  findMarkdownFiles,
  postList,
  readContentAndFrontMatter,
} from "../src/ingest-files.ts";

Deno.test("readContentAndFrontMatter no front matter returns content and undefined front matter", () => {
  const tempFile = Deno.makeTempFileSync({ suffix: ".md" });
  const markdownContent = `This is a markdown file without front matter.`;
  Deno.writeTextFileSync(tempFile, markdownContent);

  const result = readContentAndFrontMatter(tempFile);
  assertEquals(result.frontMatter, {
    noFrontMatter: true,
    title: "This is a markdown file without front ma...",
  });
  assertEquals(result.content, markdownContent);
});

Deno.test("readContentAndFrontMatter correctly extracts front matter and content", () => {
  const tempFile = Deno.makeTempFileSync({ suffix: ".md" });
  const markdownContentYaml = `---
title: Test Post
date: 2023-01-01
---

This is the content of the post.`;
  Deno.writeTextFileSync(tempFile, markdownContentYaml);

  const resultYaml = readContentAndFrontMatter(tempFile);
  assertEquals(resultYaml.frontMatter, {
    title: "Test Post",
    date: new Date("2023-01-01"),
  });
  assertEquals(resultYaml.content, "This is the content of the post.");

  const markdownContentToml = `+++
title = "Test Post"
date = 2023-01-01
+++

This is the content of the post.`;
  Deno.writeTextFileSync(tempFile, markdownContentToml);

  const resultToml = readContentAndFrontMatter(tempFile);
  assertEquals(resultToml.frontMatter, {
    title: "Test Post",
    date: new Date("2023-01-01"),
  });
  assertEquals(resultToml.content, "This is the content of the post.");

  const markdownContentTomlDateString = `+++
title = "Test Post"
date = "2023-01-01"
+++

This is the content of the post.`;
  Deno.writeTextFileSync(tempFile, markdownContentTomlDateString);

  const resultTomlDateString = readContentAndFrontMatter(tempFile);
  assertEquals(resultTomlDateString.frontMatter, {
    title: "Test Post",
    date: "2023-01-01",
  });
  assertEquals(
    resultTomlDateString.content,
    "This is the content of the post.",
  );
});

Deno.test({
  name: "checkCollisionsBetweenPublicAndPages detects naming collisions",
  fn: () => {
    const publicNames = new Set(["index.html", "about.md", "yo.md"]);
    const pageNames = new Set(["index.html", "blog.md", "contact.md"]);
    const x = checkCollisionsBetweenPublicAndPages(
      publicNames,
      pageNames,
      false,
    );
    assertEquals(x, { collision: "index.html" });
  },
  sanitizeExit: true,
});

Deno.test({
  name:
    "checkReservedPostsName detects reserved 'posts' name in public directory",
  fn: () => {
    const entries = [
      { name: "index.html", isFile: true, isDirectory: false },
      { name: "posts", isFile: false, isDirectory: true },
    ] as Deno.DirEntry[];
    const x = checkReservedPostsName(entries, "public", false);
    assertEquals(x, { collision: "posts" });
  },
  sanitizeExit: true,
});

Deno.test({
  name:
    "checkReservedPostsName detects reserved 'posts' name in pages directory",
  fn: () => {
    const entries = [
      { name: "index.html", isFile: true, isDirectory: false },
      { name: "posts", isFile: false, isDirectory: true },
    ] as Deno.DirEntry[];
    const x = checkReservedPostsName(entries, "pages", false);
    assertEquals(x, { collision: "posts" });
  },
  sanitizeExit: true,
});

Deno.test("postList returns sorted list of posts with correct URLs", () => {
  // Setup: Create a temporary posts directory with markdown files
  const tempDir = Deno.makeTempDirSync();
  Deno.mkdirSync(`${tempDir}/posts`);
  Deno.writeTextFileSync(
    `${tempDir}/posts/2023-01-01-post1.md`,
    `---
title: Post One
date: 2023-01-01
---

Content of post one.`,
  );
  Deno.writeTextFileSync(
    `${tempDir}/posts/2025-09-11-post2.md`,
    `---
title: Post Two
date: 2025-09-11
---

Content of post two.`,
  );

  // Change working directory to the temp directory for the test
  const originalCwd = Deno.cwd();
  Deno.chdir(tempDir);

  try {
    const posts = postList();
    assertEquals(posts.length, 2);
    assertEquals(posts[0].postKey, "20250911");
    assertEquals(posts[0].url, "/posts/2025/09/11/post2/");
    assertEquals(posts[1].postKey, "20230101");
    assertEquals(posts[1].url, "/posts/2023/01/01/post1/");
  } finally {
    // Cleanup: Remove the temporary directory and restore original working directory
    Deno.chdir(originalCwd);
    Deno.removeSync(tempDir, { recursive: true });
  }
});

Deno.test("findMarkdownFiles correctly finds markdown files in nested directories", () => {
  const tempDir = Deno.makeTempDirSync();
  Deno.mkdirSync(`${tempDir}/posts`);
  Deno.mkdirSync(`${tempDir}/posts/nested`);
  Deno.writeTextFileSync(`${tempDir}/posts/post1.md`, `Content of post one.`);
  Deno.writeTextFileSync(
    `${tempDir}/posts/nested/post2.md`,
    `Content of post two.`,
  );
  Deno.writeTextFileSync(
    `${tempDir}/posts/nested/not_markdown.txt`,
    `This should not be included.`,
  );

  const originalCwd = Deno.cwd();
  Deno.chdir(tempDir);

  try {
    const markdownFiles = findMarkdownFiles("posts");
    assertEquals(markdownFiles.length, 2);
    assertEquals(markdownFiles.sort(), ["post1.md", "nested/post2.md"].sort());
  } finally {
    Deno.chdir(originalCwd);
    Deno.removeSync(tempDir, { recursive: true });
  }
});

Deno.test({
  name: "checkNamingCollisionsPublicAndPages detects collisions and exits",
  fn: () => {
    //create temp directories and files to simulate the collision
    const tempDir = Deno.makeTempDirSync();
    Deno.mkdirSync(`${tempDir}/public`);
    Deno.mkdirSync(`${tempDir}/pages`);
    Deno.writeTextFileSync(`${tempDir}/public/sitemap.xml`, "Public Index");
    Deno.writeTextFileSync(`${tempDir}/pages/sitemap.xml`, "Pages Index");

    const originalCwd = Deno.cwd();
    Deno.chdir(tempDir);

    try {
      const result = checkNamingCollisionsPublicAndPages(
        "public",
        "pages",
        false,
      );
      assertEquals(result, { collision: "sitemap.xml" });
    } finally {
      Deno.chdir(originalCwd);
      Deno.removeSync(tempDir, { recursive: true });
    }
  },
  sanitizeExit: true,
});

Deno.test({
  name:
    "checkNamingCollisionsPublicAndPages detects no collisions and returns undefined",
  fn: () => {
    const tempDir = Deno.makeTempDirSync();
    Deno.mkdirSync(`${tempDir}/public`);
    Deno.mkdirSync(`${tempDir}/pages`);
    Deno.writeTextFileSync(`${tempDir}/public/index.html`, "Public Index");
    Deno.writeTextFileSync(`${tempDir}/pages/index.txt`, "Pages Index");

    const originalCwd = Deno.cwd();
    Deno.chdir(tempDir);

    try {
      const result = checkNamingCollisionsPublicAndPages(
        "public",
        "pages",
        false,
      );
      assertEquals(result, undefined);
    } finally {
      Deno.chdir(originalCwd);
      Deno.removeSync(tempDir, { recursive: true });
    }
  },
  sanitizeExit: true,
});

Deno.test("readContentAndFrontMatter nonexistent file returns empty content and undefined front matter", () => {
  const result = readContentAndFrontMatter("nonexistent-file.md");
  assertEquals(result.content, "");
  assertEquals(result.frontMatter, undefined);
});

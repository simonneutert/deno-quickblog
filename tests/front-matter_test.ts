import { assertEquals } from "@std/assert";
import {
  extractTitle,
  fallbackTitleNoFrontMatter,
} from "../src/front-matter.ts";

Deno.test("extractTitle returns title from front matter", () => {
  const frontMatter = { title: "My Blog Post" };
  const title = extractTitle(frontMatter);
  assertEquals(title, "My Blog Post");
});

Deno.test("extractTitle returns 'Untitled Post' if title is missing", () => {
  const frontMatter = { date: "2023-01-01" };
  const title = extractTitle(frontMatter);
  assertEquals(title, "Untitled Post");
});

Deno.test("fallbackTitleNoFrontMatter when content has a h1 heading", () => {
  const content = `# My Blog Post\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has a h2 heading", () => {
  const content = `## My Blog Post\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has a h3 heading", () => {
  const content = `### My Blog Post\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has no headings", () => {
  const content = `This is the first line.\nThis is the second line.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "This is the first line.");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has no headings and first line is longer than max length", () => {
  const longLine =
    "This is a very long line that should be truncated to fit the maximum length.";
  const content = `${longLine}\nThis is the second line.`;
  const result = fallbackTitleNoFrontMatter(content);
  const expectedTitle = longLine.slice(0, 40) + "...";
  assertEquals(result.frontMatter.title, expectedTitle);
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content is empty", () => {
  const content = ``;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "Untitled Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has only whitespace", () => {
  const content = `   \n   \n`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "Untitled Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has a heading with leading whitespace", () => {
  const content = `   # My Blog Post\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has a heading with trailing whitespace", () => {
  const content = `# My Blog Post   \nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has multiple headings", () => {
  const content =
    `# My Blog Post\n## Subheading\n### Sub-subheading\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post");
  assertEquals(result.content, content);
});

Deno.test("fallbackTitleNoFrontMatter when content has a heading with special characters", () => {
  const content = `# My Blog Post! @#$%^&*()\nThis is the content of the post.`;
  const result = fallbackTitleNoFrontMatter(content);
  assertEquals(result.frontMatter.title, "My Blog Post! @#$%^&*()");
  assertEquals(result.content, content);
});

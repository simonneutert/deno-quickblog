// write tests for src/helpers.ts
import { assertEquals } from "@std/assert";
import {
  formatDateString,
  limitPostList,
  titleToSlug,
} from "../src/helpers.ts";
import type { PostInfo } from "../src/post-info.ts";

const postInfoMock = (title: string): PostInfo => ({
  postKey: "",
  postDate: "",
  title,
  content: "",
  url: "",
  nextUrl: null,
  prevUrl: null,
});

Deno.test("formatDateString formats date correctly", () => {
  const result = formatDateString("2024", "06", "01");
  assertEquals(result, "2024-06-01");
});

Deno.test("limitPostList limits the number of posts based on the regex", () => {
  const content = "Here are some posts: {{POSTS_LIST(2)}}";
  const posts = [
    postInfoMock("Post 1"),
    postInfoMock("Post 2"),
    postInfoMock("Post 3"),
    postInfoMock("Post 4"),
  ] as PostInfo[];
  const limitedPosts = limitPostList(
    content,
    /\{\{\s*POSTS_LIST(?:\(\d{1,3}\))?\s*\}\}/,
    posts,
  );
  assertEquals(limitedPosts.length, 2);
  assertEquals(limitedPosts[0].title, "Post 1");
  assertEquals(limitedPosts[1].title, "Post 2");
});

Deno.test("titleToSlug converts title to URL-safe slug", () => {
  const result = titleToSlug("Hello World! This is a Test.");
  assertEquals(result, "hello-world-this-is-a-test");
});

import { assertEquals } from "@std/assert";
import {
  includeLatestPostsPartial,
  includePostListPartial,
} from "../src/content-modifier.ts";
import type { PostInfo } from "../src/post-info.ts";

Deno.test("includeLatestPostsPartial nothing to include", () => {
  const content = "No latest posts here.";
  const posts: PostInfo[] = [];
  const result = includeLatestPostsPartial(content, posts);
  assertEquals(result, content);
});

Deno.test("includeLatestPostsPartial includes latest posts in content", () => {
  const content = "Check out my latest posts: {{LATEST_POSTS(2)}}";
  const posts = [
    {
      postKey: "20240401",
      postDate: "2024-04-01",
      title: "Post 1",
      content: "Content of post 1",
      url: "/posts/2024-04-01-post1",
      nextUrl: null,
      prevUrl: null,
    },
    {
      postKey: "20240528",
      postDate: "2024-05-28",
      title: "Post 2",
      content: "Content of post 2",
      url: "/posts/2024-05-28-post2",
      nextUrl: null,
      prevUrl: null,
    },
    {
      postKey: "20240628",
      postDate: "2024-06-28",
      title: "Post 3",
      content: "Content of post 3",
      url: "/posts/2024-06-28-post3",
      nextUrl: null,
      prevUrl: null,
    },
  ];

  posts.sort((a, b) => b.postKey.localeCompare(a.postKey)); // Sort posts by date descending
  const result = includeLatestPostsPartial(content, posts);
  assertEquals(
    result,
    `Check out my latest posts: 
<article>
  <p><em>2024-06-28</em></p>
  <h1>Post 3</h1>
  <p>Content of post 3</p>
</article>

<article>
  <p><em>2024-05-28</em></p>
  <h1>Post 2</h1>
  <p>Content of post 2</p>
</article>
`,
  );
});

Deno.test("includePostListPartial without placeholder returns original content", () => {
  const content = "This is a page without the placeholder.";
  const posts: PostInfo[] = [];
  const result = includePostListPartial(content, posts);
  assertEquals(result, content);
});

Deno.test("includePostListPartial includes full post list in content", () => {
  const content = "All posts:\n\n{{POSTS_LIST}}";
  const posts = [
    {
      postKey: "20240401",
      postDate: "2024-04-01",
      title: "Post 1",
      content: "Content of post 1",
      url: "/posts/2024-04-01-post1",
      nextUrl: null,
      prevUrl: null,
    },
    {
      postKey: "20240528",
      postDate: "2024-05-28",
      title: "Post 2",
      content: "Content of post 2",
      url: "/posts/2024-05-28-post2",
      nextUrl: null,
      prevUrl: null,
    },
  ];

  posts.sort((a, b) => b.postKey.localeCompare(a.postKey)); // Sort posts by date descending
  const result = includePostListPartial(content, posts);
  assertEquals(
    result,
    `All posts:

- <small>2024-05-28</small> [Post 2](/posts/2024-05-28-post2)
- <small>2024-04-01</small> [Post 1](/posts/2024-04-01-post1)
`,
  );
});

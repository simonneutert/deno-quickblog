import { limitPostList } from "./helpers.ts";
import type { PostInfo } from "./post-info.ts";
import {
  createLatestPostsMarkdown,
  createPostListMarkdown,
} from "./render-markdown.ts";

export function includePostListPartial(
  content: string,
  posts: PostInfo[],
): string {
  let fullContent = "";
  const postsListRegex = /\{\{\s*POSTS_LIST(?:\(\d{1,3}\))?\s*\}\}/;
  if (postsListRegex.test(content)) {
    // if a number is specified, the number of posts listed
    // will be limited to that number
    posts = limitPostList(content, postsListRegex, posts);
    fullContent = content.replace(
      postsListRegex,
      createPostListMarkdown(posts),
    );
  } else {
    fullContent = content;
  }
  return fullContent;
}

export function includeLatestPostsPartial(
  content: string,
  posts: PostInfo[],
): string {
  // This replaces {{LATEST_POSTS}} with the latest 1 post (default).
  // Or if {{LATEST_POSTS(n)}} is used, it will replace it with the latest n posts (rendered).
  let fullContent = "";
  const latestPostsRegex = /\{\{\s*LATEST_POSTS(?:\(\d{1,3}\))?\s*\}\}/;
  if (latestPostsRegex.test(content)) {
    // if a number is specified, the number of posts listed will be limited to that number
    // otherwise defaults to 1 post
    posts = limitPostList(content, latestPostsRegex, posts, 1);
    fullContent = content.replace(
      latestPostsRegex,
      createLatestPostsMarkdown(posts),
    );
    console.log("Included latest posts partial with", posts.length, "posts");
  } else {
    fullContent = content;
  }
  return fullContent;
}

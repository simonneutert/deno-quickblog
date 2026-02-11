import type { PostInfo } from "./post-info.ts";

export function formatDateString(
  year: string,
  month: string,
  day: string,
  joiner = "-",
): string {
  return [year, month, day].join(joiner);
}

export function limitPostList(
  content: string,
  postsListRegex: RegExp,
  posts: PostInfo[],
  defaultLimit?: number,
): PostInfo[] {
  const match = content.match(postsListRegex);
  let limit = defaultLimit;
  if (match && match[0]) {
    const numMatch = match[0].match(/\(\d{1,3}\)/);
    if (numMatch) {
      limit = parseInt(numMatch[0].slice(1, -1));
    }
  }
  if (limit !== undefined) {
    posts = posts.slice(0, limit);
  }
  return posts;
}

/**
 * Converts a title to a URL-safe slug
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

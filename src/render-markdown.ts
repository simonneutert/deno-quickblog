import { render } from "@deno/gfm";
import { formatDateString } from "./helpers.ts";
import { i18n } from "./i18n/i18n.ts";
import { htmlTemplate } from "./html-template.ts";
import type { PostInfo } from "./post-info.ts";

export function renderMarkdownFileToHtml(filePath: string): string {
  try {
    return render(Deno.readTextFileSync(filePath), {
      baseUrl: Deno.env.get("BASE_URL") ?? "",
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return ``; // Return empty string if file does not exist or cannot be read
  }
}

export function createHtmlPageFromMarkdown(
  title: string,
  markdown: string,
): string {
  const body = render(markdown, {
    baseUrl: Deno.env.get("BASE_URL") ?? "",
  });
  const nav = renderNav();
  const content = `<h1>${title}</h1>
${body}`;
  return htmlTemplate({ title, content, nav, footer: renderFooter() });
}

export function renderNav(): string {
  return renderMarkdownFileToHtml("nav.md");
}

export function renderFooter(): string {
  const markdown = renderMarkdownFileToHtml("footer.md");
  if (Deno.env.get("DENO_QUICKBLOG_HIDE_FOOTER") === "true") {
    return "";
  }
  return `<footer>
  ${markdown}
</footer>
`;
}

export function createPostListMarkdown(posts: PostInfo[]): string {
  let postList = "";
  for (const post of posts) {
    postList +=
      `- <small>${post.postDate}</small> [${post.title}](${post.url})\n`;
  }
  return postList;
}

export function createHtmlPostFromMarkdown(
  title: string,
  markdown: string,
  year: string,
  month: string,
  day: string,
): string {
  const body = render(markdown, {
    baseUrl: Deno.env.get("BASE_URL") ?? "",
  });
  const content = `
<article>
  <p><em>${formatDateString(year, month, day)}</em></p>
  <h1>${title}</h1>
  ${body}</article>
`;
  return content;
}

export function createHtmlPostFromMarkdownToHTML(
  title: string,
  markdown: string,
  year: string,
  month: string,
  day: string,
  nextUrl?: string,
  prevUrl?: string,
): string {
  let content = createHtmlPostFromMarkdown(title, markdown, year, month, day);
  content += `<hr>
    ${prevUrl ? `<a href="${prevUrl}">&#8592; ${i18n().previous}</a>` : ""}${
    prevUrl && nextUrl ? " | " : ""
  }${nextUrl ? `<a href="${nextUrl}">${i18n().next} &#8594;</a>` : ""}`;
  const nav = renderNav();
  return htmlTemplate({ title, content, nav, footer: renderFooter() });
}

export function createLatestPostsMarkdown(posts: PostInfo[]): string {
  let postsContent = "";
  for (const post of posts) {
    const [year, month, day] = post.postDate.split("-");
    postsContent += createHtmlPostFromMarkdown(
      post.title,
      post.content,
      year,
      month,
      day,
    );
  }
  return postsContent;
}

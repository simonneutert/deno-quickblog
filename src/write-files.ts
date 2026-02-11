import { renderToString } from "preact-render-to-string";
import { formatDateString } from "./helpers.ts";
import {
  type ExtractedMarkdownWithFrontMatter,
  findMarkdownFiles,
  postList,
  readContentAndFrontMatter,
} from "./ingest-files.ts";
import {
  createHtmlPageFromMarkdown,
  createHtmlPostFromMarkdownToHTML,
  renderFooter,
  renderNav,
} from "./render-markdown.ts";
import {
  includeLatestPostsPartial,
  includePostListPartial,
} from "./content-modifier.ts";
import { extractToml } from "@std/front-matter";
import { extractTitle } from "./front-matter.ts";
import type { PostInfo } from "./post-info.ts";
import { htmlTemplate } from "./html-template.ts";

export function createPosts() {
  const postsList = postList(); // for navigation links
  const posts: PostInfo[] = [];
  const postFiles = findMarkdownFiles("posts");
  // posts must be in the format YYYY-MM-DD-title.md to be properly parsed,
  // and the URL will be generated based on that
  for (const filePath of postFiles) {
    const fileName = filePath.split("/").pop()!;
    const [year, month, day, ...slugParts] = fileName.split("-");
    const slug = slugParts.join("-").replace(".md", "");
    const url = `/posts/${year}/${month}/${day}/${slug}/`;
    const outputDir = `dist/posts/${year}/${month}/${day}/${slug}`;
    const { content, frontMatter } = readContentAndFrontMatter(
      `posts/${filePath}`,
    );
    const title: string = extractTitle(frontMatter);
    const postKey = [year, month, day].map(String).join("");
    const postDate = formatDateString(year, month, day);
    const currentIndex = postsList.findIndex(({ postKey: k }) => k === postKey);
    const nextUrl = postsList[currentIndex - 1]?.url ?? null;
    const prevUrl = postsList[currentIndex + 1]?.url ?? null;

    // write content to output file
    Deno.mkdirSync(outputDir, { recursive: true });
    Deno.writeTextFileSync(
      `${outputDir}/index.html`,
      createHtmlPostFromMarkdownToHTML(
        frontMatter?.noFrontMatter ? "" : title,
        content,
        year,
        month,
        day,
        nextUrl,
        prevUrl,
      ),
    );
    posts.push({ postKey, postDate, title, content, url, nextUrl, prevUrl });
  }
  return posts;
}

export function cleanUpDistDirectory() {
  try {
    for (const dirEntry of Deno.readDirSync("dist")) {
      Deno.removeSync(`dist/${dirEntry.name}`, { recursive: true });
    }
  } catch (_e) {
    // ignore error if dist/ doesn't exist
  }
}

export function copyDirRecursive(src: string, dest: string) {
  for (const dirEntry of Deno.readDirSync(src)) {
    try {
      const srcPath = `${src}/${dirEntry.name}`;
      const destPath = `${dest}/${dirEntry.name}`;

      if (dirEntry.isFile) {
        Deno.copyFileSync(srcPath, destPath);
      } else if (dirEntry.isDirectory) {
        Deno.mkdirSync(destPath, { recursive: true });
        copyDirRecursive(srcPath, destPath);
      }
    } catch (e) {
      console.error(`Error copying "${dirEntry.name}":`, e);
    }
  }
}

export async function writePageFromJSX(
  sourcePath: string,
  dirEntry: Deno.DirEntry,
  relativePath: string,
  posts: PostInfo[],
) {
  const pageName = dirEntry.name.replace(".jsx", "");
  const absolutePath = new URL(sourcePath, `file://${Deno.cwd()}/`).href;
  const module = await import(absolutePath);
  const PageComponent = module.default;
  const pageJsx = PageComponent({ posts });
  const pageHtml = renderToString(pageJsx);

  const outputDir = relativePath ? `dist/${relativePath}` : "dist";
  const nav = renderNav();
  Deno.mkdirSync(outputDir, { recursive: true });
  Deno.writeTextFileSync(
    `${outputDir}/${pageName}.html`,
    htmlTemplate({
      title: pageName,
      content: pageHtml,
      nav: nav,
      footer: renderFooter(),
    }),
  );
}

function writePageFromMarkdown(
  sourcePath: string,
  dirEntry: Deno.DirEntry,
  relativePath: string,
  posts: PostInfo[],
) {
  const pageName = dirEntry.name.replace(".md", "");
  const { content, frontMatter } = readContentAndFrontMatter(sourcePath);
  let fullContent = includePostListPartial(content, posts);
  fullContent = includeLatestPostsPartial(fullContent, posts);
  const title: string = extractTitle(frontMatter);

  const outputDir = relativePath ? `dist/${relativePath}` : "dist";
  Deno.mkdirSync(outputDir, { recursive: true });
  Deno.writeTextFileSync(
    `${outputDir}/${pageName}.html`,
    createHtmlPageFromMarkdown(title, fullContent),
  );
}

export async function createPages(posts: PostInfo[]) {
  await processPageDirectory("pages", "", posts);
}

export function writeIndex(posts: PostInfo[]) {
  let indexContent = Deno.readTextFileSync("index.md");
  // deno-lint-ignore no-unused-vars
  const { frontMatter, body, attrs } = extractToml(
    indexContent,
  ) as ExtractedMarkdownWithFrontMatter;
  const title: string = extractTitle(attrs);
  indexContent = body;
  indexContent = includePostListPartial(indexContent, posts);
  indexContent = includeLatestPostsPartial(indexContent, posts);
  Deno.writeTextFileSync(
    "dist/index.html",
    createHtmlPageFromMarkdown(title, indexContent),
  );
}

async function processPageDirectory(
  sourceDir: string,
  relativePath: string,
  posts: PostInfo[],
) {
  for (const dirEntry of Deno.readDirSync(sourceDir)) {
    const sourcePath = `${sourceDir}/${dirEntry.name}`;
    const newRelativePath = relativePath
      ? `${relativePath}/${dirEntry.name}`
      : dirEntry.name;

    // Skip posts directory
    if (dirEntry.name === "posts") continue;
    // Process directories and markdown/jsx files, ignore others
    if (dirEntry.isDirectory) {
      // Recursively process subdirectories
      await processPageDirectory(sourcePath, newRelativePath, posts);
    } else if (dirEntry.isFile && dirEntry.name.endsWith(".md")) {
      writePageFromMarkdown(sourcePath, dirEntry, relativePath, posts);
    } else if (dirEntry.isFile && dirEntry.name.endsWith(".jsx")) {
      await writePageFromJSX(sourcePath, dirEntry, relativePath, posts);
    }
  }
}

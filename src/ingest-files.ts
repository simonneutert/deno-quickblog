import { extractToml, extractYaml } from "@std/front-matter";
import { fallbackTitleNoFrontMatter } from "./front-matter.ts";
export interface PostIDUrl {
  postKey: string;
  url: string;
}

export type ExtractedMarkdownWithFrontMatter = {
  frontMatter?: unknown;
  body: string;
  attrs?: Record<string, unknown>;
};

export function checkReservedPostsName(
  entries: Deno.DirEntry[],
  directoryName: string,
  errorOut = true,
) {
  for (const entry of entries) {
    if (entry.name === "posts") {
      console.error(
        `Error: Reserved name "${entry.name}" found in "${directoryName}" directory. The "posts" name pattern is reserved for blog posts. Please rename this file/directory.`,
      );
      if (errorOut) {
        Deno.exit(1);
      } else {
        return { collision: entry.name };
      }
    }
  }
}

export function readContentAndFrontMatter(filePath: string) {
  try {
    const fileContent = Deno.readTextFileSync(filePath);
    if (fileContent.trim().startsWith("---")) {
      // deno-lint-ignore no-unused-vars
      const { frontMatter, body, attrs } = extractYaml(
        fileContent,
      ) as ExtractedMarkdownWithFrontMatter;
      return { content: body, frontMatter: attrs };
    } else if (fileContent.trim().startsWith("+++")) {
      // deno-lint-ignore no-unused-vars
      const { frontMatter, body, attrs } = extractToml(
        fileContent,
      ) as ExtractedMarkdownWithFrontMatter;
      return { content: body, frontMatter: attrs };
    } else {
      return fallbackTitleNoFrontMatter(fileContent);
    }
  } catch (e) {
    console.error(`Error reading file "${filePath}":`, e);
    return { content: "", frontMatter: undefined };
  }
}

export function checkNamingCollisionsPublicAndPages(
  publicDir: string = "public",
  pagesDir: string = "pages",
  errorOut = true,
) {
  try {
    const publicEntries = Array.from(Deno.readDirSync(publicDir));
    const pageEntries = Array.from(Deno.readDirSync(pagesDir));

    const publicNames = new Set(publicEntries.map((e) => e.name));
    const pageNames = new Set(pageEntries.map((e) => e.name));
    const allowedFiles = new Set([".gitkeep"]);
    allowedFiles.forEach((name) => {
      publicNames.delete(name);
      pageNames.delete(name);
    });
    // Check for naming collisions between public/ and pages/
    const collision = checkCollisionsBetweenPublicAndPages(
      publicNames,
      pageNames,
      errorOut,
    );
    if (collision) return collision;
    // Check for "posts" pattern in public/ and pages/ directories
    const reservedPublic = checkReservedPostsName(
      publicEntries,
      "public",
      errorOut,
    );
    if (reservedPublic) return reservedPublic;
    const reservedPages = checkReservedPostsName(
      pageEntries,
      "pages",
      errorOut,
    );
    if (reservedPages) return reservedPages;
  } catch (e) {
    // If directories don't exist, that's okay
    if (!(e instanceof Deno.errors.NotFound)) {
      throw e;
    }
  }
}

export function checkCollisionsBetweenPublicAndPages(
  publicNames: Set<string>,
  pageNames: Set<string>,
  errorOut = true,
) {
  for (const name of publicNames) {
    if (pageNames.has(name)) {
      console.error(
        `Error: Naming collision detected for "${name}" in "public" and "pages" directories. Please rename one of the files to avoid conflicts.`,
      );
      if (errorOut) {
        Deno.exit(1);
      } else {
        return { collision: name };
      }
    }
  }
}

export function findMarkdownFiles(
  dir: string,
  relativePath = "",
): Array<string> {
  const files: string[] = [];
  for (const dirEntry of Deno.readDirSync(dir)) {
    const fullPath = `${dir}/${dirEntry.name}`;
    const relPath = relativePath
      ? `${relativePath}/${dirEntry.name}`
      : dirEntry.name;

    if (dirEntry.isFile && dirEntry.name.endsWith(".md")) {
      files.push(relPath);
    } else if (dirEntry.isDirectory) {
      files.push(...findMarkdownFiles(fullPath, relPath));
    }
  }
  return files;
}

export function postList(): PostIDUrl[] {
  const postsList: PostIDUrl[] = [];
  const postFiles = findMarkdownFiles("posts");

  for (const filePath of postFiles) {
    const fileName = filePath.split("/").pop()!;
    const [year, month, day, ...slugParts] = fileName.split("-");
    const slug = slugParts.join("-").replace(".md", "");
    const url = `/posts/${year}/${month}/${day}/${slug}/`;
    const postKey = [year, month, day].map(String).join("");
    postsList.push({ postKey, url });
  }
  // Sort postsList by postKey in descending order (newest first)
  postsList.sort((a, b) => b.postKey.localeCompare(a.postKey));
  return postsList;
}

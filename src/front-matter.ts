export function fallbackTitleNoFrontMatter(fileContent: string) {
  // grab either first "# string ..." or first "## string ..." or first "### string ..." as title
  // if front matter is not provided or as a fallback first line trimmed to 80 characters, and
  // return content as is
  const lines = fileContent.split("\n");
  let title = "Untitled Post";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^#{1,3}\s+(.+)$/)) {
      // Extract text after # (1-3 hashes)
      title = trimmed.replace(/^#{1,3}\s+/, "");
      break;
    }
  }

  // Fallback to first line with text if no heading found
  if (title === "Untitled Post" && lines.length > 0) {
    // find first non-empty line and use it as title, trimmed to a specified number of characters
    // if the line is longer than the specified number of characters, it will be truncated and "..." will be added to the end
    const firstNonEmptyLine = lines.find((line) => line.trim().length > 0);
    if (firstNonEmptyLine) {
      const maxLength = Deno.env.get("DENO_QUICKBLOG_TITLE_MAX_LENGTH")
        ? parseInt(Deno.env.get("DENO_QUICKBLOG_TITLE_MAX_LENGTH")!)
        : 40;
      title = firstNonEmptyLine.trim().length > maxLength
        ? firstNonEmptyLine.trim().slice(0, maxLength) + "..."
        : firstNonEmptyLine.trim();
    }
  }

  return {
    content: fileContent,
    frontMatter: { title, noFrontMatter: true },
  };
}

export function extractTitle(
  frontMatter: Record<string, unknown> | undefined,
): string {
  const title: string = frontMatter && typeof frontMatter === "object" &&
      typeof (frontMatter as Record<string, unknown>).title === "string"
    ? (frontMatter as Record<string, unknown>).title as string
    : "Untitled Post";
  return title;
}

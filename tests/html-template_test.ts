import { assert } from "@std/assert";
import { htmlTemplate } from "../src/html-template.ts";

Deno.test("htmlTemplate generates correct HTML structure", () => {
  const title = "Test Title";
  const content = "<p>Test Content</p>";
  const nav = "<a href='/'>Home</a>";
  const footer = "<p>Test Footer</p>";

  const originalLang = Deno.env.get("DENO_QUICKBLOG_LANG");
  try {
    Deno.env.delete("DENO_QUICKBLOG_LANG");
    const result = htmlTemplate({ title, content, nav, footer });

    assert(result.includes("<!DOCTYPE html>"));
    assert(result.includes(`<title>${title}</title>`));
    assert(result.includes(`lang="en"`)); // Default language
    assert(result.includes(content));
    assert(result.includes(nav));
    assert(result.includes(footer));
  } finally {
    if (originalLang !== undefined) {
      Deno.env.set("DENO_QUICKBLOG_LANG", originalLang);
    }
  }
});

Deno.test("htmlTemplate generates correct HTML structure with environment variable", () => {
  const title = "Test Title";
  const content = "<p>Test Content</p>";
  const nav = "<a href='/'>Home</a>";
  const footer = "<p>Test Footer</p>";

  const originalLang = Deno.env.get("DENO_QUICKBLOG_LANG");
  try {
    Deno.env.set("DENO_QUICKBLOG_LANG", "fr");
    const result = htmlTemplate({ title, content, nav, footer });

    assert(result.includes("<!DOCTYPE html>"));
    assert(result.includes(`<title>${title}</title>`));
    assert(result.includes(`lang="fr"`)); // Language from environment variable
    assert(result.includes(content));
    assert(result.includes(nav));
    assert(result.includes(footer));
  } finally {
    if (originalLang !== undefined) {
      Deno.env.set("DENO_QUICKBLOG_LANG", originalLang);
    } else {
      Deno.env.delete("DENO_QUICKBLOG_LANG");
    }
  }
});

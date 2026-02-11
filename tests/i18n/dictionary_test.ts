import { assertEquals } from "@std/assert/equals";
import { dictionary } from "../../src/i18n/dictionary.ts";

Deno.test("dictionary languages", () => {
  const languages = Object.keys(dictionary);
  assertEquals(languages.length, 22);
  assertEquals(languages, [
    "cz",
    "de",
    "en",
    "es",
    "fi",
    "fr",
    "it",
    "ja",
    "lb",
    "lt",
    "nl",
    "no",
    "pl",
    "pt",
    "ro",
    "ru",
    "sk",
    "sv",
    "tr",
    "uk",
    "vi",
    "zh",
  ]);
});

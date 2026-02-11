import { assertEquals } from "@std/assert/equals";
import { checkLangSupport, i18n } from "../../src/i18n/i18n.ts";
import { dictionary } from "../../src/i18n/dictionary.ts";

Deno.test("i18n default arguments", () => {
  const translations = i18n();
  assertEquals(translations, {
    previous: dictionary["en"].previous,
    next: dictionary["en"].next,
  });
});

Deno.test("i18n can lord of the ring elvish if you pass it in", () => {
  const translations = i18n("elv", {
    "elv": {
      previous: "Pent Edregol",
      next: "Pent Tollen",
    },
  });
  assertEquals(translations, {
    previous: "Pent Edregol",
    next: "Pent Tollen",
  });
});

Deno.test("i18n falls back to English if language is not supported", () => {
  const translations = i18n("xx");
  assertEquals(translations, {
    previous: "Previous Post",
    next: "Next Post",
  });
});

Deno.test("i18n function returns correct translations based on environment variable", () => {
  Deno.env.set("DENO_QUICKBLOG_LANG", "es");
  const translations = i18n();
  assertEquals(translations, {
    previous: "Publicación Anterior",
    next: "Siguiente Publicación",
  });

  Deno.env.set("DENO_QUICKBLOG_LANG", "fr");
  const translationsFr = i18n();
  assertEquals(translationsFr, {
    previous: "Article Précédent",
    next: "Article Suivant",
  });
});

Deno.test("i18n function returns correct translations based on environment variable", () => {
  Deno.env.set("DENO_QUICKBLOG_LANG", "es");
  const translations = i18n("es");
  assertEquals(translations, {
    previous: "Publicación Anterior",
    next: "Siguiente Publicación",
  });

  Deno.env.set("DENO_QUICKBLOG_LANG", "fr");
  const translationsFr = i18n("fr");
  assertEquals(translationsFr, {
    previous: "Article Précédent",
    next: "Article Suivant",
  });

  Deno.env.set("DENO_QUICKBLOG_LANG", "de");
  const translationsDe = i18n("de");
  assertEquals(translationsDe, {
    previous: "Vorheriger Beitrag",
    next: "Nächster Beitrag",
  });
});

Deno.test("checkLangSupport returns 'en' and logs warning for unsupported language", () => {
  const originalConsoleWarn = console.warn;
  let warningMessage = "";
  console.warn = (message: string) => {
    warningMessage = message;
  };

  const result = checkLangSupport("xx");
  assertEquals(result, "en");
  assertEquals(
    warningMessage,
    `Warning: Language "xx" is not officially supported. Defaulting to English for navigation links. Supported languages are: ${
      Object.keys(dictionary).join(", ")
    }.`,
  );

  console.warn = originalConsoleWarn; // Restore original console.warn
});

Deno.test("checkLangSupport returns the same language if it is supported", () => {
  const result = checkLangSupport("es");
  assertEquals(result, "es");
});

Deno.test("checkLangSupport returns 'en' if environment variable is set to unsupported language", () => {
  const originalConsoleWarn = console.warn;
  let warningMessage = "";
  console.warn = (message: string) => {
    warningMessage = message;
  };

  Deno.env.set("DENO_QUICKBLOG_LANG", "xx");
  const result = checkLangSupport();
  assertEquals(result, "en");
  assertEquals(
    warningMessage,
    `Warning: Language "xx" is not officially supported. Defaulting to English for navigation links. Supported languages are: ${
      Object.keys(dictionary).join(", ")
    }.`,
  );

  console.warn = originalConsoleWarn; // Restore original console.warn
});

Deno.test("checkLangSupport default arguments", () => {
  const result = checkLangSupport();
  assertEquals(result, "en");
});

import { dictionary } from "../i18n/dictionary.ts";

export function i18n(
  lang: string = Deno.env.get("DENO_QUICKBLOG_LANG") ?? "en",
  dict: Record<string, { previous: string; next: string }> = dictionary,
): { previous: string; next: string } {
  const translated = {
    previous: dict[lang]?.previous ?? dict["en"].previous,
    next: dict[lang]?.next ?? dict["en"].next,
  };

  return translated;
}

export function checkLangSupport(
  lang: string = Deno.env.get("DENO_QUICKBLOG_LANG") ?? "en",
): string {
  const supportedLangs = Object.keys(dictionary);
  if (!supportedLangs.includes(lang)) {
    console.warn(
      `Warning: Language "${lang}" is not officially supported. Defaulting to English for navigation links. Supported languages are: ${
        supportedLangs.join(", ")
      }.`,
    );
    return "en";
  }
  return lang;
}

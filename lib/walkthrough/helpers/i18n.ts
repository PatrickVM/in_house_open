export type SupportedLanguage = "en" | "es" | "pt";

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

export interface TranslationObject {
  en: string;
  es: string;
  pt: string;
}

export function getTranslation(
  content: string | TranslationObject,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (typeof content === "string") {
    return content;
  }

  return content[language] || content[DEFAULT_LANGUAGE] || content.en;
}

export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.split("-")[0].toLowerCase();

  if (browserLang === "es" || browserLang === "pt") {
    return browserLang as SupportedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const stored = localStorage.getItem("inhouse_language");
    if (stored && ["en", "es", "pt"].includes(stored)) {
      return stored as SupportedLanguage;
    }
  } catch (error) {
    console.error("Error reading language from localStorage:", error);
  }

  return detectBrowserLanguage();
}

export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("inhouse_language", language);
  } catch (error) {
    console.error("Error saving language to localStorage:", error);
  }
}

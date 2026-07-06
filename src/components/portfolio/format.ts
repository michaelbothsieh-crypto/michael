import type { Locale } from "@/lib/projects";

export function localeTag(locale: Locale) {
  return locale === "zh" ? "zh-TW" : "en-US";
}

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function isSvg(path: string) {
  return path.endsWith(".svg");
}

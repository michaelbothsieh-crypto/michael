import type { Locale } from "@/lib/projects";

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

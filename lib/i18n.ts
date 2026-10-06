// Kept in their own module so client components can format without bundling the dictionaries
export { fill, formatDate, formatNumber } from "./format";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { i18n } = require("@calcom/config/next-i18next.config");

// Workaround for using router.locales from old router
export const locales = i18n.locales as string[];

export const localeOptions = locales.map((locale) => ({
  value: locale,
  label: new Intl.DisplayNames(locale, { type: "language" }).of(locale) || "",
}));

export const defaultLocaleOption = localeOptions.find(
  (locale) => locale.value === i18n.defaultLocale
) as (typeof localeOptions)[number];

export function getTextDirection(locale: string): "ltr" | "rtl" {
  try {
    const localeObj = new Intl.Locale(locale);
    const direction = (localeObj as Intl.Locale & { textInfo?: { direction?: string } }).textInfo?.direction;
    if (direction === "rtl" || direction === "ltr") {
      return direction;
    }

    // fallback
    const rtlLocales = ["ar", "he"];
    return rtlLocales.some((lang) => locale.toLowerCase().startsWith(lang)) ? "rtl" : "ltr";
  } catch (error) {
    console.error(`Error determining text direction for locale ${locale}:`, error);
    return "ltr";
  }
}

export function isLocaleRightToLeft(locale: string): boolean {
  return getTextDirection(locale) === "rtl";
}

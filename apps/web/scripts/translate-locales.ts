import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const TEMPLATE_LANGUAGE = "en";
const SPECIFIC_LOCALES = process.argv.slice(2) || [];
const LOCALES_PATH = join(__dirname, "../public/static/locales");

const ALL_LOCALES = readdirSync(LOCALES_PATH);

const templateJsonPath = join(LOCALES_PATH, `${TEMPLATE_LANGUAGE}/common.json`);
const templateJson = JSON.parse(readFileSync(templateJsonPath, "utf-8"));

const missingTranslationLocales: string[] = [];
// If locales are not specified, then check all folders under `public/static/locales`
(SPECIFIC_LOCALES.length ? SPECIFIC_LOCALES : ALL_LOCALES).forEach((locale: string) => {
  if (locale === TEMPLATE_LANGUAGE) return;
  if (!ALL_LOCALES.includes(locale)) {
    missingTranslationLocales.push(locale);
    console.log(`
    ❌ ${locale} is not found in ${LOCALES_PATH}!
    If you want to create a new locale, Please create common.json under ${join(LOCALES_PATH, locale)}.
    `);
    return;
  }

  const localeJsonPath = join(LOCALES_PATH, `${locale}/common.json`);
  const localeJson = JSON.parse(readFileSync(localeJsonPath, "utf8"));

  if (Object.keys(templateJson).length === Object.keys(localeJson).length) return;

  missingTranslationLocales.push(locale);
  Object.keys(templateJson).forEach((key) => {
    if (key in localeJson) return;

    localeJson[key] = templateJson[key];
  });

  writeFileSync(localeJsonPath, JSON.stringify(localeJson, null, 2));
});

if (missingTranslationLocales.length) {
  console.log("🌍 The following locales need to be translated: ");
  console.log(`  ${missingTranslationLocales.join(", ")}`);
} else {
  console.log("💯 All the locales are completely translated!");
}

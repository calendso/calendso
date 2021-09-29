/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  i18n: {
    localeDetection: false,
    defaultLocale: "en",
    locales: ["en", "fr", "it", "ru", "es", "de", "pt", "ro"],
  },
  localePath: path.resolve("./public/static/locales"),
};

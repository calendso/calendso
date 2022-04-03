const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "snippet",
      fileName: (format) => `snippet.${format}.js`,
    },
  },
});

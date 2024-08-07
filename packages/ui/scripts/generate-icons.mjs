import { $ } from "execa";

// 82 icons
const iconList = [
  "x",
  "circle-alert",
  "globe",
  "chart-bar",
  "paintbrush",
  "users",
  "credit-card",
  "lock",
  "book-open",
  "external-link",
  "mail",
  "file",
  "shield",
  "flag",
  "refresh-ccw",
  "eye-off",
  "triangle-alert",
  "map-pin",
  "clock",
  "info",
  "pencil",
  "copy",
  "loader",
  "corner-down-right",
  "check",
  "user",
  "arrow-right",
  "clipboard",
  "asterisk",
  "star",
  "calendar",
  "chevron-left",
  "badge-check",
  "chevron-right",
  "arrow-left",
  "search",
  "plus",
  "mail-open",
  "user-plus",
  "shield-check",
  "settings",
  "trash",
  "arrow-up",
  "arrow-down",
  "file-text",
  "shuffle",
  "circle-check",
  "circle-check-big",
  "download",
  "sunrise",
  "sunset",
  "grid-3x3",
  "columns-3",
  "calendar-x-2",
  "link",
  "filter",
  "video",
  "phone",
  "book-user",
  "zap",
  "rotate-cw",
  "lock-open",
  "terminal",
  "folder",
  "sparkles",
  "building",
  "chart-line",
  "bell",
  "chevron-up",
  "chevron-down",
  "circle-help",
  "smartphone",
  "sun",
  "layers",
  "corner-down-left",
  "command",
  "moon",
  "circle-x",
  "dot",
  "trash-2",
  "circle",
  "eye",
];

async function main() {
  for (const item of iconList) {
    try {
      await $`npx --yes @sly-cli/sly add lucide-icons ${item} --yes`;
    } catch (err) {
      console.error(err?.stderr);
    }
  }
}

main();

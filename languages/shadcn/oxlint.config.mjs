// Load every rule from anti-slop's packaged shadcn plugin, including future rules.
import { plugin } from "@shadcn/lint";

export default {
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    ".stackforge/**",
    "tools/oxlint/shadcn-lint/**",
  ],
  jsPlugins: ["@shadcn/lint"],
  rules: Object.fromEntries(
    Object.keys(plugin.rules).map((rule) => [`shadcn/${rule}`, "error"]),
  ),
};

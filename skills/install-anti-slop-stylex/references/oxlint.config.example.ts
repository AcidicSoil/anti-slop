// Merge this into the consumer's existing Oxlint config; do not replace other plugins or rules.
// Stackforge vendors the custom plugin at tools/eslint/anti-slop-stylex/.
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    "@stylexjs/eslint-plugin",
    { name: "anti-slop-stylex", specifier: "./tools/eslint/anti-slop-stylex/index.mjs" },
  ],
  rules: {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "anti-slop-stylex/prefer-design-tokens": ["error", {
      // Replace with the consumer's approved design-token module(s).
      tokenModules: ["@/styles/tokens.stylex"],
      // Match the canonical CSS and Tailwind @theme inline aliases.
      cssVariablePrefix: "--app-",
    }],
  },
});

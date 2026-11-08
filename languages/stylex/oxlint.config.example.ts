// Merge these StyleX rules into the consumer's existing Oxlint config.
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: ["@stylexjs/eslint-plugin", "eslint-plugin-stylex-design-system"],
  rules: {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "stylex-design-system/no-component-restyle": ["error", {
      componentImports: ["@/components/ui"],
      allow: ["layout"],
    }],
    "stylex-design-system/require-color-tokens": ["error", {
      tokenModules: ["@/styles/tokens.stylex"],
    }],
    "stylex-design-system/require-scale-tokens": ["error", {
      tokenModules: ["@/styles/tokens.stylex"],
    }],
    "stylex-design-system/no-inline-styles": "error",
    "stylex-design-system/require-analyzable-styles": ["error", {
      componentImports: ["@/components/ui"],
    }],
  },
});

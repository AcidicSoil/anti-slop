// Use ESLint only when framework templates require it.
// Merge with the consumer's existing JSX/TypeScript parser configuration.
import stylex from "@stylexjs/eslint-plugin";
import designSystem from "eslint-plugin-stylex-design-system";

export const stylexLint = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: { "@stylexjs": stylex, "stylex-ds": designSystem },
  rules: {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "stylex-ds/no-component-restyle": ["error", {
      componentImports: ["@/components/ui"],
      allow: ["layout"],
    }],
    "stylex-ds/require-color-tokens": ["error", {
      tokenModules: ["@/styles/tokens.stylex"],
    }],
    "stylex-ds/require-scale-tokens": ["error", {
      tokenModules: ["@/styles/tokens.stylex"],
    }],
    "stylex-ds/no-inline-styles": "error",
    "stylex-ds/require-analyzable-styles": ["error", {
      componentImports: ["@/components/ui"],
    }],
  },
};

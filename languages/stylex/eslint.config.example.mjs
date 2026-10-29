// Merge this object into your existing ESLint flat config, or reuse its rules.
// ESLint must use the project's existing JSX/TypeScript parser and file globs.
// Keep shadcn in your existing Oxlint/ESLint setup when Tailwind is in use.
import stylex from "@stylexjs/eslint-plugin";
import antiSlopStylex from "./tools/eslint/anti-slop-stylex/index.mjs";

export const stylexLint = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: { "@stylexjs": stylex, "anti-slop-stylex": antiSlopStylex },
  rules: {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "anti-slop-stylex/prefer-design-tokens": ["error", {
      // Replace with the actual theme module(s); do not accept arbitrary imports.
      tokenModules: ["@/styles/tokens.stylex"],
      // Use the same namespace in canonical CSS and Tailwind @theme aliases.
      cssVariablePrefix: "--app-",
    }],
  },
};

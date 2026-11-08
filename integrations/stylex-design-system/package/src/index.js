import stylex from "@stylexjs/eslint-plugin";
import { noComponentRestyle } from "./rules/no-component-restyle.js";
import { noInlineStyles } from "./rules/no-inline-styles.js";
import { requireAnalyzableStyles } from "./rules/require-analyzable-styles.js";
import { requireColorTokens, requireScaleTokens } from "./rules/require-tokens.js";

const rules = {
  "no-component-restyle": noComponentRestyle,
  "require-color-tokens": requireColorTokens,
  "require-scale-tokens": requireScaleTokens,
  "no-inline-styles": noInlineStyles,
  "require-analyzable-styles": requireAnalyzableStyles,
};

const plugin = {
  meta: { name: "eslint-plugin-stylex-design-system", version: "0.1.0" },
  rules,
};

plugin.configs = {
  recommended: {
    plugins: { "@stylexjs": stylex, "stylex-ds": plugin },
    rules: {
      "@stylexjs/valid-styles": "error",
      "stylex-ds/no-component-restyle": [
        "error",
        { allow: ["layout"], componentImports: ["@/components/ui/*"] },
      ],
      "stylex-ds/require-color-tokens": "error",
      "stylex-ds/require-scale-tokens": "error",
      "stylex-ds/no-inline-styles": "error",
      "stylex-ds/require-analyzable-styles": ["error", { componentImports: ["@/components/ui/*"] }],
    },
  },
};
export default plugin;

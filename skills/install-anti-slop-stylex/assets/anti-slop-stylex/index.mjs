import preferDesignTokens from "./rules/prefer-design-tokens.mjs";

export default {
  meta: { name: "anti-slop-stylex" },
  rules: { "prefer-design-tokens": preferDesignTokens },
};

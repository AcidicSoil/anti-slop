import { recommended } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "oxlint";

import baseConfig from "./oxlint.anti-slop.config.ts";

// Run the official type-aware diagnostics with the existing Oxlint rules
// in one process. The upstream preset owns all effecttsgo/* rules.
export default defineConfig({
  ...baseConfig,
  extends: [recommended],
  jsPlugins: [
    ...(baseConfig.jsPlugins ?? []),
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts",
    },
  ],
  rules: {
    ...baseConfig.rules,
    "anti-slop-effect/no-manual-effect-error-tag": "error",
    "anti-slop-effect/no-manual-tag-comparison": "error",
    "anti-slop-effect/no-manual-tagged-construction": "error",
    "anti-slop-effect/no-service-constructor-imports": "error",
    "anti-slop-effect/prefer-effect-match": "error",
  },
});

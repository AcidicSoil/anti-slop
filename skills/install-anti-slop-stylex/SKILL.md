---
name: install-anti-slop-stylex
description: Install authoritative StyleX design-system enforcement and official StyleX lint through the existing anti-slop setup.
---

# Install anti-slop StyleX checks

1. Inspect repository instructions, Git status, existing StyleX, token modules, Oxlint, Stylelint, shadcn, and CI.
2. Preview `stackforge setup apply anti-slop/stylex --dry-run`. Apply only after inspecting conflicts. Keep other tooling and project configuration.
3. Install dependencies with the project's package manager. The setup stages `eslint-plugin-stylex-design-system` at `tools/eslint/stylex-design-system/` and declares it as a file dependency alongside `@stylexjs/eslint-plugin`.
4. Merge `references/oxlint.config.example.ts` into the existing Oxlint config. Configure real `componentImports` and `tokenModules`. Enable all five custom and four official StyleX checks. Do not register the deleted `prefer-design-tokens` rule.
5. Verify valid imported token references pass; raw colors, `var(--...)` strings, arbitrary scale values, inline styles, invalid properties, and protected component overrides fail. Test the actual consuming project, not just its configuration file.
6. If Vue or Svelte template lint is required, configure ESLint and the framework parser for those templates. Keep Oxlint for JS/TS, and prevent overlapping rule execution.
7. Keep shadcn lint for Tailwind and Stylelint for authored CSS. Preserve the compiler, themes, and application styling. Wire the proven lint command into CI.

Canonical instructions: `languages/stylex/README.md`.
Distributed package: `integrations/stylex-design-system/package/`.

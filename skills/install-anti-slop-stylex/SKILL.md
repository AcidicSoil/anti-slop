---
name: install-anti-slop-stylex
description: Add StyleX validation to Oxlint and enforce shared design tokens without replacing Stylelint or shadcn lint.
---

# Install anti-slop StyleX rules

1. Inspect project instructions, Git status, StyleX compiler, Oxlint configuration, existing ESLint usage, Tailwind/shadcn, Stylelint, design tokens, and CI scripts.
2. Sync the existing anti-slop Stackforge source and dry-run `stackforge setup apply anti-slop/stylex --dry-run`. Inspect conflicts and apply only after preserving existing files and dependencies. Keep consumer-managed Oxlint versions and existing plugins intact.
3. Merge `references/oxlint.config.example.ts` into the project's existing Oxlint config, appending `@stylexjs/eslint-plugin` and `anti-slop-stylex` to `jsPlugins` and merging their rules. Do not overwrite the config or create a second one. Retain the vendored plugin at `tools/eslint/anti-slop-stylex/` for existing consumers.
4. Inspect canonical token CSS and Tailwind v4 `@theme inline` aliases; configure approved StyleX token imports and their CSS variable prefix. Verify actual theme variables resolve to the same CSS values.
5. Run Oxlint on a TSX/JSX fixture that violates both a native StyleX rule and `anti-slop-stylex/prefer-design-tokens`; require both diagnostics and a clean valid-token fixture. If a verified Oxlint compatibility failure prevents either rule, retain Oxlint for general JS/TS and merge `references/eslint.config.example.mjs` into the existing ESLint config for StyleX only. Do not enable overlapping StyleX passes.
6. Retain `shadcn/no-inline-styles` for Tailwind JSX. Prefer `{...stylex.props(...)}` in mixed JSX. Confirm a genuine inline style is still rejected; never globally disable shadcn's rule for StyleX.
7. Audit and fix existing lint and token violations incrementally. Preserve generated CSS, responsive behavior, themes, variants and focus states. Do not automatically migrate Tailwind to StyleX or replace compiler tooling.
8. Wire the verified StyleX lint owner, Stylelint CSS, shadcn and existing general lint commands into CI using the project's package manager. Run targeted tests and inspect rendered output.

Canonical guidance: `languages/stylex/README.md`; vendored rule entry point: `assets/anti-slop-stylex/index.mjs`. Stackforge stages the rule and StyleX plugin dependency but does not rewrite lint config or install any styling runtime.

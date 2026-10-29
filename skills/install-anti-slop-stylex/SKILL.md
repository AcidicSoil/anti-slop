---
name: install-anti-slop-stylex
description: Add StyleX ESLint and shared-token checks without replacing Stylelint or shadcn lint.
---

# Install anti-slop StyleX rules

1. Inspect project instructions, Git status, StyleX compiler, ESLint and Oxlint configuration, Tailwind/shadcn, Stylelint, design tokens, and existing CI scripts.
2. Sync the existing anti-slop Stackforge source and dry-run `stackforge setup apply anti-slop/stylex --dry-run`. Inspect conflicts and apply only after preserving existing files and dependencies.
3. Merge `references/eslint.config.example.mjs` into the project's existing ESLint flat config; do not overwrite or create a second ESLint configuration. Use the project's existing TSX parser and project file globs. Keep Oxlint for general JS/TS checks; StyleX native rules require ESLint.
4. Inspect the canonical token CSS and Tailwind v4 `@theme inline` aliases, then configure approved StyleX token modules and their CSS variable prefix. Verify imported theme variables resolve to the same CSS values.
5. Retain `shadcn/no-inline-styles` for Tailwind JSX. Prefer `{...stylex.props(...)}` in mixed JSX. Check a genuine inline style still reports; never globally disable shadcn's rule for StyleX.
6. Audit and fix existing lint and token violations incrementally. Preserve generated CSS, responsive behavior, themes, variants and focus states. Do not automatically migrate Tailwind to StyleX or replace existing compiler tooling.
7. Wire ESLint StyleX, Stylelint CSS, shadcn, and existing general lint commands into CI using the project's package manager. Run targeted tests and inspect rendered output.

Canonical guidance: `languages/stylex/README.md`; vendored rule entry point: `assets/anti-slop-stylex/index.mjs`. Stackforge stages the rule and StyleX plugin dependency but does not rewrite ESLint config or install any styling runtime.

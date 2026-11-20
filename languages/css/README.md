# CSS anti-slop rules

CSS rules use **Stylelint**, not Oxlint. The canonical implementation is `languages/css/index.mjs` and its `rules/` directory. This CSS-specific plugin has no effect on non-CSS projects.

## Install

Install `stylelint` and `stylelint-config-standard` with the consuming project's package manager, keeping existing configurations. Use the `install-anti-slop-css` skill to vendor the plugin under `tools/stylelint/anti-slop-css/`. The supplied `stylelint.config.mjs` is the **strict Tailwind v4 preset**: it permits only `src/styles/globals.css` and `src/styles/tokens.css` in the project and rejects CSS Modules and every other stylesheet. Adjust its two approved paths only if the project explicitly adopts a different layout. A project with a different CSS architecture must explicitly customize ownership paths before enabling this strict preset.

Both `anti-slop/css` and `anti-slop/css-tailwind` install the full canonical
Stylelint configuration, all three anti-slop CSS rules, and their native
Stylelint policies. Each installs an independent lint script and Mise task,
links the lint script into the project's existing aggregate lint, and verifies
it. Choose **one** setup per project to avoid duplicate checks. The default
ownership policy permits only `src/styles/globals.css` and
`src/styles/tokens.css`; adapt it explicitly for a different CSS architecture
before applying the strict preset.

The strict [Stylelint configuration](stylelint.config.mjs) also proposes the native `property-disallowed-list` and `declaration-property-value-disallowed-list` policies for writing-direction-independent properties and avoiding `transition: all`. These checks must be reviewed for the target project's CSS patterns before merging, and never replace the three architecture rules below.

## Complementary agent guidance

Use installed `~/.agents/skills/good-css/SKILL.md` when authoring or reviewing CSS (or Tailwind/StyleX styles). Use `~/.agents/skills/better-typography/SKILL.md` when modifying typography, forms or reading content. Read only task-applicable references and keep the existing styling system, reviewed tokens and browser support intact. These are optional authoring/review skills, not Stylelint plugins and not substitutes for the CSS architecture rules below. `tailwind-to-stylex` is a separate explicitly approved migration workflow, not a prerequisite of anti-slop CSS installation.

## Rules

| Rule | Configuration | Diagnostic |
| --- | --- | --- |
| `anti-slop-css/max-stylesheet-size` | Positive line limit and optional `warningAt`; example: `[500, { warningAt: 300 }]` | Warns over 300 and errors over 500, respecting configurable thresholds. |
| `anti-slop-css/require-style-ownership` | `sourceRoots`, `ownerDirectories`, `scopedSuffixes`, `allowedGlobalDirectories`, `allowedGlobalFiles` | Reports unscoped feature/component CSS and unknown global CSS under managed source roots. |
| `anti-slop-css/no-cross-feature-styling` | `featureRoot`, optional `allowGlobalSelectors` (default `false`) | Reports cross-feature relative `@import`, `@value`, CSS Modules `composes ... from`, and `:global` selectors inside feature CSS. |

Directories are **project-root relative**. The strict preset uses `sourceRoots: ["."]` to cover every project-owned CSS file passed to Stylelint, with an exact allowlist and no scoped suffixes or permitted CSS directories. Other consumers can use different ownership options explicitly. StyleX/CSS-in-JS files are outside these CSS-only rules.

**Limits:** Static CSS files do not prove which component owns a selector. This plugin checks directory ownership, scoping conventions, and declared stylesheet dependencies. It does not claim to detect every cross-feature selector or automatically rewrite CSS without altering its cascade.

## Fix existing violations

1. Run the Stylelint command and **save the failing file/diagnostic inventory**. Start with the most frequently changed or most oversized files. The sample hard limit is 500 lines and the early warning threshold is 300.
2. Identify the real owning component/feature for each group of selectors. Check source imports and runtime usage; do not infer ownership from selector names alone.
3. For the strict Tailwind preset, move component styling, layout, variants and states into their owning components; move tokens to `tokens.css` and global foundations to `globals.css`. Remove CSS Modules rather than relocating them. Check cascade and media queries before deduplicating.
4. Update imports; remove the original selectors only after checking computed styles, responsive states, interactions, and screenshots. `stylelint --fix` may repair safe *syntax* violations, but **does not automatically split CSS or prove visual equivalence**.
5. Re-run affected checks and visual comparisons after each extraction. Add the source directories to the CI Stylelint step. Do not suppress existing violations indefinitely; record unresolved files and finish migration by priority.

Avoid arbitrary 500-line splits, duplicated copies, selector rewrites without visual verification, and blanket `stylelint-disable` comments. A large generated stylesheet that is not hand-maintained should be excluded through a narrow config ignore, not a global waiver.

## Agent rule

In Tailwind projects using the strict preset, keep styling in owning components and allow only the two approved CSS files. Before adding CSS, inspect current ownership and extract existing unrelated or duplicated styles instead of extending monolithic files. Audit existing CSS for oversized files, global leakage, duplicated declarations, and cross-feature references. Fix violations incrementally with cascade-preserving migrations, targeted lint checks, and rendered visual comparisons. No permanent baseline exemptions.

## Strict Tailwind preset boundaries

`globals.css` owns the Tailwind import and global element defaults, not component selectors or tokens. `tokens.css` owns `@theme` and CSS custom properties; only `:root` and `.dark` selectors are allowed. Stylelint’s native file-scoped rules enforce these boundaries. File paths are checked by `require-style-ownership` for each stylesheet Stylelint visits; the consuming lint command must include all project-owned CSS files, not just the two allowed files. Component reuse and visual fidelity still require review.

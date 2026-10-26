# CSS anti-slop rules

CSS rules use **Stylelint**, not Oxlint. The canonical implementation is `languages/css/index.mjs` and its `rules/` directory. This CSS-specific plugin has no effect on non-CSS projects.

## Install

Install `stylelint` and `stylelint-config-standard` with the consuming project's package manager, keeping existing configurations. Use the `install-anti-slop-css` skill to vendor the plugin under `tools/stylelint/anti-slop-css/`. Merge `stylelint.config.mjs` into the project's existing Stylelint config, correcting directory ownership paths and scoped suffixes for the actual project.

Run `pnpm exec stylelint "src/**/*.css"` (adjust glob/package manager for the project). For SCSS, use the project's existing compatible SCSS syntax and config rather than replacing it.

## Rules

| Rule | Configuration | Diagnostic |
| --- | --- | --- |
| `anti-slop-css/max-stylesheet-size` | Positive line limit and optional `warningAt`; example: `[500, { warningAt: 300 }]` | Warns over 300 and errors over 500, respecting configurable thresholds. |
| `anti-slop-css/require-style-ownership` | `sourceRoots`, `ownerDirectories`, `scopedSuffixes`, `allowedGlobalDirectories`, `allowedGlobalFiles` | Reports unscoped feature/component CSS and unknown global CSS under managed source roots. |
| `anti-slop-css/no-cross-feature-styling` | `featureRoot`, optional `allowGlobalSelectors` (default `false`) | Reports cross-feature relative `@import`, `@value`, CSS Modules `composes ... from`, and `:global` selectors inside feature CSS. |

Directories are **project-root relative**, not absolute. Files outside configured source roots are not checked for ownership. Shared CSS outside `featureRoot` can be imported without a cross-feature diagnostic. `:global` can be explicitly allowed in projects that need it. Local styles are recognized by suffix, so change `scopedSuffixes` for non-CSS-Modules projects. StyleX/CSS-in-JS files are outside these CSS-only rules.

**Limits:** Static CSS files do not prove which component owns a selector. This plugin checks directory ownership, scoping conventions, and declared stylesheet dependencies. It does not claim to detect every cross-feature selector or automatically rewrite CSS without altering its cascade.

## Fix existing violations

1. Run the Stylelint command and **save the failing file/diagnostic inventory**. Start with the most frequently changed or most oversized files. The sample hard limit is 500 lines and the early warning threshold is 300.
2. Identify the real owning component/feature for each group of selectors. Check source imports and runtime usage; do not infer ownership from selector names alone.
3. Extract one cohesive group into a local scoped stylesheet next to its owner. Keep shared tokens/resets in explicitly allowed global files. Deduplicate only after checking cascade and media queries.
4. Update imports; remove the original selectors only after checking computed styles, responsive states, interactions, and screenshots. `stylelint --fix` may repair safe *syntax* violations, but **does not automatically split CSS or prove visual equivalence**.
5. Re-run affected checks and visual comparisons after each extraction. Add the source directories to the CI Stylelint step. Do not suppress existing violations indefinitely; record unresolved files and finish migration by priority.

Avoid arbitrary 500-line splits, duplicated copies, selector rewrites without visual verification, and blanket `stylelint-disable` comments. A large generated stylesheet that is not hand-maintained should be excluded through a narrow config ignore, not a global waiver.

## Agent rule

Keep styles local to their owning components or features. Before adding CSS, inspect current ownership and extract existing unrelated or duplicated styles instead of extending monolithic files. Audit existing CSS for oversized files, global leakage, duplicated declarations, and cross-feature references. Fix violations incrementally with cascade-preserving migrations, targeted lint checks, and rendered visual comparisons. No permanent baseline exemptions.

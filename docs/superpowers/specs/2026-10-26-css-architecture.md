# CSS architecture anti-slop specification

## Problem and solution
Prevent feature styles from accumulating in monolithic, shared CSS files. Add a vendor-friendly Stylelint plugin with structural checks that native Stylelint does not provide. Preserve existing project lint configurations.

## User stories
1. As a frontend developer, I want oversized CSS reported so I can split it before it becomes unmaintainable.
2. As a component maintainer, I want CSS under configured feature/component paths to be locally scoped so selectors do not leak.
3. As a frontend developer, I want unowned global CSS files reported so global styles remain intentional.
4. As a feature owner, I want cross-feature stylesheet references and global selector escapes reported so features do not depend on each other's implementation.
5. As a maintainer of legacy CSS, I want a reproducible audit and step-by-step remediation instructions so I can migrate without visual regressions.
6. As a consumer of anti-slop, I want an installable, vendored rule pack and tests without replacing existing tooling.

## Contracts
- Canonical rules: `languages/css/rules/*.mjs`. Consumer plugin entry point: `languages/css/index.mjs`.
- `anti-slop-css/max-stylesheet-size`: primary positive integer error limit with optional `warningAt` in secondary options; warn before the hard cap (sample 300/500). Count source lines, ignoring terminal newline only.
- `anti-slop-css/require-style-ownership`: primary object with `sourceRoots`, `ownerDirectories`, `scopedSuffixes`, `allowedGlobalDirectories`, `allowedGlobalFiles`. Rules apply to files under source roots only. Local owner directories require a suffix, and global files must be allowlisted.
- `anti-slop-css/no-cross-feature-styling`: primary object with `featureRoot` and `allowGlobalSelectors` (default false). Reject relative CSS imports/composes/@value references across feature siblings and :global selectors inside feature stylesheets. Shared styles outside featureRoot remain permitted.
- Each rule emits Stylelint diagnostics. No source rewrites or attempts to infer arbitrary selectors' ownership.
- An install skill vendors files and tells consumers how to compose their existing Stylelint config.
- Reuse built-in Stylelint rules for specificity, duplicate selectors and nesting. Do not duplicate them.

## Out of scope
- Automatically splitting CSS while preserving the cascade.
- Inferring selector ownership across TSX or runtime components.
- Enforcing StyleX or CSS-in-JS runtime semantics.
- Replacing existing CSS/SCSS lint tooling.
- Changing CSS in downstream applications.

## Verification
- Stylelint API tests for valid/invalid CSS paths, imports, selectors, and line limits.
- Run relevant tests and existing repository check.
- Validate vendor asset synchronization and installation instructions.

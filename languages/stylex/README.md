# StyleX lint

The `anti-slop/stylex` Stackforge setup installs the standalone
`eslint-plugin-stylex-design-system` package and official `@stylexjs/eslint-plugin`
checks. The standalone plugin owns the five custom design-system rules.
Anti-slop stages and configures it; it has no separate StyleX rule implementation.

## Install

1. From the consumer project, inspect `stackforge setup apply anti-slop/stylex --dry-run`.
2. Apply the setup, then install dependencies using the project's package manager.
3. Merge [the Oxlint rules](oxlint.config.example.ts) into the existing configuration.
   Set `componentImports` and `tokenModules` to actual project import paths.
4. Run Oxlint on JS/TS and a test fixture that contains invalid and valid styles.
5. Include the verified Oxlint invocation in the project's existing lint/CI task.

Oxlint runs all nine rules, four official and five custom:

| Official StyleX | Design-system plugin |
| --- | --- |
| `valid-styles` | `no-component-restyle` |
| `valid-shorthands` | `require-color-tokens` |
| `no-conflicting-props` | `require-scale-tokens` |
| `no-lookahead-selectors` | `no-inline-styles` |
| | `require-analyzable-styles` |

Approved StyleX tokens are accepted; raw colors and `var(--...)` references are
rejected by `require-color-tokens`. Configure approved token modules; there is
no CSS-variable prefix exemption.

## Framework templates

Vue and Svelte template rules need ESLint with their framework parsers.
The [ESLint configuration](eslint.config.example.mjs) covers JS/TS. For
Vue/Svelte, use the corresponding ESLint template parser with the same custom
rules. Do not run duplicate StyleX lint passes against the same files.

## Boundaries

- `anti-slop/stylex` owns StyleX lint configuration and installation.
- `anti-slop/shadcn` owns Tailwind/shadcn-specific lint.
- `anti-slop/css` owns authored CSS/SCSS via Stylelint.
- The StyleX compiler remains responsible for generating CSS.
- Never disable `shadcn/no-inline-styles` for mixed Tailwind/StyleX projects.
- Do not migrate frameworks or styling systems as part of lint installation.

The [tests](tests/) cover the authoritative package, native rules,
StyleX properties, token enforcement, and mixed Tailwind JSX.

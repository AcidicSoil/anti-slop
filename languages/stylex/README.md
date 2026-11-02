# StyleX anti-slop rules

StyleX component styles are JavaScript/TypeScript, not native CSS. Run the official
`@stylexjs/eslint-plugin` rules and the local `anti-slop-stylex/prefer-design-tokens`
rule together in **Oxlint** using its ESLint-compatible JavaScript plugin support.
Keep Stylelint for handwritten CSS and SCSS; let the StyleX compiler generate atomic CSS.

## Installation

1. Install or retain compatible `oxlint` and `@stylexjs/eslint-plugin` versions through
   the consuming project's existing package manager. Do not replace its other lint plugins.
2. Stage `anti-slop/stylex` with Stackforge, or vendor `index.mjs` and `rules/`
   under `tools/eslint/anti-slop-stylex/`.
3. Merge [the Oxlint example](oxlint.config.example.ts) into the consumer's
   existing `oxlint.config.ts` (or equivalent Oxlint configuration). Set
   `tokenModules` to the actual approved module imports and `cssVariablePrefix`
   to the source CSS variable namespace. Do not copy the example paths blindly.
4. Run Oxlint against a TSX/JSX fixture with both an invalid StyleX property and a
   hardcoded color. Verify **both** `@stylexjs/valid-styles` and
   `anti-slop-stylex/prefer-design-tokens` report diagnostics. Check that a
   valid imported token and approved CSS variable pass.
5. Add that same Oxlint invocation to the existing CI lint command. Keep
   `shadcn/no-inline-styles` enabled when Tailwind v4 is also in use; prefer
   `{...stylex.props(...)}` for mixed JSX, never a blanket inline-style exemption.

## Fallback

If the installed Oxlint version cannot execute **both** StyleX plugins correctly,
keep Oxlint for general JS/TS and merge [the ESLint example](eslint.config.example.mjs)
into an existing ESLint flat config for StyleX rules only. Prove the incompatibility
with a real failing fixture before enabling the fallback; do not create two
competing StyleX lint passes by default.

## Rules and boundaries

- Official StyleX rules validate property names, shorthand usage, lookahead selectors,
  and conflicting props.
- `anti-slop-stylex/prefer-design-tokens` rejects hardcoded colors or unapproved
  token origins inside `stylex.create()`. It accepts imported approved tokens,
  configured CSS variables, and CSS keywords.
- `anti-slop/css` owns CSS stylesheet size, file ownership, and cross-feature imports.
  It does not parse StyleX objects.
- `anti-slop/shadcn` owns Tailwind v4 JSX rules when applicable.
- Do not alter the StyleX compiler or generated CSS as part of lint setup.

The [integration tests](tests/integration.test.mjs) validate ESLint fallback
semantics and [Oxlint tests](tests/oxlint.test.mjs) execute the primary host.

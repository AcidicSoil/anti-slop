# Enhanced shadcn/lint

The `anti-slop/shadcn` Stackforge setup distributes the **complete** `@shadcn/lint` plugin: six original upstream rules plus thirteen opt-in Good CSS policies. It is an extension of the original lint implementation, not a replacement with a second parser.

## Install using existing Stackforge source

```bash
stackforge setup source add https://github.com/AcidicSoil/anti-slop.git # only if not registered
stackforge setup sync anti-slop
stackforge setup apply anti-slop/shadcn --dry-run
stackforge setup apply anti-slop/shadcn
```

The setup stages the local package at `tools/oxlint/shadcn-lint/` and adds the package-manager-owned dev dependency `@shadcn/lint: file:tools/oxlint/shadcn-lint`. Its package is self-contained for distribution, with pinned source provenance in `integrations/shadcn-lint/UPSTREAM.md`. Stackforge detects conflicts with existing unmanaged public package versions or modified files instead of overwriting them.

## Companion styling skills (PPM-owned)

In frontend projects where these agent skills are installed, PPM routes style tasks to `~/.agents/skills/good-css/SKILL.md` and text/typography tasks to `~/.agents/skills/better-typography/SKILL.md` in the project's **current** styling system. They provide review and implementation guidance beyond the statically enforceable Good CSS checks. Agent instructions do not make additional CSS lint rules automatically enforceable. Review the specific skill's references and browser/version constraints before applying its recommendations.

`~/.agents/skills/tailwind-to-stylex/SKILL.md` is for **only an explicit, approved migration** from Tailwind to StyleX, not a dependency or automatic step of installing enhanced shadcn/lint. Preserve the original component's layout, states and themes, verify the StyleX compiler integration and compare rendered output. Do not remove Tailwind while other components still require it. For StyleX-only projects, `@shadcn/lint` may be inapplicable; retain the applicable CSS/design guidance and checks instead.

Skills are *not* included in the `anti-slop/shadcn` Stackforge package. Stackforge owns repeatable lint package distribution and does not install user-level agent skills or change their runtime discovery paths. PPM's [styling specialist routing](https://github.com/AcidicSoil/pinchtab-profile-manager/blob/main/.agents/skills/pinchtab-profile-manager-frontend/references/styling-skills.md) owns their selection and missing-skill behavior. Do not silently copy or overwrite third-party skills.

## Linter registration (PPM-owned)

Keep existing plugins, configuration, project aliases, parsers, design-system contracts and CI commands. **Stackforge does not rewrite Oxlint/ESLint config.** PPM integrates it into the existing UI linter after checking the project:

- Oxlint: append `"@shadcn/lint"` to existing `jsPlugins` and ignore `tools/oxlint/shadcn-lint/**` as vendored dependency input.
- ESLint: merge `import { plugin as shadcn } from "@shadcn/lint"` into the existing `plugins: { shadcn }` entry. Retain Vue/Svelte template parsers; Oxlint alone only reads their script blocks.
- Register in only the UI-owning linter if both are configured. Verify registration and source files linted before asserting coverage.
- **Enable no new rules automatically**. PPM reviews `DESIGN.md`, the actual Tailwind v4 theme and component contracts and retains existing rule severity. Once approved, start newly selected rules as warnings and ratchet down violations.

See the existing PPM `quality-tooling-bootstrap.md` and [upstream setup contract](https://github.com/shadcn-ui/lint/blob/main/SETUP.md). This plugin applies to Tailwind v4 UI projects, not Tailwind v3 or StyleX-only projects.

The thirteen additional opt-in rules are: `prefer-logical-utilities`, `prefer-focus-visible`, `prefer-motion-safe`, `no-transition-all`, `no-disabled-zoom`, `no-ease-in`, `no-long-transitions`, `no-selection-disable-on-content`, `prefer-bounded-textarea`, `prefer-flex-gap`, `prefer-motion-safe-scroll`, `prefer-shrinkable-truncate`, and `prefer-small-viewport-height`. Each is available under the `shadcn/` prefix.

Plain CSS belongs to the existing `anti-slop/css` Stylelint setup. The shared Stylelint example includes logical-property and transition-property checks; review these choices before enabling them in projects. No duplicate CSS parser is installed.

## Updating the vendored upstream implementation

1. Compare the prior upstream base, pristine incoming upstream and local enhanced implementation as documented in anti-slop's [vendored update guide](../../skills/install-anti-slop/references/update.md). Preserve all upstream fixes, the thirteen local rules, diagnostics and tests.
2. In a separate build checkout, run the original upstream test, type, build, ESLint/Oxlint, and corpus checks, then stage the **tested** output. Do not copy an untested built artifact or assume an upstream version matches the local patch.
3. Update the canonical `integrations/shadcn-lint/source/` tree, generated `integrations/shadcn-lint/package/dist/`, manifest version, and [provenance](../../integrations/shadcn-lint/UPSTREAM.md) together. Do not manually edit minified build output.
4. Test all 19 exported rules, Stackforge local-source compile, dry-run and an isolated installed consumer; run anti-slop checks.
5. Commit/publish anti-slop through its normal workflow and run `stackforge setup sync anti-slop`. Existing target project upgrades use Stackforge's provenance-aware apply, not a force overwrite.

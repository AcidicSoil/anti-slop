# Landmines integration

[Landmines](https://github.com/interfere-inc/landmines) complements anti-slop with testing and repository-structure checks. It runs as an upstream Oxlint plugin rather than a copy of its implementation.

The [recommended configuration](recommended.json) enables 19 rules: 16 upstream correctness and suspicious rules, plus the existing three structure rules (`colocated-tests`, `test-file-names`, `package-exports`). It is enabled in this repository and available as an optional addition to vendored anti-slop installations.

## Install through Stackforge

After registering the [anti-slop setup source](../../README.md#install-from-stackforge), refresh it and preview the dedicated optional setup:

```sh
stackforge setup sync anti-slop
stackforge setup apply anti-slop/landmines --target /path/to/project --dry-run
stackforge setup apply anti-slop/landmines --target /path/to/project
```

Stackforge adds the pinned dependency, installs this preset at `tools/oxlint/landmines-recommended.json`, installs a root `oxlint.landmines.config.json` extending it, links `lint:landmines` into the existing `lint` task, and verifies it. The project's other Oxlint rules remain unchanged. Use the manual `extends` integration below only when intentionally consolidating lint passes, after reviewing overlaps.

## Add to an existing project

Requires Node.js 22.18+ and Oxlint 1.81+.

1. Install the upstream package as an exact development dependency at a reviewed version. Keep the project's existing compatible Oxlint version. For pnpm:

   ```sh
   pnpm add -D -E @interfere/landmines@0.3.0
   ```

2. Copy [recommended.json](recommended.json) into the target repository, for example at `tools/oxlint/landmines-recommended.json`.

3. Merge this entry into the existing `.oxlintrc.json`, or merge the file's `jsPlugins` and `rules` into the existing Oxlint or Vite+ configuration:

   ```json
   {
     "extends": ["./tools/oxlint/landmines-recommended.json"]
   }
   ```

4. Preserve existing configuration and inspect overlapping diagnostics. Run Oxlint against a test with a retry, fixed sleep, and test double; confirm that the expected rules report them. Then run the target's own lint and test tasks.

## Policy overlap

- `landmines/no-test-doubles` includes module mocking already rejected by `anti-slop/no-module-mocking`. Decide which rule owns that overlap in test files, rather than accepting duplicate errors. Landmines also covers other implementation replacements; anti-slop's rule remains available for installations without Landmines.
- `landmines/no-comments` remains opt-in. When enabled, configure `allow: ["WARNING", "SAFETY"]` to preserve required safety justifications.
- `landmines/no-explicit-return-types` is an independent API-signature preference, not a universal anti-slop requirement. Enable it separately only when compatible with the project's contracts.

- `landmines/no-cold-start-in-test` and `landmines/no-cold-import-in-test` remain opt-in: CLI and installer integration tests intentionally exercise process startup and freshly installed modules.
- Other upstream restriction, pedantic and style rules require project-specific review; existing task, file-layout and formatting policies take precedence.

Version 0.3.0 additionally detects shared abort signals, Playwright fixed waits and network-idle waits, clock-deadline polling loops, and additional imported-object mutations.

## Migrating from 0.1.x

Upgrade the dependency and preset together. Version 0.2.0 removes the four category-specific plugin entrypoints; register the single `@interfere/landmines` plugin named `landmines` and rename existing rule keys to `landmines/<rule>`, preserving project-specific options.

The upstream [all preset](https://github.com/interfere-inc/landmines/blob/26d56ac130fb7c575ee86dfa9616888a6621f832/packages/landmines/configs/all.json) enables all 34 rules. Do not extend it alongside this curated preset without reviewing redundant enforcement. The local configuration belongs to anti-slop; the plugin implementation and releases belong to Interfere.

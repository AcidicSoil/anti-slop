# Landmines integration

[Landmines](https://github.com/interfere-inc/landmines) complements anti-slop with testing and repository-structure checks. It runs as an upstream Oxlint plugin rather than a copy of its implementation.

The [recommended configuration](recommended.json) enables eight rules: five testing rules (`no-test-doubles`, `strict-msw`, `no-fixed-sleep`, `no-unsignaled-poll`, `no-flake-masking`) and three structure rules (`colocated-tests`, `test-file-names`, `package-exports`). It is enabled in this repository and available as an optional addition to vendored anti-slop installations.

## Add to an existing project

Requires Node.js 22.18+ and Oxlint 1.81+.

1. Install the upstream package as an exact development dependency at a reviewed version. Keep the project's existing compatible Oxlint version. For pnpm:

   ```sh
   pnpm add -D -E @interfere/landmines@0.1.0
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

- `landmines-testing/no-test-doubles` includes module mocking already rejected by `anti-slop/no-module-mocking`. Decide which rule owns that overlap in test files, rather than accepting duplicate errors. Landmines also covers other implementation replacements; anti-slop's rule remains available for installations without Landmines.
- `landmines-style/no-comments` rejects `// SAFETY:` justifications required by `anti-slop/require-safety-comment-for-type-assertion`. It is intentionally excluded from this configuration.
- `landmines-types/no-explicit-return-types` is an independent API-signature preference, not a universal anti-slop requirement. Enable it separately only when compatible with the project's contracts.

The upstream [full preset](https://github.com/interfere-inc/landmines/blob/main/packages/landmines/configs/recommended.json) enables all ten rules. Do not extend both presets without checking for redundant enforcement. The local configuration belongs to anti-slop; the plugin implementation and releases belong to Interfere.

# Effect lint integration

For TypeScript repositories that **directly depend on Effect**, `anti-slop/effect` combines the repo's existing generic Oxlint rules, its five [Effect architecture rules](../../src/effect/index.ts), and the official [`@effect/tsgo` recommended diagnostics](https://github.com/Effect-TS/tsgo/blob/main/docs/README.md).

## Setup

Choose **one** JavaScript/TypeScript setup:

- `anti-slop/typescript`: generic anti-slop only.
- `anti-slop/effect`: all generic rules **plus** the custom Effect rules **plus** official type-aware Effect diagnostics, using one command.

```sh
stackforge setup sync anti-slop
stackforge setup recommend --target /path/to/effect-project
stackforge setup apply anti-slop/effect --target /path/to/effect-project --dry-run
stackforge setup apply anti-slop/effect --target /path/to/effect-project
```

Stackforge recommends this setup when project manifests declare both `effect` and `typescript` (including supported workspace packages), with a short "Effect + TypeScript" note beside the match. Recommendations are advisory; preview and explicitly approve installation as usual.

The Effect setup installs the same canonical `src/` plugin tree and generic rule config as the TypeScript setup. Its additional `oxlint.anti-slop.effect.config.ts` merges the generic configuration at the root and extends the official `recommended` preset, then registers `anti-slop-effect` at error severity. The active `lint:anti-slop` command runs the existing suppression preflight followed by `effect-tsgo oxlint` and is registered in the aggregate `lint` script and `mise run lint:effect`.

The official wrapper runs the Effect-aware Oxlint binaries **without rewriting** `node_modules` or enabling a second lint pass. It relies on the target project's own `tsconfig.json` and typed Effect imports. Do not run duplicate Effect LSP diagnostics in the editor when using Oxlint for that purpose.

### Compatibility

The setup currently pins `@effect/tsgo@0.67.4` to match the current anti-slop baseline: TypeScript `7.0.2`, Oxlint `1.90.0`, `@oxlint/plugins` `1.90.0`, and `oxlint-tsgolint` `7.0.2005`. The [upstream compatibility matrix](https://github.com/Effect-TS/tsgo/blob/main/README.md#supported-package-versions) controls future upgrades. Review dependency conflicts before applying to a repository using another TypeScript/Oxlint version; do not silently downgrade its existing toolchain.

For an established project using a customized Oxlint/Vite+ configuration, integrate `recommended` plus the five custom rules into its **existing** lint pass and select a compatible `@effect/tsgo` version instead of installing an additional competing configuration.

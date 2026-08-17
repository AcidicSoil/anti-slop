# anti-slop

Opinionated, language-native lint rules that reject low-evidence and low-signal implementation patterns.

Anti-slop is vendored into each repository instead of treated as a fixed runtime dependency. Each language uses its mature native analysis stack rather than a shared parser or compatibility layer.

## Supported languages

| Language | Implementation | Skill |
| --- | --- | --- |
| TypeScript / JavaScript | Oxlint plugin | `install-anti-slop` |
| Python | Pylint / Astroid checker | `install-anti-slop-python` |
| Rust | Clippy restriction profile | `install-anti-slop-rust` |
| Go | `go/analysis` multichecker | `install-anti-slop-go` |

Inspect the available installers:

```bash
npx skills add AcidicSoil/anti-slop --list
```

Install the language you want, for example:

```bash
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-python
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-rust
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-go
npx skills add AcidicSoil/anti-slop --skill install-anti-slop
```

The installer skill inspects the target repository, preserves its package manager and existing lint/type-check tooling, vendors only the language-specific anti-slop layer, and validates the result.

## Policy

The language implementations share policy, not parser code:

- preserve known type evidence instead of widening it away;
- validate uncertain data at boundaries;
- reject broad anonymous contracts when a named domain contract is available;
- require explicit justification around unsafe type escapes;
- prefer static operations over reflection or dynamic access;
- use the language's maintained built-in lints before creating custom rules.

## TypeScript / JavaScript

`src/` is the canonical Oxlint implementation. Copy it to a target repository such as `tools/oxlint/anti-slop/`, install current matching versions of `oxlint` and `@oxlint/plugins`, and register the copied entry point.

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
    "tools/oxlint/anti-slop/**",
  ],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
  ],
  rules: {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error"
  }
});
```

## Python

`languages/python/anti_slop.py` is a Pylint plugin with five initial rules:

- `no-any-parameter`
- `no-any-return`
- `no-unsafe-dictionary-type`
- `no-chained-cast`
- `require-safety-comment-for-cast`

The Python installer keeps Ruff and existing type checking in place and adds Pylint only for custom rules Ruff cannot load as third-party plugins.

## Rust

`languages/rust/anti-slop-clippy.toml` is the canonical restriction profile. It rejects unchecked unwrap/expect paths, panic placeholders, undocumented unsafe blocks, unsafe transmute patterns, and broad `as` conversions.

Rust deliberately starts with maintained Clippy rules. Dylint should be introduced only for a future policy Clippy cannot express.

## Go

`languages/go/` contains a real `golang.org/x/tools/go/analysis` multichecker. The initial analyzer rejects:

- `any` / `interface{}` parameters and returns;
- `map[string]any` / `map[string]interface{}` contracts;
- direct `reflect.*` calls.

The installer resolves the current `golang.org/x/tools` release in the target repository instead of pinning a stale toolchain dependency here.

## Development

```bash
pnpm install
pnpm check
```

Canonical sources are `src/` for TypeScript/JavaScript and `languages/<language>/` for additional languages. After changing a canonical implementation, run:

```bash
pnpm sync:skill-assets
```

CI checks that bundled skill assets remain identical to canonical sources.

## License

MIT

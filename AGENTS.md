# Repository guidance

- `src/` is the canonical TypeScript/JavaScript Oxlint implementation.
- `languages/<language>/` is canonical for each additional language implementation.
- Keep rules generic and suitable for reuse across repositories. Do not add application-specific names, paths, or exceptions.
- Use each language's native mature analysis framework before adding another parser or custom engine.
- TypeScript/JavaScript uses Oxlint ESTree rules.
- Python uses Pylint/Astroid for custom rules; keep Ruff for built-in rules rather than duplicating it.
- Go uses `golang.org/x/tools/go/analysis`.
- Rust uses Clippy first; add Dylint only for policies Clippy cannot express.
- Add focused tests or violation fixtures for semantic rule changes.
- Run `pnpm sync:skill-assets` after changing canonical implementations.
- Run `pnpm check` before committing TypeScript changes; validate each changed language implementation with its native toolchain when available.

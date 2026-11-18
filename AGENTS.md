# Repository guidance

- `src/` is the canonical TypeScript/JavaScript Oxlint implementation.
- `languages/<language>/` is canonical for additional language implementations, except StyleX's design-system rules, which are owned by `eslint-plugin-stylex-design-system` and distributed via `integrations/stylex-design-system/package/`.
- Keep rules generic and suitable for reuse across repositories. Do not add application-specific names, paths, or exceptions.
- Use each language's native mature analysis framework before adding another parser or custom engine.
- TypeScript/JavaScript uses Oxlint ESTree rules.
- Python uses Pylint/Astroid for custom rules; keep Ruff for built-in rules rather than duplicating it.
- Go uses `golang.org/x/tools/go/analysis`.
- Rust uses Clippy first; add Dylint only for policies Clippy cannot express.
- Add focused tests or violation fixtures for semantic rule changes.
- Run `pnpm sync:skill-assets` after changing canonical implementations.
- Run `pnpm check` before committing TypeScript changes; validate each changed language implementation with its native toolchain when available.

## CI enforcement — selected projects

Apply `~/.agents/skills/github-actions-self-hosted-project-setup/references/ci-enforcement.md` to this repository's engineering workflow. **After changes, run affected tests, lint, and type checks using existing native commands**, respecting stricter project-specific gates; report actual failures, avoid repeated passing checks and routine full-suite runs. This project's approved rollout targets **exhaustive offline Linux CI on pull requests and default-branch pushes**, targeted pre-push checks through the active hook, **Zoomies + official self-hosted** runner options where safely routable, and required GitHub status checks where available. Follow `~/.agents/skills/github-actions-self-hosted-project-setup/SKILL.md` for setup, permissions, and verification. Preserve global hooks; describe unconfigured gates as pending, not enforced.

# CSS Architecture Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline; no subagent dispatch without approval. Steps use checkbox syntax.

**Goal:** Add reusable CSS architecture rules with an actionable legacy migration path.
**Architecture:** Standalone Stylelint plugin in languages/css; existing Oxlint implementation unchanged. Configurable directory ownership; no filesystem inference of selector usage.
**Tech Stack:** JavaScript ESM, Stylelint, node:test, pnpm.
**Spec:** docs/superpowers/specs/2026-10-26-css-architecture.md

## Global constraints
- Maintain current TypeScript/JS/Python/Go/Rust behavior.
- Respect existing consumer Stylelint configs and CSS conventions.
- Never auto-edit consumer styles or silently exempt legacy violations.

## Review focus
- Windows-path normalization, paths outside configured source roots, shared imports, feature prefixes, CSS Modules composes, global selectors.

### Task 1: CSS rule pack
**Files:** languages/css/index.mjs, languages/css/rules/*.mjs, languages/css/tests/rules.test.mjs
**Interfaces:** Stylelint custom rules with primary options from spec.
- [ ] Write Stylelint API tests for allow/reject cases.
- [ ] Run tests and observe failure.
- [ ] Implement three Stylelint rules.
- [ ] Run tests and observe pass.
- [ ] Commit focused rules.

### Task 2: Distribution and remediation
**Files:** languages/css/README.md, languages/css/stylelint.config.mjs, skills/install-anti-slop-css/**, scripts/sync-skill-assets.mjs, README.md, package.json.
**Interfaces:** Bundled Stylelint plugin, vendored installer instructions, CI/test script.
- [ ] Add default example configuration and agent remediation workflow.
- [ ] Add installation skill and sync canonical plugin into its assets.
- [ ] Run affected tests and skill-asset check.
- [ ] Run repository final verification, inspect diff, commit, push and clean up branch/worktree state.

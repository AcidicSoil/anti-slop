# Anti-slop Remaining Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native implementation. Do not dispatch agents without explicit user approval. This is a planning draft; resolve the decision gate below before implementation. Track execution with checkbox steps.

**Goal:** Complete the valuable unimplemented Python and Rust anti-slop policies without duplicating the recently delivered P0 work or established native linters.

**Architecture:** Preserve Pylint/Astroid for custom Python diagnostics and Ruff for its built-in policies. Keep Go's separate type-aware `go/analysis` analyzers. Extend Rust's existing rustc/Clippy profiles rather than writing a Dylint plugin. Prefer narrow, provable diagnostics with no unsafe autofixes.

**Tech Stack:** Python + Astroid/Pylint/Ruff; Go + `go/analysis`/`analysistest`; Rust + cargo/rustc/Clippy; pnpm for asset synchronization.

**Spec:** `/mnt/c/Users/user/Downloads/anti-slop_todos_deep-research-report.md` (research input; snapshot predates commit `e681d36`). Canonical implementation authority: repository source and `AGENTS.md`. Copy or summarize the agreed scope into version control before any independent execution requiring portable source evidence.

## Global Constraints

- Keep rules generic, reusable, and language-idiomatic; use mature native analyzers, not new parsers.
- Avoid creating rules already covered by Ruff, go vet, Staticcheck, or Clippy.
- Do not treat Python `object`, Go behavior-bearing interfaces, or Rust lazy iterators as TypeScript equivalents.
- Restrict data-flow detection to locally provable cases; bail out on reassignment, escape, or ambiguous provenance.
- No semantic autofixes; preserve diagnostic accuracy and explicit opt-out semantics.
- Run `pnpm sync:skill-assets` after canonical rule/profile changes.
- Inspect branch, worktree and diff before edits. Use test-first changes and verify impacted languages. Never bypass Git hooks.
- No implementation or agent dispatch until the user accepts the scope and Rust default-deny policy.

## Already Implemented — Do Not Rebuild

Verified against clean `main` at `e681d36` on 2026-10-25:

- Python: `no-any-type-alias`, alias-aware `no-unsafe-dictionary-type`, `no-widen-then-cast`; tests in `languages/python/tests/test_rules.py`.
- Go: standalone `ptrinterface`, `reflectcall`, `reflectnamedaccess`, `widenassert` analyzers registered in `languages/go/cmd/anti-slop/main.go`; `analysistest` fixtures.
- Go: blanket `reflect.*` prohibition no longer appears in the `contracts` analyzer. `reflect.TypeOf` and `ValueOf` are intentionally permitted.
- Rust: `unsafe_op_in_unsafe_fn` in `anti-slop-rust.toml`, `allow_attributes_without_reason` in `anti-slop-clippy.toml`; profile tests exist.
- Go README already recommends `containedctx` as a companion rather than another bespoke analyzer.

Do not mistake the older research report's P0 recommendations for open tasks. An audit may identify defects, but changes require a reproduced failing fixture.

## Review Focus

1. Imported/shadowed Python `Any` and aliased `cast`: do not flag unrelated identifiers as typing operators.
2. Python branch-local or reassigned values: do not infer a straight-line evidence-flow invariant where control flow is unknown.
3. Python conditional dict unpack: distinguish omitted keys from values set to `None`.
4. Go user-defined methods named `Call`/`FieldByName`: never report them as `reflect.Value` operations.
5. Rust indexing or wildcard matches on valid domain boundaries: check practical false-positive and migration cost before default-deny.

## Task 1: Baseline and Evidence Audit

**Files:**
- Inspect: `languages/python/anti_slop.py`, `languages/python/tests/test_rules.py`
- Inspect: `languages/go/analyzers/*/*.go`, `languages/go/cmd/anti-slop/testdata/src/*/*.go`
- Inspect: `languages/rust/anti-slop-{rust,clippy}.toml`, `languages/rust/tests/test_profile.py`

**Interfaces:** Existing Python Pylint diagnostic symbols; Go exported `Analyzer` values; Rust profile TOML keys. No new interfaces.

- [ ] Confirm the HEAD and worktree still match the audited baseline; record any newly changed behavior.
- [ ] Run existing Python, Go, and Rust targeted test commands below. Record failures without assuming they are regressions.
- [ ] Add minimal regression fixtures only for demonstrated gaps or false positives; do not rewrite working P0 analyzers without evidence.
- [ ] Commit only demonstrated bug fixes, if any.

Commands:
- Python: `uv run --no-project --with pylint python -m unittest discover -s languages/python/tests -p 'test_*.py' -v`
- Go: `(cd languages/go && go test ./...)`
- Rust: `uv run --no-project python -m unittest discover -s languages/rust/tests -v`

## Task 2: Python — Conditional Empty Dictionary Unpack (P1)

**Files:** Modify `languages/python/anti_slop.py`; test `languages/python/tests/test_rules.py`; update `languages/python/README.md`.

**Produces:** Pylint diagnostic `no-conditional-empty-dict-unpack` with an unused `E97xx` ID chosen from the current registry.

- [ ] Write a failing test: `{**({'x': x} if cond else {})}` reports exactly one diagnostic; inverse branch also reports.
- [ ] Write passing controls: ordinary unpack, no conditional, explicit conditional assignment, and a conditional mapping with neither branch empty report nothing.
- [ ] Implement a narrow Astroid dictionary-unpack + conditional-expression matcher. Do not rewrite source automatically.
- [ ] Run the Python test module, check existing diagnostic results, and document the rule.
- [ ] Commit as one independently testable change.

## Task 3: Python — Known Local Widening (P1)

**Files:** Modify `languages/python/anti_slop.py`; test `languages/python/tests/test_rules.py`; update Python README.

**Produces:** `no-known-value-widening` Pylint diagnostic; reuse the existing same-module alias resolver.

- [ ] Write failing tests for local `value: Any = User()` and alias-to-`Any` with a statically known initializer.
- [ ] Write passing tests for `value: object = ...`, unknown expressions, imports with unproven aliases, no initializer, and non-local contracts.
- [ ] Restrict to unambiguous known local initializers; ensure the existing widen-then-cast check remains independent.
- [ ] Run targeted Python diagnostics, update documentation, and commit.

## Task 4: Python — Ruff ANN401 Ownership Audit

**Files:** Inspect/conditionally modify `languages/python/anti_slop.py`, `languages/python/tests/test_rules.py`, Python README, installation/skill-asset config under `skills/`.

**Decision:** Do not remove `no-any-parameter` or `no-any-return` merely because ANN401 exists. First prove Ruff preserves shipped coverage for nested `Any`, aliased names, `dict[str, Any]`, and mixed signature forms.

- [ ] Write a parity matrix: existing Pylint fixtures vs pinned Ruff ANN401 results.
- [ ] If Ruff covers a case, assign that case to Ruff; preserve any additional anti-slop-specific semantic enforcement and diagnostic contracts explicitly.
- [ ] If equivalent installation/enforcement is absent, document companion configuration instead of silently weakening shipped checks.
- [ ] Test the resulting setup, synchronize generated assets if changed, and commit only after coverage is preserved.

## Task 5: Rust — Additional Native Restriction Lints (P1, trial-first)

**Files:** Modify `languages/rust/anti-slop-clippy.toml` only after approval and trials; test `languages/rust/tests/test_profile.py`; update `languages/rust/README.md`.

**Candidates:** `indexing_slicing`, `wildcard_enum_match_arm`, `panic_in_result_fn`, `unreachable`. Rustc `unsafe_op_in_unsafe_fn` is already shipped.

- [ ] Trial candidates against representative Rust crates and record exact false positives or migration cost, especially indexing and wildcards.
- [ ] Add small fixture tests proving one violating example and one accepted idiomatic counterpart per candidate.
- [ ] Default-deny only candidates approved after trial; others remain documented opt-in or deferred.
- [ ] Run targeted Rust profile tests and native Clippy on representative code; update README and commit.

## Task 6: Deferred Candidates and Release Verification

**Go:** No further analyzer implementation from this report is needed unless Task 1 finds a reproduced defect. Continue recommending existing `containedctx`, Staticcheck, and vet rather than vendoring their implementations.

**Python P2:** `no-reduce-accumulator-copy` needs a separate evidence-backed, bounded rule proposal. Do not add it to the default set in this wave.

**Rust P2:** Trial `string_slice` and `mem_forget` outside the default profile; no Dylint justified.

- [ ] Synchronize canonical rule changes: `pnpm sync:skill-assets`.
- [ ] Verify generated assets: `pnpm check:skill-assets`.
- [ ] Run affected native language tests and `pnpm check` if TypeScript implementation or asset contracts changed.
- [ ] Review `git diff --check`, full diff, status, generated artifacts and any applicable project standards baseline.
- [ ] Commit coherent verified changes, push only after final verification, then inspect final status/worktrees.

## Decision Gate — Grill-Me Frontier

**Question:** Should the next wave ship all remaining P1 Python rules and a trial-first Rust profile, while leaving P2 candidates and aggressive ANN401 replacement deferred?

**Recommended default:** Yes. Keep existing P0 behavior, implement Python P1, audit Ruff parity before removing custom checks, and only enable new Rust default-deny lints after evidence from representative crates. No agents.

**Risk:** The research report is an older snapshot. Current P0 implementation was inspected but not run in this planning pass. Formal project standards conformance was not established.

**Execution state:** Plan drafted; no production code changed; decisions and runtime verification pending.

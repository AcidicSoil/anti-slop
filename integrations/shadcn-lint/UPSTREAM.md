# Enhanced @shadcn/lint provenance

- Pristine upstream: https://github.com/shadcn-ui/lint.git
- Common ancestor: `bceee0f` (original six upstream rules).
- Reviewed upstream revision: `529de36` (2026-11-02, `@shadcn/lint@0.2.5`).
- Original local patch commits: `30d9f9e` and `199568c` (13 additional Good CSS rules and coverage tests).
- Merge: three-way merge of the existing local patch with upstream `529de36` using `bceee0f` as the base; no textual conflicts. The historical `shadcn-lint-good-css` checkout remains unchanged.
- Distributed package name: `@shadcn/lint`, locally versioned `0.2.5-anti-slop.1`.
- Canonical merged source: `integrations/shadcn-lint/source/`; tested ESM/types distribution: `integrations/shadcn-lint/package/`.
- Dependencies: upstream `cn@0.4.0`, `@eslint/core@^0.17.0`, and optional ESLint parser peers; unchanged.
- Rules: all six upstream rules and 13 local opt-in Good CSS rules preserved; no new rules activated.

The upstream update includes improved component recognition through aliases, re-exports and barrels; safer package/tsconfig resolution; Tailwind theme and stylesheet import handling; variant and render-prop analysis; and bounded resolution of hostile or cyclic input.

Stackforge distributes the committed local package through `anti-slop/shadcn`. It does not fetch or replace this patch from npm, and rule activation remains owned by each consuming project's reviewed lint configuration.

## Verification (2026-11-07)

- Merged upstream package built; TypeScript and ESLint checks passed. The build emitted a non-fatal `tsdown` invalid `define` option warning.
- Upstream Vitest: 1,098 passed and one skipped; one test reached the 5-second timeout under parallel load, then its 15-test file passed in isolation.
- Upstream 19-rule corpus check passed with counts matching its baseline.
- Anti-slop shadcn tests passed (three Node tests, one Python test); skill assets synchronized and checked.
- Stackforge local source compiled, dry-run and isolated apply succeeded. The installed consumer's Oxlint rejected `transition-all` and accepted `transition-colors`.

**Maintenance:** Preserve upstream and local patches separately on future updates. Repeat the three-way comparison, build, checks and isolated consumer validation before shipping a new snapshot.

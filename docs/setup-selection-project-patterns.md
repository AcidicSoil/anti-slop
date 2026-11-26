# Project setup selection: repository-derived decision atlas

This is the detailed decision variant of [all valid options](setup-selection-all-options.md). It makes the project patterns and every registered setup selectable rather than prescribing one universal bundle. Inventory: **67 Stackforge + 12 anti-slop = 79** (source manifests and installed catalog inspected). The profiles below are proposed reusable selections, not newly installed packs. Stackforge owns reusable assets; each target project owns its actual configuration. PPM engineering owns native setup and activation decisions.

## 1. Select the project capabilities

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Inventory
    Inventory: Inspect every owned workspace and existing configuration
    Inventory --> Shape
    state "Project capabilities? Choose all that apply" as Shape <<choice>>
    Shape --> Vite: React or other Vite web application
    Shape --> Next: Next.js application
    Shape --> Extension: Browser extension or browser tooling
    Shape --> Service: Node or Python service
    Shape --> Native: Go or Rust CLI, TUI, desktop
    Shape --> Other: Library, script, or another language
    Vite --> Compose
    Next --> Compose
    Extension --> Compose
    Service --> Compose
    Native --> Compose
    Other --> Compose
    Compose: Union applicable profiles across workspaces
    Compose --> Shape: Other detected capabilities remain
    Compose --> Evaluate: All capabilities recorded
    Evaluate --> Preview: Keep incumbent, add missing, or review conflict
    Preview --> Verify: Approve and reconcile only selected deltas
    Verify --> [*]: All applicable commands verified
```

The branches are **additive capabilities**, not exclusive project types. A browser extension can have a Next.js website, Go native host, or Vite UI. A Python backend does not disable the JS/TS frontend's checks. Evaluate root-level owners once, then apply workspace-specific decisions at the owning scope. Do not treat a lockfile's transitive dependency, a checked-in fixture, a vendored copy, or a template example as owned application source.

### Observed configurations

These examples are based on tracked files and direct manifests inspected in the local repositories, not on inferred universal policy. Dependency or configuration presence is evidence of a candidate; it is not proof that a command is active.

| Pattern | Evidence from projects | Proposed reusable preference |
| --- | --- | --- |
| React/Vite workspace | ABPT: apps/web/vite.config.ts, pnpm-workspace.yaml, knip.json, .dependency-cruiser.cjs, stylelint.config.mjs, Playwright, React Grab, React Doctor. Registry Atlas: vite.config.ts, knip.jsonc, stylelint.config.mjs, cccc.toml, React Grab and Doctor. | JS quality + workspace analysis + React checks + CSS ownership + browser verification when applicable. |
| Next.js | Venice AI: next.config.ts, components.json, React Doctor, React Grab, dependency-cruiser, CCCC. 7ovr Landing Starter: .oxfmtrc.json, .oxlintrc.json, components.json, Playwright, Lighthouse, portless.json. | JS quality + Next variants, Tailwind/shadcn where adopted, browser checks, Portless when hosting locally. |
| Browser extension | PromptSnippets: Vite, React, native Go host, source-size.toml, existing Oxlint and ESLint, CI. Chat Exporter: React/Vite, Vitest, mise.toml, lefthook.yml. | Extension-aware build and test commands; no web-server presets unless a separate served app exists. Add Go checks for native host. |
| TypeScript + Python | Personal AI Bookmarks: pyproject.toml, frontend/vite.config.ts, knip.json, .ppmignore, CSS lint, CCCC. JEV Local Bridge: pyproject.toml, Vite, StyleX and Tailwind dependencies, explicit design-system lint, mixed-language CCCC. | JS/TS and Python in parallel; choose CSS and StyleX independently from actual source ownership. |
| Go + Python + shell | PPM: go.mod, ruff.toml, .pylintrc, cccc.toml, source-size.toml, .ppmignore, mise tasks for Go/Python/shell lint and security. | Native language checks + quality budgets + task orchestration; do not install Node tooling solely because of scripts or generated assets. |
| Rust CLI/TUI | Stackforge: Cargo workspace, mise.toml, lefthook.yml, CI and TUI smoke task. Cursor Session: Cargo.toml and mise.toml. | Cargo fmt/Clippy/test/build, Rust rules as selected, terminal interaction tests when present. |
| Python package | DSPyTeach: pyproject.toml and separate publish/release workflows. | uv/Ruff/Pylint as applicable, package tests/build, retain existing release pipeline. |
| UI laboratory | UI Pattern Laboratory: Vite, Storybook, Tailwind, shadcn, Vitest, E2E scripts. | Component-specific tests and interaction verification; no assumption that generic app CI is sufficient. |
| Starters | 7ovr Vite Starter and 7ovr Landing Starter: framework-specific TS, shadcn, Oxfmt/Oxlint, Git metadata, hooks, CI. | Offer complete starter assets only for new repositories or explicit migration, not as blanket replacements. |

**Observed deviations from a single default:** ABPT, Registry Atlas, Personal AI Bookmarks, JEV Local Bridge, PromptSnippets, and Venice AI use an existing `oxlint.config.ts` with vendored anti-slop rules. The newer Cloudflare default must not remove those rules or overwrite the incumbent config. CCCC thresholds differ: Registry Atlas 10/8; ABPT, Personal AI Bookmarks and JEV Local Bridge 15/10; PPM 12/10 (cognitive/cyclomatic). Keep accepted project budgets, and present any proposed tightening explicitly. The Stackforge quality template supplies JSON Oxlint config, while these projects own TypeScript config; merge the missing formatter/quality requirements into the existing owner rather than install a competing config. Pnpm pins also differ; use the target's compatible pinned versions.

### Suggested opinionated pack layers

These are **proposed** pack names and candidates for review, not persisted packs or a universal install list. Each row extends the compatible foundation; resolve the conditional alternatives to one actual setup ID before saving. Keep the source-qualified identity and the evidence for any exclusions.

| Layer / pack idea | Candidate selection to curate |
| --- | --- |
| JS/TS quality foundation | `stackforge/quality`, `stackforge/dependency-cruiser`, one of `stackforge/knip` or `stackforge/knip-workspaces`, `stackforge/cccc`, `stackforge/source-size`, `stackforge/ppmignore`; one reviewed JS lint strategy from section 3. |
| React/Vite application | Foundation + `stackforge/typescript-vite`, `stackforge/knip-vite`, `stackforge/react-doctor`; add `stackforge/shadcn-vite`, a CSS owner, `anti-slop/shadcn`, `stackforge/refero-style-system` only with matching UI ownership. |
| Next.js application | Foundation + `stackforge/typescript`, `stackforge/react-doctor`; matching `stackforge/shadcn`, CSS owner and Refero when applicable. |
| Browser verification | Framework-matched Playwright and Lighthouse variants; `stackforge/agentic-e2e` and `stackforge/knip-e2e` where that workflow is used. React Grab is a separate native dev integration. |
| Local app runtime | One of `stackforge/mise` or `stackforge/mise-app`; reviewed pnpm workspace policy; `stackforge/portless` only for eligible local servers. |
| Browser extension | JS/TS foundation + React Doctor when React is used; extension-native build/test harness and optional Go host layer; no Next/Vite served-app defaults merely because the extension uses Vite. |
| Python service/package | `anti-slop/python`, native uv/Ruff/test/build, and applicable `stackforge/mise`, `stackforge/cccc`, `stackforge/source-size`, `stackforge/ppmignore`; choose Python gitignore for new eligible repos. |
| Go CLI/TUI | `anti-slop/go`, native Go lint/test/build, applicable mise and complexity/size checks, Go gitignore for new eligible repos. |
| Rust CLI/TUI/desktop | `anti-slop/rust`, Cargo lint/test/build, applicable mise and complexity/size checks, Rust or Tauri gitignore as appropriate. |
| StyleX application | Add `anti-slop/stylex` only when actual StyleX ownership is verified; preserve other CSS policies on their separate scopes. |
| Repository hygiene | Reviewed Git metadata, contribution/agent files, one primary gitignore, skill locks, hooks, CI; ECC common plus relevant language/framework packs only where adopted. |
| Optional deeper review | `anti-slop/landmines` and/or `anti-slop/codehygiene` after separate compatibility and policy approval. |

The layer boundaries are deliberate: a monorepo can have a single root quality pack, a Vite web layer and Python or Go backend layers. Do not save incompatible whole-file alternatives together or assume a pack can express project-local merge decisions. The catalog's current metadata may offer less than the full applicable profile; use the explicit review path for missing options.

## 2. Runtime, workspace and TypeScript foundations

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Runtime
    state "Task runner and versions?" as Runtime <<choice>>
    state "stackforge/mise" as Mise
    state "stackforge/mise-app" as MiseApp
    Runtime --> Mise: Native, mixed or customized project
    Runtime --> MiseApp: Compatible Vite or Next app
    Runtime --> Package: Existing compatible runner
    Mise --> Package
    MiseApp --> Package
    state "pnpm workspace ownership?" as Package <<choice>>
    state "stackforge/pnpm-native-builds" as PnpmNative
    state "stackforge/pnpm-vite-builds" as PnpmVite
    state "stackforge/pnpm-monorepo" as PnpmMono
    Package --> PnpmNative: JS starter, reviewed build permissions
    Package --> PnpmVite: Vite-specific reviewed permissions
    Package --> PnpmMono: Actual monorepo with compatible globs
    Package --> TS: No pnpm or preserve existing workspace
    PnpmNative --> TS
    PnpmVite --> TS
    PnpmMono --> TS
    state "TypeScript configuration?" as TS <<choice>>
    state "stackforge/typescript" as NextTS
    state "stackforge/typescript-vite" as ViteTS
    TS --> NextTS: Next.js TS
    TS --> ViteTS: Vite TS
    TS --> [*]: Existing or other TS or no TS
    NextTS --> [*]
    ViteTS --> [*]
```

For JS/TS, prefer Bun runtime where compatible, pnpm dependency management, and mise for pinned tools; do not migrate package managers or runtimes without approval. For Python, use uv; for Rust and Go, use native Cargo/Go commands. Merge one `mise.toml` and one `pnpm-workspace.yaml` at each owning root, preserving actual workspace globs and only reviewed dependency build permissions. TS alias choices must agree across compiler, bundler, runtime, tests and lint; application default `@/*` to `./src/*`, same-directory relative imports, no parent traversal where the project policy applies. Preserve package exports in library/monorepo boundaries.

## 3. JS/TS lint, formatter and language-native rules

```mermaid
stateDiagram-v2
    direction TB
    [*] --> JS
    state "Owned JS or TS?" as JS <<choice>>
    state "stackforge/quality: Oxfmt and lint foundation" as Quality
    JS --> Quality: Owned JS or TS, compatible tooling
    JS --> Native: No JS or TS
    Quality --> Owner
    state "One owning JS lint pass" as Owner <<choice>>
    state "Preserve incumbent and merge missing rules" as Existing
    state "anti-slop/cloudflare" as Cloudflare
    state "anti-slop/typescript" as Vendored
    state "anti-slop/effect" as Effect
    Owner --> Existing: Active lint already configured
    Owner --> Cloudflare: New general JS or TS, compatible preset
    Owner --> Vendored: Specialized vendored policy approved
    Owner --> Effect: Direct Effect and type-aware policy approved
    Existing --> Native
    Cloudflare --> Native
    Vendored --> Native
    Effect --> Native
    Native: Evaluate every native language
    state "anti-slop/python" as Python
    state "anti-slop/rust" as Rust
    state "anti-slop/go" as Go
    Native --> Python: Python source
    Native --> Rust: Rust crates
    Native --> Go: Go modules
    Native --> [*]: No additional language or all evaluated
    Python --> Native: Record and continue
    Rust --> Native: Record and continue
    Go --> Native: Record and continue
```

- `stackforge/quality` is a **coupled** Oxfmt/Oxlint template; it is not a safe second lint config. Preview the overlap, merge needed Oxfmt/settings into the active owner, and retain the existing diagnostics unless equivalent coverage is verified. JS-only evidence may justify offering quality even though its current automatic metadata requires TypeScript.
- Cloudflare is the current default for new compatible JS/TS projects. Keep existing vendored rules for incumbent projects; an Effect branch replaces the core owner only with compatibility and policy approval. Direct Effect can instead add reviewed supported rules to the incumbent.
- Native Python: uv, Ruff, Pylint, pytest/package build as applicable. Native Rust: cargo fmt, Clippy/rustc, Cargo test/build. Native Go: gofmt, go vet, anti-slop analyzer, Staticcheck, optional govulncheck, module tests/build. Owned shell: shfmt and ShellCheck. Native checks are additive and not independent catalog setups unless named above.

## 4. Code graph, complexity, structure and optional companions

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Graph
    state "JS or TS unused-code analysis?" as Graph <<choice>>
    state "stackforge/knip" as Knip
    state "stackforge/knip-workspaces" as KnipWS
    Graph --> Knip: Single package
    Graph --> KnipWS: Multiple owned JS or TS workspaces
    Graph --> Budgets: Inapplicable
    Knip --> Extensions
    KnipWS --> Extensions
    Extensions: Consider stackforge/knip-vite and stackforge/knip-e2e independently
    Extensions --> Boundaries
    Boundaries: stackforge/dependency-cruiser for actual module graph
    Boundaries --> Budgets
    Budgets: Consider stackforge/cccc and stackforge/source-size and stackforge/ppmignore independently
    Budgets --> Companions
    state "Optional diagnostics?" as Companions <<choice>>
    state "anti-slop/landmines" as Landmines
    state "anti-slop/codehygiene" as Hygiene
    Companions --> Landmines: Approved JS or TS companion
    Companions --> Hygiene: Approved touched-file review
    Companions --> [*]: None or all evaluated
    Landmines --> Companions: Integrate in owning lint pass
    Hygiene --> Companions: Advisory unless gate approved
```

Knip Vite and E2E extensions are additive only where their parser exception or E2E entrypoints are relevant. A pnpm-workspace file alone does not prove multiple analyzed workspaces; inspect the graph and preserve Knip's existing entry and ignore settings. The workspace Knip template only supplies a config; ensure its dependency, analyzer script and activation exist. Dependency Cruiser, import-path policy, CCCC, source-size and .ppmignore each have separate responsibilities. Do not hide owned files from analysis just to pass checks. Review Landmines rule overlap, and keep CodeHygiene advisory unless an explicit gate is approved. Existing RepoWise configuration/index is a separate native capability; verify its availability, never initialize or refresh without the governing project policy.

## 5. Frontend, CSS and component ownership

```mermaid
stateDiagram-v2
    direction TB
    [*] --> CSS
    state "Owned authored stylesheets?" as CSS <<choice>>
    state "stackforge/stylelint" as Stylelint
    state "anti-slop/css" as CSSGeneral
    state "anti-slop/css-tailwind" as CSSStrict
    CSS --> Stylelint: Baseline CSS policy
    CSS --> CSSGeneral: Approved full CSS policy
    CSS --> CSSStrict: Approved strict Tailwind v4 two-file ownership
    CSS --> Components: None or existing equivalent
    Stylelint --> Components
    CSSGeneral --> Components
    CSSStrict --> Components
    state "Component configuration?" as Components <<choice>>
    state "stackforge/shadcn" as NextComponents
    state "stackforge/shadcn-vite" as ViteComponents
    Components --> NextComponents: Next plus adopted shadcn and Tailwind
    Components --> ViteComponents: Vite plus adopted shadcn and Tailwind
    Components --> UI: Other or incumbent
    NextComponents --> UI
    ViteComponents --> UI
    UI: Independently consider anti-slop/shadcn and anti-slop/stylex
    UI --> Design: Browser-rendered design system adopted
    Design: stackforge/refero-style-system
    UI --> [*]: No browser design work
    Design --> [*]: Reference and approved design plan
```

Use one Stylelint owner; merge approved rule deltas into it. Tailwind v4 does not imply strict two-file CSS ownership without a project design decision. StyleX lint requires actual StyleX source, official ESLint integration, and verified token/component paths. Both StyleX and shadcn lint may coexist on distinct source scopes, with no duplicate owner. Refero is an agent/design workflow, not an automatic framework migration; require an approved reference, DESIGN.md, tokens, one global stylesheet and consolidation plan. Existing UI registries, components and native TUI design contracts remain in their owning architecture. Select React Doctor for React source and official React Grab only for a supported browser React entrypoint; Grab is development-time inspection, not a lint gate.

## 6. Runtime hosting, browser verification and CI

```mermaid
stateDiagram-v2
    direction TB
    [*] --> React
    React: stackforge/react-doctor when React is actually used
    React --> Hosting
    Hosting: stackforge/portless for eligible local served apps
    Hosting --> E2E
    state "Browser E2E framework?" as E2E <<choice>>
    state "stackforge/playwright" as NextPW
    state "stackforge/playwright-vite" as VitePW
    E2E --> NextPW: Next production or preview
    E2E --> VitePW: Vite production preview
    E2E --> AgentE2E: Other native harness or no browser E2E
    NextPW --> AgentE2E
    VitePW --> AgentE2E
    AgentE2E: Consider stackforge/agentic-e2e separately
    AgentE2E --> Perf
    state "Browser performance gate?" as Perf <<choice>>
    state "stackforge/lighthouse" as NextLH
    state "stackforge/lighthouse-vite" as ViteLH
    Perf --> NextLH: Approved Next audit
    Perf --> ViteLH: Approved Vite audit
    Perf --> CI: Not applicable or existing gate
    NextLH --> CI
    ViteLH --> CI
    CI: Review stackforge/github-ci and stackforge/hooks independently
    CI --> [*]: Native lint, test, build and approved CI coverage
```

Portless is for named local serving/proxy lifecycle, not for an extension or CLI without a server. Playwright and agentic E2E can coexist; use the appropriate Next/Vite base and local-model-only/BYOK agents where requested. Match browser test and build targets, inspect actual rendered behavior, and use native TUI PTY tests for terminal apps. For component laboratories, consider Storybook and component tests as native capabilities. Lighthouse is a distinct approved performance/accessibility gate. CI and hooks must preserve existing dispatch: local targeted checks, relevant pre-push, exhaustive supported offline PR/default-branch CI, required checks where permitted. Prefer Linux and existing Zoomies + official runners where eligible; exact routing, trust/isolation, permissions and project-specific approvals remain prerequisites. No global hook changes.

## 7. Repository files, skills and instructions

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Ignore
    state "One primary gitignore template?" as Ignore <<choice>>
    state "stackforge/gitignore" as Common
    state "stackforge/gitignore-node" as Node
    state "stackforge/gitignore-next" as Next
    state "stackforge/gitignore-python" as Python
    state "stackforge/gitignore-rust" as Rust
    state "stackforge/gitignore-go" as Go
    state "stackforge/gitignore-tauri" as Tauri
    Ignore --> Common: General project
    Ignore --> Node: Node
    Ignore --> Next: Next.js
    Ignore --> Python: Python
    Ignore --> Rust: Rust
    Ignore --> Go: Go
    Ignore --> Tauri: Node plus Rust desktop WebView
    Ignore --> Repo: Existing or mixed-language merge
    Common --> Repo
    Node --> Repo
    Next --> Repo
    Python --> Repo
    Rust --> Repo
    Go --> Repo
    Tauri --> Repo
    Repo: Evaluate repository and agent templates independently
    Repo --> [*]
```

| Setup family | Decision and exact options |
| --- | --- |
| Git metadata | `stackforge/git-attributes`: LF normalization when appropriate; preview any large normalization change separately. |
| Contribution guide | `stackforge/contributing`: adapt to repository-native commands and owners. |
| Agent entrypoints | `stackforge/agent-instructions`, `stackforge/claude-instructions`: individually review; the CLAUDE starter is Next-specific. Do not replace existing AGENTS.md or instructions wholesale. |
| Skill dependency records | `stackforge/skill-lock`: only with actual installed skills and compatible lock format. |
| Starter GitHub directory | `stackforge/github`: new/approved starter repo only. Overlaps `stackforge/github-ci`; keep one workflow owner, preserve existing release/security/workflow files. |
| Agent skill directories | `stackforge/agents`, `stackforge/claude`: review individual settings and skills; both reference common canonical skill files, do not duplicate content or overwrite user-specific hooks/settings. |

For mixed languages, reconcile one .gitignore with necessary entries from relevant presets; do not apply several whole-file templates in sequence. Consider project-native verification and formal-verification skills, architecture docs, statecharts, and human-review notes as workflow capabilities outside the catalog. Do not add generated/design files contrary to repository policy.

## 8. ECC language and framework rules

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Adoption
    state "ECC rules adopted?" as Adoption <<choice>>
    state "stackforge/ecc-rules-guide" as Guide
    state "stackforge/ecc-rules-common" as Common
    Adoption --> [*]: Not adopted
    Adoption --> Guide: Reviewed ECC policy
    Guide --> Common
    Common --> Languages
    Languages: Select every applicable language pack from table
    Languages --> Frameworks
    Frameworks: Select applicable framework packs from table
    Frameworks --> Review
    Review: Compare overlaps with existing instructions and rules
    Review --> [*]: Approved merge or keep incumbent
```

Every ECC pack is an independent extension of common. These are instruction/rule assets, not evidence that a language-native lint command is installed.

| Evidence | Exact setup |
| --- | --- |
| Angular | `stackforge/ecc-rules-angular` |
| ArkTS | `stackforge/ecc-rules-arkts` |
| C++ | `stackforge/ecc-rules-cpp` |
| C# | `stackforge/ecc-rules-csharp` |
| Dart | `stackforge/ecc-rules-dart` |
| F# | `stackforge/ecc-rules-fsharp` |
| Go | `stackforge/ecc-rules-golang` |
| Java | `stackforge/ecc-rules-java` |
| Kotlin | `stackforge/ecc-rules-kotlin` |
| Nuxt | `stackforge/ecc-rules-nuxt` |
| Perl | `stackforge/ecc-rules-perl` |
| PHP | `stackforge/ecc-rules-php` |
| Python | `stackforge/ecc-rules-python` |
| React | `stackforge/ecc-rules-react` |
| React Native | `stackforge/ecc-rules-react-native` |
| Ruby | `stackforge/ecc-rules-ruby` |
| Rust | `stackforge/ecc-rules-rust` |
| Swift | `stackforge/ecc-rules-swift` |
| TypeScript | `stackforge/ecc-rules-typescript` |
| Vue | `stackforge/ecc-rules-vue` |
| Web application | `stackforge/ecc-rules-web` |

A direct framework can justify multiple packs (e.g. TypeScript + React + Web); do not assume all 21 packs apply merely because the common pack is present.

## 9. Curate, save, and reuse a selection

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Inspect
    Inspect: Read target and registered catalog
    Inspect --> Decision
    state "Candidate evidence and policy?" as Decision <<choice>>
    Decision --> Keep: Existing accepted owner
    Decision --> Include: Declared match and permitted
    Decision --> Ask: Missing metadata and plausible pending difference
    Decision --> Skip: Inapplicable or declared mismatch
    Ask --> Include: Explicit yes
    Ask --> Skip: Explicit no
    Ask --> Ask: Unanswered, no writes
    Keep --> Preview
    Include --> Preview
    Skip --> Preview: Record reason
    Preview: Compare semantic changes and ownership
    Preview --> Review: Conflicting or requires migration
    Review --> Preview: Approved revised selection
    Preview --> Save: Optional named reusable selection
    Save --> Preview: Reuse in another target and re-evaluate
    Preview --> Apply: Safe differences and approved target
    Preview --> Verify: No missing differences
    Apply --> Verify
    Verify --> Preview: Missing differences or failed commands, retry
    Verify --> PendingRepair: Checks fail and work stops
    PendingRepair --> Preview: Resume from actual target state
    Verify --> [*]: Actual checks pass and no pending deltas
```

The profile is a curated preference, not an installation guarantee. A pack stores source-qualified IDs, not copied config or a blanket permission to apply. On reuse, review the destination and re-evaluate applicability, conflicts, existing ownership and activation. Incompatible packs need a revised selection, not forceful replacement.

```bash
# Discover current matches and uncertain options (with exact help commands).
stackforge --json setup recommend --target /path/to/project
stackforge setup update --recommended --target /path/to/project --dry-run

# Include reviewed uncertain candidates; preview before applying.
stackforge setup update --recommended --include-possible stackforge/stylelint --skip-possible --target /path/to/project --dry-run

# Save the exact reviewed IDs once, then preview in another target.
stackforge setup pack save NAME SOURCE/SETUP SOURCE/OTHER-SETUP
stackforge setup pack list
stackforge setup pack show NAME
stackforge setup update --pack NAME --target /path/to/another-project --dry-run

# Preview previously recorded installations independently.
stackforge setup update --all --target /path/to/project --dry-run
```

Use current TUI help for equivalent target selection, recommendations, candidate review, packs, and batch preview. A yes/no selection is separate from approval of conflicts or writes. A pending change with no recommendation metadata must be offered for a decision, not ignored; explicit mismatch is not an automatic suggestion. Already-equivalent applicable setups still need active command verification. If checks fail after applying changes, record the written changes and pending repair; do not represent the outcome as skipped, rolled back, or complete. Reconcile native tools with their owners, not a second installer. See [the detailed reconciliation flow](setup-selection-all-options.md#7-reconcile-missing-differences-before-finishing).

## Evidence and limits

Audit covered ABPT, ABOPS, Registry Atlas, PPM, PromptSnippets, Personal AI Bookmarks, Venice AI, Chat Exporter Extension, GH Repo Manager, Stackforge, Dirty Data, DSPyTeach, JEV Local Bridge, UI Pattern Laboratory, both 7ovr starters, anti-slop, Webcmd, Cursor Session, and Agent Workflow Runtime. Source snapshots: anti-slop `db4f7a4`, Stackforge `41e53b5`; installed source list returned 67 + 12 entries. Repositories were inspected read-only; no pack was created, no setup installed, no project migrated, and no CI configuration changed. These are proposed decision preferences grounded in the sampled projects, not approval to standardize their differences. Catalog definitions, active project policies and native commands take precedence over this document if they change.


### Verification evidence

The installed catalog, both canonical source manifests, and the qualified IDs in this atlas were compared as sets: **79 = 79 = 79**, with no missing or extra IDs. All 15 Mermaid diagrams in the three setup-selection documents render with Pele.

The bounded [TLA+ lifecycle model](verification/setup-selection/SetupReview.tla) and [generated statechart](verification/setup-selection/lifecycle.mmd) cover one abstract candidate, applicability evidence, approval, preview, conflict review, verification failure, pending repair, and reuse. TLC explored 60 states and 240 transitions; all six modeled safety/deadlock checks held. This verifies the abstract lifecycle, not the applicability of every setup or the runtime implementation of Stackforge. The view hides 28 transitions within the same displayed state.

To reproduce the lifecycle check, copy the TLA+, cfg and view files from `docs/verification/setup-selection/` into a temporary directory, then run from that directory:

```bash
"$HOME/tools/plugins/pstack/skills/statechart/scripts/statechart" SetupReview.tla --config SetupReview.cfg --view view.ts --out model-check
```

The model deliberately abstracts project-specific manifests, filesystem operations, multi-candidate interactions, and actual check execution. Consult the real preview and run the affected checks before applying any setup.

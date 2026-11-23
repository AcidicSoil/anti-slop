# anti-slop

[![skills.sh](https://skills.sh/b/AcidicSoil/anti-slop)](https://skills.sh/AcidicSoil/anti-slop)

Opinionated Oxlint rules that reject low-evidence and low-signal TypeScript and JavaScript patterns.

> [!IMPORTANT]
> **Prefer [`cloudflare/oxlint-config`](https://github.com/cloudflare/oxlint-config) over anti-slop.** It has adopted most of anti-slop's rules and is actively maintained by Cloudflare and the Vite team. Use anti-slop only if you specifically need something that config doesn't cover.

Anti-slop is first and foremost the ruleset I use with my work, projects, and team. It reflects my preferences and taste rather than attempting to be a universal coding standard.

**This project is meant to be vendored**, not treated as a fixed npm dependency. There is no official npm package. Copy the rules into your repository, read them, and change them to match your team's standards. The bundled agent skill handles the initial copy and configuration; after that, the vendored files are yours to maintain and make your own. Community-maintained forks and packages are welcome, but their compatibility and release lifecycle belong to their maintainers.

## Choose the TypeScript/JavaScript baseline

For general TypeScript and JavaScript projects, use the published
[`@cloudflare/oxlint-config`](https://github.com/cloudflare/oxlint-config). Its
[official migration skill](https://github.com/cloudflare/oxlint-config/blob/main/skills/migrate-oxlint-config/SKILL.md)
handles existing lint configurations. The preset provides native and type-aware
Oxlint checks, rather than shipping the individual custom anti-slop rules.
Review the actual diagnostics before replacing an existing bespoke policy.

This fork's `typescript` setup and `install-anti-slop` skill are **opt-in** for
specific vendored anti-slop rules the Cloudflare preset does not enforce.
Choose **one baseline**, not two aggregate lint passes. The specialized Effect,
CSS, StyleX, shadcn, Python, Rust, Go, Landmines, and CodeHygiene integrations
remain independent choices.

Cloudflare's current standalone setup requires Node.js 22.18+ (or 24+),
Oxlint 1.94+, and the `tsrs` type-aware backend. Keep an existing compiler/type
check and migrate dependency versions deliberately. The Stackforge
`cloudflare` setup below stages the published preset separately from our legacy
Oxlint plugin setup.

## Supported languages

| Language | Implementation | Skill |
| --- | --- | --- |
| TypeScript / JavaScript | Cloudflare preset by default; vendored Oxlint plugin for additional rules | [Cloudflare migration skill](https://github.com/cloudflare/oxlint-config/blob/main/skills/migrate-oxlint-config/SKILL.md) / `install-anti-slop` (opt-in) |
| CSS | Stylelint plugin | `install-anti-slop-css` |
| StyleX | Official StyleX rules and the standalone design-system plugin | `install-anti-slop-stylex` |
| Python | Pylint / Astroid checker | `install-anti-slop-python` |
| Rust | Clippy and rustc lint profiles | `install-anti-slop-rust` |
| Go | `go/analysis` multichecker | `install-anti-slop-go` |

Install only the specialized anti-slop language rules you need:

```bash
npx skills add AcidicSoil/anti-slop --skill install-anti-slop
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-css
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-stylex
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-python
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-rust
npx skills add AcidicSoil/anti-slop --skill install-anti-slop-go
```

Other language implementations remain maintained in this fork. StyleX design-system rules are owned by the standalone `eslint-plugin-stylex-design-system` package.

Tailwind v4 UI projects use the separate [enhanced shadcn/lint Stackforge setup](languages/shadcn/README.md): six upstream rules plus thirteen new Good CSS rules. The complete plugin is bundled as a versioned local package and rule activation remains subject to the project's reviewed design system.

The optional `good-css` and `better-typography` agent skills complement the CSS and shadcn lint checks where installed. `tailwind-to-stylex` is only for explicit, scoped styling migration; neither anti-slop nor Stackforge triggers framework conversion. See the [shadcn setup guide](languages/shadcn/README.md) for PPM integration.

StyleX uses [four official rules and five standalone design-system rules](languages/stylex/README.md). Oxlint handles JS/TS; Vue and Svelte templates use ESLint with their framework parsers. The setup stages the package without changing existing lint configuration.

CSS uses [three Stylelint architecture rules](languages/css/README.md): stylesheet size, scoped ownership, and cross-feature dependencies. The CSS install skill also prescribes a verified migration of existing oversized or global stylesheets; it does not blindly auto-split CSS.

## Landmines companion rules

[Landmines](https://github.com/interfere-inc/landmines) adds checks for test doubles, fixed sleeps, retries, polling without signals, unhandled MSW requests, test placement and naming, and package exports. Anti-slop uses its published Oxlint plugin rather than duplicating the implementation.

Eight compatible rules are enabled for this repository. Consumers can opt in with the [Landmines integration guide](integrations/landmines/README.md) or the `anti-slop/landmines` Stackforge setup, which stages the preset and adds the upstream package as a separate dependency. Its blanket comment ban conflicts with anti-slop's safety-justification rule, and its return-type policy is kept optional. The existing `no-module-mocking` rule remains available for consumers without Landmines.

## CodeHygiene companion

[CodeHygiene](https://github.com/brianbell-x/codehygiene) adds an experimental, local structural-readability check for touched files across TypeScript, JavaScript, Python, Rust, Go, and other languages. The separate `anti-slop/codehygiene` Stackforge setup stages a pinned `uvx` launcher and usage guide without installing any project packages or enabling any automatic checks. See the [CodeHygiene integration guide](integrations/codehygiene/README.md).

## Opt in to vendored TypeScript/JavaScript rules

```bash
npx skills add AcidicSoil/anti-slop --skill install-anti-slop
```

Use this only when the published Cloudflare preset does not cover a required rule. Then ask your coding agent to install or configure anti-slop in the current repository. The skill copies the plugin, installs compatible Oxlint dependencies—matching an existing Oxlint version when present—merges the plugin into the existing lint configuration, enables every generic rule, and validates the result. In repositories that depend directly on Effect, it also enables the opt-in Effect rule group.

### Update an existing installation

Ask your agent to **update anti-slop while preserving local customizations**, optionally naming an upstream revision or selected fixes. The same skill stages incoming source separately, uses a three-way merge when the original upstream snapshot is recoverable, and otherwise ports reviewed changes conservatively. It preserves local rules and configuration, asks about conflicting policy and enabling new rules, and records provenance for future updates. It does not force-replace the vendored directory.

For latest upstream, ask the agent to retrieve and identify that revision; an already-installed skill bundle may be older. The copy script itself does not fetch or merge updates.

### Install from Stackforge

This fork exposes its canonical files through `stackforge.setups.toml`; Stackforge does not maintain a duplicate asset tree.

```bash
stackforge setup source add https://github.com/AcidicSoil/anti-slop.git
stackforge setup sync anti-slop
stackforge setup list
```

### Activate Stackforge setups

Choose applicable setups with the [compact statechart](docs/setup-selection-statechart.md) or the [complete-options variant](docs/setup-selection-all-options.md) before applying them.

Applying a selected setup now installs its dependencies and rule files, registers
the applicable standalone lint configuration, wires Node checks into the
existing `package.json` `lint` script, and **executes its verification check**.
It fails rather than claiming activation when a required tool is unavailable,
a project config conflicts, or existing code violates the selected rules.

```bash
stackforge setup sync anti-slop
stackforge setup apply anti-slop/<setup> --target /path/to/project --dry-run
stackforge setup apply anti-slop/<setup> --target /path/to/project
```

| Setup | Mise task | Provided coverage |
| --- | --- | --- |
| `cloudflare` | `mise run lint:cloudflare` | **Recommended** general TS/JS preset from npm; pins compatible Oxlint and `tsrs`. Choose instead of `typescript`. |
| `typescript` | `mise run lint:typescript` | Opt-in vendored anti-slop TypeScript/JavaScript rules for requirements not covered by Cloudflare. |
| `effect` | `mise run lint:effect` | For Effect projects **instead of** `typescript`: generic anti-slop, five custom Effect architecture rules, and official type-aware `@effect/tsgo` diagnostics in one pass. |
| `shadcn` | `mise run lint:shadcn` | All 19 enhanced shadcn rules, including every Good CSS rule, enforced. |
| `stylex` | `mise run lint:stylex` | All four official StyleX and five design-system rules; configure project-specific tokens and imports. |
| `css` | `mise run lint:css` | Complete canonical Stylelint preset: all three anti-slop CSS rules and native Stylelint policies. |
| `css-tailwind` | `mise run lint:css-tailwind` | Complete strict Tailwind v4 Stylelint preset, limited to `globals.css` and `tokens.css`. |
| `python` | `mise run lint:python` | Full Pylint anti-slop rule set alongside existing Python tooling. |
| `rust` | `mise run lint:rust` | Full Clippy/rustc anti-slop policy, loaded from the installed profiles. |
| `go` | `mise run lint:go` | Full Go analyzer multichecker over project packages. |
| `landmines` | `mise run lint:landmines` | All eight selected Landmines testing and structure rules. |
| `codehygiene` | `mise run review:codehygiene path/to/file` | Full pinned CodeHygiene advisory review of selected files. |

Every setup installs its Mise task under `.mise/tasks/lint/` or
`.mise/tasks/review/`, preserving the target's existing `mise.toml`.
Node task entries delegate to their installed `package.json` scripts; those
scripts also join the existing aggregate `lint` command using the target's
detected package manager. CodeHygiene is deliberately an advisory review task,
not an unconditional lint gate.

Cloudflare's setup is a separate choice. Do not apply it alongside the
vendored TypeScript or Effect setup solely for duplicate general linting. Its
versioned dependencies may conflict with an existing Oxlint installation;
review a dry run rather than forcing replacements. The preset does not
supersede the project's existing TypeScript typecheck.

The owning project's CI must invoke its aggregate `lint` task or the relevant
native `mise`/shell checks. Stackforge does not overwrite existing workflows or
replace existing linters. A target with different dependency versions or
incompatible configuration gets a reviewable conflict. Existing installations
must be updated with `stackforge setup update anti-slop/<setup>`; source sync
alone does not change target projects.

Validation executes the installed commands; a clean result does not prove that
every optional rule is suitable for the application's design system. Review
project-specific token paths, Tailwind architecture, and existing violations.

To inspect available skills first:

```bash
npx skills add AcidicSoil/anti-slop --list
```

## Manual vendored anti-slop installation (opt-in)

Copy `src/` into the target repository, for example at `tools/oxlint/anti-slop/`. Run `node tools/oxlint/anti-slop/check-suppressions.mjs` before Oxlint in the active lint command, and install compatible `oxc-parser` as a development dependency. If the repository already uses `oxlint`, install `@oxlint/plugins` at exactly the resolved Oxlint version. Otherwise, install the same current version of both packages. Keep both versions exact so upgrades move them together.

Register the copied entry point in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    reportUnusedDisableDirectives: "error",
    respectEslintDisableDirectives: false,
  },
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
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "tools/oxlint/anti-slop/**",
  ],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
  ],
  rules: {
    "oxc/no-accumulating-spread": "error",
    "typescript/no-confusing-non-null-assertion": "error",
    "typescript/no-empty-object-type": "error",
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-lint-suppression-directives": "error",
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
    "anti-slop/require-readable-spacing": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error"
  }
});
```

The same `ignorePatterns`, `jsPlugins`, and rules work under `lint` in a Vite+ config. Merge the ignore patterns into Vite+'s `fmt.ignorePatterns` as well so `vp check` does not reformat installed agent assets or the vendored plugin. Preserve existing ignores and add any other project-local agent tooling directories detected in the repository; do not broadly ignore every dot-directory.

### Optional type-aware companion rule

Oxlint 1.86 added `typescript/no-generated-empty-object-type`, which catches type operations that resolve to `{}`. It requires Oxlint type-aware linting. In a TypeScript project that already has a compatible `oxlint-tsgolint`, enable it with:

```ts
export default defineConfig({
  options: { typeAware: true },
  rules: {
    "typescript/no-generated-empty-object-type": "error",
  },
});
```

Oxlint type-aware linting requires TypeScript 7.0 or newer. Keep `oxlint-tsgolint` compatible with the project's TypeScript version rather than forcing the repository's own pinned type-aware backend onto every consumer.

### Optional Effect rules

The [`anti-slop/effect` Stackforge setup](integrations/effect/README.md) activates both the five custom rules below **and** the official `@effect/tsgo` recommended preset in a single Oxlint pass. Choose it instead of `anti-slop/typescript` for directly Effect-dependent projects, avoiding duplicate lint execution. The `typescript` setup stays framework-independent.

Effect-specific rules live in a separate plugin so projects that do not use Effect do not inherit Effect architecture policy. Register the Effect entry point only in repositories that use Effect:

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts"
    }
  ],
  rules: {
    "anti-slop-effect/no-manual-effect-error-tag": "error",
    "anti-slop-effect/no-manual-tag-comparison": "error",
    "anti-slop-effect/no-manual-tagged-construction": "error",
    "anti-slop-effect/no-service-constructor-imports": "error",
    "anti-slop-effect/prefer-effect-match": "error"
  }
});
```

## Rules

### Generic rules

- `no-array-filter-map` — rejects adjacent eager array filter/map passes while allowing lazy iterator pipelines.
- `no-reduce-accumulator-copy` — rejects non-spread accumulator copies inside reducers; complements native `oxc/no-accumulating-spread`.
- `no-chained-type-assertions` — rejects nested `as` and angle-bracket assertions that fabricate evidence; chains made only of `as const` remain valid.
- `no-conditional-empty-object-spread` — reports object spreads that use a conditional `{}` branch to omit fields. It intentionally has no autofix because omission is not equivalent to assigning `undefined`.
- `no-known-value-widening` — rejects known expressions flowing into explicit `unknown`, `object`, anonymous-object, or open-dictionary targets, including known arguments passed to local `unknown` type predicates. Empty dictionary accumulators and finite-key `Record` targets remain valid.
- `no-module-mocking` — rejects Vitest and Jest `mock`, `doMock`, and `unstable_mockModule` calls in favor of real dependency seams.
- `no-lint-suppression-directives` — rejects `eslint-disable*`, `oxlint-disable*`, `@ts-ignore`, `@ts-nocheck`, and `@ts-expect-error` comments. The required `check-suppressions.mjs` preflight uses Oxc parser to catch file-wide disables that silence Oxlint itself. Protect lint configs through repository review and CI policy; a lint rule alone cannot prevent config edits.
- `no-object-parameters` — rejects `object`, unions containing it, and scoped or transparent generic aliases that resolve to it on function inputs.
- `no-reflect-apply` — rejects global `Reflect.apply` in favor of typed function calls.
- `no-reflect-get` — rejects global `Reflect.get` in favor of typed property access or boundary parsing.
- `no-runtime-typeof` — requires boundary parsing instead of ad hoc `typeof` narrowing. Existence probes against the string `"undefined"` are allowed, and type predicates can be enabled explicitly.
- `no-shape-in-symbol-names` — rejects the case-insensitive substring `shape` in locally owned symbol names while allowing static member names such as Zod's `schema.shape` that cannot be renamed locally.
- `no-unknown-parameters` — rejects `unknown` and unions containing it on function inputs except the explicit `cause` convention and the exact subject of a type predicate.
- `no-unknown-returns` — rejects explicit function contracts that resolve to `unknown`, `Promise<unknown>`, or `PromiseLike<unknown>`, including scoped and transparent generic aliases.
- `no-unknown-type-aliases` — rejects scoped and transparent generic aliases whose resolved type is `unknown`.
- `no-unsafe-dictionary-type` — rejects dictionary value contracts based on `unknown`, `any`, `object`, `{}`, and semantic equivalents. Generic constraints such as `T extends Record<string, unknown>` are allowed.
- `no-widen-then-assert` — rejects immutable local flows that widen known evidence to `unknown`, `any`, `object`, or a broad record and later assert it back to a narrower type.
- `require-readable-spacing` — autofixes missing blank lines between top-level declarations, around multiline bindings, before control flow/returns, and after blocks; preserves compact groups of single-line bindings, imports, and overload signatures.
- `require-safety-comment-for-type-assertion` — requires each non-const assertion to have a nearby, non-empty invariant justification. Marker prefixes are configurable and default to `SAFETY`.

### Effect rules

- `no-manual-effect-error-tag` — rejects manual `_tag` comparisons and switches inside broad `Effect.catch`, `Effect.catchAll`, and `Effect.catchIf` handlers in favor of tagged error handlers.
- `no-manual-tag-comparison` — rejects direct `_tag` comparisons and `_tag` switches in favor of `Match`, `Predicate.isTagged`, or tagged-enum matching.
- `no-manual-tagged-construction` — rejects literal `_tag` object construction in favor of Schema, tagged class/error, or `Data.taggedEnum` constructors. `Match.when` and `Match.not` patterns remain allowed.
- `no-service-constructor-imports` — rejects named `make<CapabilityName>` imports from relative project modules outside `*.test.*` and `*.spec.*` files. Runtime callers should import the owning Layer and yield the contextual service instead. Package and path-alias imports, default imports, and static constructors such as `WorkspaceName.make` are outside the rule.
- `prefer-effect-match` — rejects chained literal ternaries over the same value in favor of Effect's `Match` API.

### Analysis boundaries

The rules use Oxlint's ESTree and lexical-scope APIs rather than a TypeScript type checker. They resolve same-file aliases—including block-scoped aliases, forward references, and transparent generic aliases—but do not infer imported type definitions or cross-file call signatures. Rules that inspect calls therefore document when enforcement is intentionally local.

## Violation examples

Each snippet below is rejected by the named rule.

### `no-array-filter-map`

```ts
const users: User[] = loadUsers();
const emails = users.filter(user => user.active).map(user => user.email);
const found = users.map(lookup).filter(value => value !== undefined);
```

Prefer lazy iterator helpers where the target runtime supports them:

```ts
const emails = users.values()
  .filter(user => user.active)
  .map(user => user.email)
  .toArray();
```

A single `flatMap(user => user.active ? [user.email] : [])` or a reducer that pushes into a fresh local array is also allowed. Iterator helpers avoid intermediate arrays and per-item wrapper arrays, but are not guaranteed to be faster. Check runtime support; TypeScript library declarations do not polyfill them.

This AST/scope rule recognizes array literals, direct array/tuple annotations, immutable local aliases, and supported array-preserving method chains. Unknown receivers (including imported factory results and unannotated parameters), type aliases, and property-based array types are not inferred. Iterator pipelines are not flagged. Both `filter().map()` and `map().filter()` are covered, regardless of predicate. There is no autofix: callback ordering, indexes, `thisArg`, sparse arrays, and truthiness filtering must be reviewed before changing APIs.

### `no-reduce-accumulator-copy`

```ts
items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});
items.reduce((acc, item) => acc.concat([item]), []);
items.reduce((acc, item) => {
  const next = acc.slice();
  next.push(item);
  return next;
}, []);
```

Instead, mutate a fresh, locally owned accumulator and return it:

```ts
items.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);
```

`Object.assign(acc, item)` is also allowed. Copying individual input items is not copying accumulated state.

The rule covers inline `reduce`/`reduceRight` callbacks, including index parameters, and immutable local accumulator aliases. It detects global `Object.assign` with an object-literal target and the accumulator as a source, global `Array.from(acc)`, and array accumulator calls to `concat`, `slice`, `toSpliced`, `toSorted`, `toReversed`, and `with`. Array copy methods require local array evidence for the initial value so string concatenation and unknown custom collections are not flagged. Like the native rule, reducer method names are syntactic evidence, not proof of the receiver's runtime type. Named callbacks, nested functions, indirect copy helpers, nested accumulator properties, and reassigned aliases are outside its scope. Copying a bounded accumulator is not necessarily quadratic, but these patterns are rejected because growing accumulators can be.

Enable native `oxc/no-accumulating-spread` alongside it for array/object spreads in reducers and supported loops. Neither rule proves that every possible quadratic reduction is absent. No automatic mutation rewrite is provided because accumulator ownership cannot be established syntactically.

### `no-chained-type-assertions`

```ts
const user = input as object as User;
```

### `no-conditional-empty-object-spread`

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
```

### `no-known-value-widening`

```ts
const handlers: Record<string, Handler> = {
  start: startHandler,
};
```

This discards the known `start` key. Preserve inference or use `satisfies Record<string, Handler>` instead.

Known values must not be widened back to `unknown` through a local type predicate:

```ts
function isUser(value: unknown): value is User {
  return UserSchema.safeParse(value).success;
}

declare const user: User;
isUser(user);
```

Call the predicate at the unparsed boundary, while the argument is still `unknown`.

### `no-module-mocking`

```ts
vi.mock("./user-store");
```

### `no-object-parameters`

```ts
function save(value: object) {}
```

### `no-reflect-apply`

```ts
const value = Reflect.apply(operation, owner, args);
```

### `no-reflect-get`

```ts
const value = Reflect.get(owner, key);
```

### `no-runtime-typeof`

```ts
if (typeof input === "string") {
  useName(input);
}
```

Schema-free projects can permit `typeof` checks directly inside type predicate and
assertion functions while continuing to reject ad hoc checks elsewhere:

```json
{
  "anti-slop/no-runtime-typeof": [
    "error",
    { "allowInTypeGuards": true }
  ]
}
```

The option defaults to `false`. Existence probes such as `typeof document === "undefined"` are always allowed because they establish whether a binding exists rather than narrow its representation.

### `no-shape-in-symbol-names`

```ts
interface UserShape {
  id: string;
}
```

Static member reads such as `schema.shape` are allowed because the member name belongs to the value's owner and cannot be renamed locally.

### Effect: `no-service-constructor-imports`

```ts
import { makeIssueService } from "./issue-service.ts";
```

Import the owning Layer and yield `IssueService` instead. Focused `*.test.*` and `*.spec.*` files may import the constructor directly.

### Effect: tagged values and matching

Direct tag checks are rejected by `no-manual-tag-comparison`:

```ts
if (result._tag === "Ready") useReady(result);
```

Use `Predicate.isTagged` for a predicate or `Match` for branching:

```ts
if (Predicate.isTagged("Ready")(result)) useReady(result);
```

Literal tag objects are rejected by `no-manual-tagged-construction`:

```ts
const result = { _tag: "Ready", value };
```

Use the existing Schema, tagged class/error, or `Data.taggedEnum` constructor instead, such as `Ready.make({ value })`. Object patterns passed directly to `Match.when` and `Match.not` remain allowed.

Manual tag branching in broad catch handlers is rejected by `no-manual-effect-error-tag`:

```ts
program.pipe(
  Effect.catch((error) =>
    error._tag === "NotFound" ? recover : Effect.fail(error)
  )
);
```

Use the selective error operator:

```ts
program.pipe(Effect.catchTag("NotFound", () => recover));
```

For a tagged `error.reason`, use `Effect.catchReason` or `Effect.catchReasons`.

Repeated literal ternaries over the same value are rejected by `prefer-effect-match`:

```ts
const label = kind === "a" ? "A" : kind === "b" ? "B" : "Other";
```

Use `Match`:

```ts
const label = Match.value(kind).pipe(
  Match.when("a", () => "A"),
  Match.when("b", () => "B"),
  Match.orElse(() => "Other")
);
```

These rules are syntactic. They recognize direct `Effect.catch*` and `Match.when`/`Match.not` calls under those exact identifiers and do not resolve import aliases or verify that similarly named objects came from Effect. `prefer-effect-match` compares the source text of the repeatedly tested expression; it does not infer its type or prove exhaustiveness.

### `no-unknown-parameters`

```ts
function handle(input: unknown) {}
```

A type predicate may accept `unknown` for the parameter it narrows; other `unknown`
parameters on the same function remain rejected.

### `no-unknown-returns`

```ts
function loadUser(): unknown {
  return input;
}
```

### `no-unknown-type-aliases`

```ts
type ExternalValue = unknown;
```

### `no-unsafe-dictionary-type`

```ts
type Metadata = Record<string, unknown>;
type OtherMetadata = { [key: string]: object };
```

### `no-widen-then-assert`

```ts
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

### `require-readable-spacing`

```ts
export const first = 1;
/** Documentation stays attached to second. */
export const second = 2;
```

Autofix inserts a blank line before the documentation. Adjacent single-line variable declarations stay grouped at any scope, including exported bindings at module scope; a binding that carries its own leading comment starts a new group, as `second` does above. Multiline bindings and control-flow boundaries receive spacing. Adjacent function overload signatures and their implementation remain grouped. Existing blank lines are never removed. The rule takes no options; edit the vendored policy if your team's preferences differ.

Run `oxlint --fix` (or `vp lint --fix`), then your formatter, then lint again. The rule inserts whitespace only; it does not add braces, wrap expressions, sort imports, or infer every logical group. Keep indentation and wrapping with the formatter rather than enabling a competing stylistic preset.

The comment-aware engine is [vendored from ESLint Stylistic](src/vendor/eslint-stylistic/UPSTREAM.md) under MIT. Copy its `LICENSE` and provenance along with the code; no third-party plugin dependency is needed.

### `require-safety-comment-for-type-assertion`

```ts
const userId = value as UserId;
```

Add a specific justification immediately before a necessary assertion:

```ts
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

`SAFETY` remains the default marker. Comments immediately above exported declarations are recognized. Repositories with an established convention can configure one or more alternatives; every marker must still be followed by a colon and a non-empty justification:

```json
{
  "anti-slop/require-safety-comment-for-type-assertion": [
    "error",
    { "markers": ["INVARIANT", "SAFETY"] }
  ]
}
```

## Python

`languages/python/anti_slop.py` supplies seven Pylint/Astroid rules:

- `no-any-parameter` and `no-any-return` (legacy; Ruff ANN401 is the preferred future owner for ordinary signatures);
- `no-unsafe-dictionary-type` (now aware of same-module type aliases);
- `no-chained-cast` and `require-safety-comment-for-cast`;
- `no-any-type-alias` (including PEP 695 `type` statements);
- `no-widen-then-cast` (conservative local evidence-flow check).

The installer preserves Ruff and other type-checking tools. See [the Python guide](languages/python/README.md) for the flow limitations and regression command.

## Rust

`languages/rust/anti-slop-clippy.toml` contains Clippy restrictions, including `allow_attributes_without_reason`. `languages/rust/anti-slop-rust.toml` contains the rustc lint `unsafe_op_in_unsafe_fn`. Install them in their corresponding Cargo `lints.clippy` and `lints.rust` tables. See [the Rust guide](languages/rust/README.md) for workspace inheritance, examples, and profile tests.

The restriction profile rejects undocumented unsafe code, unchecked unwrap/expect paths, panic placeholders, transmute patterns, and broad numeric conversions. Dylint is not required for the current policy.

## Go

`languages/go/` implements five `go/analysis` analyzers:

- broad `any` parameters, returns, and `map[string]any`;
- pointer-to-interface types;
- dynamic `reflect.Value.Call` and `CallSlice`;
- reflection named field/method access;
- direct local widening to `any` followed by an assertion to the original concrete type.

The reflection rules rely on `go/types` identity. Ordinary `reflect.TypeOf` and `reflect.ValueOf` introspection remain allowed. Go analyzer tests use the official `analysistest` framework. The installer resolves a compatible `golang.org/x/tools` release in the target repository; [the Go guide](languages/go/README.md) documents build and run steps.

## Development

```bash
pnpm install
pnpm check
```

`src/` is canonical for TypeScript/JavaScript. `languages/<language>/` is canonical for downstream language extensions. After changing canonical source, run `pnpm sync:skill-assets`; `pnpm check` verifies TypeScript behavior and all bundled asset mirrors.

## License

MIT

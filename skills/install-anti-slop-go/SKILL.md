---
name: install-anti-slop-go
description: Install and configure the Go anti-slop go/analysis multichecker.
---

# Install anti-slop for Go

1. Inspect repository instructions, `git status`, `go.mod`, workspaces, and lint tooling.
2. Copy bundled production files from `assets/anti-slop/` to `tools/anti-slop/`. Review existing destinations before replacement.
3. Initialize a module named `anti-slop-local` if missing, resolve a maintained compatible `golang.org/x/tools` release, and run `go mod tidy`.
4. Build with `go build -o anti-slop ./cmd/anti-slop` from `tools/anti-slop`.
5. Run `./tools/anti-slop/anti-slop ./...` against repository-owned Go packages.
6. Preserve existing golangci-lint, go vet, Staticcheck, and formatter configuration. Keep `containedctx` as a separate maintained linter where applicable.
7. Do not suppress findings or apply semantic autofixes unless the user authorizes a policy change.

The analyzers detect broad `any` contracts, `map[string]any`, pointer-to-interface types, dynamic reflection invocation and named access, and direct known-value widening followed by an assertion back. Inspection-only `reflect.TypeOf` and `reflect.ValueOf` remain allowed.

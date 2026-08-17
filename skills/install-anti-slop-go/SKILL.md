---
name: install-anti-slop-go
description: Install and configure the Go anti-slop go/analysis checker in a local Go repository.
---

# Install anti-slop for Go

1. Inspect repository instructions, `git status`, `go.mod`, workspace files, and existing lint tooling.
2. Copy the bundled `assets/anti-slop/` directory to `tools/anti-slop/`. Review an existing destination before replacing it.
3. Inside `tools/anti-slop`, initialize a local module named `anti-slop-local` when `go.mod` is absent, then resolve the current maintained `golang.org/x/tools` dependency and run `go mod tidy`.
4. Build the checker with `go build -o anti-slop ./cmd/anti-slop` from `tools/anti-slop`.
5. Run the resulting binary from the repository root against owned packages: `./tools/anti-slop/anti-slop ./...`.
6. Preserve existing golangci-lint, go vet, staticcheck, and formatter configuration; anti-slop adds project-specific restrictions rather than replacing them.
7. Report remaining findings without suppressing them unless the user explicitly changes the policy.

The initial analyzer rejects `any` / `interface{}` parameters and returns, `map[string]any` / `map[string]interface{}` contracts, and direct `reflect.*` calls.

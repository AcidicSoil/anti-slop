# Go anti-slop

Go uses the official `golang.org/x/tools/go/analysis` framework and a multichecker binary.

The initial analyzer rejects:

- `any` / `interface{}` function parameters
- `any` / `interface{}` function returns
- `map[string]any` / `map[string]interface{}` contracts
- direct `reflect.*` calls

The installer creates a local module under `tools/anti-slop`, resolves the current `golang.org/x/tools` release, and builds a repository-local checker.

```bash
(cd tools/anti-slop && go mod init anti-slop-local && go get golang.org/x/tools@latest && go mod tidy && go build -o anti-slop ./cmd/anti-slop)
./tools/anti-slop/anti-slop ./...
```

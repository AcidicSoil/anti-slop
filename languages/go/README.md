# Go anti-slop

Go uses `golang.org/x/tools/go/analysis` with a type-aware multichecker.

Analyzers:
- `antislopcontracts`: rejects `any` / `interface{}` parameters and returns, and `map[string]any` contracts.
- `antislopptrinterface`: rejects `*Interface` without banning `*T` when `T` is a type parameter.
- `antislopreflectcall`: rejects dynamic `reflect.Value.Call` and `CallSlice`, but allows `reflect.TypeOf`, `ValueOf`, and ordinary inspection.
- `antislopreflectnamedaccess`: rejects `FieldByName`, `FieldByNameFunc`, and `MethodByName` on standard-library reflection receivers. Unrelated methods with identical names are allowed.
- `antislopwidenassert`: rejects a direct local concrete value widened to `any` and immediately asserted back. Reassignment, escape, control-flow changes, and unknown interfaces are excluded.

For direct development and tests, use the included module:

```bash
(cd languages/go && go test ./... && go build ./cmd/anti-slop)
```

The install skill copies production Go files into a local `tools/anti-slop` module, initializes `anti-slop-local` and resolves a maintained `golang.org/x/tools` version compatible with the target Go toolchain:

```bash
(cd tools/anti-slop && go mod init anti-slop-local && go get golang.org/x/tools@latest && go mod tidy && go build -o anti-slop ./cmd/anti-slop)
./tools/anti-slop/anti-slop ./...
```

These rules have no automated fixes. Keep `go vet`, Staticcheck, and existing golangci-lint checks. Use established `containedctx` tooling for `context.Context` stored in structs rather than adding a duplicate analyzer.

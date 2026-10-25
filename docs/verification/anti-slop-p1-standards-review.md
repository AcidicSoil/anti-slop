# Anti-slop P1: scoped unit-test standards review

Scope: Python Pylint/Astroid semantic rule tests and Rust Clippy profile contract tests. There is no UI, browser, API, database, or HTTP recorder in the changed behavior.

| Standard | Disposition | Task evidence |
| --- | --- | --- |
| testing-unit skill | Applicable | Python test suite and Rust profile fixtures run in real linters |
| data-factories | Not applicable | Tests construct syntax snippets, not domain model graphs or factories |
| data-fixtures | Applicable | Python inline source snippets and Rust temporary fixture crates |
| data-seeding-cleanup | Applicable to isolation; persistent-store seeding not applicable | Python TemporaryDirectory and Rust temporary crates avoid shared state |
| mocking-msw | Not applicable | No browser fetch or HTTP interceptor in the affected tests |
| mocking-vcr | Not applicable | No recorded HTTP interactions in the affected tests |
| unit-aaa-pattern | Applicable | Each Python test arranges source, invokes diagnostics, asserts output |
| unit-fixture-scoping | Applicable | Independent Rust temporary crates and Python temporary source files |
| unit-parametrized | Applicable to Go's unchanged baseline | Existing Go analysistest table drives subtests; new Python/Rust tests use explicit named cases |

Verification (2026-10-25): `uv run --no-project --with pylint python -m unittest discover -s languages/python/tests -p 'test_*.py' -v` passed 15 tests; `uv run --no-project python -m unittest discover -s languages/rust/tests -v` passed 11 tests; `(cd languages/go && go test ./...)` passed. Rust trial on `repogrep` used `cargo clippy --offline --all-targets` with candidate `-W` flags: indexing/slicing diagnostics were noisy, so it was deferred.

This review is scoped evidence. It does not assert project-wide OrchestKit compliance or imply that unrelated MSW/VCR/E2E rules were tested.

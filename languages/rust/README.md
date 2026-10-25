# Rust anti-slop

Rust uses maintained Clippy and rustc lints rather than a custom parser or a Dylint engine.

Merge `anti-slop-clippy.toml` into `[workspace.lints.clippy]` or `[lints.clippy]`.
Merge `anti-slop-rust.toml` into the corresponding `[workspace.lints.rust]` or `[lints.rust]` table. Preserve stronger existing settings and unrelated lints. In workspaces, make member packages inherit workspace lints with `[lints] workspace = true` where needed.

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

The rustc lint `unsafe_op_in_unsafe_fn` requires unsafe operations to use an explicit unsafe block. Clippy's `undocumented_unsafe_blocks` requires the associated safety reasoning, and `allow_attributes_without_reason` requires an explanation for lint suppressions.

The profile also restricts unchecked unwrap/expect paths, panic placeholders, transmutation, and numeric casts. It now denies `wildcard_enum_match_arm` (non-exhaustive matches on owned enums), `panic_in_result_fn` (assertions or panics inside functions returning `Result`), and `unreachable` (`unreachable!()` panic paths). Each has a rejecting and an accepted fixture.

**Trial-first decision (2026-10-25):** `cargo clippy --offline --all-targets` on the real `repogrep` Rust workspace, with all four P1 candidates enabled as warnings, passed but produced numerous `indexing_slicing` warnings in both application code and test assertions (including already-guarded slice boundaries). Leave `indexing_slicing` opt-in rather than default-deny. The other P1 candidates produced no additional warnings on that workspace and passed profile fixtures. `string_slice` and `mem_forget` remain P2 investigation candidates. No Dylint implementation is justified.

Profile contract tests: `uv run --no-project python -m unittest discover -s languages/rust/tests -v`. These tests run small temporary Rust crates through Cargo Clippy.

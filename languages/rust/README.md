# Rust anti-slop

Rust uses maintained Clippy and rustc lints rather than a custom parser or a Dylint engine.

Merge `anti-slop-clippy.toml` into `[workspace.lints.clippy]` or `[lints.clippy]`.
Merge `anti-slop-rust.toml` into the corresponding `[workspace.lints.rust]` or `[lints.rust]` table. Preserve stronger existing settings and unrelated lints. In workspaces, make member packages inherit workspace lints with `[lints] workspace = true` where needed.

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

The rustc lint `unsafe_op_in_unsafe_fn` requires unsafe operations to use an explicit unsafe block. Clippy's `undocumented_unsafe_blocks` requires the associated safety reasoning, and `allow_attributes_without_reason` requires an explanation for lint suppressions.

The profile also restricts unchecked unwrap/expect paths, panic placeholders, transmutation, and numeric casts. More invasive restrictions such as `indexing_slicing` and `string_slice` require validation on representative codebases before enabling them by default.

Profile contract tests: `uv run --no-project python -m unittest discover -s languages/rust/tests -v`. These tests run small temporary Rust crates through Cargo Clippy.

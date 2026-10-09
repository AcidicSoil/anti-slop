---
name: install-anti-slop-rust
description: Install and configure the Rust anti-slop Clippy and rustc restriction profiles in a local Rust repository.
---

# Install anti-slop for Rust

1. Inspect repository instructions, `git status`, `Cargo.toml`, workspace structure, `clippy.toml`, and existing lint tables.
2. Keep the repository's existing Rust toolchain and Clippy; do not add another parser.
3. Merge `assets/anti-slop-clippy.toml` into `[workspace.lints.clippy]` or `[lints.clippy]`. Merge `assets/anti-slop-rust.toml` into `[workspace.lints.rust]` or `[lints.rust]`. Preserve stronger existing lint levels.
4. Where workspace lint inheritance is used, ensure relevant member packages explicitly opt in with `[lints] workspace = true`.
5. Run `cargo clippy --all-targets --all-features -- -D warnings` and the repository's existing Rust tests/checks.
6. Fix findings only on request; prefer explicit error propagation, checked conversions, documented unsafe blocks, and reasoned lint suppressions.
7. Only add Dylint for policies that maintained rustc and Clippy tooling cannot express.

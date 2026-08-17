---
name: install-anti-slop-rust
description: Install and configure the Rust anti-slop Clippy restriction profile in a local Rust repository.
---

# Install anti-slop for Rust

1. Inspect repository instructions, `git status`, `Cargo.toml`, workspace structure, `clippy.toml`, and existing lint tables.
2. Use the repository's existing Rust toolchain and Clippy. Do not add a second parser or duplicate maintained Clippy rules.
3. Read `assets/anti-slop-clippy.toml` and merge each entry into `[workspace.lints.clippy]` for a workspace or `[lints.clippy]` for a single package. Preserve unrelated lint settings and stronger existing levels.
4. For workspace lint inheritance, ensure member packages opt into workspace lints only where the repository's current Cargo layout requires it.
5. Run `cargo clippy --all-targets --all-features -- -D warnings` plus the repository's existing Rust test/check commands.
6. Fix findings only when requested. Prefer explicit error propagation, checked conversions, documented unsafe invariants, and named domain types.
7. Add Dylint only for a future rule that Clippy cannot express; do not introduce Dylint merely to mirror existing Clippy lints.

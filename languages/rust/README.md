# Rust anti-slop

Rust starts with Clippy restriction lints instead of duplicating checks already maintained by the Rust project.

Merge the entries from `anti-slop-clippy.toml` into `[workspace.lints.clippy]` or `[lints.clippy]`, preserving existing lint settings, then run:

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

The profile rejects common evidence escapes: unchecked unwrap/expect paths, panic placeholders, undocumented unsafe blocks, unsafe transmute patterns, and broad `as` conversions.

Custom Dylint rules should only be added when a policy cannot be represented by Clippy.

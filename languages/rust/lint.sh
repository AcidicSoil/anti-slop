#!/usr/bin/env bash
set -euo pipefail

profile_dir="tools/anti-slop/rust"
clippy_flags=()
rust_flags=()
while read -r lint severity; do
  [[ "$severity" == '"deny"' ]] && clippy_flags+=("-D" "clippy::$lint")
done < <(awk -F ' = ' '/^[a-z_]+ = "deny"$/ {print $1, $2}' "$profile_dir/anti-slop-clippy.toml")
while read -r lint severity; do
  [[ "$severity" == '"deny"' ]] && rust_flags+=("-D" "$lint")
done < <(awk -F ' = ' '/^[a-z_]+ = "deny"$/ {print $1, $2}' "$profile_dir/anti-slop-rust.toml")

cargo clippy --all-targets --all-features -- -D warnings "${clippy_flags[@]}" "${rust_flags[@]}"

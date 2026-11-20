#!/usr/bin/env bash
set -euo pipefail

tmp_binary="$(mktemp)"
trap 'rm -f "$tmp_binary"' EXIT
(cd tools/anti-slop && go build -o "$tmp_binary" ./cmd/anti-slop)
"$tmp_binary" "${@:-./...}"

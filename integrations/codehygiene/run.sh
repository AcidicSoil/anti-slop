#!/usr/bin/env bash
set -euo pipefail

exec uvx --from 'git+https://github.com/brianbell-x/codehygiene@2ec03172f47f14655c1490540c2f593b77095807' codehygiene --no-update-check "$@"

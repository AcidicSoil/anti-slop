#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="$PWD${PYTHONPATH:+:$PYTHONPATH}"
exec uvx --from pylint==4.1.4 pylint \
  --load-plugins=tools.pylint.anti_slop \
  --disable=all \
  --enable=E9701,E9702,E9703,E9704,E9705,E9706,E9707,E9708,E9709 \
  "${@:-.}"

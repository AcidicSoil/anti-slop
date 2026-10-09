# Python anti-slop

Python uses project-local Pylint/Astroid rules for checks not supplied by Ruff. Keep Ruff and the project's type checker for built-in analysis.

Rules:
- `no-any-parameter` and `no-any-return` (legacy Pylint checks; Ruff ANN401 covers ordinary signature `Any` and is the preferred long-term owner)
- `no-unsafe-dictionary-type` (including same-module `Any` aliases)
- `no-chained-cast`
- `require-safety-comment-for-cast`
- `no-any-type-alias` (direct and local alias chains)
- `no-widen-then-cast` (straight-line known local widened to `Any` and cast back)

Install Pylint with the existing Python package manager, copy `anti_slop.py` to `tools/pylint/anti_slop.py`, and run:

```bash
pylint --load-plugins tools.pylint.anti_slop <owned-python-paths>
```

A necessary cast must document a checked invariant immediately above it:

```python
# SAFETY: parse_user_id validated the value before branding it.
user_id = cast(UserId, value)
```

Local alias resolution stops on unknown imported aliases and cycles. Widen/cast detection reports only straight-line same-function flows with a matching known source type; uncertain reassignment or escape is not reported. Do not treat a lack of diagnostics as a proof of type safety.

Run the regression suite from the repository root:

```bash
uv run --no-project --with pylint python -m unittest discover -s languages/python/tests -p 'test_*.py' -v
```

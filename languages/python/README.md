# Python anti-slop

Python uses project-local Pylint/Astroid rules for checks not supplied by Ruff. Keep Ruff and the project's type checker for built-in analysis.

Rules:
- `no-any-parameter` and `no-any-return` (legacy Pylint checks; Ruff ANN401 covers ordinary signature `Any` and is the preferred long-term owner)
- `no-unsafe-dictionary-type` (including same-module `Any` aliases)
- `no-chained-cast`
- `require-safety-comment-for-cast`
- `no-any-type-alias` (direct and local alias chains)
- `no-widen-then-cast` (straight-line known local widened to `Any` and cast back)
- `no-conditional-empty-dict-unpack` (conditional `**` unpack with a literal `{}` branch)
- `no-known-value-widening` (local `Any` annotated with a provably known value; excludes uncertain imports/reassignments)

Install Pylint with the existing Python package manager, copy `anti_slop.py` to `tools/pylint/anti_slop.py`, and run:

```bash
pylint --load-plugins tools.pylint.anti_slop <owned-python-paths>
```

A necessary cast must document a checked invariant immediately above it:

```python
# SAFETY: parse_user_id validated the value before branding it.
user_id = cast(UserId, value)
```

Local alias resolution stops on unknown imported aliases and cycles. Widen/cast detection reports only straight-line same-function flows with a matching known source type; uncertain reassignment or escape is not reported. Known-local widening is restricted to unambiguous local values and explicitly known classes/functions, without treating imported aliases as concrete evidence. Do not treat a lack of diagnostics as proof of type safety.

### Ruff ANN401 coverage audit (Ruff 0.14.5, 2026-10-25)

A direct `ruff check --isolated --select ANN401` probe was compared with the existing Pylint checks and a Python signature regression fixture:

| Signature form | Ruff ANN401 | Anti-slop Pylint |
| --- | --- | --- |
| Direct `Any` parameter/return | Detected | Detected |
| `*args: Any`, `**kwargs: Any` | Detected | Detected |
| Nested `list[Any]` parameter/return | Not detected | Detected |
| Same-module alias to `Any` parameter/return | Not detected | Detected |
| `dict[str, Any]` parameter/return | Not detected | Detected by `no-unsafe-dictionary-type` |

Keep `no-any-parameter`, `no-any-return`, and `no-unsafe-dictionary-type` enabled. Replacing these checks with ANN401 alone loses nested and alias coverage. Ruff remains the preferred built-in companion where its checks are equivalent; migration requires proven parity and installer support.

Run the regression suite from the repository root:

```bash
uv run --no-project --with pylint python -m unittest discover -s languages/python/tests -p 'test_*.py' -v
```

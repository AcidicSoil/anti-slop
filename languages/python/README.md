# Python anti-slop

Python uses a project-local Pylint checker because Ruff does not expose third-party custom rule plugins.

Rules:

- `no-any-parameter`
- `no-any-return`
- `no-unsafe-dictionary-type`
- `no-chained-cast`
- `require-safety-comment-for-cast`

Install Pylint with the repository's existing Python package manager, copy `anti_slop.py` to `tools/pylint/anti_slop.py`, then run:

```bash
pylint --load-plugins tools.pylint.anti_slop <owned-python-paths>
```

A necessary cast must document the checked invariant immediately above it:

```python
# SAFETY: parse_user_id validated the value before branding it.
user_id = cast(UserId, value)
```

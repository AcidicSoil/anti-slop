---
name: install-anti-slop-python
description: Install and configure native Python anti-slop Pylint checks in a local Python repository.
---

# Install anti-slop for Python

1. Inspect repository instructions, `git status`, `pyproject.toml`, lockfiles, and existing Ruff/Pylint/type-checker configuration.
2. Keep Ruff and the existing type checker. Ruff should own mature built-in checks, including ANN401 for `Any` signatures, but keep the legacy Pylint `no-any-parameter` and `no-any-return` checks during migrations to avoid silently weakening enforcement.
3. Copy `assets/anti_slop.py` to `tools/pylint/anti_slop.py`. Review any customized destination before overwriting it.
4. Install maintained Pylint using the existing Python package manager.
5. Add `tools.pylint.anti_slop` to the project's plugin configuration or lint command, preserving other lint settings.
6. Run Pylint on owned Python source and the existing formatter/type-check commands.
7. Fix findings only when requested. Preserve precise types rather than replacing them with another broad type.

Rules: `no-any-parameter`, `no-any-return`, `no-unsafe-dictionary-type`, `no-chained-cast`, `require-safety-comment-for-cast`, `no-any-type-alias`, and `no-widen-then-cast`. Evidence-flow checks are conservative and do not infer types across unknown imported aliases or arbitrary control flow.

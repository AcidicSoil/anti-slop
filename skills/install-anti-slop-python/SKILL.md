---
name: install-anti-slop-python
description: Install and configure the Python anti-slop Pylint checker in a local Python repository.
---

# Install anti-slop for Python

1. Inspect repository instructions, `git status`, `pyproject.toml`, lockfiles, and existing Ruff/Pylint/type-checker configuration.
2. Keep Ruff and existing type checking. Do not replace them. Use Pylint only for the custom anti-slop rules Ruff cannot load as third-party plugins.
3. Copy `assets/anti_slop.py` from this skill to `tools/pylint/anti_slop.py`. Refuse to overwrite an existing customized copy until its diff is reviewed.
4. Install the current maintained Pylint release with the repository's existing Python package manager. Prefer an already-installed Pylint dependency when compatible.
5. Add `tools.pylint.anti_slop` to the repository's Pylint plugin configuration or lint command. Preserve unrelated lint settings.
6. Run Pylint on owned Python source plus the repository's existing formatter/type-check commands.
7. Fix findings only when requested. Do not weaken the rules or replace precise contracts with another broad type.

Rules: `no-any-parameter`, `no-any-return`, `no-unsafe-dictionary-type`, `no-chained-cast`, and `require-safety-comment-for-cast`.

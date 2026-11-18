# CodeHygiene companion (opt-in)

[CodeHygiene](https://github.com/brianbell-x/codehygiene) adds an experimental, local structural-readability check alongside anti-slop's deterministic linters. It covers TypeScript, JavaScript, Python, Rust, Go, and other supported languages. It does not replace formatters, typechecks, security checks, or tests.

This Stackforge setup **only stages** the launcher and this guide. No checks, hooks, CI jobs, or package scripts are enabled by applying it. The runner invokes an exact upstream Git revision with `uvx` (requires [uv](https://docs.astral.sh/uv/)); the first run downloads and caches the upstream Python package and NumPy.

## Install through Stackforge

```bash
stackforge setup sync anti-slop
stackforge setup apply anti-slop/codehygiene --target /path/to/project --dry-run
stackforge setup apply anti-slop/codehygiene --target /path/to/project
```

Review the dry-run before applying; Stackforge preserves differing project-owned files as conflicts.

## Run on the code you touched

From the consuming project's root:

```bash
# Review a newly written or changed file without failing the command on findings.
bash tools/anti-slop/codehygiene/run.sh src/changed.ts

# Use structured output for a code review.
bash tools/anti-slop/codehygiene/run.sh src/changed.ts --json

# Explicitly opt in to blocking on diagnostics (default threshold: 0.55).
bash tools/anti-slop/codehygiene/run.sh src/changed.ts --check
```

Pass multiple changed files as separate paths. For existing files, inspect only diagnostics on lines changed by your work. Avoid running against `.` or entire legacy directories. Run syntax, type, and targeted behavior tests first; use CodeHygiene to review readability, not as a substitute.

The upstream project is an **early preview** with possible false positives. Review each finding rather than reflexively refactoring. Keep an existing project's enforced rules authoritative if suggestions conflict, and do not enable `--check` in CI until the project has explicitly chosen that policy.

For updates, review the upstream version and revise the pinned Git revision in `run.sh` and the provenance record in the anti-slop producer repository. Then refresh the `anti-slop` Stackforge source and preview installation updates before applying them.

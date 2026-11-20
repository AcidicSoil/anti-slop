---
name: install-anti-slop-css
description: Vendor Stylelint CSS architecture rules into an existing frontend codebase and remediate existing monolithic stylesheets.
---

# Install CSS anti-slop

1. Inspect project styles, repository guidance, existing Stylelint config, CSS Modules conventions, and `git status`. Do not replace existing tooling.
2. From the consuming project root, run `node <installed-skill-path>/scripts/install.mjs [destination]`; default destination is `tools/stylelint/anti-slop-css` under the consuming project's working directory. The installer refuses overwrites.
3. Install compatible `stylelint` and `stylelint-config-standard` with the existing package manager. For Tailwind projects using the strict preset, migrate existing CSS Modules into owning components first.
4. For Tailwind v4, merge the strict `references/stylelint.config.mjs` with existing config and retain its exact two-file CSS allowlist. It rejects CSS Modules by default. For non-Tailwind projects use the generic plugin rules with project-specific ownership instead; do not force the Tailwind preset.
5. Run Stylelint against every project-owned CSS file. Prioritize CSS Modules and excess/global stylesheets for component-owned migration. Update imports, then check computed styles, responsive behavior, and screenshots before deleting declarations. Avoid permanent suppressions.
6. Add the same Stylelint checks to the existing CI quality command, verify they pass, and document remaining migration items.
7. For work editing actual styles, read the installed `~/.agents/skills/good-css/SKILL.md` if available and its relevant references. When text styling changes, also read `~/.agents/skills/better-typography/SKILL.md`. Match the project's current styling system and approved design; do not invent rules, automatically install missing skills, or convert Tailwind to StyleX as a CSS lint cleanup. These are guidance, not automated Stylelint checks.

Rule implementation is in `assets/anti-slop-css`. Source and remediation guide: `languages/css/README.md` in the upstream repository. Do not auto-split CSS; it can change the cascade.

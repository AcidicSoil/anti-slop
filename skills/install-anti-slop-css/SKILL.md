---
name: install-anti-slop-css
description: Vendor Stylelint CSS architecture rules into an existing frontend codebase and remediate existing monolithic stylesheets.
---

# Install CSS anti-slop

1. Inspect project styles, repository guidance, existing Stylelint config, CSS Modules conventions, and `git status`. Do not replace existing tooling.
2. From the consuming project root, run `node <installed-skill-path>/scripts/install.mjs [destination]`; default destination is `tools/stylelint/anti-slop-css` under the consuming project's working directory. The installer refuses overwrites.
3. Install compatible `stylelint` and `stylelint-config-standard` with the existing package manager. Preserve framework-specific CSS/SCSS configurations.
4. Merge the rules from this skill's `references/stylelint.config.mjs` with the project's config. Set `sourceRoots`, `ownerDirectories`, `scopedSuffixes`, `allowedGlobalDirectories`, `allowedGlobalFiles`, and `featureRoot` to match the real architecture. Never blindly copy the example's paths or assume CSS Modules is always in use.
5. Run Stylelint on owned CSS. Record all existing diagnostics and prioritize existing large/global stylesheets for incremental ownership-based extraction. Update CSS imports and check computed styles, responsive behavior, and visual screenshots before deleting old declarations. Avoid permanent suppressions.
6. Add the same Stylelint checks to the existing CI quality command, verify they pass, and document remaining migration items.

Rule implementation is in `assets/anti-slop-css`. Source and remediation guide: `languages/css/README.md` in the upstream repository. Do not auto-split CSS; it can change the cascade.

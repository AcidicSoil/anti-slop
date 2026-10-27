# Enhanced @shadcn/lint provenance

- Pristine upstream: https://github.com/shadcn-ui/lint.git
- Verified starting source revision: `bceee0f` (shadcn-ui/lint; original six rules).
- Enhanced implementation checkout: `/home/user/projects/temp/ai-apps/.personal-projects/shadcn-lint-good-css` (build input only, not a distribution-time path).
- Local patch commits: `30d9f9e` and `199568c` (13 additional rules and shared coverage matrix).
- Distributed package name: `@shadcn/lint`, locally versioned `0.2.3-anti-slop.1`.
- Packaged files: `integrations/shadcn-lint/package/` (built ESM/types, manifest, original MIT license).
- Source snapshot: `integrations/shadcn-lint/source/` (post-patch source at `199568c` for future review and upstream merges).
- Dependencies: original upstream `cn@0.4.0`, `@eslint/core@^0.17.0`, and optional original ESLint parser peers; preserved in local package metadata.

This is not published upstream or to the public npm registry. `Stackforge` copies the tested package into each consumer and adds a local `file:` dev dependency; consumers do not need access to the original build checkout. Stackforge source sync pulls the anti-slop repository's committed package, not the unpublished upstream feature branch.

**Maintenance:** No automatic version bump is implied by an upstream release. Preserve the source base and local patch independently; rerun the shadcn/lint upstream tests, package build, anti-slop integration tests and Stackforge consumer installation. Treat incoming upstream changes as a reviewed merge, not a directory replacement.

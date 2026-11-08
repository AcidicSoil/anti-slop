# StyleX design-system package provenance

Canonical source: `../eslint-plugin-stylex-design-system/` in the local project collection.
The distributable at `package/` is a snapshot of its working source and production
dependencies as of 2026-11-07. The source checkout contained uncommitted changes
at packaging time, so no upstream commit uniquely identifies this snapshot.

The standalone source remains authoritative. When updating, copy its `src/` files
and production dependencies into this package, then run the anti-slop StyleX
integration tests and a fresh Stackforge consumer test. Do not edit a second
StyleX rule implementation in anti-slop.

This package is bundled with Stackforge's `anti-slop/stylex` setup and installed
as a local `file:` dependency. The official StyleX ESLint plugin is a peer
dependency and is supplied by the same setup.

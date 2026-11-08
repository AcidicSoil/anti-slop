import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../../..");
const manifest = readFileSync(resolve(root, "stackforge.setups.toml"), "utf8");
const distribution = resolve(root, "integrations/stylex-design-system/package");

test("Stackforge distributes the authoritative StyleX plugin", () => {
  assert.match(manifest, /\[setups\.stylex\]/);
  assert.match(manifest, /"eslint-plugin-stylex-design-system"\s*=\s*"file:tools\/eslint\/stylex-design-system"/);
  assert.match(manifest, /"tools\/eslint\/stylex-design-system"\s*=\s*"integrations\/stylex-design-system\/package"/);
  assert.doesNotMatch(manifest, /anti-slop-stylex/);
  const pkg = JSON.parse(readFileSync(resolve(distribution, "package.json"), "utf8"));
  assert.equal(pkg.name, "eslint-plugin-stylex-design-system");
  assert.ok(existsSync(resolve(distribution, "src/index.js")));
  assert.ok(existsSync(resolve(distribution, "src/rules/require-tokens.js")));
});

test("existing setup uses five custom and four official StyleX rules", () => {
  const config = readFileSync(resolve(root, "languages/stylex/oxlint.config.example.ts"), "utf8");
  for (const name of ["no-component-restyle", "require-color-tokens", "require-scale-tokens", "no-inline-styles", "require-analyzable-styles"]) {
    assert.ok(config.includes("stylex-design-system/" + name), name);
  }
  for (const name of ["valid-styles", "valid-shorthands", "no-conflicting-props", "no-lookahead-selectors"]) {
    assert.ok(config.includes("@stylexjs/" + name), name);
  }
  assert.doesNotMatch(config, /prefer-design-tokens|cssVariablePrefix/);
  assert.equal(existsSync(resolve(root, "languages/stylex/rules/prefer-design-tokens.mjs")), false);
});

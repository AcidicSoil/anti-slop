import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const oxlint = join(root, "node_modules/.bin/oxlint");
const tokenPlugin = fileURLToPath(new URL("../index.mjs", import.meta.url));
const tokenOptions = {
  tokenModules: ["@/styles/tokens.stylex"],
  cssVariablePrefix: "--app-",
};

test("Oxlint consumer example registers native and anti-slop StyleX rules", () => {
  const example = readFileSync(new URL("../oxlint.config.example.ts", import.meta.url), "utf8");
  assert.match(example, /@stylexjs\/eslint-plugin/);
  assert.match(example, /anti-slop-stylex\/prefer-design-tokens/);
  assert.match(example, /no-conflicting-props/);
});

test("Oxlint reports native StyleX and anti-slop token violations together", () => {
  const directory = mkdtempSync(join(root, ".anti-slop-stylex-"));
  try {
    const config = join(directory, ".oxlintrc.json");
    const filename = join(directory, "invalid.jsx");
    writeFileSync(config, JSON.stringify({
      jsPlugins: [
        "@stylexjs/eslint-plugin",
        { name: "anti-slop-stylex", specifier: tokenPlugin },
      ],
      rules: {
        "@stylexjs/valid-styles": "error",
        "anti-slop-stylex/prefer-design-tokens": ["error", tokenOptions],
      },
    }));
    writeFileSync(filename, 'import * as stylex from "@stylexjs/stylex"; export const styles = stylex.create({ root: { colorr: "red", color: "#f00" } });\n');

    const invalid = spawnSync(oxlint, ["--config", config, "--format", "json", filename], {
      encoding: "utf8",
      timeout: 30000,
    });
    assert.ifError(invalid.error);
    assert.equal(invalid.status, 1, invalid.stderr);
    const violations = JSON.parse(invalid.stdout).diagnostics.map((item) => item.code);
    assert.ok(violations.includes("@stylexjs(valid-styles)"), invalid.stdout);
    assert.ok(violations.includes("anti-slop-stylex(prefer-design-tokens)"), invalid.stdout);

    const valid = join(directory, "valid.jsx");
    writeFileSync(valid, 'import * as stylex from "@stylexjs/stylex"; import { vars } from "@/styles/tokens.stylex"; export const styles = stylex.create({ root: { color: vars.primary, backgroundColor: "var(--app-surface)" } });\n');
    const clean = spawnSync(oxlint, ["--config", config, "--format", "json", valid], {
      encoding: "utf8",
      timeout: 30000,
    });
    assert.ifError(clean.error);
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    assert.deepEqual(JSON.parse(clean.stdout).diagnostics, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

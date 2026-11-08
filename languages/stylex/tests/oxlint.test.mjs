import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const oxlint = join(root, "node_modules/.bin/oxlint");
const tokenOptions = { tokenModules: ["@/styles/tokens.stylex"] };

test("Oxlint configuration enables all five policies and four official rules", () => {
  const source = readFileSync(new URL("../oxlint.config.example.ts", import.meta.url), "utf8");
  for (const name of ["no-component-restyle", "require-color-tokens", "require-scale-tokens", "no-inline-styles", "require-analyzable-styles"]) {
    assert.ok(source.includes("stylex-design-system/" + name), name);
  }
  for (const name of ["valid-styles", "valid-shorthands", "no-conflicting-props", "no-lookahead-selectors"]) {
    assert.ok(source.includes("@stylexjs/" + name), name);
  }
  assert.doesNotMatch(source, /cssVariablePrefix|prefer-design-tokens/);
});

test("Oxlint reports native and authoritative token violations together", () => {
  const directory = mkdtempSync(join(root, ".anti-slop-stylex-"));
  try {
    const config = join(directory, ".oxlintrc.json");
    writeFileSync(config, JSON.stringify({
      jsPlugins: ["@stylexjs/eslint-plugin", "eslint-plugin-stylex-design-system"],
      rules: {
        "@stylexjs/valid-styles": "error",
        "stylex-design-system/require-color-tokens": ["error", tokenOptions],
      },
    }));
    const source = join(directory, "invalid.jsx");
    writeFileSync(source, 'import * as stylex from "@stylexjs/stylex"; export const s=stylex.create({root:{colorr:"red",color:"#f00",backgroundColor:"var(--app-surface)"}});\n');

    const invalid = spawnSync(oxlint, ["--config", config, "--format", "json", source], {
      encoding: "utf8", timeout: 30000,
    });
    assert.ifError(invalid.error);
    assert.equal(invalid.status, 1, invalid.stderr);
    const codes = JSON.parse(invalid.stdout).diagnostics.map(({ code }) => code);
    assert.ok(codes.includes("@stylexjs(valid-styles)"), invalid.stdout);
    assert.equal(codes.filter((code) => code === "stylex-design-system(require-color-tokens)").length, 2, invalid.stdout);

    const valid = join(directory, "valid.jsx");
    writeFileSync(valid, 'import * as stylex from "@stylexjs/stylex"; import { colors } from "@/styles/tokens.stylex"; export const s=stylex.create({root:{color:colors.primary,backgroundColor:"transparent"}});\n');
    const clean = spawnSync(oxlint, ["--config", config, "--format", "json", valid], {
      encoding: "utf8", timeout: 30000,
    });
    assert.ifError(clean.error);
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    assert.deepEqual(JSON.parse(clean.stdout).diagnostics, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { ESLint } from "eslint";
import stylex from "@stylexjs/eslint-plugin";
import designSystem from "eslint-plugin-stylex-design-system";
import { plugin as shadcn } from "@shadcn/lint";

const tokenOptions = { tokenModules: ["@/styles/tokens.stylex"] };

async function lint(code, rules) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      files: ["**/*.{js,jsx}"],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@stylexjs": stylex, "stylex-ds": designSystem, shadcn },
      rules,
    }],
  });
  return (await eslint.lintText(code, { filePath: "src/Button.jsx" }))[0].messages.map(({ ruleId }) => ruleId);
}

test("official StyleX rules keep detecting invalid declarations", async () => {
  const source = 'import * as stylex from "@stylexjs/stylex"; const s=stylex.create({root:{colorr:"red"}});';
  assert.deepEqual(await lint(source, { "@stylexjs/valid-styles": "error" }), ["@stylexjs/valid-styles"]);
});

test("token rule accepts imported tokens and keywords", async () => {
  const source = 'import * as stylex from "@stylexjs/stylex"; import { colors } from "@/styles/tokens.stylex"; const s=stylex.create({root:{color:colors.primary,backgroundColor:"transparent"}});';
  assert.deepEqual(await lint(source, { "stylex-ds/require-color-tokens": ["error", tokenOptions] }), []);
});

test("token rule rejects raw colors and raw CSS variables", async () => {
  const source = 'import * as stylex from "@stylexjs/stylex"; const s=stylex.create({root:{color:"#f00",backgroundColor:"var(--app-surface)"}});';
  assert.deepEqual(await lint(source, { "stylex-ds/require-color-tokens": ["error", tokenOptions] }),
    ["stylex-ds/require-color-tokens", "stylex-ds/require-color-tokens"]);
});

test("stylex token rule excludes unrelated objects", async () => {
  assert.deepEqual(await lint('const css={color:"#f00"};', {
    "stylex-ds/require-color-tokens": ["error", tokenOptions],
  }), []);
});

test("component overrides and arbitrary scale values are detected", async () => {
  const source = 'import * as stylex from "@stylexjs/stylex"; import { Button } from "@/components/ui/button"; const s=stylex.create({bad:{backgroundColor:"red",padding:13}}); const el=<Button sx={s.bad}/>;';
  const result = await lint(source, {
    "stylex-ds/no-component-restyle": ["error", { componentImports: ["@/components/ui"], allow: ["layout"] }],
    "stylex-ds/require-scale-tokens": "error",
  });
  assert.ok(result.includes("stylex-ds/no-component-restyle"));
  assert.ok(result.includes("stylex-ds/require-scale-tokens"));
});

test("shadcn inline-style enforcement remains unchanged for mixed JSX", async () => {
  const rules = { "shadcn/no-inline-styles": "error" };
  assert.deepEqual(await lint('import * as stylex from "@stylexjs/stylex"; const s=stylex.create({root:{color:"red"}}); const X=()=> <div {...stylex.props(s.root)}/>;', rules), []);
  assert.deepEqual(await lint('const X=()=> <div style={{color:"red"}}/>;', rules), ["shadcn/no-inline-styles"]);
});

test("unresolved component styling is rejected", async () => {
  const result = await lint('import { Button } from "@/components/ui/button"; const X=()=> <Button sx={missingStyle}/>;', {
    "stylex-ds/require-analyzable-styles": ["error", { componentImports: ["@/components/ui"] }],
  });
  assert.deepEqual(result, ["stylex-ds/require-analyzable-styles"]);
});

test("StyleX's own inline-style rule catches direct inline styles", async () => {
  const result = await lint('const X=()=> <div style={{color:"red"}}/>;', {
    "stylex-ds/no-inline-styles": "error",
  });
  assert.deepEqual(result, ["stylex-ds/no-inline-styles"]);
});

test("Stackforge setup stays opt-in and preserves configs", () => {
  const manifest = readFileSync(new URL("../../../stackforge.setups.toml", import.meta.url), "utf8");
  assert.match(manifest, /\[setups\.stylex\]/);
  assert.match(manifest, /"@stylexjs\/eslint-plugin"/);
  assert.doesNotMatch(manifest, /"eslint\.config\.(?:mjs|js|ts)"\s*=/);
});

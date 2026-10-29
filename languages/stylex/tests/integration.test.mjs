import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { ESLint } from "eslint";
import stylex from "@stylexjs/eslint-plugin";
import { plugin as shadcn } from "@shadcn/lint";
import antiSlopStylex from "../index.mjs";

const tokenOptions = {
  tokenModules: ["@/styles/tokens.stylex"],
  cssVariablePrefix: "--app-",
};

async function lint(code, rules, filename = "src/Button.jsx") {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      files: ["**/*.{js,jsx}"],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@stylexjs": stylex, shadcn, "anti-slop-stylex": antiSlopStylex },
      rules,
    }],
  });
  return (await eslint.lintText(code, { filePath: filename }))[0].messages.map(({ ruleId }) => ruleId);
}

test("native StyleX lint detects invalid styles without CSS parsing", async () => {
  const code = 'import * as stylex from "@stylexjs/stylex"; const s = stylex.create({ root: { colorr: "red" } });';
  assert.deepEqual(await lint(code, { "@stylexjs/valid-styles": "error" }), ["@stylexjs/valid-styles"]);
});

test("mixed StyleX spread leaves shadcn inline-style check enabled", async () => {
  const code = 'import * as stylex from "@stylexjs/stylex"; const s = stylex.create({ root: { color: "red" } }); const X = () => <div {...stylex.props(s.root)} className="w-full" />;';
  assert.deepEqual(await lint(code, { "@stylexjs/valid-styles": "error", "shadcn/no-inline-styles": "error" }), []);
});

test("explicit styles still fail; no blanket shadcn exemption", async () => {
  const rules = { "shadcn/no-inline-styles": "error" };
  assert.deepEqual(await lint('const X = () => <div style={{color: "#f00"}} />;', rules), ["shadcn/no-inline-styles"]);
  assert.deepEqual(await lint('import * as stylex from "@stylexjs/stylex"; const s = stylex.create({root:{color:"red"}}); const X = () => <div style={stylex.props(s.root).style} />;', rules), ["shadcn/no-inline-styles"]);
});

test("StyleX colors use shared CSS variables or imported theme tokens", async () => {
  const rule = { "anti-slop-stylex/prefer-design-tokens": ["error", tokenOptions] };
  const prefix = 'import * as stylex from "@stylexjs/stylex"; ';
  const ok = prefix + 'import { vars } from "@/styles/tokens.stylex"; const s=stylex.create({root:{color:vars.primary,backgroundColor:"var(--app-surface)",borderColor:"transparent",":hover":{color:"var(--app-text)"}}});';
  assert.deepEqual(await lint(ok, rule), []);
  const invalid = prefix + 'const s=stylex.create({root:{color:"#f00",backgroundColor:"red",":hover":{borderColor:"rgb(255,0,0)"}}});';
  assert.deepEqual(await lint(invalid, rule), Array(3).fill("anti-slop-stylex/prefer-design-tokens"));
});

test("unknown token origins and non-contract CSS variables are rejected", async () => {
  const code = 'import * as stylex from "@stylexjs/stylex"; import { other } from "unrelated"; const s=stylex.create({root:{color:other.primary,backgroundColor:"var(--other-color)"}});';
  assert.deepEqual(await lint(code, { "anti-slop-stylex/prefer-design-tokens": ["error", tokenOptions] }), Array(2).fill("anti-slop-stylex/prefer-design-tokens"));
});

test("unrelated objects and non-StyleX style props do not trigger StyleX token rule", async () => {
  const code = 'const css={color:"#f00"}; const X=()=> <div style={{ color: "red" }} />;';
  assert.deepEqual(await lint(code, { "anti-slop-stylex/prefer-design-tokens": ["error", tokenOptions] }), []);
});

test("StyleX Stackforge setup remains opt-in and does not replace existing lint config", () => {
  const manifest = readFileSync(new URL("../../../stackforge.setups.toml", import.meta.url), "utf8");
  assert.match(manifest, /\[setups\.stylex\]/);
  assert.match(manifest, /"@stylexjs\/eslint-plugin"/);
  assert.doesNotMatch(manifest, /"eslint\.config\.(?:mjs|js|ts)"\s*=/);
});

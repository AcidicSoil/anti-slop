import assert from "node:assert/strict";
import { test } from "node:test";
import stylelint from "stylelint";
import rules from "../index.mjs";

async function warnings(rule, option, code, codeFilename) {
  const { results } = await stylelint.lint({
    code,
    codeFilename,
    config: {
      plugins: rules,
      rules: { [`anti-slop-css/${rule}`]: option },
    },
  });
  assert.equal(results[0].parseErrors.length, 0);
  return results[0].warnings.map(({ rule: name, text }) => {
    assert.equal(name, `anti-slop-css/${rule}`);
    return text;
  });
}

const base = {
  sourceRoots: ["src"],
  ownerDirectories: ["features", "components"],
  scopedSuffixes: [".module.css"],
  allowedGlobalDirectories: ["src/styles"],
  allowedGlobalFiles: ["src/app.css"],
};

test("max-stylesheet-size rejects files over configured line count only", async () => {
  assert.equal((await warnings("max-stylesheet-size", 2, ".a {}\n.b {}", "src/a.css")).length, 0);
  assert.equal((await warnings("max-stylesheet-size", 2, ".a {}\n.b {}\n.c {}\n", "src/a.css")).length, 1);
  assert.equal((await warnings("max-stylesheet-size", 2, ".a {}\r\n.b {}\r\n", "src/a.css")).length, 0);
});

test("max-stylesheet-size warns before the hard limit", async () => {
  const config = {
    plugins: rules,
    rules: { "anti-slop-css/max-stylesheet-size": [5, { warningAt: 3 }] },
  };
  for (const [count, severity] of [[3, null], [4, "warning"], [6, "error"]]) {
    const { results } = await stylelint.lint({
      code: Array.from({ length: count }, () => ".a {}").join("\n"),
      codeFilename: "src/a.css",
      config,
    });
    assert.equal(results[0].warnings[0]?.severity ?? null, severity);
  }
});

test("ownership allows scoped feature CSS, allowed globals, and ignores non-source CSS", async () => {
  for (const path of ["src/features/chat/chat.module.css", "src/components/Button.module.css", "src/styles/tokens.css", "src/app.css", "vendor/theme.css"]) {
    assert.deepEqual(await warnings("require-style-ownership", base, ".a {}", path), [], path);
  }
});

test("ownership rejects unscoped, unowned and nested-owner CSS", async () => {
  for (const path of ["src/features/chat/chat.css", "src/components/Button.css", "src/other/theme.css", "src/components/dialog/parts.css"]) {
    assert.equal((await warnings("require-style-ownership", base, ".a {}", path)).length, 1, path);
  }
});

test("cross-feature references reject imports, composes and @value", async () => {
  const option = { featureRoot: "src/features" };
  for (const code of [
    '@import "../editor/editor.module.css";',
    '.a { composes: b from "../editor/editor.module.css"; }',
    '@value accent from "../editor/tokens.module.css";',
  ]) {
    assert.equal((await warnings("no-cross-feature-styling", option, code, "src/features/chat/chat.module.css")).length, 1, code);
  }
});

test("cross-feature imports allow same feature, shared roots and packages", async () => {
  const option = { featureRoot: "src/features" };
  for (const code of [
    '@import "./local.css";',
    '@import "../../styles/tokens.css";',
    '@import "normalize.css";',
    '.a { composes: b from "./local.module.css"; }',
  ]) {
    assert.deepEqual(await warnings("no-cross-feature-styling", option, code, "src/features/chat/chat.module.css"), [], code);
  }
});

test("cross-feature global escape rejected unless explicitly permitted", async () => {
  const code = ":global(.other) .local { color: red; }";
  assert.equal((await warnings("no-cross-feature-styling", { featureRoot: "src/features" }, code, "src/features/chat/chat.module.css")).length, 1);
  assert.deepEqual(await warnings("no-cross-feature-styling", { featureRoot: "src/features", allowGlobalSelectors: true }, code, "src/features/chat/chat.module.css"), []);
});

test("cross-feature rule ignores files outside feature root", async () => {
  assert.deepEqual(await warnings("no-cross-feature-styling", { featureRoot: "src/features" }, '@import "../features/chat/chat.css";', "src/styles/global.css"), []);
});

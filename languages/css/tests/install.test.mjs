import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import stylelint from "stylelint";

test("vendored CSS plugin installs without overwrite and works in consumer", async () => {
  const cache = resolve("node_modules/.cache");
  mkdirSync(cache, { recursive: true });
  const workspace = mkdtempSync(join(cache, "anti-slop-css-"));
  const script = resolve("skills/install-anti-slop-css/scripts/install.mjs");
  const plugin = join(workspace, "tools/stylelint/anti-slop-css");
  try {
    const install = spawnSync(process.execPath, [script], { cwd: workspace, encoding: "utf8" });
    assert.equal(install.status, 0, install.stderr);
    assert.ok(existsSync(join(plugin, "index.mjs")));
    const second = spawnSync(process.execPath, [script], { cwd: workspace, encoding: "utf8" });
    assert.equal(second.status, 1);
    assert.match(second.stderr, /Refusing to overwrite/);
    const { results } = await stylelint.lint({
      code: ".a {}\n.b {}",
      codeFilename: join(workspace, "src/features/chat/chat.css"),
      config: {
        plugins: [join(plugin, "index.mjs")],
        rules: {
          "anti-slop-css/max-stylesheet-size": 1,
          "anti-slop-css/require-style-ownership": {
            sourceRoots: ["node_modules/.cache"],
            ownerDirectories: ["features"],
            scopedSuffixes: [".module.css"],
            allowedGlobalDirectories: [],
            allowedGlobalFiles: [],
          },
        },
      },
    });
    assert.equal(results[0].warnings.filter((warning) => warning.rule === "anti-slop-css/max-stylesheet-size").length, 1);
    assert.equal(results[0].warnings.filter((warning) => warning.rule === "anti-slop-css/require-style-ownership").length, 1);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = mkdtempSync(join(tmpdir(), "anti-slop-suppressions-"));
const script = fileURLToPath(new URL("./check-suppressions.mjs", import.meta.url));

function run() {
  return spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
}

try {
  const init = spawnSync("git", ["init", "-q"], { cwd: root, encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
  writeFileSync(join(root, "safe.ts"), 'const text = "// oxlint-disable";\n// Mention eslint-disable inline.\n');
  assert.equal(run().status, 0, "legitimate text must pass");

  writeFileSync(join(root, "bypass.ts"), "/* oxlint-disable */\nconst x = 1;\n");
  const rejected = run();
  assert.equal(rejected.status, 1, rejected.stdout + rejected.stderr);
  assert.match(rejected.stderr, /bypass\.ts:1:1/);
  assert.match(rejected.stderr, /suppression directive/i);

  writeFileSync(join(root, "bypass.ts"), "/* eslint-disable */\nconst x = 1;\n");
  assert.equal(run().status, 1, "ESLint file-wide suppressions must fail");

  writeFileSync(join(root, "bypass.ts"), "// @ts-ignore\nconst x = 1;\n");
  assert.equal(run().status, 1, "TypeScript suppressions must fail");
} finally {
  rmSync(root, { recursive: true, force: true });
}

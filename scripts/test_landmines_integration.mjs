import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const root = process.cwd();
const oxlint = join(root, "node_modules/.bin/oxlint");

function lintFixture(content, configForFixture, filename = "behavior.test.ts") {
  const directory = mkdtempSync(join(root, "landmines-fixture-"));

  try {
    const source = join(directory, filename);
    writeFileSync(source, content);

    const configPath = configForFixture?.(directory) ?? ".oxlintrc.json";
    const run = spawnSync(oxlint, ["--config", configPath, source], {
      cwd: root,
      encoding: "utf8",
    });
    assert.ifError(run.error);

    return { status: run.status, output: run.stdout + run.stderr };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("the bundled Landmines rules reject dishonest test patterns", () => {
  const result = lintFixture([
    'test("loads", { retry: 2 }, async () => {',
    '  await new Promise((resolve) => setTimeout(resolve, 100));',
    '  vi.fn(() => 1);',
    '});',
  ].join("\n"));

  assert.equal(result.status, 1, result.output);
  for (const rule of ["no-flake-masking", "no-fixed-sleep", "no-test-doubles"]) {
    assert.match(result.output, new RegExp("landmines\\(" + rule + "\\)"));
  }
});

test("the bundled Landmines rules allow ordinary assertions", () => {
  const result = lintFixture('test("loads", () => { expect(2 + 2).toBe(4); });');
  assert.equal(result.status, 0, result.output);
});

test("Landmines composes with the vendored anti-slop plugin", () => {
  const result = lintFixture('vi.mock("client"); Reflect.get(value, "name");', (directory) => {
    const configPath = join(directory, ".oxlintrc.json");
    writeFileSync(configPath, JSON.stringify({
      extends: [join(root, "integrations/landmines/recommended.json")],
      jsPlugins: [{ name: "anti-slop", specifier: join(root, "src/index.ts") }],
      rules: {
        "anti-slop/no-module-mocking": "off",
        "anti-slop/no-reflect-get": "error",
      },
    }));

    return configPath;
  });

  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /landmines\(no-test-doubles\)/);
  assert.match(result.output, /anti-slop\(no-reflect-get\)/);
});

test("the bundled Landmines rules reject skipped assertions", () => {
  const result = lintFixture('test("loads", () => { if (ready) expect(value).toBe(1); });');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /landmines\(no-conditional-expect\)/);
});

test("the bundled Landmines rules reject swallowed production failures", () => {
  const result = lintFixture('void load().catch(() => {});', undefined, "behavior.ts");
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /landmines\(no-silent-catch\)/);
});

test("the bundled Landmines rules reject shared timeout signals", () => {
  const result = lintFixture([
    'const signal = AbortSignal.timeout(1000);',
    'test("loads", () => { expect(signal.aborted).toBe(false); });',
  ].join("\n"));

  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /landmines\(no-shared-signal\)/);
});

test("the bundled Landmines rules allow a fresh signal per test", () => {
  const result = lintFixture('test("loads", () => { const signal = AbortSignal.timeout(1000); expect(signal.aborted).toBe(false); });');
  assert.equal(result.status, 0, result.output);
});

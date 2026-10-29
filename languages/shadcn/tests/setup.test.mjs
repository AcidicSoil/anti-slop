import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '../../..');
const manifest = readFileSync(resolve(root, 'stackforge.setups.toml'), 'utf8');
const packageRoot = resolve(root, 'integrations/shadcn-lint/package');
const source = resolve(root, 'integrations/shadcn-lint/source');
const originals = ['no-restyle', 'no-raw-colors', 'no-arbitrary-values', 'no-inline-styles', 'require-static-classes', 'no-unknown-classes'];
const additions = ['prefer-logical-utilities', 'prefer-focus-visible', 'prefer-motion-safe', 'no-transition-all', 'no-disabled-zoom', 'no-ease-in', 'no-long-transitions', 'no-selection-disable-on-content', 'prefer-bounded-textarea', 'prefer-flex-gap', 'prefer-motion-safe-scroll', 'prefer-shrinkable-truncate', 'prefer-small-viewport-height'];

test('Stackforge exposes a shadcn setup with a portable local package', () => {
  assert.match(manifest, /\[setups\.shadcn\]/);
  assert.match(manifest, /"@shadcn\/lint"\s*=\s*"file:tools\/oxlint\/shadcn-lint"/);
  assert.match(manifest, /"tools\/oxlint\/shadcn-lint"\s*=\s*"integrations\/shadcn-lint\/package"/);
  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@shadcn/lint');
  assert.equal(pkg.type, 'module');
  assert.ok(existsSync(resolve(packageRoot, 'LICENSE')));
  for (const file of ['index.js', 'similar.js', 'tailwind-worker.js', 'index.d.ts']) assert.ok(existsSync(resolve(packageRoot, 'dist', file)), file);
});

test('the distributable preserves all six upstream and thirteen new rules', () => {
  const registry = readFileSync(resolve(source, 'plugin.ts'), 'utf8');
  const bundle = readFileSync(resolve(packageRoot, 'dist/index.js'), 'utf8');
  for (const name of [...originals, ...additions]) {
    assert.match(registry, new RegExp('"' + name + '"\\s*:'), 'source: ' + name);
    assert.ok(bundle.includes('"' + name + '"'), 'built plugin: ' + name);
  }
  assert.equal(new Set([...originals, ...additions]).size, 19);
});

test('agent skill guidance complements lint without automatic framework migration', () => {
  const shadcnGuide = readFileSync(resolve(root, 'languages/shadcn/README.md'), 'utf8');
  const cssGuide = readFileSync(resolve(root, 'languages/css/README.md'), 'utf8');
  const cssInstall = readFileSync(resolve(root, 'skills/install-anti-slop-css/SKILL.md'), 'utf8');
  for (const name of ['good-css', 'better-typography']) {
    assert.ok(shadcnGuide.includes(name), name);
    assert.ok(cssGuide.includes(name), name);
  }
  assert.ok(shadcnGuide.includes('tailwind-to-stylex'));
  assert.match(shadcnGuide, /only.*(?:explicit|approved).*migration/i);
  assert.ok(cssInstall.includes('good-css'));
  assert.ok(cssInstall.includes('better-typography'));
});

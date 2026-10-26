#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(process.cwd(), process.argv[2] ?? "tools/stylelint/anti-slop-css");
if (existsSync(target)) {
  console.error(`Refusing to overwrite ${target}. Review the current installation first.`);
  process.exitCode = 1;
} else {
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(skillRoot, "assets/anti-slop-css"), target, { recursive: true });
  console.log(`Installed CSS plugin at ${target}. Merge Stylelint configuration for this project's CSS ownership paths.`);
}

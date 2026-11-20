#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { parseSync } from "oxc-parser";

import { isSuppressionComment } from "./shared/suppression-directives.ts";

const sourceFile = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const names = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "utf8",
}).split("\0").filter((path) => sourceFile.test(path));

let violations = 0;

for (const name of names) {
  const contents = readFileSync(name, "utf8");
  const { comments } = parseSync(name, contents);

  for (const comment of comments) {
    if (!isSuppressionComment(comment.value)) continue;
    const previous = contents.slice(0, comment.start).split(/\r?\n/);
    const line = previous.length;
    const column = previous.at(-1).length + 1;
    console.error(`${name}:${line}:${column}: suppression directive forbidden; fix the underlying diagnostic`);
    violations++;
  }
}

if (violations > 0) process.exitCode = 1;

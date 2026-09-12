import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

function files(directory, filter = () => true) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path, filter);
    return filter(path) ? [path] : [];
  });
}

function syncDirectory(source, destination, filter = () => true) {
  if (check) {
    const expected = files(source, filter).map((path) => relative(source, path)).sort();
    const actual = existsSync(destination)
      ? files(destination).map((path) => relative(destination, path)).sort()
      : [];
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      throw new Error(`${relative(root, destination)} differs from ${relative(root, source)}; run \`pnpm sync:skill-assets\`.`);
    }
    for (const path of expected) {
      if (readFileSync(join(source, path), "utf8") !== readFileSync(join(destination, path), "utf8")) {
        throw new Error(`${path} differs from its skill asset; run \`pnpm sync:skill-assets\`.`);
      }
    }
    return;
  }

  rmSync(destination, { recursive: true, force: true });
  for (const path of files(source, filter)) {
    const output = join(destination, relative(source, path));
    mkdirSync(dirname(output), { recursive: true });
    cpSync(path, output);
  }
}

function syncFile(source, destination) {
  if (check) {
    if (!existsSync(destination) || readFileSync(source, "utf8") !== readFileSync(destination, "utf8")) {
      throw new Error(`${relative(root, destination)} differs from ${relative(root, source)}; run \`pnpm sync:skill-assets\`.`);
    }
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination);
}

syncDirectory(
  join(root, "src"),
  join(root, "skills/install-anti-slop/assets/anti-slop"),
  (path) => !path.endsWith(".test.ts"),
);
syncFile(
  join(root, "languages/python/anti_slop.py"),
  join(root, "skills/install-anti-slop-python/assets/anti_slop.py"),
);
syncDirectory(
  join(root, "languages/go"),
  join(root, "skills/install-anti-slop-go/assets/anti-slop"),
  (path) => extname(path) === ".go",
);
syncFile(
  join(root, "languages/rust/anti-slop-clippy.toml"),
  join(root, "skills/install-anti-slop-rust/assets/anti-slop-clippy.toml"),
);

console.log(check ? "Skill assets match canonical sources." : "Synced skill assets.");

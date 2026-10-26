import { relative, resolve, dirname } from "node:path";

export function sourcePath(root) {
  const file = root.source?.input?.file;
  return file ? relative(process.cwd(), file).replaceAll("\\", "/") : null;
}

export function inside(directory, file) {
  const prefix = directory.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
  return file === prefix || file.startsWith(`${prefix}/`);
}

export function featureOf(file, featureRoot) {
  if (!inside(featureRoot, file)) return null;
  const prefix = featureRoot.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
  return file.slice(prefix.length + 1).split("/")[0] || null;
}

export function referenceTarget(file, specifier) {
  if (!specifier.startsWith(".")) return null;
  return relative(process.cwd(), resolve(process.cwd(), dirname(file), specifier)).replaceAll("\\", "/");
}

import { readFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, resolve } from "node:path";
import { parse } from "@typescript-eslint/parser";
import ts from "typescript";

const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".svelte"];
const literal = (node) => (node?.type === "Literal" ? node.value : undefined);
const keyOf = (node) => node?.name ?? literal(node);
const callIs = (node, method) =>
  node?.type === "CallExpression" && keyOf(node.callee?.property) === method;

function childNodes(node, predicate, found = []) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    for (const child of node) childNodes(child, predicate, found);
    return found;
  }
  if (predicate(node)) found.push(node);
  for (const [name, child] of Object.entries(node)) {
    if (
      name === "parent" ||
      name === "loc" ||
      name === "tokens" ||
      name === "comments" ||
      name === "range" ||
      name === "references"
    )
      continue;
    if (child && typeof child === "object") childNodes(child, predicate, found);
  }
  return found;
}

function exportedNames(declaration) {
  if (declaration?.type === "VariableDeclaration")
    return declaration.declarations.map((entry) => entry.id.name);
  if (declaration?.id?.name) return [declaration.id.name];
  return [];
}

export function createProject(options = {}, filename) {
  const root = resolve(options.projectRoot ?? process.cwd());
  const importer =
    filename && isAbsolute(filename) ? filename : resolve(root, filename ?? "src/page.tsx");
  const cache = new Map();
  let pathEntries;
  let baseUrl;
  let compilerOptions;

  function loadPaths() {
    if (pathEntries) return;
    const configPath =
      ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json") ??
      ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.base.json");
    const config = configPath ? ts.getParsedCommandLineOfConfigFile(configPath, {}, ts.sys) : null;
    compilerOptions = config?.options ?? {};
    const from = options.aliases ?? compilerOptions.paths ?? {};
    pathEntries = Object.entries(from).map(([pattern, paths]) => [
      pattern,
      typeof paths === "string" ? [paths] : paths,
    ]);
    baseUrl = resolve(compilerOptions.baseUrl ?? (configPath ? dirname(configPath) : root));
  }

  function sources(specifier, fromFile) {
    if (specifier.startsWith(".")) return [resolve(dirname(fromFile), specifier)];
    if (isAbsolute(specifier)) return [specifier];
    loadPaths();
    return pathEntries.flatMap(([pattern, paths]) => {
      const i = pattern.indexOf("*");
      if (i < 0) return pattern === specifier ? paths.map((path) => resolve(baseUrl, path)) : [];
      const prefix = pattern.slice(0, i);
      const suffix = pattern.slice(i + 1);
      if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) return [];
      const middle = specifier.slice(prefix.length, specifier.length - suffix.length);
      return paths.map((path) => resolve(baseUrl, path.replace("*", middle)));
    });
  }

  function existing(path) {
    for (const filename of [
      path,
      ...extensions.map((ext) => path + ext),
      ...extensions.map((ext) => join(path, "index" + ext)),
    ]) {
      try {
        if (statSync(filename).isFile()) return filename;
      } catch {
        // Missing import candidates are expected.
      }
    }
    return null;
  }

  function fileFor(specifier, fromFile = importer) {
    const local = sources(specifier, fromFile).map(existing).find(Boolean);
    if (local) return local;
    loadPaths();
    const resolved = ts.resolveModuleName(
      specifier,
      fromFile,
      {
        ...compilerOptions,
        moduleResolution: compilerOptions.moduleResolution ?? ts.ModuleResolutionKind.Bundler,
      },
      ts.sys,
    ).resolvedModule?.resolvedFileName;
    return resolved && !resolved.endsWith(".d.ts") ? resolved : null;
  }

  function moduleInfo(file) {
    if (cache.has(file)) return cache.get(file);
    const text = readFileSync(file, "utf8");
    const extension = extname(file);
    const program =
      extension === ".vue" || extension === ".svelte"
        ? parse(
            [...text.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
              .map((match) => match[1])
              .join("\n"),
            { sourceType: "module", ecmaVersion: "latest" },
          )
        : parse(text, { sourceType: "module", ecmaVersion: "latest", jsx: true, loc: true });
    const result = { program, imports: new Map(), exports: new Map(), wildcardExports: [], file };
    cache.set(file, result);
    for (const stmt of program.body) {
      if (stmt.type === "ImportDeclaration") {
        for (const specifier of stmt.specifiers) {
          result.imports.set(specifier.local.name, {
            source: stmt.source.value,
            imported:
              specifier.type === "ImportDefaultSpecifier"
                ? "default"
                : specifier.type === "ImportNamespaceSpecifier"
                  ? "*"
                  : keyOf(specifier.imported),
          });
        }
      }
      if (stmt.type === "ExportNamedDeclaration") {
        for (const name of exportedNames(stmt.declaration))
          result.exports.set(name, { local: name, declaration: stmt.declaration });
        for (const specifier of stmt.specifiers) {
          result.exports.set(keyOf(specifier.exported), {
            local: keyOf(specifier.local),
            source: stmt.source?.value,
          });
        }
      }
      if (stmt.type === "ExportAllDeclaration") result.wildcardExports.push(stmt.source.value);
      if (stmt.type === "ExportDefaultDeclaration") {
        const declaration = stmt.declaration;
        result.exports.set("default", {
          local: declaration.id?.name ?? declaration.name ?? null,
          declaration,
        });
      }
    }
    return result;
  }

  function getExport(file, exportName, visited = new Set()) {
    if (!file || visited.size > 16) return null;
    const id = file + ":" + exportName;
    if (visited.has(id)) return null;
    visited.add(id);
    const info = moduleInfo(file);
    const entry = info.exports.get(exportName);
    if (!entry) {
      for (const source of info.wildcardExports) {
        const hit = getExport(fileFor(source, file), exportName, new Set(visited));
        if (hit) return hit;
      }
      return null;
    }
    if (entry.source) return getExport(fileFor(entry.source, file), entry.local, visited);
    if (entry.declaration) {
      const node =
        entry.declaration.type === "VariableDeclaration"
          ? entry.declaration.declarations.find((item) => item.id.name === entry.local)
          : entry.declaration;
      return { file, node, name: entry.local ?? exportName, info };
    }
    const imp = info.imports.get(entry.local);
    if (imp) return getExport(fileFor(imp.source, file), imp.imported, visited);
    const node = childNodes(
      info.program.body,
      (item) =>
        (item.type === "FunctionDeclaration" && item.id?.name === entry.local) ||
        (item.type === "VariableDeclarator" && item.id?.name === entry.local) ||
        (item.type === "ClassDeclaration" && item.id?.name === entry.local),
    )[0];
    return node ? { file, node, name: entry.local, info } : null;
  }

  function isRecognized(file, patterns, fromFile = importer) {
    const normalizedFile = file.replaceAll("\\", "/");
    return patterns.some((pattern) =>
      sources(pattern.replace(/\*$/, ""), fromFile).some(
        (candidate) =>
          normalizedFile === candidate ||
          normalizedFile.startsWith(candidate + "/") ||
          normalizedFile.startsWith(candidate + "."),
      ),
    );
  }

  function findForwardedTarget(symbol, patterns, seen = new Set()) {
    if (!symbol || seen.has(symbol.file)) return null;
    seen.add(symbol.file);
    const opening = childNodes(symbol.node, (node) => node.type === "JSXOpeningElement").find(
      (node) =>
        node.attributes.some(
          (attribute) =>
            (attribute.type === "JSXAttribute" &&
              ["stylexStyle", "sx", "className"].includes(attribute.name.name) &&
              attribute.value?.expression?.type === "Identifier") ||
            (attribute.type === "JSXSpreadAttribute" && attribute.argument.type === "Identifier"),
        ),
    );
    if (!opening) return null;
    const name = opening.name.name;
    const imp = symbol.info.imports.get(name);
    if (!imp) return null;
    return component(imp.source, imp.imported, symbol.file, patterns, seen);
  }

  function component(source, imported, fromFile, patterns, seen = new Set()) {
    const file = fileFor(source, fromFile);
    const symbol = getExport(file, imported);
    if (!symbol) return null;
    if (isRecognized(symbol.file, patterns, fromFile)) {
      return {
        name: symbol.name === "default" ? imported : symbol.name,
        file: symbol.file,
        variants: variants(symbol),
      };
    }
    return findForwardedTarget(symbol, patterns, seen);
  }

  function variants(symbol) {
    const properties = childNodes(
      symbol.info.program.body,
      (item) =>
        item.type === "TSPropertySignature" && ["variant", "size"].includes(keyOf(item.key)),
    );
    const found = Object.fromEntries(
      properties.map((item) => [
        keyOf(item.key),
        childNodes(
          item.typeAnnotation?.typeAnnotation,
          (value) => value.type === "TSLiteralType" && typeof literal(value.literal) === "string",
        ).map((type) => literal(type.literal)),
      ]),
    );

    const factoryName = symbol.name.charAt(0).toLowerCase() + symbol.name.slice(1) + "Variants";
    const imported = symbol.info.imports.get(factoryName);
    const helper = imported
      ? getExport(fileFor(imported.source, symbol.file), imported.imported)?.node
      : childNodes(
          symbol.info.program.body,
          (item) => item.type === "VariableDeclarator" && item.id.name === factoryName,
        )[0];
    const factory = helper?.init;
    if (!factory || factory.type !== "CallExpression") return found;
    if (!["cva", "tv"].includes(keyOf(factory.callee))) return found;
    const settings = factory.arguments.find(
      (arg) =>
        arg.type === "ObjectExpression" &&
        arg.properties.some(
          (entry) => entry.type === "Property" && keyOf(entry.key) === "variants",
        ),
    );
    const variantObject = settings?.properties.find(
      (entry) => entry.type === "Property" && keyOf(entry.key) === "variants",
    )?.value;
    for (const axis of variantObject?.properties ?? []) {
      if (axis.type !== "Property" || axis.value.type !== "ObjectExpression") continue;
      found[keyOf(axis.key)] = axis.value.properties
        .filter((entry) => entry.type === "Property")
        .map((entry) => String(keyOf(entry.key)));
    }
    return found;
  }

  function exportedValue(source, imported, fromFile = importer) {
    const symbol = getExport(fileFor(source, fromFile), imported);
    const init = symbol?.node?.init;
    if (
      !init ||
      (!callIs(init, "create") && !callIs(init, "defineVars") && !callIs(init, "defineConsts"))
    )
      return null;
    const properties = init.arguments[0]?.properties ?? [];
    return {
      file: symbol.file,
      kind: keyOf(init.callee.property),
      entries: new Map(
        properties
          .filter((item) => item.type === "Property")
          .map((item) => [keyOf(item.key), item.value]),
      ),
    };
  }

  return { fileFor, moduleInfo, getExport, component, exportedValue, importer, root };
}

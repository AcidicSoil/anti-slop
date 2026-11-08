import { differenceEuclidean, parse } from "culori";
import { createProject } from "./project.js";

const cssColorProperties =
  /^(?:color|fill|stroke|stopColor|floodColor|lightingColor|caretColor|accentColor|backgroundColor|outlineColor|textDecorationColor|(?:border(?:Top|Right|Bottom|Left|Block|Inline|Start|End)?Color))$/;
const scaleProperties =
  /^(?:padding(?:Top|Right|Bottom|Left|Block|Inline|BlockStart|BlockEnd|InlineStart|InlineEnd)?|gap|rowGap|columnGap|borderRadius|border(?:TopLeft|TopRight|BottomLeft|BottomRight|StartStart|StartEnd|EndStart|EndEnd)Radius|fontSize|letterSpacing|lineHeight)$/;

export const isColorProperty = (name) => cssColorProperties.test(name);
export const isScaleProperty = (name) => scaleProperties.test(name);

export function propertyName(node) {
  if (!node) return null;
  if (node.type === "Identifier" || node.type === "JSXIdentifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}

export function isCall(node, namespaces, method) {
  return (
    node?.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    namespaces.has(node.callee.object.name) &&
    propertyName(node.callee.property) === method
  );
}

export function matches(name, entries = []) {
  return entries.some((entry) => {
    if (entry === name) return true;
    if (entry.endsWith("*")) return name.startsWith(entry.slice(0, -1));
    return false;
  });
}

function sourceMatches(source, patterns = []) {
  return patterns.some((pattern) => {
    if (pattern.startsWith("^") || pattern.endsWith("$")) {
      try {
        return new RegExp(pattern).test(source);
      } catch {
        return false;
      }
    }
    return (
      source === pattern ||
      source.startsWith(`${pattern}/`) ||
      (pattern.endsWith("*") && source.startsWith(pattern.slice(0, -1))) ||
      (pattern.startsWith("*") && source.endsWith(pattern.slice(pattern.lastIndexOf("*") + 1)))
    );
  });
}

export function createState(options = {}, context) {
  const project = context ? createProject(options, context.filename) : null;
  const configErrors = ["componentImports", "ignoreImports", "tokenModules"].flatMap((field) =>
    (options[field] ?? []).flatMap((pattern) => {
      if (!pattern.startsWith("^") && !pattern.endsWith("$")) return [];
      try {
        new RegExp(pattern);
        return [];
      } catch {
        return [`Invalid ${field} regex: ${pattern}`];
      }
    }),
  );
  const state = {
    namespaces: new Set(),
    atoms: new Set(),
    importedTokens: new Set(),
    localTokens: new Set(),
    themes: new Set(),
    components: new Map(),
    componentNamespaces: new Set(),
    styles: new Map(),
    importedStyleNames: new Set(),
    tokens: new Map(),
    details: new Map(),
    wrappers: new Map(),
    project,
    values: new Map(),
    options,
  };
  state.listeners = {
    Program(node) {
      for (const message of configErrors) context?.report({ node, message });
    },
    ImportDeclaration(node) {
      const source = node.source.value;
      if (source === "@stylexjs/stylex") {
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier")
            state.namespaces.add(specifier.local.name);
        }
      }
      if (source === "@stylexjs/atoms") {
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportDefaultSpecifier") state.atoms.add(specifier.local.name);
        }
      }
      if (sourceMatches(source, options.tokenModules ?? ["*.stylex", "**/*.stylex"])) {
        for (const specifier of node.specifiers) {
          state.importedTokens.add(specifier.local.name);
          const imported = propertyName(specifier.imported) ?? "default";
          const token = project?.exportedValue(source, imported);
          if (token && ["defineVars", "defineConsts"].includes(token.kind)) {
            state.tokens.set(specifier.local.name, token.entries);
          }
        }
      }
      const ignored = sourceMatches(source, options.ignoreImports ?? []);
      const direct = !ignored && sourceMatches(source, options.componentImports ?? []);
      for (const specifier of node.specifiers) {
        if (specifier.type === "ImportNamespaceSpecifier") {
          if (direct) state.componentNamespaces.add(specifier.local.name);
          continue;
        }
        const imported =
          specifier.type === "ImportDefaultSpecifier"
            ? "default"
            : propertyName(specifier.imported);
        const recognized = ignored
          ? null
          : project?.component(source, imported, project.importer, options.componentImports ?? []);
        const component = recognized?.name ?? (direct ? specifier.local.name : null);
        if (component) {
          state.components.set(specifier.local.name, component);
          if (recognized) state.details.set(component, recognized);
        }
        const style = project?.exportedValue(source, imported);
        if (style?.kind === "create") {
          state.styles.set(specifier.local.name, style.entries);
          state.importedStyleNames.add(specifier.local.name);
        }
      }
    },
    VariableDeclarator(node) {
      if (node.id.type !== "Identifier") return;
      state.values.set(node.id.name, node.init);
      if (isCall(node.init, state.namespaces, "createTheme")) state.themes.add(node.id.name);
      if (
        isCall(node.init, state.namespaces, "defineVars") ||
        isCall(node.init, state.namespaces, "defineConsts")
      ) {
        state.localTokens.add(node.id.name);
        const tokens = node.init.arguments[0]?.properties ?? [];
        state.tokens.set(
          node.id.name,
          new Map(
            tokens
              .filter((item) => item.type === "Property")
              .map((item) => [propertyName(item.key), item.value]),
          ),
        );
      }
      if (!isCall(node.init, state.namespaces, "create")) return;
      if (node.init.arguments[0]?.type !== "ObjectExpression") return;
      const definitions = new Map();
      for (const entry of node.init.arguments[0].properties) {
        if (entry.type !== "Property") continue;
        const key = propertyName(entry.key);
        if (key) definitions.set(key, entry.value);
      }
      state.styles.set(node.id.name, definitions);
    },
    FunctionDeclaration(node) {
      if (!node.id || state.components.has(node.id.name)) return;
      const returned = node.body.body.find((part) => part.type === "ReturnStatement")?.argument;
      const opening = returned?.type === "JSXElement" ? returned.openingElement : null;
      const target = opening?.name?.name;
      if (!target || !state.components.has(target)) return;
      const forwarded = opening.attributes.some(
        (attribute) =>
          (attribute.type === "JSXSpreadAttribute" && attribute.argument.type === "Identifier") ||
          (attribute.type === "JSXAttribute" &&
            ["stylexStyle", "sx", "className"].includes(attribute.name.name) &&
            attribute.value?.expression?.type === "Identifier"),
      );
      if (forwarded) state.components.set(node.id.name, state.components.get(target));
    },
  };
  return state;
}

export function componentName(node, state) {
  if (node.type === "JSXIdentifier") {
    return (
      state.components.get(node.name) ??
      ((state.options.componentNames ?? []).includes(node.name) ? node.name : null)
    );
  }
  if (
    node.type === "JSXMemberExpression" &&
    node.object.type === "JSXIdentifier" &&
    state.componentNamespaces.has(node.object.name)
  )
    return node.property.name;
  return null;
}

export function effectiveComponent(opening, state) {
  const rendered = opening.attributes.find(
    (attribute) => attribute.type === "JSXAttribute" && propertyName(attribute.name) === "render",
  );
  const expression = rendered?.value?.expression;
  const result =
    expression?.type === "JSXElement"
      ? expression.openingElement
      : expression?.type === "ArrowFunctionExpression" && expression.body?.type === "JSXElement"
        ? expression.body.openingElement
        : null;
  return result && componentName(result.name, state)
    ? componentName(result.name, state)
    : componentName(opening.name, state);
}

export function styleInputs(opening, state) {
  const props = state.options.styleProps ?? ["stylexStyle", "sx"];
  return opening.attributes.flatMap((attribute) => {
    if (attribute.type === "JSXAttribute" && props.includes(propertyName(attribute.name))) {
      return attribute.value?.type === "JSXExpressionContainer"
        ? [attribute.value.expression]
        : [attribute.value ?? attribute];
    }
    if (attribute.type === "JSXSpreadAttribute") {
      return spreadStyleInputs(attribute.argument, state);
    }
    return [];
  });
}

function spreadStyleInputs(expression, state, seen = new Set()) {
  if (isCall(expression, state.namespaces, "props")) return expression.arguments;
  if (expression?.type === "Identifier") {
    if (seen.has(expression.name)) return [];
    seen.add(expression.name);
    const value = state.values.get(expression.name);
    return value ? spreadStyleInputs(value, state, seen) : [];
  }
  if (expression?.type === "ObjectExpression") {
    return expression.properties.flatMap((property) => {
      if (property.type === "SpreadElement") {
        return spreadStyleInputs(property.argument, state, new Set(seen));
      }
      if (property.type !== "Property") return [];
      return (state.options.styleProps ?? ["stylexStyle", "sx"]).includes(
        propertyName(property.key),
      )
        ? [property.value]
        : [];
    });
  }
  return [];
}

function styleObject(node) {
  if (node?.type === "ObjectExpression") return node;
  if (node?.type !== "ArrowFunctionExpression" && node?.type !== "FunctionExpression") return null;
  if (node.body.type === "ObjectExpression") return node.body;
  if (node.body.type === "BlockStatement") {
    return (
      node.body.body.find(
        (statement) =>
          statement.type === "ReturnStatement" && statement.argument?.type === "ObjectExpression",
      )?.argument ?? null
    );
  }
  return null;
}

export function styleDefinitions(call) {
  const definitions = [];
  for (const item of call.arguments[0]?.properties ?? []) {
    if (item.type !== "Property") continue;
    const body = styleObject(item.value);
    if (body) definitions.push(body);
  }
  return definitions;
}

export function declarations(object) {
  return object.properties.flatMap((property) => {
    if (property.type !== "Property") return [];
    const name = propertyName(property.key);
    return name ? [{ name, value: property.value, node: property }] : [];
  });
}

export function* leafValues(value) {
  if (value.type === "ObjectExpression") {
    for (const property of value.properties) {
      if (property.type === "Property") yield* leafValues(property.value);
    }
    return;
  }
  yield value;
}

function rootIdentifier(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression") return rootIdentifier(node.object);
  return null;
}

export function isToken(value, state) {
  if (value?.type !== "MemberExpression") return false;
  const root = rootIdentifier(value);
  if (!state.importedTokens.has(root) && !state.localTokens.has(root)) return false;
  const known = state.tokens.get(root);
  const tokenName = propertyName(value.property);
  return !known || known.has(tokenName);
}

export function atomicDeclaration(expression, state) {
  if (
    expression?.type === "MemberExpression" &&
    expression.object.type === "MemberExpression" &&
    expression.object.object.type === "Identifier" &&
    state.atoms.has(expression.object.object.name)
  ) {
    const name = propertyName(expression.object.property);
    return name ? { name, value: expression.property, node: expression } : null;
  }
  if (
    expression?.type === "CallExpression" &&
    expression.callee.type === "MemberExpression" &&
    expression.callee.object.type === "Identifier" &&
    state.atoms.has(expression.callee.object.name)
  ) {
    const name = propertyName(expression.callee.property);
    return name && expression.arguments.length === 1
      ? { name, value: expression.arguments[0], node: expression }
      : null;
  }
  return null;
}

export function referencedStyles(expression, state) {
  const atomic = atomicDeclaration(expression, state);
  if (atomic) return [atomic];
  if (
    !expression ||
    (expression.type === "Literal" && (expression.value === null || expression.value === false))
  )
    return [];
  if (
    expression.type === "Identifier" &&
    (expression.name === "undefined" || state.themes.has(expression.name))
  )
    return [];
  if (expression.type === "MemberExpression" && expression.object.type === "Identifier") {
    const definitions = state.styles.get(expression.object.name);
    if (!definitions) return null;
    if (expression.computed && expression.property.type !== "Literal") {
      const properties = [...definitions.values()].flatMap((style) => {
        const object = styleObject(style);
        return object ? declarations(object) : [];
      });
      return properties.length ? properties : null;
    }
    const object = styleObject(definitions.get(propertyName(expression.property)));
    if (!object) return null;
    const found = declarations(object);
    return state.importedStyleNames.has(expression.object.name)
      ? found.map((property) => ({ ...property, node: expression }))
      : found;
  }
  if (expression.type === "CallExpression") {
    if (isCall(expression, state.namespaces, "props")) {
      return flattenStyles(expression.arguments, state);
    }
    if (expression.callee.type === "MemberExpression")
      return referencedStyles(expression.callee, state);
    return null;
  }
  if (expression.type === "ArrayExpression") {
    return flattenStyles(expression.elements.filter(Boolean), state);
  }
  if (expression.type === "ConditionalExpression") {
    return flattenStyles([expression.consequent, expression.alternate], state);
  }
  if (expression.type === "LogicalExpression" && expression.operator === "&&") {
    return referencedStyles(expression.right, state);
  }
  return null;
}

function flattenStyles(expressions, state) {
  const resolved = expressions.map((expression) => referencedStyles(expression, state));
  return resolved.some((value) => value === null) ? null : resolved.flat();
}

export function categoryOf(property) {
  if (
    /^(?:margin|width|height|minWidth|maxWidth|minHeight|maxHeight|display|position|top|left|right|bottom|inset|flex|align|justify|overflow|grid|transform|translate|zIndex|textAlign)/.test(
      property,
    )
  )
    return "layout";
  if (/^(?:padding|gap|rowGap|columnGap)/.test(property)) return "spacing";
  if (isColorProperty(property)) return "color";
  if (/^(?:font|letterSpacing|lineHeight|textTransform|textDecoration)/.test(property))
    return "typography";
  if (/^(?:border|outline|borderRadius|boxSizing)/.test(property)) return "shape";
  if (/^(?:opacity|boxShadow|filter|backdropFilter)/.test(property)) return "effects";
  if (/^(?:animation|transition)/.test(property)) return "motion";
  return "other";
}

export function contractFor(component, options) {
  const match = options.contracts
    ?.filter((contract) => new RegExp(contract.pattern).test(component))
    .at(-1);
  return match ? { ...options, ...match } : options;
}

export function permittedProperty(property, config) {
  const names = [property, categoryOf(property)];
  const allows = config.allow;
  const denies = config.deny ?? [];
  const allowed =
    allows === undefined ? config.deny !== undefined : names.some((name) => matches(name, allows));
  return allowed && !names.some((name) => matches(name, denies));
}

export const optionSchema = [{ type: "object", additionalProperties: true }];

export function messageFor(options, data, fallback, category = "default") {
  const template =
    typeof options.message === "string"
      ? options.message
      : (options.message?.[category] ?? options.message?.default ?? fallback);
  return template.replace(/{{(\w+)(?:\|([^}]+))?}}/g, (_, name, alternate) => {
    const value = data[name];
    return value === undefined || value === null || value === ""
      ? (alternate ?? "")
      : String(value);
  });
}

export function tokenSuggestions(node, state) {
  if (node?.type !== "Literal") return [];
  const value = String(node.value);
  const normalized = value.toLowerCase();
  const suggestions = [];
  for (const [group, tokens] of state.tokens) {
    for (const [key, definition] of tokens) {
      if (definition.type !== "Literal") continue;
      const candidate = String(definition.value).toLowerCase();
      if (
        candidate === normalized ||
        (typeof node.value === "number" && candidate === normalized + "px")
      ) {
        suggestions.push(`${group}.${key}`);
      }
    }
  }
  if (suggestions.length) return suggestions;
  if (typeof node.value !== "string" || !parse(node.value)) return [];
  const distance = differenceEuclidean("oklab");
  const near = [];
  for (const [group, tokens] of state.tokens) {
    for (const [key, definition] of tokens) {
      if (definition.type !== "Literal" || typeof definition.value !== "string") continue;
      if (!parse(definition.value)) continue;
      const delta = distance(node.value, definition.value);
      if (Number.isFinite(delta) && delta < 0.08) near.push({ name: `${group}.${key}`, delta });
    }
  }
  return near
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3)
    .map((item) => item.name);
}

export function policyOptions(context) {
  const shared = context.settings?.stylexDesignSystem ?? {};
  const local = context.options[0] ?? {};
  const options = { ...shared, ...local };
  const ui = Array.isArray(shared.ui) ? shared.ui : shared.ui ? [shared.ui] : [];
  const imports = Array.isArray(options.componentImports)
    ? options.componentImports
    : options.componentImports
      ? [options.componentImports]
      : [];
  options.componentImports = [...ui, ...imports];
  return options;
}

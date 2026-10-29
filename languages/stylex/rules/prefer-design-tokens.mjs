// Enforce the shared color-token boundary in StyleX authored styles.
// Native StyleX ESLint rules remain responsible for syntax and value validity.
const COLOR_PROPERTIES = new Set([
  "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor",
  "borderBottomColor", "borderLeftColor", "borderBlockColor", "borderInlineColor",
  "outlineColor", "textDecorationColor", "caretColor", "columnRuleColor",
  "fill", "stroke", "stopColor", "floodColor", "lightingColor",
]);
const KEYWORDS = new Set(["transparent", "currentcolor", "inherit", "initial", "unset", "revert", "revert-layer", "none"]);

function propertyName(property) {
  if (property.computed) return null;
  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "Literal") return property.key.value;
  return null;
}

function baseIdentifier(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression" && !node.computed) return baseIdentifier(node.object);
  return null;
}

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Use shared design-system color tokens in StyleX component styles" },
    schema: [{
      type: "object",
      additionalProperties: false,
      required: ["tokenModules", "cssVariablePrefix"],
      properties: {
        tokenModules: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string", minLength: 1 } },
        cssVariablePrefix: { type: "string", pattern: "^--[a-zA-Z][a-zA-Z0-9-]*-$" },
      },
    }],
    messages: {
      token: "Use a token from the configured shared token module or var({{prefix}}...). Do not hardcode or bypass design-system colors.",
    },
  },
  create(context) {
    const options = context.options[0];
    const stylexNamespaces = new Set();
    const stylexCreates = new Set();
    const tokenNames = new Set();

    function permitted(value) {
      if (value.type === "Literal") {
        if (value.value === null) return true;
        if (typeof value.value !== "string") return false;
        const text = value.value.trim();
        if (KEYWORDS.has(text.toLowerCase())) return true;
        const prefix = options.cssVariablePrefix.replace(/[.*+?^$\\{}()|[\]\\]/g, "\\$&");
        return new RegExp(`^var\\(\\s*${prefix}[a-zA-Z0-9-]+\\s*\\)$`).test(text);
      }
      if (value.type === "MemberExpression") return tokenNames.has(baseIdentifier(value));
      if (value.type === "Identifier") return tokenNames.has(value.name);
      return false;
    }

    function checkValue(value) {
      if (value.type === "ObjectExpression") {
        for (const entry of value.properties) {
          if (entry.type === "Property") checkValue(entry.value);
        }
        return;
      }
      if (value.type === "ConditionalExpression") {
        checkValue(value.consequent);
        checkValue(value.alternate);
        return;
      }
      if (value.type === "LogicalExpression") {
        checkValue(value.right);
        return;
      }
      if (!permitted(value)) context.report({
        node: value,
        messageId: "token",
        data: { prefix: options.cssVariablePrefix },
      });
    }

    function inspectStyles(object) {
      if (object.type !== "ObjectExpression") return;
      for (const property of object.properties) {
        if (property.type !== "Property") continue;
        const key = propertyName(property);
        if (COLOR_PROPERTIES.has(key)) {
          checkValue(property.value);
        } else if (property.value.type === "ObjectExpression") {
          inspectStyles(property.value);
        }
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === "@stylexjs/stylex") {
          for (const item of node.specifiers) {
            if (item.type === "ImportNamespaceSpecifier" || item.type === "ImportDefaultSpecifier") {
              stylexNamespaces.add(item.local.name);
            } else if (item.type === "ImportSpecifier" && item.imported.name === "create") {
              stylexCreates.add(item.local.name);
            }
          }
        }
        if (options.tokenModules.includes(node.source.value)) {
          for (const item of node.specifiers) tokenNames.add(item.local.name);
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        const isStylexCreate = (
          callee.type === "MemberExpression" && !callee.computed &&
          callee.object.type === "Identifier" && stylexNamespaces.has(callee.object.name) &&
          callee.property.type === "Identifier" && callee.property.name === "create"
        ) || (callee.type === "Identifier" && stylexCreates.has(callee.name));
        if (isStylexCreate) inspectStyles(node.arguments[0]);
      },
    };
  },
};

export default rule;

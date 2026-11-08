import { parse } from "culori";
import {
  policyOptions,
  atomicDeclaration,
  createState,
  declarations,
  isCall,
  isColorProperty,
  isScaleProperty,
  isToken,
  leafValues,
  messageFor,
  optionSchema,
  permittedProperty,
  propertyName,
  styleDefinitions,
  tokenSuggestions,
} from "../analysis.js";
import { templateVisitors } from "../template.js";

function tokenRule(kind) {
  const color = kind === "color";
  return {
    meta: {
      type: "problem",
      docs: { description: `Require design-system ${kind} tokens in StyleX declarations` },
      schema: optionSchema,
      hasSuggestions: true,
      messages: {
        missing: "StyleX {{property}} must reference an approved design token; received {{value}}.",
      },
    },
    create(context) {
      const state = createState(policyOptions(context), context);
      const calls = [];
      const atoms = [];
      const svgAttributes = [];
      const themes = [];
      const literals = [];
      const reported = new WeakSet();

      function report(node, property, value, permitSuggestion = true) {
        const alternatives = tokenSuggestions(value, state);
        const data = {
          property,
          value: context.sourceCode.getText(value),
          suggestions: alternatives.join(", "),
        };
        const defaultMessage =
          "StyleX {{property}} must reference an approved design token; received {{value}}." +
          (alternatives.length ? " Use {{suggestions}}." : "");
        const finding = {
          node,
          message: messageFor(state.options, data, defaultMessage),
        };
        if (permitSuggestion && alternatives.length && node === value) {
          finding.suggest = alternatives.map((reference) => ({
            desc: `Use design token ${reference}`,
            fix: (fixer) => fixer.replaceText(value, reference),
          }));
        }
        reported.add(value);
        context.report(finding);
      }

      function checkTheme(call) {
        const group = call.arguments[0];
        const override = call.arguments[1];
        if (group?.type !== "Identifier" || override?.type !== "ObjectExpression") return;
        const keys = state.tokens.get(group.name);
        if (!keys) return;
        const configured = state.options.themeTokenGroups;
        const isColorGroup = /color|palette|ink|foreground|background/i.test(group.name);
        if (
          configured
            ? !(Array.isArray(configured)
                ? configured.includes(group.name)
                : configured === group.name)
            : color !== isColorGroup
        )
          return;
        for (const property of override.properties) {
          if (property.type !== "Property" || property.computed) continue;
          const name = propertyName(property.key);
          if (keys.has(name)) continue;
          const suggestions = [...keys.keys()].join(", ");
          context.report({
            node: property.key,
            message: messageFor(
              state.options,
              {
                property: name,
                value: name,
                suggestions,
              },
              `Unknown theme token {{property}}. Declared tokens: {{suggestions}}.`,
            ),
          });
        }
      }

      return templateVisitors(context, {
        ...state.listeners,
        CallExpression(node) {
          if (isCall(node, state.namespaces, "create")) calls.push(node);
          if (isCall(node, state.namespaces, "createTheme")) themes.push(node);
          atoms.push(node);
        },
        MemberExpression(node) {
          atoms.push(node);
        },
        Literal(node) {
          if (state.options.scanAllStrings && typeof node.value === "string") literals.push(node);
        },
        JSXAttribute(node) {
          if (
            color &&
            ["fill", "stroke", "color", "stopColor", "floodColor", "lightingColor"].includes(
              propertyName(node.name),
            )
          )
            svgAttributes.push(node);
        },
        "Program:exit"() {
          for (const call of calls.splice(0)) {
            for (const style of styleDefinitions(call)) {
              for (const { name: property, value } of declarations(style)) {
                if (!(color ? isColorProperty(property) : isScaleProperty(property))) continue;
                if (permittedProperty(property, state.options)) continue;
                for (const leaf of leafValues(value)) {
                  if (!isToken(leaf, state) && !approvedValue(leaf, color)) {
                    report(leaf, property, leaf);
                  }
                }
              }
            }
          }
          for (const expression of atoms.splice(0)) {
            const atomic = atomicDeclaration(expression, state);
            if (!atomic) continue;
            if (!(color ? isColorProperty(atomic.name) : isScaleProperty(atomic.name))) continue;
            if (permittedProperty(atomic.name, state.options)) continue;
            if (isToken(atomic.value, state) || approvedValue(atomic.value, color)) continue;
            report(atomic.node, atomic.name, atomic.value, false);
          }
          for (const attribute of svgAttributes.splice(0)) {
            const value =
              attribute.value?.type === "JSXExpressionContainer"
                ? attribute.value.expression
                : attribute.value;
            if (!value || isToken(value, state) || approvedValue(value, true)) continue;
            report(attribute, propertyName(attribute.name), value, false);
          }
          for (const theme of themes.splice(0)) checkTheme(theme);
          for (const value of literals.splice(0)) {
            if (reported.has(value) || approvedValue(value, color)) continue;
            const valid = color
              ? Boolean(parse(value.value))
              : /^-?\d+(?:\.\d+)?(?:px|rem|em|ch|vh|vw|vmin|vmax|cqi|cqw)$/.test(value.value);
            if (!valid || permittedProperty("value", state.options)) continue;
            let ancestor = value.parent;
            let exempt = false;
            while (ancestor) {
              if (
                isCall(ancestor, state.namespaces, "defineVars") ||
                isCall(ancestor, state.namespaces, "defineConsts") ||
                isCall(ancestor, state.namespaces, "createTheme")
              ) {
                exempt = true;
                break;
              }
              ancestor = ancestor.parent;
            }
            if (!exempt) report(value, "value", value);
          }
        },
      });
    },
  };
}

function approvedValue(node, color) {
  if (node?.type === "Identifier") {
    return (
      color
        ? ["transparent", "currentColor", "inherit", "initial", "unset", "revert", "none"]
        : ["_0", "auto", "inherit", "initial", "unset", "revert", "normal", "none"]
    ).includes(node.name);
  }
  if (node?.type === "Literal") {
    if (typeof node.value === "number") return !color && node.value === 0;
    if (typeof node.value !== "string") return false;
    return (
      color
        ? ["transparent", "currentColor", "inherit", "initial", "unset", "revert", "none"]
        : ["0", "auto", "inherit", "initial", "unset", "revert", "normal", "none"]
    ).includes(node.value);
  }
  return false;
}

export const requireColorTokens = tokenRule("color");
export const requireScaleTokens = tokenRule("scale");

import {
  policyOptions,
  categoryOf,
  effectiveComponent,
  contractFor,
  createState,
  messageFor,
  optionSchema,
  permittedProperty,
  referencedStyles,
  styleInputs,
} from "../analysis.js";
import { templateVisitors } from "../template.js";

export const noComponentRestyle = {
  meta: {
    type: "problem",
    docs: { description: "Prevent consumer overrides of protected component styles" },
    schema: optionSchema,
    messages: {
      restricted:
        "Protected {{property}} override on {{component}}; use a component variant{{variants}}.",
    },
  },
  create(context) {
    const state = createState(policyOptions(context), context);
    const elements = [];

    function report(node, component, property, contract) {
      const known = state.details.get(component)?.variants;
      const variants = contract.variants ?? known?.variant ?? [];
      const sizes = known?.size ?? [];
      const data = {
        property,
        component,
        category: categoryOf(property),
        variants: variants.length ? ` (${variants.join(", ")})` : "",
        sizes: sizes.join(", "),
        suggestions: variants.join(", "),
        file: state.details.get(component)?.file ?? "",
      };
      context.report({
        node,
        message: messageFor(
          contract,
          data,
          "Protected {{property}} override on {{component}}; use a component variant{{variants}}.",
          data.category,
        ),
      });
    }

    function checkElement(element) {
      const component = effectiveComponent(element, state);
      if (!component) return;
      const contract = contractFor(component, state.options);
      for (const attribute of element.attributes) {
        if (attribute.type !== "JSXAttribute" || attribute.name.name !== "className") continue;
        if (!contract.allowClassName) report(attribute, component, "className", contract);
      }
      for (const expression of styleInputs(element, state)) {
        const properties = referencedStyles(expression, state);
        if (!properties) continue;
        for (const property of properties) {
          if (permittedProperty(property.name, contract)) continue;
          report(property.node, component, property.name, contract);
        }
      }
    }

    return templateVisitors(context, {
      ...state.listeners,
      JSXOpeningElement(node) {
        elements.push(node);
      },
      "Program:exit"() {
        elements.splice(0).forEach(checkElement);
      },
    });
  },
};

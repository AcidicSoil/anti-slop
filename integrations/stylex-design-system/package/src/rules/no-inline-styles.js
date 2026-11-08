import {
  policyOptions,
  contractFor,
  messageFor,
  optionSchema,
  permittedProperty,
  propertyName,
} from "../analysis.js";
import { templateVisitors } from "../template.js";

export const noInlineStyles = {
  meta: {
    type: "problem",
    docs: { description: "Disallow manually authored inline CSS and style elements" },
    schema: optionSchema,
    messages: { inline: "Use StyleX instead of inline CSS on {{element}}." },
  },
  create(context) {
    const options = policyOptions(context);
    function report(node, element, property, policy) {
      context.report({
        node,
        message: messageFor(
          policy,
          { element, component: element, property },
          "Use StyleX instead of inline CSS on {{element}}.",
        ),
      });
    }
    return templateVisitors(context, {
      JSXOpeningElement(node) {
        const element = propertyName(node.name) ?? "component";
        const policy = contractFor(element, options);
        if (element === "style") report(node, element, "", policy);
        for (const attribute of node.attributes) {
          if (attribute.type !== "JSXAttribute" || propertyName(attribute.name) !== "style")
            continue;
          const expression = attribute.value?.expression;
          if (expression?.type !== "ObjectExpression") {
            report(attribute, element, "style", policy);
            continue;
          }
          for (const property of expression.properties) {
            if (property.type !== "Property" || property.computed) {
              report(property, element, "style", policy);
              continue;
            }
            const name = propertyName(property.key);
            if (permittedProperty(name, policy)) continue;
            report(property, element, name, policy);
          }
        }
      },
    });
  },
};

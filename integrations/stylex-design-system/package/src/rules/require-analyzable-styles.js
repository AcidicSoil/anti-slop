import {
  policyOptions,
  effectiveComponent,
  createState,
  messageFor,
  optionSchema,
  referencedStyles,
  styleInputs,
} from "../analysis.js";
import { templateVisitors } from "../template.js";

export const requireAnalyzableStyles = {
  meta: {
    type: "problem",
    docs: { description: "Require resolvable StyleX style references on governed components" },
    schema: optionSchema,
    messages: {
      unknown:
        "Cannot verify {{component}} styles; use local stylex.create references or component variants.",
    },
  },
  create(context) {
    const state = createState(policyOptions(context), context);
    const elements = [];
    return templateVisitors(context, {
      ...state.listeners,
      JSXOpeningElement(node) {
        elements.push(node);
      },
      "Program:exit"() {
        for (const element of elements.splice(0)) {
          const component = effectiveComponent(element, state);
          if (!component) continue;
          for (const expression of styleInputs(element, state)) {
            if (referencedStyles(expression, state) !== null) continue;
            context.report({
              node: expression,
              message: messageFor(
                state.options,
                { component },
                "Cannot verify {{component}} styles; use local stylex.create references or component variants.",
              ),
            });
          }
        }
      },
    });
  },
};

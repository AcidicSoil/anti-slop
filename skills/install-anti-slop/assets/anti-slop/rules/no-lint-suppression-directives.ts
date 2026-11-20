import { defineRule } from "@oxlint/plugins";

import { isSuppressionComment } from "../shared/suppression-directives.ts";

/** Reject comments that bypass lint rules or TypeScript diagnostics. */
export const noLintSuppressionDirectivesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow inline ESLint, Oxlint, and TypeScript diagnostic suppressions.",
    },
    messages: {
      suppression: "Remove the suppression directive and fix the underlying diagnostic.",
    },
  },
  createOnce(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (isSuppressionComment(comment.value)) {
            context.report({ loc: comment.loc, messageId: "suppression" });
          }
        }
      },
    };
  },
});

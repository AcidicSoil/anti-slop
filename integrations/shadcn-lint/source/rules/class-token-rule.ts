import { splitClasses } from "../grammar/classes"
import { classSiteVisitors, type ClassSite } from "../sites/collect"
import { reporter } from "./messages"
import { recognitionSchema } from "./policy-schema"
import { withSettings } from "./settings"

// Small, opt-in class policies share the same JSX/Vue/Svelte collector.
export function classTokenRule(
  name: string,
  messageId: string,
  description: string,
  message: string,
  check: (token: string, site: ClassSite) => Record<string, string> | null
) {
  const messages = { [messageId]: message }
  return {
    meta: {
      type: "suggestion" as const,
      docs: {
        description,
        url: `https://github.com/shadcn-ui/lint/blob/main/docs/rules/${name}.md`,
      },
      schema: [
        {
          type: "object",
          properties: {
            message: { type: "string", maxLength: 500 },
            ...recognitionSchema,
          },
          additionalProperties: false,
        },
      ],
      messages,
    },
    create(context: any) {
      const options = withSettings(context, context.options?.[0] ?? {})
      const emit = reporter(context, messages, {
        rule: `shadcn/${name}`,
        message: options.message,
      })
      return classSiteVisitors(context, options, (site) => {
        for (const { value, node } of site.vocabularyStrings) {
          for (const token of splitClasses(value)) {
            const details = check(token, site)
            if (!details) continue
            emit({ node, messageId, data: { className: token, ...details } })
          }
        }
      })
    },
  }
}

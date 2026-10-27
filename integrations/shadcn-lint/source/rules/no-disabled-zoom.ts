// The browser's zoom control is an accessibility requirement, not a design option.
import { reporter } from "./messages"

const MESSAGES = {
  zoomDisabled:
    "Viewport meta must not disable pinch zoom with user-scalable=no or maximum-scale=1.",
}

export const noDisabledZoom = {
  meta: {
    type: "problem" as const,
    docs: {
      description: "Disallow viewport metadata that restricts user zoom.",
      url: "https://github.com/shadcn-ui/lint/blob/main/docs/rules/no-disabled-zoom.md",
    },
    schema: [
      {
        type: "object",
        properties: { message: { type: "string", maxLength: 500 } },
        additionalProperties: false,
      },
    ],
    messages: MESSAGES,
  },
  create(context: any) {
    const emit = reporter(context, MESSAGES, {
      rule: "shadcn/no-disabled-zoom",
      message: context.options?.[0]?.message,
    })
    return {
      JSXOpeningElement(node: any) {
        if (node.name?.name !== "meta") return
        const attribute = (name: string) =>
          node.attributes.find(
            (attr: any) =>
              attr.type === "JSXAttribute" && attr.name?.name === name
          )?.value
        if (attribute("name")?.value?.toLowerCase() !== "viewport") return
        const content = attribute("content")
        if (typeof content?.value !== "string") return
        for (const item of content.value.split(",")) {
          const directive = item.trim()
          if (
            /^user-scalable\s*=\s*(?:no|0)$/i.test(directive) ||
            /^maximum-scale\s*=\s*1(?:\.0+)?$/i.test(directive)
          ) {
            emit({ node: content, messageId: "zoomDisabled" })
          }
        }
      },
    }
  },
}

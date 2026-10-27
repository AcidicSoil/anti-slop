import { normalizeClass, splitClasses } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferBoundedTextarea = classTokenRule(
  "prefer-bounded-textarea",
  "boundTextarea",
  "Bound content-sized textareas to prevent unbounded growth.",
  '"{{className}}" on textarea needs max-h-* so long input scrolls instead of expanding without limit.',
  (token, site) => {
    if (normalizeClass(token) !== "field-sizing-content") return null
    if (
      site.node?.parent?.type !== "JSXOpeningElement" ||
      site.node.parent.name?.name !== "textarea"
    )
      return null
    const names = site.vocabularyStrings.flatMap(({ value }) =>
      splitClasses(value).map(normalizeClass)
    )
    return names.some((name) => /^max-h-/.test(name)) ? null : {}
  }
)

import { normalizeClass, splitClasses } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferShrinkableTruncate = classTokenRule(
  "prefer-shrinkable-truncate",
  "needShrink",
  "Require shrinkable flex items when using truncation and flex growth.",
  '"{{className}}" on a flex-1 item needs min-w-0 to allow content truncation.',
  (token, site) => {
    if (normalizeClass(token) !== "truncate") return null
    const names = site.vocabularyStrings.flatMap(({ value }) =>
      splitClasses(value).map(normalizeClass)
    )
    return names.includes("flex-1") &&
      !names.some((name) => /^min-w-(?:0|px|\[0(?:px|rem)?\])$/.test(name))
      ? {}
      : null
  }
)

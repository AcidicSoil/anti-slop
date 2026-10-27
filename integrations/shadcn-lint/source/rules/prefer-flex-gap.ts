import {
  normalizeClass,
  splitClasses,
  splitVariants,
  withBase,
} from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferFlexGap = classTokenRule(
  "prefer-flex-gap",
  "preferGap",
  "Prefer parent gap over sibling spacing in wrapping flex layouts.",
  '"{{className}}" uses child margins in a wrapping flex layout. Prefer "{{replacement}}" to align wrapped items.',
  (token, site) => {
    if (splitVariants(token).base.startsWith("-")) return null
    const base = normalizeClass(token)
    const match = /^space-([xy])-(.+)$/.exec(base)
    if (!match || match[2] === "reverse") return null
    const names = site.vocabularyStrings.flatMap(({ value }) =>
      splitClasses(value).map(normalizeClass)
    )
    if (!names.includes("flex") && !names.includes("inline-flex")) return null
    if (!names.includes("flex-wrap") && !names.includes("flex-wrap-reverse"))
      return null
    if (names.includes(`space-${match[1]}-reverse`)) return null
    return { replacement: withBase(token, `gap-${match[1]}-${match[2]}`) }
  }
)

import { normalizeClass, splitVariants } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferFocusVisible = classTokenRule(
  "prefer-focus-visible",
  "preferFocusVisible",
  "Prefer :focus-visible over :focus for visible rings and outlines.",
  '"{{className}}" displays a focus indicator for every focus event. Use "{{replacement}}" for keyboard-focused indicators.',
  (token) => {
    const { variants } = splitVariants(token)
    if (!variants.includes("focus")) return null
    const base = normalizeClass(token)
    if (!/^(ring(?:-|$)|outline(?:-|$))/.test(base)) return null
    if (
      base === "ring-0" ||
      base === "ring-inset" ||
      base === "outline-0" ||
      base === "outline-none" ||
      base === "outline-hidden"
    )
      return null
    return {
      replacement: token.replace(/(^|:)focus:/, "$1focus-visible:"),
    }
  }
)

import { normalizeClass } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const noTransitionAll = classTokenRule(
  "no-transition-all",
  "noTransitionAll",
  "Require explicit transition properties rather than transition-all.",
  '"{{className}}" transitions every property. Use transition-colors, transition-opacity, transition-transform, or a defined transition token.',
  (token) => (normalizeClass(token) === "transition-all" ? {} : null)
)

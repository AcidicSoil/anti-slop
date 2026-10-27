import { normalizeClass, withBase } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const noEaseIn = classTokenRule(
  "no-ease-in",
  "avoidEaseIn",
  "Discourage ease-in UI transitions; prefer responsive exit easing.",
  '"{{className}}" starts slowly. Use "{{replacement}}" for responsive UI transitions.',
  (token) => {
    const base = normalizeClass(token)
    return base !== "ease-in"
      ? null
      : { replacement: withBase(token, "ease-out") }
  }
)

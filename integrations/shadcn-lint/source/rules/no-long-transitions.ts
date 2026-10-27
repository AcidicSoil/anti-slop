import { normalizeClass } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const noLongTransitions = classTokenRule(
  "no-long-transitions",
  "transitionTooLong",
  "Keep authored UI transition durations within 300ms.",
  '"{{className}}" exceeds 300ms. Review the motion token and use a shorter transition.',
  (token) => {
    const base = normalizeClass(token)
    const standard = /^duration-(\d+(?:\.\d+)?)$/.exec(base)
    const custom = /^duration-\[(\d+(?:\.\d+)?)(ms|s)\]$/.exec(base)
    const ms = standard
      ? Number(standard[1])
      : custom
        ? Number(custom[1]) * (custom[2] === "s" ? 1000 : 1)
        : 0
    return ms > 300 ? {} : null
  }
)

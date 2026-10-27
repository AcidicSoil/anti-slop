import { normalizeClass, withBase } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferSmallViewportHeight = classTokenRule(
  "prefer-small-viewport-height",
  "preferSvh",
  "Prefer stable viewport height on document sections and heroes.",
  '"{{className}}" can extend behind mobile browser chrome. Use "{{replacement}}" for document sections, or dvh for pinned app shells.',
  (token) => {
    return normalizeClass(token) === "min-h-screen"
      ? { replacement: withBase(token, "min-h-svh") }
      : null
  }
)

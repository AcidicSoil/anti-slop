import { normalizeClass, splitVariants } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferMotionSafe = classTokenRule(
  "prefer-motion-safe",
  "preferMotionSafe",
  "Opt in to Tailwind animations for users without reduced-motion preference.",
  '"{{className}}" animates without a reduced-motion guard. Use "{{replacement}}".',
  (token) => {
    const { variants } = splitVariants(token)
    const base = normalizeClass(token)
    if (!base.startsWith("animate-") || base === "animate-none") return null
    if (variants.includes("motion-safe") || variants.includes("motion-reduce"))
      return null
    const prefix = variants.length ? `${variants.join(":")}:` : ""
    return { replacement: `${prefix}motion-safe:${splitVariants(token).base}` }
  }
)

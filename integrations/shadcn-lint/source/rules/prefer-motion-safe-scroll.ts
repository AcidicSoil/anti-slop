import { normalizeClass, splitVariants } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const preferMotionSafeScroll = classTokenRule(
  "prefer-motion-safe-scroll",
  "guardSmoothScroll",
  "Respect reduced-motion preferences when using smooth scrolling.",
  '"{{className}}" scrolls smoothly without checking reduced motion. Use "{{replacement}}".',
  (token) => {
    const { variants, base } = splitVariants(token)
    if (
      normalizeClass(token) !== "scroll-smooth" ||
      variants.includes("motion-safe") ||
      variants.includes("motion-reduce")
    )
      return null
    return {
      replacement: `${variants.length ? `${variants.join(":")}:` : ""}motion-safe:${base}`,
    }
  }
)

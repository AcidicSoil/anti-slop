import { normalizeClass, withBase } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

// Only inline-axis classes with a one-to-one Tailwind logical equivalent.
const INLINE = /^(scroll-[mp]|[mp])([lr])(?=-|$)/
const OFFSETS = /^(left|right)(?=-|$)/
const ALIGNMENT = /^text-(left|right)$/
const BORDER = /^border-([lr])(?=-|$)/
const CORNERS = /^rounded-(tl|tr|br|bl)(?=-|$)/

export const preferLogicalUtilities = classTokenRule(
  "prefer-logical-utilities",
  "preferLogical",
  "Prefer writing-direction-independent Tailwind utilities for the inline axis.",
  '"{{className}}" uses a physical inline direction. Use "{{replacement}}" unless physical positioning is intentional.',
  (token) => {
    const base = normalizeClass(token)
    const replacement = base
      .replace(
        INLINE,
        (_, prefix: string, side: string) =>
          `${prefix}${side === "l" ? "s" : "e"}`
      )
      .replace(OFFSETS, (side) => (side === "left" ? "start" : "end"))
      .replace(
        ALIGNMENT,
        (_, side: string) => `text-${side === "left" ? "start" : "end"}`
      )
      .replace(
        BORDER,
        (_, side: string) => `border-${side === "l" ? "s" : "e"}`
      )
      .replace(
        CORNERS,
        (_, corner: string) =>
          `rounded-${({ tl: "ss", tr: "se", br: "ee", bl: "es" } as Record<string, string>)[corner]}`
      )
    return replacement === base
      ? null
      : { replacement: withBase(token, replacement) }
  }
)

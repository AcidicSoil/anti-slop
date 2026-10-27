import { normalizeClass } from "../grammar/classes"
import { classTokenRule } from "./class-token-rule"

export const noSelectionDisableOnContent = classTokenRule(
  "no-selection-disable-on-content",
  "allowSelection",
  "Do not disable text selection on readable content.",
  '"{{className}}" blocks copying readable content. Limit select-none to controls.',
  (token, site) => {
    if (normalizeClass(token) !== "select-none") return null
    const name =
      site.node?.parent?.type === "JSXOpeningElement"
        ? site.node.parent.name?.name
        : null
    return ["body", "main", "article", "p", "a"].includes(name) ? {} : null
  }
)

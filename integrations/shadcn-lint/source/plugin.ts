// meta.name is the rule namespace in Oxlint, so ids are identical across
// both linters: shadcn/no-restyle.

import { noArbitraryValues } from "./rules/no-arbitrary-values"
import { noDisabledZoom } from "./rules/no-disabled-zoom"
import { noEaseIn } from "./rules/no-ease-in"
import { noInlineStyles } from "./rules/no-inline-styles"
import { noLongTransitions } from "./rules/no-long-transitions"
import { noRawColors } from "./rules/no-raw-colors"
import { noRestyle } from "./rules/no-restyle"
import { noSelectionDisableOnContent } from "./rules/no-selection-disable-on-content"
import { noTransitionAll } from "./rules/no-transition-all"
import { noUnknownClasses } from "./rules/no-unknown-classes"
import { preferBoundedTextarea } from "./rules/prefer-bounded-textarea"
import { preferFlexGap } from "./rules/prefer-flex-gap"
import { preferFocusVisible } from "./rules/prefer-focus-visible"
import { preferLogicalUtilities } from "./rules/prefer-logical-utilities"
import { preferMotionSafe } from "./rules/prefer-motion-safe"
import { preferMotionSafeScroll } from "./rules/prefer-motion-safe-scroll"
import { preferShrinkableTruncate } from "./rules/prefer-shrinkable-truncate"
import { preferSmallViewportHeight } from "./rules/prefer-small-viewport-height"
import { requireStaticClasses } from "./rules/require-static-classes"
import { withTemplates } from "./sites/readers"

export const rules = {
  "no-restyle": withTemplates(noRestyle),
  "no-raw-colors": withTemplates(noRawColors),
  "no-arbitrary-values": withTemplates(noArbitraryValues),
  "no-inline-styles": withTemplates(noInlineStyles),
  "require-static-classes": withTemplates(requireStaticClasses),
  "no-unknown-classes": withTemplates(noUnknownClasses),
  "prefer-logical-utilities": withTemplates(preferLogicalUtilities),
  "prefer-focus-visible": withTemplates(preferFocusVisible),
  "prefer-motion-safe": withTemplates(preferMotionSafe),
  "no-transition-all": withTemplates(noTransitionAll),
  "no-disabled-zoom": withTemplates(noDisabledZoom),
  "no-ease-in": withTemplates(noEaseIn),
  "no-long-transitions": withTemplates(noLongTransitions),
  "no-selection-disable-on-content": withTemplates(noSelectionDisableOnContent),
  "prefer-bounded-textarea": withTemplates(preferBoundedTextarea),
  "prefer-flex-gap": withTemplates(preferFlexGap),
  "prefer-motion-safe-scroll": withTemplates(preferMotionSafeScroll),
  "prefer-shrinkable-truncate": withTemplates(preferShrinkableTruncate),
  "prefer-small-viewport-height": withTemplates(preferSmallViewportHeight),
}

export const plugin = {
  meta: { name: "shadcn" },
  rules,
}

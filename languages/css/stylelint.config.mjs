// Example: copy to the consuming repository root and merge with its existing config.
// Install or vendor the plugin at tools/stylelint/anti-slop-css/.
const disallowedPhysicalProperties = [
  "/^(margin|padding)-(left|right)$/",
  "/^border-(left|right)(?:-(width|color|style))?$/",
];

export default {
  extends: ["stylelint-config-standard"],
  plugins: ["./tools/stylelint/anti-slop-css/index.mjs"],
  rules: {
    "anti-slop-css/max-stylesheet-size": [500, { warningAt: 300 }],
    "anti-slop-css/require-style-ownership": {
      sourceRoots: ["."],
      ownerDirectories: [],
      scopedSuffixes: [],
      allowedGlobalDirectories: [],
      allowedGlobalFiles: ["src/styles/globals.css", "src/styles/tokens.css"],
    },
    "at-rule-no-unknown": [true, {
      ignoreAtRules: ["theme", "utility", "source", "reference", "plugin", "config", "custom-variant", "variant", "apply"],
    }],
    // Good CSS: prefer logical inline-axis properties and explicit transitions.
    "property-disallowed-list": disallowedPhysicalProperties,
    "declaration-property-value-disallowed-list": {
      transition: ["/(^|,)\\s*all\\b/"],
      "transition-property": ["all"],
    },
    "max-nesting-depth": 2,
    "selector-max-specificity": "0,3,0",
    "selector-max-compound-selectors": 3,
    "selector-max-id": 0,
    "declaration-no-important": true,
    "no-duplicate-selectors": true,
    "declaration-block-no-duplicate-properties": true,
  },
  overrides: [
    {
      files: ["src/styles/globals.css"],
      rules: {
        "property-disallowed-list": [...disallowedPhysicalProperties, "/^--/"],
        "at-rule-disallowed-list": ["theme", "apply", "utility", "variant", "custom-variant"],
        "selector-disallowed-list": ["/\\.[A-Za-z_-][\\w-]*/", "/#[A-Za-z_-][\\w-]*/"],
      },
    },
    {
      files: ["src/styles/tokens.css"],
      rules: {
        "at-rule-disallowed-list": ["import", "apply", "layer"],
        "selector-disallowed-list": ["/^(?!:root$|\\.dark$).+/"],
      },
    },
  ],
};

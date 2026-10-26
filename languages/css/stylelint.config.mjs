// Example: copy to the consuming repository root and merge with its existing config.
// Install or vendor the plugin at tools/stylelint/anti-slop-css/.
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["./tools/stylelint/anti-slop-css/index.mjs"],
  rules: {
    "anti-slop-css/max-stylesheet-size": [500, { warningAt: 300 }],
    "anti-slop-css/require-style-ownership": {
      sourceRoots: ["src"],
      ownerDirectories: ["features", "components"],
      scopedSuffixes: [".module.css", ".module.scss"],
      allowedGlobalDirectories: ["src/styles"],
      allowedGlobalFiles: ["src/app.css", "src/index.css", "src/global.css"],
    },
    "anti-slop-css/no-cross-feature-styling": {
      featureRoot: "src/features",
      allowGlobalSelectors: false,
    },
    "max-nesting-depth": 2,
    "selector-max-specificity": "0,3,0",
    "selector-max-compound-selectors": 3,
    "selector-max-id": 0,
    "declaration-no-important": true,
    "no-duplicate-selectors": true,
    "declaration-block-no-duplicate-properties": true,
  },
};

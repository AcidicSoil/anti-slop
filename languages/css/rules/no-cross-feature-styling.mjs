import stylelint from "stylelint";
import { featureOf, referenceTarget, sourcePath } from "./paths.mjs";

const ruleName = "anti-slop-css/no-cross-feature-styling";
const messages = stylelint.utils.ruleMessages(ruleName, {
  dependency: (target) => `Stylesheet references another feature's private CSS: "${target}"`,
  global: () => "Feature styles must not escape local scoping with :global",
});
const valid = (option) => option && typeof option === "object" &&
  typeof option.featureRoot === "string" && option.featureRoot.length > 0 &&
  (option.allowGlobalSelectors === undefined || typeof option.allowGlobalSelectors === "boolean");

// CSS @import, CSS Modules composes, and @value all accept quoted relative paths.
function importReference(text) {
  return text.match(/(?:^|\s|\()(["'])(\.[^"']+)\1/)?.[2] ?? null;
}

const rule = (option) => (root, result) => {
  if (!stylelint.utils.validateOptions(result, ruleName, { actual: option, possible: valid })) return;
  const file = sourcePath(root);
  const feature = file && featureOf(file, option.featureRoot);
  if (!feature) return;

  function checkDependency(node, reference) {
    if (!reference) return;
    const target = referenceTarget(file, reference);
    const destinationFeature = target && featureOf(target, option.featureRoot);
    if (destinationFeature && destinationFeature !== feature) {
      stylelint.utils.report({ result, ruleName, message: messages.dependency(target), node });
    }
  }

  root.walkAtRules((node) => {
    if (node.name === "import" || node.name === "value") checkDependency(node, importReference(node.params));
  });
  root.walkDecls("composes", (node) => {
    checkDependency(node, importReference(node.value));
  });
  if (!option.allowGlobalSelectors) {
    root.walkRules((node) => {
      if (/:global\b/.test(node.selector)) {
        stylelint.utils.report({ result, ruleName, message: messages.global(), node });
      }
    });
  }
};
rule.ruleName = ruleName;
rule.messages = messages;
export default stylelint.createPlugin(ruleName, rule);

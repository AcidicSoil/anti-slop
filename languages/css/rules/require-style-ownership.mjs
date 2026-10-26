import stylelint from "stylelint";
import { inside, sourcePath } from "./paths.mjs";

const ruleName = "anti-slop-css/require-style-ownership";
const messages = stylelint.utils.ruleMessages(ruleName, {
  unscoped: (file) => `Feature/component stylesheet "${file}" must use a configured scoped suffix`,
  unowned: (file) => `Stylesheet "${file}" has no declared owner and is not an allowed global stylesheet`,
});

const valid = (option) => option && typeof option === "object" &&
  ["sourceRoots", "ownerDirectories", "scopedSuffixes", "allowedGlobalDirectories", "allowedGlobalFiles"]
    .every((key) => Array.isArray(option[key]) && option[key].every((value) => typeof value === "string" && value.length > 0));

const rule = (option) => (root, result) => {
  if (!stylelint.utils.validateOptions(result, ruleName, { actual: option, possible: valid })) return;
  const file = sourcePath(root);
  if (!file || !option.sourceRoots.some((directory) => inside(directory, file))) return;

  if (option.allowedGlobalFiles.includes(file) ||
      option.allowedGlobalDirectories.some((directory) => inside(directory, file))) return;

  const parts = file.split("/");
  if (parts.some((part) => option.ownerDirectories.includes(part))) {
    if (option.scopedSuffixes.some((suffix) => file.endsWith(suffix))) return;
    stylelint.utils.report({ result, ruleName, message: messages.unscoped(file), node: root, index: 0, endIndex: 1 });
    return;
  }
  stylelint.utils.report({ result, ruleName, message: messages.unowned(file), node: root, index: 0, endIndex: 1 });
};
rule.ruleName = ruleName;
rule.messages = messages;
export default stylelint.createPlugin(ruleName, rule);

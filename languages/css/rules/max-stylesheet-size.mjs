import stylelint from "stylelint";

const ruleName = "anti-slop-css/max-stylesheet-size";
const messages = stylelint.utils.ruleMessages(ruleName, {
  exceeded: (lines, limit) => `Stylesheet contains ${lines} lines (limit ${limit}); extract styles into owning components or features`,
});

const rule = (limit, secondary) => (root, result) => {
  if (!stylelint.utils.validateOptions(result, ruleName, {
    actual: limit,
    possible: (value) => Number.isInteger(value) && value > 0,
  }, {
    actual: secondary,
    possible: { warningAt: (value) => Number.isInteger(value) && value > 0 && value < limit },
    optional: true,
  })) return;

  const source = root.source?.input?.css ?? root.toString();
  const lines = source.replace(/\r\n/g, "\n").split("\n").length - (source.endsWith("\n") ? 1 : 0);
  const warningAt = secondary?.warningAt ?? limit;
  if (lines <= warningAt) return;

  const overLimit = lines > limit;
  stylelint.utils.report({
    result,
    ruleName,
    message: messages.exceeded(lines, overLimit ? limit : warningAt),
    node: root,
    index: 0,
    endIndex: 1,
    ...(overLimit ? {} : { severity: "warning" }),
  });
};
rule.ruleName = ruleName;
rule.messages = messages;
export default stylelint.createPlugin(ruleName, rule);

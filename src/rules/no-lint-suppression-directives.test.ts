import { RuleTester } from "oxlint/plugins-dev";

import { noLintSuppressionDirectivesRule } from "./no-lint-suppression-directives.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "suppression" };

tester.run("anti-slop/no-lint-suppression-directives", noLintSuppressionDirectivesRule, {
  valid: [
    "// Explain why this operation is safe.\nconst x = 1;",
    "// This comment mentions eslint-disable-next-line without using it.\nconst x = 1;",
    "const sample = '// eslint-disable';",
    "// @ts-check\nconst x = 1;",
    "// SAFETY: This checked invariant holds.\nconst x = 1;",
  ],
  invalid: [
    { code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;", errors: [error] },
    { code: "const x = 1; // eslint-disable-line no-unused-vars", errors: [error] },
    { code: "/* eslint-disable no-console */\nconst x = 1;", errors: [error] },
    { code: "/* eslint-disable */\nconst x = 1;", errors: [error] },
    { code: "// oxlint-disable-next-line no-console\nconst x = 1;", errors: [error] },
    { code: "/* oxlint-disable */\nconst x = 1;", errors: [error] },
    { code: "// @ts-ignore\nconst x = 1;", errors: [error] },
    { code: "// @ts-nocheck\nconst x = 1;", errors: [error] },
    { code: "// @ts-expect-error: migration\nconst x = 1;", errors: [error] },
    { code: "/*\n * eslint-disable-next-line no-unused-vars\n */\nconst x = 1;", errors: [error] },
  ],
});

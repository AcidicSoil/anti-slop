const suppressionDirective = /^\s*(?:\*+\s*)?(?:(?:eslint|oxlint)-disable(?:-next-line|-line)?\b|@ts-(?:ignore|nocheck|expect-error)\b)/;

/** Shared detection for comment tokens from Oxlint and Oxc parser. */
export function isSuppressionComment(value: string): boolean {
  return value.split(/\r?\n/).some((line) => suppressionDirective.test(line));
}

/** PowerShell recognizes ASCII and four Unicode single-quote delimiters.
 * Double each delimiter before placing a path inside a single-quoted literal.
 * Dollar signs, backticks and double quotes then remain literal path data. */
export function powershellSingleQuotedBody(value: string): string {
  return value.replaceAll(/['\u2018-\u201B]/gu, "$&$&");
}

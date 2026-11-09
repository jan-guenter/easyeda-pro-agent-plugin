/** V3 removes a separator only when the restricted lexer reproduces both exact
 * adjacent tokens. Historical v2 remains unchanged and restores independently. */
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES as MAXIMUM,
  currentPcbDiagnosticCSharpTokenSha256 as hashTokens, currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import type { CurrentCSharpSpacing } from "./current-pcb-diagnostic-csharp-spacing.ts";

type Token = ReturnType<typeof tokenize>[number];
const bad = (): never => { throw new Error("PCB_DIAGNOSTIC_CSHARP_SPACING_V3"); };
const need = (value: boolean): void => { if (!value) { bad(); } };
/** Encode a nonnegative bounded spacing integer; unsupported offsets refuse rather than truncate. */
function integer(value: number): Buffer {
  need(Number.isSafeInteger(value) && value >= 0);
  const bytes: number[] = [];
  let remaining = value;
  do {
    let byte = remaining % 128;
    remaining = Math.floor(remaining / 128);
    if (remaining > 0) { byte += 128; }
    bytes.push(byte);
  } while (remaining > 0);
  return Buffer.from(bytes);
}
/** Decide whether two adjacent token texts lex as the same two tokens; retain trivia when concatenation changes either token. */
function adjacent(left: Token | undefined, right: Token): boolean {
  if (left === undefined) { return true; }
  // Keep the separator before a dot after a number. The historical restricted
  // Scanner does not recognize a C# real literal ending in a dot.
  if (left.kind === "number" && right.text.startsWith(".")) { return false; }
  try {
    const pair = tokenize(left.text + right.text);
    return pair.length === 2 && pair[0]?.kind === left.kind && pair[0].text === left.text &&
      pair[1]?.kind === right.kind && pair[1].text === right.text;
  } catch (error) {
    if (error instanceof Error && error.message === "PCB_DIAGNOSTIC_CSHARP_SPACING") { return false; }
    throw error;
  }
}
/** Compact the restricted C# token stream with reversible trivia metadata and a complete token hash, preserving the unchanged compiler bound. */
export function compactCurrentPcbDiagnosticCSharpV3(source: string): CurrentCSharpSpacing {
  const active = tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
  need(active.length > 0);
  const parts: string[] = [];
  const records: Buffer[][] = [];
  let count = 0;
  let last = 0;
  let position = 0;
  let prior = 0;
  let previous: Token | undefined;
  for (const token of active) {
    const gap = source.slice(last, token.start);
    const replacement = gap.length > 0 && !adjacent(previous, token) ? " " : "";
    if (gap !== replacement) {
      const bytes = Buffer.from(gap);
      records.push([integer(position - prior), integer(replacement.length), integer(bytes.length), bytes]);
      prior = position + replacement.length;
      count += 1;
    }
    parts.push(replacement, token.text);
    position += replacement.length + token.text.length;
    last = token.end;
    previous = token;
  }
  if (last < source.length) {
    const bytes = Buffer.from(source.slice(last));
    records.push([integer(position - prior), integer(0), integer(bytes.length), bytes]);
    count += 1;
  }
  const compact = parts.join("");
  const spacing = Buffer.concat([integer(count), ...records.flat()]);
  const tokenSha256 = hashTokens(source);
  if (spacing.length > MAXIMUM) {
    throw new Error(`PCB_DIAGNOSTIC_CSHARP_SPACING_V3: measured=${String(spacing.length)}, limit=${String(MAXIMUM)}`);
  }
  need(tokenSha256 === hashTokens(compact));
  return Object.freeze({ compact, spacing, tokenSha256 });
}
/** Restore the exact C# review bytes, verify the token hash and require canonical version-three recompaction. */
export function restoreCurrentPcbDiagnosticCSharpV3(compact: string, spacing: Buffer, expectedTokenSha256: string): string {
  need(spacing.length > 0 && spacing.length <= MAXIMUM && /^[a-f\d]{64}$/u.test(expectedTokenSha256));
  // Validate the complete compact input before interpreting restoration offsets.
  need(hashTokens(compact) === expectedTokenSha256);
  let offset = 0;
  const read = (): number => {
    const start = offset;
    let complete = false;
    let scale = 1;
    let value = 0;
    while (offset < spacing.length && offset - start < 4 && !complete) {
      const byte = spacing[offset];
      if (byte === undefined) { return bad(); }
      value += (byte % 128) * scale;
      scale *= 128;
      offset += 1;
      complete = byte < 128;
    }
    need(complete && integer(value).equals(spacing.subarray(start, offset)));
    return value;
  };
  const count = read();
  need(count <= MAXIMUM / 3);
  const parts: string[] = [];
  let prior = 0;
  for (let index = 0; index < count; index += 1) {
    const at = prior + read();
    const replaced = read();
    const length = read();
    need((replaced === 0 || replaced === 1) && at >= prior && at + replaced <= compact.length && length > 0 && offset + length <= spacing.length);
    need(replaced === 0 || compact.slice(at, at + replaced) === " ");
    const gap = spacing.subarray(offset, offset + length).toString("latin1");
    need(!/[\u0080-\uFFFF\0]/u.test(gap));
    offset += length;
    parts.push(compact.slice(prior, at), gap);
    prior = at + replaced;
  }
  need(offset === spacing.length);
  parts.push(compact.slice(prior));
  const source = parts.join("");
  const actual = compactCurrentPcbDiagnosticCSharpV3(source);
  need(actual.compact === compact && actual.spacing.equals(spacing) && actual.tokenSha256 === expectedTokenSha256);
  return source;
}

/** Reversible trivia compaction of the generated ASCII C#5 subset only.
 * Comments/whitespace remain separators; literal and token bytes never change.
 * Unsupported lexical forms refuse rather than acquiring a guessed rewrite. */
import { createHash } from "node:crypto";

export const CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES = 131_072;
export interface CurrentCSharpSpacing {
  readonly compact: string; readonly spacing: Buffer; readonly tokenSha256: string;
}
type Kind = "space" | "comment" | "identifier" | "number" | "symbol" | "string" | "verbatim" | "char";
interface Token { readonly kind: Kind; readonly start: number; readonly end: number; readonly text: string }
/** Read-only build analysis of the same restricted lexer. No new lexical form
 * or historical compaction rule is admitted by exposing these observations. */
export function currentPcbDiagnosticCSharpLexicalTokens(source: string): readonly Readonly<Token>[] {
  return Object.freeze(tokens(source).map(token => Object.freeze(token)));
}
export function currentPcbDiagnosticCSharpTokenSha256(source: string): string {
  return hashTokens(tokens(source));
}
const number = /^(?:0[xX][a-fA-F\d]+(?:[uU][lL]?|[lL][uU]?)?|(?:\d+\.\d+|\.\d+)(?:[eE][+-]?\d+)?[fFdDmM]?|\d+[eE][+-]?\d+[fFdDmM]?|\d+[fFdDmM]|\d+(?:[uU][lL]?|[lL][uU]?)?)/u;
const operators = Object.freeze([">>=", "<<=", "++", "--", "->", "&&", "||", "??", "::", "=>", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>"]);
const bad = (): never => { throw new Error("PCB_DIAGNOSTIC_CSHARP_SPACING"); };
const need = (value: boolean): void => { if (!value) { bad(); } };
const ascii = (text: string): void => { need(text.length > 0 && text.length === Buffer.byteLength(text) && !/[\u0080-\uFFFF\0]/u.test(text)); };
function verbatimEnd(source: string, start: number): number {
  let index = start + 2;
  while (index < source.length) {
    if (source[index] !== '"') { index += 1; }
    else if (source[index + 1] === '"') { index += 2; }
    else { return index + 1; }
  }
  return bad();
}
function escapeEnd(source: string, start: number, character: boolean): number {
  const marker = source[start + 1]; if (marker === undefined) { return bad(); }
  if (String.raw`'"\0abfnrtv`.includes(marker)) { return start + 2; }
  if (marker === "x") { const match = /^[a-fA-F\d]{1,4}/u.exec(source.slice(start + 2)); if (match === null) { return bad(); } return start + 2 + match[0].length; }
  if (marker !== "u" && marker !== "U") { return bad(); }
  const length = marker === "u" ? 4 : 8;
  const value = source.slice(start + 2, start + 2 + length);
  need(value.length === length && /^[a-fA-F\d]+$/u.test(value));
  need(Number.parseInt(value, 16) <= (character ? 65_535 : 1_114_111)); return start + length + 2;
}
function quotedEnd(source: string, start: number, quote: string): number {
  need(!source.startsWith('"""', start)); let index = start + 1; let characters = 0;
  while (index < source.length) {
    const value = source[index]; need(value !== "\r" && value !== "\n");
    if (value === quote) { need(quote !== "'" || characters === 1); return index + 1; }
    index = value === "\\" ? escapeEnd(source, index, quote === "'") : index + 1; characters += 1;
  }
  return bad();
}
function tokens(source: string): readonly Token[] {
  ascii(source); const result: Token[] = []; let index = 0;
  while (index < source.length) {
    const start = index; const character = source[index]; if (character === undefined) { return bad(); } let kind: Kind = "symbol";
    if (/[\t\n\v\f\r ]/u.test(character)) { kind = "space"; do { index += 1; } while (index < source.length && /[\t\n\v\f\r ]/u.test(source[index] ?? "")); }
    else if (source.startsWith("//", index)) { kind = "comment"; index += 2; while (index < source.length && !/[\r\n]/u.test(source[index] ?? "")) { index += 1; } }
    else if (source.startsWith("/*", index)) { kind = "comment"; const end = source.indexOf("*/", index + 2); need(end !== -1); index = end + 2; }
    else if (source.startsWith('@"', index)) { kind = "verbatim"; index = verbatimEnd(source, index); }
    else if (character === '"' || character === "'") { kind = character === '"' ? "string" : "char"; index = quotedEnd(source, index, character);
    } else if (/[A-Za-z_]/u.test(character) || character === "@" && /[A-Za-z_]/u.test(source[index + 1] ?? "")) {
      kind = "identifier"; index += 1; while (index < source.length && /[A-Za-z_\d]/u.test(source[index] ?? "")) { index += 1; }
      need(!["CallerLineNumber", "CallerLineNumberAttribute", "CallerFilePath", "CallerFilePathAttribute"].includes(source.slice(start, index).replace(/^@/u, "")));
    } else if (/\d/u.test(character) || character === "." && /\d/u.test(source[index + 1] ?? "")) {
      kind = "number"; const match = number.exec(source.slice(index)); if (match === null) { return bad(); } index += match[0].length;
      need(!/[A-Za-z_]/u.test(source[index] ?? ""));
    } else {
      // In particular, # directives, Unicode identifier escapes, interpolation,
      // Raw strings and every unknown C# form must remain outside this profile.
      need("{}[]().,:;+-*/%&|^!~=?<>".includes(character) && !["..", "?.", "?[", "??="].some(value => source.startsWith(value, start)));
      const operator = operators.find(value => source.startsWith(value, start)); index += operator?.length ?? 1;
    }
    result.push({ kind, start, end: index, text: source.slice(start, index) });
  }
  return result;
}
function hashTokens(values: readonly Token[]): string {
  const hash = createHash("sha256");
  for (const token of values) {
    if (token.kind !== "space" && token.kind !== "comment") { const bytes = Buffer.from(`${token.kind}\0${token.text}`), length = Buffer.alloc(4); length.writeUInt32BE(bytes.length); hash.update(length); hash.update(bytes); }
  }
  return hash.digest("hex");
}
function integer(value: number): Buffer {
  need(Number.isSafeInteger(value) && value >= 0); const bytes: number[] = []; let remaining = value;
  do { let byte = remaining % 128; remaining = Math.floor(remaining / 128); if (remaining > 0) { byte += 128; } bytes.push(byte); } while (remaining > 0);
  return Buffer.from(bytes);
}
/** Metadata is a canonical count plus delta-offset/replacement-length/original-
 * length/raw-trivia records. The compact input supplies all executable bytes. */
export function compactCurrentPcbDiagnosticCSharp(source: string): CurrentCSharpSpacing {
  const original = tokens(source); const active = original.filter(token => token.kind !== "space" && token.kind !== "comment"); need(active.length > 0);
  const parts: string[] = [], records: Buffer[][] = [];
  let count = 0, last = 0, position = 0, prior = 0;
  for (const token of active) {
    const gap = source.slice(last, token.start), replacement = gap.length > 0 && last > 0 ? " " : "";
    if (gap !== replacement) { const bytes = Buffer.from(gap); records.push([integer(position - prior), integer(replacement.length), integer(bytes.length), bytes]); prior = position + replacement.length; count += 1; }
    parts.push(replacement, token.text); position += replacement.length + token.text.length; last = token.end;
  }
  if (last < source.length) { const bytes = Buffer.from(source.slice(last)); records.push([integer(position - prior), integer(0), integer(bytes.length), bytes]); count += 1; }
  const compact = parts.join(""), spacing = Buffer.concat([integer(count), ...records.flat()]), tokenSha256 = hashTokens(original);
  need(spacing.length <= CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES && tokenSha256 === hashTokens(tokens(compact)));
  return Object.freeze({ compact, spacing, tokenSha256 });
}
export function restoreCurrentPcbDiagnosticCSharp(compact: string, spacing: Buffer, expectedTokenSha256: string): string {
  ascii(compact); need(spacing.length > 0 && spacing.length <= CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES && /^[a-f\d]{64}$/u.test(expectedTokenSha256));
  let offset = 0;
  const read = (): number => { const start = offset; let complete = false, scale = 1, value = 0;
    while (offset < spacing.length && offset - start < 4 && !complete) { const byte = spacing[offset]; if (byte === undefined) { return bad(); } value += (byte % 128) * scale; scale *= 128; offset += 1; complete = byte < 128; }
    need(complete && integer(value).equals(spacing.subarray(start, offset))); return value;
  };
  const count = read(); need(count <= CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES / 3);
  const parts: string[] = []; let prior = 0;
  for (let index = 0; index < count; index += 1) {
    const at = prior + read(); const replaced = read(); const length = read(); need((replaced === 0 || replaced === 1) && at >= prior && at + replaced <= compact.length && length > 0 && offset + length <= spacing.length);
    need(replaced === 0 || compact.slice(at, at + replaced) === " ");
    const gap = spacing.subarray(offset, offset + length).toString("latin1"); need(!/[\u0080-\uFFFF\0]/u.test(gap)); offset += length;
    parts.push(compact.slice(prior, at), gap); prior = at + replaced;
  }
  need(offset === spacing.length); parts.push(compact.slice(prior)); const source = parts.join("");
  const actual = compactCurrentPcbDiagnosticCSharp(source);
  need(actual.compact === compact && actual.spacing.equals(spacing) && actual.tokenSha256 === expectedTokenSha256); return source;
}

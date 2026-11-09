/** Lossless build-only aliases for fixed framework types in the schematic
 * compiler. Original C# bytes are restored before any maintained source pass. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";

const BEGIN = "// BEGIN FIXED SCHEMATIC TYPE ALIASES V1\n";
const END = "// END FIXED SCHEMATIC TYPE ALIASES V1\n";
const ANCHOR = "using System;\n";
const TYPES = Object.freeze([
  "System.InvalidOperationException", "System.Collections.IDictionary", "System.Collections.Hashtable", "System.Collections.ArrayList",
  "System.StringComparer", "System.Text.Encoding", "System.Text.StringBuilder", "System.Security.Cryptography.SHA256",
  "System.BitConverter", "System.Globalization.CultureInfo", "System.Text.RegularExpressions.Regex", "System.Globalization.NumberStyles",
  "System.Text.RegularExpressions.RegexOptions", "System.ArgumentException", "System.Convert", "System.IO.IOException",
] as const);
const ALIASES = Object.freeze(TYPES.map((_value, index) => `ZQ${String(index)}`));
const digest = (source: string): string => createHash("sha256").update(source).digest("hex");
type Token = ReturnType<typeof tokenize>[number];

/** Refuse unsupported source or a changed fixed storage contract. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_NATIVE_TYPE_ALIASES"); } }

/** Preserve the complete original byte hash in build-only comments. Aliases
 * are concrete non-generic framework types supported by the C#5 compilation. */
function block(length: number, hash: string): string {
  return `${BEGIN}// fixed-schematic-type-alias-source ${String(length)} ${hash}\n${TYPES.map((type, index) => `using ${ALIASES[index] ?? ""}=${type};\n`).join("")}${END}`;
}

/** Admit only the existing global-using profile and rule out every declaration
 * or alias that could shadow root System or a fresh short alias. Literal and
 * comment text is ignored; escaped identifier spellings remain significant. */
function originalTokens(source: string): readonly Token[] {
  need(Buffer.byteLength(source) <= MAXIMUM);
  const active = tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
  const first = active[0]; need(first?.text === "using" && active[1]?.text === "System" && active[2]?.text === ";" && source.slice(first.start, first.start + ANCHOR.length) === ANCHOR);
  for (const [index, token] of active.entries()) {
    if (token.kind === "identifier") {
      const name = token.text.replace(/^@/u, "");
      need(!ALIASES.includes(name) && name !== "namespace");
      if (name === "System") {
        need(token.text === "System" && (active[index + 1]?.text === "." || active[index - 1]?.text === "using" && active[index + 1]?.text === ";"));
      }
    }
  }
  return active;
}

/** Select one whole fixed type spelling at a lexer-proved identifier boundary;
 * comments or whitespace inside it are left unchanged for exact restoration. */
function typeMatch(source: string, active: readonly Token[], index: number): Readonly<{ alias: string; count: number; last: Token }> | null {
  const token = active[index]; need(token !== undefined);
  for (const [number, type] of TYPES.entries()) {
    const parts = type.split(".");
    const count = parts.length * 2 - 1, last = active[index + parts.length * 2 - 2];
    if (last !== undefined && source.slice(token.start, last.end) === type) {
      need(active[index + count]?.text !== "::");
      const alias = ALIASES[number]; need(alias !== undefined); return { alias, count, last };
    }
  }
  return null;
}
/** Replace only contiguous, fixed root-System type token sequences. Existing
 * whitespace/comments within a qualified spelling remain entirely untouched. */
function projectOriginal(source: string): string {
  const active = originalTokens(source), first = active[0]; need(first !== undefined);
  let directiveEnd = 0;
  for (let index = 0; active[index]?.text === "using" && active[index + 1]?.text !== "(";) {
    do { index += 1; need(index < active.length); } while (active[index]?.text !== ";");
    const last = active[index]; need(last !== undefined); directiveEnd = last.end; index += 1;
  }
  let prior = 0, replacements = 0, result = "";
  for (let index = 0; index < active.length; index += 1) {
    const token = active[index];
    if (token !== undefined && token.start >= directiveEnd && token.kind === "identifier" && token.text === "System" && active[index - 1]?.text !== "." && active[index - 1]?.text !== "::") {
      const match = typeMatch(source, active, index);
      if (match !== null) {
        result += source.slice(prior, token.start) + match.alias; prior = match.last.end; replacements += 1; index += match.count - 1;
      }
    }
  }
  need(replacements > 0);
  result += source.slice(prior);
  return result.slice(0, first.start) + block(Buffer.byteLength(source), digest(source)) + result.slice(first.start);
}

/** Restore each aliased identifier to its one fixed original spelling, then
 * verify the complete original bytes and canonical projection. Changed blocks,
 * mixed aliases, collisions and misplaced metadata fail closed. */
export function expandCurrentSchematicNativeTypeAliases(source: string): string {
  const start = source.indexOf(BEGIN);
  if (start === -1) { need(!source.includes(END) && !tokenize(source).some(token => token.kind === "identifier" && ALIASES.includes(token.text.replace(/^@/u, "")))); return source; }
  need(source.split(BEGIN).length === 2 && source.split(END).length === 2);
  const stop = source.indexOf(END, start) + END.length;
  const match = /^\/\/ fixed-schematic-type-alias-source ([1-9]\d*) ([a-f\d]{64})\n/u.exec(source.slice(start + BEGIN.length));
  need(stop > start && match !== null);
  const hash = match[2], length = Number(match[1]); need(Number.isSafeInteger(length) && length <= MAXIMUM && hash !== undefined && source.slice(start, stop) === block(length, hash));
  const without = source.slice(0, start) + source.slice(stop);
  let prior = 0, restored = "";
  for (const token of tokenize(without)) {
    if (token.kind === "identifier") {
      const index = ALIASES.indexOf(token.text);
      if (index !== -1) {
        const type = TYPES[index]; need(type !== undefined);
        restored += without.slice(prior, token.start) + type; prior = token.end;
      }
    }
  }
  restored += without.slice(prior);
  need(Buffer.byteLength(restored) === length && digest(restored) === hash && projectOriginal(restored) === source);
  return restored;
}

/** Apply only the fixed schematic type catalogue, with full byte restoration
 * and repeat-generation parity. No runtime or caller-selected catalogue exists. */
export function projectCurrentSchematicNativeTypeAliases(input: string): string {
  const source = expandCurrentSchematicNativeTypeAliases(input);
  const result = projectOriginal(source);
  need(expandCurrentSchematicNativeTypeAliases(result) === source); return result;
}

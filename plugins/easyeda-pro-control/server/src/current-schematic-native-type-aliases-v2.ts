/** Immutable V2 build aliases layered over the unchanged schematic V1 codec.
 * Only fixed type/namespace references change. Class declarations and original
 * review bytes survive expansion before any maintained source transform. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { expandCurrentSchematicNativeTypeAliases as expandV1, projectCurrentSchematicNativeTypeAliases as projectV1 } from "./current-schematic-native-type-aliases.ts";

const BEGIN = "// BEGIN FIXED SCHEMATIC TYPE ALIASES V2\n", END = "// END FIXED SCHEMATIC TYPE ALIASES V2\n";
type Kind = "qualified" | "namespace" | "exception" | "member" | "helper";
interface Entry { readonly spelling: string; readonly target: string; readonly kind: Kind }
/** V2 catalogue order and contents are a storage contract. Additions require a
 * new version, including when the new entry is absent from historical input. */
const CATALOGUE: readonly Readonly<Entry>[] = Object.freeze(([
  { spelling: "System.Collections.Generic", target: "System.Collections.Generic", kind: "namespace" },
  { spelling: "System.StringComparison", target: "System.StringComparison", kind: "qualified" },
  { spelling: "System.IntPtr", target: "System.IntPtr", kind: "qualified" },
  { spelling: "System.Text.RegularExpressions.Match", target: "System.Text.RegularExpressions.Match", kind: "qualified" },
  { spelling: "System.Collections.DictionaryEntry", target: "System.Collections.DictionaryEntry", kind: "qualified" },
  { spelling: "System.Text.UTF8Encoding", target: "System.Text.UTF8Encoding", kind: "qualified" },
  { spelling: "System.IO.MemoryStream", target: "System.IO.MemoryStream", kind: "qualified" },
  { spelling: "System.IO.Compression.GZipStream", target: "System.IO.Compression.GZipStream", kind: "qualified" },
  { spelling: "System.IO.Compression.CompressionMode", target: "System.IO.Compression.CompressionMode", kind: "qualified" },
  { spelling: "System.Runtime.InteropServices.Marshal", target: "System.Runtime.InteropServices.Marshal", kind: "qualified" },
  { spelling: "System.Diagnostics.Stopwatch", target: "System.Diagnostics.Stopwatch", kind: "qualified" },
  { spelling: "System.DateTime", target: "System.DateTime", kind: "qualified" },
  { spelling: "System.TimeSpan", target: "System.TimeSpan", kind: "qualified" },
  { spelling: "System.TimeZoneInfo", target: "System.TimeZoneInfo", kind: "qualified" },
  { spelling: "InvalidOperationException", target: "System.InvalidOperationException", kind: "exception" },
  { spelling: "StringComparison", target: "System.StringComparison", kind: "member" },
  { spelling: "StringComparer", target: "System.StringComparer", kind: "member" },
  ...[
    "EasyedaDiagnosticFixedTable", "EasyedaSchematicProgramDataV5", "EasyedaSchematicUiFixedCodec",
    "EasyedaFootprintExecutionLimits", "EasyedaRatline209Limits", "EasyedaRatlineContinuation209Limits",
    "EasyedaFootprintCombinedLimits", "EasyedaFootprintForwardLimits", "EasyedaFootprintCopyMainCompletionProtocol",
    "EasyedaFootprintHeadAgeProtocol", "EasyedaFootprintPreparationLimits", "EasyedaSchematicRelevanceNormalCommandBodyProtocol",
    "EasyedaGeneratedInitialSyncProtocol", "EasyedaProjectStructureLimits", "EasyedaFootprintSavedLimits",
    "EasyedaFootprintCopyMainBackendProtocol", "EasyedaSchematicRelevanceModifyWorkerProtocol",
    "EasyedaSchematicRelevanceModifyControlProtocol", "EasyedaPcbViaMainStructureProtocol", "EasyedaSchematicRelevanceSdkGateProtocol",
  ].map(spelling => ({ spelling, target: spelling, kind: "helper" as const })),
] as const).map(entry => Object.freeze(entry)));
const ALIASES = Object.freeze(CATALOGUE.map((_entry, index) => `ZV${String(index)}`));
const CANDIDATE_NAMES = new Set(CATALOGUE.flatMap(entry => entry.spelling.split(".")));
const NAMESPACE_IMPORTS = new Set([
  "System", "System.ComponentModel", "System.Collections", "System.Collections.Generic", "System.Diagnostics", "System.Globalization",
  "System.IO", "System.IO.Compression", "System.Runtime.InteropServices", "System.Security.Cryptography", "System.Text",
  "System.Text.RegularExpressions", "System.Threading", "Microsoft.Win32.SafeHandles",
]);
const digest = (source: string): string => createHash("sha256").update(source).digest("hex");
const CATALOGUE_SHA256 = "60ff2369145476db7f25091bfcabe453fdf5a3cb13b868c4c58709c37aa1567d";
type Token = ReturnType<typeof tokenize>[number];
interface Replacement { readonly first: Token; readonly last: Token; readonly lastIndex: number; readonly entry: number }
/** Every rejection precedes emission; the codec has no application capability. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_NATIVE_TYPE_ALIASES_V2"); } }
/** Bound the complete review source before the restricted ASCII lexer runs. */
function tokens(source: string): readonly Token[] {
  need(Buffer.byteLength(source) <= MAXIMUM);
  return tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
}
/** One new global alias points directly at its original framework or helper
 * name. Global qualification prevents an intervening alias chain. */
function directive(index: number): string {
  const alias = ALIASES[index], entry = CATALOGUE[index]; need(entry !== undefined && alias !== undefined);
  return `using ${alias}=global::${entry.target};\n`;
}
/** Persist the full V1-layer bytes and the exact useful catalogue selection. */
function block(length: number, hash: string, selected: readonly number[]): string {
  need(digest(JSON.stringify(CATALOGUE)) === CATALOGUE_SHA256);
  return `${BEGIN}// fixed-schematic-type-alias-source-v2 ${String(length)} ${hash} ${selected.join(",")}\n// fixed-schematic-type-alias-catalogue-v2 ${CATALOGUE_SHA256}\n${selected.map(index => directive(index)).join("")}${END}`;
}
/** Only known framework namespace imports can contribute the three bare
 * framework types. Arbitrary aliases cannot shadow a candidate because the
 * complete identifier census below rejects their declaration occurrences. */
function directivesEnd(source: string, active: readonly Token[]): number {
  need(active[0]?.text === "using"); let end = 0, index = 0;
  while (active[index]?.text === "using" && active[index + 1]?.text !== "(") {
    const start = index; do { index += 1; need(index < active.length); } while (active[index]?.text !== ";");
    const last = active[index]; need(last !== undefined);
    const row = active.slice(start + 1, index);
    if (!row.some(token => token.text === "=")) {
      const name = row.map(token => token.text).join("");
      need(NAMESPACE_IMPORTS.has(name));
    }
    end = last.end; index += 1;
  }
  need(source.slice(end).length > 0); return end;
}
/** Prove each present helper has one global static declaration. Every other
 * occurrence must be its bare static member access, so parameters, locals,
 * aliases, nested duplicates, constructors and type references refuse. */
function helperDeclarations(active: readonly Token[]): ReadonlyMap<string, number> {
  const helpers = new Set(CATALOGUE.filter(entry => entry.kind === "helper").map(entry => entry.spelling));
  const declarations = new Map<string, number>(), present = new Set<string>(); let depth = 0;
  for (const [index, token] of active.entries()) {
    if (token.text === "{") { depth += 1; }
    if (token.text === "}") { depth -= 1; need(depth >= 0); }
    if (token.kind === "identifier" && helpers.has(token.text)) {
      present.add(token.text);
      if (active[index - 1]?.text === "class") {
        need(depth === 0 && active[index - 2]?.text === "static" && active[index + 1]?.text === "{" && !declarations.has(token.text));
        declarations.set(token.text, index);
      } else { need(active[index - 1]?.text !== "." && active[index - 1]?.text !== "::" && active[index + 1]?.text === "."); }
    }
  }
  need(depth === 0 && [...present].every(name => declarations.has(name))); return declarations;
}
/** Match only contiguous root-qualified namespace/type tokens. Trivia inside
 * a qualified name stays unchanged, as does a different qualification root. */
function qualifiedMatch(source: string, active: readonly Token[], index: number): Replacement | null {
  const first = active[index]; need(first !== undefined);
  if (first.text !== "System" || active[index - 1]?.text === "." || active[index - 1]?.text === "::") { return null; }
  for (const [number, entry] of CATALOGUE.entries()) {
    if (entry.kind === "qualified" || entry.kind === "namespace") {
      const count = entry.spelling.split(".").length * 2 - 1, last = active[index + count - 1];
      if (last !== undefined && source.slice(first.start, last.end) === entry.spelling) {
        need(active[index + count]?.text !== "::");
        if (entry.kind === "namespace") { need(active[index + count]?.text === "."); }
        return { first, last, lastIndex: index + count - 1, entry: number };
      }
    }
  }
  return null;
}
/** Bare exception names are admitted only at a new/catch type position. Bare
 * comparer names require member access. All declaration and shadow spellings
 * therefore fail the same complete census, including escaped identifiers. */
function bareMatch(active: readonly Token[], index: number, declarations: ReadonlyMap<string, number>): Replacement | null {
  const token = active[index]; need(token !== undefined);
  const number = CATALOGUE.findIndex(entry => entry.spelling === token.text && entry.kind !== "qualified" && entry.kind !== "namespace");
  if (number === -1) { return null; }
  const entry = CATALOGUE[number]; need(entry !== undefined);
  if (entry.kind === "helper") {
    if (declarations.get(token.text) === index) { return null; }
  } else {
    if (active[index - 1]?.text === "." || active[index - 1]?.text === "::") { return null; }
    if (entry.kind === "exception") {
      const caught = active[index - 2]?.text === "catch" && active[index - 1]?.text === "(", next = active[index + 1];
      need(active[index - 1]?.text === "new" && next?.text === "(" || caught && (next?.text === ")" || next?.kind === "identifier" && active[index + 2]?.text === ")"));
    } else { need(active[index + 1]?.text === "."); }
  }
  return { first: token, last: token, lastIndex: index, entry: number };
}
/** Scan every identifier before selecting profitable aliases. No name is
 * renamed generally, and comments/literals never enter the replacement list. */
function replacements(source: string): readonly Replacement[] {
  const active = tokens(source);
  for (const token of active) {
    if (token.kind === "identifier") {
      const name = token.text.replace(/^@/u, "");
      need(!ALIASES.includes(name) && (token.text === name || !CANDIDATE_NAMES.has(name)));
    }
  }
  const declarations = helperDeclarations(active), end = directivesEnd(source, active), result: Replacement[] = [];
  for (let index = 0; index < active.length; index += 1) {
    const token = active[index]; need(token !== undefined);
    if (token.kind === "identifier") {
      // Candidate names in a global using directive could introduce a shadow.
      // Fully qualified type references there stay unchanged rather than chained.
      if (token.start < end) {
        if (active[index + 1]?.text === "=") { need(!CATALOGUE.some(entry => entry.spelling === token.text)); }
      } else {
        const qualified = qualifiedMatch(source, active, index);
        const match = qualified ?? bareMatch(active, index, declarations);
        if (match !== null) {
          result.push(match);
          index = match.lastIndex;
        }
      }
    }
  }
  return result;
}
/** Apply only entries whose reference savings pay for their own directive and
 * selection metadata. The whole V2 block must also save bytes or is omitted. */
function projectLayer(source: string): string {
  const edits = replacements(source), savings = CATALOGUE.map(() => 0);
  for (const edit of edits) { const alias = ALIASES[edit.entry]; need(alias !== undefined); savings[edit.entry] = (savings[edit.entry] ?? 0) + edit.last.end - edit.first.start - alias.length; }
  const selected = CATALOGUE.flatMap((_entry, index) => (savings[index] ?? 0) > directive(index).length + String(index).length + 1 ? [index] : []);
  if (selected.length === 0) { return source; }
  const chosen = new Set(selected), parts: string[] = []; let prior = 0;
  for (const edit of edits) {
    if (chosen.has(edit.entry)) {
      const alias = ALIASES[edit.entry]; need(alias !== undefined); parts.push(source.slice(prior, edit.first.start), alias); prior = edit.last.end;
    }
  }
  parts.push(source.slice(prior));
  const projected = block(Buffer.byteLength(source), digest(source), selected) + parts.join("");
  return projected.length < source.length ? projected : source;
}
/** Detect both V2 delimiters and its metadata discriminator before a source
 * pass. This is format detection only, with no validation or authority grant. */
export function hasCurrentSchematicNativeTypeAliasesV2(source: string): boolean {
  return source.includes("FIXED SCHEMATIC TYPE ALIASES V2") || source.includes("fixed-schematic-type-alias-source-v2") || source.includes("fixed-schematic-type-alias-catalogue-v2");
}
/** Restore V2 to its exact V1-layer bytes and canonical projection, then ask
 * the unchanged V1 decoder to restore the complete original review source. */
export function expandCurrentSchematicNativeTypeAliasesV2(source: string): string {
  const active = tokens(source);
  if (!hasCurrentSchematicNativeTypeAliasesV2(source)) {
    need(!active.some(token => token.kind === "identifier" && ALIASES.includes(token.text.replace(/^@/u, ""))));
    return expandV1(source);
  }
  need(source.startsWith(BEGIN) && source.split(BEGIN).length === 2 && source.split(END).length === 2);
  const stop = source.indexOf(END) + END.length;
  const match = /^\/\/ fixed-schematic-type-alias-source-v2 ([1-9]\d*) ([a-f\d]{64}) (\d+(?:,\d+)*)\n/u.exec(source.slice(BEGIN.length)); need(match !== null);
  const hash = match[2], length = Number(match[1]), selection = match[3];
  need(Number.isSafeInteger(length) && length <= MAXIMUM && hash !== undefined && selection !== undefined);
  const selected = selection.split(",").map(Number);
  need(selected.every((index, position) => Number.isSafeInteger(index) && index >= 0 && index < CATALOGUE.length && (position === 0 || index > (selected[position - 1] ?? index))));
  need(source.slice(0, stop) === block(length, hash, selected));
  const parts: string[] = [], without = source.slice(stop); let prior = 0, restoredLength = without.length;
  need(restoredLength <= length);
  for (const token of tokens(without)) {
    if (token.kind === "identifier") {
      const entry = CATALOGUE[ALIASES.indexOf(token.text)];
      if (entry !== undefined) {
        restoredLength += entry.spelling.length - token.text.length; need(restoredLength <= length);
        parts.push(without.slice(prior, token.start), entry.spelling); prior = token.end;
      }
    }
  }
  parts.push(without.slice(prior)); const restored = parts.join("");
  need(Buffer.byteLength(restored) === length && digest(restored) === hash && projectLayer(restored) === source);
  return expandV1(restored);
}
/** Composite deterministic projection, preserving historical V1 handling and
 * applying this immutable V2 catalogue only after V1's canonical projection. */
export function projectCurrentSchematicNativeTypeAliasesV2(input: string): string {
  const source = expandCurrentSchematicNativeTypeAliasesV2(input);
  const result = projectLayer(projectV1(source));
  need(expandCurrentSchematicNativeTypeAliasesV2(result) === source); return result;
}

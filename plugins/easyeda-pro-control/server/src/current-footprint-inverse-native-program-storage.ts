/** Lossless build-only storage for the footprint inverse purpose's fixed helpers. Every
 * expanded table retains its previous length/hash and original wire bytes.
 * No runtime input can select a helper, source program or decoder profile. */
import { CURRENT_FOOTPRINT_INVERSE_GET_RESULT_PROGRAMS as ROW } from "./current-footprint-inverse-get-result-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as NATIVE } from "./current-footprint-inverse-lookup-native-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_HELPERS as TASK_HELPERS } from "./current-footprint-inverse-native-get-task-manager-programs.ts";
import { CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES as VIA_PREFIXES } from "./current-pcb-via-main-program-storage-prefixes.ts";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED_FRAME, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_SCOPE_HELPERS as SCOPE } from "./current-selected-file-main-sql-capture-scope.ts";
import { CURRENT_NATIVE_OWN_DATA_CHECK as I11 } from "./current-native-own-data-intrinsics.ts";
import { expandCurrentSelectedMainNativePrograms } from "./current-selected-main-native-program-storage.ts";

const BEGIN = "// BEGIN FIXED FOOTPRINT INVERSE PROGRAM DATA V1", END = "// END FIXED FOOTPRINT INVERSE PROGRAM DATA V1";
const CLASS = "EasyedaFootprintInverseProgramData";
const ANCHOR = "internal static class EasyedaDiagnosticFixedTable {";
const hash = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Catalogue entries derive only from original exported programs. A source or
 * cut-point change must deliberately update its exact fixed digest. */
function pinned(value: string, length: number, expected: string): string { need(value.length === length && hash(value) === expected); return JSON.stringify(value).slice(1, -1); }
const PREFIXES = Object.freeze([
  pinned(JOIN, 2278, "08daf02748edbce63857d503c7747b1bc23e173692efc1ba017778269357bada"),
  pinned(SCOPE, 999, "fb56882a1bf4842d401145ea831a27904c783928c724f5721a6052c95d81148c"),
  pinned(I11, 1640, "94955716bfd8af25ab43dfc56a32f84434b059f500e1ab0e53016475fc077919"),
]);
interface Profile { readonly begin: string; readonly end: string; readonly className: string; readonly prefixes: readonly string[]; readonly tokens: readonly string[]; readonly tokenPrefix: string }
const V1: Profile = Object.freeze({ begin: BEGIN, end: END, className: CLASS, prefixes: PREFIXES,
  tokens: Object.freeze(PREFIXES.map((_value, index) => `__footprint_inverse_fixed_${String(index)}__`)), tokenPrefix: "__footprint_inverse_fixed_" });
const CAPTURED_PREFIXES = Object.freeze([pinned(CAPTURED_FRAME, 11_754, "57e318a42d7f41951ebc65fe276a27be6097dfcb9cd2ef51d9ac76b4c6a487dc"), ...VIA_PREFIXES.map(row => row.escaped), ...PREFIXES]);
const V2: Profile = Object.freeze({ begin: BEGIN.replace("V1", "V2"), end: END.replace("V1", "V2"), className: `${CLASS}V2`, prefixes: CAPTURED_PREFIXES,
  tokens: Object.freeze(CAPTURED_PREFIXES.map((_value, index) => `__footprint_inverse_v2_fixed_${String(index)}__`)), tokenPrefix: "__footprint_inverse_v2_fixed_" });
need(TASK_HELPERS.startsWith('"use strict";'));
const TASK_PREFIXES = Object.freeze([...CAPTURED_PREFIXES.slice(0, -PREFIXES.length), pinned(NATIVE.defaultInstance, 2345, "76119ada6a7dded700650572655dc218fd65067842d503abbbe6e2f8c46bc55b"), pinned(NATIVE.hooks, 2494, "2d565fede6df8dca63f0b71dd59cee6ddef3e1e9a641a37e12ded30bb744125a"), pinned(ROW.reprove, 2308, "51d63431e3194e5ce137b53fee4ec14a193058008f6157407b55dd85c2ae880b"), pinned(TASK_HELPERS.slice(13), 1985, "6e3d4375d751ec12ddf47adb85749ea7df6ea80a0ec19b114316f4231467800d"), ...PREFIXES]);
export const CURRENT_FOOTPRINT_INVERSE_TASK_STORAGE_CATALOGUE = Object.freeze({ rows: TASK_PREFIXES.length, bytes: Buffer.byteLength(TASK_PREFIXES.join("\0")), sha256: hash(TASK_PREFIXES.join("\0")) });
need(CURRENT_FOOTPRINT_INVERSE_TASK_STORAGE_CATALOGUE.rows === 18 && CURRENT_FOOTPRINT_INVERSE_TASK_STORAGE_CATALOGUE.bytes === 92_216 && CURRENT_FOOTPRINT_INVERSE_TASK_STORAGE_CATALOGUE.sha256 === "fe4d5948dc22ef86ac742c3c2e7c34189f085c9b9f9b23df5cd1b7e5dabfe265");
const V3: Profile = Object.freeze({ begin: BEGIN.replace("V1", "V3"), end: END.replace("V1", "V3"), className: `${CLASS}V3`, prefixes: TASK_PREFIXES,
  tokens: Object.freeze(TASK_PREFIXES.map((_value, index) => `__footprint_inverse_v3_fixed_${String(index)}__`)), tokenPrefix: "__footprint_inverse_v3_fixed_" });
const PROFILES = Object.freeze([V1, V2, V3]);
const originalPattern = (): RegExp => /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*)\)/gu;
const storedPattern = (profile: Profile): RegExp => new RegExp(String.raw`${profile.className}\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*),([1-9]\d*),@"([a-f\d]{64})"\)`, "gu");
interface Table { readonly encoded: string; readonly length: number; readonly hash: string; readonly packedHash: string; readonly rows: number; readonly columns: number }
/** Stop a noncanonical, out-of-bound or inconsistent storage rewrite. The
 * closed failure permits neither an alternate dictionary nor a cap fallback. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_PROGRAM_STORAGE"); } }
/** Compress bounded UTF-8 data deterministically and retain both byte hashes
 * plus dimensions for the independent expanded-program integrity check. */
function encode(text: string, rows: number, columns: number): Table {
  const bytes = Buffer.from(text); need(bytes.length > 0 && bytes.length <= 65_536 && rows > 0 && rows <= 256 && columns > 0 && columns <= 8);
  // oxlint-disable-next-line node/no-sync -- Deterministic bounded in-memory storage of immutable build data.
  const packed = gzipSync(bytes, { level: 9 });
  return { encoded: packed.toString("base64"), length: bytes.length, hash: hash(bytes), packedHash: hash(packed), rows, columns };
}
/** Project the six captured original Load arguments into a table descriptor;
 * decode must validate its actual bounds, bytes, hashes and shape before use. */
function table(match: readonly string[]): Table {
  const [encoded, length, digest, packedHash, rows, columns] = match.slice(1, 7);
  need(encoded !== undefined && length !== undefined && digest !== undefined && packedHash !== undefined && rows !== undefined && columns !== undefined);
  return { encoded, length: Number(length), hash: digest, packedHash, rows: Number(rows), columns: Number(columns) };
}
/** Verify canonical base64/gzip, both hashes, UTF-8 and row/column shape under
 * the unchanged 64KiB ceiling before exposing an original table for rewriting. */
function decode(value: Table): string {
  need(value.length > 0 && value.length <= 65_536 && value.rows > 0 && value.rows <= 256 && value.columns > 0 && value.columns <= 8);
  const packed = Buffer.from(value.encoded, "base64"); need(packed.toString("base64") === value.encoded && hash(packed) === value.packedHash);
  // oxlint-disable-next-line node/no-sync -- Bounded immutable build data, with the unchanged native 64KiB decoded ceiling.
  const bytes = gunzipSync(packed, { maxOutputLength: 65_536 }); need(bytes.length === value.length && hash(bytes) === value.hash);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  need(text.split("\0").length === value.rows && text.split("\0").every(row => row.split("\t").length === value.columns));
  const canonical = encode(text, value.rows, value.columns); need(canonical.encoded === value.encoded); return text;
}
const argumentsText = (value: Table): string => `@"${value.encoded}",${String(value.length)},@"${value.hash}",@"${value.packedHash}",${String(value.rows)},${String(value.columns)}`;
/** Expand only the pinned inverse-purpose tokens in catalogue order and
 * reject leftover markers instead of accepting a partially restored program. */
function expandText(input: string, profile: Profile): string {
  let text = input; for (const [index, prefix] of profile.prefixes.entries()) { const token = profile.tokens[index]; need(token !== undefined); text = text.replaceAll(token, prefix); }
  need(!text.includes(profile.tokenPrefix)); return text;
}
/** Split only the fixed build dictionary into independently hashed tables.
 * Each table retains the original 64KiB decoder bound; no runtime input can
 * choose a fragment, alter an entry or enlarge an expanded command. */
function capturedDictionarySource(prefixes: readonly string[]): string {
  const groups: string[][] = [[]];
  for (const prefix of prefixes) {
    let group = groups.at(-1); need(group !== undefined && Buffer.byteLength(prefix) <= 60_000);
    if (Buffer.byteLength([...group, prefix].join("\0")) > 60_000) { group = []; groups.push(group); }
    group.push(prefix);
  }
  const loads = groups.map(group => `result.AddRange(EasyedaDiagnosticFixedTable.Load(${argumentsText(encode(group.join("\0"), group.length, 1))}));`).join("");
  return `static readonly string[][] Prefix=LoadPrefixes();\nstatic string[][] LoadPrefixes(){var result=new System.Collections.Generic.List<string[]>();${loads}return result.ToArray();}`;
}

function decoderSource(profile: Profile): string {
  need(profile.prefixes.every(prefix => !/[\0\t]/u.test(prefix)));
  const dictionary = (profile === V2 || profile === V3) ? capturedDictionarySource(profile.prefixes) : `static readonly string[][] Prefix=EasyedaDiagnosticFixedTable.Load(${argumentsText(encode(profile.prefixes.join("\0"), profile.prefixes.length, 1))});`;
  return `${profile.begin}\ninternal static class ${profile.className} {
${dictionary}
internal static string[][] Load(string encoded,int length,string hash,string packedHash,int rows,int columns,int expandedLength,string expandedHash){
if(expandedLength<1||expandedLength>65536)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-bound");
string[][] result=EasyedaDiagnosticFixedTable.Load(encoded,length,hash,packedHash,rows,columns);var flat=new System.Text.StringBuilder();
for(int i=0;i<rows;i++){if(i>0)flat.Append('\\0');for(int j=0;j<columns;j++){if(j>0)flat.Append('\\t');string text=result[i][j];${profile.tokens.map((token, index) => `text=text.Replace("${token}",Prefix[${String(index)}][0]);`).join("")}if(text.Length>expandedLength-flat.Length)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-length");result[i][j]=text;flat.Append(text);}}
byte[] bytes=System.Text.Encoding.UTF8.GetBytes(flat.ToString());if(bytes.Length!=expandedLength)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-length");
using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=expandedHash)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-hash");return result;
}
}\n${profile.end}\n`;
}

/** Restore every original table and remove only this exact fixed decoder. The
 * regenerated canonical gzip must match the original table bytes exactly. */
export function expandCurrentFootprintInverseNativePrograms(input: string): string {
  const matches = PROFILES.filter(candidate => input.includes(candidate.begin) || input.includes(candidate.end));
  if (matches.length === 0) { need(PROFILES.every(candidate => !input.includes(`${candidate.className}.Load(`))); return input; }
  need(matches.length === 1); const profile = matches[0]; need(profile !== undefined);
  const block = decoderSource(profile); need(input.split(profile.begin).length === 2 && input.split(profile.end).length === 2 && input.includes(block));
  need(PROFILES.every(candidate => candidate === profile || !input.includes(`${candidate.className}.Load(`)));
  let source = input.replace(block, ""); let count = 0;
  source = source.replace(storedPattern(profile), (...args: unknown[]) => {
    const captures = args.slice(0, 9).map(value => { need(typeof value === "string"); return value; });
    const value = table(captures);
    const expandedLength = Number(captures[7]); const expandedHash = captures[8];
    need(expandedLength > 0 && expandedLength <= 65_536 && expandedHash !== undefined);
    const text = expandText(decode(value), profile); need(Buffer.byteLength(text) === expandedLength && hash(text) === expandedHash);
    const original = encode(text, value.rows, value.columns); count += 1;
    return `EasyedaDiagnosticFixedTable.Load(${argumentsText(original)})`;
  });
  need(count > 0 && !source.includes(`${profile.className}.Load(`)); return source;
}

/** Expand this exact block and the old Main V1 storage before factoring the
 * combined fixed catalogue. Generator selection remains a separate caller
 * decision; this build-only module grants no native execution authority. */
function project(input: string, profile: Profile): string {
  const original = expandCurrentSelectedMainNativePrograms(expandCurrentFootprintInverseNativePrograms(input)); let count = 0;
  let source = original.replace(originalPattern(), (...args: unknown[]) => {
    const captures = args.slice(0, 7).map(value => { need(typeof value === "string"); return value; });
    const value = table(captures); const text = decode(value); let reduced = text;
    if (!profile.prefixes.some(prefix => text.includes(prefix))) { return captures[0] ?? ""; }
    need(!text.includes(profile.tokenPrefix));
    for (const [index, prefix] of profile.prefixes.entries()) { const token = profile.tokens[index]; need(token !== undefined); reduced = reduced.replaceAll(prefix, token); }
    need(expandText(reduced, profile) === text); count += 1;
    return `${profile.className}.Load(${argumentsText(encode(reduced, value.rows, value.columns))},${String(value.length)},@"${value.hash}")`;
  });
  if (count === 0) { return original; }
  need(source.split(ANCHOR).length === 2); source = source.replace(ANCHOR, decoderSource(profile) + ANCHOR);
  need(expandCurrentFootprintInverseNativePrograms(source) === original); return source;
}

/** Preserve the exact historical three-prefix V1 catalogue and projection. */
export function projectCurrentFootprintInverseNativePrograms(input: string): string { return project(input, V1); }

/** Share the complete captured classifier in the new fixed V2 catalogue.
 * Historical tables restore explicitly; no decoder or compiler ceiling rises. */
export function projectCurrentFootprintInverseCapturedNativePrograms(input: string): string { return project(input, V2); }

/** Share exact native, row and task descriptor helpers in the inverse V3
 * catalogue. Earlier V1/V2 projections and their decoders remain unchanged. */
export function projectCurrentFootprintInverseTaskNativePrograms(input: string): string { return project(input, V3); }

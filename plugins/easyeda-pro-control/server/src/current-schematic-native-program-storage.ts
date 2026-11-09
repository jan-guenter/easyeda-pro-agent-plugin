/** Lossless build-only storage for the schematic purpose's fixed helpers. Every
 * expanded table retains its previous length/hash and original wire bytes.
 * No runtime input can select a helper, source program or decoder profile. */
import { CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES as VIA_PREFIXES } from "./current-pcb-via-main-program-storage-prefixes.ts";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED_FRAME, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_SCOPE_HELPERS as SCOPE } from "./current-selected-file-main-sql-capture-scope.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_COMMAND_ATTRIBUTES as ATTRS, currentSchematicRelevanceNormalRecordDelta } from "./current-schematic-relevance-normal-record-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DOCUMENT_PROOF as DOCUMENT, CURRENT_SCHEMATIC_RELEVANCE_NORMAL_ITERATOR_PROOF as ITERATOR } from "./current-schematic-relevance-normal-update-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_DELTA as STATUS } from "./current-schematic-relevance-history-status-programs.ts";
import { CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V3, CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V4 } from "./current-schematic-native-program-prefixes.ts";
import { CURRENT_NATIVE_OWN_DATA_CHECK as I11 } from "./current-native-own-data-intrinsics.ts";
// oxlint-disable-next-line import/max-dependencies -- This closed catalogue derives eleven separately pinned source families, including explicit restoration of historical Main data.
import { expandCurrentSelectedMainNativePrograms } from "./current-selected-main-native-program-storage.ts";

const ANCHOR = "internal static class EasyedaDiagnosticFixedTable {";
const hash = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Catalogue entries derive only from original exported programs. A source or
 * cut-point change must deliberately update its exact fixed digest. */
function pinned(value: string, length: number, expected: string): string { need(value.length === length && hash(value) === expected); return JSON.stringify(value).slice(1, -1); }
function body(program: string, signature: string, length: number, expected: string): string { need(program.startsWith(signature) && program.length >= signature.length + length); return pinned(program.slice(signature.length, signature.length + length), length, expected); }
const PREFIXES_V1 = Object.freeze([
  pinned(JOIN, 2278, "08daf02748edbce63857d503c7747b1bc23e173692efc1ba017778269357bada"),
  pinned(SCOPE, 999, "fb56882a1bf4842d401145ea831a27904c783928c724f5721a6052c95d81148c"),
  body(currentSchematicRelevanceNormalRecordDelta("didRecord"), "function(native,run,roots,entry,completion,idle){", 3072, "47c415b90c5c9971ab0922e527a52216f7f12f34411eec92ea5d486a0382e465"),
  body(ITERATOR, "function(native,intrinsic,objects,module){", 1536, "bd3e077d386b828b0027de76d926dd3f6ab7398cbfa1605fed69beb645a4c7f6"),
  pinned(I11, 1640, "94955716bfd8af25ab43dfc56a32f84434b059f500e1ab0e53016475fc077919"),
]);
const PREFIXES_V2 = Object.freeze([...PREFIXES_V1,
  body(ATTRS, "function(native,entry,state,primitive){", 1024, "49f8774acde69773d74cf8ae4e8d6ecf3be6f350e841cde80bd1237f95e2c487"),
  body(DOCUMENT, "function(native,roots){", 1024, "82934c2c03a51263341b536f9a96c095bb7daba8e8b31651b23e486f94671c47"),
  body(STATUS, "function(native,roots,details,objects){", 2048, "0088849147c5e2fab29db057828631965fff92bbc67caa890c8d9a11125dee5a"),
]);
const PREFIXES_V3 = Object.freeze([...PREFIXES_V2, ...CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V3.map(row => body(...row))]);
const PREFIXES_V4 = Object.freeze([...PREFIXES_V2, ...CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V4.map(row => body(...row))]);
const PREFIXES_V5 = Object.freeze([pinned(CAPTURED_FRAME, 11_754, "57e318a42d7f41951ebc65fe276a27be6097dfcb9cd2ef51d9ac76b4c6a487dc"), ...VIA_PREFIXES.map(row => row.escaped), ...PREFIXES_V4]);
interface Profile { readonly begin: string; readonly end: string; readonly className: string; readonly prefixes: readonly string[]; readonly tokens: readonly string[]; readonly tokenPrefix: string }
const V1: Profile = Object.freeze({ begin: "// BEGIN FIXED SCHEMATIC PROGRAM DATA V1", end: "// END FIXED SCHEMATIC PROGRAM DATA V1", className: "EasyedaSchematicProgramData", prefixes: PREFIXES_V1, tokens: Object.freeze(PREFIXES_V1.map((_value, index) => `__schematic_fixed_${String(index)}__`)), tokenPrefix: "__schematic_fixed_" });
const V2: Profile = Object.freeze({ begin: "// BEGIN FIXED SCHEMATIC PROGRAM DATA V2", end: "// END FIXED SCHEMATIC PROGRAM DATA V2", className: "EasyedaSchematicProgramDataV2", prefixes: PREFIXES_V2, tokens: Object.freeze(PREFIXES_V2.map((_value, index) => `__schematic_v2_fixed_${String(index)}__`)), tokenPrefix: "__schematic_v2_fixed_" });
const V3: Profile = Object.freeze({ begin: "// BEGIN FIXED SCHEMATIC PROGRAM DATA V3", end: "// END FIXED SCHEMATIC PROGRAM DATA V3", className: "EasyedaSchematicProgramDataV3", prefixes: PREFIXES_V3, tokens: Object.freeze(PREFIXES_V3.map((_value, index) => `__schematic_v3_fixed_${String(index)}__`)), tokenPrefix: "__schematic_v3_fixed_" });
const V4: Profile = Object.freeze({ begin: "// BEGIN FIXED SCHEMATIC PROGRAM DATA V4", end: "// END FIXED SCHEMATIC PROGRAM DATA V4", className: "EasyedaSchematicProgramDataV4", prefixes: PREFIXES_V4, tokens: Object.freeze(PREFIXES_V4.map((_value, index) => `__schematic_v4_fixed_${String(index)}__`)), tokenPrefix: "__schematic_v4_fixed_" });
const V5: Profile = Object.freeze({ begin: "// BEGIN FIXED SCHEMATIC PROGRAM DATA V5", end: "// END FIXED SCHEMATIC PROGRAM DATA V5", className: "EasyedaSchematicProgramDataV5", prefixes: PREFIXES_V5, tokens: Object.freeze(PREFIXES_V5.map((_value, index) => `__schematic_v5_fixed_${String(index)}__`)), tokenPrefix: "__schematic_v5_fixed_" });
const originalPattern = (): RegExp => /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*)\)/gu;
const storedPattern = (profile: Profile): RegExp => new RegExp(String.raw`${profile.className}\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*),([1-9]\d*),@"([a-f\d]{64})"\)`, "gu");
interface Table { readonly encoded: string; readonly length: number; readonly hash: string; readonly packedHash: string; readonly rows: number; readonly columns: number }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_PROGRAM_STORAGE"); } }
function encode(text: string, rows: number, columns: number): Table {
  const bytes = Buffer.from(text); need(bytes.length > 0 && bytes.length <= 65_536 && rows > 0 && rows <= 256 && columns > 0 && columns <= 8);
  // oxlint-disable-next-line node/no-sync -- Deterministic bounded in-memory storage of immutable build data.
  const packed = gzipSync(bytes, { level: 9 });
  return { encoded: packed.toString("base64"), length: bytes.length, hash: hash(bytes), packedHash: hash(packed), rows, columns };
}
function table(match: readonly string[]): Table {
  const [encoded, length, digest, packedHash, rows, columns] = match.slice(1, 7);
  need(encoded !== undefined && length !== undefined && digest !== undefined && packedHash !== undefined && rows !== undefined && columns !== undefined);
  return { encoded, length: Number(length), hash: digest, packedHash, rows: Number(rows), columns: Number(columns) };
}
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
  const dictionary = profile === V5 ? capturedDictionarySource(profile.prefixes) : `static readonly string[][] Prefix=EasyedaDiagnosticFixedTable.Load(${argumentsText(encode(profile.prefixes.join("\0"), profile.prefixes.length, 1))});`;
  return `${profile.begin}\ninternal static class ${profile.className} {
${dictionary}
internal static string[][] Load(string encoded,int length,string hash,string packedHash,int rows,int columns,int expandedLength,string expandedHash){
if(expandedLength<1||expandedLength>65536)throw new System.InvalidOperationException("pcb-diagnostic-schematic-program-bound");
string[][] result=EasyedaDiagnosticFixedTable.Load(encoded,length,hash,packedHash,rows,columns);var flat=new System.Text.StringBuilder();
for(int i=0;i<rows;i++){if(i>0)flat.Append('\\0');for(int j=0;j<columns;j++){if(j>0)flat.Append('\\t');string text=result[i][j];${profile.tokens.map((token, index) => `text=text.Replace("${token}",Prefix[${String(index)}][0]);`).join("")}if(text.Length>expandedLength-flat.Length)throw new System.InvalidOperationException("pcb-diagnostic-schematic-program-length");result[i][j]=text;flat.Append(text);}}
byte[] bytes=System.Text.Encoding.UTF8.GetBytes(flat.ToString());if(bytes.Length!=expandedLength)throw new System.InvalidOperationException("pcb-diagnostic-schematic-program-length");
using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=expandedHash)throw new System.InvalidOperationException("pcb-diagnostic-schematic-program-hash");return result;
}
}\n${profile.end}\n`;
}

/** Restore every original table and remove only this exact fixed decoder. The
 * regenerated canonical gzip must match the original table bytes exactly. */
function expandProfile(input: string, profile: Profile): string {
  if (!input.includes(profile.begin) && !input.includes(profile.end)) { need(!input.includes(`${profile.className}.Load(`)); return input; }
  const block = decoderSource(profile); need(input.split(profile.begin).length === 2 && input.split(profile.end).length === 2 && input.includes(block));
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

/** V1 through V4 retain their immutable historical decoders. The captured
 * projection uses V5; each exact block restores its original canonical tables. */
export function expandCurrentSchematicNativePrograms(input: string): string { let source = input; for (const profile of [V5, V4, V3, V2, V1]) { source = expandProfile(source, profile); } return source; }

/** Expand this exact block and the old Main V1 storage before factoring the
 * combined fixed catalogue. Generator selection remains a separate caller
 * decision; this build-only module grants no native execution authority. */
function project(input: string, profile: Profile): string {
  const original = expandCurrentSelectedMainNativePrograms(expandCurrentSchematicNativePrograms(input)); let count = 0;
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
  need(expandCurrentSchematicNativePrograms(source) === original); return source;
}

/** Preserve the exact historical V4 catalogue and projection. */
export function projectCurrentSchematicNativePrograms(input: string): string { return project(input, V4); }

/** Share the complete fixed captured classifier before its contained helpers.
 * All expanded table bytes/hashes and decoder bounds remain unchanged. */
export function projectCurrentSchematicCapturedNativePrograms(input: string): string { return project(input, V5); }

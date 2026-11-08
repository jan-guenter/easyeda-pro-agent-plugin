/** Lossless build-only storage for the footprint inverse purpose's fixed helpers. Every
 * expanded table retains its previous length/hash and original wire bytes.
 * No runtime input can select a helper, source program or decoder profile. */
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
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
const TOKENS = Object.freeze(PREFIXES.map((_value, index) => `__footprint_inverse_fixed_${String(index)}__`));
const originalPattern = (): RegExp => /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*)\)/gu;
const storedPattern = (): RegExp => /EasyedaFootprintInverseProgramData\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*),([1-9]\d*),@"([a-f\d]{64})"\)/gu;
interface Table { readonly encoded: string; readonly length: number; readonly hash: string; readonly packedHash: string; readonly rows: number; readonly columns: number }
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_PROGRAM_STORAGE"); } }
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
function expandText(input: string): string {
  let text = input; for (const [index, prefix] of PREFIXES.entries()) { const token = TOKENS[index]; need(token !== undefined); text = text.replaceAll(token, prefix); }
  need(!text.includes("__footprint_inverse_fixed_")); return text;
}
function decoderSource(): string {
  need(PREFIXES.every(prefix => !/[\0\t]/u.test(prefix)));
  const dictionary = encode(PREFIXES.join("\0"), PREFIXES.length, 1);
  return `${BEGIN}\ninternal static class ${CLASS} {
static readonly string[][] Prefix=EasyedaDiagnosticFixedTable.Load(${argumentsText(dictionary)});
internal static string[][] Load(string encoded,int length,string hash,string packedHash,int rows,int columns,int expandedLength,string expandedHash){
if(expandedLength<1||expandedLength>65536)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-bound");
string[][] result=EasyedaDiagnosticFixedTable.Load(encoded,length,hash,packedHash,rows,columns);var flat=new System.Text.StringBuilder();
for(int i=0;i<rows;i++){if(i>0)flat.Append('\\0');for(int j=0;j<columns;j++){if(j>0)flat.Append('\\t');string text=result[i][j];${TOKENS.map((token, index) => `text=text.Replace("${token}",Prefix[${String(index)}][0]);`).join("")}if(text.Length>expandedLength-flat.Length)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-length");result[i][j]=text;flat.Append(text);}}
byte[] bytes=System.Text.Encoding.UTF8.GetBytes(flat.ToString());if(bytes.Length!=expandedLength)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-length");
using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=expandedHash)throw new System.InvalidOperationException("pcb-diagnostic-footprint-inverse-program-hash");return result;
}
}\n${END}\n`;
}

/** Restore every original table and remove only this exact fixed decoder. The
 * regenerated canonical gzip must match the original table bytes exactly. */
export function expandCurrentFootprintInverseNativePrograms(input: string): string {
  if (!input.includes(BEGIN) && !input.includes(END)) { need(!input.includes(`${CLASS}.Load(`)); return input; }
  const block = decoderSource(); need(input.split(BEGIN).length === 2 && input.split(END).length === 2 && input.includes(block));
  let source = input.replace(block, ""); let count = 0;
  source = source.replace(storedPattern(), (...args: unknown[]) => {
    const captures = args.slice(0, 9).map(value => { need(typeof value === "string"); return value; });
    const value = table(captures);
    const expandedLength = Number(captures[7]); const expandedHash = captures[8];
    need(expandedLength > 0 && expandedLength <= 65_536 && expandedHash !== undefined);
    const text = expandText(decode(value)); need(Buffer.byteLength(text) === expandedLength && hash(text) === expandedHash);
    const original = encode(text, value.rows, value.columns); count += 1;
    return `EasyedaDiagnosticFixedTable.Load(${argumentsText(original)})`;
  });
  need(count > 0 && !source.includes(`${CLASS}.Load(`)); return source;
}

/** Expand this exact block and the old Main V1 storage before factoring the
 * combined fixed catalogue. Generator selection remains a separate caller
 * decision; this build-only module grants no native execution authority. */
export function projectCurrentFootprintInverseNativePrograms(input: string): string {
  const original = expandCurrentSelectedMainNativePrograms(expandCurrentFootprintInverseNativePrograms(input)); let count = 0;
  let source = original.replace(originalPattern(), (...args: unknown[]) => {
    const captures = args.slice(0, 7).map(value => { need(typeof value === "string"); return value; });
    const value = table(captures); const text = decode(value); let reduced = text;
    if (!PREFIXES.some(prefix => text.includes(prefix))) { return captures[0] ?? ""; }
    need(!text.includes("__footprint_inverse_fixed_"));
    for (const [index, prefix] of PREFIXES.entries()) { const token = TOKENS[index]; need(token !== undefined); reduced = reduced.replaceAll(prefix, token); }
    need(expandText(reduced) === text); count += 1;
    return `${CLASS}.Load(${argumentsText(encode(reduced, value.rows, value.columns))},${String(value.length)},@"${value.hash}")`;
  });
  if (count === 0) { return original; }
  need(source.split(ANCHOR).length === 2); source = source.replace(ANCHOR, decoderSource() + ANCHOR);
  need(expandCurrentFootprintInverseNativePrograms(source) === original); return source;
}

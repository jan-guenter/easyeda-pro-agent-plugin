/** One immutable pool for the two new native clock codebooks. This owns no
 * request, profile selection, ledger state or execution authority. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as CLOCK, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_HELPERS as HELPERS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROGRAMS as REGISTRATION } from "./current-footprint-inverse-native-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER as ORDER, currentFootprintInverseNativeDeleteClockCases as clockCases,
  currentFootprintInverseNativeDeleteClockTemplate as clockTemplate, currentFootprintInverseNativeDeleteClockKey as key } from "./current-footprint-inverse-native-delete-clock-protocol.ts";
import { currentFootprintInverseNativeDeleteClockRegistrationCases as registrationCases, currentFootprintInverseNativeDeleteClockRegistrationTemplate as registrationTemplate } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";

const aliases = Object.freeze([
  ["__inverse_native_delete_clock_registration_", "~r~", 42], ["__inverse_native_delete_clock_", "~c~", 170],
  ["easyeda-footprint-inverse-native-delete-clock", "~g~", 26],
  ['"silent":true,"generatePreview":false,"throwOnSideEffect":true,"awaitPromise":false,"userGesture":false', "~f~", 16],
  ['"ownProperties":true,"accessorPropertiesOnly":false,"generatePreview":false', "~p~", 32],
  ['"silent":true,"generatePreview":false,"throwOnSideEffect":true,"returnByValue":false,"includeCommandLineAPI":false', "~e~", 8],
] as const);
const marker = "__native_delete_clock_helpers_v1__";
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
type Row = readonly [string, string, string, string];
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_CLOCK_BOOK_STORAGE"); } }
function sourceRows(): readonly Row[] {
  need(Buffer.byteLength(HELPERS) === 8771 && sha(Buffer.from(HELPERS)) === "c2106be3ff04b67a3b4e5ae7283f801beb5e3702f2fdaeca4b7a64bca158c335");
  const byKey = new Map(clockCases().map(command => [key(command), command]));
  const commands = ORDER.map(name => { const value = byKey.get(name); need(value !== undefined); return value; });
  return [
    ["dictionary", "helpers", "", JSON.stringify(HELPERS).slice(1, -1)],
    ...Object.entries(CLOCK).map(([role, program]): Row => { need(!program.includes(marker) && program.split(HELPERS).length === (role === "retainReturn" ? 1 : 2)); return ["c/program", role, "", JSON.stringify(program.replace(HELPERS, marker))]; }),
    ...Object.entries(REGISTRATION).map(([role, program]): Row => ["r/program", role, "", JSON.stringify(program)]),
    ...commands.map(command => { const row = clockTemplate(command); return [`c/${row.key}`, row.method, row.names.join(","), row.template] as const; }),
    ...registrationCases().map(command => { const row = registrationTemplate(command); return [`r/${row.key}`, row.method, row.names.join(","), row.template] as const; }),
  ];
}
/** Decode and compare all original row fields independently in regression
 * checks; the owner receives only its same old restored four-column rows. */
export function currentFootprintInverseNativeClockBookPreimage(): readonly Row[] { return sourceRows(); }
export function currentFootprintInverseNativeClockBookNativeSource(): string {
  const original = sourceRows(); need(original.length === 129);
  for (const [from, to, uses] of aliases) { need(original.every(row => row.every(value => !value.includes(to))));
    need(original.reduce((sum, row) => sum + row.reduce((count, value) => count + value.split(from).length - 1, 0), 0) === uses); }
  const rows = original.map(row => row.map(value => { let stored = value; for (const [from, to] of aliases) { stored = stored.replaceAll(from, to); }
    let restored = stored; for (const [from, to] of aliases.toReversed()) { restored = restored.replaceAll(to, from); } need(restored === value); return stored; }));
  const raw = Buffer.from(rows.map(row => { need(row.length === 4 && row.every(value => !value.includes("\0") && !value.includes("\t"))); return row.join("\t"); }).join("\0"));
  need(raw.length === 59_632 && raw.length <= 60_000);
  // oxlint-disable-next-line node/no-sync -- Pack only fixed, byte-equivalent data; the existing decoder retains its unchanged bounds and both SHA checks.
  const packed = gzipSync(raw, { level: 9 });
  const restore = aliases.toReversed().map(([from, to]) => `.Replace(${quote(to)},${quote(from)})`).join("");
  return `public sealed partial class EasyedaDiagnosticOwner{
static class NativeClockBookV1{internal static readonly string[][] Data=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},59632,${quote(sha(raw))},${quote(sha(packed))},129,4);}
static string NativeClockText(string text){return text${restore};}
static string[][] NativeClockRows(string family){if(family!="c"&&family!="r")throw Error("inverse-native-clock-book-family");var result=new System.Collections.Generic.List<string[]>();string helper=NativeClockText(NativeClockBookV1.Data[0][3]);foreach(string[] row in NativeClockBookV1.Data)if(row[0].StartsWith(family+"/",StringComparison.Ordinal)){string kind=row[0].Substring(2),text=NativeClockText(row[3]);if(family=="c"&&kind=="program")text=text.Replace("__native_delete_clock_helpers_v1__",helper);result.Add(new[]{kind,NativeClockText(row[1]),NativeClockText(row[2]),text});}if(result.Count!=(family=="c"?102:26))throw Error("inverse-native-clock-book-roster");return result.ToArray();}
}
`;
}

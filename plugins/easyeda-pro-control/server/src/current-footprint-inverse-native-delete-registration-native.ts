/** Build-only decoder for the fresh native-route registration. It has no
 * native control/send method, public-c adapter or original Job enrollment. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_MANAGER_PROGRAMS as M } from "./current-footprint-inverse-get-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_PROGRAMS as F } from "./current-footprint-inverse-get-forwarding-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_PROGRAMS as D } from "./current-footprint-inverse-delete-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_PROGRAMS as S } from "./current-footprint-inverse-delete-send-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as N } from "./current-footprint-inverse-lookup-native-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_PROGRAMS as P } from "./current-footprint-inverse-native-delete-registration-programs.ts";
import { currentFootprintInverseNativeDeleteRegistrationCases as cases, currentFootprintInverseNativeDeleteRegistrationTemplate as template } from "./current-footprint-inverse-native-delete-registration-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Narrow only names present in this immutable registration program book. */
function isRole(role: string): role is keyof typeof P { return Object.hasOwn(P, role); }
/** Share only byte-identical immutable program rows already compiled for the
 * other readers. No old native ledger, token, guard or phase is consulted. */
export function currentFootprintInverseNativeDeleteRegistrationSharedPrograms(): readonly Readonly<{ role: keyof typeof P; table: string; sourceRole: string }>[] {
  const groups = [
    { table: "InverseGetManagerRows", source: M, roles: Object.keys(M).map(role => [role, role] as const) },
    { table: "InverseGetForwardingRows", source: F, roles: [["handlerUi", "handlerUi"], ["body", "handlerBody"], ["managerModule", "managerModule"]] },
    { table: "InverseDeleteManagerRows()", source: D, roles: [["lookupScope", "lookupScope"], ["method", "method"], ["topics", "topics"], ["topicGroup", "topicGroup"], ["innerTopic", "innerTopic"]] },
    { table: "InverseDeleteSendRows()", source: S, roles: [["managerData", "managerData"], ["managerLinks", "managerLinks"], ["managerTopics", "managerTopics"], ["prepare", "prepareUi"], ["before", "before"]] },
    { table: "InverseGetIntrinsicsRows", source: N, roles: [["asyncPrototype", "asyncPrototype"]] },
  ];
  const selected: Readonly<{ role: keyof typeof P; table: string; sourceRole: string }>[] = [];
  for (const group of groups) { for (const names of group.roles) { const role = names[0], sourceRole = names[1]; if (role === undefined || sourceRole === undefined || !isRole(role) || !Object.hasOwn(group.source, sourceRole) || (P as Readonly<Record<string, string>>)[role] !== (group.source as Readonly<Record<string, string>>)[sourceRole]) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION_SHARED_PROGRAM"); } selected.push(Object.freeze({ role, table: group.table, sourceRole })); } }
  if (selected.length !== 24 || new Set(selected.map(row => row.role)).size !== selected.length) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION_SHARED_ROSTER"); } return Object.freeze(selected);
}
/** Pack the two fresh guards and fixed command book; reuse only the exact
 * program bytes selected above. Native hash checks cover every expanded case. */
export function currentFootprintInverseNativeDeleteRegistrationNativeSource(): string { const shared = currentFootprintInverseNativeDeleteRegistrationSharedPrograms(); const sharedRoles = new Set<string>(shared.map(row => row.role)); const tableNames = [...new Set(shared.map(row => row.table))]; const selectors = shared.map(row => ["shared", row.role, String(tableNames.indexOf(row.table)), row.sourceRole]); const commands = cases(), rows = [...selectors, ...Object.entries(P).filter(([role]) => !sharedRoles.has(role)).map(([role, program]) => ["program", role, "", JSON.stringify(program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })]; const groups: string[][][] = []; let group: string[][] = [], size = 0; for (const row of rows) { if (row.some(field => field.includes("\0") || field.includes("\t"))) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION_CODEC_FIELD"); } const length = Buffer.byteLength(row.join("\t")); if (length > 60_000) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION_CODEC_ROW"); } if (size + Number(group.length > 0) + length > 60_000) { groups.push(group); group = []; size = 0; } size += Number(group.length > 0) + length; group.push(row); } if (group.length > 0) { groups.push(group); } if (groups.length > 8) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION_CODEC_TABLE"); }
  const tables = groups.map((part, index) => { const raw = Buffer.from(part.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time source data reaches this bounded table compressor.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseNativeDeleteRegistrationRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`; }).join("\n"); const local = `InverseFixedRows(new string[][][]{${groups.map((_part, index) => `InverseNativeDeleteRegistrationRows${String(index)}`).join(",")}})`; const all = "InverseNativeDeleteRegistrationRows()"; const tableCases = tableNames.map((table, index) => `case ${quote(String(index))}:source=${table};break;`).join(""); const hashes = commands.map(c => sha(Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
${tables}
static System.Collections.Generic.IEnumerable<string[]> InverseNativeDeleteRegistrationRows(){foreach(string[] row in ${local}){if(row[0]!="shared"){yield return row;continue;}System.Collections.Generic.IEnumerable<string[]> source;switch(row[2]){${tableCases}default:throw Error("inverse-native-delete-registration-table");}string[] found=null;foreach(string[] candidate in source)if(candidate[0]=="program"&&candidate[1]==row[3]){if(found!=null)throw Error("inverse-native-delete-registration-duplicate");found=candidate;}if(found==null)throw Error("inverse-native-delete-registration-missing");yield return new[]{found[0],row[1],found[2],found[3]};}}
public static string FootprintInverseNativeDeleteRegistrationMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-native-delete-registration-","native_delete_registration_",${all});}
public static void VerifyFootprintInverseNativeDeleteRegistrationCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in ${all}){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-native-delete-registration-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):"original_ref");string text=FootprintInverseNativeDeleteRegistrationMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-native-delete-registration-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-native-delete-registration-codec-roster");}
}`;
}

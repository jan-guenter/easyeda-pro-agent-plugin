/** Build-only decoder for the fresh native-equivalent sender. It has no
 * native control/send method, public-c adapter or original Job enrollment. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-delete-sender-programs.ts";
import { currentFootprintInverseNativeDeleteSenderCases as cases, currentFootprintInverseNativeDeleteSenderTemplate as template } from "./current-footprint-inverse-native-delete-sender-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Pack fixed programs and all command cases under the existing bounded table
 * decoder. Each native result has its own exact source-derived hash. */
export function currentFootprintInverseNativeDeleteSenderNativeSource(): string { const commands = cases(), rows = [...Object.entries(P).map(([role, program]) => ["program", role, "", JSON.stringify(program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })]; const groups: string[][][] = []; let group: string[][] = [], size = 0; for (const row of rows) { if (row.some(field => field.includes("\0") || field.includes("\t"))) { throw new Error("INVERSE_NATIVE_DELETE_SENDER_CODEC_FIELD"); } const length = Buffer.byteLength(row.join("\t")); if (length > 60_000) { throw new Error("INVERSE_NATIVE_DELETE_SENDER_CODEC_ROW"); } if (size + Number(group.length > 0) + length > 60_000) { groups.push(group); group = []; size = 0; } size += Number(group.length > 0) + length; group.push(row); } if (group.length > 0) { groups.push(group); } if (groups.length > 4) { throw new Error("INVERSE_NATIVE_DELETE_SENDER_CODEC_TABLE"); }
  const tables = groups.map((part, index) => { const raw = Buffer.from(part.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time source data reaches this bounded table compressor.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseNativeDeleteSenderRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`; }).join("\n"); const all = `InverseFixedRows(new string[][][]{${groups.map((_part, index) => `InverseNativeDeleteSenderRows${String(index)}`).join(",")}})`; const hashes = commands.map(c => sha(Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
${tables}
public static string FootprintInverseNativeDeleteSenderMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-native-delete-sender-","native_delete_sender_",${all});}
public static void VerifyFootprintInverseNativeDeleteSenderCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in ${all}){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-native-delete-sender-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):"original_ref");string text=FootprintInverseNativeDeleteSenderMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-native-delete-sender-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-native-delete-sender-codec-roster");}
}`;
}

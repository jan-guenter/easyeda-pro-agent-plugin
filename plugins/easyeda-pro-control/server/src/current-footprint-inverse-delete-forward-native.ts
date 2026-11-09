/** Build-only closed codec for the paired DEL sender and collateral grammar.
 * This is deliberately absent from native composition and has no Send method. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_CALLS as CALLS, currentFootprintInverseDeleteForwardCases as cases, currentFootprintInverseDeleteForwardTemplate as template } from "./current-footprint-inverse-delete-forward-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_SEND_CALLS as GET_CALLS, currentFootprintInverseGetSendCases as getCases, currentFootprintInverseGetSendTemplate as getTemplate } from "./current-footprint-inverse-get-send-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const key = (row: readonly string[]): string => `${String(row[0])}:${String(row[1])}`;
const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
/** Emit only fixed data and message/hash codecs. Source/native equality does
 * not enroll the original controller, admit a resume or issue a runtime Job. */
export function currentFootprintInverseDeleteForwardNativeSource(): string {
  const commands = cases(); const rows = [...Object.entries(CALLS).map(([role, row]) => ["program", role, "", JSON.stringify(row.program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })];
  // Reuse only rows whose complete bytes equal the independently transformed
  // Immutable GET row. Changed DEL programs and payloads stay in this table.
  const shared = new Map<string, string[]>();
  const before = [...Object.entries(GET_CALLS).map(([role, row]) => ["program", role, "", JSON.stringify(row.program)]), ...getCases().map(command => { const row = getTemplate(command); return [row.key, row.method, row.names.join(","), row.template]; })];
  const wanted = new Map(rows.map(row => [key(row), row])); for (const row of before) { const converted = row.map(value => value.replaceAll("__get_send_", "__delete_forward_").replaceAll("easyeda-footprint-inverse-get-send-v1", "easyeda-footprint-inverse-delete-forward-v1")); const actual = wanted.get(key(converted)); if (actual !== undefined && JSON.stringify(actual) === JSON.stringify(converted)) { shared.set(key(converted), converted); } }
  const unique = rows.filter(row => !shared.has(key(row))); const ordered = [...shared.values(), ...unique]; if (new Set(ordered.map(row => key(row))).size !== rows.length || ordered.length !== rows.length) { throw new Error("INVERSE_DELETE_FORWARD_SHARED_ROSTER"); }
  const groups: string[][][] = []; let current: string[][] = [], size = 0;
  for (const row of unique) { if (row.some(value => value.includes("\t") || value.includes("\0"))) { throw new Error("INVERSE_DELETE_FORWARD_CODEC_FIELD"); } const bytes = Buffer.byteLength(row.join("\t")); if (bytes > 60_000) { throw new Error("INVERSE_DELETE_FORWARD_CODEC_ROW"); } if (size + Number(current.length > 0) + bytes > 60_000) { groups.push(current); current = []; size = 0; } size += Number(current.length > 0) + bytes; current.push(row); }
  if (current.length > 0) { groups.push(current); } if (groups.length > 8 || commands.length > 128) { throw new Error("INVERSE_DELETE_FORWARD_CODEC_BOUND"); }
  const data = groups.map((group, index) => { const raw = Buffer.from(group.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Immutable build-only codec data, never application or request execution.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseDeleteForwardRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(group.length)},4);`; }).join("\n");
  const byKey = new Map(commands.map(command => { const row = template(command); return [`${row.key}:${row.method}`, command]; }));
  const hashes = ordered.filter(row => row[0] !== "program").map(row => { const command = byKey.get(key(row)); if (command === undefined) { throw new Error("INVERSE_DELETE_FORWARD_CODEC_CASE"); } return sha(Buffer.from(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`)); });
  return `public sealed partial class EasyedaDiagnosticOwner{
${data}
static System.Collections.Generic.IEnumerable<string[]> InverseDeleteForwardRows(){var selected=new System.Collections.Generic.HashSet<string>(@"${[...shared.keys()].join("|")}".Split('|'),System.StringComparer.Ordinal);int used=0;foreach(string[] row in InverseGetSendRows()){if(!selected.Contains(row[0]+":"+row[1]))continue;string[] projected=new string[4];for(int i=0;i<4;i++)projected[i]=row[i].Replace("__get_send_","__delete_forward_").Replace("easyeda-footprint-inverse-get-send-v1","easyeda-footprint-inverse-delete-forward-v1");used++;yield return projected;}if(used!=${String(shared.size)})throw Error("inverse-delete-forward-shared-roster");foreach(string[] row in InverseFixedRows(new string[][][]{${groups.map((_group, index) => `InverseDeleteForwardRows${String(index)}`).join(",")}}))yield return row;}
public static string FootprintInverseDeleteForwardMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-delete-forward-","delete_forward_",InverseDeleteForwardRows());}
public static void VerifyFootprintInverseDeleteForwardCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in InverseDeleteForwardRows()){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-delete-forward-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):name=="nativeOrigin"?"null":name=="workerUuid"?"01234567-0123-4567-89ab-0123456789ab":name=="replyTopic"?"_MSG_BUS_RPC_-/mgr/projectWorker/footprint/delete-01234567-0123-4567-89ab-0123456789ab-0":"original_ref");string message=FootprintInverseDeleteForwardMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-delete-forward-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-delete-forward-codec-roster");}
}`;
}

/** Fixed reference-worker message bytes only. Original-purpose state belongs to
 * the separate ledger; these immutable tables issue no readiness or resume. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_HELPERS as HELPERS } from "./current-footprint-inverse-get-worker-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_PROGRAMS as PROGRAMS, currentFootprintInverseReferenceWorkerCases, currentFootprintInverseReferenceWorkerTemplate } from "./current-footprint-inverse-reference-worker-protocol.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintInverseReferenceWorkerCodecNativeSource(): string {
  const cases = currentFootprintInverseReferenceWorkerCases();
  const rows = [...Object.entries(PROGRAMS).map(([role, program]) => {
    if (!program.includes(HELPERS) && role !== "delivery-members") { throw new Error("INVERSE_REFERENCE_WORKER_HELPERS"); }
    return ["program", role, "", JSON.stringify(program.replaceAll(HELPERS, "__reference_worker_shared__"))];
  }), ...cases.map(command => { const row = currentFootprintInverseReferenceWorkerTemplate(command); return [row.key, row.method, row.names.join(","), row.template]; })];
  const keys = new Set<string>(); const groups: string[][][] = []; let bytes = 0; let group: string[][] = [];
  for (const row of rows) {
    const key = row[0] === "program" ? `program:${String(row[1])}` : row[0];
    if (key === undefined || keys.has(key) || row.some(value => value.includes("\0") || value.includes("\t"))) { throw new Error("INVERSE_REFERENCE_WORKER_TABLE"); }
    keys.add(key); const size = Buffer.byteLength(row.join("\t")) + 1;
    if (size > 60_000) { throw new Error("INVERSE_REFERENCE_WORKER_ROW_BOUND"); }
    if (bytes + size > 60_000) { groups.push(group); bytes = 0; group = []; }
    group.push(row); bytes += size;
  }
  if (group.length > 0) { groups.push(group); }
  const loads = groups.map(list => {
    const raw = Buffer.from(list.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Build-only immutable fixed rows use the existing bounded decoder and exact full hashes.
    const packed = gzipSync(raw, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(list.length)},4));`;
  }).join("");
  const hashes = cases.map(command => hash(Buffer.from(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_worker" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
static string[][] LoadInverseReferenceWorkerRows(){var rows=new System.Collections.Generic.List<string[]>();${loads}return rows.ToArray();}
static readonly string[][] InverseReferenceWorkerRows=LoadInverseReferenceWorkerRows();
static System.Collections.Generic.IEnumerable<string[]> ExpandedInverseReferenceWorkerRows(){foreach(string[] row in InverseReferenceWorkerRows)if(row[0]=="program")yield return new[]{row[0],row[1],row[2],row[3].Replace("__reference_worker_shared__",InverseGetWorkerRows[0][3])};else yield return row;}
public static string FootprintInverseReferenceWorkerMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){if(fields==null)throw Error("inverse-reference-worker-fields");string selectedRole=role;System.Collections.IDictionary selected=fields;if(phase=="inverse-reference-worker-call"&&(role=="graph-collect"||role=="input-collectModels")){object count=fields["arguments"];if(!(count is int)&&!(count is long))throw Error("inverse-reference-worker-count");long number=System.Convert.ToInt64(count,System.Globalization.CultureInfo.InvariantCulture);if(number<(role=="graph-collect"?2:1)||number>(role=="graph-collect"?64:5))throw Error("inverse-reference-worker-count");selectedRole+=":"+number.ToString(System.Globalization.CultureInfo.InvariantCulture);var copy=new System.Collections.Hashtable();foreach(System.Collections.DictionaryEntry item in fields)if(!System.Object.Equals(item.Key,"arguments"))copy.Add(item.Key,item.Value);selected=copy;}
System.Func<string,object,string> scalar=(name,raw)=>{string value=raw as string;if(phase=="inverse-reference-worker-call"){if(role=="graph-node"&&name=="argument2"||role=="graph-reprove"&&name=="argument1"||role=="input-modelRoster"&&name=="argument0"||role=="delivery-capture"&&name=="argument6"){if(value==null||value.Length>32768||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[ -~]*\\z"))throw Error("inverse-reference-worker-text");return JsonString(value);}if(role=="input-model"&&name=="argument0"){if(value==null||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[a-f0-9]{32}\\z"))throw Error("inverse-reference-worker-uuid");return JsonString(value);}if(role=="input-namespace"&&name=="argument0"){if(value!="pcb-all"&&value!="footprint-derived"&&value!="device-all")throw Error("inverse-reference-worker-kind");return JsonString(value);}if(role=="tail-post"&&name=="argument2"){if(value!="WHOHAS"&&value!="PUBLISH")throw Error("inverse-reference-worker-kind");return JsonString(value);}}return null;};return InverseFixedMessage(id,session,phase,selectedRole,method,selected,"inverse-reference-worker-","reference_worker_",ExpandedInverseReferenceWorkerRows(),true,"program",scalar);}
static void RefuseInverseReferenceWorkerCodec(string role,System.Collections.IDictionary fields){bool refused=false;try{FootprintInverseReferenceWorkerMessage(79,"original_worker","inverse-reference-worker-call",role,"Runtime.callFunctionOn",fields);}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("inverse-reference-worker-codec-refusal");}
public static void VerifyFootprintInverseReferenceWorkerCodecSmoke(){string[] expected=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in InverseReferenceWorkerRows){if(row[0]=="program")continue;string[] key=row[0].Split(':');string phase=key[0],role=key.Length>1?key[1]:null;var fields=new System.Collections.Hashtable();if(key.Length==3)fields.Add("arguments",System.Int32.Parse(key[2],System.Globalization.CultureInfo.InvariantCulture));foreach(string name in row[2].Length==0?new string[0]:row[2].Split(',')){string value="original_ref";if(role=="graph-node"&&name=="argument2"||role=="graph-reprove"&&name=="argument1"||role=="input-modelRoster"&&name=="argument0"||role=="delivery-capture"&&name=="argument6")value="{}";else if(role=="input-model"&&name=="argument0")value=new string('a',32);else if(role=="input-namespace"&&name=="argument0")value="pcb-all";else if(role=="tail-post"&&name=="argument2")value="WHOHAS";fields.Add(name,value);}string text=FootprintInverseReferenceWorkerMessage(79,"original_worker",phase,role,row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=expected[index++])throw Error("inverse-reference-worker-parity");}if(index!=${String(cases.length)})throw Error("inverse-reference-worker-roster");var denied=new System.Collections.Hashtable();denied.Add("objectId","original_ref");denied.Add("argument0","delete");RefuseInverseReferenceWorkerCodec("input-namespace",denied);denied["argument0"]=new string('A',32);RefuseInverseReferenceWorkerCodec("input-model",denied);denied.Clear();denied.Add("arguments",1);RefuseInverseReferenceWorkerCodec("graph-collect",denied);denied["arguments"]=65;RefuseInverseReferenceWorkerCodec("graph-collect",denied);denied["arguments"]=2.0;RefuseInverseReferenceWorkerCodec("graph-collect",denied);denied["arguments"]=0;RefuseInverseReferenceWorkerCodec("input-collectModels",denied);denied.Clear();RefuseInverseReferenceWorkerCodec("caller-program",denied);}
}`;
}

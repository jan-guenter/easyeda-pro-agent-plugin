/** Fixed partial-step codec. Its one resume row needs a separately completed
 * original native readiness guard and an original controller reservation. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_CALLS as CALLS } from "./current-schematic-relevance-monitor-batch-protocol.ts";
import { currentSchematicRelevanceMonitorBatchCases, currentSchematicRelevanceMonitorBatchTemplate } from "./current-schematic-relevance-monitor-batch-wire.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function table(name: string, rows: readonly (readonly string[])[], columns: number): string {
  const raw = Buffer.from(rows.map(row => row.join("\t")).join("\0"));
  if (raw.length > 65_536) { throw new Error("SCHEMATIC_MONITOR_BATCH_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- These immutable in-memory tables retain both original and packed hashes under the existing decoder cap.
  const packed = gzipSync(raw, { level: 9 });
  return `static readonly string[][] ${name}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},${String(columns)});`;
}
export function currentSchematicRelevanceMonitorBatchNativeSource(): string {
  const cases = currentSchematicRelevanceMonitorBatchCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceMonitorBatchTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  const programs = CALLS.map((row, index) => [String(index), JSON.stringify(row[1])]);
  const hashes = cases.map(command => hash(Buffer.from(`${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`)));
  return `public static class EasyedaSchematicRelevanceMonitorBatchProtocol{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-monitor-batch-codec");}
${table("Rows", rows, 4)}
${table("Programs", programs, 2)}
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
static string Json(string value){return "\\""+value+"\\"";}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Handle(session);string[] row=null;foreach(string[] candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var values=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));values.Add(name,Json(Handle(fields[name])));}foreach(string[] program in Programs)values.Add("program"+program[0],program[1]);string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__schematic_monitorbatch_([A-Za-z0-9]+)__\\"",match=>{string value;Need(values.TryGetValue(match.Groups[1].Value,out value));return value;});text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Json(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Rows.Length;index++){string[] row=Rows[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string text=Encode(83,"original_ui",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("functionDeclaration","caller");bool refused=false;try{Encode(83,"original_ui",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}bool resumeRefused=false;try{Encode(83,"original_ui","unknown-resume","Debugger.resume",new System.Collections.Hashtable());}catch(System.InvalidOperationException){resumeRefused=true;}Need(resumeRefused);}
}`;
}

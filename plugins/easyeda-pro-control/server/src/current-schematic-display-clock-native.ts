/** Fixed SCH clock table, with native-owned initial SDK/worker receivers. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentSchematicDisplayClockTemplates } from "./current-schematic-display-clock-wire.ts";
import type { CurrentSchematicDisplayClockFieldKind, CurrentSchematicDisplayClockTemplate } from "./current-schematic-display-clock-wire.ts";

const literal = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
function sample(kind: CurrentSchematicDisplayClockFieldKind): string | number {
  if (kind === "project") { return "a".repeat(64); } if (kind === "branch") { return "b".repeat(32); } if (kind === "uuid") { return "11111111-1111-1111-1111-111111111111"; }
  if (kind === "tab") { return "window"; } if (kind === "topic") { return "_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-1111-1111-1111-111111111111-41"; }
  if (kind === "count") { return 41; } if (kind === "time") { return 1_700_000_000_123; } return "schematic_handle";
}
function expand(row: CurrentSchematicDisplayClockTemplate): string {
  let text = row.template.replaceAll("__schematic_clock_boundSdk__", "original_sdk").replaceAll("__schematic_clock_boundWorker__", "original_context");
  for (const [name, kind] of Object.entries(row.fields)) { const value = sample(kind); text = typeof value === "number" ? text.replaceAll(JSON.stringify(`__schematic_clock_${name}__`), String(value)) : text.replaceAll(`__schematic_clock_${name}__`, value); }
  if (text.includes("__schematic_clock_")) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_PLACEHOLDER"); } return text;
}
export function currentSchematicDisplayClockNativeSource(): string {
  const cases = currentSchematicDisplayClockTemplates();
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_DUPLICATE"); }
  const rows = cases.map(row => [row.phase, row.method, row.realm, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const groups: string[][] = [[]];
  for (const row of rows) { let group = groups.at(-1); if (group === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_TABLE_BOUND"); }
    if (Buffer.byteLength([...group, row].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(row); }
  const loaders = groups.map(group => { const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- In-memory deterministic fixed templates under the unchanged64KiB decoder ceiling.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},5));`;
  }).join("\n");
  const hashes = cases.map(row => createHash("sha256").update(`{"id":79,${expand(row).slice(1, -1)},"sessionId":"${row.realm === "worker" ? "original_worker" : "original_ui"}"}\0`).digest("hex"));
  return `public static class EasyedaSchematicDisplayClockProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-schematic-clock-protocol");}
static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}
static readonly string[][] Cases=Load();
static string Field(string kind,object input){
if(kind=="count"||kind=="time"){Need(input is int||input is long||input is double);double n=System.Convert.ToDouble(input,System.Globalization.CultureInfo.InvariantCulture);Need(!double.IsNaN(n)&&!double.IsInfinity(n)&&n==System.Math.Truncate(n)&&n>=(kind=="time"?1:0)&&n<=(kind=="time"?8640000000000000d:9007199254740990d));return n.ToString("R",System.Globalization.CultureInfo.InvariantCulture);}
string text=input as string;Need(text!=null);string pattern=kind=="project"?@"\\A[a-f0-9]{64}\\z":kind=="branch"?@"\\A[a-f0-9]{32}\\z":kind=="uuid"?@"\\A[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\z":kind=="tab"?@"\\A[A-Za-z0-9_-]{1,128}\\z":kind=="topic"?@"\\A_MSG_BUS_RPC_-/pro-mgr/serverTime/now-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[0-9]+\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(text.Length<=256&&System.Text.RegularExpressions.Regex.IsMatch(text,pattern));return text;
}
public static string Encode(int id,string ui,string worker,string sdk,string context,string realm,string phase,string method,System.Collections.IDictionary fields){
Need(id>0&&fields!=null&&(realm=="ui"||realm=="worker"));Field("handle",ui);Field("handle",worker);Field("handle",sdk);Field("handle",context);Need(ui!=worker);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method&&(row[2]=="either"||row[2]==realm));string[] names=row[3].Length==0?new string[0]:row[3].Split(',');Need(fields.Count==names.Length);string text=row[4].Replace("__schematic_clock_boundSdk__",sdk).Replace("__schematic_clock_boundWorker__",context);foreach(string pair in names){var parts=pair.Split(':');Need(parts.Length==2&&fields.Contains(parts[0]));string value=Field(parts[1],fields[parts[0]]),marker="__schematic_clock_"+parts[0]+"__";text=parts[1]=="count"||parts[1]=="time"?text.Replace("\\""+marker+"\\"",value):text.Replace(marker,value);}Need(!text.Contains("__schematic_clock_"));string session=realm=="worker"?worker:ui;string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":\\""+session+"\\"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[3].Length>0)foreach(string pair in row[3].Split(',')){var p=pair.Split(':');object value=p[1]=="project"?new string('a',64):p[1]=="branch"?new string('b',32):p[1]=="uuid"?"11111111-1111-1111-1111-111111111111":p[1]=="tab"?"window":p[1]=="topic"?"_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-1111-1111-1111-111111111111-41":p[1]=="count"?(object)41:p[1]=="time"?(object)1700000000123L:"schematic_handle";fields.Add(p[0],value);}string realm=row[2]=="worker"?"worker":"ui";string encoded=Encode(79,"original_ui","original_worker","original_sdk","original_context",realm,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,"original_ui","original_worker","original_sdk","original_context",realm,row[0],"Runtime.evaluate",fields));fields.Add("objectIdOverride","caller");Refuse(()=>Encode(79,"original_ui","original_worker","original_sdk","original_context",realm,row[0],row[1],fields));}}
}`;
}

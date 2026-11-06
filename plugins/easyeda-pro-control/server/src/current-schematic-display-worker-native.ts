/** Packed finite bootstrap/Save observer templates. Neither SQL nor application
 * methods, session selectors, code or arbitrary breakpoint data are inputs. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentSchematicDisplayWorkerNativeCases, currentSchematicDisplayWorkerWire } from "./current-schematic-display-worker-wire.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function sample(name: string): string { if (name === "pageUuid") { return "a".repeat(32); } if (name === "projectUuid") { return "b".repeat(64); } return "schematic_handle"; }
export function currentSchematicDisplayWorkerNativeSource(): string {
  const rows = currentSchematicDisplayWorkerNativeCases().map(command => {
    const wire = currentSchematicDisplayWorkerWire(command, 1);
    const fields = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    let template = JSON.stringify({ method: command.method, params: command.params });
    for (const name of fields) {
      const value = wire.request[name]; if (typeof value !== "string") { throw new TypeError("SCHEMATIC_DISPLAY_WORKER_TEMPLATE_FIELD"); }
      if (template.split(JSON.stringify(value)).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_WORKER_TEMPLATE_ALIAS"); }
      template = template.replace(JSON.stringify(value), JSON.stringify(`__schematicworker_${name}__`));
    }
    return [wire.request["phase"], command.method, fields.join(","), template].join("\t");
  });
  const groups: string[][] = [[]];
  for (const row of rows) {
    let selected = groups.at(-1); if (selected === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("SCHEMATIC_DISPLAY_WORKER_TABLE_BOUND"); }
    if (Buffer.byteLength([...selected, row].join("\0")) > 60_000) { selected = []; groups.push(selected); } selected.push(row);
  }
  const loaders = groups.map(group => {
    const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of fixed reviewed templates under the unchanged64KiB decoder limit.
    const packed = gzipSync(bytes, { level: 9 });
    return `result.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("SCHEMATIC_DISPLAY_WORKER_TEMPLATE"); }
    const restored = template.replaceAll(/"__schematicworker_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => JSON.stringify(sample(name)));
    return createHash("sha256").update(`{"id":73,${restored.slice(1, -1)},"sessionId":"original_worker"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicDisplayWorkerProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-schematic-worker-protocol");}
static string[][] Load(){var result=new System.Collections.Generic.List<string[]>();${loaders}return result.ToArray();}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);string pattern=name=="pageUuid"?@"\\A[a-f0-9]{32}\\z":name=="projectUuid"?@"\\A[a-f0-9]{64}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return "\\""+value+"\\"";}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\\A[A-Za-z0-9_.:-]{1,128}\\z"));string[] row=null;foreach(string[] candidate in Cases)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string template=row[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__schematicworker_([A-Za-z0-9]+)__\\"")){output.Append(template,previous,match.Index-previous);output.Append(Field(match.Groups[1].Value,fields[match.Groups[1].Value]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1,output.Length-2)+",\\"sessionId\\":\\""+session+"\\"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,name=="pageUuid"?new string('a',32):name=="projectUuid"?new string('b',64):"schematic_handle");string text=Encode(73,"original_worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,"original_worker",row[0],"Runtime.evaluate",fields));fields.Add("sessionId","copied");Refused(()=>Encode(73,"original_worker",row[0],row[1],fields));fields.Remove("sessionId");fields.Add("expression","callerCode");Refused(()=>Encode(73,"original_worker",row[0],row[1],fields));}}
}`;
}

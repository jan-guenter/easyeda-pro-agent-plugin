/** One fixed worker transport codec. Values replace original template markers
 * once, so a literal marker in an actual handle cannot trigger another rewrite. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentProjectSaveProducerTemplates } from "./current-project-save-producer-wire.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentProjectSaveProducerNativeSource(): string {
  const cases = currentProjectSaveProducerTemplates();
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("PROJECT_SAVE_PRODUCER_CASE_ALIAS"); }
  const groups: string[][] = [[]];
  for (const row of cases) {
    const text = [row.phase, row.method, row.fields.join(","), row.template].join("\t"); let group = groups.at(-1);
    if (group === undefined || Buffer.byteLength(text) > 60_000) { throw new Error("PROJECT_SAVE_PRODUCER_TABLE_BOUND"); }
    if (Buffer.byteLength([...group, text].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(text);
  }
  const loaders = groups.map(group => {
    const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Deterministic bounded packing of the fixed codebook; the original64KiB decoder limit stays unchanged.
    const packed = gzipSync(bytes, { level: 9 });
    return `result.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const pattern = /__project_save_producer_([A-Za-z\d]+)__/gu;
  const hashes = cases.map(row => {
    const template = row.template.replace(pattern, (_, name: string) => name === "boundContext" ? "original_context" : "original_handle");
    return createHash("sha256").update(`{"id":79,${template.slice(1, -1)},"sessionId":"original_worker"}\0`).digest("hex");
  });
  return `public static class EasyedaProjectSaveProducerProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-project-save-producer");}
static string[][] Load(){var result=new System.Collections.Generic.List<string[]>();${loaders}return result.ToArray();}
static readonly string[][] Cases=Load();
static string Handle(object input){string text=input as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){
Need(id>0&&fields!=null);Handle(session);Handle(context);string[] row=null;foreach(var candidate in Cases)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var replacements=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);replacements.Add("boundContext",context);foreach(string name in names){Need(fields.Contains(name));replacements.Add(name,Handle(fields[name]));}
string text=System.Text.RegularExpressions.Regex.Replace(row[3],@"__project_save_producer_([A-Za-z0-9]+)__",match=>{string value;Need(replacements.TryGetValue(match.Groups[1].Value,out value));return value;});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":\\""+session+"\\"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"original_handle");string encoded=Encode(79,"original_worker","original_context",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,"original_worker","original_context",row[0],"Runtime.evaluate",fields));fields.Add("uniqueContextId","foreign");Refuse(()=>Encode(79,"original_worker","original_context",row[0],row[1],fields));}}
}`;
}

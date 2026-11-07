/** Shared immutable codebook only. Each original purpose must separately
 * enforce intent, stage, actual pause/handle custody, limits and completion. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentProjectLibraryRefreshCases } from "./current-project-library-refresh-protocol.ts";
import { currentProjectLibraryRefreshOrder,currentProjectLibraryRefreshTemplates } from "./current-project-library-refresh-wire.ts";

const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
export function currentProjectLibraryRefreshNativeSource():string{
 const commands=currentProjectLibraryRefreshCases();const order=currentProjectLibraryRefreshOrder(),rows=currentProjectLibraryRefreshTemplates();
 const text=rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0");const bytes=Buffer.from(text);
 if(bytes.length===0||bytes.length>65_536||rows.length!==52||new Set(rows.map(row=>row.phase)).size!==rows.length||order.length!==43||order.some(phase=>!rows.some(row=>row.phase===phase))){throw new Error("PROJECT_LIBRARY_REFRESH_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Exact immutable build bytes use the unchanged bounded fixed-table decoder and both complete hashes.
 const packed=gzipSync(bytes,{level:9});
 const hashes=commands.map(command=>{const params:unknown=JSON.parse(JSON.stringify(command.params,(name,value:unknown)=>{if(name==="uniqueContextId"){return"original_context";}if(["objectId","callFrameId","scriptId","breakpointId"].includes(name)){return"original_ref";}return value;}));return hash(Buffer.from(`${JSON.stringify({id:79,method:command.method,params,sessionId:"original_worker"})}\0`));});
 return `internal static class EasyedaProjectLibraryRefreshProtocol{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("project-library-refresh-codec");}
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
static string Quote(string value){return "\\""+Handle(value)+"\\"";}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},52,4);
static readonly int[] Order={${order.map(phase=>String(rows.findIndex(row=>row.phase===phase))).join(",")}};
internal static string Phase(int index){Need(index>=0&&index<Order.Length);return Rows[Order[index]][0];}
internal static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Handle(session);Handle(context);string[] row=null;foreach(string[] candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(object key in fields.Keys){string name=key as string;Need(name!=null&&System.Array.IndexOf(names,name)>=0);}var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);data.Add("boundContext",context);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Handle(fields[name]));}string message=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__library_refresh_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return Quote(value);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+message.Substring(1,message.Length-2)+",\\"sessionId\\":"+Quote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
internal static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};Need(Rows.Length==52&&Order.Length==43);var phases=new string[Order.Length];for(int i=0;i<phases.Length;i++)phases[i]=Phase(i);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(string.Join("\\0",phases)))).Replace("-","").ToLowerInvariant()==${quote(hash(Buffer.from(order.join("\0"))))});for(int i=0;i<Rows.Length;i++){var fields=new System.Collections.Hashtable();foreach(string name in Rows[i][2].Length==0?new string[0]:Rows[i][2].Split(','))fields.Add(name,"original_ref");string encoded=Encode(79,"original_worker","original_context",Rows[i][0],Rows[i][1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);bool refused=false;try{Encode(79,"original_worker","original_context",Rows[i][0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}foreach(int index in new[]{-1,43}){bool refused=false;try{Phase(index);}catch(System.InvalidOperationException){refused=true;}Need(refused);}var extra=new System.Collections.Hashtable();extra.Add("unexpected","original");bool bad=false;try{Encode(79,"original_worker","original_context","library-refresh-pristine","Runtime.callFunctionOn",extra);}catch(System.InvalidOperationException){bad=true;}Need(bad);}
}

`;
}

/** Either new purpose may compose this once; repeated generation is exact. */
export function applyCurrentProjectLibraryRefreshNativeFragment(input:string):string{
 const begin="// BEGIN SHARED ORIGINAL LIBRARY REFRESH CODEBOOK",end="// END SHARED ORIGINAL LIBRARY REFRESH CODEBOOK";
 const start=input.indexOf(begin),stop=input.indexOf(end);const value=`${begin}\n${currentProjectLibraryRefreshNativeSource()}\n${end}`;
 if(start!==-1||stop!==-1){if(start===-1||stop<start||input.includes(begin,start+1)||input.includes(end,stop+1)){throw new Error("PROJECT_LIBRARY_REFRESH_NATIVE_MARKERS");}return input.slice(0,start)+value+input.slice(stop+end.length);}
 const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(input.split(anchor).length!==2){throw new Error("PROJECT_LIBRARY_REFRESH_NATIVE_ANCHOR");}return input.replace(anchor,`${value}\n${anchor}`);
}

/** Fixed cold-only readonly books. Tables supply syntax, never a native
 * birth, original checkpoint, replay exclusion or reopened proof. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_OWN_DATA_PROGRAMS as OWN_PROGRAMS,currentFootprintInverseNativeDeleteColdOwnDataCases as ownCases,currentFootprintInverseNativeDeleteColdOwnDataTemplate as ownTemplate} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS as GET_PROGRAMS} from "./current-footprint-inverse-native-delete-cold-get-programs.ts";
import {currentFootprintInverseNativeDeleteColdGetCases as getCases,currentFootprintInverseNativeDeleteColdGetTemplate as getTemplate} from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";

const hash=(value:Uint8Array|string):string=>createHash("sha256").update(value).digest("hex");
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_BOOK");}}
function load(text:string,rows:number,columns:number):string{
 const bytes=Buffer.from(text);need(bytes.length<=60_000&&rows>0&&rows<=256);
 // oxlint-disable-next-line node/no-sync -- Immutable build-time tables retain the unchanged bounded native decoder.
 const packed=gzipSync(bytes,{level:9});
 return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows)},${String(columns)})`;
}
function selectors():readonly Readonly<{key:string;method:string;names:readonly string[];template:string}>[]{
 const own=ownCases().map(command=>{const row=ownTemplate(command);return{key:row.phase,method:row.method,names:row.names,template:row.template};});
 const get=getCases().map(command=>{const row=getTemplate(command);return{key:command.phase+("role"in command?":"+command.role:""),method:row.method,names:row.names,template:row.template};});
 const all=[...own,...get];need(all.length===37&&new Set(all.map(row=>row.key)).size===37);
 need(all.every(row=>[row.key,row.method,row.names.join(","),row.template].every(value=>!value.includes("\t")&&!value.includes("\0"))));
 return Object.freeze(all);
}
export function currentFootprintInverseNativeDeleteColdNativeSource():string{
 const all=selectors(),programs=[
 ...Object.entries(OWN_PROGRAMS).map(([role,program])=>[`__inverse_native_delete_cold_own_data_program${role}__`,program]),
 ...Object.entries(GET_PROGRAMS).map(([role,program])=>[`__cold_get_program_${role}__`,program])];
 need(programs.length===12&&programs.every(row=>row.length===2&&row.every(value=>!value.includes("\t")&&!value.includes("\0"))));
 const table=load(all.map(row=>[row.key,row.method,row.names.join(","),row.template].join("\t")).join("\0"),all.length,4);
 const sources=load(programs.map(row=>row.join("\t")).join("\0"),programs.length,2);
 const smoke=hash(all.map(row=>{
  let text=row.template;
  for(const program of programs){const [key,value]=program;need(key!==undefined&&value!==undefined);text=text.replaceAll(JSON.stringify(key),JSON.stringify(value));}
  for(const name of row.names){let value:string|number="original_ref";if(name==="ticket"){value=7;}else if(name==="projectUuid"){value="1".repeat(64);}else if(name==="branchUuid"){value="3".repeat(32);}else if(name==="documentUuid"){value="2".repeat(16);}
   const prefix=row.key.startsWith("inverse-native-delete-cold-own-data-")?"__inverse_native_delete_cold_own_data_":"__cold_get_";
   text=text.replaceAll(JSON.stringify(`${prefix}${name}__`),JSON.stringify(value));}
  return `{"id":79,${text.slice(1,-1)},"sessionId":"original_session10"}\0`;
 }).join(""));
 return String.raw`public sealed partial class EasyedaDiagnosticOwner{
static class NativeDeleteColdBook{
internal static readonly string[][] Rows=${table};
static readonly string[][] Programs=${sources};
static void Need(bool value){if(!value)throw Error("inverse-native-delete-cold-codec");}
static string Scalar(string name,object input){
 if(name=="ticket"){Need(input is int||input is long);long value=Convert.ToInt64(input,CultureInfo.InvariantCulture);Need(value>0&&value<=9007199254740991L);return value.ToString(CultureInfo.InvariantCulture);}
 string text=input as string;Need(text!=null);string pattern=name=="projectUuid"?@"\A[a-f0-9]{64}\z":name=="branchUuid"?@"\A[a-f0-9]{32}\z":name=="documentUuid"?@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z":@"\A[A-Za-z0-9_.:-]{1,256}\z";Need(System.Text.RegularExpressions.Regex.IsMatch(text,pattern));return JsonString(text);
}
internal static string Encode(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){
 Need(id>0&&fields!=null);string key=phase+(role==null?"":":"+role);string[] selected=null;foreach(string[] row in Rows)if(row[0]==key){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);
 string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));
 string text=selected[3];foreach(string[] program in Programs)text=text.Replace(JsonString(program[0]),JsonString(program[1]));
 text=System.Text.RegularExpressions.Regex.Replace(text,"\"__(?:inverse_native_delete_cold_own_data_|cold_get_)([A-Za-z0-9]+)__\"",match=>Scalar(match.Groups[1].Value,fields[match.Groups[1].Value]));
 text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\"sessionId\":"+Scalar("session",session)+"}\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;
}
}
public static string NativeDeleteColdMessage(int id,string session,string phase,object rawRole,string method,System.Collections.IDictionary fields){
 if(rawRole!=null&&!(rawRole is string))throw Error("inverse-native-delete-cold-role");return NativeDeleteColdBook.Encode(id,session,phase,rawRole as string,method,fields);
}
public static void VerifyNativeDeleteColdSmoke(){
 var packets=new System.Text.StringBuilder();int count=0;foreach(string[] row in NativeDeleteColdBook.Rows){int split=row[0].IndexOf(':');string phase=split<0?row[0]:row[0].Substring(0,split),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();
 foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="ticket"?(object)7L:name=="projectUuid"?new string('1',64):name=="branchUuid"?new string('3',32):name=="documentUuid"?new string('2',16):"original_ref");
 string text=NativeDeleteColdMessage(79,"original_session10",phase,role,row[1],fields);if(!text.StartsWith("{\"id\":79,",StringComparison.Ordinal)||!text.EndsWith(",\"sessionId\":\"original_session10\"}\0",StringComparison.Ordinal)||text.Contains("__cold_get_")||text.Contains("__inverse_native_delete_cold_own_data_"))throw Error("inverse-native-delete-cold-smoke");
 packets.Append(text);count++;}if(count!=37)throw Error("inverse-native-delete-cold-count");
 using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(packets.ToString()))).Replace("-","").ToLowerInvariant()!="${smoke}")throw Error("inverse-native-delete-cold-smoke-bytes");
}
}
`;
}

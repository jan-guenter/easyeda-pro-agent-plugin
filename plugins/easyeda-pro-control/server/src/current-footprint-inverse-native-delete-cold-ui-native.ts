/** Bespoke negative-task codec, without any positive GET native book.
 * This static syntax cannot bind a realm, spend a call, resume a frame or
 * grant an original cold birth. The eventual own sender must enforce those. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_NATIVE_OWN_DATA_CHECK as COMMON} from "./current-native-own-data-intrinsics.ts";
import {currentFootprintInverseNativeDeleteColdUiCases as cases,currentFootprintInverseNativeDeleteColdUiProgram as program,currentFootprintInverseNativeDeleteColdUiTemplate as template} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";

const hash=(text:string|Uint8Array):string=>createHash("sha256").update(text).digest("hex");
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_NATIVE");}}
function load(text:string,rows:number,columns:number):string{
 const bytes=Buffer.from(text);need(bytes.length<=60_000&&rows>=1&&rows<=256);
 // oxlint-disable-next-line node/no-sync -- Immutable source tables retain the existing bounded native decoder.
 const packed=gzipSync(bytes,{level:9});
 return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows)},${String(columns)})`;
}
export function currentFootprintInverseNativeDeleteColdUiNativeTables():Readonly<{rows:string;programs:readonly string[];common:string;count:number;smoke:string}>{
 const commands=cases();const rows=commands.map(command=>template(command));
 need(rows.length===125&&new Set(rows.map(row=>row.key)).size===125);
 const programs=commands.flatMap(command=>{
  const source=program(command);
  return command.method==="Runtime.callFunctionOn"&&source!==null?[[`__cold_ui_program_${command.role}__`,source.replaceAll(COMMON,"__cold_ui_native_check__")]]:[];
 });
 need(programs.length===91&&programs.every(row=>row.length===2));
 const rowText=rows.map(row=>[row.key,row.method,row.names.join(","),row.template].join("\t")).join("\0");
 const groups:string[][][]=[];let group:string[][]=[];let size=0;
 for(const row of programs){const length=Buffer.byteLength(row.join("\t"))+Number(group.length>0);if(size+length>60_000){need(group.length>0);groups.push(group);group=[];size=0;}group.push(row);size+=length;}
 if(group.length>0){groups.push(group);}
 for(const value of [...rows.flatMap(row=>[row.key,row.method,row.names.join(","),row.template]),...programs.flat()]){need(!value.includes("\t")&&!value.includes("\0"));}
 const packets=commands.map(command=>`{"id":79,${JSON.stringify({method:command.method,params:command.params}).slice(1,-1)},"sessionId":"original_session10"}\0`);
 // Runtime reference handles and scalar UUIDs in all cases match this exact
 // Receipt; source tokens are restored by the independently checked table.
 return Object.freeze({rows:load(rowText,rows.length,4),programs:Object.freeze(groups.map(value=>load(value.map(row=>row.join("\t")).join("\0"),value.length,2))),common:load(COMMON,1,1),count:rows.length,smoke:hash(packets.join(""))});
}
export function currentFootprintInverseNativeDeleteColdUiNativeSource():string{
 const tables=currentFootprintInverseNativeDeleteColdUiNativeTables();
 return String.raw`public sealed partial class EasyedaDiagnosticOwner{
static class NativeDeleteColdUiBook{
internal static readonly string[][] Rows=${tables.rows};
static readonly string Common=${tables.common}[0][0];
static readonly string[][][] Programs={${tables.programs.join(",")}};
static void Need(bool value){if(!value)throw Error("inverse-native-delete-cold-ui-codec");}
static string Scalar(string name,object raw){
 string text=raw as string;Need(text!=null);if(name=="maximumTicket"){long ticket;Need(System.Text.RegularExpressions.Regex.IsMatch(text,@"\A[1-9][0-9]{0,15}\z")&&Int64.TryParse(text,NumberStyles.None,CultureInfo.InvariantCulture,out ticket)&&ticket>=1&&ticket<=9007199254740991L);return text;}string pattern=name=="projectUuid"?@"\A[a-f0-9]{64}\z":name=="branchUuid"?@"\A[a-f0-9]{32}\z":name=="documentUuid"?@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z":@"\A[A-Za-z0-9_.:-]{1,256}\z";Need(System.Text.RegularExpressions.Regex.IsMatch(text,pattern));return JsonString(text);
}
internal static string Encode(int id,string session,string role,string method,System.Collections.IDictionary fields){
 Need(id>0&&role!=null&&fields!=null);string key=role+":"+method;string[] selected=null;foreach(string[] row in Rows)if(row[0]==key){Need(selected==null);selected=row;}Need(selected!=null);
 string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));
 string text=selected[3];foreach(string[][] table in Programs)foreach(string[] source in table)text=text.Replace(JsonString(source[0]),JsonString(source[1].Replace("__cold_ui_native_check__",Common)));
 text=System.Text.RegularExpressions.Regex.Replace(text,"\"__cold_ui_([A-Za-z0-9]+)__\"",match=>Scalar(match.Groups[1].Value,fields[match.Groups[1].Value]));
 text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\"sessionId\":"+Scalar("session",session)+"}\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;
}
}
public static string NativeDeleteColdUiMessage(int id,string session,string role,string method,System.Collections.IDictionary fields){return NativeDeleteColdUiBook.Encode(id,session,role,method,fields);}
public static void VerifyNativeDeleteColdUiSmoke(){
 var packets=new System.Text.StringBuilder();int count=0;foreach(string[] row in NativeDeleteColdUiBook.Rows){int split=row[0].IndexOf(':');string role=row[0].Substring(0,split),method=row[0].Substring(split+1);var fields=new System.Collections.Hashtable();
 foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="maximumTicket"?"79":name=="projectUuid"?new string('1',64):name=="branchUuid"?new string('3',32):name=="documentUuid"?new string('2',16):name=="uniqueContextId"?"original_context":name=="callFrameId"?"original_frame":name=="scriptId"?"original_script":name=="breakpointId"?"original_point":"original_ref");
 string text=NativeDeleteColdUiMessage(79,"original_session10",role,method,fields);if(text.Contains("__cold_ui_")||!text.EndsWith("\0",StringComparison.Ordinal))throw Error("inverse-native-delete-cold-ui-smoke");packets.Append(text);count++;}
 if(count!=${String(tables.count)})throw Error("inverse-native-delete-cold-ui-count");
 using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(packets.ToString()))).Replace("-","").ToLowerInvariant()!="${tables.smoke}")throw Error("inverse-native-delete-cold-ui-smoke-bytes");
}
}
`;
}

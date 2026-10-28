/** Fixed native writer encoder, deliberately absent from all mounted helper
 * grammars. Native ownership, budgets and one-shot qualification remain required. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "./current-footprint-copy-create-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS as LIMITS } from "./current-footprint-copy-native-create-wire.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";

const marker = (name: string): string => `__copycreate_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyNativeCreateTemplate(): string {
  return JSON.stringify({ method: "Runtime.callFunctionOn", sessionId: marker("sessionId"), params: {
    objectId: marker("objectId"), functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: [...Array.from({ length: 5 }, (_, index) => ({ objectId: marker(`arg${String(index)}ObjectId`) })),
      { value: marker("expectedProjectUuid") }, { value: marker("createArgumentJson") }],
    objectGroup: CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false,
  } });
}
export function currentFootprintCopyNativeCreateNativeSource(): string {
  const template = Buffer.from(currentFootprintCopyNativeCreateTemplate());
  if (template.length > 16_384) { throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_TEMPLATE"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of one fixed native command during source generation.
  const packed = gzipSync(template, { level: 9 });
  return `public static class EasyedaFootprintCopyNativeCreateProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-native-create-protocol");}
static readonly System.Text.UTF8Encoding Utf8=new System.Text.UTF8Encoding(false,true);
static string Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(template.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(template).digest("hex"))});return Utf8.GetString(bytes);}
static readonly string Template=Load();
static string Text(object input,int maximum){string value=input as string;Need(value!=null&&value.Length<=maximum);Utf8.GetByteCount(value);return value;}
static string Field(string name,object input){string value=Text(input,256);Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":name=="expectedProjectUuid"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
static void Arguments(string raw,string project){Need(Utf8.GetByteCount(raw)<=${String(LIMITS.argumentsBytes)});var json=new System.Web.Script.Serialization.JavaScriptSerializer();json.MaxJsonLength=${String(LIMITS.argumentsBytes)};json.RecursionLimit=16;var value=json.DeserializeObject(raw) as System.Collections.IDictionary;Need(value!=null&&value.Count==10);string[] names={"uuid","path","isProject","docType","title","display_title","description","custom_tags","source","version"};foreach(string name in names)Need(value.Contains(name));
Need(System.Text.RegularExpressions.Regex.IsMatch(Text(value["uuid"],32),@"\\A(?:[a-f0-9]{16}|[a-f0-9]{32})\\z")&&Text(value["path"],64)==project&&value["isProject"] is bool&&(bool)value["isProject"]&&value["docType"] is int&&(int)value["docType"]==4);string title=Text(value["title"],512);Need(title.Length>0&&Text(value["display_title"],512)==title&&Text(value["source"],0)==""&&Text(value["version"],0)=="");Text(value["description"],65536);object[] tags=json.DeserializeObject(Text(value["custom_tags"],65536)) as object[];Need(tags!=null&&tags.Length<=256);foreach(object tag in tags)Text(tag,512);}
public static string Encode(int id,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&fields.Count==8);string[] names={"objectId","arg0ObjectId","arg1ObjectId","arg2ObjectId","arg3ObjectId","arg4ObjectId","expectedProjectUuid","createArgumentJson"};foreach(string name in names)Need(fields.Contains(name));string session=Field("sessionId",originalWorkerSession),project=Field("expectedProjectUuid",fields["expectedProjectUuid"]),raw=Text(fields["createArgumentJson"],65536);Arguments(raw,project);var output=new System.Text.StringBuilder();int previous=0;
foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(Template,"\\"__copycreate_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(Template,previous,match.Index-previous);if(name=="createArgumentJson")output.Append(raw);else{output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');}previous=match.Index+match.Length;}output.Append(Template,previous,Template.Length-previous);string command="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(Utf8.GetByteCount(command)<=${String(LIMITS.commandBytes)});return command+"\\0";}
}`;
}

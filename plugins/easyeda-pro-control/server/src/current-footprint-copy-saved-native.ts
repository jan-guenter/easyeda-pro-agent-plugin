/** Native serialization for the two saved-generation operations. Fixed packed
 * functions are decoded once; runtime input contains only scoped identifiers. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION, currentFootprintCopySavedQueueCommand } from "./current-footprint-copy-saved-queue.ts";
import { currentFootprintCopySavedSourceCommand } from "./current-footprint-copy-saved-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } from "./current-footprint-copy-v2-saved-cache-read.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_NATIVE_GUARDS, currentFootprintCopySourceNativeParameters } from "./current-footprint-copy-source-native.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function packed(program: string): string {
  const bytes = Buffer.from(JSON.stringify(program));
  if (bytes.length > 65_536) { throw new Error("FOOTPRINT_SAVED_NATIVE_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Pack two fixed local function literals during deterministic source generation; no runtime input is compressed.
  const compressed = gzipSync(bytes, { level: 9 });
  return `Load(${literal(compressed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))})`;
}
export function currentFootprintCopySavedNativeSource(): string {
  // The structural source serializer uses this exact internal field name.
  // Its value here is the saved V2 program, independently hashed below.
  const queue = packed(CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION), source = packed(CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION);
  const branchUuid = "b".repeat(32), projectUuid = "a".repeat(64), sessionId = "saved-smoke-session";
  const selected = { identity: { projectUuid, branchUuid, windowTabId: "original-tab" }, footprintUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 123 };
  const sourceFields = { objectId: "manager", argument0: "project", argument1: "bus", argument2: "consistency", argument4: "constructors", argument5: "methods",
    projectUuid, branchUuid, windowTabId: selected.identity.windowTabId, footprintUuid: selected.footprintUuid, client: selected.client, maximumTicket: String(selected.maximumTicket) };
  const sourceCommand = currentFootprintCopySavedSourceCommand({ manager: sourceFields.objectId, project: sourceFields.argument0, bus: sourceFields.argument1,
    consistency: sourceFields.argument2, constructors: sourceFields.argument4, methods: sourceFields.argument5 }, selected);
  const queueFields = { uniqueContextId: "queue-context", projectUuid, branchUuid };
  const queueCommand = currentFootprintCopySavedQueueCommand({ sessionId, ...queueFields });
  const hashes = [JSON.stringify({ id: 1, method: sourceCommand.method, sessionId, params: sourceCommand.params }), JSON.stringify({ id: 1, ...queueCommand })]
    .map(command => createHash("sha256").update(`${command}\0`).digest("hex"));
  const fixtures = [sourceFields, queueFields].map(fields => `${Object.keys(fields).join(",")}\t${Object.values(fields).join(",")}`);
  return `public static class EasyedaFootprintSavedProtocol {
static void Need(bool value,string detail){if(!value)throw new System.InvalidOperationException("footprint-saved-protocol-"+detail);}
static string Load(string encoded,int length,string hash){Need(length>0&&length<=65536,"program-bound");byte[] packed=System.Convert.FromBase64String(encoded);Need(packed.Length<=65536,"packed-bound");byte[] bytes=new byte[length];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1,"program-length");}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==hash,"program-hash");return new System.Text.UTF8Encoding(false,true).GetString(bytes);}
static readonly string FootprintSourceFunctionJson=${source};
static readonly string QueueFunctionJson=${queue};
static string Field(System.Collections.IDictionary fields,string name){Need(fields!=null&&fields.Contains(name),"field");string value=fields[name] as string;Need(value!=null,"field-type");return value;}
static string Handle(string value,int maximum){Need(value!=null&&value.Length<=maximum&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]+\\z"),"handle");return value;}
static void Fields(System.Collections.IDictionary fields,string[] names){Need(fields!=null&&fields.Count==names.Length,"fields");foreach(string name in names)Need(fields.Contains(name),"field");}
${CURRENT_FOOTPRINT_COPY_SOURCE_NATIVE_GUARDS}
public static string EncodeSource(int id,string method,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&id<=${String(CURRENT_FOOTPRINT_COPY_SAVED_PROFILE.requestLimit)}&&method=="Runtime.callFunctionOn","source-command");Fields(fields,new string[]{"objectId","argument0","argument1","argument2","argument4","argument5","projectUuid","branchUuid","windowTabId","footprintUuid","client","maximumTicket"});string session=Handle(originalWorkerSession,128);string parameters=${currentFootprintCopySourceNativeParameters()};string command="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Runtime.callFunctionOn\\",\\"sessionId\\":\\""+session+"\\",\\"params\\":"+parameters+"}";Need(System.Text.Encoding.UTF8.GetByteCount(command)<=32768,"source-bytes");return command+"\\0";}
public static string EncodeQueue(int id,string method,string originalParentSession,System.Collections.IDictionary fields){Need(id>0&&id<=${String(CURRENT_FOOTPRINT_COPY_SAVED_PROFILE.requestLimit)}&&method=="Runtime.callFunctionOn","queue-command");Fields(fields,new string[]{"uniqueContextId","projectUuid","branchUuid"});string session=Handle(originalParentSession,128),context=Handle(Field(fields,"uniqueContextId"),128),project=FootprintAtom(fields,"projectUuid","[a-f0-9]{64}"),branch=FootprintAtom(fields,"branchUuid","[a-f0-9]{32}");
string command="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Runtime.callFunctionOn\\",\\"sessionId\\":\\""+session+"\\",\\"params\\":{\\"uniqueContextId\\":\\""+context+"\\",\\"functionDeclaration\\":"+QueueFunctionJson+",\\"arguments\\":[{\\"value\\":\\""+project+"\\"},{\\"value\\":\\""+branch+"\\"}],\\"returnByValue\\":true,\\"awaitPromise\\":true,\\"silent\\":true,\\"userGesture\\":false,\\"objectGroup\\":\\"easyeda-footprint-copy-saved-queue-v1\\",\\"generatePreview\\":false,\\"throwOnSideEffect\\":false}}";Need(System.Text.Encoding.UTF8.GetByteCount(command)<=16384,"queue-bytes");return command+"\\0";}
static void Reject(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-reject");}
public static void VerifySmoke(){string[] rows=${literal(fixtures.join("|"))}.Split('|'),hashes=${literal(hashes.join(","))}.Split(',');for(int i=0;i<2;i++){string[] parts=rows[i].Split('\\t'),names=parts[0].Split(','),values=parts[1].Split(',');var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);for(int n=0;n<names.Length;n++)fields.Add(names[n],values[n]);bool source=i==0;System.Func<int,string,string,string> encode=(id,method,session)=>source?EncodeSource(id,method,session,fields):EncodeQueue(id,method,session,fields);string sessionId=${literal(sessionId)};
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encode(1,"Runtime.callFunctionOn",sessionId)))).Replace("-","").ToLowerInvariant()==hashes[i],"smoke-parity");
Reject(()=>encode(0,"Runtime.callFunctionOn",sessionId));Reject(()=>encode(1,"Runtime.evaluate",sessionId));Reject(()=>encode(1,"Runtime.callFunctionOn",sessionId+"\\n"));fields.Add("sessionId","foreign");Reject(()=>encode(1,"Runtime.callFunctionOn",sessionId));fields.Remove("sessionId");foreach(string name in names){object original=fields[name];fields[name]=(string)original+"\\n";Reject(()=>encode(1,"Runtime.callFunctionOn",sessionId));fields[name]=original;}}}
}`;
}

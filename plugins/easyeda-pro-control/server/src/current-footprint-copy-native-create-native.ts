/** Fixed native writer encoder. Every existing helper birth purpose refuses
 * its use. Ownership, whole budgets and one-shot qualification remain required. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "./current-footprint-copy-create-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS as LIMITS, currentFootprintCopyNativeCreateWire } from "./current-footprint-copy-native-create-wire.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET as BUDGET } from "./current-footprint-copy-create-clock-budget.ts";

const marker = (name: string): string => `__copycreate_${name}__`;
// Windows PowerShell5 reads a BOM-less helper using the system codepage.
// Emit ASCII C# literals while preserving each original UTF-16 code unit.
const literal = (value: string): string => JSON.stringify(value).split("").map(character => {
  const unit = character.codePointAt(0);
  return unit !== undefined && unit > 0x7F ? `\\u${unit.toString(16).padStart(4, "0")}` : character;
}).join("");
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
  const sampleArgument = { uuid: "a".repeat(16), path: "b".repeat(64), isProject: true, docType: 4,
    title: 'Copy " Ω', display_title: 'Copy " Ω', description: "line\nslash\\", custom_tags: '["x"]', source: "", version: "" };
  const sampleCommand = { method: "Runtime.callFunctionOn", sessionId: "native-create-original-worker", params: {
    objectId: "project", functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: ["bus", "manager", "consistency", "constructors", "methods"].map(objectId => ({ objectId })),
    objectGroup: CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
  const sample = { ...sampleCommand, params: { ...sampleCommand.params,
    arguments: [...sampleCommand.params.arguments, { value: sampleArgument.path }, { value: JSON.stringify(sampleArgument) }] } };
  const wire = currentFootprintCopyNativeCreateWire(JSON.stringify(sample), 73);
  const sampleFields = Object.entries(wire.request).filter(([name]) => name !== "action" && name !== "requestId");
  const sampleHash = createHash("sha256").update(`${JSON.stringify({ id: 73, ...sample })}\0`).digest("hex");
  return `public static class EasyedaFootprintCopyNativeCreateProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-native-create-protocol");}
static readonly System.Text.UTF8Encoding Utf8=new System.Text.UTF8Encoding(false,true);
static string Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(template.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(template).digest("hex"))});return Utf8.GetString(bytes);}
static readonly string Template=Load();
static string Text(object input,int maximum){string value=input as string;Need(value!=null&&value.Length<=maximum);Utf8.GetByteCount(value);return value;}
static string Field(string name,object input){string value=Text(input,256);Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":name=="expectedProjectUuid"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
static string Quote(string value){var output=new System.Text.StringBuilder("\\"");foreach(char c in value){if(c=='\\"'||c=='\\\\'){output.Append('\\\\');output.Append(c);}else if(c<32){output.Append("\\\\u");output.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else output.Append(c);}return output.Append('\\"').ToString();}
public static string Encode(int id,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&fields.Count==8);string[] names={"objectId","arg0ObjectId","arg1ObjectId","arg2ObjectId","arg3ObjectId","arg4ObjectId","expectedProjectUuid","createArgumentJson"};foreach(string name in names)Need(fields.Contains(name));string session=Field("sessionId",originalWorkerSession),raw=Text(fields["createArgumentJson"],65536);Field("expectedProjectUuid",fields["expectedProjectUuid"]);Need(Utf8.GetByteCount(raw)<=${String(LIMITS.argumentsBytes)});var output=new System.Text.StringBuilder();int previous=0;
foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(Template,"\\"__copycreate_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(Template,previous,match.Index-previous);if(name=="createArgumentJson")output.Append(Quote(raw));else{output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');}previous=match.Index+match.Length;}output.Append(Template,previous,Template.Length-previous);string command="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(Utf8.GetByteCount(command)<=${String(LIMITS.commandBytes)});return command+"\\0";}
public static void VerifySmoke(){var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);${sampleFields.map(([name, value]) => `fields.Add(${literal(name)},${literal(String(value))});`).join("")}
string command=Encode(73,${literal(sample.sessionId)},fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(Utf8.GetBytes(command))).Replace("-","").ToLowerInvariant()==${literal(sampleHash)});
System.Action<System.Action> refuse=action=>{bool failed=false;try{action();}catch(System.InvalidOperationException){failed=true;}Need(failed);};refuse(()=>Encode(73,"worker\\n",fields));fields.Add("sessionId","forged");refuse(()=>Encode(73,${literal(sample.sessionId)},fields));fields.Remove("sessionId");fields["expectedProjectUuid"]="invalid";refuse(()=>Encode(73,${literal(sample.sessionId)},fields));}
}`;
}

/** Independent native accounting for one integrated create/clock sequence.
 * This class issues no process, original-handle, purpose or writer authority. */
export function currentFootprintCopyCreateClockNativeSource(): string {
  const maximumFirst = BUDGET.maximumNormalId - BUDGET.total + 1;
  return `public sealed class EasyedaFootprintCopyCreateClockLedger {
public const int ClockNormal=${String(BUDGET.clockNormal)},ClockCleanup=${String(BUDGET.clockCleanup)},ArmPrefix=${String(BUDGET.armPrefix)},Requests=${String(BUDGET.total)};
public readonly int First;public int Next{get;private set;}public int Normal{get;private set;}public int Cleanup{get;private set;}public int CreateId{get;private set;}public bool Failed{get;private set;}public bool Retired{get;private set;}
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-create-clock-ledger");}
void Guard(bool value){if(!value){Failed=true;Need(false);}}
public EasyedaFootprintCopyCreateClockLedger(int first){Need(first>=1&&(long)first+Requests-1<=${String(BUDGET.maximumNormalId)});First=first;Next=first;}
void Available(int id){Guard(!Failed&&!Retired&&id==Next&&id==First+Normal+Cleanup+(CreateId==0?0:1)&&id<First+Requests);}
public void Clock(int id,bool cleanup){Available(id);Guard(CreateId!=0||Normal<ArmPrefix&&!cleanup);Guard(cleanup?Cleanup<ClockCleanup:Normal<ClockNormal);Next++;if(cleanup)Cleanup++;else Normal++;}
public void Create(int id){Available(id);Guard(CreateId==0&&id==First+ArmPrefix&&Normal==ArmPrefix&&Cleanup==0);CreateId=id;Next++;}
public void Fail(){Failed=true;}
public bool Complete{get{return !Failed&&CreateId==First+ArmPrefix&&Normal==ClockNormal&&Cleanup==ClockCleanup&&Next==First+Requests;}}
public void Retire(bool originalGenerationEnded){Guard(!Retired);if(!Complete&&!originalGenerationEnded){Failed=true;Need(false);}Retired=true;}
public static void VerifySmoke(){System.Action<System.Action> refuse=action=>{bool failed=false;try{action();}catch(System.InvalidOperationException){failed=true;}Need(failed);};
foreach(int first in new int[]{0,${String(maximumFirst + 1)},int.MaxValue})refuse(()=>new EasyedaFootprintCopyCreateClockLedger(first));
var value=new EasyedaFootprintCopyCreateClockLedger(${String(maximumFirst)});for(int i=0;i<ArmPrefix;i++)value.Clock(value.Next,false);value.Create(value.Next);for(int i=ArmPrefix;i<ClockNormal;i++)value.Clock(value.Next,false);for(int i=0;i<ClockCleanup;i++)value.Clock(value.Next,true);Need(value.Complete&&value.Next==${String(BUDGET.maximumNormalId + 1)}&&value.CreateId==${String(maximumFirst + BUDGET.createOffset)});value.Retire(false);refuse(()=>value.Clock(value.Next,true));
var missing=new EasyedaFootprintCopyCreateClockLedger(1);for(int i=0;i<ArmPrefix;i++)missing.Clock(missing.Next,false);refuse(()=>missing.Clock(missing.Next,false));refuse(()=>missing.Create(missing.Next));missing.Retire(true);
var duplicate=new EasyedaFootprintCopyCreateClockLedger(1);for(int i=0;i<ArmPrefix;i++)duplicate.Clock(duplicate.Next,false);duplicate.Create(duplicate.Next);refuse(()=>duplicate.Create(duplicate.Next));duplicate.Retire(true);
var early=new EasyedaFootprintCopyCreateClockLedger(1);refuse(()=>early.Create(1));early.Retire(true);
var incomplete=new EasyedaFootprintCopyCreateClockLedger(1);refuse(()=>incomplete.Retire(false));incomplete.Retire(true);refuse(()=>incomplete.Retire(true));}
}`;
}

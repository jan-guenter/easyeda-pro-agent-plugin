/** Fixed native compiler for the separate head-age purpose. Only bounded
 * scalar values and original remote handles cross the flat pipe. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "./current-footprint-copy-main-transport-contract.ts";
import { validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM } from "./current-footprint-head-age-main.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM,
  CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_PREPARATION_REQUESTS } from "./current-footprint-head-age-context.ts";

const normalMainRequests = CONSTRUCTION.observeNormal + 15 + CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_PREPARATION_REQUESTS;
const cleanupMainRequests = CONSTRUCTION.observeCleanup + CONSTRUCTION.releaseCleanup;
// Each main request/poll has at most two original-owner reproof controls plus
// Its one exchange. The full original poll cap leaves proof capacity available
// While cleanup uses its separately reserved controls. Thirty-two fixed controls
// Cover allocation identity, launch, bracket, window and detach observations.
const normalControls = MAIN.totalPolls * 3 + (normalMainRequests + cleanupMainRequests) * 3 + 32;
const cleanupControls = (MAIN.totalPolls - MAIN.normalPolls) * 3 + cleanupMainRequests * 3 + 512;
export const CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS = Object.freeze({ normalMainRequests, cleanupMainRequests, mainRequests: normalMainRequests + cleanupMainRequests,
  windowsClockSamples: 2, bracketNativeRequests: 1, normalControls, cleanupControls, bracketPolls: 1024, bracketRawBytes: 65_536,
  // Reserve the entire still-possible original main byte stream, framed into
  // Base64, plus cleanup headers and one pending maximum helper line. This
  // Conservative reserve may refuse normal work; it grants no completion claim.
  helperCleanupReserveBytes: 4 * Math.ceil(MAIN.totalReceivedBytes / 3) + cleanupControls * 512 + 100_000,
  maximumReplyBytes: 131_072, executionAuthorized: false });
/** Encode only an already checked head-age call. This route cannot encode
 * arbitrary programs, ordinary main commands, sessions or inspector endpoints. */
export function currentFootprintHeadAgeNativeWire(input: unknown, id: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.mainRequests) { throw new Error("HEAD_AGE_NATIVE_ID"); }
  const command = validateCurrentFootprintCopyMainBackendCommand(input);
  const base = { action: "head-age-main", requestId: id, phase: command.phase };
  if (command.phase === "head-age-context-source") { return Object.freeze({ ...base, scriptId: command.params.scriptId }); }
  if (command.phase === "head-age-context-capture") {
    return Object.freeze({ ...base, objectId: command.params.objectId, argument0: command.params.arguments[0].objectId });
  }
  if (command.phase === "head-age-context-bind") {
    return Object.freeze({ ...base, objectId: command.params.objectId, argument0: command.params.arguments[0].objectId,
      argument1: command.params.arguments[1].objectId, argument2: command.params.arguments[2].objectId,
      argument3: command.params.arguments[3].objectId, nativeRootPid: command.params.arguments[4].value });
  }
  if (command.phase === "head-age-capture") {
    return Object.freeze({ ...base, objectId: command.params.objectId, argument0: command.params.arguments[0].objectId,
      argument1: command.params.arguments[1].objectId });
  }
  if (command.phase === "head-age-observe") {
    return Object.freeze({ ...base, objectId: command.params.objectId, createdAtLiteral: command.params.arguments[0].value,
      wallEpochMs: command.params.arguments[1].value });
  }
  throw new Error("HEAD_AGE_NATIVE_PURPOSE");
}
/** Escape fixed source data as a C# verbatim literal during generation only. */
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Generate immutable function rows and a native scalar-only encoder.
 * Hash and decoded bounds stay under the existing shared table limits. */
export function currentFootprintHeadAgeNativeSource(): string {
  const programs = [CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
    CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM];
  const bytes = Buffer.from(programs.join("\0"));
  // oxlint-disable-next-line node/no-sync -- The native compiler packs fixed in-memory programs deterministically.
  const packed = gzipSync(bytes, { level: 9 });
  return String.raw`public static class EasyedaFootprintHeadAgeProtocol {
public const int MainNormal=${String(normalMainRequests)},MainCleanup=${String(cleanupMainRequests)},MainRequests=${String(normalMainRequests + cleanupMainRequests)},NormalControls=${String(normalControls)},CleanupControls=${String(cleanupControls)};
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-head-age-protocol");}
static readonly string Group=${literal(CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP)};
static readonly string[][] Programs=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(programs.length)},1);
static string Quote(string value){var b=new System.Text.StringBuilder("\"");foreach(char c in value){if(c=='\\'||c=='"')b.Append('\\').Append(c);else if(c<' ')b.Append("\\u").Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));else b.Append(c);}return b.Append('"').ToString();}
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z"));return Quote(value);}
static long Number(object value){Need(value is int||value is long);return System.Convert.ToInt64(value,System.Globalization.CultureInfo.InvariantCulture);}
static string Integer(object value){long n=Number(value);Need(n>=0&&n<=253402214399999L);return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}
static string Pid(object value){long n=Number(value);Need(n>0&&n<=uint.MaxValue);return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}
static void Keys(System.Collections.IDictionary fields,params string[] names){Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}}
static string Argument(System.Collections.IDictionary fields,string name){return "{\"objectId\":"+Handle(fields[name])+"}";}
public static string Encode(int id,string phase,System.Collections.IDictionary fields){
  Need(id>0&&id<=MainRequests&&fields!=null);int row;string arguments;
  if(phase=="head-age-context-source"){
    Keys(fields,"scriptId");return "{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.getScriptSource\",\"params\":{\"scriptId\":"+Handle(fields["scriptId"])+"}}";
  }
  if(phase=="head-age-context-capture"){
    Keys(fields,"objectId","argument0");row=2;arguments="["+Argument(fields,"argument0")+"]";
  }else if(phase=="head-age-context-bind"){
    Keys(fields,"objectId","argument0","argument1","argument2","argument3","nativeRootPid");row=3;
    arguments="["+Argument(fields,"argument0")+","+Argument(fields,"argument1")+","+Argument(fields,"argument2")+","+Argument(fields,"argument3")+",{\"value\":"+Pid(fields["nativeRootPid"])+"}]";
  }else if(phase=="head-age-capture"){
    Keys(fields,"objectId","argument0","argument1");row=0;arguments="["+Argument(fields,"argument0")+","+Argument(fields,"argument1")+"]";
  }else{
    Need(phase=="head-age-observe");Keys(fields,"objectId","createdAtLiteral","wallEpochMs");row=1;
    string date=fields["createdAtLiteral"] as string;System.DateTime parsed;
    Need(date!=null&&date.Length==19&&System.DateTime.TryParseExact(date,"yyyy-MM-dd HH:mm:ss",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out parsed)&&parsed.Year>=1970);
    arguments="[{\"value\":"+Quote(date)+"},{\"value\":"+Integer(fields["wallEpochMs"])+"}]";
  }
  bool observe=phase=="head-age-observe";
  return "{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Runtime.callFunctionOn\",\"params\":{\"objectGroup\":"+Quote(Group)+",\"silent\":true,\"generatePreview\":false,\"throwOnSideEffect\":"+(observe?"false":"true")+",\"awaitPromise\":false,\"userGesture\":false,\"objectId\":"+Handle(fields["objectId"])+",\"functionDeclaration\":"+Quote(Programs[row][0])+",\"arguments\":"+arguments+",\"returnByValue\":"+(observe?"true":"false")+"}}";
}
public sealed class Phases {
  int step;bool failed;
  static readonly string[] Names={"head-age-context-capture","head-age-context-source","head-age-context-bind","head-age-capture","head-age-observe"};
  public bool Attempted {get{return step!=0||failed;}}
  public void Fail(){failed=true;}
  public string Compile(int id,string phase,System.Collections.IDictionary fields,uint originalRootPid){
    try{Admit(phase,fields,originalRootPid);return Encode(id,phase,fields);}catch{Fail();throw;}
  }
  public void Admit(string phase,System.Collections.IDictionary fields,uint originalRootPid){
    try{Need(!failed&&step<Names.Length&&phase==Names[step]&&originalRootPid>0&&fields!=null);
      if(phase=="head-age-context-bind")Need(fields.Contains("nativeRootPid")&&Number(fields["nativeRootPid"])==(long)originalRootPid);
      step++;
    }catch{failed=true;throw;}
  }
}
static void Refuse(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){
  var fields=new System.Collections.Hashtable();var phases=new Phases();
  foreach(string phase in new[]{"head-age-context-capture","head-age-context-source","head-age-context-bind","head-age-capture","head-age-observe"}){fields["nativeRootPid"]=1234;phases.Admit(phase,fields,1234);}
  Need(phases.Attempted);Refuse(()=>phases.Admit("head-age-observe",fields,1234));
  var wrong=new Phases();Refuse(()=>wrong.Admit("head-age-capture",fields,1234));Need(wrong.Attempted);Refuse(()=>wrong.Admit("head-age-context-capture",fields,1234));
  var changed=new Phases();changed.Admit("head-age-context-capture",fields,1234);changed.Admit("head-age-context-source",fields,1234);fields["nativeRootPid"]=1235;Refuse(()=>changed.Admit("head-age-context-bind",fields,1234));
  var encodingFailure=new Phases();Refuse(()=>encodingFailure.Compile(1,"head-age-context-capture",fields,1234));Need(encodingFailure.Attempted);Refuse(()=>encodingFailure.Admit("head-age-context-source",fields,1234));
  var transportFailure=new Phases();transportFailure.Admit("head-age-context-capture",fields,1234);transportFailure.Fail();Refuse(()=>transportFailure.Admit("head-age-context-source",fields,1234));
  fields.Clear();fields.Add("objectId","source-array");fields.Add("argument0","original-array");
  Need(Encode(1,"head-age-context-capture",fields).Contains("\"throwOnSideEffect\":true"));
  fields.Clear();fields.Add("scriptId","bootstrap-script");Need(Encode(2,"head-age-context-source",fields).Contains("\"method\":\"Debugger.getScriptSource\""));
  fields.Add("objectId","forbidden");Refuse(()=>Encode(2,"head-age-context-source",fields));
  fields.Clear();fields.Add("objectId","getter-inner");fields.Add("argument0","getter-outer");fields.Add("argument1","setter-inner");fields.Add("argument2","setter-outer");fields.Add("argument3","captured-context");fields.Add("nativeRootPid",1234);
  Need(Encode(3,"head-age-context-bind",fields).Contains("{\"value\":1234}"));
  foreach(object invalid in new object[]{"1234",0,-1,4294967296L}){fields["nativeRootPid"]=invalid;Refuse(()=>Encode(3,"head-age-context-bind",fields));}
  fields.Clear();fields.Add("objectId","source-array");fields.Add("argument0","original-array");fields.Add("argument1","bound-context");
  Need(Encode(4,"head-age-capture",fields).Contains("\"returnByValue\":false"));
  fields.Remove("argument1");Refuse(()=>Encode(4,"head-age-capture",fields));
  fields.Clear();fields.Add("objectId","head-array");fields.Add("createdAtLiteral","2026-01-15 12:34:56");fields.Add("wallEpochMs",1700000000000L);
  Need(Encode(MainRequests,"head-age-observe",fields).Contains("\"throwOnSideEffect\":false"));
  Refuse(()=>Encode(0,"head-age-observe",fields));Refuse(()=>Encode(MainRequests+1,"head-age-observe",fields));Refuse(()=>Encode(1,"unknown",fields));
  fields["createdAtLiteral"]="2026-01-15 12:34:56\n";Refuse(()=>Encode(1,"head-age-observe",fields));
}
}`;
}

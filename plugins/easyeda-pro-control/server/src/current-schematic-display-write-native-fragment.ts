import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { applyCurrentSchematicDisplayAccessorNativeFragment } from "./current-schematic-display-accessor-native-fragment.ts";
import { applyCurrentSchematicDisplayClockNativeFragment } from "./current-schematic-display-clock-native-fragment.ts";
/** New schematic birth after shared fixed SQL data and prior fragments. This
 * fragment never upgrades an ordinary runtime or enables a PCB purpose. */
import { applyCurrentSchematicDisplayWorkerNativeFragment } from "./current-schematic-display-worker-native-fragment.ts";
import { createHash } from "node:crypto";
import { currentSchematicDisplayNativeCommand } from "./current-schematic-display-native-command.ts";
import { CURRENT_SCHEMATIC_DISPLAY_NATIVE_GROUP as GROUP, CURRENT_SCHEMATIC_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_DISPLAY_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_DISPLAY_START_FUNCTION as START } from "./current-schematic-display-write-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-display-write-native-profile.ts";

const begin = "// BEGIN GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", end = "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_DISPLAY_NATIVE_ANCHOR:${before.slice(0, 64)}`); } return source.replace(before, after);
}
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function smoke(): string {
  const target = { rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic_1111111111111111.eprj2`, projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) };
  const operation = { operationId: "sch209-display-native-smoke", textId: "text-1", beforeBody: {}, afterBody: {}, peers: Array.from({ length: 5 }, (_, i) => ({ id: `peer${String(i)}`, type: "LINE", body: {} })) };
  const rows = ["start", "navigate", "capture", "preflight", "modify", "observe", "save"].map(phase => {
    if (phase !== "start" && phase !== "navigate" && phase !== "capture" && phase !== "preflight" && phase !== "modify" && phase !== "observe" && phase !== "save") { throw new Error("SCHEMATIC_DISPLAY_NATIVE_SMOKE_PHASE"); }
    const command = currentSchematicDisplayNativeCommand(phase, "original_binding", target, operation), fields: Record<string, string> = {};
    if ("uniqueContextId" in command.params) { fields["uniqueContextId"] = command.params.uniqueContextId; } else { fields["objectId"] = command.params.objectId; }
    if (phase !== "start" && command.schematicDisplayPhase !== "start") { fields["targetJson"] = command.params.arguments[0].value;
      if (phase !== "navigate" && command.schematicDisplayPhase !== "navigate") { fields["operationJson"] = command.params.arguments[2].value; } }
    const message = `${JSON.stringify({ id: 63, method: command.method, params: command.params, sessionId: "original_session" })}\0`;
    return `{var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);${Object.entries(fields).map(([name, value]) => `fields.Add(${quote(name)},${quote(value)});`).join("")}string encoded=SchematicDisplayProtocolMessage(63,"original_session",${quote(phase)},fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()!=${quote(createHash("sha256").update(message).digest("hex"))})throw Error("schematic-display-wire-smoke");fields.Add("callerCode","void 0");bool refused=false;try{SchematicDisplayProtocolMessage(63,"original_session",${quote(phase)},fields);}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-display-wire-fields-smoke");}`;
  });
  return `static void VerifySchematicDisplayProtocolSmoke(){${rows.join("")}}`;
}
function native(): string { return `${begin}
internal enum EasyedaSchematicDisplayBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaSchematicDisplayBirth birth):this(){Need(birth==EasyedaSchematicDisplayBirth.Original,"schematic-display-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool schematicDisplayWrite209,schematicDisplayAbort,schematicDisplayRegistrationRemoved,schematicDisplayConstructionComplete;int schematicDisplayControls;string schematicDisplaySession,schematicDisplayContext,schematicDisplayTarget,schematicDisplayOperation,schematicDisplayTuple;bool[] schematicDisplayStages=new bool[7];
static readonly string SchematicDisplayStart=@"${START.replaceAll('"', '""')}";
static readonly string SchematicDisplayNavigation=@"${NAVIGATION.replaceAll('"', '""')}";
static readonly string SchematicDisplayStage=@"${STAGE.replaceAll('"', '""')}";
EasyedaDiagnosticOwner(EasyedaSchematicDisplayBirth birth):this(){if(birth!=EasyedaSchematicDisplayBirth.Original)throw Error("schematic-display-birth");schematicDisplayWrite209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaSchematicDisplayBirth.Original);}
public static EasyedaDiagnosticOwner CreateSchematicDisplayWrite209(){return new EasyedaDiagnosticOwner(EasyedaSchematicDisplayBirth.Original);}
public void AdmitSchematicDisplayAction(string action){if(!schematicDisplayWrite209||++schematicDisplayControls>30000)throw Error("schematic-display-purpose");if(schematicDisplayAbort&&action!="identity"&&action!="termination"&&action!="release")throw Error("schematic-display-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "termination":case "normal-close":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "schematic-display-abort":case "schematic-display-native":break;default:throw Error("schematic-display-action");}}
void SchematicDisplayDiscovery(string method,string session){bool allowed=false;foreach(string candidate in new[]{${METHODS.map(method => `"${method}"`).join(",")}})if(method==candidate)allowed=true;if(!allowed)throw Error("schematic-display-discovery-only");if(session!=null){if(!System.Text.RegularExpressions.Regex.IsMatch(session,@"\\A[A-Za-z0-9_.:-]{1,128}\\z"))throw Error("schematic-display-session");if(schematicDisplaySession==null)schematicDisplaySession=session;else if(schematicDisplaySession!=session)throw Error("schematic-display-session");}}
void SendSchematicDisplayMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("schematic-display-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(text,false);AssertLive();return;}if(schematicDisplayConstructionComplete)throw Error("schematic-display-main-construction-consumed");string encoded=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")schematicDisplayRegistrationRemoved=true;if(phase=="resume"&&schematicDisplayRegistrationRemoved)schematicDisplayConstructionComplete=true;originalMain.SendFixed(encoded,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
static int SchematicDisplayIndex(string phase){return Array.IndexOf(new[]{"start","navigate","capture","preflight","modify","observe","save"},phase);}
static string SchematicDisplayData(System.Collections.IDictionary fields,string name,int maximum){string value=fields[name] as string;if(value==null||value.Length==0||value.Length>maximum||value.IndexOf((char)0)>=0)throw Error("schematic-display-data");return value;}
public static string SchematicDisplayProtocolMessage(int id,string session,string phase,System.Collections.IDictionary fields){int index=SchematicDisplayIndex(phase);if(id<1||id>${String(PROFILE.renderer.total)}||index<0||fields==null||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\\A[A-Za-z0-9_.:-]{1,128}\\z"))throw Error("schematic-display-message");string selector=index<=2?"uniqueContextId":"objectId";string[] names=index==0?new[]{selector}:index==1?new[]{selector,"targetJson"}:new[]{selector,"targetJson","operationJson"};if(fields.Count!=names.Length)throw Error("schematic-display-fields");foreach(string name in names)if(!fields.Contains(name))throw Error("schematic-display-fields");string handle=SchematicDisplayData(fields,selector,256);if(!System.Text.RegularExpressions.Regex.IsMatch(handle,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-display-handle");string args="[]";if(index>0){string target=SchematicDisplayData(fields,"targetJson",16384);args="[{\\"value\\":"+JsonString(target)+"}";if(index>1)args+=",{\\"value\\":"+JsonString(phase)+"},{\\"value\\":"+JsonString(SchematicDisplayData(fields,"operationJson",16384))+"}";args+="]";}string program=index==0?SchematicDisplayStart:index==1?SchematicDisplayNavigation:SchematicDisplayStage;string message="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Runtime.callFunctionOn\\",\\"params\\":{\\"throwOnSideEffect\\":false,\\"silent\\":true,\\"awaitPromise\\":true,\\"generatePreview\\":false,\\"userGesture\\":false,\\"objectGroup\\":\\"${GROUP}\\",\\"functionDeclaration\\":"+JsonString(program)+","+JsonString(selector)+":"+JsonString(handle)+",\\"arguments\\":"+args+",\\"returnByValue\\":"+(index==2?"false":"true")+"},\\"sessionId\\":"+JsonString(session)+"}\\0";if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("schematic-display-bound");return message;}
public void SendSchematicDisplayNative(int id,string session,string phase,System.Collections.IDictionary fields){if(!schematicDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||schematicDisplaySession!=session)throw Error("schematic-display-native-owner");int index=SchematicDisplayIndex(phase);if(index<0||schematicDisplayStages[index]||index>0&&!schematicDisplayStages[index-1]||phase=="modify"||phase=="save")throw Error("schematic-display-source-and-save-required");string message=SchematicDisplayProtocolMessage(id,session,phase,fields);if(index==0)schematicDisplayContext=fields["uniqueContextId"] as string;else{if(index<=2&&fields["uniqueContextId"] as string!=schematicDisplayContext)throw Error("schematic-display-context");if(index==1){schematicDisplayTarget=fields["targetJson"] as string;if(schematicWorkerProjectUuid!=null&&(schematicDisplayTarget.IndexOf("\\"projectUuid\\":\\""+schematicWorkerProjectUuid+"\\"",StringComparison.Ordinal)<0||schematicDisplayTarget.IndexOf("\\"pageUuid\\":\\""+schematicWorkerPageUuid+"\\"",StringComparison.Ordinal)<0))throw Error("schematic-display-worker-target");}else{if(fields["targetJson"] as string!=schematicDisplayTarget)throw Error("schematic-display-target");if(index==2)schematicDisplayOperation=fields["operationJson"] as string;else{if(fields["operationJson"] as string!=schematicDisplayOperation)throw Error("schematic-display-operation");if(schematicDisplayTuple==null)schematicDisplayTuple=fields["objectId"] as string;else if(fields["objectId"] as string!=schematicDisplayTuple)throw Error("schematic-display-holder");}}}schematicDisplayStages[index]=true;SendMessage(id,message);}
public void AbortSchematicDisplayWrite(){if(!schematicDisplayWrite209||schematicDisplayAbort||originalMain==null)throw Error("schematic-display-abort-once");schematicDisplayAbort=true;originalMain.RequestOriginalJobTermination();}
${smoke()}
public static void VerifySchematicDisplaySmoke(){VerifySchematicDisplayProtocolSmoke();var fresh=CreateSchematicDisplayWrite209();if(!fresh.schematicDisplayWrite209||fresh.pcbViaWrite209||fresh.layers209||fresh.spatial209||fresh.generatedFixture209||fresh.originalMain==null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero)throw Error("schematic-display-separate-birth-smoke");foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{old.AdmitSchematicDisplayAction("identity");}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-display-old-purpose-smoke");if(old.originalMain!=null)old.originalMain.Release();}foreach(string action in new[]{"pcb-via-sdk","pcb-via-clock","pcb-via-worker","structure-worker-send","footprint-copy-native-create","main-request-send","main-completion-send"}){bool refused=false;try{fresh.AdmitSchematicDisplayAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-display-foreign-refusal-smoke");}fresh.originalMain.Release();}
}
${end}`; }
const dispatch = String.raw`        'schematic-display-native' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-display-native-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','sessionId','phase');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-display-native-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicDisplayNative([int]$request.requestId,$request.sessionId,$request.phase,$fields);$result=@{written=$true}
        }
        'schematic-display-abort' {
          if (-not $SchematicDisplayWrite209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-schematic-display-abort-fields'}
          $owner.AbortSchematicDisplayWrite();$result=@{terminationDispatched=$true}
        }
`;
export function applyCurrentSchematicDisplayWriteNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaSelectedFileMainSqlFenceProtocol")) { throw new Error("SCHEMATIC_DISPLAY_SHARED_READONLY_SQL_DATA_REQUIRED"); }
  const current = input.replace(/if\(schematicDisplayWrite209\)return (?:16|63|129|242|313|548|617|747|763|765|775|960|964|992|1002);/u, `if(schematicDisplayWrite209)return ${String(PROFILE.renderer.total)};`).replace(/if \(\$SchematicDisplayWrite209\) \{\$requestLimit=(?:16|63|129|242|313|548|617|747|763|765|775|960|964|992|1002)\}/u, `if ($SchematicDisplayWrite209) {$requestLimit=${String(PROFILE.renderer.total)}}`);
  let source = one(current, "[switch]$PcbViaWrite209,[switch]$StringPrecreate,", "[switch]$SchematicDisplayWrite209,[switch]$PcbViaWrite209,[switch]$StringPrecreate,");
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicDisplayWrite209");
  const conflict = `if ($SchematicDisplayWrite209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-schematic-display-purpose'}\n`;
  source = one(source, "$footprintMainPurpose=$ProjectStructure209 -or $PcbViaWrite209 -or ", "$footprintMainPurpose=$ProjectStructure209 -or $PcbViaWrite209 -or $SchematicDisplayWrite209 -or ");
  const priorConflict = source.split("\n").filter(line => line.startsWith("if ($SchematicDisplayWrite209 -and ("));
  if (priorConflict.length > 1) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_CONFLICT_DUPLICATE"); }
  source = priorConflict[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${priorConflict[0]}\n`, conflict);
  source = one(source, "elseif ($PcbViaWrite209)", "elseif ($SchematicDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicDisplayWrite209()} elseif ($PcbViaWrite209)");
  source = one(source, "int RequestLimit { get {", `int RequestLimit { get { if(schematicDisplayWrite209)return ${String(PROFILE.renderer.total)};`);
  source = one(source, "if(pcbViaWrite209)throw Error(\"via-retain-main-until-exit\");", "if(pcbViaWrite209)throw Error(\"via-retain-main-until-exit\");\n    if(schematicDisplayWrite209)throw Error(\"schematic-display-retain-main-until-exit\");");
  source = one(source, "if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}", "if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}\n    if(schematicDisplayWrite209){SendSchematicDisplayMain(id,phase,method,fields);return;}");
  source = one(source, "if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}", "if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}\n    if(schematicDisplayWrite209){SchematicDisplayDiscovery(method,OptionalText(sessionId));}");
  source = one(source, "          if (-not $launched -or ($request.requestId -isnot [int]", `          if ($SchematicDisplayWrite209) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if (-not $launched -or ($request.requestId -isnot [int]`);
  source = one(source, "      if ($PcbViaWrite209) {$owner.AdmitPcbViaAction($request.action)}", "      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}\n      if ($PcbViaWrite209) {$owner.AdmitPcbViaAction($request.action)}");
  const oldAbort = dispatch.slice(dispatch.indexOf("        'schematic-display-abort' {"));
  if (!source.includes(dispatch) && source.includes(oldAbort)) { if (source.split(oldAbort).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_OLD_DISPATCH"); } source = source.replace(oldAbort, ""); }
  // The Via step fragment also anchors at main-observe. Keep this block before
  // That step so their separate generators cannot insert each other repeatedly.
  const ownDispatch = "        'schematic-display-native' {";
  if (source.includes(ownDispatch)) {
    if (source.split(ownDispatch).length !== 2 || source.split(dispatch).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_DISPATCH_CHANGED"); }
    source = source.replace(dispatch, "");
  }
  const dispatchAnchor = ["        'pcb-via-main-step' {", "        'pcb-via-main-observe' {", "        'pcb-via-clock-bind' {"].find(anchor => source.includes(anchor));
  if (dispatchAnchor === undefined) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_DISPATCH_ANCHOR"); }
  source = one(source, dispatchAnchor, `${dispatch}${dispatchAnchor}`);
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); } return applyCurrentSchematicDisplayAccessorNativeFragment(applyCurrentSchematicDisplayClockNativeFragment(applyCurrentSchematicDisplayWorkerNativeFragment(source)));
}

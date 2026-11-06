import { prepareCurrentPcbComponentSpatialNativeSwitch } from "./current-pcb-component-spatial-native-fragment.ts";
/** Distinct saved-checkpoint birth. No writer, initial-fixture or cache grant. */
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE as PROFILE } from "./current-pcb-via-saved-readback-profile.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN SAVED VIA READBACK209", end = "// END SAVED VIA READBACK209";
function native(): string {
  return `${begin}\n${String.raw`
internal enum EasyedaSavedViaReadbackBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaSavedViaReadbackBirth birth):this(){Need(birth==EasyedaSavedViaReadbackBirth.Original,"saved-readback-birth");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
int savedViaReadbackDiscoveryCount;bool savedViaReadback209,savedViaReadbackAbort,savedViaReadbackConstructionComplete,savedViaReadbackRegistrationRemoved;string savedViaReadbackSession;
EasyedaDiagnosticOwner(EasyedaSavedViaReadbackBirth birth):this(){if(birth!=EasyedaSavedViaReadbackBirth.Original)throw Error("saved-readback-birth");savedViaReadback209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(birth);}
public static EasyedaDiagnosticOwner CreatePcbViaSavedReadback209(){return new EasyedaDiagnosticOwner(EasyedaSavedViaReadbackBirth.Original);}
public void AdmitSavedViaReadbackAction(string action){if(!savedViaReadback209)throw Error("saved-readback-purpose");if(savedViaReadbackAbort&&action!="identity"&&action!="termination"&&action!="release")throw Error("saved-readback-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "normal-close":case "termination":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "saved-readback-abort":case "saved-readback-preflight":case "saved-readback-cache":return;default:throw Error("saved-readback-action");}}
void SavedViaReadbackDiscovery(string method,string session){if(!savedViaReadback209||savedViaReadbackAbort||!savedViaReadbackConstructionComplete)throw Error("saved-readback-original-main-required");bool known=false;foreach(string name in new[]{"Browser.getVersion","Target.getTargets","Target.attachToTarget","Page.enable","Page.getFrameTree","Runtime.enable","Debugger.enable","Debugger.getScriptSource","DOM.getFrameOwner","DOM.describeNode"})if(name==method)known=true;if(!known)throw Error("saved-readback-discovery-only");if(savedViaReadbackDiscoveryCount>=24)throw Error("saved-readback-discovery-budget");savedViaReadbackDiscoveryCount++;if(session!=null){if(savedViaReadbackSession==null)savedViaReadbackSession=session;else if(savedViaReadbackSession!=session)throw Error("saved-readback-original-session");}}
void SendSavedViaReadbackMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!savedViaReadback209||savedViaReadbackAbort||id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("saved-readback-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string fixedText=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(fixedText,false);AssertLive();return;}if(savedViaReadbackConstructionComplete)throw Error("saved-readback-main-construction-consumed");string text=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")savedViaReadbackRegistrationRemoved=true;if(phase=="resume"&&savedViaReadbackRegistrationRemoved)savedViaReadbackConstructionComplete=true;originalMain.SendFixed(text,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
void NormalCloseSavedViaReadback(string hwnd){if(!savedViaReadback209||savedViaReadbackAbort||closeAttempted)throw Error("saved-readback-close-consumed");closeAttempted=true;long number;if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number)||number<=0||Window()!=hwnd)throw Error("window-mismatch");AssertCleanupLive();Native(PostMessage(new IntPtr(number),16,IntPtr.Zero,IntPtr.Zero));}
public void AbortSavedViaReadback(){if(!savedViaReadback209||savedViaReadbackAbort||originalMain==null)throw Error("saved-readback-abort-owner");savedViaReadbackAbort=true;originalMain.RequestOriginalJobTermination();}
// Original Node ledger substitutes its correlated reply selectors. This
// finite native grammar never receives a JSON command or arbitrary method.
static string SavedViaReadbackText(System.Collections.IDictionary fields,string name,int maximum){if(!fields.Contains(name)||!(fields[name] is string))throw Error("saved-readback-cache-fields");string value=(string)fields[name];if(value.Length<1||value.Length>maximum||value.IndexOf('\0')>=0)throw Error("saved-readback-cache-text");return value;}
static void SavedViaReadbackFields(System.Collections.IDictionary fields,string[] names){if(fields==null||fields.Count!=names.Length)throw Error("saved-readback-cache-fields");foreach(string name in names)if(!fields.Contains(name))throw Error("saved-readback-cache-fields");}
public static string SavedViaReadbackCacheProtocolMessage(int id,string session,string phase,System.Collections.IDictionary fields){
if(id<1||id>61||session==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("saved-readback-cache-id");
string method,parameters;
if(phase=="saved-cache-key"){SavedViaReadbackFields(fields,new[]{"savedCacheStep","frameId"});if(SavedViaReadbackText(fields,"savedCacheStep",32)!="initial")throw Error("saved-readback-cache-key-step");string frame=SavedViaReadbackText(fields,"frameId",128);if(!System.Text.RegularExpressions.Regex.IsMatch(frame,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("saved-readback-cache-frame");method="Storage.getStorageKeyForFrame";parameters="\"frameId\":"+JsonString(frame);}
else if(phase=="saved-cache-names"){SavedViaReadbackFields(fields,new[]{"savedCacheStep","storageKey"});string step=SavedViaReadbackText(fields,"savedCacheStep",32);if(step!="before"&&step!="after-backup")throw Error("saved-readback-cache-name-step");method="CacheStorage.requestCacheNames";parameters="\"storageKey\":"+JsonString(SavedViaReadbackText(fields,"storageKey",8192));}
else if(phase=="saved-cache-track"||phase=="saved-cache-untrack"){SavedViaReadbackFields(fields,new[]{"storageKey"});method=phase=="saved-cache-track"?"Storage.trackCacheStorageForStorageKey":"Storage.untrackCacheStorageForStorageKey";parameters="\"storageKey\":"+JsonString(SavedViaReadbackText(fields,"storageKey",8192));}
else if(phase=="saved-cache-entries"||phase=="saved-cache-body"){bool body=phase=="saved-cache-body";SavedViaReadbackFields(fields,body?new[]{"savedCacheRound","namespaceOrdinal","entryIndex","cacheId","requestURL"}:new[]{"savedCacheRound","namespaceOrdinal","cacheId","skipCount","pageSize"});string round=SavedViaReadbackText(fields,"savedCacheRound",16);if(round!="backup"&&round!="verify")throw Error("saved-readback-cache-round");int ordinal=SavedViaReadbackInteger(fields,"namespaceOrdinal",1);string cache=SavedViaReadbackText(fields,"cacheId",8192);if(body){SavedViaReadbackInteger(fields,"entryIndex",7);method="CacheStorage.requestCachedResponse";parameters="\"cacheId\":"+JsonString(cache)+",\"requestURL\":"+JsonString(SavedViaReadbackText(fields,"requestURL",8192))+",\"requestHeaders\":[]";}else{if(SavedViaReadbackInteger(fields,"skipCount",0)!=0||SavedViaReadbackInteger(fields,"pageSize",9)!=9)throw Error("saved-readback-cache-page");method="CacheStorage.requestEntries";parameters="\"cacheId\":"+JsonString(cache)+",\"skipCount\":0,\"pageSize\":9";}}
else throw Error("saved-readback-cache-no-delete-grant");
string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+"},\"sessionId\":"+JsonString(session)+"}\0";if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("saved-readback-cache-bound");return message;
}
static int SavedViaReadbackInteger(System.Collections.IDictionary fields,string name,int maximum){if(!fields.Contains(name)||!(fields[name] is int)&&!(fields[name] is long))throw Error("saved-readback-cache-integer");long value=Convert.ToInt64(fields[name],CultureInfo.InvariantCulture);if(value<0||value>maximum)throw Error("saved-readback-cache-integer");return (int)value;}
readonly HashSet<string> savedViaCacheConsumed=new HashSet<string>(StringComparer.Ordinal);readonly string[] savedViaCacheIds=new string[2];readonly int[] savedViaCacheBodies=new int[2];string savedViaStorageKey;bool savedViaCacheTracked,savedViaCacheUntracked,savedViaPreflight;
public void SendSavedViaReadbackPreflight(int id,string session,string context,string path,string project,string branch,string document,string source){if(!savedViaReadback209||savedViaReadbackAbort||!savedViaReadbackConstructionComplete||savedViaPreflight||session!=savedViaReadbackSession)throw Error("saved-readback-preflight-owner");savedViaPreflight=true;string message=OpeningProtocolMessageCore(false,id,session,context,"preflight",path,project,branch,document,source,false);SendMessage(id,message);}
public void SendSavedViaReadbackCache(int id,string session,string phase,System.Collections.IDictionary fields){
if(!savedViaReadback209||savedViaReadbackAbort||!savedViaPreflight||!savedViaReadbackConstructionComplete||savedViaReadbackSession!=session||savedViaCacheUntracked)throw Error("saved-readback-cache-owner");
string message=SavedViaReadbackCacheProtocolMessage(id,session,phase,fields),slot=phase;
if(fields.Contains("savedCacheStep"))slot+="/"+(string)fields["savedCacheStep"];
if(fields.Contains("savedCacheRound"))slot+="/"+(string)fields["savedCacheRound"]+"/"+SavedViaReadbackInteger(fields,"namespaceOrdinal",1).ToString(CultureInfo.InvariantCulture);
if(fields.Contains("entryIndex"))slot+="/"+SavedViaReadbackInteger(fields,"entryIndex",7).ToString(CultureInfo.InvariantCulture);
if(savedViaCacheConsumed.Contains(slot))throw Error("saved-readback-cache-consumed");
if(phase=="saved-cache-key"){if(savedViaCacheConsumed.Count!=0)throw Error("saved-readback-cache-order");}
else if(phase=="saved-cache-names"||phase=="saved-cache-track"||phase=="saved-cache-untrack"){if(!savedViaCacheConsumed.Contains("saved-cache-key/initial"))throw Error("saved-readback-cache-order");string key=SavedViaReadbackText(fields,"storageKey",8192);if(savedViaStorageKey==null)savedViaStorageKey=key;else if(savedViaStorageKey!=key)throw Error("saved-readback-cache-key-drift");if(phase=="saved-cache-names"){string step=(string)fields["savedCacheStep"];if(!savedViaCacheTracked)throw Error("saved-readback-cache-order");}else if(phase=="saved-cache-track"){if(savedViaCacheConsumed.Contains("saved-cache-names/before"))throw Error("saved-readback-cache-order");savedViaCacheTracked=true;}else{if(!savedViaCacheTracked)throw Error("saved-readback-cache-order");savedViaCacheUntracked=true;}}
else{if(!savedViaCacheTracked||savedViaCacheConsumed.Contains("saved-cache-names/after-backup"))throw Error("saved-readback-cache-order");int ordinal=SavedViaReadbackInteger(fields,"namespaceOrdinal",1);string cache=SavedViaReadbackText(fields,"cacheId",8192);if(savedViaCacheIds[ordinal]==null){if(phase!="saved-cache-entries"||(string)fields["savedCacheRound"]!="backup")throw Error("saved-readback-cache-order");savedViaCacheIds[ordinal]=cache;}else if(savedViaCacheIds[ordinal]!=cache)throw Error("saved-readback-cache-id-drift");}
if(phase=="saved-cache-body"){int round=(string)fields["savedCacheRound"]=="backup"?0:1;if(savedViaCacheBodies[round]>=8)throw Error("saved-readback-cache-combined-bodies");savedViaCacheBodies[round]++;}savedViaCacheConsumed.Add(slot);SendMessage(id,message);
}

public static void VerifySavedViaReadbackSmoke(){var fresh=CreatePcbViaSavedReadback209();if(!fresh.savedViaReadback209||fresh.pcbViaWrite209||fresh.schematicDisplayWrite209||fresh.layers209||fresh.spatial209||fresh.generatedFixture209||fresh.workerStartup||fresh.originalMain==null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero||fresh.RequestLimit!=${String(PROFILE.renderer.activeReadOnly)})throw Error("saved-readback-distinct-birth-smoke");bool refused=false;try{fresh.SavedViaReadbackDiscovery("Target.getTargets",null);}catch{refused=true;}if(!refused)throw Error("saved-readback-before-main-smoke");fresh.savedViaReadbackConstructionComplete=true;fresh.SavedViaReadbackDiscovery("Target.getTargets",null);fresh.SavedViaReadbackDiscovery("Page.getFrameTree","original");foreach(string method in new[]{"Runtime.callFunctionOn","Runtime.evaluate","CacheStorage.deleteCache","Target.setAutoAttach"}){refused=false;try{fresh.SavedViaReadbackDiscovery(method,"original");}catch{refused=true;}if(!refused)throw Error("saved-readback-no-grants-smoke");}foreach(string action in new[]{"pcb-via-sdk","pcb-via-worker","schematic-display-native","spatial209","component-spatial419","main-request-send"}){refused=false;try{fresh.AdmitSavedViaReadbackAction(action);}catch{refused=true;}if(!refused)throw Error("saved-readback-foreign-action-smoke");}var keyFields=new System.Collections.Hashtable();keyFields["savedCacheStep"]="initial";keyFields["frameId"]="frame";string key=SavedViaReadbackCacheProtocolMessage(1,"session","saved-cache-key",keyFields);if(key.IndexOf("Storage.getStorageKeyForFrame",StringComparison.Ordinal)<0)throw Error("saved-readback-key-codec-smoke");var entryFields=new System.Collections.Hashtable();entryFields["savedCacheRound"]="backup";entryFields["namespaceOrdinal"]=0;entryFields["cacheId"]="cache";entryFields["skipCount"]=0;entryFields["pageSize"]=9;string entry=SavedViaReadbackCacheProtocolMessage(61,"session","saved-cache-entries",entryFields);if(entry.IndexOf("\"skipCount\":0,\"pageSize\":9",StringComparison.Ordinal)<0||entry.IndexOf("pathFilter",StringComparison.Ordinal)>=0)throw Error("saved-readback-entry-codec-smoke");foreach(string phase in new[]{"saved-cache-delete","arbitrary"}){refused=false;try{SavedViaReadbackCacheProtocolMessage(1,"session",phase,keyFields);}catch{refused=true;}if(!refused)throw Error("saved-readback-delete-closed-smoke");}fresh.originalMain.Release();}
}
`}\n${end}`;
}
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SAVED_READBACK_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SAVED_READBACK_NATIVE_ANCHOR:${before.slice(0, 96)}`); } return source.replace(before, after);
}
export function prepareCurrentPcbViaSavedReadbackNativeSwitch(source: string): string {
  return one(prepareCurrentPcbComponentSpatialNativeSwitch(source), "[switch]$ComponentSpatial209,", "[switch]$ComponentSpatial209,[switch]$PcbViaSavedReadback209,");
}
const dispatch = String.raw`        'saved-readback-preflight' {
          if (-not $PcbViaSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,openingPhase,requestId,rootCreated,rootPid,sessionId,targetBranchUuid,targetDocumentUuid,targetExpectedSourceSha256,targetProjectUuid,targetRawWindowsPath,uniqueContextId' -or $request.method -cne 'Runtime.callFunctionOn' -or $request.openingPhase -cne 'preflight') {throw 'pcb-diagnostic-saved-readback-preflight-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated','sessionId','uniqueContextId','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','targetProjectUuid','targetRawWindowsPath')) {if ($request.$field -isnot [string]) {throw 'pcb-diagnostic-saved-readback-preflight-type'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'pcb-diagnostic-saved-readback-preflight-binding'}
          $owner.SendSavedViaReadbackPreflight([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
        'saved-readback-cache' {
          if (-not $PcbViaSavedReadback209) {throw 'pcb-diagnostic-saved-readback-cache-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','sessionId','savedCachePhase')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-saved-readback-cache-fields'}}
          foreach ($field in @('helperInstance','jobId','rootCreated','sessionId','savedCachePhase')) {if ($request.$field -isnot [string]) {throw 'pcb-diagnostic-saved-readback-cache-types'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'pcb-diagnostic-saved-readback-cache-binding'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendSavedViaReadbackCache([int]$request.requestId,$request.sessionId,$request.savedCachePhase,$fields);$result=@{written=$true}
        }
        'saved-readback-abort' {
          if (-not $PcbViaSavedReadback209 -or $request.confirmAbortOriginalSavedReadbackJob -isnot [bool] -or $request.confirmAbortOriginalSavedReadbackJob -ne $true -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,confirmAbortOriginalSavedReadbackJob,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-saved-readback-abort-fields'}
          if ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'pcb-diagnostic-saved-readback-abort-binding'}
          $owner.AbortSavedViaReadback();$result=@{terminationDispatched=$true}
        }
`;
export function applyCurrentPcbViaSavedReadbackNativeFragment(input: string): string {
  let source = prepareCurrentPcbViaSavedReadbackNativeSwitch(input);
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "PcbViaSavedReadback209");
  const conflict = `if ($PcbViaSavedReadback209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-saved-readback-purpose'}\n`;
  const old = source.split("\n").filter(line => line.startsWith("if ($PcbViaSavedReadback209 -and ("));
  if (old.length > 1) { throw new Error("SAVED_READBACK_NATIVE_CONFLICT"); }
  source = old[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${old[0]}\n`, conflict);
  const mainLine = source.split("\n").find(line => line.startsWith("$footprintMainPurpose="));
  if (mainLine === undefined) { throw new Error("SAVED_READBACK_NATIVE_MAIN_ANCHOR"); }
  if (!mainLine.endsWith(" -or $PcbViaSavedReadback209")) { source = source.replace(`${mainLine}\n`, `${mainLine} -or $PcbViaSavedReadback209\n`); }
  source = one(source, "elseif ($SchematicDisplayWrite209)", "elseif ($PcbViaSavedReadback209) {[EasyedaDiagnosticOwner]::CreatePcbViaSavedReadback209()} elseif ($SchematicDisplayWrite209)");
  const oldCeilings = source.match(/if\(savedViaReadback209\)return \d+; return pcbViaWrite209\?/gu) ?? [];
  if (oldCeilings.length > 1) { throw new Error("SAVED_READBACK_NATIVE_LIMIT_DUPLICATE"); }
  if (oldCeilings[0] !== undefined) { source = source.replace(oldCeilings[0], "return pcbViaWrite209?"); }
  source = one(source, "return pcbViaWrite209?", `if(savedViaReadback209)return ${String(PROFILE.renderer.activeReadOnly)}; return pcbViaWrite209?`);
  source = one(source, 'if(schematicDisplayWrite209)throw Error("schematic-display-retain-main-until-exit");', 'if(schematicDisplayWrite209)throw Error("schematic-display-retain-main-until-exit");\n    if(savedViaReadback209)throw Error("saved-readback-retain-main-until-exit");');
  source = one(source, "if(schematicDisplayWrite209){SendSchematicDisplayMain(id,phase,method,fields);return;}", "if(schematicDisplayWrite209){SendSchematicDisplayMain(id,phase,method,fields);return;}\n    if(savedViaReadback209){SendSavedViaReadbackMain(id,phase,method,fields);return;}");
  source = one(source, "if(schematicDisplayWrite209){SchematicDisplayDiscovery(method,OptionalText(sessionId));}", "if(schematicDisplayWrite209){SchematicDisplayDiscovery(method,OptionalText(sessionId));}\n    if(savedViaReadback209)SavedViaReadbackDiscovery(method,OptionalText(sessionId));");
  source = one(source, "    if(spatial209)SpatialDiscovery(method,sessionId);", "    if(savedViaReadback209)SavedViaReadbackDiscovery(method,sessionId);\n    if(spatial209)SpatialDiscovery(method,sessionId);");
  for (const prefix of ["false", "true"]) {
    const line = `    string encoded=OpeningProtocolMessageCore(${prefix},`;
    source = one(source, line, `    if(savedViaReadback209)throw Error("saved-readback-opening-unqualified");\n${line}`);
  }
  source = one(source, "  public void NormalClose(string hwnd) {", "  public void NormalClose(string hwnd) {\n    if(savedViaReadback209){NormalCloseSavedViaReadback(hwnd);return;}");
  source = one(source, "      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}", "      if ($PcbViaSavedReadback209) {$owner.AdmitSavedViaReadbackAction($request.action)}\n      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}");
  const oldSavedLimits = source.split("\n").filter(line => line.startsWith("          if ($PcbViaSavedReadback209) {$requestLimit="));
  if (oldSavedLimits.length > 1) { throw new Error("SAVED_READBACK_NATIVE_LIMIT_DUPLICATE"); }
  if (oldSavedLimits[0] !== undefined) { source = source.replace(`${oldSavedLimits[0]}\n`, ""); }
  const limitLine = source.split("\n").find(line => line.startsWith("          if ($SchematicDisplayWrite209) {$requestLimit="));
  if (limitLine === undefined) { throw new Error("SAVED_READBACK_NATIVE_LIMIT_ANCHOR"); }
  source = one(source, limitLine, `          if ($PcbViaSavedReadback209) {$requestLimit=${String(PROFILE.renderer.activeReadOnly)}}\n${limitLine}`);
  source = installOwnedNativeDispatch(source, dispatch, "        'component-abort' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySavedViaReadbackSmoke()", "    [EasyedaDiagnosticOwner]::VerifyComponentSpatialSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end), value = native();
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SAVED_READBACK_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "\n'@\n", `\n${value}\n'@\n`); }
  return source;
}

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
bool savedViaReadback209,savedViaReadbackAbort,savedViaReadbackConstructionComplete,savedViaReadbackRegistrationRemoved;string savedViaReadbackSession;
EasyedaDiagnosticOwner(EasyedaSavedViaReadbackBirth birth):this(){if(birth!=EasyedaSavedViaReadbackBirth.Original)throw Error("saved-readback-birth");savedViaReadback209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(birth);}
public static EasyedaDiagnosticOwner CreatePcbViaSavedReadback209(){return new EasyedaDiagnosticOwner(EasyedaSavedViaReadbackBirth.Original);}
public void AdmitSavedViaReadbackAction(string action){if(!savedViaReadback209)throw Error("saved-readback-purpose");if(savedViaReadbackAbort&&action!="identity"&&action!="termination"&&action!="release")throw Error("saved-readback-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "normal-close":case "termination":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "saved-readback-abort":return;default:throw Error("saved-readback-action");}}
void SavedViaReadbackDiscovery(string method,string session){if(!savedViaReadback209||savedViaReadbackAbort||!savedViaReadbackConstructionComplete)throw Error("saved-readback-original-main-required");bool known=false;foreach(string name in new[]{"Browser.getVersion","Target.getTargets","Target.attachToTarget","Page.enable","Page.getFrameTree","Runtime.enable","Debugger.enable","Debugger.getScriptSource","DOM.getFrameOwner","DOM.describeNode"})if(name==method)known=true;if(!known)throw Error("saved-readback-discovery-only");if(session!=null){if(savedViaReadbackSession==null)savedViaReadbackSession=session;else if(savedViaReadbackSession!=session)throw Error("saved-readback-original-session");}}
void SendSavedViaReadbackMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!savedViaReadback209||savedViaReadbackAbort||id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("saved-readback-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string fixedText=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(fixedText,false);AssertLive();return;}if(savedViaReadbackConstructionComplete)throw Error("saved-readback-main-construction-consumed");string text=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")savedViaReadbackRegistrationRemoved=true;if(phase=="resume"&&savedViaReadbackRegistrationRemoved)savedViaReadbackConstructionComplete=true;originalMain.SendFixed(text,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
void NormalCloseSavedViaReadback(string hwnd){if(!savedViaReadback209||savedViaReadbackAbort||closeAttempted)throw Error("saved-readback-close-consumed");closeAttempted=true;long number;if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number)||number<=0||Window()!=hwnd)throw Error("window-mismatch");AssertCleanupLive();Native(PostMessage(new IntPtr(number),16,IntPtr.Zero,IntPtr.Zero));}
public void AbortSavedViaReadback(){if(!savedViaReadback209||savedViaReadbackAbort||originalMain==null)throw Error("saved-readback-abort-owner");savedViaReadbackAbort=true;originalMain.RequestOriginalJobTermination();}
public static void VerifySavedViaReadbackSmoke(){var fresh=CreatePcbViaSavedReadback209();if(!fresh.savedViaReadback209||fresh.pcbViaWrite209||fresh.schematicDisplayWrite209||fresh.layers209||fresh.spatial209||fresh.generatedFixture209||fresh.workerStartup||fresh.originalMain==null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero||fresh.RequestLimit!=${String(PROFILE.renderer.enabledDiscovery)})throw Error("saved-readback-distinct-birth-smoke");bool refused=false;try{fresh.SavedViaReadbackDiscovery("Target.getTargets",null);}catch{refused=true;}if(!refused)throw Error("saved-readback-before-main-smoke");fresh.savedViaReadbackConstructionComplete=true;fresh.SavedViaReadbackDiscovery("Target.getTargets",null);fresh.SavedViaReadbackDiscovery("Page.getFrameTree","original");foreach(string method in new[]{"Runtime.callFunctionOn","Runtime.evaluate","CacheStorage.deleteCache","Target.setAutoAttach"}){refused=false;try{fresh.SavedViaReadbackDiscovery(method,"original");}catch{refused=true;}if(!refused)throw Error("saved-readback-no-grants-smoke");}foreach(string action in new[]{"pcb-via-sdk","pcb-via-worker","schematic-display-native","spatial209","component-spatial419","main-request-send"}){refused=false;try{fresh.AdmitSavedViaReadbackAction(action);}catch{refused=true;}if(!refused)throw Error("saved-readback-foreign-action-smoke");}fresh.originalMain.Release();}
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
const dispatch = String.raw`        'saved-readback-abort' {
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
  source = one(source, "return pcbViaWrite209?", `if(savedViaReadback209)return ${String(PROFILE.renderer.enabledDiscovery)}; return pcbViaWrite209?`);
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
  const limitLine = source.split("\n").find(line => line.startsWith("          if ($SchematicDisplayWrite209) {$requestLimit="));
  if (limitLine === undefined) { throw new Error("SAVED_READBACK_NATIVE_LIMIT_ANCHOR"); }
  source = one(source, limitLine, `          if ($PcbViaSavedReadback209) {$requestLimit=${String(PROFILE.renderer.enabledDiscovery)}}\n${limitLine}`);
  source = installOwnedNativeDispatch(source, dispatch, "        'component-abort' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySavedViaReadbackSmoke()", "    [EasyedaDiagnosticOwner]::VerifyComponentSpatialSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end), value = native();
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SAVED_READBACK_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "\n'@\n", `\n${value}\n'@\n`); }
  return source;
}

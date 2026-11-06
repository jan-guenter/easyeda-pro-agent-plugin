/** New original inverse birth. Existing purposes/ceilings/codebooks remain
 * unchanged; this initial native stage grants no delete or clock invocation. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { CURRENT_FOOTPRINT_INVERSE_DISCOVERY_METHODS as METHODS, CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "./current-footprint-inverse-native-profile.ts";

const BEGIN = "// BEGIN GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH", END = "// END GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("FOOTPRINT_INVERSE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`FOOTPRINT_INVERSE_NATIVE_ANCHOR:${before.slice(0, 80)}`); } return source.replace(before, after);
}
function native(): string { return `${BEGIN}
internal enum EasyedaFootprintInverseBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaFootprintInverseBirth birth):this(){Need(birth==EasyedaFootprintInverseBirth.Original,"footprint-inverse-main-birth");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool footprintInverse209,footprintInverseAborted,footprintInverseRegistrationRemoved,footprintInverseConstructionComplete;int footprintInverseControls;
EasyedaDiagnosticOwner(EasyedaFootprintInverseBirth birth):this(){if(birth!=EasyedaFootprintInverseBirth.Original)throw Error("footprint-inverse-birth");footprintInverse209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaFootprintInverseBirth.Original);}
public static EasyedaDiagnosticOwner CreateFootprintInverse209(){return new EasyedaDiagnosticOwner(EasyedaFootprintInverseBirth.Original);}
public void AdmitFootprintInverseAction(string action){if(!footprintInverse209||++footprintInverseControls>${String(PROFILE.controls)})throw Error("footprint-inverse-purpose");if(footprintInverseAborted&&action!="identity"&&action!="termination"&&action!="release")throw Error("footprint-inverse-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "termination":case "normal-close":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "footprint-inverse-abort":break;default:throw Error("footprint-inverse-provider-unmounted");}}
void FootprintInverseDiscovery(string method,string session){bool allowed=false;foreach(string candidate in new[]{${METHODS.map(method => `"${method}"`).join(",")}})if(method==candidate)allowed=true;if(!allowed)throw Error("footprint-inverse-discovery-only");if(session!=null&&!System.Text.RegularExpressions.Regex.IsMatch(session,@"\\A[A-Za-z0-9_.:-]{1,128}\\z"))throw Error("footprint-inverse-session");}
void SendFootprintInverseMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!footprintInverse209||footprintInverseAborted||id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("footprint-inverse-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(text,false);AssertLive();return;}if(footprintInverseConstructionComplete)throw Error("footprint-inverse-main-construction-consumed");string encoded=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")footprintInverseRegistrationRemoved=true;if(phase=="resume"&&footprintInverseRegistrationRemoved)footprintInverseConstructionComplete=true;originalMain.SendFixed(encoded,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
public void AbortFootprintInverse(){if(!footprintInverse209||footprintInverseAborted||job==IntPtr.Zero||root==IntPtr.Zero||released)throw Error("footprint-inverse-original-abort");AssertLive();footprintInverseAborted=true;if(!TerminateJobObject(job,1))throw Error("footprint-inverse-abort");}
public static void VerifyFootprintInverseSmoke(){var value=CreateFootprintInverse209();if(!value.footprintInverse209||!value.workerStartupFootprintMain209||value.pcbViaWrite209||value.schematicDisplayWrite209||value.workerStartupFootprintCombined209||value.workerStartupFootprintCopy209||value.workerStartupFootprintForward209||value.layers209||value.visual209||value.spatial209||value.originalMain==null||!value.originalMain.NeverAttached||value.RequestLimit!=${String(PROFILE.renderer.total)})throw Error("footprint-inverse-purpose-smoke");foreach(string method in new[]{${METHODS.map(method => `"${method}"`).join(",")}})value.FootprintInverseDiscovery(method,null);foreach(string method in new[]{"Runtime.evaluate","Runtime.callFunctionOn","Debugger.resume"}){bool refused=false;try{value.FootprintInverseDiscovery(method,null);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("footprint-inverse-discovery-refusal");}foreach(string action in new[]{"footprint-delete-trigger-send","footprint-delete-clock-send","pcb-via-native","schematic-display-native","footprint-copy-native-create"}){bool refused=false;try{value.AdmitFootprintInverseAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("footprint-inverse-writer-refusal");}bool denied=false;try{value.AbortFootprintInverse();}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-no-job-abort");value.originalMain.Release();}
}
${END}`; }
const dispatch = `        'footprint-inverse-abort' {
          if (-not $FootprintInverse209 -or -not $launched) {throw 'footprint-inverse-abort-purpose'}
          $owner.AbortFootprintInverse(); $result=@{terminationDispatched=$true}
        }
`;
const readyBegin = "  # BEGIN ORIGINAL FOOTPRINT INVERSE READY", readyEnd = "  # END ORIGINAL FOOTPRINT INVERSE READY";
function ready(): string { return `${readyBegin}
  if ($FootprintInverse209 -and -not $CompileOnly) {
    if ($InverseReadyChallenge -cnotmatch '\\A[a-f0-9]{32}\\z') {throw 'footprint-inverse-ready-challenge'}
    $inverseReadyState=$owner.NoProcessCreationState()
    if ($inverseReadyState -cne 'not-entered' -or $owner.RootPid -ne 0 -or $owner.RootCreated -cne '0') {throw 'footprint-inverse-ready-state'}
    @{schema='easyeda-pro-control.footprint-combined-ready.v1';challenge=$InverseReadyChallenge;helperInstance=$owner.HelperInstance;jobId=$owner.JobId;creationState=$inverseReadyState;processCreated=$false;emptyJob=$true;pipesChecked=$true} | ConvertTo-Json -Compress
  }
${readyEnd}`; }
export function prepareCurrentFootprintInverseNativeSwitch(input: string): string {
  return one(input, "[switch]$WorkerStartup,", "[switch]$FootprintInverse209,[string]$InverseReadyChallenge,[switch]$WorkerStartup,");
}
export function applyCurrentFootprintInverseNativeFragment(input: string): string {
  let source = prepareCurrentFootprintInverseNativeSwitch(input);
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "FootprintInverse209");
  const conflict = `if ($FootprintInverse209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-footprint-inverse-purpose'}`;
  const priorConflict = source.split("\n").filter(line => line.startsWith("if ($FootprintInverse209 -and ("));
  if (priorConflict.length > 1) { throw new Error("FOOTPRINT_INVERSE_NATIVE_CONFLICT_DUPLICATE"); }
  source = priorConflict[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}\n`) : source.replace(priorConflict[0], conflict);
  source = one(source, " -or $PcbViaSavedReadback209\n", " -or $FootprintInverse209 -or $PcbViaSavedReadback209\n");
  source = one(source, "elseif ($Visual209)", "elseif ($FootprintInverse209) {[EasyedaDiagnosticOwner]::CreateFootprintInverse209()} elseif ($Visual209)");
  source = one(source, "if(savedViaReadback209)return", `if(footprintInverse209)return ${String(PROFILE.renderer.total)}; if(savedViaReadback209)return`);
  source = one(source, "if(savedViaReadback209)throw Error(\"saved-readback-retain-main-until-exit\");", "if(savedViaReadback209)throw Error(\"saved-readback-retain-main-until-exit\");\n    if(footprintInverse209)throw Error(\"footprint-inverse-retain-main-until-exit\");");
  source = one(source, "if(savedViaReadback209){SendSavedViaReadbackMain(id,phase,method,fields);return;}", "if(savedViaReadback209){SendSavedViaReadbackMain(id,phase,method,fields);return;}\n    if(footprintInverse209){SendFootprintInverseMain(id,phase,method,fields);return;}");
  source = one(source, "if(savedViaReadback209)SavedViaReadbackDiscovery(method,OptionalText(sessionId));", "if(savedViaReadback209)SavedViaReadbackDiscovery(method,OptionalText(sessionId));\n    if(footprintInverse209){FootprintInverseDiscovery(method,OptionalText(sessionId));}");
  const savedLimit = source.split("\n").find(line => line.startsWith("          if ($PcbViaSavedReadback209) {$requestLimit="));
  if (savedLimit === undefined) { throw new Error("FOOTPRINT_INVERSE_NATIVE_LIMIT_ANCHOR"); }
  const ownLimit = `          if ($FootprintInverse209) {$requestLimit=${String(PROFILE.renderer.total)}}`;
  if (!source.includes(ownLimit)) { source = one(source, savedLimit, `${ownLimit}\n${savedLimit}`); }
  else if (source.split(ownLimit).length !== 2) { throw new Error("FOOTPRINT_INVERSE_NATIVE_LIMIT_DUPLICATE"); }
  source = one(source, "      if ($PcbViaSavedReadback209) {$owner.AdmitSavedViaReadbackAction($request.action)}", "      if ($FootprintInverse209) {$owner.AdmitFootprintInverseAction($request.action)}\n      if ($PcbViaSavedReadback209) {$owner.AdmitSavedViaReadbackAction($request.action)}");
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-observe' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyFootprintInverseSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()");
  const start = source.indexOf(BEGIN), stop = source.indexOf(END);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(BEGIN, start + BEGIN.length) || source.includes(END, stop + END.length)) { throw new Error("FOOTPRINT_INVERSE_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + END.length); }
  else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); }
  const readyStart = source.indexOf(readyBegin), readyStop = source.indexOf(readyEnd);
  if (readyStart !== -1 || readyStop !== -1) { if (readyStart === -1 || readyStop < readyStart || source.includes(readyBegin, readyStart + readyBegin.length) || source.includes(readyEnd, readyStop + readyEnd.length)) { throw new Error("FOOTPRINT_INVERSE_READY_MARKERS"); } source = source.slice(0, readyStart) + ready() + source.slice(readyStop + readyEnd.length); }
  else { source = one(source, "  $owner.Initialize()\n", `  $owner.Initialize()\n${ready()}\n`); }
  return source;
}

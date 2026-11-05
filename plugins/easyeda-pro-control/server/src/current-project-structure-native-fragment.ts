/** Deterministic generator fragment for a distinct read-only observer purpose.
 * It runs only while building the exact-pinned helper, never on tool input. */
import { currentProjectStructureMainNativeSource } from "./current-project-structure-main-native.ts";
import { currentProjectStructureNativeLimits } from "./current-project-structure-native-profile.ts";
import { currentProjectStructureWorkerNativeSource } from "./current-project-structure-worker-native.ts";

const begin = "// BEGIN GENERATED PROJECT STRUCTURE OBSERVER PROTOCOL";
const end = "// END GENERATED PROJECT STRUCTURE OBSERVER PROTOCOL";
/** Replace exactly one reviewed source span or retain the one existing output.
 * Drift, duplicate anchors and partly applied fragments refuse before writing. */
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PROJECT_STRUCTURE_NATIVE_FRAGMENT_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("PROJECT_STRUCTURE_NATIVE_FRAGMENT_ANCHOR"); }
  return source.replace(before, after);
}
/** Native methods use only original root/Job/connection and renderer stream.
 * Old factory objects cannot acquire the birth flag or higher main capacity. */
function native(): string {
  return `${begin}
${currentProjectStructureNativeLimits()}
${currentProjectStructureMainNativeSource()}
${currentProjectStructureWorkerNativeSource()}
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(System.Diagnostics.Stopwatch originalElapsed,int structure):this(true,originalElapsed){Need(structure==209,"structure-purpose");normalLimit=EasyedaProjectStructureLimits.MainNormal;cleanupLimit=EasyedaProjectStructureLimits.MainCleanup;}
}
public sealed partial class EasyedaDiagnosticOwner {
bool projectStructure209;int structureNormalControls,structureCleanupControls;string structureWorkerSession;
EasyedaDiagnosticOwner(int structure,string observer):this(209,true){if(structure!=209||observer!="structure-observer")throw Error("structure-birth");originalMain.Release();originalMain=new EasyedaOriginalMainTransport(footprintElapsed,209);projectStructure209=true;workerStartupFootprintCopy209=false;}
public static EasyedaDiagnosticOwner CreateProjectStructure209(){return new EasyedaDiagnosticOwner(209,"structure-observer");}
public void AdmitProjectStructureAction(string action,string method,bool cleanup){if(!projectStructure209)throw Error("structure-purpose");switch(action){case "identity":case "launch":case "version":case "targets":case "send":case "poll":case "window":case "normal-close":case "termination":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "worker-startup-send":case "worker-startup-parent":case "worker-startup-reprove":case "structure-worker-send":case "structure-main-send":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "main-close-detach":break;default:throw Error("structure-action");}if(method=="Debugger.removeBreakpoint"||method=="Debugger.resume"||method=="Runtime.releaseObjectGroup")cleanup=true;if(cleanup){if(structureCleanupControls>=EasyedaProjectStructureLimits.CleanupControls)throw Error("structure-cleanup-controls");structureCleanupControls++;}else{if(structureNormalControls>=EasyedaProjectStructureLimits.NormalControls)throw Error("structure-normal-controls");structureNormalControls++;}}
public void SendProjectStructureMain(int id,string phase,string method,System.Collections.IDictionary fields){if(!projectStructure209)throw Error("structure-purpose");MainPurpose();AssertLive();if(id!=mainRequest+1||id>EasyedaProjectStructureLimits.MainRequests)throw Error("structure-main-id");mainRequest=id;string message=EasyedaProjectStructureMainProtocol.Encode(id,phase,method,fields);bool cleanup=phase=="structure-main-remove"||phase=="structure-main-resume"||phase=="structure-main-release";originalMain.SendFixed(message,cleanup);AssertLive();}
public void SendProjectStructureWorker(int id,string phase,string method,System.Collections.IDictionary fields){if(!projectStructure209||structureWorkerSession==null||fields==null||fields["sessionId"] as string!=structureWorkerSession)throw Error("structure-worker-owner");CheckFootprintWork(id,false);string message=EasyedaProjectStructureWorkerProtocol.Encode(id,phase,method,fields);SendMessage(id,message);}
public static void VerifyProjectStructureSmoke(){var owner=CreateProjectStructure209();if(!owner.projectStructure209||owner.workerStartupFootprintCopy209||owner.footprintCreateClockPurpose||owner.mainRequest!=0||owner.nextRequest!=1||owner.FootprintRequestLimit!=EasyedaProjectStructureLimits.WorkerRequests||owner.originalMain==null||owner.root!=IntPtr.Zero||owner.job!=IntPtr.Zero)throw Error("structure-birth-smoke");foreach(string action in new[]{"footprint-copy-native-create","footprint-copy-clock","footprint-clock-rpc-send","main-request-send","main-completion-begin","main-completion-send","saved-cache-held"}){bool refused=false;try{owner.AdmitProjectStructureAction(action,null,false);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("structure-write-refusal-smoke");}foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateWorkerStartup209(),CreateWorkerStartupFootprintCombined209()}){bool refused=false;try{old.AdmitProjectStructureAction("identity",null,false);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("structure-old-purpose-smoke");if(old.originalMain!=null)old.originalMain.Release();}EasyedaProjectStructureMainProtocol.VerifySmoke();EasyedaProjectStructureWorkerProtocol.VerifySmoke();owner.originalMain.Release();}
}
${end}`;
}
const dispatch = String.raw`        {$_ -ceq 'structure-main-send' -or $_ -ceq 'structure-worker-send'} {
          if (-not $ProjectStructure209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1) {throw 'pcb-diagnostic-structure-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-structure-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('sessionId','scriptId','callFrameId','objectId','breakpointId','argument0','argument1','argument2','argument3','argument4','argument5','argument6','projectUuid','branchUuid','ticket','structureText') -cnotcontains $property.Name) {throw 'pcb-diagnostic-structure-field'}
            if ($property.Name -ceq 'ticket') {if ($property.Value -isnot [int] -and $property.Value -isnot [long]) {throw 'pcb-diagnostic-structure-ticket'}}
            elseif ($property.Value -isnot [string]) {throw 'pcb-diagnostic-structure-field'}
            $fields.Add($property.Name,$property.Value)
          }}
          if ($request.action -ceq 'structure-main-send') {$owner.SendProjectStructureMain([int]$request.requestId,$request.phase,$request.method,$fields)}
          else {$owner.SendProjectStructureWorker([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;

/** Apply after ordinary generated blocks have been refreshed. The root build
 * owns helper regeneration and pinning; this function writes no files itself. */
export function applyCurrentProjectStructureNativeFragment(input: string): string {
  let source = input;
  source = one(source, "[string]$CombinedReadyChallenge)", "[switch]$ProjectStructure209,[string]$CombinedReadyChallenge)");
  source = one(source, "$footprintMainPurpose=", "$footprintMainPurpose=$ProjectStructure209 -or ");
  const allSwitches = [...input.slice(0, input.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "ProjectStructure209");
  const conflict = `if ($ProjectStructure209 -and (${allSwitches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-structure-purpose'}\n`;
  if (!source.includes("pcb-diagnostic-conflicting-structure-purpose")) { source = one(source, "$footprintMainPurpose=", `${conflict}$footprintMainPurpose=`); }
  source = one(source, "public sealed class EasyedaDiagnosticOwner {\n  [StructLayout", "public sealed partial class EasyedaDiagnosticOwner {\n  [StructLayout");
  source = one(source, "internal sealed class EasyedaOriginalMainTransport {\n[System.Runtime.InteropServices.StructLayout", "internal sealed partial class EasyedaOriginalMainTransport {\n[System.Runtime.InteropServices.StructLayout");
  for (const [name, value] of [["FootprintRequestLimit", "WorkerRequests"], ["FootprintNormalRequestLimit", "WorkerNormal"]] as const) {
    source = one(source, `long ${name} { get { return `, `long ${name} { get { return projectStructure209?EasyedaProjectStructureLimits.${value}:`);
  }
  source = one(source, "footprintHeadAge209?EasyedaFootprintHeadAgeProtocol.MainRequests:", "projectStructure209?EasyedaProjectStructureLimits.MainRequests:footprintHeadAge209?EasyedaFootprintHeadAgeProtocol.MainRequests:");
  source = one(source, "  public void SendWorkerStartup(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {",
    "  public void SendWorkerStartup(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {\n    if(projectStructure209&&phase==\"runtime\"){if(structureWorkerSession!=null||startupActorContext==null||sessionId==startupActorContext.Split('\\n')[0])throw Error(\"structure-worker-runtime\");structureWorkerSession=sessionId;}");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) {
    if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PROJECT_STRUCTURE_NATIVE_FRAGMENT_MARKERS"); }
    source = source.slice(0, start) + native() + source.slice(stop + end.length);
  } else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); }
  source = one(source, "$owner=if (", "$owner=if ($ProjectStructure209) {[EasyedaDiagnosticOwner]::CreateProjectStructure209()} elseif (");
  source = one(source, "$startupRequestLimit=if (", "$startupRequestLimit=if ($ProjectStructure209) {[EasyedaProjectStructureLimits]::WorkerRequests} elseif (");
  source = one(source, "if (($WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209) -and -not $CompileOnly)",
    "if (($ProjectStructure209 -or $WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209) -and -not $CompileOnly)");
  source = one(source, "    [EasyedaFootprintCopyMainRequestProtocol]::VerifySmoke()", "    [EasyedaDiagnosticOwner]::VerifyProjectStructureSmoke()\n    [EasyedaFootprintCopyMainRequestProtocol]::VerifySmoke()");
  source = one(source, "      $largeMainRequest=$WorkerStartupFootprintCombined209 -and ", "      $largeMainRequest=$ProjectStructure209 -and @('structure-main-send','structure-worker-send') -ccontains $request.action -or $WorkerStartupFootprintCombined209 -and ");
  source = one(source, "      if ($Visual209) {$owner.AdmitVisualAction($request.action)}", `      if ($ProjectStructure209) {
        $structureCleanup=@('identity','window','normal-close','termination','release','release-unlaunched','no-process-proof','release-no-process','main-close-detach') -ccontains $request.action
        if ($request.action -ceq 'main-poll' -and $request.cleanup -eq $true) {$structureCleanup=$true}
        $owner.AdmitProjectStructureAction($request.action,$request.method,$structureCleanup)
      }
      if ($Visual209) {$owner.AdmitVisualAction($request.action)}`);
  source = one(source, "        'main-attach' {", `${dispatch}        'main-attach' {`);
  return source;
}

/** Original Via-only worker binding/observation. This adds no Save or SQL grant
 * and never upgrades a released worker-startup purpose. */
import { currentProjectSaveStructureNativeGuard } from "./current-project-save-structure-native-guard.ts";
import { currentPcbViaWorkerNativeSource } from "./current-pcb-via-worker-native.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS as SAVE } from "./current-pcb-via-save-protocol.ts";

const begin = "// BEGIN GENERATED VIA ORIGINAL WORKER OBSERVER";
const end = "// END GENERATED VIA ORIGINAL WORKER OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_WORKER_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`PCB_VIA_WORKER_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
function native(): string {
  return `${begin}
${currentPcbViaWorkerNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string viaWorkerSession,viaWorkerTarget,viaWorkerProjectScript;bool viaWorkerParentArmed,viaWorkerParentRunning;int viaWorkerSetup,viaWorkerStage,viaWorkerNormal,viaWorkerCleanup,viaSaveNormal,viaSaveCleanup;bool viaWorkerSourceRead,viaWorkerInstrumentRemoved;
readonly System.Collections.Generic.HashSet<string> viaSavePoints=new System.Collections.Generic.HashSet<string>();
static readonly string[] ViaWorkerRoles=new[]{${ROLES.map(role => `"${role}"`).join(",")}};
public void BindPcbViaWorker(string session,string target,string project,string window){
if(!pcbViaWrite209||!viaWorkerParentArmed||viaWorkerSession!=null||viaWorkerParentRunning||generatedFixtureTuple==null||session==viaSession||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\\A[A-Za-z0-9_.:-]{1,128}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(target??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(window??"",@"\\A[A-Za-z0-9_-]{1,128}\\z")||project!=generatedFixtureTuple.Split('\\n')[3])throw Error("via-worker-original-binding");viaWorkerSession=session;viaWorkerTarget=target;
}
public void SendPcbViaWorkerParent(int id,string session,string phase){
if(!pcbViaWrite209||viaAbortAttempted||session!=viaSession||generatedFixtureTuple==null)throw Error("via-worker-parent-purpose");bool wait;
if(phase=="arm"){if(viaWorkerParentArmed)throw Error("via-worker-parent-once");viaWorkerParentArmed=true;wait=true;}
else if(phase=="running"){if(!viaWorkerParentArmed||viaWorkerParentRunning||viaWorkerSession==null||viaWorkerStage!=6||!viaWorkerSourceRead||viaSavePoints.Count!=6||viaStructurePoints.Count!=0&&viaStructurePoints.Count!=12)throw Error("via-worker-parent-original-source");viaWorkerParentRunning=true;wait=false;}else throw Error("via-worker-parent-phase");
string message="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Target.setAutoAttach\\",\\"params\\":{\\"autoAttach\\":true,\\"waitForDebuggerOnStart\\":"+(wait?"true":"false")+",\\"flatten\\":true,\\"filter\\":[{\\"type\\":\\"worker\\",\\"exclude\\":false},{\\"exclude\\":true}]},\\"sessionId\\":"+JsonString(session)+"}\\0";SendMessage(id,message);
}
void AdmitViaWorkerBootstrap(string phase,System.Collections.IDictionary fields){
string[] setup={"via-worker-runtime","via-worker-debugger","via-worker-async","via-worker-instrument","via-worker-run-waiting"};
if(viaWorkerSetup<setup.Length){if(phase!=setup[viaWorkerSetup])throw Error("via-worker-bootstrap-setup");viaWorkerSetup++;return;}
if(phase=="via-worker-remove"){if(viaWorkerInstrumentRemoved||viaWorkerStage!=6||!viaWorkerSourceRead||viaSavePoints.Count!=6||viaStructurePoints.Count!=0&&viaStructurePoints.Count!=12)throw Error("via-worker-instrument-original");viaWorkerInstrumentRemoved=true;return;}
if(viaWorkerStage>=ViaWorkerRoles.Length)throw Error("via-worker-bootstrap-consumed");string role=ViaWorkerRoles[viaWorkerStage];
if(phase=="via-worker-source-"+role){if(viaWorkerSourceRead)throw Error("via-worker-source-once");viaWorkerSourceRead=true;if(role=="project")viaWorkerProjectScript=fields["scriptId"] as string;}
else if(phase=="via-worker-resume-"+role){if(!viaWorkerSourceRead||role=="project"&&(!viaWorkerInstrumentRemoved||!viaWorkerParentRunning||viaSavePoints.Count!=6||viaStructurePoints.Count!=0&&viaStructurePoints.Count!=12))throw Error("via-worker-source-before-resume");viaWorkerStage++;viaWorkerSourceRead=false;}else throw Error("via-worker-bootstrap-phase");
}
void AdmitViaSaveObserver(string phase,System.Collections.IDictionary fields){
if(viaWorkerStage==6&&viaWorkerSourceRead){if(phase=="via-save-source"){if(fields["scriptId"] as string!=viaWorkerProjectScript)throw Error("via-save-source-original");return;}if(!phase.StartsWith("via-save-arm-",StringComparison.Ordinal)||fields["scriptId"] as string!=viaWorkerProjectScript)throw Error("via-save-arm-original-source");string role=phase.Substring("via-save-arm-".Length);if(Array.IndexOf(new[]{"noData","entry","clock","compress","body","result"},role)<0||!viaSavePoints.Add(role))throw Error("via-save-arm-once");return;}
if(viaWorkerStage!=7||viaSavePoints.Count!=6||viaStructurePoints.Count!=0&&viaStructurePoints.Count!=12)throw Error("via-save-bootstrap-required");
if(phase=="via-save-source"&&fields["scriptId"] as string!=viaWorkerProjectScript)throw Error("via-save-source-original");
if(phase=="via-save-entry"&&(fields["documentUuid"] as string!=generatedFixtureTuple.Split('\\n')[5]||fields["projectUuid"] as string!=generatedFixtureTuple.Split('\\n')[3]))throw Error("via-save-original-target");
if(phase!="via-save-source"&&!viaSdkStages[4])throw Error("via-save-original-attempt");
}
${currentProjectSaveStructureNativeGuard("via")}
public void SendPcbViaWorker(int id,string phase,string method,System.Collections.IDictionary fields){
if(!pcbViaWrite209||viaAbortAttempted||viaWorkerSession==null)throw Error("via-worker-purpose");string encoded=EasyedaPcbViaWorkerProtocol.Encode(id,viaWorkerSession,phase,method,fields);
if(phase.StartsWith("project-save-structure-",StringComparison.Ordinal)){AdmitViaSaveStructureObserver(phase,fields);SendMessage(id,encoded);return;}
bool bootstrap=phase.StartsWith("via-worker-",StringComparison.Ordinal),cleanup=phase.StartsWith("via-worker-resume-",StringComparison.Ordinal)||phase=="via-worker-remove"||phase=="via-save-resume"||phase=="via-save-remove"||phase=="via-save-release";
if(bootstrap){if(cleanup?viaWorkerCleanup>=${String(BOOTSTRAP.workerCleanup)}:viaWorkerNormal>=${String(BOOTSTRAP.workerNormal)})throw Error("via-worker-bootstrap-budget");AdmitViaWorkerBootstrap(phase,fields);if(cleanup)viaWorkerCleanup++;else viaWorkerNormal++;}
else{if(cleanup?viaSaveCleanup>=${String(SAVE.cleanup)}:viaSaveNormal>=${String(SAVE.normal)})throw Error("via-save-observer-budget");AdmitViaSaveObserver(phase,fields);if(cleanup)viaSaveCleanup++;else viaSaveNormal++;}
SendMessage(id,encoded);
}
public static void VerifyPcbViaWorkerSmoke(){VerifyViaSaveStructureGuardSmoke();EasyedaPcbViaWorkerProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209()}){bool refused=false;try{owner.BindPcbViaWorker("w","t",new string('a',64),"window_1");}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaWorkerSession!=null)throw Error("via-worker-old-birth-smoke");}}
}
${end}`;
}
const dispatch = String.raw`        'pcb-via-worker-bind' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.targetId -isnot [string] -or $request.projectUuid -isnot [string] -or $request.windowTabId -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,projectUuid,rootCreated,rootPid,sessionId,targetId,windowTabId') {throw 'pcb-diagnostic-via-worker-bind-fields'}
          $owner.BindPcbViaWorker($request.sessionId,$request.targetId,$request.projectUuid,$request.windowTabId);$result=@{bound=$true}
        }
        'pcb-via-worker-parent' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,phase,requestId,rootCreated,rootPid,sessionId') {throw 'pcb-diagnostic-via-worker-parent-fields'}
          $owner.SendPcbViaWorkerParent([int]$request.requestId,$request.sessionId,$request.phase);$result=@{written=$true}
        }
        'pcb-via-worker' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-worker-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-via-worker-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaWorker([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaWorkerNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-sdk":case "pcb-via-sdk-properties":case "pcb-via-spatial":', 'case "pcb-via-worker-bind":case "pcb-via-worker-parent":case "pcb-via-worker":case "pcb-via-sdk":case "pcb-via-sdk-properties":case "pcb-via-spatial":');
  source = one(source, "        'pcb-via-sdk-properties' {", `${dispatch}        'pcb-via-sdk-properties' {`);
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaSmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaWorkerSmoke()\n    [EasyedaDiagnosticOwner]::VerifyPcbViaSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_WORKER_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// END GENERATED ORIGINAL VIA MAIN FENCE", `${native()}\n// END GENERATED ORIGINAL VIA MAIN FENCE`); }
  return source;
}

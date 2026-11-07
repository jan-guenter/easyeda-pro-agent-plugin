/** Fixed clock extension of the existing original Via birth only. */
import { currentPcbViaClockNativeSource } from "./current-pcb-via-clock-native.ts";
import { CURRENT_PCB_VIA_CLOCK_REQUESTS as REQUESTS } from "./current-pcb-via-clock-protocol.ts";

const begin = "// BEGIN GENERATED VIA ORIGINAL CLOCK OBSERVER", end = "// END GENERATED VIA ORIGINAL CLOCK OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_CLOCK_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("PCB_VIA_CLOCK_NATIVE_ANCHOR"); } return source.replace(before, after);
}
function native(): string { return `${begin}
${currentPcbViaClockNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string viaClockWorkerContext,viaClockSdk;bool viaClockBound,viaClockRegistration,viaClockWorker;int viaClockNormal,viaClockCleanup,viaClockOffsets;readonly System.Collections.Generic.HashSet<string> viaClockPoints=new System.Collections.Generic.HashSet<string>();
public void BindPcbViaClock(string context,string sdk){if(!pcbViaWrite209||viaAbortAttempted||viaClockBound||viaWorkerSession==null||!viaWorkerParentRunning||viaWorkerStage!=7||viaSavePoints.Count!=6||!viaSdkStages[2]||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(sdk??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("via-clock-original-binding");viaClockBound=true;viaClockWorkerContext=context;viaClockSdk=sdk;}
public void SendPcbViaClock(int id,string realm,string phase,string method,System.Collections.IDictionary fields){
if(!pcbViaWrite209||viaAbortAttempted||!viaClockBound||viaWorkerStage!=7||viaWorkerSession==null||viaSession==null)throw Error("via-clock-owner");string encoded=EasyedaPcbViaClockProtocol.Encode(id,viaSession,viaWorkerSession,viaClockSdk,viaClockWorkerContext,realm,phase,method,fields);bool cleanup=phase.StartsWith("via-clock-resume-",StringComparison.Ordinal)||phase.StartsWith("via-clock-remove-",StringComparison.Ordinal)||phase.StartsWith("via-clock-release-",StringComparison.Ordinal);
if(cleanup?viaClockCleanup>=${String(REQUESTS.cleanup)}:viaClockNormal>=${String(REQUESTS.normal)})throw Error("via-clock-budget");
if(phase=="via-clock-registration"){if(viaClockRegistration||realm!="ui")throw Error("via-clock-registration-once");viaClockRegistration=true;}
if(phase=="via-clock-worker"){if(viaClockWorker||realm!="worker")throw Error("via-clock-worker-once");viaClockWorker=true;}
if(phase=="via-clock-offset"&&++viaClockOffsets>2)throw Error("via-clock-offset-bound");
if(phase.StartsWith("via-clock-arm-",StringComparison.Ordinal)){if(viaSdkStages[4]||!viaClockRegistration||!viaClockWorker||!viaClockPoints.Add(phase.Substring("via-clock-arm-".Length)))throw Error("via-clock-arm-once");}
if(phase.StartsWith("via-clock-frame-",StringComparison.Ordinal)||phase=="via-clock-push"||phase=="via-clock-dispatch"||phase=="via-clock-result"||phase=="via-clock-complete"||phase=="via-clock-reply"||phase.StartsWith("via-clock-resume-",StringComparison.Ordinal)){if(!viaSdkStages[4]||viaClockPoints.Count!=5)throw Error("via-clock-original-save-attempt");}
if(cleanup)viaClockCleanup++;else viaClockNormal++;SendMessage(id,encoded);
}
public static void VerifyPcbViaClockSmoke(){EasyedaPcbViaClockProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{owner.BindPcbViaClock("context","sdk");}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaClockBound)throw Error("via-clock-unissued-birth-smoke");}}
}
${end}`; }
const dispatch = String.raw`        'pcb-via-clock-bind' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.workerContext -isnot [string] -or $request.uiSdkObject -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,uiSdkObject,workerContext') {throw 'pcb-diagnostic-via-clock-bind-fields'}
          $owner.BindPcbViaClock($request.workerContext,$request.uiSdkObject);$result=@{bound=$true}
        }
        'pcb-via-clock' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or $request.realm -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-clock-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method','realm');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-via-clock-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaClock([int]$request.requestId,$request.realm,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaClockNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-worker-bind":case "pcb-via-worker-parent":case "pcb-via-worker":case "pcb-via-sdk":', 'case "pcb-via-clock-bind":case "pcb-via-clock":case "pcb-via-worker-bind":case "pcb-via-worker-parent":case "pcb-via-worker":case "pcb-via-sdk":');
  source = one(source, "        'pcb-via-worker-bind' {", `${dispatch}        'pcb-via-worker-bind' {`);
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaWorkerSmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()\n    [EasyedaDiagnosticOwner]::VerifyPcbViaWorkerSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_CLOCK_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// BEGIN GENERATED VIA ORIGINAL WORKER OBSERVER", `${native()}\n// BEGIN GENERATED VIA ORIGINAL WORKER OBSERVER`); } return source;
}

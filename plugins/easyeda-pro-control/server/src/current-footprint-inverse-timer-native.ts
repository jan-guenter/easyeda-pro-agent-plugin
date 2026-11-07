/** Separate original inverse timer ledger. Shared wire templates remain
 * immutable; native fields supply this generation's own worker/context. */
import { CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS as REQUESTS } from "./current-footprint-inverse-timer-budget.ts";

export function currentFootprintInverseTimerNativeSource(): string {
  return `public sealed partial class EasyedaDiagnosticOwner {
bool footprintInverseTimerBound,footprintInverseTimerCancelAttempted,footprintInverseTimerCompleted;int footprintInverseTimerStep,footprintInverseTimerHelpers,footprintInverseTimerHolds;string footprintInverseTimerHeld;
public static string FootprintInverseTimerProtocolMessage(int id,string session,string context,int step,string phase,string method,System.Collections.IDictionary fields){if(step<0||step>=${String(REQUESTS.normal)}||phase!=EasyedaProjectSyncQuiesceProtocol.Phase(step))throw Error("footprint-inverse-timer-sequence");return EasyedaProjectSyncQuiesceProtocol.Encode(id,session,context,phase,method,fields);}
public void BindFootprintInverseTimer(){if(!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||!footprintInverseCtorStarted||footprintInverseCtorHeld!="bootstrap"||footprintInverseTimerBound)throw Error("footprint-inverse-timer-bind");AssertLive();footprintInverseTimerBound=true;}
public void HoldFootprintInverseTimer(string role){if(!footprintInverse209||footprintInverseAborted||!footprintInverseTimerBound||!footprintInverseColdStarted||footprintInverseTimerCompleted||footprintInverseTimerHeld!=null||++footprintInverseTimerHolds>${String(REQUESTS.heldControls)}||!(role=="entry"&&footprintInverseTimerStep==17||role=="returned"&&footprintInverseTimerStep==22))throw Error("footprint-inverse-timer-held");AssertLive();footprintInverseTimerHeld=role;}
public void SendFootprintInverseTimer(int id,string phase,string method,System.Collections.IDictionary fields){if(id<1||id>RequestLimit||!footprintInverse209||footprintInverseAborted||!footprintInverseTimerBound||footprintInverseTimerCompleted||fields==null)throw Error("footprint-inverse-timer-original");AssertLive();string text;
if(phase=="inverse-timer-helper"){string script=fields["scriptId"] as string;if(method!="Debugger.getScriptSource"||fields.Count!=1||!System.Text.RegularExpressions.Regex.IsMatch(script??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||++footprintInverseTimerHelpers>${String(REQUESTS.helperSources)})throw Error("footprint-inverse-timer-helper");text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.getScriptSource\\",\\"params\\":{\\"scriptId\\":"+JsonString(script)+"},\\"sessionId\\":"+JsonString(footprintInversePageSession)+"}\\0";}
else{if(footprintInverseTimerStep<17){if(footprintInverseCtorHeld!="bootstrap"||phase.StartsWith("sync-quiesce-arm-",StringComparison.Ordinal)&&fields["scriptId"] as string!=footprintInverseWorkerScript)throw Error("footprint-inverse-timer-original-arm");}else if(!footprintInverseColdStarted||footprintInverseTimerHeld==null)throw Error("footprint-inverse-timer-original-pause");
text=FootprintInverseTimerProtocolMessage(id,footprintInversePageSession,footprintInverseWorkerContext,footprintInverseTimerStep,phase,method,fields);
if(phase=="sync-quiesce-cancel"){if(footprintInverseTimerCancelAttempted)throw Error("footprint-inverse-timer-once");footprintInverseTimerCancelAttempted=true;}
if(phase=="sync-quiesce-resume-entry"||phase=="sync-quiesce-resume-returned"){if(phase!="sync-quiesce-resume-"+footprintInverseTimerHeld)throw Error("footprint-inverse-timer-resume");footprintInverseTimerHeld=null;}footprintInverseTimerStep++;}SendMessage(id,text);}
public void CompleteFootprintInverseTimer(){if(!footprintInverse209||footprintInverseAborted||!footprintInverseTimerBound||footprintInverseTimerCompleted||!footprintInverseTimerCancelAttempted||footprintInverseTimerStep!=${String(REQUESTS.normal)}||footprintInverseTimerHelpers!=${String(REQUESTS.helperSources)}||footprintInverseTimerHolds!=${String(REQUESTS.heldControls)}||footprintInverseTimerHeld!=null)throw Error("footprint-inverse-timer-complete");AssertLive();footprintInverseTimerCompleted=true;}
public static void VerifyFootprintInverseTimerSmoke(){var fields=new System.Collections.Hashtable();string text=FootprintInverseTimerProtocolMessage(79,"original-session","original-context",0,"sync-quiesce-capture","Runtime.callFunctionOn",fields);if(text.IndexOf("\\"uniqueContextId\\":\\"original-context\\"",StringComparison.Ordinal)<0||!text.EndsWith("}\\0",StringComparison.Ordinal))throw Error("footprint-inverse-timer-codec");foreach(int step in new[]{-1,${String(REQUESTS.normal)}}){bool refused=false;try{FootprintInverseTimerProtocolMessage(79,"s","c",step,"sync-quiesce-capture","Runtime.callFunctionOn",fields);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("footprint-inverse-timer-bound");}}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_TIMER_DISPATCH = `        'footprint-inverse-timer' {
          if (-not $FootprintInverse209 -or -not $launched) {throw 'footprint-inverse-timer-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-timer-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-timer-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          if ($request.phase -ceq 'bind' -or $request.phase -ceq 'complete' -or $request.phase.StartsWith('held-',[StringComparison]::Ordinal)) {
            if ($request.requestId -ne 0 -or $fields.Count -ne 0 -or $request.method -cne 'control') {throw 'footprint-inverse-timer-control-fields'}
            if ($request.phase -ceq 'bind') {$owner.BindFootprintInverseTimer()} elseif ($request.phase -ceq 'complete') {$owner.CompleteFootprintInverseTimer()} else {$owner.HoldFootprintInverseTimer($request.phase.Substring(5))}
          } else {$owner.SendFootprintInverseTimer([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;

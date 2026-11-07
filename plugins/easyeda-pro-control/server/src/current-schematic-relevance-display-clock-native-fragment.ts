/** Separate original seven-record clock state. The fixed encoder is inert and
 * reused byte-for-byte; no six-record clock token or counters are adopted. */
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS as REQUESTS } from "./current-schematic-display-clock-protocol.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE DISPLAY CLOCK", end = "// END ORIGINAL RELEVANCE DISPLAY CLOCK";
function native(): string { return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
string schematicRelevanceClockWorkerContext,schematicRelevanceClockSdk;bool schematicRelevanceClockBound,schematicRelevanceClockRegistration,schematicRelevanceClockWorker;int schematicRelevanceClockNormal,schematicRelevanceClockCleanup,schematicRelevanceClockOffsets;readonly System.Collections.Generic.HashSet<string> schematicRelevanceClockPoints=new System.Collections.Generic.HashSet<string>();
public void BindRelevanceDisplayClock(string context,string sdk){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||schematicRelevanceClockBound||schematicWorkerSession==null||!schematicWorkerParentRunning||schematicWorkerStage!=7||schematicSavePoints.Count!=6||!schematicDisplayStages[4]||sdk!=schematicDisplayTuple||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(sdk??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-clock-original-binding");schematicRelevanceClockBound=true;schematicRelevanceClockWorkerContext=context;schematicRelevanceClockSdk=sdk;}
public void SendRelevanceDisplayClock(int id,string realm,string phase,string method,System.Collections.IDictionary fields){
if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicRelevanceClockBound||schematicWorkerStage!=7||schematicWorkerSession==null||schematicDisplaySession==null)throw Error("schematic-clock-owner");string encoded=EasyedaSchematicDisplayClockProtocol.Encode(id,schematicDisplaySession,schematicWorkerSession,schematicRelevanceClockSdk,schematicRelevanceClockWorkerContext,realm,phase,method,fields);bool cleanup=phase.StartsWith("schematic-clock-resume-",StringComparison.Ordinal)||phase.StartsWith("schematic-clock-remove-",StringComparison.Ordinal)||phase.StartsWith("schematic-clock-release-",StringComparison.Ordinal);
if(cleanup?schematicRelevanceClockCleanup>=${String(REQUESTS.cleanup)}:schematicRelevanceClockNormal>=${String(REQUESTS.normal)})throw Error("schematic-clock-budget");
if(phase=="schematic-clock-registration"){if(schematicRelevanceClockRegistration||realm!="ui")throw Error("schematic-clock-registration-once");schematicRelevanceClockRegistration=true;}
if(phase=="schematic-clock-worker"){if(schematicRelevanceClockWorker||realm!="worker")throw Error("schematic-clock-worker-once");schematicRelevanceClockWorker=true;}
if(phase=="schematic-clock-offset"&&++schematicRelevanceClockOffsets>2)throw Error("schematic-clock-offset-bound");
if(phase.StartsWith("schematic-clock-arm-",StringComparison.Ordinal)){if(schematicDisplayStages[6]||!schematicRelevanceClockRegistration||!schematicRelevanceClockWorker||!schematicRelevanceClockPoints.Add(phase.Substring("schematic-clock-arm-".Length)))throw Error("schematic-clock-arm-once");}
if(phase.StartsWith("schematic-clock-frame-",StringComparison.Ordinal)||phase=="schematic-clock-push"||phase=="schematic-clock-dispatch"||phase=="schematic-clock-result"||phase=="schematic-clock-complete"||phase=="schematic-clock-reply"||phase.StartsWith("schematic-clock-resume-",StringComparison.Ordinal)){if(!schematicDisplayStages[6]||schematicRelevanceClockPoints.Count!=5)throw Error("schematic-clock-original-save-attempt");}
if(cleanup)schematicRelevanceClockCleanup++;else schematicRelevanceClockNormal++;SendMessage(id,encoded);
}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-display-clock-bind' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.workerContext -isnot [string] -or $request.uiSdkObject -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,uiSdkObject,workerContext') {throw 'pcb-diagnostic-schematic-clock-bind-fields'}
          $owner.BindRelevanceDisplayClock($request.workerContext,$request.uiSdkObject);$result=@{bound=$true}
        }
        'schematic-relevance-display-clock' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or $request.realm -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-clock-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method','realm');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-clock-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevanceDisplayClock([int]$request.requestId,$request.realm,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayClockNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaSchematicDisplayClockProtocol")) { throw new Error("RELEVANCE_CLOCK_FIXED_ENCODER_REQUIRED"); }
  let source = input;
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", stop = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(stop).length !== 2) { throw new Error("RELEVANCE_CLOCK_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(stop, from);
  if (to < from) { throw new Error("RELEVANCE_CLOCK_ADMISSION_ORDER"); }
  const body = source.slice(from, to), cases = 'case "schematic-relevance-display-clock-bind":case "schematic-relevance-display-clock":';
  if (!body.includes(cases)) {
    if (body.includes('case "schematic-relevance-display-clock') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_CLOCK_PARTIAL_ADMISSION"); }
    source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to);
  } else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_CLOCK_ADMISSION_DUPLICATE"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const finish = source.indexOf(end), start = source.indexOf(begin);
  if (start !== -1 || finish !== -1) {
    if (start === -1 || finish < start || source.includes(begin, start + begin.length) || source.includes(end, finish + end.length)) { throw new Error("RELEVANCE_CLOCK_NATIVE_MARKERS"); }
    return source.slice(0, start) + native() + source.slice(finish + end.length);
  }
  const anchor = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209";
  if (source.split(anchor).length !== 2) { throw new Error("RELEVANCE_CLOCK_NATIVE_ANCHOR"); }
  return source.replace(anchor, `${native()}\n${anchor}`);
}

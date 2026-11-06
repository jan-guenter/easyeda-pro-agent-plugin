/** Fixed clock extension of the existing original SCH birth only. */
import { currentSchematicDisplayClockNativeSource } from "./current-schematic-display-clock-native.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS as REQUESTS } from "./current-schematic-display-clock-protocol.ts";

const begin = "// BEGIN GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER", end = "// END GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_ANCHOR"); } return source.replace(before, after);
}
function native(): string { return `${begin}
${currentSchematicDisplayClockNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string schematicClockWorkerContext,schematicClockSdk;bool schematicClockBound,schematicClockRegistration,schematicClockWorker;int schematicClockNormal,schematicClockCleanup,schematicClockOffsets;readonly System.Collections.Generic.HashSet<string> schematicClockPoints=new System.Collections.Generic.HashSet<string>();
public void BindSchematicDisplayClock(string context,string sdk){if(!schematicDisplayWrite209||schematicDisplayAbort||schematicClockBound||schematicWorkerSession==null||!schematicWorkerParentRunning||schematicWorkerStage!=7||schematicSavePoints.Count!=6||!schematicDisplayStages[4]||sdk!=schematicDisplayTuple||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(sdk??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-clock-original-binding");schematicClockBound=true;schematicClockWorkerContext=context;schematicClockSdk=sdk;}
public void SendSchematicDisplayClock(int id,string realm,string phase,string method,System.Collections.IDictionary fields){
if(!schematicDisplayWrite209||schematicDisplayAbort||!schematicClockBound||schematicWorkerStage!=7||schematicWorkerSession==null||schematicDisplaySession==null)throw Error("schematic-clock-owner");string encoded=EasyedaSchematicDisplayClockProtocol.Encode(id,schematicDisplaySession,schematicWorkerSession,schematicClockSdk,schematicClockWorkerContext,realm,phase,method,fields);bool cleanup=phase.StartsWith("schematic-clock-resume-",StringComparison.Ordinal)||phase.StartsWith("schematic-clock-remove-",StringComparison.Ordinal)||phase.StartsWith("schematic-clock-release-",StringComparison.Ordinal);
if(cleanup?schematicClockCleanup>=${String(REQUESTS.cleanup)}:schematicClockNormal>=${String(REQUESTS.normal)})throw Error("schematic-clock-budget");
if(phase=="schematic-clock-registration"){if(schematicClockRegistration||realm!="ui")throw Error("schematic-clock-registration-once");schematicClockRegistration=true;}
if(phase=="schematic-clock-worker"){if(schematicClockWorker||realm!="worker")throw Error("schematic-clock-worker-once");schematicClockWorker=true;}
if(phase=="schematic-clock-offset"&&++schematicClockOffsets>2)throw Error("schematic-clock-offset-bound");
if(phase.StartsWith("schematic-clock-arm-",StringComparison.Ordinal)){if(schematicDisplayStages[6]||!schematicClockRegistration||!schematicClockWorker||!schematicClockPoints.Add(phase.Substring("schematic-clock-arm-".Length)))throw Error("schematic-clock-arm-once");}
if(phase.StartsWith("schematic-clock-frame-",StringComparison.Ordinal)||phase=="schematic-clock-push"||phase=="schematic-clock-dispatch"||phase=="schematic-clock-result"||phase=="schematic-clock-complete"||phase=="schematic-clock-reply"||phase.StartsWith("schematic-clock-resume-",StringComparison.Ordinal)){if(!schematicDisplayStages[6]||schematicClockPoints.Count!=5)throw Error("schematic-clock-original-save-attempt");}
if(cleanup)schematicClockCleanup++;else schematicClockNormal++;SendMessage(id,encoded);
}
public static void VerifySchematicDisplayClockSmoke(){EasyedaSchematicDisplayClockProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{owner.BindSchematicDisplayClock("context","sdk");}catch(InvalidOperationException){refused=true;}if(!refused||owner.schematicClockBound)throw Error("schematic-clock-unissued-birth-smoke");if(owner.originalMain!=null)owner.originalMain.Release();}}
}
${end}`; }
const dispatch = String.raw`        'schematic-display-clock-bind' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.workerContext -isnot [string] -or $request.uiSdkObject -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,uiSdkObject,workerContext') {throw 'pcb-diagnostic-schematic-clock-bind-fields'}
          $owner.BindSchematicDisplayClock($request.workerContext,$request.uiSdkObject);$result=@{bound=$true}
        }
        'schematic-display-clock' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or $request.realm -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-clock-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method','realm');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-clock-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicDisplayClock([int]$request.requestId,$request.realm,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicDisplayClockNativeFragment(input: string): string {
  let source = one(input, 'case "schematic-display-worker-prepare":case "schematic-display-worker-bind":case "schematic-display-worker-parent":case "schematic-display-worker":case "schematic-display-native":', 'case "schematic-display-clock-bind":case "schematic-display-clock":case "schematic-display-worker-prepare":case "schematic-display-worker-bind":case "schematic-display-worker-parent":case "schematic-display-worker":case "schematic-display-native":');
  source = one(source, "        'schematic-display-worker-prepare' {", `${dispatch}        'schematic-display-worker-prepare' {`);
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifySchematicDisplayWorkerSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplayClockSmoke()\n    [EasyedaDiagnosticOwner]::VerifySchematicDisplayWorkerSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// BEGIN GENERATED SCHEMATIC ORIGINAL WORKER OBSERVER", `${native()}\n// BEGIN GENERATED SCHEMATIC ORIGINAL WORKER OBSERVER`); } return source;
}

/** Distinct original worker transport custody for both fresh writer purposes.
 * This fragment grants no body reservation or main publication by itself. */
import { currentProjectStructureTransportNativeSource } from "./current-project-structure-transport-native.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS as REQUESTS } from "./current-project-structure-transport-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL SHARED STRUCTURE TRANSPORT";
const end = "// END ORIGINAL SHARED STRUCTURE TRANSPORT";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`PROJECT_STRUCTURE_TRANSPORT_NATIVE_ANCHOR:${before.slice(0, 80)}`); } return source.replace(before, after);
}
function owner(purpose: "via" | "schematic"): string {
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted" : "schematicDisplayWrite209&&!schematicDisplayAbort", name = purpose === "via" ? "Via" : "SchematicDisplay", prefix = purpose;
  const save = purpose === "via" ? "viaSdkStages[4]" : "schematicDisplayStages[6]";
  return `
string ${prefix}StructureTransportContext;bool ${prefix}StructureTransportCaptured,${prefix}StructureTransportSendFrame,${prefix}StructureTransportSendJoin,${prefix}StructureTransportValue,${prefix}StructureTransportSendResumed,${prefix}StructureTransportReturnFrame,${prefix}StructureTransportReturnJoin,${prefix}StructureTransportReturnedResumed,${prefix}StructureTransportFailed,${prefix}StructureTransportReleased;
bool ${prefix}StructureTransportBodyReserved=false,${prefix}StructureTransportPublished=false;int ${prefix}StructureTransportNormal,${prefix}StructureTransportCleanup;
readonly System.Collections.Generic.HashSet<string> ${prefix}StructureTransportPoints=new System.Collections.Generic.HashSet<string>();
readonly System.Collections.Generic.HashSet<string> ${prefix}StructureTransportRemoved=new System.Collections.Generic.HashSet<string>();
public void Bind${name}StructureTransport(string context){
if(!(${born})||${prefix}StructureTransportContext!=null||${prefix}WorkerSession==null||${prefix}WorkerStage!=6||!${prefix}WorkerSourceRead||${prefix}StructurePoints.Count!=14||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("project-structure-transport-original-binding");${prefix}StructureTransportContext=context;
}
public void Send${name}StructureTransport(int id,string phase,string method,System.Collections.IDictionary fields){
if(!(${born})||${prefix}StructureTransportContext==null||${prefix}WorkerSession==null||${prefix}StructureTransportFailed)throw Error("project-structure-transport-original-owner");
string encoded=EasyedaProjectStructureTransportProtocol.Encode(id,${prefix}WorkerSession,${prefix}StructureTransportContext,phase,method,fields);
bool cleanup=phase.StartsWith("project-structure-transport-remove-",StringComparison.Ordinal)||phase=="project-structure-transport-release";
if(cleanup?${prefix}StructureTransportCleanup>=${String(REQUESTS.cleanup)}:${prefix}StructureTransportNormal>=${String(REQUESTS.normal)})throw Error("project-structure-transport-budget");
if(${prefix}WorkerStage==6&&${prefix}WorkerSourceRead){
if(phase=="project-structure-transport-capture"){if(${prefix}StructureTransportCaptured)throw Error("project-structure-transport-capture-once");${prefix}StructureTransportCaptured=true;}
else if(phase.StartsWith("project-structure-transport-arm-",StringComparison.Ordinal)){string role=phase.Substring("project-structure-transport-arm-".Length);if(!${prefix}StructureTransportCaptured||fields["scriptId"] as string!=${prefix}WorkerProjectScript||Array.IndexOf(new[]{"send","returned","failed"},role)<0||!${prefix}StructureTransportPoints.Add(role))throw Error("project-structure-transport-original-arm");}
else throw Error("project-structure-transport-before-source-resume");
}else{
if(${prefix}WorkerStage!=7||!${prefix}StructureTransportCaptured||${prefix}StructureTransportPoints.Count!=3||!${save}||phase=="project-structure-transport-capture"||phase.StartsWith("project-structure-transport-arm-",StringComparison.Ordinal))throw Error("project-structure-transport-source-and-save-required");
if(phase=="project-structure-transport-frame-failed"){${prefix}StructureTransportFailed=true;}
else if(phase=="project-structure-transport-frame-send"){if(!${prefix}StructureTransportBodyReserved||${prefix}StructureTransportSendFrame)throw Error("project-structure-transport-original-send-frame");${prefix}StructureTransportSendFrame=true;}
else if(phase=="project-structure-transport-send"){if(!${prefix}StructureTransportSendFrame||${prefix}StructureTransportSendJoin)throw Error("project-structure-transport-original-send-join");${prefix}StructureTransportSendJoin=true;}
else if(phase=="project-structure-transport-value"){if(!${prefix}StructureTransportSendJoin||${prefix}StructureTransportValue)throw Error("project-structure-transport-value-once");${prefix}StructureTransportValue=true;}
else if(phase=="project-structure-transport-resume-send"){if(!${prefix}StructureTransportBodyReserved||!${prefix}StructureTransportValue||${prefix}StructureTransportSendResumed)throw Error("project-structure-transport-body-reservation-required");${prefix}StructureTransportSendResumed=true;}
else if(phase=="project-structure-transport-frame-returned"){if(!${prefix}StructureTransportSendResumed||${prefix}StructureTransportReturnFrame)throw Error("project-structure-transport-original-return-frame");${prefix}StructureTransportReturnFrame=true;}
else if(phase=="project-structure-transport-returned"){if(!${prefix}StructureTransportReturnFrame||${prefix}StructureTransportReturnJoin)throw Error("project-structure-transport-original-return-join");${prefix}StructureTransportReturnJoin=true;}
else if(phase=="project-structure-transport-resume-returned"){if(!${prefix}StructureTransportPublished||!${prefix}StructureTransportReturnJoin||${prefix}StructureTransportReturnedResumed)throw Error("project-structure-transport-original-publication-required");${prefix}StructureTransportReturnedResumed=true;}
else if(phase.StartsWith("project-structure-transport-remove-",StringComparison.Ordinal)){string role=phase.Substring("project-structure-transport-remove-".Length);if(!${prefix}StructureTransportReturnedResumed||!${prefix}StructureTransportPoints.Contains(role)||!${prefix}StructureTransportRemoved.Add(role))throw Error("project-structure-transport-original-remove");}
else if(phase=="project-structure-transport-release"){if(${prefix}StructureTransportRemoved.Count!=3||${prefix}StructureTransportReleased)throw Error("project-structure-transport-original-release");${prefix}StructureTransportReleased=true;}
else throw Error("project-structure-transport-phase");
}
if(cleanup)${prefix}StructureTransportCleanup++;else ${prefix}StructureTransportNormal++;SendMessage(id,encoded);
}
`;
}
function guardSmoke(purpose: "via" | "schematic"): string {
  const factory = purpose === "via" ? "CreatePcbViaWrite209" : "CreateSchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay", prefix = purpose;
  const save = purpose === "via" ? "viaSdkStages[4]" : "schematicDisplayStages[6]";
  return `{var o=${factory}();try{bool refused=false;try{o.Bind${name}StructureTransport("context");}catch(InvalidOperationException){refused=true;}if(!refused||o.${prefix}StructureTransportContext!=null)throw Error("transport-unissued-source-smoke");
o.${prefix}WorkerSession="worker";o.${prefix}WorkerStage=6;o.${prefix}WorkerSourceRead=true;for(int i=0;i<14;i++)o.${prefix}StructurePoints.Add("point"+i);o.Bind${name}StructureTransport("context");
refused=false;try{o.Bind${name}StructureTransport("context");}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("transport-bind-once-smoke");
o.${prefix}WorkerStage=7;o.${prefix}StructureTransportCaptured=true;foreach(string role in new[]{"send","returned","failed"})o.${prefix}StructureTransportPoints.Add(role);o.${save}=true;
foreach(string phase in new[]{"project-structure-transport-frame-send","project-structure-transport-resume-send","project-structure-transport-resume-returned"}){var fields=new System.Collections.Hashtable();if(phase=="project-structure-transport-frame-send")fields.Add("callFrameId","frame");o.${prefix}StructureTransportValue=true;o.${prefix}StructureTransportReturnJoin=true;refused=false;try{o.Send${name}StructureTransport(1,phase,phase=="project-structure-transport-frame-send"?"Debugger.evaluateOnCallFrame":"Debugger.resume",fields);}catch(InvalidOperationException){refused=true;}if(!refused||o.${prefix}StructureTransportNormal!=0||o.${prefix}StructureTransportSendResumed||o.${prefix}StructureTransportReturnedResumed)throw Error("transport-unissued-grant-smoke");}
}finally{o.originalMain.Release();}}`;
}
function native(): string { return `${begin}\n${currentProjectStructureTransportNativeSource()}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}\n${owner("schematic")}\npublic static void VerifyOriginalStructureTransportGuardSmoke(){${guardSmoke("via")}${guardSmoke("schematic")}}\n}\n${end}`; }
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-structure-transport-bind' {
          if (-not ${flag} -or -not $launched -or $request.workerContext -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,workerContext') {throw 'pcb-diagnostic-structure-transport-bind-fields'}
          $owner.Bind${name}StructureTransport($request.workerContext);$result=@{bound=$true}
        }
        '${action}-structure-transport' {
          if (-not ${flag} -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-structure-transport-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-structure-transport-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.Send${name}StructureTransport([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
}
export function applyCurrentProjectStructureTransportNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-clock-bind":case "pcb-via-clock":', 'case "pcb-via-structure-transport-bind":case "pcb-via-structure-transport":case "pcb-via-clock-bind":case "pcb-via-clock":');
  source = one(source, 'case "schematic-display-clock-bind":case "schematic-display-clock":', 'case "schematic-display-structure-transport-bind":case "schematic-display-structure-transport":case "schematic-display-clock-bind":case "schematic-display-clock":');
  source = installOwnedNativeDispatch(source, dispatch("via") + dispatch("schematic"), "        'pcb-via-clock-bind' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaProjectStructureTransportProtocol]::VerifySmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplayWorkerSmoke()");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyOriginalStructureTransportGuardSmoke()", "    [EasyedaProjectStructureTransportProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", `${native()}\n// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH`); }
  return source;
}

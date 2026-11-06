/** Same fresh writer births; fixed observation only, with no resume/cleanup
 * grant. All installed source pauses remain original-Job abortable. */
import { currentProjectSaveProducerNativeSource } from "./current-project-save-producer-native.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as REQUESTS } from "./current-project-save-producer-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL SHARED PRODUCER OBSERVATION", end = "// END ORIGINAL SHARED PRODUCER OBSERVATION";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PROJECT_SAVE_PRODUCER_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`PROJECT_SAVE_PRODUCER_NATIVE_ANCHOR:${before.slice(0, 64)}`); } return source.replace(before, after);
}
function owner(purpose: "via" | "schematic"): string {
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted" : "schematicDisplayWrite209&&!schematicDisplayAbort", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `int ${purpose}ProducerObserveRequests,${purpose}ProducerObserveProperties;string ${purpose}ProducerContext;
bool ${purpose}ProducerCtorCaptured,${purpose}ProducerCtorProperties,${purpose}ProducerMembersCaptured,${purpose}ProducerMembersProperties,${purpose}ProducerIntrinsicsReproved;
readonly System.Collections.Generic.HashSet<string> ${purpose}ProducerObserveArms=new System.Collections.Generic.HashSet<string>();
readonly System.Collections.Generic.HashSet<int> ${purpose}ProducerIntrinsicMetadata=new System.Collections.Generic.HashSet<int>();
readonly System.Collections.Generic.Dictionary<string,int> ${purpose}ProducerObserveCounts=new System.Collections.Generic.Dictionary<string,int>(StringComparer.Ordinal);
public void Bind${name}Producer(string context){if(!(${born})||${purpose}ProducerContext!=null||${purpose}WorkerSession==null||${purpose}WorkerStage!=6||!${purpose}WorkerSourceRead||${purpose}ProducerGuards.Count!=10||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("project-save-producer-original-binding");AssertLive();${purpose}ProducerContext=context;}
public void Send${name}ProducerObserve(int id,string phase,string method,System.Collections.IDictionary fields){
if(!(${born})||${purpose}ProducerContext==null||${purpose}WorkerSession==null||fields==null||${purpose}ProducerObserveRequests>=${String(REQUESTS.cdpRequests)})throw Error("project-save-producer-original-owner");
string encoded=EasyedaProjectSaveProducerProtocol.Encode(id,${purpose}WorkerSession,${purpose}ProducerContext,phase,method,fields);
if(phase.StartsWith("project-save-producer-intrinsics-",StringComparison.Ordinal)){
if(${purpose}WorkerStage!=6||!${purpose}WorkerSourceRead||${purpose}WorkerInstrumentRemoved||${purpose}ProducerObserveArms.Count!=0)throw Error("project-save-producer-intrinsics-original-source");
if(phase=="project-save-producer-intrinsics-constructors"){if(${purpose}ProducerCtorCaptured)throw Error("project-save-producer-constructors-once");${purpose}ProducerCtorCaptured=true;}
else if(phase=="project-save-producer-intrinsics-properties-constructors"){if(!${purpose}ProducerCtorCaptured||${purpose}ProducerCtorProperties)throw Error("project-save-producer-ctor-properties-once");${purpose}ProducerCtorProperties=true;}
else if(phase=="project-save-producer-intrinsics-members"){if(!${purpose}ProducerCtorProperties||${purpose}ProducerIntrinsicMetadata.Count!=3||${purpose}ProducerMembersCaptured)throw Error("project-save-producer-members-once");${purpose}ProducerMembersCaptured=true;}
else if(phase=="project-save-producer-intrinsics-properties-members"){if(!${purpose}ProducerMembersCaptured||${purpose}ProducerMembersProperties)throw Error("project-save-producer-member-properties-once");${purpose}ProducerMembersProperties=true;}
else if(phase.StartsWith("project-save-producer-intrinsics-metadata-",StringComparison.Ordinal)){int slot=Int32.Parse(phase.Substring("project-save-producer-intrinsics-metadata-".Length),CultureInfo.InvariantCulture);if(slot<=3?!${purpose}ProducerCtorProperties||${purpose}ProducerMembersCaptured:!${purpose}ProducerMembersProperties)throw Error("project-save-producer-metadata-order");if(!${purpose}ProducerIntrinsicMetadata.Add(slot))throw Error("project-save-producer-metadata-once");}
else if(phase=="project-save-producer-intrinsics-reprove"){if(!${purpose}ProducerMembersProperties||${purpose}ProducerIntrinsicMetadata.Count!=23||${purpose}ProducerIntrinsicsReproved)throw Error("project-save-producer-reprove-once");${purpose}ProducerIntrinsicsReproved=true;}
else throw Error("project-save-producer-intrinsics-phase");
}else if(phase.StartsWith("project-save-producer-arm-",StringComparison.Ordinal)){
if(${purpose}WorkerStage!=6||!${purpose}WorkerSourceRead||!${purpose}ProducerIntrinsicsReproved||${purpose}ProducerGuards.Count!=10||fields["scriptId"] as string!=${purpose}WorkerProjectScript||${purpose}ProducerObserveArms.Count>=${String(REQUESTS.newArms)}||!${purpose}ProducerObserveArms.Add(phase))throw Error("project-save-producer-original-arm");
}else{
if(${purpose}WorkerStage!=7||!${purpose}StructureBootstrapResumed||!${purpose}ProducerModeRequested||!${purpose}ProducerIntrinsicsReproved||${purpose}ProducerObserveArms.Count!=${String(REQUESTS.newArms)})throw Error("project-save-producer-original-construction");
if(phase=="project-save-producer-properties"){if(${purpose}ProducerObserveProperties>=${String(REQUESTS.properties)})throw Error("project-save-producer-properties-budget");${purpose}ProducerObserveProperties++;}
else{int count;${purpose}ProducerObserveCounts.TryGetValue(phase,out count);int maximum=phase.IndexOf("syncHistory",StringComparison.Ordinal)>=0?4:phase.IndexOf("headEntry",StringComparison.Ordinal)>=0||phase.IndexOf("headPromise",StringComparison.Ordinal)>=0||phase.IndexOf("headSuccess",StringComparison.Ordinal)>=0||phase.IndexOf("cacheFailed",StringComparison.Ordinal)>=0||phase.StartsWith("project-save-producer-cache-",StringComparison.Ordinal)?3:2;if(count>=maximum)throw Error("project-save-producer-role-budget");${purpose}ProducerObserveCounts[phase]=count+1;}
}
AssertLive();${purpose}ProducerObserveRequests++;SendMessage(id,encoded);
}
`;
}
function smoke(purpose: "via" | "schematic"): string {
  const factory = purpose === "via" ? "CreatePcbViaWrite209" : "CreateSchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `{var o=${factory}();try{bool refused=false;try{o.Send${name}ProducerObserve(1,"project-save-producer-properties","Runtime.getProperties",new System.Collections.Hashtable(){{"objectId","original"}});}catch(InvalidOperationException){refused=true;}if(!refused||o.${purpose}ProducerObserveRequests!=0)throw Error("producer-observation-original-owner-smoke");}finally{o.originalMain.Release();}}`;
}
function native(): string { return `${begin}\n${currentProjectSaveProducerNativeSource()}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}${owner("schematic")}\npublic static void VerifyOriginalProducerObservationSmoke(){${smoke("via")}${smoke("schematic")}}\n}\n${end}`; }
function bindDispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-producer-bind' {
          if (-not ${flag} -or -not $launched -or $request.workerContext -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,workerContext') {throw 'project-save-producer-bind-fields'}
          $owner.Bind${name}Producer($request.workerContext);$result=@{bound=$true}
        }
`;
}
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-producer-observe' {
          if (-not ${flag} -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'project-save-producer-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'project-save-producer-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.Send${name}ProducerObserve([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
}
export function applyCurrentProjectSaveProducerNativeFragment(input: string): string {
  let source = input;
  for (const name of ["pcb-via", "schematic-display"]) {
    const before = `case "${name}-producer-observe":case "${name}-producer-guard":`; const after = `case "${name}-producer-bind":${before}`;
    source = source.includes(before) && !source.includes(after) ? one(source, before, after) : one(source, `case "${name}-producer-guard":`, after);
  }
  source = installOwnedNativeDispatch(source, dispatch("via") + dispatch("schematic"), "        'pcb-via-producer-guard' {");
  source = installOwnedNativeDispatch(source, bindDispatch("via") + bindDispatch("schematic"), "        'pcb-via-producer-observe' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaProjectSaveProducerProtocol]::VerifySmoke()", "    [EasyedaProjectSaveProducerGuardProtocol]::VerifySmoke()");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyOriginalProducerObservationSmoke()", "    [EasyedaProjectSaveProducerProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PROJECT_SAVE_PRODUCER_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", `${native()}\n// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH`); } return source;
}

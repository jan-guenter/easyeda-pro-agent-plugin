/** Same original births and event stream, with no producer continuation grant. */
import { currentProjectSaveProducerGuardNativeSource } from "./current-project-save-producer-guard-native.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS as REQUESTS } from "./current-project-save-producer-guard-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL SHARED PRODUCER GUARDS", end = "// END ORIGINAL SHARED PRODUCER GUARDS";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`PROJECT_SAVE_PRODUCER_GUARD_ANCHOR:${before.slice(0, 64)}`); } return source.replace(before, after);
}
function owner(purpose: "via" | "schematic"): string {
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted" : "schematicDisplayWrite209&&!schematicDisplayAbort", name = purpose === "via" ? "Via" : "SchematicDisplay";
  const before = purpose === "via" ? "viaSdkStages[0]&&viaSdkStages[1]&&!viaSdkStages[2]&&!viaSdkStages[4]" : "schematicDisplayStages[2]&&schematicDisplayStages[3]&&!schematicDisplayStages[4]&&!schematicDisplayStages[6]";
  return `bool ${purpose}ProducerPrefixEnrolled;readonly System.Collections.Generic.HashSet<string> ${purpose}ProducerGuards=new System.Collections.Generic.HashSet<string>();
public void Send${name}ProducerGuard(int id,string phase,string method,System.Collections.IDictionary fields){if(!(${born})||${purpose}WorkerSession==null||${purpose}WorkerStage!=6||!${purpose}WorkerSourceRead||fields==null||fields["scriptId"] as string!=${purpose}WorkerProjectScript||${purpose}ProducerGuards.Count>=${String(REQUESTS.normal)})throw Error("project-save-producer-guard-original-source");string encoded=EasyedaProjectSaveProducerGuardProtocol.Encode(id,${purpose}WorkerSession,phase,method,fields);if(!${purpose}ProducerGuards.Add(phase))throw Error("project-save-producer-guard-once");SendMessage(id,encoded);}
public void Enroll${name}ProducerPrefix(){if(!(${born})||${purpose}ProducerPrefixEnrolled||${purpose}WorkerSession==null||${purpose}WorkerStage!=7||!${purpose}StructureBootstrapResumed||!${purpose}ProducerModeRequested||${purpose}ProducerGuards.Count!=${String(REQUESTS.normal)}||!(${before}))throw Error("project-save-producer-prefix-original-enrollment");AssertLive();${purpose}ProducerPrefixEnrolled=true;}
`;
}
function smoke(purpose: "via" | "schematic"): string {
  const factory = purpose === "via" ? "CreatePcbViaWrite209" : "CreateSchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  const stages = purpose === "via" ? "o.viaSdkStages[0]=true;o.viaSdkStages[1]=true;" : "o.schematicDisplayStages[2]=true;o.schematicDisplayStages[3]=true;";
  return `{var o=${factory}();try{bool refused=false;try{o.Enroll${name}ProducerPrefix();}catch(InvalidOperationException){refused=true;}if(!refused||o.${purpose}ProducerPrefixEnrolled)throw Error("producer-prefix-unissued-smoke");
o.${purpose}WorkerSession="worker";o.${purpose}WorkerStage=7;o.${purpose}StructureBootstrapResumed=true;o.${purpose}ProducerModeRequested=true;for(int i=0;i<10;i++)o.${purpose}ProducerGuards.Add("point"+i);${stages}refused=false;try{o.Enroll${name}ProducerPrefix();}catch(InvalidOperationException){refused=true;}if(!refused||o.${purpose}ProducerPrefixEnrolled)throw Error("producer-prefix-original-root-required-smoke");}finally{o.originalMain.Release();}}`;
}
function native(): string { return `${begin}\n${currentProjectSaveProducerGuardNativeSource()}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}${owner("schematic")}\npublic static void VerifyOriginalProducerGuardSmoke(){${smoke("via")}${smoke("schematic")}}\n}\n${end}`; }
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-producer-guard' {
          if (-not ${flag} -or -not $launched -or $request.phase -isnot [string] -or $request.method -cne 'Debugger.setBreakpoint' -or $request.scriptId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,phase,requestId,rootCreated,rootPid,scriptId') {throw 'project-save-producer-guard-fields'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$fields.Add('scriptId',$request.scriptId)
          $owner.Send${name}ProducerGuard([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        '${action}-producer-prefix-enroll' {
          if (-not ${flag} -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'project-save-producer-prefix-fields'}
          $owner.Enroll${name}ProducerPrefix();$result=@{enrolled=$true}
        }
`;
}
export function applyCurrentProjectSaveProducerGuardNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-sdk":', 'case "pcb-via-producer-guard":case "pcb-via-producer-prefix-enroll":case "pcb-via-sdk":');
  source = one(source, 'case "schematic-display-native":', 'case "schematic-display-producer-guard":case "schematic-display-producer-prefix-enroll":case "schematic-display-native":');
  source = one(source, '||stage=="save")throw Error("via-sdk-stage-eligibility");', '||stage=="save"||stage=="create"&&!viaProducerPrefixEnrolled)throw Error("via-sdk-stage-eligibility");');
  source = installOwnedNativeDispatch(source, dispatch("via") + dispatch("schematic"), "        'pcb-via-structure-transport-bind' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaProjectSaveProducerGuardProtocol]::VerifySmoke()", "    [EasyedaProjectStructureTransportProtocol]::VerifySmoke()");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyOriginalProducerGuardSmoke()", "    [EasyedaProjectSaveProducerGuardProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", `${native()}\n// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH`); } return source;
}

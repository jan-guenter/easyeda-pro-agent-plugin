/** Startup-only same-head sync lane on the two original writer births.
 * Each native stage burns before dispatch. Unknown replies never refund it. */
import { CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM as MAXIMUM, CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS as REQUESTS } from "./current-generated-periodic-sync-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL GENERATED PERIODIC SYNC", end = "// END ORIGINAL GENERATED PERIODIC SYNC";
function owner(purpose: "via" | "schematic"): string {
  const name = purpose === "via" ? "Via" : "SchematicDisplay";
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted&&!viaSdkStages[2]&&!viaSdkStages[4]" : "schematicDisplayWrite209&&!schematicDisplayAbort&&!schematicDisplayStages[4]&&!schematicDisplayStages[6]";
  return `int ${purpose}PeriodicSyncCalls,${purpose}PeriodicSyncStage;
public void Send${name}PeriodicSync(int id,string phase,string method,System.Collections.IDictionary fields){if(!(${born})||!${purpose}InitialSyncCompleted||${purpose}PeriodicSyncCalls>=${String(MAXIMUM)}||${purpose}WorkerSession==null||${purpose}WorkerStage!=7||!${purpose}StructureBootstrapResumed||!${purpose}ProducerModeRequested||!${purpose}ProducerIntrinsicsReproved||${purpose}ProducerObserveArms.Count!=27||${purpose}PeriodicSyncStage>=${String(REQUESTS.perCall)})throw Error("periodic-sync-original-startup");
string encoded=EasyedaGeneratedInitialSyncProtocol.EncodePeriodic(id,${purpose}WorkerSession,phase,method,fields);int index=EasyedaGeneratedInitialSyncProtocol.PeriodicIndex(phase),expected=${purpose}PeriodicSyncStage<26?${purpose}PeriodicSyncStage:${purpose}PeriodicSyncStage-2;if(index!=expected)throw Error("periodic-sync-original-order");AssertLive();${purpose}PeriodicSyncStage++;SendMessage(id,encoded);}
public void Complete${name}PeriodicSync(){if(!(${born})||!${purpose}InitialSyncCompleted||${purpose}PeriodicSyncCalls>=${String(MAXIMUM)}||(${purpose}PeriodicSyncStage!=26&&${purpose}PeriodicSyncStage!=28))throw Error("periodic-sync-complete-original");AssertLive();${purpose}PeriodicSyncCalls++;${purpose}PeriodicSyncStage=0;}
`;
}
const psHelper = `function Invoke-OriginalPeriodicSync([bool]$via,[bool]$complete) {
  $flag=if($via){$PcbViaWrite209}else{$SchematicDisplayWrite209}
  if(-not $flag -or -not $launched){throw 'periodic-sync-owner'}
  if($complete){
    if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'periodic-sync-complete-fields'}
    if($via){$owner.CompleteViaPeriodicSync()}else{$owner.CompleteSchematicDisplayPeriodicSync()}
    return @{completed=$true}
  }
  if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'periodic-sync-fields'}
  $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
  foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'periodic-sync-field'}}
  foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
  if($via){$owner.SendViaPeriodicSync([int]$request.requestId,$request.phase,$request.method,$fields)}else{$owner.SendSchematicDisplayPeriodicSync([int]$request.requestId,$request.phase,$request.method,$fields)}
  return @{written=$true}
}
`;
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", via = purpose === "via" ? "$true" : "$false";
  return `        '${action}-periodic-sync' {
          $result=Invoke-OriginalPeriodicSync ${via} $false
        }
        '${action}-periodic-sync-complete' {
          $result=Invoke-OriginalPeriodicSync ${via} $true
        }
`;
}
export function applyCurrentGeneratedPeriodicSyncNativeFragment(input: string): string {
  let source = input;
  for (const purpose of ["via", "schematic"] as const) {
    const action = purpose === "via" ? "pcb-via" : "schematic-display", name = purpose === "via" ? "Via" : "SchematicDisplay";
    const anchor=`case "${action}-initial-sync":`; const after=`case "${action}-periodic-sync":case "${action}-periodic-sync-complete":${anchor}`;
    if (!source.includes(after)) { if (source.split(anchor).length !== 2) { throw new Error("PERIODIC_SYNC_ACTION_ANCHOR"); } source=source.replace(anchor,after); }
    const start=source.indexOf(`public void Enroll${name}ProducerPrefix(){`); const stop=source.indexOf("\n",start); const guard=`||!${purpose}InitialSyncCompleted||`, qualified=`||!${purpose}InitialSyncCompleted||${purpose}PeriodicSyncStage!=0||`;
    if(start===-1||stop<=start){throw new Error("PERIODIC_SYNC_PREFIX_ANCHOR");}const line=source.slice(start,stop);
    if(!line.includes(qualified)){if(line.split(guard).length!==2){throw new Error("PERIODIC_SYNC_PREFIX_GUARD");}source=source.slice(0,start)+line.replace(guard,qualified)+source.slice(stop);}
  }
  const sizeAnchor="      $initialSyncOpening=";
  const sizeLine="      $periodicSyncOpening=($PcbViaWrite209 -and $request.action -ceq 'pcb-via-periodic-sync' -or $SchematicDisplayWrite209 -and $request.action -ceq 'schematic-display-periodic-sync') -and $request.method -ceq 'Runtime.callFunctionOn' -and $request.phase -ceq 'periodic-sync-branch'\n";
  if(!source.includes(sizeLine)){if(source.split(sizeAnchor).length!==2){throw new Error("PERIODIC_SYNC_SIZE_ANCHOR");}source=source.replace(sizeAnchor,()=>sizeLine+sizeAnchor);}
  const newGuard="(-not $periodicSyncOpening -and -not $initialSyncOpening -and -not $initialCacheOpening -and", oldGuard="(-not $initialSyncOpening -and -not $initialCacheOpening -and";
  if(!source.includes(newGuard)){if(source.split(oldGuard).length!==2){throw new Error("PERIODIC_SYNC_SIZE_GUARD");}source=source.replace(oldGuard,newGuard);}
  const viaBefore='viaSdkStages[index]=true;SendMessage(id,message);'; const viaAfter=`if(stage=="create"&&viaPeriodicSyncStage!=0)throw Error("periodic-sync-create-held");${viaBefore}`;
  if(!source.includes(viaAfter)){if(source.split(viaBefore).length!==2){throw new Error("PERIODIC_SYNC_VIA_STAGE");}source=source.replace(viaBefore,viaAfter);}
  const schBefore='schematicDisplayStages[index]=true;SendMessage(id,message);'; const schAfter=`if(phase=="modify"&&schematicPeriodicSyncStage!=0)throw Error("periodic-sync-modify-held");${schBefore}`;
  if(!source.includes(schAfter)){if(source.split(schBefore).length!==2){throw new Error("PERIODIC_SYNC_SCH_STAGE");}source=source.replace(schBefore,schAfter);}
  if(!source.includes(psHelper)){const anchor="$owner=if (";if(source.split(anchor).length!==2||source.includes("function Invoke-OriginalPeriodicSync")){throw new Error("PERIODIC_SYNC_PS_HELPER");}source=source.replace(anchor,()=>psHelper+anchor);}
  source=installOwnedNativeDispatch(source,dispatch("via")+dispatch("schematic"),"        'pcb-via-initial-sync' {");
  source=installNativeCompileOnlyHook(source,"    [EasyedaGeneratedInitialSyncProtocol]::VerifyPeriodicSmoke()","    [EasyedaGeneratedInitialSyncProtocol]::VerifySmoke()");
  const body=`${begin}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}${owner("schematic")}\n}\n${end}`;
  const start=source.indexOf(begin); const stop=source.indexOf(end);
  if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("PERIODIC_SYNC_MARKERS");}return source.slice(0,start)+body+source.slice(stop+end.length);}
  const anchor="// END ORIGINAL GENERATED INITIAL SYNC";if(source.split(anchor).length!==2){throw new Error("PERIODIC_SYNC_BODY_ANCHOR");}return source.replace(anchor,`${anchor}\n${body}`);
}

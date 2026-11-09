/** The new ledger alone releases the original Canvas/UI Echo tails. Earlier
 * publication, Canvas and SDK ledgers retain their original closed gates. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicRelevanceModifyEchoGroupNativeSource } from "./current-schematic-relevance-modify-echo-native-group.ts";
import { currentSchematicRelevanceModifyEchoControlNativeSource } from "./current-schematic-relevance-modify-echo-control-native.ts";
import { currentSchematicRelevanceModifyCanvasSendNativeSource } from "./current-schematic-relevance-modify-canvas-send-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_LIFECYCLE_REQUESTS as LIMIT } from "./current-schematic-relevance-modify-echo-lifecycle-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES as UI, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_WORKER_ROLES as WORKER } from "./current-schematic-relevance-modify-echo-control-protocol.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC CANVAS ECHO", end = "// END ORIGINAL SCHEMATIC CANVAS ECHO";
const dispatch = String.raw`        'schematic-relevance-modify-echo' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-echo-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-echo-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0){throw 'schematic-echo-control'};$owner.ControlSchematicRelevanceModifyEcho($request.phase)}else{$owner.StepSchematicRelevanceModifyEcho([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
const quoted = (values: readonly string[]): string => values.map(value => `"${value}"`).join(",");
/** Keep the original source roles and their two fixed source profiles. The
 * canonical key omits only the profile digit, never a source coordinate. */
function arms(): readonly string[] {
  const all: string[] = [];
  for (const worker of [false, true]) {
    for (const role of FUNCTIONS.filter(value => value.startsWith("worker") === worker)) { all.push(`modify-echo-control-function-${role}`); }
    for (const role of RETURNS.filter(value => value.startsWith("worker") === worker)) { all.push(`modify-echo-control-possible-V-${role}`, `modify-echo-control-point-V-${role}`); }
  }
  return Object.freeze(all);
}
/** Repeated generation replaces only this owned fragment and exact dispatch.
 * Every encoded read still uses its immutable native book and old byte caps. */
export function applyCurrentSchematicRelevanceModifyEchoNativeFragment(input: string): string {
  const setup = arms();
  const block = `${begin}
${currentSchematicRelevanceModifyEchoGroupNativeSource()}
${currentSchematicRelevanceModifyEchoControlNativeSource()}
${currentSchematicRelevanceModifyCanvasSendNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
public static void VerifySchematicRelevanceModifyEchoCodecSmoke(){EasyedaSchematicRelevanceModifyEchoGroupProtocol.VerifySmoke();EasyedaSchematicRelevanceModifyEchoControlProtocol.VerifySmoke();EasyedaSchematicRelevanceModifyCanvasSendProtocol.VerifySmoke();}
bool eBound,ePrepared,ePrior,ePub,eTimer,eTimerProof,eTimerDone,eWorkerDone,eDone,eReadyW,eReadyU;int eArms,ePubRemoves,eCanvasRemoves,eWRemoves,eURemoves,eW,eU,eRU,eRW,ePU,ePW;System.Collections.Generic.HashSet<string> eRemoved=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
void AssertSchematicRelevanceModifyEcho(){AssertSchematicRelevanceModifyContinuation();if(!relevancePublicationLoopbackHeld||relevancePublicationStage!=6||relevancePublicationReturnStage!=4||relevanceModifyReturnStage!=17||!relevanceModifyStructureCompleted||relevanceModifyCanvasResumes<6||relevanceModifyCanvasResumes>8)throw Error("schematic-echo-original");}
public void ControlSchematicRelevanceModifyEcho(string phase){AssertSchematicRelevanceModifyEcho();if(phase=="bind"){if(eBound||eDone)throw Error("schematic-echo-bind-once");eBound=true;return;}if(!eBound||eDone)throw Error("schematic-echo-unbound");if(phase=="prepared"&&!ePrepared&&ePrior&&eArms==${String(setup.length)}&&eRU>0&&eRW>0){ePrepared=true;return;}if(phase=="publication-idle"&&ePub&&ePrepared&&!eTimer)return;if(phase=="worker-timer-ready"&&ePub&&ePrepared&&!eTimer&&eRW>ePW){ePW=eRW;eTimerProof=true;return;}if(phase=="worker-timer-returned-ready"&&eTimer&&eW==3&&!eTimerDone&&!eTimerProof&&eRW>ePW){ePW=eRW;eTimerProof=true;return;}if(phase=="worker-complete"&&eW==${String(WORKER.length)}&&eTimerDone&&!eWorkerDone&&eWRemoves==${String(WORKER.length)}){eWorkerDone=true;return;}if(phase=="complete"&&eWorkerDone&&eU==${String(UI.length)}&&eURemoves==${String(UI.length)}&&!eReadyU){eDone=true;return;}string[] w={${quoted(WORKER)}},u={${quoted(UI)}};if(eTimer&&eW<w.Length&&phase=="proof-"+w[eW]&&!eReadyW&&eRW>ePW){eReadyW=true;ePW=eRW;return;}if(eWorkerDone&&eU<u.Length&&phase=="proof-"+u[eU]&&!eReadyU&&eRU>ePU){eReadyU=true;ePU=eRU;return;}throw Error("schematic-echo-proof-order");}
public void StepSchematicRelevanceModifyEcho(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceModifyEcho();if(!eBound||eDone||phase==null)throw Error("schematic-echo-held");bool worker=phase.StartsWith("modify-canvas-send-",StringComparison.Ordinal)||phase.StartsWith("modify-canvas-control-",StringComparison.Ordinal)||phase.IndexOf("-worker",StringComparison.Ordinal)>=0;string session=worker?schematicWorkerSession:schematicDisplaySession,text;
if(phase.StartsWith("modify-echo-control-",StringComparison.Ordinal)){
 if(phase=="modify-echo-control-prior-remove-cmRemote"){if(ePrior||eArms!=0||ePub)throw Error("schematic-echo-prior-once");ePrior=true;}
 else if(phase.StartsWith("modify-echo-control-function-",StringComparison.Ordinal)||phase.StartsWith("modify-echo-control-possible-",StringComparison.Ordinal)||phase.StartsWith("modify-echo-control-point-",StringComparison.Ordinal)){string[] setup={${quoted(setup)}};if(!ePrior||ePrepared||ePub||eArms>=setup.Length||phase.Replace("-0-","-V-").Replace("-1-","-V-")!=setup[eArms])throw Error("schematic-echo-arm-order");eArms++;}
 else if(phase.StartsWith("modify-echo-control-publication-remove-",StringComparison.Ordinal)){if(!ePrepared||ePub||ePubRemoves>=6||!eRemoved.Add(phase))throw Error("schematic-echo-publication-removal");ePubRemoves++;}
 else if(phase=="modify-echo-control-publication-resume-publicationLoopbackReturned"){if(!ePrepared||ePub||ePubRemoves!=6)throw Error("schematic-echo-publication-once");ePub=true;}
 else if(phase.StartsWith("modify-echo-control-resume-",StringComparison.Ordinal)){string[] roles=worker?new string[]{${quoted(WORKER)}}:new string[]{${quoted(UI)}};int index=worker?eW:eU;bool ready=worker?eReadyW:eReadyU;if(!ePub||!ready||index>=roles.Length||phase!="modify-echo-control-resume-"+roles[index]||worker&&(index>=3&&!eTimerDone||index==4&&eWRemoves!=5)||!worker&&(!eWorkerDone||index==11&&eURemoves!=12))throw Error("schematic-echo-resume-order");if(worker){eW++;eReadyW=false;}else{eU++;eReadyU=false;}}
 else if(phase.StartsWith("modify-echo-control-remove-",StringComparison.Ordinal)){if(!ePub||!eRemoved.Add(phase)||worker&&(eW!=4||eWRemoves>=5)||!worker&&(eU!=11||eURemoves>=12))throw Error("schematic-echo-removal-order");if(worker)eWRemoves++;else eURemoves++;}
 else if(!phase.StartsWith("modify-echo-control-frame-",StringComparison.Ordinal)||!eTimer)throw Error("schematic-echo-closed-control");
 text=EasyedaSchematicRelevanceModifyEchoControlProtocol.Encode(id,session,phase,method,fields);
}else if(phase.StartsWith("modify-canvas-control-",StringComparison.Ordinal)){
 if(phase=="modify-canvas-control-resume-timer"){if(!ePrepared||!ePub||eTimer||!eTimerProof||relevanceModifyCanvasResumes!=6)throw Error("schematic-echo-timer-once");eTimer=true;eTimerProof=false;relevanceModifyCanvasResumes++;}
 else if(phase=="modify-canvas-control-resume-timerReturned"){if(!eTimer||eTimerDone||!eTimerProof||eW!=3||eCanvasRemoves!=8||relevanceModifyCanvasResumes!=7)throw Error("schematic-echo-timer-return-once");eTimerDone=true;eTimerProof=false;relevanceModifyCanvasResumes++;}
 else if(phase.StartsWith("modify-canvas-control-remove-",StringComparison.Ordinal)){if(!eTimerProof||eTimerDone||eW!=3||eCanvasRemoves>=8||!eRemoved.Add(phase))throw Error("schematic-echo-canvas-removal");eCanvasRemoves++;}
 else if(!(phase=="modify-canvas-control-frame-timer"||phase=="modify-canvas-control-frame-timerReturned"))throw Error("schematic-echo-canvas-tail");text=EasyedaSchematicRelevanceModifyCanvasControlProtocol.Encode(id,session,phase,method,fields);
}else{
 if(worker){if(eRW>=${String(LIMIT.workerReads)})throw Error("schematic-echo-worker-read-bound");eRW++;text=EasyedaSchematicRelevanceModifyCanvasSendProtocol.Encode(id,session,phase,method,fields);}
 else{if(eRU>=${String(LIMIT.uiReads)})throw Error("schematic-echo-ui-read-bound");eRU++;if(phase.StartsWith("publication-native-",StringComparison.Ordinal))text=EasyedaSchematicRelevancePublicationNativeProtocol.Encode(id,session,phase,method,fields);else if(phase.StartsWith("publication-control-",StringComparison.Ordinal)){if(!(phase=="publication-control-properties"||phase.StartsWith("publication-control-call-",StringComparison.Ordinal)))throw Error("schematic-echo-publication-readonly");text=EasyedaSchematicRelevancePublicationControlProtocol.Encode(id,session,phase,method,fields);}else text=EasyedaSchematicRelevanceModifyEchoGroupProtocol.Encode(id,session,phase,method,fields);}
}SendMessage(id,text);}
}
${end}`;
  let source = input; const admission = 'case "schematic-relevance-publication-return":'; if (!source.includes('case "schematic-relevance-modify-echo":')) { if (source.split(admission).length !== 2) { throw new Error("SCH_ECHO_ADMISSION"); } source = source.replace(admission, `case "schematic-relevance-modify-echo":${admission}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-publication-return' {"); const from = source.indexOf(begin), through = source.indexOf(end);
  if (from !== -1 || through !== -1) { if (from === -1 || through < from || source.includes(begin, from + begin.length) || source.includes(end, through + end.length)) { throw new Error("SCH_ECHO_MARKERS"); } return source.slice(0, from) + block + source.slice(through + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC UI PUBLICATION RETURN"; if (source.split(anchor).length !== 2) { throw new Error("SCH_ECHO_ANCHOR"); } return source.replace(anchor, `${block}\n${anchor}`);
}

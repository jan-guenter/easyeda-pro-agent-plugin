/** Original worker receive frontier. The first handler continuation stops at
 * the batch body; TEXT/CM, its timer and the Nd wave need separate grants. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicRelevanceModifyControlNativeSource } from "./current-schematic-relevance-modify-control-native.ts";
import { currentSchematicRelevanceModifyEventNativeSource } from "./current-schematic-relevance-modify-event-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_REQUESTS as CONTROL } from "./current-schematic-relevance-modify-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_REQUESTS as EVENT } from "./current-schematic-relevance-modify-event-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS as BODY } from "./current-schematic-relevance-modify-body-programs.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC MODIFY CONTINUATION", end = "// END ORIGINAL SCHEMATIC MODIFY CONTINUATION";
const dispatch = String.raw`        'schematic-relevance-modify-control' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-modify-control-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-modify-control-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0){throw 'schematic-modify-control-control'};$owner.ControlSchematicRelevanceModifyContinuation($request.phase)}else{$owner.StepSchematicRelevanceModifyContinuation([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
/** Install a separate own7 worker ledger with finite passive rows and one
 * original handler resume. No native JSON can release the batch body. */
export function applyCurrentSchematicRelevanceModifyContinuationNativeFragment(input: string): string {
  const block = `${begin}
${currentSchematicRelevanceModifyControlNativeSource()}
${currentSchematicRelevanceModifyEventNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
public static void VerifySchematicRelevanceModifyContinuationCodecSmoke(){EasyedaSchematicRelevanceModifyControlProtocol.VerifySmoke();EasyedaSchematicRelevanceModifyEventProtocol.VerifySmoke();}
bool relevanceModifyControlBound,relevanceModifyBodyPrepared,relevanceModifyReceiverArmed,relevanceModifyEventHeld,relevanceModifyHandlerReady,relevanceModifyBatchHeld;int relevanceModifyControlReads,relevanceModifyEventReads,relevanceModifyArms,relevanceModifyResumes;
void AssertSchematicRelevanceModifyContinuation(){AssertSchematicRelevanceModifyWorker();if(!relevanceModifyWorkerMetadataReady)throw Error("schematic-modify-control-original");}
public void ControlSchematicRelevanceModifyContinuation(string phase){AssertSchematicRelevanceModifyContinuation();if(phase=="bind"){if(relevanceModifyControlBound)throw Error("schematic-modify-control-bind-once");relevanceModifyControlBound=true;return;}if(!relevanceModifyControlBound||relevanceModifyBatchHeld)throw Error("schematic-modify-control-state");if(phase=="body-prepared"&&!relevanceModifyBodyPrepared&&relevanceModifyControlReads>0){relevanceModifyBodyPrepared=true;return;}if(phase=="receiver-armed"&&relevanceModifyBodyPrepared&&!relevanceModifyReceiverArmed&&relevanceModifyArms==6&&relevanceModifyResumes==0){relevanceModifyReceiverArmed=true;return;}if(phase=="event-held"&&relevanceModifyReceiverArmed&&!relevanceModifyEventHeld&&relevancePublicationStage==2&&relevanceModifyResumes==0&&relevanceModifyEventReads>0){relevanceModifyEventHeld=true;return;}if(phase=="handler-ready"&&relevanceModifyEventHeld&&!relevanceModifyHandlerReady&&relevanceModifyResumes==0){relevanceModifyHandlerReady=true;return;}if(phase=="batch-held"&&relevanceModifyResumes==1&&relevanceModifyEventHeld){relevanceModifyBatchHeld=true;return;}throw Error("schematic-modify-control-order");}
public void StepSchematicRelevanceModifyContinuation(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceModifyContinuation();if(!relevanceModifyControlBound||relevanceModifyBatchHeld||phase==null)throw Error("schematic-modify-control-unavailable");string text;if(phase.StartsWith("modify-event-",StringComparison.Ordinal)){if(!relevanceModifyReceiverArmed||relevancePublicationStage!=2||relevanceModifyResumes!=0||relevanceModifyEventReads>=${String(EVENT.reads + EVENT.reproofReads * 2)})throw Error("schematic-modify-event-bound");text=EasyedaSchematicRelevanceModifyEventProtocol.Encode(id,schematicWorkerSession,phase,method,fields);relevanceModifyEventReads++;}else{bool resume=phase=="modify-control-resume";if(resume){if(!relevanceModifyHandlerReady||relevanceModifyResumes!=0)throw Error("schematic-modify-batch-body-held");}else{if(relevanceModifyControlReads>=${String(CONTROL.cdpRequests + BODY.reads + BODY.reproofReads * 2)})throw Error("schematic-modify-control-read-bound");if(phase=="modify-control-remove")throw Error("schematic-modify-original-guards-retained");bool arm=phase.StartsWith("modify-control-possible-",StringComparison.Ordinal)||phase.StartsWith("modify-control-return-",StringComparison.Ordinal)||phase.StartsWith("modify-control-function-",StringComparison.Ordinal);if(arm){string[] expected={"modify-control-possible-handler","modify-control-return-handler","modify-control-possible-batch","modify-control-return-batch","modify-control-function-handler","modify-control-function-batch"};if(!relevanceModifyBodyPrepared||relevanceModifyReceiverArmed||relevanceModifyArms>=6||phase!=expected[relevanceModifyArms])throw Error("schematic-modify-control-arm-order");relevanceModifyArms++;}}text=EasyedaSchematicRelevanceModifyControlProtocol.Encode(id,schematicWorkerSession,phase,method,fields);if(resume){relevanceModifyHandlerReady=false;relevanceModifyResumes++;}else relevanceModifyControlReads++;}SendMessage(id,text);}
}
${end}`;
  let source = input; const admission = 'case "schematic-relevance-modify-worker":';
  if (!source.includes('case "schematic-relevance-modify-control":')) { if (source.split(admission).length !== 2) { throw new Error("SCH_MODIFY_CONTINUATION_ADMISSION"); } source = source.replace(admission, `case "schematic-relevance-modify-control":${admission}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-modify-worker' {"); const from = source.indexOf(begin), through = source.indexOf(end);
  if (from !== -1 || through !== -1) { if (from === -1 || through < from || source.includes(begin, from + begin.length) || source.includes(end, through + end.length)) { throw new Error("SCH_MODIFY_CONTINUATION_MARKERS"); } return source.slice(0, from) + block + source.slice(through + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC MODIFY WORKER"; if (source.split(anchor).length !== 2) { throw new Error("SCH_MODIFY_CONTINUATION_ANCHOR"); } return source.replace(anchor, `${block}\n${anchor}`);
}

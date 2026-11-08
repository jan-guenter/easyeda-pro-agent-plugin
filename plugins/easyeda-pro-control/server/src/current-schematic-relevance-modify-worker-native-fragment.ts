/** Original own7 worker metadata after the UI post hold. Completing this
 * ledger authorizes no worker callback, native send, clock or Save. */
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_REQUESTS as R} from "./current-schematic-relevance-modify-worker-protocol.ts";
import {currentSchematicRelevanceModifyWorkerSource} from "./current-schematic-relevance-modify-worker-native.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC MODIFY WORKER",end="// END ORIGINAL SCHEMATIC MODIFY WORKER";
const dispatch=String.raw`        'schematic-relevance-modify-worker' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-modify-worker-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-modify-worker-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0){throw 'schematic-modify-worker-control'};$owner.ControlSchematicRelevanceModifyWorker($request.phase)}else{$owner.StepSchematicRelevanceModifyWorker([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
/** Add the bounded worker-only metadata action to the fixed schematic helper. */
export function applyCurrentSchematicRelevanceModifyWorkerNativeFragment(input:string):string{
 const block=`${begin}
${currentSchematicRelevanceModifyWorkerSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceModifyWorkerBound,relevanceModifyWorkerMetadataReady;int relevanceModifyWorkerReads;
public static void VerifySchematicRelevanceModifyWorkerSmoke(){EasyedaSchematicRelevanceModifyWorkerProtocol.VerifySmoke();}
void AssertSchematicRelevanceModifyWorker(){AssertSchematicRelevancePublication();if(!relevancePublicationPostHeld||schematicWorkerSession==null)throw Error("schematic-modify-worker-original");}
public void ControlSchematicRelevanceModifyWorker(string phase){AssertSchematicRelevanceModifyWorker();if(phase=="bind"){if(relevanceModifyWorkerBound)throw Error("schematic-modify-worker-bind-once");relevanceModifyWorkerBound=true;return;}if(phase!="prepared"||!relevanceModifyWorkerBound||relevanceModifyWorkerMetadataReady||relevanceModifyWorkerReads<1)throw Error("schematic-modify-worker-control");relevanceModifyWorkerMetadataReady=true;}
public void StepSchematicRelevanceModifyWorker(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceModifyWorker();if(!relevanceModifyWorkerBound||relevanceModifyWorkerMetadataReady||relevanceModifyWorkerReads>=${String(R.reads)})throw Error("schematic-modify-worker-read-bound");string text=EasyedaSchematicRelevanceModifyWorkerProtocol.Encode(id,schematicWorkerSession,phase,method,fields);relevanceModifyWorkerReads++;SendMessage(id,text);}
}
${end}`;
 let source=input;const admission='case "schematic-relevance-publication":';if(!source.includes('case "schematic-relevance-modify-worker":')){if(source.split(admission).length!==2){throw new Error("SCH_MODIFY_WORKER_ADMISSION");}source=source.replace(admission,`case "schematic-relevance-modify-worker":${admission}`);}source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-publication' {");const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_MODIFY_WORKER_MARKERS");}return source.slice(0,from)+block+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC PUBLICATION";if(source.split(anchor).length!==2){throw new Error("SCH_MODIFY_WORKER_ANCHOR");}return source.replace(anchor,`${block}\n${anchor}`);
}

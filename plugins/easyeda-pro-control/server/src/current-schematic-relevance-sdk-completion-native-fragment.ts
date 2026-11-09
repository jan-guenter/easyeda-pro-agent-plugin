/** The old SDK gate remains closed. This separate ledger requires actual
 * completed Canvas/Echo accounting before its sole native resolver release. */
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_SDK_COMPLETION_REQUESTS as LIMIT} from "./current-schematic-relevance-sdk-completion-wire.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC SDK COMPLETION",end="// END ORIGINAL SCHEMATIC SDK COMPLETION";
const dispatch=String.raw`        'schematic-relevance-sdk-completion' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-sdk-completion-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-sdk-completion-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0){throw 'schematic-sdk-completion-control'};$owner.ControlSchematicRelevanceSdkCompletion($request.phase)}else{$owner.StepSchematicRelevanceSdkCompletion([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
/** Install only this purpose's separate terminal-wait ledger; shared fixed
 * SDK program bytes and every historical gate remain unchanged. */
export function applyCurrentSchematicRelevanceSdkCompletionNativeFragment(input:string):string{
 const block=`${begin}
public sealed partial class EasyedaDiagnosticOwner{
bool eSdkBound,eSdkPrepared,eSdkReleased,eSdkCompleted,eSdkAcknowledged;int eSdkBefore,eSdkAfter;
void AssertSchematicRelevanceSdkCompletion(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!eDone||!eWorkerDone||eW!=5||eU!=12||relevanceModifyCanvasResumes!=8||!relevanceModifyStructureCompleted||schematicDisplayStages[6])throw Error("schematic-sdk-completion-original");AssertLive();if(!eSdkReleased)AssertSchematicRelevanceModifyEcho();}
public void ControlSchematicRelevanceSdkCompletion(string phase){AssertSchematicRelevanceSdkCompletion();if(phase=="bind"&&!eSdkBound){eSdkBound=true;return;}if(phase=="acknowledged"&&eSdkBound&&eSdkCompleted&&!eSdkAcknowledged&&!schematicDisplayStages[4]){eSdkAcknowledged=true;schematicDisplayStages[4]=true;return;}if(!eSdkBound||eSdkCompleted)throw Error("schematic-sdk-completion-state");if(phase=="prepared"&&!eSdkPrepared&&!eSdkReleased&&eSdkBefore>0){eSdkPrepared=true;return;}if(phase=="completed"&&eSdkReleased&&eSdkAfter>0){eSdkCompleted=true;return;}throw Error("schematic-sdk-completion-control-order");}
public void StepSchematicRelevanceSdkCompletion(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceSdkCompletion();if(!eSdkBound||eSdkCompleted||phase==null)throw Error("schematic-sdk-completion-unbound");bool release=phase=="sdk-release";if(release){if(!eSdkPrepared||eSdkReleased)throw Error("schematic-sdk-completion-release-once");}else{string[] allowed={"sdk-properties","sdk-call-hooks","sdk-call-reflection-reprove","sdk-call-native-defaultInstance","sdk-call-native-hooks","sdk-call-run","sdk-call-native","sdk-call-context-same","sdk-call-wait"};if(Array.IndexOf(allowed,phase)<0||(eSdkReleased?eSdkAfter>=${String(LIMIT.afterReads)}:eSdkBefore>=${String(LIMIT.beforeReads)}))throw Error("schematic-sdk-completion-read-bound");}string text=EasyedaSchematicRelevanceNormalCommandUiProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(release)eSdkReleased=true;else if(eSdkReleased)eSdkAfter++;else eSdkBefore++;SendMessage(id,text);}
}
${end}`;
 let source=input;const admission='case "schematic-relevance-modify-echo":';if(!source.includes('case "schematic-relevance-sdk-completion":')){if(source.split(admission).length!==2){throw new Error("SCH_SDK_COMPLETION_ADMISSION");}source=source.replace(admission,`case "schematic-relevance-sdk-completion":${admission}`);}source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-modify-echo' {");const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_SDK_COMPLETION_MARKERS");}return source.slice(0,from)+block+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC CANVAS ECHO";if(source.split(anchor).length!==2){throw new Error("SCH_SDK_COMPLETION_ANCHOR");}return source.replace(anchor,`${block}\n${anchor}`);
}

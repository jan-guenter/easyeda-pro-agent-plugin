/** Original seven-record source reads, with no timer or continuation grammar. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS as LIMIT } from "./current-schematic-relevance-display-helper-source-catalogue.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin="// BEGIN ORIGINAL RELEVANCE OBSERVED SOURCES",end="// END ORIGINAL RELEVANCE OBSERVED SOURCES";
const native=`public sealed partial class EasyedaDiagnosticOwner {
readonly System.Collections.Generic.HashSet<string> relevanceObservedSourceScripts=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
public void SendRelevanceObservedSource(int id,string script){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||schematicWorkerStage!=7||schematicWorkerSession==null||!schematicWorkerParentRunning||schematicProducerObserveArms.Count!=27||script==schematicWorkerProjectScript||relevanceObservedSourceScripts.Count>=${String(LIMIT)})throw Error("relevance-observed-source-original");string encoded=EasyedaPcbViaObservedSourceProtocol.Encode(id,schematicWorkerSession,script);AssertLive();if(!relevanceObservedSourceScripts.Add(script))throw Error("relevance-observed-source-once");SendMessage(id,encoded);}
}
`;
const dispatch=String.raw`        'schematic-relevance-display-observed-source' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.scriptId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,scriptId'){throw 'relevance-observed-source-fields'}
          $owner.SendRelevanceObservedSource([int]$request.requestId,$request.scriptId);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayObservedSourceNativeFragment(input:string):string{
 let source=input;const anchor='case "schematic-relevance-display-main-observe":';const action='case "schematic-relevance-display-observed-source":';if(!source.includes(action)){if(source.split(anchor).length!==2){throw new Error("RELEVANCE_OBSERVED_SOURCE_ACTION_ANCHOR");}source=source.replace(anchor,action+anchor);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-display-main-observe' {");
 const value=`${begin}\n${native}${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("RELEVANCE_OBSERVED_SOURCE_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}
 const body="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(body).length!==2){throw new Error("RELEVANCE_OBSERVED_SOURCE_BODY_ANCHOR");}return source.replace(body,`${value}\n${body}`);
}

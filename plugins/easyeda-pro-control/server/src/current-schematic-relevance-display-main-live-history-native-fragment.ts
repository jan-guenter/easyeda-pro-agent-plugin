/** Own7 counters and sender over the unchanged readonly Main row encoder. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";

const begin="// BEGIN ORIGINAL RELEVANCE MAIN LIVE HISTORY",end="// END ORIGINAL RELEVANCE MAIN LIVE HISTORY";
const native=`public sealed partial class EasyedaDiagnosticOwner {
int relevanceLiveHistoryStep,relevanceLiveHistoryNormal,relevanceLiveHistoryCleanup;
public void SendRelevanceMainLiveHistory(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||originalMain==null||!relevanceSaveGenerated||!relevanceSaveBodyEnrolled||relevanceHistoryStep!=20)throw Error("relevance-live-history-original");MainPurpose();AssertLive();string[] steps={"via-main-live-arm","via-main-live-frame","via-main-live-join-capture","via-main-live-properties-packet","via-main-live-properties-promise","via-main-live-join-resolved","via-main-live-properties-projectSql","via-main-live-properties-table","via-main-live-properties-branches","via-main-live-join-value","via-main-live-remove","via-main-live-step","via-main-live-release"};if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)}||relevanceLiveHistoryStep>=steps.Length||phase!=steps[relevanceLiveHistoryStep])throw Error("relevance-live-history-order");string encoded=EasyedaPcbViaMainLiveHistoryProtocol.Encode(id,phase,method,fields);bool cleanup=phase=="via-main-live-remove"||phase=="via-main-live-release";if(cleanup?relevanceLiveHistoryCleanup>=2:relevanceLiveHistoryNormal>=11)throw Error("relevance-live-history-budget");relevanceLiveHistoryStep++;if(cleanup)relevanceLiveHistoryCleanup++;else relevanceLiveHistoryNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
}
`;
const dispatch=String.raw`        'schematic-relevance-display-main-live-history' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'relevance-live-history-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'relevance-live-history-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevanceMainLiveHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayMainLiveHistoryNativeFragment(input:string):string{
 let source=input;const anchor='case "schematic-relevance-display-main-observe":';const action='case "schematic-relevance-display-main-live-history":';if(!source.includes(action)){if(source.split(anchor).length!==2){throw new Error("RELEVANCE_LIVE_HISTORY_ACTION_ANCHOR");}source=source.replace(anchor,action+anchor);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-display-main-observe' {");
 const value=`${begin}\n${native}${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("RELEVANCE_LIVE_HISTORY_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}
 const body="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(body).length!==2){throw new Error("RELEVANCE_LIVE_HISTORY_BODY_ANCHOR");}return source.replace(body,`${value}\n${body}`);
}

import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as ACTION } from "./current-schematic-display-action-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as REQUESTS } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
/** Once-only request generation remains held before the original action start. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeSource } from "./current-schematic-relevance-display-modify-entry-native.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE MODIFY ENTRY", end = "// END ORIGINAL RELEVANCE MODIFY ENTRY";
function native(): string { return `${begin}
${currentSchematicRelevanceDisplayModifyEntryNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string relevanceModifyIdle;bool relevanceModifyGenerated;int relevanceModifyEntryRequests;
public void BindRelevanceModifyGeneration(string idle){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceModifyIdle!=null||relevanceActionGuardScript==null||relevanceActionGuardAttempts.Count!=3||!relevanceActionGuardAttempts.Contains("run")||!relevanceActionGuardAttempts.Contains("x")||!relevanceActionGuardAttempts.Contains("y")||relevanceActionNormal!=${String(ACTION.normal)}||relevanceActionCleanup!=0||!relevanceAccessorCompleted||relevanceAccessorCleanup!=0||!schematicProducerPrefixEnrolled||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6]||idle==null||!System.Text.RegularExpressions.Regex.IsMatch(idle,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-modify-generation-bind");AssertLive();relevanceModifyIdle=idle;}
public void GenerateRelevanceModify(int id){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceModifyIdle==null||relevanceModifyGenerated||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-modify-generation-once");AssertLive();var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);fields.Add("objectId",schematicDisplayTuple);fields.Add("targetJson",schematicDisplayTarget);fields.Add("operationJson",schematicDisplayOperation);string message=SchematicRelevanceDisplayProtocolMessage(id,schematicDisplaySession,"modify",fields);relevanceModifyGenerated=true;SendMessage(id,message);}
public void ObserveRelevanceModifyEntry(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceModifyGenerated||relevanceModifyIdle==null||relevanceModifyEntryRequests>=${String(REQUESTS.observation + REQUESTS.rawObservation + REQUESTS.underlineEligibility)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-modify-entry-owner");AssertLive();string message=EasyedaSchematicRelevanceDisplayModifyEntryProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,relevanceModifyIdle,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);relevanceModifyEntryRequests++;SendMessage(id,message);}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-display-modify-bind' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.idle -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,idle,jobId,rootCreated,rootPid') {throw 'schematic-modify-bind-fields'}
          $owner.BindRelevanceModifyGeneration($request.idle);$result=@{bound=$true}
        }
        'schematic-relevance-display-modify-generate' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid') {throw 'schematic-modify-generate-fields'}
          $owner.GenerateRelevanceModify([int]$request.requestId);$result=@{written=$true}
        }
        'schematic-relevance-display-modify-entry' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-modify-entry-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'schematic-modify-entry-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.ObserveRelevanceModifyEntry([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayModifyEntryNativeFragment(input: string): string {
  let source = input; const actions = 'case "schematic-relevance-display-modify-bind":case "schematic-relevance-display-modify-generate":case "schematic-relevance-display-modify-entry":', previous = 'case "schematic-relevance-display-producer-prefix-enroll":';
  if (!source.includes(actions)) { if (source.split(previous).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ACTIONS"); } source = source.replace(previous, `${actions}${previous}`); }
  else if (source.split(actions).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ACTIONS_DUPLICATE"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-producer-prefix-enroll' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceDisplayModifyEntryProtocol]::VerifySmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicActionGuardSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_MODIFY_ENTRY_MARKERS"); } return source.slice(0, start) + native() + source.slice(stop + end.length); }
  const anchor = "// BEGIN ORIGINAL RELEVANCE DISPLAY ACTION METADATA"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ANCHOR"); } return source.replace(anchor, `${native()}\n${anchor}`);
}

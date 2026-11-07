import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as ACTION } from "./current-schematic-display-action-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_REQUESTS as CALLBACK, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as REQUESTS } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
/** Once-only request generation remains held before the original action start. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeSource } from "./current-schematic-relevance-display-modify-entry-native.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE MODIFY ENTRY", end = "// END ORIGINAL RELEVANCE MODIFY ENTRY";
function native(): string { return `${begin}
${currentSchematicRelevanceDisplayModifyEntryNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string relevanceModifyIdle;bool relevanceModifyGenerated;int relevanceModifyEntryRequests;
bool relevanceCallbackBound,relevanceCallbackEntryReady,relevanceCallbackEntryResumed,relevanceCallbackBridgeReady,relevanceCallbackSetterResumed;int relevanceCallbackReads;readonly System.Collections.Generic.Dictionary<string,string> relevanceCallbackFunctions=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);readonly System.Collections.Generic.HashSet<string> relevanceCallbackArms=new System.Collections.Generic.HashSet<string>(System.StringComparer.Ordinal);
public void BindRelevanceActionCallback(string setAttribute,string record,string ast){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceModifyGenerated||!relevanceAccessorCompleted||!relevanceRunPrefixCompleted||relevanceCallbackBound||relevanceModifyEntryRequests!=${String(REQUESTS.observation+REQUESTS.rawObservation+REQUESTS.underlineEligibility)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-callback-original-bind");var values=new[]{setAttribute,record,ast};foreach(string value in values)if(value==null||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-callback-original-function");if(setAttribute==record||setAttribute==ast||record==ast)throw Error("schematic-callback-distinct-functions");AssertLive();relevanceCallbackBound=true;relevanceCallbackFunctions.Add("setAttribute",setAttribute);relevanceCallbackFunctions.Add("record",record);relevanceCallbackFunctions.Add("ast",ast);}

public void ReadyRelevanceCallbackEntry(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceCallbackBound||relevanceCallbackEntryReady||relevanceCallbackEntryResumed||relevanceCallbackArms.Count!=${String(CALLBACK.arms)}||relevanceCallbackReads!=${String(CALLBACK.arms+CALLBACK.entry)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-callback-original-entry-ready");AssertLive();relevanceCallbackEntryReady=true;}
public void ReadyRelevanceCallbackBridge(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceCallbackBound||!relevanceCallbackEntryResumed||relevanceCallbackBridgeReady||relevanceCallbackSetterResumed||relevanceCallbackReads!=${String(CALLBACK.arms+CALLBACK.entry+1+CALLBACK.setter+CALLBACK.bridge)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-callback-original-bridge-ready");AssertLive();relevanceCallbackBridgeReady=true;}
public void BindRelevanceModifyGeneration(string idle){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceModifyIdle!=null||relevanceActionGuardScript==null||relevanceActionGuardAttempts.Count!=3||!relevanceActionGuardAttempts.Contains("run")||!relevanceActionGuardAttempts.Contains("x")||!relevanceActionGuardAttempts.Contains("y")||relevanceActionNormal!=${String(ACTION.normal)}||relevanceActionCleanup!=0||!relevanceAccessorCompleted||relevanceAccessorCleanup!=0||!schematicProducerPrefixEnrolled||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6]||idle==null||!System.Text.RegularExpressions.Regex.IsMatch(idle,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-modify-generation-bind");AssertLive();relevanceModifyIdle=idle;}
public void GenerateRelevanceModify(int id){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceModifyIdle==null||relevanceModifyGenerated||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-modify-generation-once");AssertLive();var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);fields.Add("objectId",schematicDisplayTuple);fields.Add("targetJson",schematicDisplayTarget);fields.Add("operationJson",schematicDisplayOperation);string message=SchematicRelevanceDisplayProtocolMessage(id,schematicDisplaySession,"modify",fields);relevanceModifyGenerated=true;SendMessage(id,message);}
public void ObserveRelevanceModifyEntry(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceModifyGenerated||relevanceModifyIdle==null||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-modify-entry-owner");bool callback=phase!=null&&phase.StartsWith("schematic-callback-",System.StringComparison.Ordinal);if(callback){if(!relevanceCallbackBound||relevanceCallbackReads>=${String(CALLBACK.arms+CALLBACK.entry+CALLBACK.receiver+CALLBACK.resumes+CALLBACK.setter+CALLBACK.bridge+CALLBACK.activeHistory)})throw Error("schematic-callback-original-budget");if(phase=="schematic-callback-entry-resume"&&(!relevanceCallbackEntryReady||relevanceCallbackEntryResumed))throw Error("schematic-callback-original-entry-resume");if(phase=="schematic-callback-setter-resume"&&(!relevanceCallbackBridgeReady||relevanceCallbackSetterResumed))throw Error("schematic-callback-original-setter-resume");if(phase.StartsWith("schematic-callback-arm-",System.StringComparison.Ordinal)){string role=phase.Substring("schematic-callback-arm-".Length);if(!relevanceCallbackFunctions.ContainsKey(role)||relevanceCallbackArms.Contains(role)||fields==null||!fields.Contains("objectId")||!(fields["objectId"] is string)||(string)fields["objectId"]!=relevanceCallbackFunctions[role])throw Error("schematic-callback-original-arm");}else if(relevanceCallbackArms.Count!=${String(CALLBACK.arms)})throw Error("schematic-callback-original-arms-required");}else if(relevanceModifyEntryRequests>=${String(REQUESTS.observation+REQUESTS.rawObservation+REQUESTS.underlineEligibility)})throw Error("schematic-modify-entry-budget");AssertLive();string message=EasyedaSchematicRelevanceDisplayModifyEntryProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,relevanceModifyIdle,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(callback){relevanceCallbackReads++;if(phase=="schematic-callback-entry-resume")relevanceCallbackEntryResumed=true;if(phase=="schematic-callback-setter-resume")relevanceCallbackSetterResumed=true;if(phase.StartsWith("schematic-callback-arm-",System.StringComparison.Ordinal))relevanceCallbackArms.Add(phase.Substring("schematic-callback-arm-".Length));}else relevanceModifyEntryRequests++;SendMessage(id,message);}
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
const callbackDispatch = String.raw`        'schematic-relevance-display-callback-bind' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.setAttribute -isnot [string] -or $request.record -isnot [string] -or $request.ast -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,ast,helperInstance,id,jobId,record,rootCreated,rootPid,setAttribute'){throw 'schematic-callback-bind-fields'}
          $owner.BindRelevanceActionCallback($request.setAttribute,$request.record,$request.ast);$result=@{bound=$true}
        }
`;
const entryReadyDispatch = String.raw`        'schematic-relevance-display-callback-entry-ready' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'schematic-callback-entry-ready-fields'}
          $owner.ReadyRelevanceCallbackEntry();$result=@{ready=$true}
        }
`;
const bridgeReadyDispatch = String.raw`        'schematic-relevance-display-callback-bridge-ready' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'schematic-callback-bridge-ready-fields'}
          $owner.ReadyRelevanceCallbackBridge();$result=@{ready=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayModifyEntryNativeFragment(input: string): string {
  let source = input; const actions = 'case "schematic-relevance-display-modify-bind":case "schematic-relevance-display-modify-generate":case "schematic-relevance-display-modify-entry":', previous = 'case "schematic-relevance-display-producer-prefix-enroll":';
  if (!source.includes(actions)) { if (source.split(previous).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ACTIONS"); } source = source.replace(previous, `${actions}${previous}`); }
  else if (source.split(actions).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ACTIONS_DUPLICATE"); }
  const callbackAction = 'case "schematic-relevance-display-callback-bind":';
  if (!source.includes(callbackAction)) { if (source.split(actions).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_ADMISSION_ANCHOR"); } source = source.replace(actions, `${callbackAction}${actions}`); }
  else if (source.split(callbackAction).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_ADMISSION_DUPLICATE"); }
  const readyAction = 'case "schematic-relevance-display-callback-entry-ready":';
  if (!source.includes(readyAction)) { if (source.split(callbackAction).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_READY_ADMISSION_ANCHOR"); } source = source.replace(callbackAction, `${readyAction}${callbackAction}`); }
  else if (source.split(readyAction).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_READY_ADMISSION_DUPLICATE"); }
  const bridgeAction = 'case "schematic-relevance-display-callback-bridge-ready":';
  if (!source.includes(bridgeAction)) { if (source.split(readyAction).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_BRIDGE_ADMISSION_ANCHOR"); } source = source.replace(readyAction, `${bridgeAction}${readyAction}`); }
  else if (source.split(bridgeAction).length !== 2) { throw new Error("SCHEMATIC_CALLBACK_BRIDGE_ADMISSION_DUPLICATE"); }
  // Keep the separately owned action block intact on a second complete pass.
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-accessor-complete' {");
  source = installOwnedNativeDispatch(source, callbackDispatch, "        'schematic-relevance-display-modify-bind' {");
  source = installOwnedNativeDispatch(source, entryReadyDispatch, "        'schematic-relevance-display-callback-bind' {");
  source = installOwnedNativeDispatch(source, bridgeReadyDispatch, "        'schematic-relevance-display-callback-entry-ready' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceDisplayModifyEntryProtocol]::VerifySmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicActionGuardSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_MODIFY_ENTRY_MARKERS"); } return source.slice(0, start) + native() + source.slice(stop + end.length); }
  const anchor = "// BEGIN ORIGINAL RELEVANCE DISPLAY ACTION METADATA"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ANCHOR"); } return source.replace(anchor, `${native()}\n${anchor}`);
}

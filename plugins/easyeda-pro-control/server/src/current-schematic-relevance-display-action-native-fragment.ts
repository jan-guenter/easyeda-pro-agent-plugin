/** Distinct Relevance read/guard senders. Fixed source encoders are shared;
 * original native purpose, counters and source binding remain separate. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACCESSOR_REQUESTS as ACCESSOR } from "./current-schematic-relevance-display-accessor-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as ACTION } from "./current-schematic-display-action-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS as PRODUCER_GUARDS } from "./current-project-save-producer-guard-protocol.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE DISPLAY ACTION METADATA", end = "// END ORIGINAL RELEVANCE DISPLAY ACTION METADATA";
const actions = ["schematic-relevance-display-accessor-complete", "schematic-relevance-display-producer-prefix-enroll", "schematic-relevance-display-accessor", "schematic-relevance-display-action", "schematic-relevance-display-action-guard-bind", "schematic-relevance-display-action-guard"] as const;
function native(): string { return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
bool relevanceAccessorCompleted;int relevanceAccessorNormal,relevanceAccessorCleanup,relevanceActionNormal,relevanceActionCleanup;string relevanceActionGuardScript;int relevanceActionGuardVariant;readonly System.Collections.Generic.HashSet<string> relevanceActionGuardAttempts=new System.Collections.Generic.HashSet<string>();
public void EnrollRelevanceDisplayProducerPrefix(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||schematicProducerPrefixEnrolled||schematicWorkerSession==null||schematicWorkerStage!=7||!schematicStructureBootstrapResumed||!schematicProducerModeRequested||schematicProducerGuards.Count!=${String(PRODUCER_GUARDS.normal)}||!schematicDisplayStages[2]||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("relevance-producer-prefix-original-enrollment");AssertLive();schematicProducerPrefixEnrolled=true;}
public void SendRelevanceDisplayAccessor(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("relevance-accessor-original-holder");bool cleanup=phase=="schematic-accessor-release";if(cleanup?relevanceAccessorCleanup>=${String(ACCESSOR.cleanup)}:relevanceAccessorNormal>=${String(ACCESSOR.normal)})throw Error("relevance-accessor-budget");string message=EasyedaSchematicDisplayAccessorProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)relevanceAccessorCleanup++;else relevanceAccessorNormal++;SendMessage(id,message);}
public void CompleteRelevanceDisplayAccessor(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceAccessorCompleted||relevanceAccessorNormal<29||relevanceAccessorNormal>${String(ACCESSOR.normal)}||relevanceAccessorCleanup!=0||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("relevance-accessor-original-completion");AssertLive();relevanceAccessorCompleted=true;}
public void SendRelevanceDisplayAction(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicProducerPrefixEnrolled||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("relevance-action-original-holder");bool cleanup=phase=="schematic-action-release";if(cleanup?relevanceActionCleanup>=${String(ACTION.cleanup)}:relevanceActionNormal>=${String(ACTION.normal)})throw Error("relevance-action-budget");string message=EasyedaSchematicDisplayActionProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)relevanceActionCleanup++;else relevanceActionNormal++;SendMessage(id,message);}
public void BindRelevanceActionGuard(string script,int variant){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicProducerPrefixEnrolled||relevanceActionGuardScript!=null||relevanceActionNormal!=${String(ACTION.normal)}||relevanceActionCleanup!=0||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6]||script==null||!System.Text.RegularExpressions.Regex.IsMatch(script,@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||variant<0||variant>1)throw Error("relevance-action-guard-bind");AssertLive();relevanceActionGuardScript=script;relevanceActionGuardVariant=variant;}
public void ArmRelevanceActionGuard(int id,string role){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceActionGuardScript==null||schematicDisplayStages[4]||schematicDisplayStages[6]||relevanceActionGuardAttempts.Count>=3||relevanceActionGuardAttempts.Contains(role))throw Error("relevance-action-guard-original");string message=SchematicActionGuardMessage(id,schematicDisplaySession,relevanceActionGuardScript,relevanceActionGuardVariant,role);AssertLive();relevanceActionGuardAttempts.Add(role);SendMessage(id,message);}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-display-accessor-complete' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'relevance-accessor-complete-fields'}
          $owner.CompleteRelevanceDisplayAccessor();$result=@{completed=$true}
        }
        'schematic-relevance-display-producer-prefix-enroll' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'relevance-producer-prefix-fields'}
          $owner.EnrollRelevanceDisplayProducerPrefix();$result=@{enrolled=$true}
        }
        'schematic-relevance-display-accessor' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'relevance-accessor-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'relevance-accessor-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevanceDisplayAccessor([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'schematic-relevance-display-action' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'relevance-action-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'relevance-action-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevanceDisplayAction([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'schematic-relevance-display-action-guard-bind' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.scriptId -isnot [string] -or ($request.variant -isnot [int] -and $request.variant -isnot [long]) -or $request.variant -lt 0 -or $request.variant -gt 1 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,variant') {throw 'relevance-action-guard-bind-fields'}
          $owner.BindRelevanceActionGuard($request.scriptId,[int]$request.variant);$result=@{bound=$true}
        }
        'schematic-relevance-display-action-guard' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.role -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,role,rootCreated,rootPid') {throw 'relevance-action-guard-fields'}
          $owner.ArmRelevanceActionGuard([int]$request.requestId,$request.role);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayActionNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaSchematicDisplayAccessorProtocol") || !input.includes("public static class EasyedaSchematicDisplayActionProtocol")) { throw new Error("RELEVANCE_ACTION_SHARED_FIXED_ENCODERS_REQUIRED"); }
  let source = input; const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", encoder = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(encoder).length !== 2) { throw new Error("RELEVANCE_ACTION_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(encoder, from); if (to < from) { throw new Error("RELEVANCE_ACTION_ADMISSION_ORDER"); }
  const body = source.slice(from, to), cases = actions.map(action => `case "${action}":`).join("");
  if (!body.includes(cases) && actions.some(action => body.includes(`case "${action}":`))) { throw new Error("RELEVANCE_ACTION_PARTIAL_ADMISSION"); }
  if (!body.includes(cases)) { if (body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_ACTION_ADMISSION_ANCHOR"); } source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to); }
  else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_ACTION_ADMISSION_DUPLICATE"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("RELEVANCE_ACTION_NATIVE_MARKERS"); } return source.slice(0, start) + native() + source.slice(stop + end.length); }
  const anchor = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209"; if (source.split(anchor).length !== 2) { throw new Error("RELEVANCE_ACTION_NATIVE_ANCHOR"); } return source.replace(anchor, `${native()}\n${anchor}`);
}

/** Original seven-record polling cancellation. Shared stateless bytes do not
 * transfer the Via/inverse owner, intent, step counter or completion latch. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE POLLING QUIESCE", end = "// END ORIGINAL RELEVANCE POLLING QUIESCE";
function native(): string { return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
string relevancePollingContext;int relevancePollingStep;bool relevancePollingCancelAttempted,relevancePollingQuiesced,relevanceLibraryQuiesced;
public void BindRelevancePolling(string context){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevancePollingContext!=null||schematicWorkerSession==null||schematicWorkerStage!=6||!schematicWorkerSourceRead||schematicDisplayStages[2]||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("relevance-polling-original-binding");AssertLive();relevancePollingContext=context;}
public void SendRelevancePolling(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevancePollingContext==null||relevancePollingQuiesced||schematicDisplayStages[2]||relevancePollingStep>=28||phase!=EasyedaProjectSyncQuiesceProtocol.Phase(relevancePollingStep))throw Error("relevance-polling-original-sequence");if(relevancePollingStep<17){if(schematicWorkerStage!=6||!schematicWorkerSourceRead)throw Error("relevance-polling-original-source-held");if(phase.StartsWith("sync-quiesce-arm-",StringComparison.Ordinal)&&fields["scriptId"] as string!=schematicWorkerProjectScript)throw Error("relevance-polling-original-script");}else if(schematicWorkerStage!=7||!schematicStructureBootstrapResumed||!schematicProducerModeRequested)throw Error("relevance-polling-original-construction");string message=EasyedaProjectSyncQuiesceProtocol.Encode(id,schematicWorkerSession,relevancePollingContext,phase,method,fields);AssertLive();if(phase=="sync-quiesce-cancel"){if(relevancePollingCancelAttempted)throw Error("relevance-polling-original-cancel-once");relevancePollingCancelAttempted=true;}relevancePollingStep++;SendMessage(id,message);}
public void CompleteRelevancePolling(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevancePollingQuiesced||!relevancePollingCancelAttempted||relevancePollingStep!=28)throw Error("relevance-polling-original-completion");AssertLive();relevancePollingQuiesced=true;}
void AssertRelevanceStartupQuiesced(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevancePollingQuiesced||!relevanceLibraryQuiesced)throw Error("relevance-original-startup-controls-required");}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-display-sync-quiesce-bind' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.context -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,context,helperInstance,id,jobId,rootCreated,rootPid'){throw 'relevance-polling-bind-fields'}
          $owner.BindRelevancePolling($request.context);$result=@{bound=$true}
        }
        'schematic-relevance-display-sync-quiesce-complete' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'relevance-polling-complete-fields'}
          $owner.CompleteRelevancePolling();$result=@{completed=$true}
        }
        'schematic-relevance-display-sync-quiesce' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'relevance-polling-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'relevance-polling-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevancePolling([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplaySyncQuiesceNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaProjectSyncQuiesceProtocol")) { throw new Error("RELEVANCE_POLLING_FIXED_PROTOCOL_REQUIRED"); }
  let source = input;
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", encoder = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(encoder).length !== 2) { throw new Error("RELEVANCE_POLLING_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(encoder, from); if (to < from) { throw new Error("RELEVANCE_POLLING_ADMISSION_ORDER"); }
  const body = source.slice(from, to); const cases = 'case "schematic-relevance-display-sync-quiesce-bind":case "schematic-relevance-display-sync-quiesce-complete":case "schematic-relevance-display-sync-quiesce":';
  if (!body.includes(cases)) {
    if (body.includes('case "schematic-relevance-display-sync-quiesce') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_POLLING_PARTIAL_ADMISSION"); }
    source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to);
  } else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_POLLING_DUPLICATE_ADMISSION"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const finish = source.indexOf(end), start = source.indexOf(begin);
  if (start !== -1 || finish !== -1) {
    if (start === -1 || finish < start || source.includes(begin, start + begin.length) || source.includes(end, finish + end.length)) { throw new Error("RELEVANCE_POLLING_NATIVE_MARKERS"); }
    return source.slice(0, start) + native() + source.slice(finish + end.length);
  }
  const anchor = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209";
  if (source.split(anchor).length !== 2) { throw new Error("RELEVANCE_POLLING_NATIVE_ANCHOR"); }
  return source.replace(anchor, `${native()}\n${anchor}`);
}

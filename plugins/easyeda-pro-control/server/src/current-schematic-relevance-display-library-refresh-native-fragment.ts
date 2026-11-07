/** Purpose-owned library refresh state. The shared codebook contains only
 * immutable syntax; this original worker retains every step and spent effect. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { applyCurrentProjectLibraryRefreshNativeFragment } from "./current-project-library-refresh-native.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as REQUESTS } from "./current-project-library-refresh-protocol.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE LIBRARY REFRESH", end = "// END ORIGINAL RELEVANCE LIBRARY REFRESH";
function native(): string { return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
string relevanceLibraryContext;int relevanceLibraryStep,relevanceLibraryHelpers,relevanceLibraryHolds;string relevanceLibraryHeld;bool relevanceLibrarySuspended,relevanceLibraryCancelled;
public void BindRelevanceLibrary(string context){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceLibraryContext!=null||schematicWorkerSession==null||schematicWorkerStage!=6||!schematicWorkerSourceRead||schematicDisplayStages[2]||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("relevance-library-original-binding");AssertLive();relevanceLibraryContext=context;}
public void HoldRelevanceLibrary(string role){int expected=-1;if(role=="firstLoop")expected=9;else if(role=="loopReturned")expected=32;else if(role=="mountReturned")expected=38;if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceLibraryContext==null||relevanceLibraryQuiesced||relevanceLibraryHeld!=null||schematicWorkerStage!=7||!schematicStructureBootstrapResumed||!schematicProducerModeRequested||schematicDisplayStages[2]||expected<0||relevanceLibraryStep!=expected||relevanceLibraryHolds!=(role=="firstLoop"?0:role=="loopReturned"?1:2))throw Error("relevance-library-original-hold");AssertLive();relevanceLibraryHolds++;relevanceLibraryHeld=role;}
public void SendRelevanceLibrary(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceLibraryContext==null||relevanceLibraryQuiesced||schematicDisplayStages[2])throw Error("relevance-library-original-state");bool helper=phase=="library-refresh-helper";if(helper){if(relevanceLibraryStep<9||relevanceLibraryHelpers>=${String(REQUESTS.helperSources - 1)})throw Error("relevance-library-original-helper");}else{if(relevanceLibraryStep>=${String(REQUESTS.normal)}||phase!=EasyedaProjectLibraryRefreshProtocol.Phase(relevanceLibraryStep))throw Error("relevance-library-original-sequence");if(relevanceLibraryStep<9){if(schematicWorkerStage!=6||!schematicWorkerSourceRead)throw Error("relevance-library-original-source-held");if(phase.StartsWith("library-refresh-arm-",StringComparison.Ordinal)&&fields["scriptId"] as string!=schematicWorkerProjectScript)throw Error("relevance-library-original-script");}else if(schematicWorkerStage!=7||!schematicStructureBootstrapResumed||!schematicProducerModeRequested)throw Error("relevance-library-original-construction");}
string message=EasyedaProjectLibraryRefreshProtocol.Encode(id,schematicWorkerSession,relevanceLibraryContext,phase,method,fields);AssertLive();if(helper){relevanceLibraryHelpers++;}else{if(phase=="library-refresh-suspend"){if(relevanceLibrarySuspended||relevanceLibraryHeld!="firstLoop")throw Error("relevance-library-original-suspend-once");relevanceLibrarySuspended=true;}else if(phase=="library-refresh-cancel"){if(!relevanceLibrarySuspended||relevanceLibraryCancelled||relevanceLibraryHeld!="loopReturned")throw Error("relevance-library-original-cancel-once");relevanceLibraryCancelled=true;}else if(phase.StartsWith("library-refresh-resume-",StringComparison.Ordinal)){string role=phase.Substring("library-refresh-resume-".Length);if(relevanceLibraryHeld!=role||!relevanceLibrarySuspended||(role!="firstLoop"&&!relevanceLibraryCancelled))throw Error("relevance-library-original-resume");relevanceLibraryHeld=null;}relevanceLibraryStep++;}SendMessage(id,message);}
public void CompleteRelevanceLibrary(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceLibraryQuiesced||!relevanceLibrarySuspended||!relevanceLibraryCancelled||relevanceLibraryStep!=${String(REQUESTS.normal)}||relevanceLibraryHelpers!=${String(REQUESTS.helperSources - 1)}||relevanceLibraryHolds!=3||relevanceLibraryHeld!=null)throw Error("relevance-library-original-completion");AssertLive();relevanceLibraryQuiesced=true;}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-library-refresh-bind' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.context -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,context,helperInstance,id,jobId,rootCreated,rootPid'){throw 'relevance-library-bind-fields'}
          $owner.BindRelevanceLibrary($request.context);$result=@{bound=$true}
        }
        'schematic-relevance-library-refresh-hold' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,role,rootCreated,rootPid'){throw 'relevance-library-hold-fields'}
          $owner.HoldRelevanceLibrary($request.role);$result=@{held=$true}
        }
        'schematic-relevance-library-refresh-complete' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'relevance-library-complete-fields'}
          $owner.CompleteRelevanceLibrary();$result=@{completed=$true}
        }
        'schematic-relevance-library-refresh' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'relevance-library-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'relevance-library-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendRelevanceLibrary([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayLibraryRefreshNativeFragment(input: string): string {
  if (!input.includes("void AssertRelevanceStartupQuiesced()")) { throw new Error("RELEVANCE_LIBRARY_ORIGINAL_POLLING_REQUIRED"); }
  let source = applyCurrentProjectLibraryRefreshNativeFragment(input);
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", encoder = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(encoder).length !== 2) { throw new Error("RELEVANCE_LIBRARY_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(encoder, from); if (to < from) { throw new Error("RELEVANCE_LIBRARY_ADMISSION_ORDER"); }
  const body = source.slice(from, to); const cases = 'case "schematic-relevance-library-refresh-bind":case "schematic-relevance-library-refresh-hold":case "schematic-relevance-library-refresh-complete":case "schematic-relevance-library-refresh":';
  if (!body.includes(cases)) {
    if (body.includes('case "schematic-relevance-library-refresh') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_LIBRARY_PARTIAL_ADMISSION"); }
    source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to);
  } else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_LIBRARY_DUPLICATE_ADMISSION"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const finish = source.indexOf(end), start = source.indexOf(begin);
  if (start !== -1 || finish !== -1) {
    if (start === -1 || finish < start || source.includes(begin, start + begin.length) || source.includes(end, finish + end.length)) { throw new Error("RELEVANCE_LIBRARY_NATIVE_MARKERS"); }
    return source.slice(0, start) + native() + source.slice(finish + end.length);
  }
  const anchor = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209";
  if (source.split(anchor).length !== 2) { throw new Error("RELEVANCE_LIBRARY_NATIVE_ANCHOR"); }
  return source.replace(anchor, `${native()}\n${anchor}`);
}

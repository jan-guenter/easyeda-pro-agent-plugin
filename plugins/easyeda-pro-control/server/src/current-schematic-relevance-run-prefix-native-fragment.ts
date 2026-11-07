/** Readonly original run-prefix admission, separately bound after completed
 * original entry observations. No callback or continuation lane is installed. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as ENTRY } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND as BOUND } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { currentSchematicRelevanceRunPrefixNativeSource } from "./current-schematic-relevance-run-prefix-native.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC RUN PREFIX READS", end = "// END ORIGINAL SCHEMATIC RUN PREFIX READS";
const dispatch = String.raw`        'schematic-relevance-run-prefix' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-run-prefix-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-run-prefix-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-run-prefix-control'};if($request.phase -ceq 'bind'){$owner.BindSchematicRelevanceRunPrefix()}else{$owner.CompleteSchematicRelevanceRunPrefix()}}else{$owner.ReadSchematicRelevanceRunPrefix([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceRunPrefixNativeFragment(input: string): string {
  // Underline eligibility is collected after this readonly prefix and before
  // Any continuation must wait for those five additional observations.
  const observed = ENTRY.observation + ENTRY.rawObservation;
  const native = `${begin}
${currentSchematicRelevanceRunPrefixNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceRunPrefixBound,relevanceRunPrefixCompleted;int relevanceRunPrefixReads;
public void BindSchematicRelevanceRunPrefix(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceModifyGenerated||relevanceModifyIdle==null||relevanceRunPrefixBound||relevanceModifyEntryRequests!=${String(observed)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-prefix-original-entry");AssertLive();relevanceRunPrefixBound=true;}
public void ReadSchematicRelevanceRunPrefix(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRunPrefixBound||relevanceRunPrefixCompleted||!relevanceModifyGenerated||relevanceRunPrefixReads>=${String(BOUND)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-prefix-read-owner");AssertLive();string text=EasyedaSchematicRelevanceRunPrefixProtocol.Encode(id,schematicDisplaySession,phase,method,fields);relevanceRunPrefixReads++;SendMessage(id,text);}
public void CompleteSchematicRelevanceRunPrefix(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRunPrefixBound||relevanceRunPrefixCompleted||relevanceRunPrefixReads<1||relevanceRunPrefixReads>${String(BOUND)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-prefix-complete-owner");AssertLive();relevanceRunPrefixCompleted=true;}
}
${end}`;
  const previous = 'case "schematic-relevance-display-modify-bind":';
  let source = input;
  if (!source.includes('case "schematic-relevance-run-prefix":')) { if (source.split(previous).length !== 2) { throw new Error("SCHEMATIC_PREFIX_ADMISSION_ANCHOR"); } source = source.replace(previous, `case "schematic-relevance-run-prefix":${previous}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-modify-bind' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceRunPrefixProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceDisplayModifyEntryProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_PREFIX_NATIVE_MARKERS"); } return source.slice(0, start) + native + source.slice(stop + end.length); }
  const anchor = "// BEGIN ORIGINAL RELEVANCE MODIFY ENTRY"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_PREFIX_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

/** Own seven-record readonly publisher lane, bound to the original held
 * setAttribute. It has no arm, resume, application call or write codebook. */
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_READ_BOUND as BOUND } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_REQUESTS as CALLBACK } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { currentSchematicRelevanceUiPublicationNativeSource } from "./current-schematic-relevance-ui-publication-native.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC UI PUBLICATION READS", end = "// END ORIGINAL SCHEMATIC UI PUBLICATION READS";
const dispatch = String.raw`        'schematic-relevance-ui-publication' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-publication-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-publication-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 1 -or $fields['context'] -isnot [string]){throw 'schematic-publication-bind'};$owner.BindSchematicRelevanceUiPublication($fields['context'])}elseif($request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-publication-complete'};$owner.CompleteSchematicRelevanceUiPublication()}else{$owner.ReadSchematicRelevanceUiPublication([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceUiPublicationNativeFragment(input: string): string {
  const minimum = CALLBACK.arms + CALLBACK.entry + CALLBACK.resumes + CALLBACK.setter + CALLBACK.bridge + CALLBACK.receiver;
  const native = `${begin}
${currentSchematicRelevanceUiPublicationNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
string relevanceUiPublicationContext;bool relevanceUiPublicationCompleted;int relevanceUiPublicationReads;
public void BindSchematicRelevanceUiPublication(string context){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceCallbackSetterResumed||relevanceCallbackReads<=${String(minimum)}||relevanceUiPublicationContext!=null||schematicDisplayStages[4]||schematicDisplayStages[6]||context==null||context!=schematicDisplayContext||!System.Text.RegularExpressions.Regex.IsMatch(context,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("schematic-publication-original-entry");AssertLive();relevanceUiPublicationContext=context;}
public void ReadSchematicRelevanceUiPublication(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceUiPublicationContext==null||relevanceUiPublicationCompleted||relevanceUiPublicationReads>=${String(BOUND)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-publication-read-owner");if(phase=="source"&&(fields==null||!fields.Contains("scriptId")||!(fields["scriptId"] is string)||(string)fields["scriptId"]!=relevanceActionGuardScript))throw Error("schematic-publication-original-source");AssertLive();string text=EasyedaSchematicRelevanceUiPublicationProtocol.Encode(id,schematicDisplaySession,relevanceUiPublicationContext,phase,method,fields);relevanceUiPublicationReads++;SendMessage(id,text);}
public void CompleteSchematicRelevanceUiPublication(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceUiPublicationContext==null||relevanceUiPublicationCompleted||relevanceUiPublicationReads<1||relevanceUiPublicationReads>${String(BOUND)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-publication-complete-owner");AssertLive();relevanceUiPublicationCompleted=true;}
}
${end}`;
  const anchorAction = 'case "schematic-relevance-display-callback-bind":'; let source = input;
  if (!source.includes('case "schematic-relevance-ui-publication":')) { if (source.split(anchorAction).length !== 2) { throw new Error("SCHEMATIC_UI_PUBLICATION_ADMISSION"); } source = source.replace(anchorAction, `case "schematic-relevance-ui-publication":${anchorAction}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-callback-bind' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceUiPublicationProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceDisplayModifyEntryProtocol]::VerifySmoke()");
  const from = source.indexOf(begin), to = source.indexOf(end); if (from !== -1 || to !== -1) { if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_UI_PUBLICATION_NATIVE_MARKERS"); } return source.slice(0, from) + native + source.slice(to + end.length); }
  const anchor = "// BEGIN ORIGINAL RELEVANCE MODIFY ENTRY"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_UI_PUBLICATION_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

/** Dedicated original Modify TEXT serial continuation. Startup's eight-call
 * ledger and every Save grammar remain byte-exact and independently closed. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicRelevanceModifyStructureNativeSource } from "./current-schematic-relevance-modify-structure-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_REQUESTS as REQUESTS } from "./current-schematic-relevance-modify-structure-protocol.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC MODIFY TEXT STRUCTURE", end = "// END ORIGINAL SCHEMATIC MODIFY TEXT STRUCTURE";
const dispatch = String.raw`        'schematic-relevance-modify-structure' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-modify-structure-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-modify-structure-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0){throw 'schematic-modify-structure-control'};$owner.ControlSchematicRelevanceModifyStructure($request.phase)}else{$owner.StepSchematicRelevanceModifyStructure([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
/** Mount exactly one source-owned TEXT wave, with four acknowledged removals,
 * two distinct arms and three ordered resumes. No data packet grants a Save. */
export function applyCurrentSchematicRelevanceModifyStructureNativeFragment(input: string): string {
  const block = `${begin}
${currentSchematicRelevanceModifyStructureNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
public static void VerifySchematicRelevanceModifyStructureCodecSmoke(){EasyedaSchematicRelevanceModifyStructureProtocol.VerifySmoke();}
bool relevanceModifyStructureBound,relevanceModifyStructureCompleted;int relevanceModifyStructureRequests,relevanceModifyStructureArms,relevanceModifyStructureRemovals,relevanceModifyStructureResumes;
void AssertSchematicRelevanceModifyStructure(){AssertSchematicRelevanceModifyWorker();if(!relevanceModifyWorkerMetadataReady||schematicStartupCalls!=8||schematicStartupActive||schematicStartupFinalizers!=0)throw Error("schematic-modify-structure-original");}
public void ControlSchematicRelevanceModifyStructure(string phase){AssertSchematicRelevanceModifyStructure();if(phase=="bind"){if(relevanceModifyStructureBound||relevancePublicationStage!=1)throw Error("schematic-modify-structure-bind-once");relevanceModifyStructureBound=true;return;}if(phase=="completed"&&relevanceModifyStructureBound&&!relevanceModifyStructureCompleted&&relevanceModifyStructureArms==2&&relevanceModifyStructureRemovals==4&&relevanceModifyStructureResumes==3){relevanceModifyStructureCompleted=true;return;}throw Error("schematic-modify-structure-control-order");}
public void StepSchematicRelevanceModifyStructure(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceModifyStructure();if(!relevanceModifyStructureBound||relevanceModifyStructureCompleted||phase==null||relevanceModifyStructureRequests>=${String(REQUESTS.reads)})throw Error("schematic-modify-structure-bound");relevanceModifyStructureRequests++;if(phase.StartsWith("modify-structure-remove-",StringComparison.Ordinal)){string[] expected={"modify-structure-remove-startupEntry","modify-structure-remove-startupReturn","modify-structure-remove-entry","modify-structure-remove-returned"};if(relevanceModifyStructureRemovals>=4||phase!=expected[relevanceModifyStructureRemovals]||(relevanceModifyStructureRemovals<2?relevanceModifyStructureResumes!=0:relevanceModifyStructureResumes!=2))throw Error("schematic-modify-structure-remove-order");relevanceModifyStructureRemovals++;}else if(phase.StartsWith("modify-structure-arm-",StringComparison.Ordinal)){string[] expected={"modify-structure-arm-entry","modify-structure-arm-returned"};if(relevanceModifyStructureRemovals!=2||relevanceModifyStructureResumes!=0||relevanceModifyStructureArms>=2||phase!=expected[relevanceModifyStructureArms])throw Error("schematic-modify-structure-arm-order");relevanceModifyStructureArms++;}else if(phase.StartsWith("modify-structure-resume-",StringComparison.Ordinal)){string[] expected={"modify-structure-resume-entry","modify-structure-resume-returned","modify-structure-resume-finalizer"};if(relevancePublicationStage!=2||relevanceModifyStructureArms!=2||relevanceModifyStructureResumes>=3||phase!=expected[relevanceModifyStructureResumes]||relevanceModifyStructureRemovals!=(relevanceModifyStructureResumes==2?4:2))throw Error("schematic-modify-structure-resume-order");relevanceModifyStructureResumes++;}string text=EasyedaSchematicRelevanceModifyStructureProtocol.Encode(id,schematicWorkerSession,phase,method,fields);SendMessage(id,text);}
}
${end}`;
  let source = input; const admission = 'case "schematic-relevance-modify-control":';
  if (!source.includes('case "schematic-relevance-modify-structure":')) { if (source.split(admission).length !== 2) { throw new Error("SCH_MODIFY_STRUCTURE_ADMISSION"); } source = source.replace(admission, `case "schematic-relevance-modify-structure":${admission}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-modify-control' {");
  const from = source.indexOf(begin), through = source.indexOf(end);
  if (from !== -1 || through !== -1) { if (from === -1 || through < from || source.includes(begin, from + begin.length) || source.includes(end, through + end.length)) { throw new Error("SCH_MODIFY_STRUCTURE_MARKERS"); } return source.slice(0, from) + block + source.slice(through + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC MODIFY CONTINUATION"; if (source.split(anchor).length !== 2) { throw new Error("SCH_MODIFY_STRUCTURE_ANCHOR"); } return source.replace(anchor, `${block}\n${anchor}`);
}

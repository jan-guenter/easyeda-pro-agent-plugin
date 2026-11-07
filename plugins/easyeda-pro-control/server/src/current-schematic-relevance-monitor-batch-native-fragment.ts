/** The original record body may reach only its armed AST call entry.
 * Exact ordinals and one consumed resume deny the AST body and all monitors. */
import { CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_READS as READS } from "./current-schematic-relevance-monitor-batch-protocol.ts";
import { currentSchematicRelevanceMonitorBatchNativeSource } from "./current-schematic-relevance-monitor-batch-native.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC MONITOR BATCH", end = "// END ORIGINAL SCHEMATIC MONITOR BATCH";
const dispatch = String.raw`        'schematic-relevance-monitor-batch' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-monitor-batch-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-monitor-batch-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'history-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-monitor-batch-control'};$owner.ControlSchematicRelevanceMonitorBatch($request.phase)}else{$owner.StepSchematicRelevanceMonitorBatch([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceMonitorBatchNativeFragment(input: string): string {
  const native = `${begin}
${currentSchematicRelevanceMonitorBatchNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceMonitorBatchBound,relevanceMonitorBatchReady,relevanceMonitorBatchHeld;int relevanceMonitorBatchStage,relevanceMonitorBatchReads,relevanceMonitorBatchArms;
void AssertSchematicRelevanceMonitorBatch(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRecordAstHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-monitor-original-owner");AssertLive();}
public void ControlSchematicRelevanceMonitorBatch(string phase){AssertSchematicRelevanceMonitorBatch();if(phase=="bind"){if(relevanceMonitorBatchBound)throw Error("schematic-monitor-bind-once");relevanceMonitorBatchBound=true;return;}if(!relevanceMonitorBatchBound||relevanceMonitorBatchHeld)throw Error("schematic-monitor-stage");int[] limits=new[]{${[READS.ast,READS.modify,READS.bbox,READS.watch,READS.history].join(",")}};if(phase=="ready"){if(relevanceMonitorBatchReady||relevanceMonitorBatchStage>=4||relevanceMonitorBatchArms!=4||relevanceMonitorBatchReads!=limits[relevanceMonitorBatchStage])throw Error("schematic-monitor-ready");relevanceMonitorBatchReady=true;}else if(phase=="history-held"){if(relevanceMonitorBatchReady||relevanceMonitorBatchStage!=4||relevanceMonitorBatchReads!=limits[4]||relevanceMonitorBatchArms!=4)throw Error("schematic-monitor-history-required");relevanceMonitorBatchHeld=true;}else throw Error("schematic-monitor-control");}
public void StepSchematicRelevanceMonitorBatch(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceMonitorBatch();if(!relevanceMonitorBatchBound||relevanceMonitorBatchHeld)throw Error("schematic-monitor-stage");bool arm=phase.StartsWith("arm-",System.StringComparison.Ordinal),resume=phase=="resume";
if(arm){string[] roles=new[]{"modify","bbox","watch","history"};if(relevanceMonitorBatchStage!=0||relevanceMonitorBatchReads!=10||relevanceMonitorBatchReady||relevanceMonitorBatchArms>=4||phase!="arm-"+roles[relevanceMonitorBatchArms])throw Error("schematic-monitor-original-arm");}
else if(resume){if(!relevanceMonitorBatchReady||relevanceMonitorBatchStage>=4||method!="Debugger.resume")throw Error("schematic-monitor-resume-once");}
else{string[][] rows=new[]{new[]{"call-hooks","frame-ast","properties","call-raw","call-ui","call-ui","call-state","properties","properties","call-before"},new[]{"call-hooks","frame-modify","properties","call-modify","call-ast-raw","call-ast-ui","call-ast-ui"},new[]{"call-hooks","frame-bbox","properties","call-view-root","properties","properties","call-view","properties","properties","call-bbox-root","properties","properties","call-bbox","call-view-raw","call-view-ui","call-view-ui"},new[]{"call-hooks","frame-watch","properties","call-view-same","properties","call-watch","call-view-raw","call-view-ui","call-view-ui"},new[]{"call-hooks","frame-history","properties","call-view-same","call-history","call-view-raw","call-view-ui","call-view-ui"}};string expected=relevanceMonitorBatchReads<rows[relevanceMonitorBatchStage].Length?rows[relevanceMonitorBatchStage][relevanceMonitorBatchReads]:null;if(relevanceMonitorBatchReady||expected==null||phase!=expected&&(expected!="frame-bbox"||phase!="frame-bboxMain"&&phase!="frame-bboxChild"))throw Error("schematic-monitor-original-ordinal");}
string text=EasyedaSchematicRelevanceMonitorBatchProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(arm)relevanceMonitorBatchArms++;else if(resume){relevanceMonitorBatchReady=false;relevanceMonitorBatchStage++;relevanceMonitorBatchReads=0;}else relevanceMonitorBatchReads++;SendMessage(id,text);}

}
${end}`;
  const action = 'case "schematic-relevance-record-ast":'; let source = input; if (!source.includes('case "schematic-relevance-monitor-batch":')) { if (source.split(action).length !== 2) { throw new Error("SCHEMATIC_MONITOR_BATCH_ADMISSION_ANCHOR"); } source = source.replace(action, `case "schematic-relevance-monitor-batch":${action}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-record-ast' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceMonitorBatchProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceRecordAstProtocol]::VerifySmoke()");
  const from = source.indexOf(begin), to = source.indexOf(end); if (from !== -1 || to !== -1) { if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_MONITOR_BATCH_NATIVE_MARKERS"); } return source.slice(0, from) + native + source.slice(to + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC RECORD AST BRIDGE"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_MONITOR_BATCH_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

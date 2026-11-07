/** The original record body may reach only its armed AST call entry.
 * Exact ordinals and one consumed resume deny the AST body and all monitors. */
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_READS as READS } from "./current-schematic-relevance-history-command-protocol.ts";
import { currentSchematicRelevanceHistoryCommandNativeSource } from "./current-schematic-relevance-history-command-native.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC HISTORY COMMAND", end = "// END ORIGINAL SCHEMATIC HISTORY COMMAND";
const dispatch = String.raw`        'schematic-relevance-history-command' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-history-command-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-history-command-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'finish-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-history-command-control'};$owner.ControlSchematicRelevanceHistoryCommand($request.phase)}else{$owner.StepSchematicRelevanceHistoryCommand([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceHistoryCommandNativeFragment(input: string): string {
  const native = `${begin}
${currentSchematicRelevanceHistoryCommandNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceHistoryCommandBound,relevanceHistoryCommandReady,relevanceHistoryCommandHeld;int relevanceHistoryCommandStage,relevanceHistoryCommandReads,relevanceHistoryCommandArms;
void AssertSchematicRelevanceHistoryCommand(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceMonitorBatchHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-history-command-original-owner");AssertLive();}
public void ControlSchematicRelevanceHistoryCommand(string phase){AssertSchematicRelevanceHistoryCommand();if(phase=="bind"){if(relevanceHistoryCommandBound)throw Error("schematic-history-command-bind-once");relevanceHistoryCommandBound=true;return;}if(!relevanceHistoryCommandBound||relevanceHistoryCommandHeld)throw Error("schematic-history-command-stage");int[] limits=new[]{${[READS.history,READS.getModel,READS.attribute,READS.finish].join(",")}};if(phase=="ready"){if(relevanceHistoryCommandReady||relevanceHistoryCommandArms!=2||relevanceHistoryCommandStage>=3||relevanceHistoryCommandReads!=limits[relevanceHistoryCommandStage])throw Error("schematic-history-command-ready");relevanceHistoryCommandReady=true;}else if(phase=="finish-held"){if(relevanceHistoryCommandReady||relevanceHistoryCommandArms!=2||relevanceHistoryCommandStage!=3||relevanceHistoryCommandReads!=limits[3])throw Error("schematic-history-command-finish-required");relevanceHistoryCommandHeld=true;}else throw Error("schematic-history-command-control");}
public void StepSchematicRelevanceHistoryCommand(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceHistoryCommand();if(!relevanceHistoryCommandBound||relevanceHistoryCommandHeld)throw Error("schematic-history-command-stage");bool arm=phase.StartsWith("arm-",System.StringComparison.Ordinal),resume=phase=="resume";
if(arm){string[] arms=new[]{"arm-getModel","arm-attribute"};if(relevanceHistoryCommandStage!=0||relevanceHistoryCommandArms>=2||phase!=arms[relevanceHistoryCommandArms]||relevanceHistoryCommandReady||relevanceHistoryCommandReads!=${String(READS.history)})throw Error("schematic-history-command-arm-once");}
else if(resume){if(!relevanceHistoryCommandReady||relevanceHistoryCommandStage>=3||method!="Debugger.resume")throw Error("schematic-history-command-resume-once");}
else{string[][] rows=new[]{new[]{"call-hooks","call-globals","frame-history","properties","call-view-same","call-before","call-view-raw","call-ui","call-ui"},new[]{"call-hooks","call-globals","frame-getModel","properties","call-view-same","call-get-model","call-view-raw","call-ui","call-ui"},new[]{"call-hooks","call-globals","frame-attribute","properties","call-view-same","properties","call-details","properties","properties","properties","call-attribute","properties","call-raw","call-ui","call-ui"},new[]{"call-hooks","call-globals","frame-finish","properties","call-view-same","call-attributes","properties","properties","properties","call-finish","call-raw","call-ui","call-ui"}};if(relevanceHistoryCommandReady||relevanceHistoryCommandReads>=rows[relevanceHistoryCommandStage].Length||phase!=rows[relevanceHistoryCommandStage][relevanceHistoryCommandReads]&&(rows[relevanceHistoryCommandStage][relevanceHistoryCommandReads]!="frame-attribute"||phase!="frame-attributeMain"&&phase!="frame-attributeChild")&&(rows[relevanceHistoryCommandStage][relevanceHistoryCommandReads]!="frame-getModel"||phase!="frame-getModelMain"&&phase!="frame-getModelChild"))throw Error("schematic-history-command-original-ordinal");}
string text=EasyedaSchematicRelevanceHistoryCommandProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(arm)relevanceHistoryCommandArms++;else if(resume){relevanceHistoryCommandReady=false;relevanceHistoryCommandStage++;relevanceHistoryCommandReads=0;}else relevanceHistoryCommandReads++;SendMessage(id,text);}

}
${end}`;
  const action = 'case "schematic-relevance-monitor-batch":'; let source = input; if (!source.includes('case "schematic-relevance-history-command":')) { if (source.split(action).length !== 2) { throw new Error("SCHEMATIC_HISTORY_COMMAND_ADMISSION_ANCHOR"); } source = source.replace(action, `case "schematic-relevance-history-command":${action}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-monitor-batch' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceHistoryCommandProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceMonitorBatchProtocol]::VerifySmoke()");
  const from = source.indexOf(begin), to = source.indexOf(end); if (from !== -1 || to !== -1) { if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_HISTORY_COMMAND_NATIVE_MARKERS"); } return source.slice(0, from) + native + source.slice(to + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC MONITOR BATCH"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_HISTORY_COMMAND_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

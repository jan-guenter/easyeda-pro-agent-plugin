/** The original record body may reach only its armed AST call entry.
 * Exact ordinals and one consumed resume deny the AST body and all monitors. */
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_REQUESTS as REQUESTS } from "./current-schematic-relevance-record-ast-protocol.ts";
import { currentSchematicRelevanceRecordAstNativeSource } from "./current-schematic-relevance-record-ast-native.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC RECORD AST BRIDGE", end = "// END ORIGINAL SCHEMATIC RECORD AST BRIDGE";
const dispatch = String.raw`        'schematic-relevance-record-ast' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-record-ast-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-record-ast-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'ast-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-record-ast-control'};$owner.ControlSchematicRelevanceRecordAst($request.phase)}else{$owner.StepSchematicRelevanceRecordAst([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceRecordAstNativeFragment(input: string): string {
  const native = `${begin}
${currentSchematicRelevanceRecordAstNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceRecordAstBound,relevanceRecordAstReady,relevanceRecordAstResumed,relevanceRecordAstHeld;int relevanceRecordAstBefore,relevanceRecordAstAfter;
void AssertSchematicRelevanceRecordAst(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevancePrimitiveRecordHeld||!relevanceCallbackArms.Contains("ast")||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-record-ast-original-owner");AssertLive();}
public void ControlSchematicRelevanceRecordAst(string phase){AssertSchematicRelevanceRecordAst();if(phase=="bind"){if(relevanceRecordAstBound)throw Error("schematic-record-ast-bind-once");relevanceRecordAstBound=true;}else if(phase=="ready"){if(!relevanceRecordAstBound||relevanceRecordAstReady||relevanceRecordAstResumed||relevanceRecordAstBefore!=${String(REQUESTS.before)}||relevanceRecordAstAfter!=0)throw Error("schematic-record-ast-before-required");relevanceRecordAstReady=true;}else if(phase=="ast-held"){if(!relevanceRecordAstBound||!relevanceRecordAstReady||!relevanceRecordAstResumed||relevanceRecordAstHeld||relevanceRecordAstAfter!=${String(REQUESTS.ast)})throw Error("schematic-record-ast-ast-required");relevanceRecordAstHeld=true;}else throw Error("schematic-record-ast-control");}
public void StepSchematicRelevanceRecordAst(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceRecordAst();if(!relevanceRecordAstBound||relevanceRecordAstHeld)throw Error("schematic-record-ast-stage");bool resume=phase=="resume";if(resume){if(!relevanceRecordAstReady||relevanceRecordAstResumed||relevanceRecordAstBefore!=${String(REQUESTS.before)}||relevanceRecordAstAfter!=0||method!="Debugger.resume")throw Error("schematic-record-ast-resume-once");}else{string[] rows=relevanceRecordAstResumed?new[]{"call-hooks","frame-ast","properties","call-raw-delta","call-ui-delta","call-completion-delta","call-receiver"}:new[]{"call-hooks","frame-record","properties","call-raw-delta","call-ui-delta","call-completion-delta","call-record-before"};int at=relevanceRecordAstResumed?relevanceRecordAstAfter:relevanceRecordAstBefore;if(at>=rows.Length||phase!=rows[at]||!relevanceRecordAstResumed&&relevanceRecordAstReady)throw Error("schematic-record-ast-original-ordinal");}string text=EasyedaSchematicRelevanceRecordAstProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(resume)relevanceRecordAstResumed=true;else if(relevanceRecordAstResumed)relevanceRecordAstAfter++;else relevanceRecordAstBefore++;SendMessage(id,text);}
}
${end}`;
  const action = 'case "schematic-relevance-primitive":'; let source = input; if (!source.includes('case "schematic-relevance-record-ast":')) { if (source.split(action).length !== 2) { throw new Error("SCHEMATIC_RECORD_AST_ADMISSION_ANCHOR"); } source = source.replace(action, `case "schematic-relevance-record-ast":${action}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-primitive' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceRecordAstProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevancePrimitiveProtocol]::VerifySmoke()");
  const from = source.indexOf(begin), to = source.indexOf(end); if (from !== -1 || to !== -1) { if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_RECORD_AST_NATIVE_MARKERS"); } return source.slice(0, from) + native + source.slice(to + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC PRIMITIVE BRIDGE"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_RECORD_AST_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

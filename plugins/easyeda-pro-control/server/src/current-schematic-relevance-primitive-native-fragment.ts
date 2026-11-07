/** A single original raw underline write ending at the armed record entry.
 * Exact before/after ordinals and one consumed resume deny every later body. */
import { CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_REQUESTS as REQUESTS } from "./current-schematic-relevance-primitive-protocol.ts";
import { currentSchematicRelevancePrimitiveNativeSource } from "./current-schematic-relevance-primitive-native.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC PRIMITIVE BRIDGE", end = "// END ORIGINAL SCHEMATIC PRIMITIVE BRIDGE";
const dispatch = String.raw`        'schematic-relevance-primitive' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-primitive-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-primitive-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'record-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-primitive-control'};$owner.ControlSchematicRelevancePrimitive($request.phase)}else{$owner.StepSchematicRelevancePrimitive([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevancePrimitiveNativeFragment(input: string): string {
  const native = `${begin}
${currentSchematicRelevancePrimitiveNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevancePrimitiveBound,relevancePrimitiveReady,relevancePrimitiveResumed,relevancePrimitiveRecordHeld;int relevancePrimitiveBefore,relevancePrimitiveAfter;
void AssertSchematicRelevancePrimitive(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceUiPublicationCompleted||!relevanceCallbackSetterResumed||!relevanceCallbackArms.Contains("record")||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-primitive-original-owner");AssertLive();}
public void ControlSchematicRelevancePrimitive(string phase){AssertSchematicRelevancePrimitive();if(phase=="bind"){if(relevancePrimitiveBound)throw Error("schematic-primitive-bind-once");relevancePrimitiveBound=true;}else if(phase=="ready"){if(!relevancePrimitiveBound||relevancePrimitiveReady||relevancePrimitiveResumed||relevancePrimitiveBefore!=${String(REQUESTS.before)}||relevancePrimitiveAfter!=0)throw Error("schematic-primitive-before-required");relevancePrimitiveReady=true;}else if(phase=="record-held"){if(!relevancePrimitiveBound||!relevancePrimitiveReady||!relevancePrimitiveResumed||relevancePrimitiveRecordHeld||relevancePrimitiveAfter!=${String(REQUESTS.record)})throw Error("schematic-primitive-record-required");relevancePrimitiveRecordHeld=true;}else throw Error("schematic-primitive-control");}
public void StepSchematicRelevancePrimitive(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevancePrimitive();if(!relevancePrimitiveBound||relevancePrimitiveRecordHeld)throw Error("schematic-primitive-stage");bool resume=phase=="resume";if(resume){if(!relevancePrimitiveReady||relevancePrimitiveResumed||relevancePrimitiveBefore!=${String(REQUESTS.before)}||relevancePrimitiveAfter!=0||method!="Debugger.resume")throw Error("schematic-primitive-resume-once");}else{string[] rows=relevancePrimitiveResumed?new[]{"call-hooks","frame-record","properties","properties","call-raw-delta","call-ui-delta","call-record"}:new[]{"call-hooks","frame-before","properties","call-before-delta","call-before","properties","call-ui-same"};int at=relevancePrimitiveResumed?relevancePrimitiveAfter:relevancePrimitiveBefore;if(at>=rows.Length||phase!=rows[at]||!relevancePrimitiveResumed&&relevancePrimitiveReady)throw Error("schematic-primitive-original-ordinal");}string text=EasyedaSchematicRelevancePrimitiveProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(resume)relevancePrimitiveResumed=true;else if(relevancePrimitiveResumed)relevancePrimitiveAfter++;else relevancePrimitiveBefore++;SendMessage(id,text);}
}
${end}`;
  const action = 'case "schematic-relevance-ui-publication":'; let source = input; if (!source.includes('case "schematic-relevance-primitive":')) { if (source.split(action).length !== 2) { throw new Error("SCHEMATIC_PRIMITIVE_ADMISSION_ANCHOR"); } source = source.replace(action, `case "schematic-relevance-primitive":${action}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-ui-publication' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevancePrimitiveProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceUiPublicationProtocol]::VerifySmoke()");
  const from = source.indexOf(begin), to = source.indexOf(end); if (from !== -1 || to !== -1) { if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_PRIMITIVE_NATIVE_MARKERS"); } return source.slice(0, from) + native + source.slice(to + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC UI PUBLICATION READS"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_PRIMITIVE_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}

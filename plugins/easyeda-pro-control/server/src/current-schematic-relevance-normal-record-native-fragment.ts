/** Only the prepared original two-job graph can return the canRecord body.
 * Every actual disposer/record callback still stops at its own source entry. */
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_READS as READS} from "./current-schematic-relevance-normal-record-protocol.ts";
import {currentSchematicRelevanceNormalRecordNativeSource} from "./current-schematic-relevance-normal-record-native.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {installNativeCompileOnlyHook} from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC NORMAL RECORD",end="// END ORIGINAL SCHEMATIC NORMAL RECORD";
const dispatch=String.raw`        'schematic-relevance-normal-record' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-normal-record-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-normal-record-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'did-record-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-normal-record-control'};$owner.ControlSchematicRelevanceNormalRecord($request.phase)}else{$owner.StepSchematicRelevanceNormalRecord([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceNormalRecordNativeFragment(input:string):string{
 const native=`${begin}
${currentSchematicRelevanceNormalRecordNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceNormalRecordBound,relevanceNormalRecordReady,relevanceNormalRecordHeld;int relevanceNormalRecordStage,relevanceNormalRecordReads,relevanceNormalRecordArms;
void AssertSchematicRelevanceNormalRecord(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceNormalDisposalPrepared||!relevanceNormalUpdateHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-normal-record-original-owner");AssertLive();}
public void ControlSchematicRelevanceNormalRecord(string phase){AssertSchematicRelevanceNormalRecord();int[] limits=new[]{${Object.values(READS).join(",")}};if(phase=="bind"){if(relevanceNormalRecordBound)throw Error("schematic-normal-record-bind-once");relevanceNormalRecordBound=true;return;}if(!relevanceNormalRecordBound||relevanceNormalRecordHeld||relevanceNormalRecordReads!=limits[relevanceNormalRecordStage]||relevanceNormalRecordArms!=7)throw Error("schematic-normal-record-stage");if(phase=="ready"){if(relevanceNormalRecordReady||relevanceNormalRecordStage>=7)throw Error("schematic-normal-record-ready");relevanceNormalRecordReady=true;}else if(phase=="did-record-held"){if(relevanceNormalRecordReady||relevanceNormalRecordStage!=7)throw Error("schematic-normal-record-held-required");relevanceNormalRecordHeld=true;}else throw Error("schematic-normal-record-control");}
public void StepSchematicRelevanceNormalRecord(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceNormalRecord();if(!relevanceNormalRecordBound||relevanceNormalRecordHeld)throw Error("schematic-normal-record-stage");int[] limits=new[]{${Object.values(READS).join(",")}};bool arm=phase.StartsWith("arm-",System.StringComparison.Ordinal),resume=phase=="resume";
if(arm){string[] arms=new[]{"arm-dispose","arm-reset","arm-removal","arm-remove","arm-record","arm-willRecord","arm-didRecord"};if(relevanceNormalRecordArms>=7||phase!=arms[relevanceNormalRecordArms]||relevanceNormalRecordStage!=0||relevanceNormalRecordReads!=limits[0]||relevanceNormalRecordReady)throw Error("schematic-normal-record-arm-once");}
else if(resume){if(!relevanceNormalRecordReady||relevanceNormalRecordStage>=7||method!="Debugger.resume")throw Error("schematic-normal-record-resume-once");}
else if(relevanceNormalRecordReady||relevanceNormalRecordReads>=limits[relevanceNormalRecordStage])throw Error("schematic-normal-record-read-bound");
string text=EasyedaSchematicRelevanceNormalRecordProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(arm)relevanceNormalRecordArms++;else if(resume){relevanceNormalRecordReady=false;relevanceNormalRecordStage++;relevanceNormalRecordReads=0;}else relevanceNormalRecordReads++;SendMessage(id,text);}
}
${end}`;
 let source=input;const action='case "schematic-relevance-normal-disposal":';if(!source.includes('case "schematic-relevance-normal-record":')){if(source.split(action).length!==2){throw new Error("SCH_RECORD_ADMISSION_ANCHOR");}source=source.replace(action,`case "schematic-relevance-normal-record":${action}`);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-normal-disposal' {");source=installNativeCompileOnlyHook(source,"    [EasyedaSchematicRelevanceNormalRecordProtocol]::VerifySmoke()","    [EasyedaSchematicRelevanceNormalDisposalProtocol]::VerifySmoke()");
 const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_RECORD_NATIVE_MARKERS");}return source.slice(0,from)+native+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC DISPOSAL PREPARATION";if(source.split(anchor).length!==2){throw new Error("SCH_RECORD_NATIVE_ANCHOR");}return source.replace(anchor,`${native}\n${anchor}`);
}

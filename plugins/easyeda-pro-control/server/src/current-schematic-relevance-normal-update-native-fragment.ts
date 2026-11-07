/** Separate own7 continuation; no earlier observation lane can return the
 * original callback or bypass the held canRecord boundary. */
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_READS as READS} from "./current-schematic-relevance-normal-update-protocol.ts";
import {currentSchematicRelevanceNormalUpdateNativeSource} from "./current-schematic-relevance-normal-update-native.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {installNativeCompileOnlyHook} from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC NORMAL UPDATE",end="// END ORIGINAL SCHEMATIC NORMAL UPDATE";
const dispatch=String.raw`        'schematic-relevance-normal-update' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-normal-update-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-normal-update-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'ready' -or $request.phase -ceq 'can-record-held'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-normal-update-control'};$owner.ControlSchematicRelevanceNormalUpdate($request.phase)}else{$owner.StepSchematicRelevanceNormalUpdate([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceNormalUpdateNativeFragment(input:string):string{
 const native=`${begin}
${currentSchematicRelevanceNormalUpdateNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceNormalUpdateBound,relevanceNormalUpdateReady,relevanceNormalUpdateHeld;int relevanceNormalUpdateStage,relevanceNormalUpdateReads,relevanceNormalUpdateArms;
void AssertSchematicRelevanceNormalUpdate(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceHistoryCommandHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-normal-update-original-owner");AssertLive();}
public void ControlSchematicRelevanceNormalUpdate(string phase){AssertSchematicRelevanceNormalUpdate();int[] limits=new[]{${Object.values(READS).join(",")}};if(phase=="bind"){if(relevanceNormalUpdateBound)throw Error("schematic-normal-update-bind-once");relevanceNormalUpdateBound=true;return;}if(!relevanceNormalUpdateBound||relevanceNormalUpdateHeld||relevanceNormalUpdateReads!=limits[relevanceNormalUpdateStage])throw Error("schematic-normal-update-stage");if(phase=="ready"){if(relevanceNormalUpdateReady||relevanceNormalUpdateStage>=7||relevanceNormalUpdateArms!=(relevanceNormalUpdateStage==0?6:7))throw Error("schematic-normal-update-ready");relevanceNormalUpdateReady=true;}else if(phase=="can-record-held"){if(relevanceNormalUpdateReady||relevanceNormalUpdateStage!=7||relevanceNormalUpdateArms!=7)throw Error("schematic-normal-update-held-required");relevanceNormalUpdateHeld=true;}else throw Error("schematic-normal-update-control");}
public void StepSchematicRelevanceNormalUpdate(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceNormalUpdate();if(!relevanceNormalUpdateBound||relevanceNormalUpdateHeld)throw Error("schematic-normal-update-stage");int[] limits=new[]{${Object.values(READS).join(",")}};bool arm=phase.StartsWith("arm-",System.StringComparison.Ordinal),resume=phase=="resume";
if(arm){string[] arms=new[]{"arm-promise","arm-finishing","arm-success","arm-stack","arm-update","arm-canRecord","arm-runSuccess"};if(relevanceNormalUpdateArms>=7||phase!=arms[relevanceNormalUpdateArms]||relevanceNormalUpdateStage!=(relevanceNormalUpdateArms==6?1:0)||relevanceNormalUpdateReads!=limits[relevanceNormalUpdateStage]||relevanceNormalUpdateReady)throw Error("schematic-normal-update-arm-once");}
else if(resume){if(!relevanceNormalUpdateReady||relevanceNormalUpdateStage>=7||method!="Debugger.resume")throw Error("schematic-normal-update-resume-once");}
else if(relevanceNormalUpdateReady||relevanceNormalUpdateReads>=limits[relevanceNormalUpdateStage])throw Error("schematic-normal-update-read-bound");
string text=EasyedaSchematicRelevanceNormalUpdateProtocol.Encode(id,schematicDisplaySession,phase,method,fields);if(arm)relevanceNormalUpdateArms++;else if(resume){relevanceNormalUpdateReady=false;relevanceNormalUpdateStage++;relevanceNormalUpdateReads=0;}else relevanceNormalUpdateReads++;SendMessage(id,text);}
}
${end}`;
 let source=input;const action='case "schematic-relevance-history-command":';if(!source.includes('case "schematic-relevance-normal-update":')){if(source.split(action).length!==2){throw new Error("SCH_NORMAL_UPDATE_ADMISSION_ANCHOR");}source=source.replace(action,`case "schematic-relevance-normal-update":${action}`);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-history-command' {");source=installNativeCompileOnlyHook(source,"    [EasyedaSchematicRelevanceNormalUpdateProtocol]::VerifySmoke()","    [EasyedaSchematicRelevanceHistoryCommandProtocol]::VerifySmoke()");
 const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_NORMAL_UPDATE_NATIVE_MARKERS");}return source.slice(0,from)+native+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC HISTORY COMMAND";if(source.split(anchor).length!==2){throw new Error("SCH_NORMAL_UPDATE_NATIVE_ANCHOR");}return source.replace(anchor,`${native}\n${anchor}`);
}

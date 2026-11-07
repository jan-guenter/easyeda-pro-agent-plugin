/** Actual readonly disposal preparation on the genuine held canRecord packet. */
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DISPOSAL_READ_BOUND as BOUND} from "./current-schematic-relevance-normal-disposal-programs.ts";
import {currentSchematicRelevanceNormalDisposalNativeSource} from "./current-schematic-relevance-normal-disposal-native.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {installNativeCompileOnlyHook} from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC DISPOSAL PREPARATION",end="// END ORIGINAL SCHEMATIC DISPOSAL PREPARATION";
const dispatch=String.raw`        'schematic-relevance-normal-disposal' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-normal-disposal-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-normal-disposal-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-normal-disposal-control'};$owner.ControlSchematicRelevanceNormalDisposal($request.phase)}else{$owner.StepSchematicRelevanceNormalDisposal([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceNormalDisposalNativeFragment(input:string):string{
 const native=`${begin}
${currentSchematicRelevanceNormalDisposalNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceNormalDisposalBound,relevanceNormalDisposalPrepared;int relevanceNormalDisposalReads;
void AssertSchematicRelevanceNormalDisposal(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceNormalUpdateHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-normal-disposal-original-owner");AssertLive();}
public void ControlSchematicRelevanceNormalDisposal(string phase){AssertSchematicRelevanceNormalDisposal();if(phase=="bind"){if(relevanceNormalDisposalBound)throw Error("schematic-normal-disposal-bind-once");relevanceNormalDisposalBound=true;return;}if(phase!="complete"||!relevanceNormalDisposalBound||relevanceNormalDisposalPrepared||relevanceNormalDisposalReads<1||relevanceNormalDisposalReads>${String(BOUND)})throw Error("schematic-normal-disposal-original-prepared");relevanceNormalDisposalPrepared=true;}
public void StepSchematicRelevanceNormalDisposal(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceNormalDisposal();if(!relevanceNormalDisposalBound||relevanceNormalDisposalPrepared||relevanceNormalDisposalReads>=${String(BOUND)})throw Error("schematic-normal-disposal-read-bound");string text=EasyedaSchematicRelevanceNormalDisposalProtocol.Encode(id,schematicDisplaySession,phase,method,fields);relevanceNormalDisposalReads++;SendMessage(id,text);}
}
${end}`;
 let source=input;const action='case "schematic-relevance-normal-update":';if(!source.includes('case "schematic-relevance-normal-disposal":')){if(source.split(action).length!==2){throw new Error("SCH_DISPOSAL_ADMISSION_ANCHOR");}source=source.replace(action,`case "schematic-relevance-normal-disposal":${action}`);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-normal-update' {");source=installNativeCompileOnlyHook(source,"    [EasyedaSchematicRelevanceNormalDisposalProtocol]::VerifySmoke()","    [EasyedaSchematicRelevanceNormalUpdateProtocol]::VerifySmoke()");
 const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_DISPOSAL_NATIVE_MARKERS");}return source.slice(0,from)+native+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC NORMAL UPDATE";if(source.split(anchor).length!==2){throw new Error("SCH_DISPOSAL_NATIVE_ANCHOR");}return source.replace(anchor,`${native}\n${anchor}`);
}

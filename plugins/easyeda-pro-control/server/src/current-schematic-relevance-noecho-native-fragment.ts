/** Original CM/no-echo preparation while the original upload callback is held. */
import {CURRENT_SCHEMATIC_RELEVANCE_NOECHO_REQUESTS as REQUESTS} from "./current-schematic-relevance-noecho-protocol.ts";
import {currentSchematicRelevanceNoEchoNativeSource} from "./current-schematic-relevance-noecho-native.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {installNativeCompileOnlyHook} from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL SCHEMATIC NOECHO PREPARATION",end="// END ORIGINAL SCHEMATIC NOECHO PREPARATION";
const dispatch=String.raw`        'schematic-relevance-noecho' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-noecho-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-noecho-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-noecho-control'};$owner.ControlSchematicRelevanceNoEcho($request.phase)}else{$owner.StepSchematicRelevanceNoEcho([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceNoEchoNativeFragment(input:string):string{
 const native=`${begin}
${currentSchematicRelevanceNoEchoNativeSource()}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceNoEchoBound,relevanceNoEchoPrepared;int relevanceNoEchoReads;
void AssertSchematicRelevanceNoEcho(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceNormalRecordHeld||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-noecho-original-owner");AssertLive();}
public void ControlSchematicRelevanceNoEcho(string phase){AssertSchematicRelevanceNoEcho();if(phase=="bind"){if(relevanceNoEchoBound)throw Error("schematic-noecho-bind-once");relevanceNoEchoBound=true;return;}if(phase!="complete"||!relevanceNoEchoBound||relevanceNoEchoPrepared||relevanceNoEchoReads<1||relevanceNoEchoReads>${String(REQUESTS.reads)})throw Error("schematic-noecho-original-prepared");relevanceNoEchoPrepared=true;}
public void StepSchematicRelevanceNoEcho(int id,string phase,string method,System.Collections.IDictionary fields){AssertSchematicRelevanceNoEcho();if(!relevanceNoEchoBound||relevanceNoEchoPrepared||relevanceNoEchoReads>=${String(REQUESTS.reads)})throw Error("schematic-noecho-read-bound");string text=EasyedaSchematicRelevanceNoEchoProtocol.Encode(id,schematicDisplaySession,phase,method,fields);relevanceNoEchoReads++;SendMessage(id,text);}
}
${end}`;
 let source=input;const action='case "schematic-relevance-normal-record":';if(!source.includes('case "schematic-relevance-noecho":')){if(source.split(action).length!==2){throw new Error("SCH_NOECHO_ADMISSION_ANCHOR");}source=source.replace(action,`case "schematic-relevance-noecho":${action}`);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-normal-record' {");source=installNativeCompileOnlyHook(source,"    [EasyedaSchematicRelevanceNoEchoProtocol]::VerifySmoke()","    [EasyedaSchematicRelevanceNormalRecordProtocol]::VerifySmoke()");
 const from=source.indexOf(begin),to=source.indexOf(end);if(from!==-1||to!==-1){if(from===-1||to<from||source.includes(begin,from+begin.length)||source.includes(end,to+end.length)){throw new Error("SCH_NOECHO_NATIVE_MARKERS");}return source.slice(0,from)+native+source.slice(to+end.length);}const anchor="// BEGIN ORIGINAL SCHEMATIC NORMAL RECORD";if(source.split(anchor).length!==2){throw new Error("SCH_NOECHO_NATIVE_ANCHOR");}return source.replace(anchor,`${native}\n${anchor}`);
}

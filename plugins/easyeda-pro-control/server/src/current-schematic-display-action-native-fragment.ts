/** New passive metadata action of the original SCH birth only. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { applyCurrentSchematicDisplayActionGuardNativeFragment } from "./current-schematic-display-action-guard-native-fragment.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentSchematicDisplayActionNativeSource } from "./current-schematic-display-action-native.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as REQUESTS } from "./current-schematic-display-action-protocol.ts";

const begin = "// BEGIN GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER", end = "// END GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_ACTION_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_ACTION_NATIVE_ANCHOR"); } return source.replace(before, after);
}
function native(): string { return `${begin}
${currentSchematicDisplayActionNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
int schematicActionNormal,schematicActionCleanup;
public void SendSchematicDisplayAction(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicDisplayWrite209||schematicDisplayAbort||!schematicProducerPrefixEnrolled||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-action-original-holder");bool cleanup=phase=="schematic-action-release";if(cleanup?schematicActionCleanup>=${String(REQUESTS.cleanup)}:schematicActionNormal>=${String(REQUESTS.normal)})throw Error("schematic-action-budget");string encoded=EasyedaSchematicDisplayActionProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicActionCleanup++;else schematicActionNormal++;SendMessage(id,encoded);}
}
${end}`; }
const dispatch = String.raw`        'schematic-display-action' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-action-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-action-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicDisplayAction([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicDisplayActionNativeFragment(input: string): string {
  let source = one(input, 'case "schematic-display-accessor":', 'case "schematic-display-action":case "schematic-display-accessor":');
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-display-accessor' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicDisplayActionProtocol]::VerifySmoke()", "    [EasyedaSchematicDisplayAccessorProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_ACTION_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// BEGIN GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER", `${native()}\n// BEGIN GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER`); } return applyCurrentSchematicDisplayActionGuardNativeFragment(source);
}

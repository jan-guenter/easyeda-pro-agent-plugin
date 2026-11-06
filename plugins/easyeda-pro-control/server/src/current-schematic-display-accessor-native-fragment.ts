/** New passive metadata action of the original SCH birth only. */
import { currentSchematicDisplayAccessorNativeSource } from "./current-schematic-display-accessor-native.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS as REQUESTS } from "./current-schematic-display-accessor-protocol.ts";

const begin = "// BEGIN GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER", end = "// END GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_NATIVE_ANCHOR"); } return source.replace(before, after);
}
function native(): string { return `${begin}
${currentSchematicDisplayAccessorNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
int schematicAccessorNormal,schematicAccessorCleanup;
public void SendSchematicDisplayAccessor(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicDisplayWrite209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-accessor-original-holder");bool cleanup=phase=="schematic-accessor-release";if(cleanup?schematicAccessorCleanup>=${String(REQUESTS.cleanup)}:schematicAccessorNormal>=${String(REQUESTS.normal)})throw Error("schematic-accessor-budget");string encoded=EasyedaSchematicDisplayAccessorProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicAccessorCleanup++;else schematicAccessorNormal++;SendMessage(id,encoded);}
}
${end}`; }
const dispatch = String.raw`        'schematic-display-accessor' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-accessor-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-accessor-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicDisplayAccessor([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicDisplayAccessorNativeFragment(input: string): string {
  let source = one(input, 'case "schematic-display-clock-bind":', 'case "schematic-display-accessor":case "schematic-display-clock-bind":');
  source = one(source, "        'schematic-display-clock-bind' {", `${dispatch}        'schematic-display-clock-bind' {`);
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifySchematicDisplayClockSmoke()", "    [EasyedaSchematicDisplayAccessorProtocol]::VerifySmoke()\n    [EasyedaDiagnosticOwner]::VerifySchematicDisplayClockSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// BEGIN GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER", `${native()}\n// BEGIN GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER`); } return source;
}

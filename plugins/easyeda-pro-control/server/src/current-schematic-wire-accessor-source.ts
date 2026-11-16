/** Pure exact source qualification, independent of original process owners. */
import {sha256Text} from "./core.ts";
import {captureCurrentSchematicDisplayAccessorSource} from "./current-schematic-display-accessor-replies.ts";
import {GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as METHODS} from "./generated-schematic-wire-native-source.ts";
import {GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE as SOURCE} from "./generated-schematic-wire-source.ts";
import {CURRENT_SCHEMATIC_WIRE_ACCESSOR_ROLES as ROLES} from "./current-schematic-wire-accessor-protocol.ts";

function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`SCHEMATIC_WIRE_ACCESSOR_${code}`);}}
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS = Object.freeze({ pointsGet: 10, pointsSet: 10, setLines: 8, pointConstructor: 743 });
export function qualifyCurrentSchematicWireAccessorSource(input: unknown): 0 | 1 {
  const { scriptSource } = captureCurrentSchematicDisplayAccessorSource(input); const bytes = Buffer.byteLength(scriptSource); const hash = sha256Text(scriptSource);
  const index = SOURCE.files.findIndex(file => file.bytes === bytes && file.sha256 === hash); need(index === 0 || index === 1, "COMPLETE_SOURCE_IDENTITY");
  const source = METHODS[index]; const file = SOURCE.files[index]; need(source !== undefined && file !== undefined && source.relativePath === file.relativePath, "SOURCE_ROSTER");
  for (const method of Object.values(source.methods)) { need(sha256Text(scriptSource.slice(method.start, method.end)) === method.sha256, "SOURCE_METHOD_SPAN"); }
  for (const role of ROLES) {
    const method = source.methods[role]; const body = scriptSource.slice(method.start, method.end); const parameter = body.indexOf("(", role === "pointConstructor" ? body.indexOf("constructor") : 0);
    need(parameter === CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS[role] && !body.slice(0, parameter).includes("\n"), "FUNCTION_PARAMETER_LOCATION");
  }
  return index;
}

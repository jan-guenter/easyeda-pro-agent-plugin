/** Build-only fixed controls. The shared pool is unchanged and no program is
 * added by this book; all frame expressions live in their exact command row. */
import { currentSchematicRelevanceModifyEchoControlCases as cases, currentSchematicRelevanceModifyEchoControlTemplate as template } from "./current-schematic-relevance-modify-echo-control-wire.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Keep all source-role/profile combinations as golden CDP bytes under the
 * existing bounded table decoder. Owner-side control grants are separate. */
export function currentSchematicRelevanceModifyEchoControlNativeSource(): string {
  const commands = cases(); const rows = commands.map(command => { const row = template(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyEchoControlProtocol", errorCode: "schematic-modify-echo-control-codec", tableError: "SCHEMATIC_MODIFY_ECHO_CONTROL_FIXED_TABLE_BOUND", marker: "echoctrl", rows, programs: [], sharedProgramClass: "EasyedaSchematicRelevanceNormalCommandBodyProtocol", messages: commands.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

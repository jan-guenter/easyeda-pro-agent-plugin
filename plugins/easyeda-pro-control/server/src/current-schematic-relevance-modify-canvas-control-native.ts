/** Data-only Canvas control codec. This class has no original owner,
 * receiver, timer, Promise, continuation counter or native sender. */
import { currentSchematicRelevanceModifyCanvasControlCases, currentSchematicRelevanceModifyCanvasControlTemplate } from "./current-schematic-relevance-modify-canvas-control-wire.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Emit exact role packets and hashes using the immutable CM program pool.
 * This vocabulary adds no executable helper and accepts no caller program. */
export function currentSchematicRelevanceModifyCanvasControlNativeSource(): string {
 const cases = currentSchematicRelevanceModifyCanvasControlCases();
 const rows = cases.map(command => { const row = currentSchematicRelevanceModifyCanvasControlTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
 return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyCanvasControlProtocol", errorCode: "schematic-modify-canvas-control-codec", tableError: "SCHEMATIC_MODIFY_CANVAS_CONTROL_FIXED_TABLE_BOUND", marker: "modifycanvascontrol", rows, programs: [], sharedProgramClass: "EasyedaSchematicRelevanceModifyCmProtocol", messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

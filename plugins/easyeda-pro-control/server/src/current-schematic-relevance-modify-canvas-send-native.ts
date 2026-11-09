/** Immutable passive CanvasSend tables share only exact worker helper bytes. There
 * is no native owner, sender, control verb or completion issuer in this file. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_CALLS as CALLS } from "./current-schematic-relevance-modify-canvas-send-protocol.ts";
import { currentSchematicRelevanceModifyCanvasSendCases, currentSchematicRelevanceModifyCanvasSendTemplate } from "./current-schematic-relevance-modify-canvas-send-wire.ts";
import { currentSchematicRelevanceModifyCanvasPrograms } from "./current-schematic-relevance-modify-canvas-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Preserve the original shared worker order and append each new immutable
 * CanvasSend helper once, so placeholder indexes never infer a caller program. */
export function currentSchematicRelevanceModifyCanvasSendPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceModifyCanvasPrograms()];
  for (const row of CALLS) { if (!programs.includes(row[1])) { programs.push(row[1]); } }
  return Object.freeze(programs);
}
/** Emit exact fixed CDP messages and their hash vector without adding any
 * runtime authorization or changing another purpose's compiled codebook. */
export function currentSchematicRelevanceModifyCanvasSendNativeSource(): string {
  const cases = currentSchematicRelevanceModifyCanvasSendCases(); const shared = currentSchematicRelevanceModifyCanvasPrograms(); const programs = currentSchematicRelevanceModifyCanvasSendPrograms();
  const rows = cases.map(command => {
    const row = currentSchematicRelevanceModifyCanvasSendTemplate(command);
    const template = row.template.replaceAll(/__schematic_modifycanvassend_program(\d+)__/gu, (_match, raw: string) => { const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_CANVAS_SEND_PROGRAM_INDEX"); } const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_MODIFY_CANVAS_SEND_PROGRAM_ORDER"); } return `__schematic_modifycanvassend_program${String(index)}__`; });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyCanvasSendProtocol", errorCode: "schematic-modify-canvas-send-codec", tableError: "SCHEMATIC_MODIFY_CANVAS_SEND_FIXED_TABLE_BOUND", marker: "modifycanvassend", rows, exportPrograms: true, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyCanvasProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

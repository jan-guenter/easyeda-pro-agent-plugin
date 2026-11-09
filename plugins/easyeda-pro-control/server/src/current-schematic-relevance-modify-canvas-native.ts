/** Immutable passive Canvas tables share only exact worker helper bytes. There
 * is no native owner, sender, control verb or completion issuer in this file. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS as CALLS } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import { currentSchematicRelevanceModifyCanvasCases, currentSchematicRelevanceModifyCanvasTemplate } from "./current-schematic-relevance-modify-canvas-wire.ts";
import { currentSchematicRelevanceModifyCmPrograms } from "./current-schematic-relevance-modify-cm-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Preserve the original shared worker order and append each new immutable
 * Canvas helper once, so placeholder indexes never infer a caller program. */
export function currentSchematicRelevanceModifyCanvasPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceModifyCmPrograms()];
  for (const row of CALLS) { if (!programs.includes(row[1])) { programs.push(row[1]); } }
  return Object.freeze(programs);
}
/** Emit exact fixed CDP messages and their hash vector without adding any
 * runtime authorization or changing another purpose's compiled codebook. */
export function currentSchematicRelevanceModifyCanvasNativeSource(): string {
  const cases = currentSchematicRelevanceModifyCanvasCases(); const shared = currentSchematicRelevanceModifyCmPrograms(); const programs = currentSchematicRelevanceModifyCanvasPrograms();
  const rows = cases.map(command => {
    const row = currentSchematicRelevanceModifyCanvasTemplate(command);
    const template = row.template.replaceAll(/__schematic_modifycanvas_program(\d+)__/gu, (_match, raw: string) => { const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_CANVAS_PROGRAM_INDEX"); } const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_MODIFY_CANVAS_PROGRAM_ORDER"); } return `__schematic_modifycanvas_program${String(index)}__`; });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyCanvasProtocol", errorCode: "schematic-modify-canvas-codec", tableError: "SCHEMATIC_MODIFY_CANVAS_FIXED_TABLE_BOUND", marker: "modifycanvas", rows, exportPrograms: true, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyCmProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

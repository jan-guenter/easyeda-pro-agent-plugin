/** Immutable passive CM tables share only exact worker helper bytes. There
 * is no native owner, sender, control verb or completion issuer in this file. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_CALLS as CALLS } from "./current-schematic-relevance-modify-cm-delta-protocol.ts";
import { currentSchematicRelevanceModifyCmDeltaCases, currentSchematicRelevanceModifyCmDeltaTemplate } from "./current-schematic-relevance-modify-cm-delta-wire.ts";
import { currentSchematicRelevanceModifyWorkerPrograms } from "./current-schematic-relevance-modify-worker-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Preserve the original shared worker order and append each new immutable
 * delta helper once, so placeholder indexes never infer a caller program. */
export function currentSchematicRelevanceModifyCmDeltaPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceModifyWorkerPrograms()];
  for (const row of CALLS) { if (!programs.includes(row[1])) { programs.push(row[1]); } }
  return Object.freeze(programs);
}
/** Emit exact fixed CDP messages and their hash vector without adding any
 * runtime authorization or changing another purpose's compiled codebook. */
export function currentSchematicRelevanceModifyCmDeltaNativeSource(): string {
  const cases = currentSchematicRelevanceModifyCmDeltaCases(); const shared = currentSchematicRelevanceModifyWorkerPrograms(); const programs = currentSchematicRelevanceModifyCmDeltaPrograms();
  const rows = cases.map(command => {
    const row = currentSchematicRelevanceModifyCmDeltaTemplate(command);
    const template = row.template.replaceAll(/__schematic_modifycmdelta_program(\d+)__/gu, (_match, raw: string) => { const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_CM_DELTA_PROGRAM_INDEX"); } const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_MODIFY_CM_DELTA_PROGRAM_ORDER"); } return `__schematic_modifycmdelta_program${String(index)}__`; });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyCmDeltaProtocol", errorCode: "schematic-modify-cm-delta-codec", tableError: "SCHEMATIC_MODIFY_CM_DELTA_FIXED_TABLE_BOUND", marker: "modifycmdelta", rows, exportPrograms: true, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyWorkerProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

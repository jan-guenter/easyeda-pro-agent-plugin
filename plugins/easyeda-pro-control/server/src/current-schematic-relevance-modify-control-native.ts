/** Data-only worker control codec. Fixed strings share the exact already
 * emitted worker program pool, while every guard/resume row stays distinct. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS as CALLS } from "./current-schematic-relevance-modify-control-protocol.ts";
import { currentSchematicRelevanceModifyControlCases, currentSchematicRelevanceModifyControlTemplate } from "./current-schematic-relevance-modify-control-wire.ts";
import { currentSchematicRelevanceModifyWorkerPrograms } from "./current-schematic-relevance-modify-worker-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Share only the immutable worker-plus-control helper order. Each caller
 * keeps its own fixed command rows, session and native state machine. */
export function currentSchematicRelevanceModifyControlPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceModifyWorkerPrograms()];
  for (const row of CALLS) { if (!programs.includes(row[1])) { programs.push(row[1]); } }
  return Object.freeze(programs);
}
/** Emit exact message hashes and bounded immutable tables without adding an
 * owner, dispatch action or runtime continuation grant. */
export function currentSchematicRelevanceModifyControlNativeSource(): string {
  const cases = currentSchematicRelevanceModifyControlCases(); const shared = currentSchematicRelevanceModifyWorkerPrograms(); const programs = currentSchematicRelevanceModifyControlPrograms();
  const rows = cases.map(command => {
    const row = currentSchematicRelevanceModifyControlTemplate(command);
    const template = row.template.replaceAll(/__schematic_modifycontrol_program(\d+)__/gu, (_match, raw: string) => {
      const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_CONTROL_PROGRAM_INDEX"); }
      const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_MODIFY_CONTROL_PROGRAM_ORDER"); } return `__schematic_modifycontrol_program${String(index)}__`;
    });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyControlProtocol", errorCode: "schematic-modify-control-codec", tableError: "SCHEMATIC_MODIFY_CONTROL_FIXED_TABLE_BOUND", marker: "modifycontrol", rows, exportPrograms: true, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyWorkerProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

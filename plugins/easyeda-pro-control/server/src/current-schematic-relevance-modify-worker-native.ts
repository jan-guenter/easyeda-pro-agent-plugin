/** Build-only passive worker codec. Byte-identical programs reuse the fixed
 * SDK codebook; worker rows keep their own action and original session. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS as CALLS } from "./current-schematic-relevance-modify-worker-protocol.ts";
import { currentSchematicRelevanceModifyWorkerCases, currentSchematicRelevanceModifyWorkerTemplate } from "./current-schematic-relevance-modify-worker-wire.ts";
import { currentSchematicRelevanceSdkGatePrograms } from "./current-schematic-relevance-normal-command-ui-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Retain the exact SDK-plus-worker program order for another fixed own7
 * codec. Sharing immutable strings transfers no receiver or continuation. */
export function currentSchematicRelevanceModifyWorkerPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceSdkGatePrograms()];
  for (const row of CALLS) { if (!programs.includes(row[1])) { programs.push(row[1]); } }
  return Object.freeze(programs);
}
/** Emit only the fixed worker preparation rows and their immutable programs. */
export function currentSchematicRelevanceModifyWorkerSource(): string {
  const cases = currentSchematicRelevanceModifyWorkerCases(), shared = currentSchematicRelevanceSdkGatePrograms(); const programs = currentSchematicRelevanceModifyWorkerPrograms();
  const rows = cases.map(command => {
    const row = currentSchematicRelevanceModifyWorkerTemplate(command);
    const template = row.template.replaceAll(/__schematic_modifyworker_program(\d+)__/gu, (_match, raw: string) => {
      const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_WORKER_PROGRAM_INDEX"); }
      const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_MODIFY_WORKER_PROGRAM_ORDER"); }
      return `__schematic_modifyworker_program${String(index)}__`;
    });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyWorkerProtocol", errorCode: "schematic-modify-worker-codec", tableError: "SCHEMATIC_MODIFY_WORKER_FIXED_TABLE_BOUND", marker: "modifyworker", rows, exportPrograms: true, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceSdkGateProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

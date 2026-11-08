/** Fixed own7 TEXT serial data shares only byte-identical worker/control
 * helpers. Its action and native state remain separate from startup/Save. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_CALLS as CALLS } from "./current-schematic-relevance-modify-structure-protocol.ts";
import { currentSchematicRelevanceModifyStructureCases as cases, currentSchematicRelevanceModifyStructureTemplate as template } from "./current-schematic-relevance-modify-structure-wire.ts";
import { currentSchematicRelevanceModifyControlPrograms } from "./current-schematic-relevance-modify-control-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Emit independently hashed exact messages; shared program indices retain
 * the immutable order of the existing original worker/control codebook. */
export function currentSchematicRelevanceModifyStructureNativeSource(): string {
  const commands = cases(); const shared = currentSchematicRelevanceModifyControlPrograms(); const programs = [...shared];
  const rows = commands.map(command => {
    const row = template(command); const message = row.template.replaceAll(/__schematic_modifystructure_program(\d+)__/gu, (_match, raw: string) => {
      const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_STRUCTURE_PROGRAM_INDEX"); }
      let index = programs.indexOf(original[1]); if (index === -1) { index = programs.length; programs.push(original[1]); } return `__schematic_modifystructure_program${String(index)}__`;
    }); return [row.phase, row.method, row.names.join(","), message];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyStructureProtocol", errorCode: "schematic-modify-structure-codec", tableError: "SCHEMATIC_MODIFY_STRUCTURE_FIXED_TABLE_BOUND", marker: "modifystructure", rows, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyControlProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: commands.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

/** Build-only passive publication codec. Shared entries are byte-identical
 * programs from the existing normal-body codebook, with separate fixed rows. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_CALLS as CALLS } from "./current-schematic-relevance-publication-native-protocol.ts";
import { currentSchematicRelevancePublicationNativeCases, currentSchematicRelevancePublicationNativeTemplate } from "./current-schematic-relevance-publication-native-wire.ts";
import { currentSchematicRelevanceNormalCommandBodyPrograms } from "./current-schematic-relevance-normal-command-ui-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Emit the separate publisher codec with exact message hashes. Reuse only
 * byte-identical body programs; reject missing or mismatched program indexes
 * before constructing the fixed native tables. */
export function currentSchematicRelevancePublicationNativeSource(): string {
  const cases = currentSchematicRelevancePublicationNativeCases(), shared = currentSchematicRelevanceNormalCommandBodyPrograms(); const programs = [...shared];
  const rows = cases.map(command => {
    const row = currentSchematicRelevancePublicationNativeTemplate(command);
    const template = row.template.replaceAll(/__schematic_publicationnative_program(\d+)__/gu, (_match, raw: string) => {
      const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_PUBLICATION_NATIVE_PROGRAM_INDEX"); }
      let index = programs.indexOf(original[1]); if (index === -1) { index = programs.length; programs.push(original[1]); }
      return `__schematic_publicationnative_program${String(index)}__`;
    });
    return [row.phase, row.method, row.names.join(","), template];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevancePublicationNativeProtocol", errorCode: "schematic-publication-native-codec", tableError: "SCHEMATIC_PUBLICATION_NATIVE_FIXED_TABLE_BOUND", marker: "publicationnative", rows, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceNormalCommandBodyProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

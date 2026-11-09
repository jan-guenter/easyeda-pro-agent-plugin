/** Build-only event data shares exact fixed worker/control programs. Runtime
 * receiver, dispatch and native continuation state remain separate. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS as CALLS } from "./current-schematic-relevance-modify-event-protocol.ts";
import { currentSchematicRelevanceModifyEventCases as cases, currentSchematicRelevanceModifyEventTemplate as template } from "./current-schematic-relevance-modify-event-wire.ts";
import { currentSchematicRelevanceModifyControlPrograms } from "./current-schematic-relevance-modify-control-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Emit only finite event comparison rows and canonical shared smoke inputs. */
export function currentSchematicRelevanceModifyEventNativeSource(): string {
  const commands = cases(); const shared = currentSchematicRelevanceModifyControlPrograms(); const programs = [...shared];
  const rows = commands.map(command => {
    const row = template(command); const message = row.template.replaceAll(/__schematic_modifyevent_program(\d+)__/gu, (_match, raw: string) => {
      const original = CALLS[Number(raw)]; if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_MODIFY_EVENT_PROGRAM_INDEX"); }
      let index = programs.indexOf(original[1]); if (index === -1) { index = programs.length; programs.push(original[1]); } return `__schematic_modifyevent_program${String(index)}__`;
    }); return [row.phase, row.method, row.names.join(","), message];
  });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyEventProtocol", errorCode: "schematic-modify-event-codec", tableError: "SCHEMATIC_MODIFY_EVENT_FIXED_TABLE_BOUND", marker: "modifyevent", rows, programs: programs.slice(shared.length), sharedProgramClass: "EasyedaSchematicRelevanceModifyControlProtocol", programIndexes: programs.slice(shared.length).map((_program, index) => shared.length + index), messages: commands.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

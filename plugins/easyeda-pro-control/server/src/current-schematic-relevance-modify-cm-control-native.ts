/** The data-only CM command class contains no owner, sender or state machine.
 * Core must retain the original worker, operation and delivered pause token. */
import { currentSchematicRelevanceModifyCmControlCases, currentSchematicRelevanceModifyCmControlTemplate } from "./current-schematic-relevance-modify-cm-control-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CANCEL_PROGRAM as CANCEL } from "./current-schematic-relevance-modify-ticket-control-program.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";

/** Emit one bounded immutable table and its exact packet hash vector. No
 * control is granted by this data class. Its single fixed cancellation row
 * describes a scoped native-equivalent operation; it
 * cannot select its timer ID or receive a caller-supplied native function. */
export function currentSchematicRelevanceModifyCmControlNativeSource(): string {
  const cases = currentSchematicRelevanceModifyCmControlCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceModifyCmControlTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyCmControlProtocol", errorCode: "schematic-modify-cm-control-codec", tableError: "SCHEMATIC_MODIFY_CM_CONTROL_FIXED_TABLE_BOUND", marker: "modifycmcontrol", rows, programs: [CANCEL], messages: cases.map(command => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}

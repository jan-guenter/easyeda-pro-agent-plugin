/** The seven-record owner admits only its own stage bytes and shared finite
 * observation syntax. No six-record stage or mutation-origin alias is offered. */
import { diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { validateCurrentSchematicWireEditNativeCommand } from "./current-schematic-wire-edit-native-command.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditSharedNativeRequest } from "./current-schematic-display-write-protocol.ts";

export function currentSchematicWireEditNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_WIRE_EDIT_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_WIRE_EDIT_WIRE"); }
  if (Object.hasOwn(raw, "schematicRelevanceSaveLocalCommand") || Object.hasOwn(raw, "schematicRelevanceSaveUploadCommand") || Object.hasOwn(raw, "schematicRelevanceLocalCacheCommand") || Object.hasOwn(raw, "schematicRelevanceLibraryRefreshCommand") || Object.hasOwn(raw, "schematicRelevanceSyncQuiesceCommand") || Object.hasOwn(raw, "schematicRelevanceSaveGeneration") || Object.hasOwn(raw, "schematicRelevanceClockCommand") || Object.hasOwn(raw, "schematicRelevanceModifyGeneration") || Object.hasOwn(raw, "schematicRelevanceModifyEntryCommand") || Object.hasOwn(raw, "schematicRelevanceDisplayPhase") || Object.hasOwn(raw, "schematicDisplayPhase") || Object.hasOwn(raw, "schematicActionCommand") || Object.hasOwn(raw, "schematicActionGuardCommand") || Object.hasOwn(raw, "schematicClockCommand")) {
    throw new Error("SCHEMATIC_WIRE_EDIT_OWN_MUTATION_ORIGIN_REQUIRED");
  }
  if (!Object.hasOwn(raw, "schematicWireEditPhase")) { return currentSchematicWireEditSharedNativeRequest(chunk); }
  const { id, sessionId, ...input } = raw, command = validateCurrentSchematicWireEditNativeCommand(input);
  if (typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_EDIT_SESSION"); }
  const phase = command.schematicWireEditPhase;
  return Object.freeze({ action: "schematic-wire-edit-native", requestId: id, sessionId, phase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
    ...(phase === "start" ? {} : { targetJson: command.params.arguments[0].value }), ...(phase === "start" || phase === "navigate" ? {} : { operationJson: command.params.arguments[2].value }) });
}

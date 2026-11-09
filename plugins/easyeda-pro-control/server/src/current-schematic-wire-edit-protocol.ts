/** The seven-record owner admits only its own stage bytes and shared finite
 * observation syntax. No six-record stage or mutation-origin alias is offered. */
import { diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { validateCurrentSchematicWireEditNativeCommand } from "./current-schematic-wire-edit-native-command.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditSharedNativeRequest } from "./current-schematic-display-write-protocol.ts";
import { currentSchematicWireAccessorWire } from "./current-schematic-wire-accessor-protocol.ts";
import { currentSchematicWireIntentWire } from "./current-schematic-wire-intent-protocol.ts";
import { currentSchematicWireLexicalWire } from "./current-schematic-wire-lexical-protocol.ts";

export function currentSchematicWireEditNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_WIRE_EDIT_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_WIRE_EDIT_WIRE"); }
  if (Object.hasOwn(raw, "schematicRelevanceSaveLocalCommand") || Object.hasOwn(raw, "schematicRelevanceSaveUploadCommand") || Object.hasOwn(raw, "schematicRelevanceLocalCacheCommand") || Object.hasOwn(raw, "schematicRelevanceLibraryRefreshCommand") || Object.hasOwn(raw, "schematicRelevanceSyncQuiesceCommand") || Object.hasOwn(raw, "schematicRelevanceSaveGeneration") || Object.hasOwn(raw, "schematicRelevanceClockCommand") || Object.hasOwn(raw, "schematicRelevanceModifyGeneration") || Object.hasOwn(raw, "schematicRelevanceModifyEntryCommand") || Object.hasOwn(raw, "schematicRelevanceDisplayPhase") || Object.hasOwn(raw, "schematicDisplayPhase") || Object.hasOwn(raw, "schematicActionCommand") || Object.hasOwn(raw, "schematicActionGuardCommand") || Object.hasOwn(raw, "schematicClockCommand")) {
    throw new Error("SCHEMATIC_WIRE_EDIT_OWN_MUTATION_ORIGIN_REQUIRED");
  }
  if (Object.hasOwn(raw, "schematicWireAccessorCommand")) {
    const { id, sessionId, schematicWireAccessorCommand, ...input } = raw;
    if (schematicWireAccessorCommand !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_ACCESSOR_SESSION"); }
    const fixed = currentSchematicWireAccessorWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicWireAccessorCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_WIRE_ACCESSOR_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicWireLexicalCommand")) {
    const { id, sessionId, schematicWireLexicalCommand, ...input } = raw;
    if (schematicWireLexicalCommand !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_LEXICAL_SESSION"); }
    const fixed = currentSchematicWireLexicalWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicWireLexicalCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_WIRE_LEXICAL_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicWireIntentCommand")) {
    const { id, sessionId, schematicWireIntentCommand, ...input } = raw;
    if (schematicWireIntentCommand !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_INTENT_SESSION"); }
    const fixed = currentSchematicWireIntentWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicWireIntentCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_WIRE_INTENT_WIRE"); }
    return fixed.request;
  }
  if (!Object.hasOwn(raw, "schematicWireEditPhase")) { return currentSchematicWireEditSharedNativeRequest(chunk); }
  const { id, sessionId, ...input } = raw, command = validateCurrentSchematicWireEditNativeCommand(input);
  if (typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_EDIT_SESSION"); }
  const phase = command.schematicWireEditPhase;
  return Object.freeze({ action: "schematic-wire-edit-native", requestId: id, sessionId, phase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
    ...(phase === "start" ? {} : { targetJson: command.params.arguments[0].value }), ...(phase === "start" || phase === "navigate" ? {} : { operationJson: command.params.arguments[2].value }) });
}

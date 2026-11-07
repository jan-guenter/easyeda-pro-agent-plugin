import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as WIRE_PROFILE } from "./current-schematic-wire-edit-native-profile.ts";
import { currentSchematicDisplayActionGuardWire } from "./current-schematic-display-action-guard-protocol.ts";
import { currentSchematicDisplayActionWire } from "./current-schematic-display-action-wire.ts";
import { currentGeneratedPeriodicSyncWire } from "./current-generated-periodic-sync-wire.ts";
import { currentGeneratedInitialSyncWire } from "./current-generated-initial-sync-wire.ts";
/* oxlint-disable import/max-dependencies -- Keep the new startup cache grammar separate from the original writer/source grammars. */
import { currentGeneratedInitialCacheWire } from "./current-generated-initial-cache-wire.ts";
import { currentProjectSaveProducerWire } from "./current-project-save-producer-wire.ts";
import { currentProjectSaveProducerGuardWire } from "./current-project-save-producer-guard-wire.ts";
import { currentProjectStructureTransportWire } from "./current-project-structure-transport-wire.ts";
import { currentSchematicDisplayAccessorWire } from "./current-schematic-display-accessor-wire.ts";
import { currentSchematicDisplayClockWire } from "./current-schematic-display-clock-wire.ts";
/** Fixed discovery and original schematic navigation/source-stage calls.
 * Native writer/Save admission is separate; caller JavaScript is absent. */
import { currentSchematicDisplayWorkerWire } from "./current-schematic-display-worker-wire.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS, CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import { validateCurrentSchematicDisplayNativeCommand } from "./current-schematic-display-native-command.ts";
import { diagnosticNativeRequest, diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as RELEVANCE_PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";

export function currentSchematicDisplayWriteNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  return decodeSharedNativeRequest(chunk, "six");
}
/** Separate fixed reservation for common readonly vocabulary. The new owner
 * still cannot encode a six-record stage or its mutation-origin messages. */
export function currentSchematicRelevanceDisplaySharedNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  return decodeSharedNativeRequest(chunk, "relevance");
}
export function currentSchematicWireEditSharedNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> { return decodeSharedNativeRequest(chunk, "wire"); }
function decodeSharedNativeRequest(chunk: Buffer, family: "six" | "relevance" | "wire"): Readonly<Record<string, unknown>> {
  let profile: typeof PROFILE | typeof RELEVANCE_PROFILE | typeof WIRE_PROFILE = PROFILE;
  if (family === "wire") { profile = WIRE_PROFILE; } else if (family === "relevance") { profile = RELEVANCE_PROFILE; }
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > profile.renderer.total ||
    typeof raw["method"] !== "string" || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
  if (family === "six" && ["schematicWireEditPhase", "schematicRelevanceSaveGeneration", "schematicRelevanceClockCommand", "schematicRelevanceModifyGeneration", "schematicRelevanceModifyEntryCommand", "schematicRelevanceAccessorCommand", "schematicRelevanceActionCommand", "schematicRelevanceActionGuardCommand"].some(key => Object.hasOwn(raw, key))) { throw new Error("SCHEMATIC_SIX_FOREIGN_ACTION_MARKER"); }
  if (family === "wire" && ["schematicRelevanceSaveGeneration", "schematicRelevanceClockCommand", "schematicRelevanceModifyGeneration", "schematicRelevanceModifyEntryCommand", "schematicRelevanceDisplayPhase", "schematicDisplayPhase", "schematicAccessorCommand", "schematicRelevanceAccessorCommand", "schematicActionCommand", "schematicRelevanceActionCommand", "schematicActionGuardCommand", "schematicRelevanceActionGuardCommand", "schematicClockCommand"].some(key => Object.hasOwn(raw, key))) { throw new Error("SCHEMATIC_WIRE_FOREIGN_MUTATION_MARKER"); }
  if (family === "relevance" && ["schematicWireEditPhase", "schematicDisplayPhase", "schematicAccessorCommand", "schematicActionCommand", "schematicActionGuardCommand", "schematicClockCommand"].some(key => Object.hasOwn(raw, key))) {
    throw new Error("SCHEMATIC_RELEVANCE_OWN_MUTATION_ORIGIN_REQUIRED");
  }
  if (Object.hasOwn(raw, "periodicSyncCommand")) {
    const { id: initialId, sessionId: initialSession, periodicSyncCommand, ...initialInput } = raw;
    if (periodicSyncCommand !== true || typeof initialSession !== "string") { throw new Error("PERIODIC_SYNC_WIRE"); }
    const fixed = currentGeneratedPeriodicSyncWire(initialInput, initialId, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: initialId, ...fixed.command, periodicSyncCommand: true, sessionId: initialSession })}\0`))) { throw new Error("PERIODIC_SYNC_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "initialSyncCommand")) {
    const { id: initialId, sessionId: initialSession, initialSyncCommand, ...initialInput } = raw;
    if (initialSyncCommand !== true || typeof initialSession !== "string") { throw new Error("INITIAL_SYNC_WIRE"); }
    const fixed = currentGeneratedInitialSyncWire(initialInput, initialId, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: initialId, ...fixed.command, initialSyncCommand: true, sessionId: initialSession })}\0`))) { throw new Error("INITIAL_SYNC_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "initialCacheCommand")) {
    const { id: initialId, sessionId: initialSession, initialCacheCommand, ...initialInput } = raw;
    if (initialCacheCommand !== true || typeof initialSession !== "string") { throw new Error("INITIAL_CACHE_WIRE"); }
    const fixed = currentGeneratedInitialCacheWire(initialInput, initialId, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: initialId, ...fixed.command, initialCacheCommand: true, sessionId: initialSession })}\0`))) { throw new Error("INITIAL_CACHE_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "producerObserveCommand")) {
    const { id: producerId, sessionId: producerSession, producerObserveCommand, ...producerInput } = raw;
    if (producerObserveCommand !== true || typeof producerSession !== "string") { throw new Error("PROJECT_SAVE_PRODUCER_WIRE"); }
    const fixed = currentProjectSaveProducerWire(producerInput, producerId, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: producerId, ...fixed.command, producerObserveCommand: true, sessionId: producerSession })}\0`))) { throw new Error("PROJECT_SAVE_PRODUCER_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "producerGuardCommand")) {
    const { id, sessionId, producerGuardCommand, ...input } = raw;
    if (producerGuardCommand !== true || typeof sessionId !== "string") { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_WIRE"); }
    const fixed = currentProjectSaveProducerGuardWire(input, id, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, producerGuardCommand: true, sessionId })}\0`))) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "structureTransportCommand")) {
    const { id, sessionId, structureTransportCommand, ...command } = raw;
    if (structureTransportCommand !== true || typeof sessionId !== "string") { throw new Error("SCHEMATIC_DISPLAY_STRUCTURE_TRANSPORT_WIRE"); }
    const fixed = currentProjectStructureTransportWire(command, id, "schematic");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, structureTransportCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_STRUCTURE_TRANSPORT_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicActionGuardCommand")) {
    const { id, sessionId, schematicActionGuardCommand, ...input } = raw;
    if (schematicActionGuardCommand !== true || typeof sessionId !== "string") { throw new Error("SCHEMATIC_ACTION_GUARD_WIRE"); }
    const fixed = currentSchematicDisplayActionGuardWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicActionGuardCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_ACTION_GUARD_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicActionCommand")) {
    const { id, sessionId, schematicActionCommand, ...input } = raw;
    if (schematicActionCommand !== true || typeof sessionId !== "string") { throw new Error("SCHEMATIC_DISPLAY_ACTION_WIRE"); }
    const fixed = currentSchematicDisplayActionWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicActionCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_ACTION_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicAccessorCommand")) {
    const { id, sessionId, schematicAccessorCommand, ...input } = raw;
    if (schematicAccessorCommand !== true || typeof sessionId !== "string") { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_WIRE"); }
    const fixed = currentSchematicDisplayAccessorWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicAccessorCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicClockCommand")) {
    const { id, sessionId, schematicClockCommand, schematicClockRealm, ...input } = raw;
    if (schematicClockCommand !== true || typeof sessionId !== "string" || schematicClockRealm !== "worker" && schematicClockRealm !== "ui") { throw new Error("SCHEMATIC_DISPLAY_CLOCK_WIRE"); }
    const fixed = currentSchematicDisplayClockWire(input, schematicClockRealm, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicClockCommand: true, schematicClockRealm, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicWorkerCommand")) {
    const { id, sessionId, schematicWorkerCommand, ...input } = raw;
    if (schematicWorkerCommand !== true || typeof sessionId !== "string") { throw new Error("SCHEMATIC_DISPLAY_WORKER_WIRE"); }
    const fixed = currentSchematicDisplayWorkerWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicWorkerCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_WORKER_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicWorkerParentPhase")) {
    const { id, sessionId, schematicWorkerParentPhase: phase } = raw;
    if ((phase !== "arm" && phase !== "running") || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_DISPLAY_PARENT_WIRE"); }
    const params = phase === "arm" ? CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS : CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS;
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, schematicWorkerParentPhase: phase, method: "Target.setAutoAttach", params, sessionId })}\0`))) { throw new Error("SCHEMATIC_DISPLAY_PARENT_WIRE"); }
    return Object.freeze({ action: "schematic-display-worker-parent", requestId: id, phase, sessionId });
  }
  if (Object.hasOwn(raw, "schematicDisplayPhase")) {
    const { id, sessionId, ...input } = raw; const command = validateCurrentSchematicDisplayNativeCommand(input);
    if (typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_SESSION"); }
    const phase = command.schematicDisplayPhase;
    return Object.freeze({ action: "schematic-display-native", requestId: id, sessionId, phase,
      ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
      ...(phase === "start" ? {} : { targetJson: command.params.arguments[0].value }), ...(phase === "start" || phase === "navigate" ? {} : { operationJson: command.params.arguments[2].value }) });
  }
  if (!METHODS.includes(raw["method"])) { throw new Error("SCHEMATIC_DISPLAY_DISCOVERY_ONLY"); }
  const fixed = diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...raw, id: 1 })}\0`));
  return Object.freeze({ ...fixed, requestId: raw["id"] });
}

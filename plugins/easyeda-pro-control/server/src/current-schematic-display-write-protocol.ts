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

export function currentSchematicDisplayWriteNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    typeof raw["method"] !== "string" || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
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

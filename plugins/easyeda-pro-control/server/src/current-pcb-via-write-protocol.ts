import { currentGeneratedInitialCacheWire } from "./current-generated-initial-cache-wire.ts";
import { currentProjectSaveProducerWire } from "./current-project-save-producer-wire.ts";
import { currentProjectSaveProducerGuardWire } from "./current-project-save-producer-guard-wire.ts";
import { currentProjectStructureTransportWire } from "./current-project-structure-transport-wire.ts";
/** Finite Via renderer vocabulary. Only this new birth can select these fixed
 * programs; no caller JavaScript, SDK receiver or pipe handle is accepted. */
/* oxlint-disable import/max-dependencies -- The original Via wire composes independent fixed SDK, cold bootstrap, worker observer, scene and legacy grammars while retaining their distinct validators. */
import { z } from "zod";
import { currentPcbViaClockWire } from "./current-pcb-via-clock-wire.ts";
import { currentPcbViaWorkerWire } from "./current-pcb-via-worker-wire.ts";
import { CURRENT_PCB_VIA_WORKER_PARENT_PARAMS, CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { diagnosticNativeRequest, diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { currentPcbSpatialWire } from "./current-pcb-spatial-protocol.ts";
import type { CurrentPcbSpatialCaptureCommand } from "./current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_VIA_WRITE_FUNCTION, CURRENT_PCB_VIA_WRITE_GROUP, CURRENT_PCB_VIA_WRITE_STAGES } from "./current-pcb-via-write-program.ts";
import type { CurrentPcbViaWriteStage } from "./current-pcb-via-write-program.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";
import { currentPcbViaWriteRequestSchema } from "./current-pcb-via-write-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), phase = z.enum(CURRENT_PCB_VIA_WRITE_STAGES);
const target = currentDisposableOpenSealedTargetSchema;
const mask = z.strictObject({ topSolderMask: z.literal(0), bottomSolderMask: z.literal(0) });
const operation = z.strictObject({ operationId: currentPcbViaWriteRequestSchema.shape.operationId,
  via: currentPcbViaWriteRequestSchema.shape.via.extend({ viaType: z.literal(0), designRuleBlindViaName: z.literal(""),
    solderMaskExpansion: mask, primitiveLock: z.literal(false) }) });
export const CURRENT_PCB_VIA_WRITE_CALL_FLAGS = Object.freeze({ throwOnSideEffect: false, silent: true, awaitPromise: true,
  generatePreview: false, userGesture: false, objectGroup: CURRENT_PCB_VIA_WRITE_GROUP } as const);
const effects = { throwOnSideEffect: z.literal(false), silent: z.literal(true), awaitPromise: z.literal(true),
  generatePreview: z.literal(false), userGesture: z.literal(false), objectGroup: z.literal(CURRENT_PCB_VIA_WRITE_GROUP),
  functionDeclaration: z.literal(CURRENT_PCB_VIA_WRITE_FUNCTION),
  arguments: z.tuple([z.strictObject({ value: target }), z.strictObject({ value: phase }), z.strictObject({ value: operation })]) };
const captureParams = z.strictObject({ ...effects, uniqueContextId: handle, returnByValue: z.literal(false) });
const stageParams = z.strictObject({ ...effects, objectId: handle, returnByValue: z.literal(true) });
const schema = z.discriminatedUnion("viaWritePhase", [
  z.strictObject({ viaWritePhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ viaWritePhase: z.enum(["preflight", "create", "observe", "save"]), method: z.literal("Runtime.callFunctionOn"), params: stageParams }),
]).refine(value => value.viaWritePhase === value.params.arguments[1].value);
export type CurrentPcbViaSdkPropertiesCommand = Readonly<{ viaSdkProperties: true; method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>;
export type CurrentPcbViaWriteCommand = z.infer<typeof schema>;
export type CurrentPcbViaObservationPhase = "before" | "after";
export type CurrentPcbViaSpatialCommand = CurrentPcbSpatialCaptureCommand & Readonly<{ viaObservationPhase: CurrentPcbViaObservationPhase }>;
export function currentPcbViaWriteCommand(stage: CurrentPcbViaWriteStage, binding: string,
  value: Readonly<{ target: z.infer<typeof target>; operation: z.infer<typeof operation> }>): CurrentPcbViaWriteCommand {
  return freezeDeep(schema.parse({ viaWritePhase: stage, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_WRITE_CALL_FLAGS,
    functionDeclaration: CURRENT_PCB_VIA_WRITE_FUNCTION, ...(stage === "capture" ? { uniqueContextId: binding } : { objectId: binding }),
    returnByValue: stage !== "capture", arguments: [{ value: value.target }, { value: stage }, { value: value.operation }] } }));
}
/** Local validation reuses released encoders at ID one; the distinct Via birth
 * alone restores its own monotonic ID. Existing103/384 caps stay unchanged. */
export function currentPcbViaWriteNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("PCB_VIA_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || !Number.isSafeInteger(raw["id"]) || typeof raw["id"] !== "number" ||
    raw["id"] < 1 || raw["id"] > PROFILE.renderer.total || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("PCB_VIA_WIRE"); }
  const { id, sessionId, ...input } = raw;
  if (typeof sessionId !== "string" && Object.hasOwn(raw, "viaWritePhase")) { throw new Error("PCB_VIA_SESSION"); }
  if (Object.hasOwn(raw, "initialCacheCommand")) {
    const { id: initialId, sessionId: initialSession, initialCacheCommand, ...initialInput } = raw;
    if (initialCacheCommand !== true || typeof initialSession !== "string") { throw new Error("INITIAL_CACHE_WIRE"); }
    const fixed = currentGeneratedInitialCacheWire(initialInput, initialId, "via");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: initialId, ...fixed.command, initialCacheCommand: true, sessionId: initialSession })}\0`))) { throw new Error("INITIAL_CACHE_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "producerObserveCommand")) {
    const { id: producerId, sessionId: producerSession, producerObserveCommand, ...producerInput } = raw;
    if (producerObserveCommand !== true || typeof producerSession !== "string") { throw new Error("PROJECT_SAVE_PRODUCER_WIRE"); }
    const fixed = currentProjectSaveProducerWire(producerInput, producerId, "via");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: producerId, ...fixed.command, producerObserveCommand: true, sessionId: producerSession })}\0`))) { throw new Error("PROJECT_SAVE_PRODUCER_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "producerGuardCommand")) {
    const { id: guardId, sessionId: guardSession, producerGuardCommand, ...guardInput } = raw;
    if (producerGuardCommand !== true || typeof guardSession !== "string") { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_WIRE"); }
    const fixed = currentProjectSaveProducerGuardWire(guardInput, guardId, "via");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id: guardId, ...fixed.command, producerGuardCommand: true, sessionId: guardSession })}\0`))) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "structureTransportCommand")) {
    const { structureTransportCommand, ...command } = input;
    if (structureTransportCommand !== true || typeof sessionId !== "string") { throw new Error("PCB_VIA_STRUCTURE_TRANSPORT_WIRE"); }
    const fixed = currentProjectStructureTransportWire(command, id, "via");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, structureTransportCommand: true, sessionId })}\0`))) { throw new Error("PCB_VIA_STRUCTURE_TRANSPORT_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "viaClockCommand")) {
    const { viaClockCommand, viaClockRealm, ...command } = input;
    if (viaClockCommand !== true || typeof sessionId !== "string" || viaClockRealm !== "worker" && viaClockRealm !== "ui") { throw new Error("PCB_VIA_CLOCK_WIRE"); }
    const fixed = currentPcbViaClockWire(command, viaClockRealm, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, viaClockCommand: true, viaClockRealm, sessionId })}\0`))) { throw new Error("PCB_VIA_CLOCK_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "viaWorkerCommand")) {
    const { viaWorkerCommand, ...command } = input;
    if (viaWorkerCommand !== true || typeof sessionId !== "string") { throw new Error("PCB_VIA_WORKER_WIRE"); }
    const fixed = currentPcbViaWorkerWire(command, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, viaWorkerCommand: true, sessionId })}\0`))) { throw new Error("PCB_VIA_WORKER_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "viaWorkerParentPhase")) {
    const selected = input["viaWorkerParentPhase"];
    if ((selected !== "arm" && selected !== "running") || typeof sessionId !== "string") { throw new Error("PCB_VIA_PARENT_WIRE"); }
    const params = selected === "arm" ? CURRENT_PCB_VIA_WORKER_PARENT_PARAMS : CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS;
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, viaWorkerParentPhase: selected, method: "Target.setAutoAttach", params, sessionId })}\0`))) { throw new Error("PCB_VIA_PARENT_WIRE"); }
    return freezeDeep({ action: "pcb-via-worker-parent", requestId: id, phase: selected, sessionId: handle.parse(sessionId) });
  }
  if (Object.hasOwn(raw, "viaSdkProperties")) {
    const fixed = z.strictObject({ viaSdkProperties: z.literal(true), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle,
      ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }).parse(input);
    return freezeDeep({ action: "pcb-via-sdk-properties", requestId: id, sessionId: handle.parse(sessionId), objectId: fixed.params.objectId });
  }
  if (Object.hasOwn(raw, "viaWritePhase")) {
    const command = schema.parse(input);
    const request = command.params.arguments[2].value, selected = command.params.arguments[0].value;
    return freezeDeep({ action: "pcb-via-sdk", requestId: id, sessionId: handle.parse(sessionId), viaWritePhase: command.viaWritePhase,
      ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
      targetRawWindowsPath: selected.rawWindowsPath, targetProjectUuid: selected.projectUuid, targetBranchUuid: selected.branchUuid,
      targetDocumentUuid: selected.documentUuid, targetExpectedSourceSha256: selected.expectedSourceSha256,
      operationId: request.operationId, xMil: request.via.xMil, yMil: request.via.yMil,
      holeDiameterMil: request.via.holeDiameterMil, diameterMil: request.via.diameterMil });
  }
  if (Object.hasOwn(raw, "viaObservationPhase")) {
    const { viaObservationPhase, ...spatial } = input;
    if (viaObservationPhase !== "before" && viaObservationPhase !== "after" || typeof sessionId !== "string") { throw new Error("PCB_VIA_SCENE_PHASE"); }
    const fixed = currentPcbSpatialWire(spatial, 1, sessionId);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ ...fixed.command, id, viaObservationPhase })}\0`))) { throw new Error("PCB_VIA_SCENE_WIRE"); }
    return freezeDeep({ ...fixed.request, action: "pcb-via-spatial", requestId: id, observationPhase: viaObservationPhase });
  }
  const request = diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...raw, id: 1 })}\0`));
  const allowed = ["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"];
  if (!allowed.includes(String(raw["method"])) && !(raw["method"] === "Runtime.callFunctionOn" &&
    (typeof request["openingPhase"] === "string" || typeof request["pcbOpeningPhase"] === "string" ||
      request["generatedFixtureRegistrationPhase"] === "register-generated-fixture" || request["pcbPrimitives209Phase"] === "observe"))) { throw new Error("PCB_VIA_DISCOVERY_ONLY"); }
  return freezeDeep({ ...request, requestId: id });
}

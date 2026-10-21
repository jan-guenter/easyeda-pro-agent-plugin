/** Exact tagged private transport grammar. The tag distinguishes worker-owned
 * properties from page-owned properties and is never sent to the CDP endpoint. */
import { CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP } from "./current-pcb-string-worker-producer-commands.ts";
import type { CurrentPcbStringWorkerProducerCall, CurrentPcbStringWorkerProducerCommand,
  CurrentPcbStringWorkerProducerEvaluation } from "./current-pcb-string-worker-producer-commands.ts";

export type CurrentPcbStringWorkerProducerWireCommand = CurrentPcbStringWorkerProducerCommand & Readonly<{ id: number }>;
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }
function record(input: unknown): input is Record<string, unknown> { return input !== null && typeof input === "object" && !Array.isArray(input); }
function exact(input: object, names: readonly string[]): boolean { return Object.keys(input).toSorted().join(",") === [...names].toSorted().join(","); }
function handle(input: unknown): string { if (typeof input !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(input)) { return fail(); } return input; }
const EFFECTS = CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, GROUP = CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP;
function evaluationPhase(value: unknown): value is CurrentPcbStringWorkerProducerEvaluation {
  return typeof value === "string" && Object.hasOwn(CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS, value);
}
function callPhase(value: unknown): value is CurrentPcbStringWorkerProducerCall {
  return typeof value === "string" && Object.hasOwn(CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, value);
}

export function currentPcbStringWorkerProducerWire(raw: Record<string, unknown>, id: number):
Readonly<{ command: CurrentPcbStringWorkerProducerWireCommand; request: Readonly<Record<string, unknown>> }> {
  const method = raw["method"], params = raw["params"], phase = raw["workerProducerPhase"], sessionId = handle(raw["sessionId"]);
  if (!exact(raw, ["id", "method", "params", "sessionId", "workerProducerPhase"]) || sessionId.length > 128 || !record(params)) { return fail(); }
  const base = { action: "send", requestId: id, method, sessionId, workerProducerPhase: phase };
  let command: CurrentPcbStringWorkerProducerWireCommand, request: Readonly<Record<string, unknown>>;
  if (evaluationPhase(phase)) {
    if (method !== "Runtime.evaluate") { return fail(); }
    const uniqueContextId = handle(params["uniqueContextId"]);
    command = { id, workerProducerPhase: phase, method, params: { ...EFFECTS, expression: CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS[phase], uniqueContextId, objectGroup: GROUP,
      returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId };
    request = { ...base, uniqueContextId };
  } else if (callPhase(phase)) {
    const signature = CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS[phase];
    if (method !== "Runtime.callFunctionOn") { return fail(); }
    const args = params["arguments"];
    if (!Array.isArray(args) || args.length !== signature.count) { return fail(); }
    const argumentsList = args.map((value: unknown) => {
      if (!record(value) || !exact(value, ["objectId"])) { return fail(); } return { objectId: handle(value["objectId"]) };
    });
    const objectId = handle(params["objectId"]);
    command = { id, workerProducerPhase: phase, method, params: { ...EFFECTS, objectId, functionDeclaration: CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS[phase], objectGroup: GROUP,
      returnByValue: signature.returnByValue, arguments: argumentsList }, sessionId };
    request = { ...base, objectId, ...Object.fromEntries(argumentsList.map((value, index) => [`workerArgument${index}`, value.objectId])) };
  } else if (phase === "properties" && method === "Runtime.getProperties") {
    const objectId = handle(params["objectId"]);
    command = { id, workerProducerPhase: phase, method, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }, sessionId };
    request = { ...base, objectId };
  } else if (phase === "release" && method === "Runtime.releaseObjectGroup") {
    command = { id, workerProducerPhase: phase, method, params: { objectGroup: GROUP }, sessionId }; request = base;
  } else { return fail(); }
  if (JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); }
  return { command, request };
}

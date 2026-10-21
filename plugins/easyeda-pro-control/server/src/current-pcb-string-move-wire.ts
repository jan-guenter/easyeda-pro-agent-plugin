/** Fixed private move/startup transport. Only the compiled phase selects code;
 * object handles originate in the original page and never in public arguments. */
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_MOVE_ARGUMENT_COUNTS, CURRENT_PCB_STRING_MOVE_CALLS, CURRENT_PCB_STRING_MOVE_EFFECTS,
  CURRENT_PCB_STRING_MOVE_OBJECT_GROUP } from "./current-pcb-string-move-runner.ts";
import type { CurrentPcbStringMoveCommand } from "./current-pcb-string-move-runner.ts";

export type CurrentPcbStringMoveWireCommand = CurrentPcbStringMoveCommand & Readonly<{ id: number }>;
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }
function record(input: unknown): input is Record<string, unknown> { return input !== null && typeof input === "object" && !Array.isArray(input); }
function exact(input: object, names: readonly string[]): boolean { return Object.keys(input).toSorted().join(",") === [...names].toSorted().join(","); }
function handle(input: unknown): string { if (typeof input !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(input)) { return fail(); } return input; }
function callPhase(value: unknown): value is keyof typeof CURRENT_PCB_STRING_MOVE_CALLS {
  return typeof value === "string" && Object.hasOwn(CURRENT_PCB_STRING_MOVE_CALLS, value);
}
export function currentPcbStringMoveWire(raw: Record<string, unknown>, id: number):
Readonly<{ command: CurrentPcbStringMoveWireCommand; request: Readonly<Record<string, unknown>> }> {
  const method = raw["method"], movePhase = raw["movePhase"], params = raw["params"], sessionId = handle(raw["sessionId"]);
  if (!Number.isSafeInteger(id) || id < 1 || raw["id"] !== id || !exact(raw, ["id", "method", "params", "sessionId", "movePhase"]) ||
      sessionId.length > 128 || !record(params)) { return fail(); }
  const base = { action: "send", requestId: id, method, sessionId, movePhase };
  let command: CurrentPcbStringMoveWireCommand, request: Readonly<Record<string, unknown>>;
  if (movePhase === "wrapper" && method === "Runtime.evaluate") {
    const uniqueContextId = handle(params["uniqueContextId"]);
    command = { id, movePhase, method, params: { ...CURRENT_PCB_STRING_MOVE_EFFECTS,
      expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId, returnByValue: false,
      objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId };
    request = { ...base, uniqueContextId };
  } else if (callPhase(movePhase) && method === "Runtime.callFunctionOn") {
    const args = params["arguments"], count = CURRENT_PCB_STRING_MOVE_ARGUMENT_COUNTS[movePhase];
    if (!Array.isArray(args) || args.length !== count) { return fail(); }
    const argumentsList = args.map((value: unknown) => {
      if (!record(value) || !exact(value, ["objectId"])) { return fail(); } return { objectId: handle(value["objectId"]) };
    });
    const objectId = handle(params["objectId"]);
    command = { id, movePhase, method, params: { ...CURRENT_PCB_STRING_MOVE_EFFECTS, objectId,
      functionDeclaration: CURRENT_PCB_STRING_MOVE_CALLS[movePhase], arguments: argumentsList,
      returnByValue: movePhase === "sample" || movePhase === "startup", objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP }, sessionId };
    request = { ...base, objectId, ...Object.fromEntries(argumentsList.map((value, index) => [`moveArgument${index}`, value.objectId])) };
  } else if (movePhase === "properties" && method === "Runtime.getProperties") {
    const objectId = handle(params["objectId"]);
    command = { id, movePhase, method, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }, sessionId };
    request = { ...base, objectId };
  } else if (movePhase === "release" && method === "Runtime.releaseObjectGroup") {
    command = { id, movePhase, method, params: { objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP }, sessionId }; request = base;
  } else { return fail(); }
  if (JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); } return { command, request };
}

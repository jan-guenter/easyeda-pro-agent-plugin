/** Fixed private CDP vocabulary. No generic method, caller code or pause. */
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION } from "./current-pcb-diagnostic-worker-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, currentPcbDiagnosticOpeningArguments } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningPhase } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelCommand } from "./current-pcb-diagnostic-model-runner.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION } from "./current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "./current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "./current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, currentPcbDiagnosticPcbOpeningArguments } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningPhase } from "./current-pcb-diagnostic-pcb-opening.ts";

// The original complete worker path uses32 requests. Project opening adds8.
// The existing-PCB model path uses30; the complete project/PCB opening and
// Model observation path uses54, or64 with the original ancillary OBJECT's
// Five DOM reproofs. Those branches are exclusive; no override.
export const DIAGNOSTIC_REQUEST_LIMIT = 64;
export function diagnosticOpeningParams(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget,
  phase: CurrentPcbDiagnosticOpeningPhase): Readonly<{
    functionDeclaration: string; uniqueContextId: string; arguments: readonly Readonly<{ value: unknown }>[];
    returnByValue: true; awaitPromise: true; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: false;
  }> {
  if (!diagnosticToken(uniqueContextId) || !target.rawWindowsPath.isWellFormed()) { return fail(); }
  return Object.freeze({ functionDeclaration: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, uniqueContextId,
    arguments: currentPcbDiagnosticOpeningArguments(target, phase), returnByValue: true, awaitPromise: true, silent: true,
    generatePreview: false, userGesture: false, throwOnSideEffect: false });
}
export function diagnosticPcbOpeningParams(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget,
  phase: CurrentPcbDiagnosticPcbOpeningPhase): ReturnType<typeof diagnosticOpeningParams> {
  if (!diagnosticToken(uniqueContextId) || !target.rawWindowsPath.isWellFormed()) { return fail(); }
  return Object.freeze({ functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, uniqueContextId,
    arguments: currentPcbDiagnosticPcbOpeningArguments(target, phase), returnByValue: true, awaitPromise: true, silent: true,
    generatePreview: false, userGesture: false, throwOnSideEffect: false });
}

export const DIAGNOSTIC_WORKER_ATTACH_PARAMS = Object.freeze({ autoAttach: true, waitForDebuggerOnStart: false, flatten: true,
  filter: Object.freeze([Object.freeze({ type: "worker", exclude: false }), Object.freeze({ exclude: true })]) } as const);
export function diagnosticWorkerEvaluationParams(uniqueContextId: string): Readonly<{
  expression: string; uniqueContextId: string; returnByValue: true; throwOnSideEffect: true; silent: true;
  awaitPromise: false; includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  timeout: 1000; userGesture: false; generatePreview: false;
}> {
  if (!diagnosticToken(uniqueContextId)) { return fail(); }
  return Object.freeze({ expression: CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, uniqueContextId, returnByValue: true,
    throwOnSideEffect: true, silent: true, awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
    timeout: 1000, userGesture: false, generatePreview: false });
}
export type DiagnosticCommand =
  | Readonly<{ id: number; method: "Browser.getVersion" | "Target.getTargets" }>
  | Readonly<{ id: number; method: "Target.attachToTarget"; params: Readonly<{ targetId: string; flatten: true }> }>
  | Readonly<{ id: number; method: "Page.enable" | "Page.getFrameTree" | "Runtime.enable"; params: Readonly<Record<string, never>>; sessionId: string }>
  | Readonly<{ id: number; method: "Debugger.enable"; params: Readonly<{ maxScriptsCacheSize: 33_554_432 }>; sessionId: string }>
  | Readonly<{ id: number; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }>; sessionId: string }>
  | Readonly<{ id: number; method: "DOM.getFrameOwner"; params: Readonly<{ frameId: string }>; sessionId: string }>
  | Readonly<{ id: number; method: "DOM.describeNode"; params: Readonly<{ backendNodeId: number; depth: 0; pierce: false }>; sessionId: string }>
  | Readonly<{ id: number; method: "Target.setAutoAttach"; params: typeof DIAGNOSTIC_WORKER_ATTACH_PARAMS; sessionId: string }>
  | Readonly<{ id: number; method: "Runtime.evaluate"; params: ReturnType<typeof diagnosticWorkerEvaluationParams>; sessionId: string }>
  | Readonly<{ id: number; method: "Runtime.callFunctionOn"; params: ReturnType<typeof diagnosticOpeningParams>; sessionId: string }>
  | (CurrentPcbDiagnosticModelCommand extends infer Command ? Command extends CurrentPcbDiagnosticModelCommand
      ? Omit<Command, "modelPhase"> & Readonly<{ id: number; sessionId: string }> : never : never);
export interface DiagnosticEvent { readonly method: string; readonly params: Readonly<Record<string, unknown>>; readonly sessionId?: string }
export const DIAGNOSTIC_SOURCE_FRAME_BYTES = 33_554_432;
export const DIAGNOSTIC_SOURCE_BYTES = 20 * 1024 * 1024;
export const DIAGNOSTIC_SESSION_BYTES = 64 * 1024 * 1024;
export function diagnosticToken(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
export function diagnosticRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function diagnosticExact(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).toSorted().join(",") === keys.toSorted().join(",");
}
function modelHandle(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return fail(); }
  return value;
}
/** Derive a fixed private model phase from the exact wire function/options.
 * No model phase or raw expression is accepted from a public request. */
function modelWire(id: number, method: unknown, params: Record<string, unknown>, sessionId: string):
  Readonly<{ command: DiagnosticCommand; request: Readonly<Record<string, unknown>> }> | null {
  const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
  const base = { action: "send", requestId: id, method, sessionId };
  let command: DiagnosticCommand, request: Readonly<Record<string, unknown>>;
  if (method === "Runtime.evaluate" && params["expression"] === CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION) {
    const uniqueContextId = modelHandle(params["uniqueContextId"]);
    command = { id, method, params: { ...effects, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
      uniqueContextId, objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP, returnByValue: false,
      timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId };
    request = { ...base, modelPhase: "wrapper", uniqueContextId };
  } else if (method === "Runtime.getProperties") {
    const objectId = modelHandle(params["objectId"]);
    command = { id, method, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }, sessionId };
    request = { ...base, modelPhase: "properties", objectId };
  } else if (method === "Runtime.callFunctionOn" && params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION) {
    const objectId = modelHandle(params["objectId"]);
    command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false }, sessionId };
    request = { ...base, modelPhase: "handler", objectId };
  } else if (method === "Runtime.callFunctionOn" && (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION)) {
    const args = params["arguments"];
    if (!Array.isArray(args) || args.length !== 1 || !diagnosticRecord(args[0]) || !diagnosticExact(args[0], ["objectId"])) { return fail(); }
    const callbackObjectId = modelHandle(args[0]["objectId"]), objectId = modelHandle(params["objectId"]);
    const callParams = { returnByValue: true, arguments: [{ objectId: callbackObjectId }] as const } as const;
    let modelPhase = "snapshot";
    if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION) {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, ...callParams }, sessionId };
      modelPhase = "pending";
    } else if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION) {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, ...callParams }, sessionId };
      modelPhase = "raw-strings";
    } else if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION) {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, ...callParams }, sessionId };
      modelPhase = "root-inventory";
    } else {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, ...callParams }, sessionId };
    }
    request = { ...base, modelPhase, objectId, callbackObjectId };
  } else if (method === "Runtime.releaseObjectGroup") {
    command = { id, method, params: { objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP }, sessionId };
    request = { ...base, modelPhase: "release" };
  } else { return null; }
  if (!("params" in command) || JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); }
  return { command, request };
}
/** The native helper independently checks these same flat fields and constructs
 * JSON itself. Canonical re-encoding prevents an alternative wire vocabulary. */
export function diagnosticNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { return fail(); }
  const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8"));
  if (!diagnosticRecord(raw) || !Number.isSafeInteger(raw["id"]) || typeof raw["id"] !== "number" || raw["id"] < 1 || raw["id"] > DIAGNOSTIC_REQUEST_LIMIT) { return fail(); }
  const id = raw["id"], method = raw["method"], params = raw["params"], sessionId = raw["sessionId"];
  if (method === "Runtime.evaluate" && chunk.length > 8192 ||
      method !== "Runtime.evaluate" && method !== "Runtime.callFunctionOn" && chunk.length > 1024) { return fail(); }
  let command: DiagnosticCommand;
  let request: Readonly<Record<string, unknown>>;
  if (method === "Browser.getVersion" || method === "Target.getTargets") {
    if (!diagnosticExact(raw, ["id", "method"])) { return fail(); }
    command = { id, method }; request = { action: "send", requestId: id, method };
  } else if (method === "Target.attachToTarget") {
    if (!diagnosticExact(raw, ["id", "method", "params"]) || !diagnosticRecord(params) ||
        !diagnosticExact(params, ["targetId", "flatten"]) || !diagnosticToken(params["targetId"]) || params["flatten"] !== true) { return fail(); }
    command = { id, method, params: { targetId: params["targetId"], flatten: true } };
    request = { action: "send", requestId: id, method, targetId: params["targetId"] };
  } else {
    if (!diagnosticExact(raw, ["id", "method", "params", "sessionId"]) || !diagnosticToken(sessionId) || !diagnosticRecord(params)) { return fail(); }
    const model = modelWire(id, method, params, sessionId);
    if (model !== null) { command = model.command; request = model.request; }
    else if (method === "Page.enable" || method === "Page.getFrameTree" || method === "Runtime.enable") {
      if (!diagnosticExact(params, [])) { return fail(); }
      command = { id, method, params: {}, sessionId }; request = { action: "send", requestId: id, method, sessionId };
    } else if (method === "Debugger.enable") {
      if (!diagnosticExact(params, ["maxScriptsCacheSize"]) || params["maxScriptsCacheSize"] !== DIAGNOSTIC_SOURCE_FRAME_BYTES) { return fail(); }
      command = { id, method, params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId };
      request = { action: "send", requestId: id, method, sessionId };
    } else if (method === "Debugger.getScriptSource") {
      if (!diagnosticExact(params, ["scriptId"]) || !diagnosticToken(params["scriptId"])) { return fail(); }
      command = { id, method, params: { scriptId: params["scriptId"] }, sessionId };
      request = { action: "send", requestId: id, method, sessionId, scriptId: params["scriptId"] };
    } else if (method === "DOM.getFrameOwner") {
      if (!diagnosticExact(params, ["frameId"]) || !diagnosticToken(params["frameId"])) { return fail(); }
      command = { id, method, params: { frameId: params["frameId"] }, sessionId };
      request = { action: "send", requestId: id, method, sessionId, frameId: params["frameId"] };
    } else if (method === "DOM.describeNode") {
      const backendNodeId = params["backendNodeId"];
      if (!diagnosticExact(params, ["backendNodeId", "depth", "pierce"]) || typeof backendNodeId !== "number" ||
          !Number.isSafeInteger(backendNodeId) || backendNodeId < 1 || backendNodeId > 2_147_483_647 ||
          params["depth"] !== 0 || params["pierce"] !== false) { return fail(); }
      command = { id, method, params: { backendNodeId, depth: 0, pierce: false }, sessionId };
      request = { action: "send", requestId: id, method, sessionId, backendNodeId };
    } else if (method === "Target.setAutoAttach") {
      if (JSON.stringify(params) !== JSON.stringify(DIAGNOSTIC_WORKER_ATTACH_PARAMS)) { return fail(); }
      command = { id, method, params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId };
      request = { action: "send", requestId: id, method, sessionId };
    } else if (method === "Runtime.evaluate") {
      if (!diagnosticToken(params["uniqueContextId"])) { return fail(); }
      const fixed = diagnosticWorkerEvaluationParams(params["uniqueContextId"]);
      if (JSON.stringify(params) !== JSON.stringify(fixed)) { return fail(); }
      command = { id, method, params: fixed, sessionId };
      // The native helper independently embeds this exact program. No expression
      // Or evaluation-option string crosses its flat request boundary.
      request = { action: "send", requestId: id, method, sessionId, uniqueContextId: params["uniqueContextId"] };
    } else if (method === "Runtime.callFunctionOn") {
      const args = params["arguments"];
      if (!diagnosticToken(params["uniqueContextId"]) || !Array.isArray(args) || args.length !== 2 ||
          !diagnosticRecord(args[0]) || !diagnosticExact(args[0], ["value"]) ||
          !diagnosticRecord(args[1]) || !diagnosticExact(args[1], ["value"])) { return fail(); }
      const phase = args[1]["value"], target = args[0]["value"];
      if (!diagnosticRecord(target)) { return fail(); }
      const selected = currentDisposableOpenSealedTargetSchema.parse(target);
      const pcb = params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION;
      let fixed: ReturnType<typeof diagnosticOpeningParams>;
      if (pcb) {
        if (phase !== "preflight" && phase !== "open-document" && phase !== "observe") { return fail(); }
        fixed = diagnosticPcbOpeningParams(params["uniqueContextId"], selected, phase);
      } else {
        if (phase !== "preflight" && phase !== "open-project") { return fail(); }
        fixed = diagnosticOpeningParams(params["uniqueContextId"], selected, phase);
      }
      if (JSON.stringify(params) !== JSON.stringify(fixed)) { return fail(); }
      command = { id, method, params: fixed, sessionId };
      request = { action: "send", requestId: id, method, sessionId, uniqueContextId: params["uniqueContextId"],
        ...(pcb ? { pcbOpeningPhase: phase } : { openingPhase: phase }),
        targetRawWindowsPath: selected.rawWindowsPath, targetProjectUuid: selected.projectUuid,
        targetBranchUuid: selected.branchUuid, targetDocumentUuid: selected.documentUuid, targetExpectedSourceSha256: selected.expectedSourceSha256 };
    } else { return fail(); }
  }
  if (chunk.toString("utf8") !== `${JSON.stringify(command)}\0`) { return fail(); }
  return request;
}
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }

/** Fixed private CDP vocabulary. No generic method, caller code or pause. */
/* oxlint-disable import/max-dependencies -- Exact native parity retains each independently reviewed fixed reader and constructor selector. */
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP } from "./current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineCommand } from "./current-pcb-common-baseline-runner.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION } from "./current-pcb-common-metadata.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ, CURRENT_PCB_COMMON_PACKET_RESULT,
  CURRENT_PCB_COMMON_PACKET_SEEDS } from "./current-pcb-common-packet-program.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "./current-pcb-string-empty-assets.ts";
import { CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION } from "./current-pcb-teardrop-owner-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION } from "./current-pcb-diagnostic-worker-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, currentPcbDiagnosticOpeningArguments } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningPhase } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelCommand } from "./current-pcb-diagnostic-model-runner.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION } from "./current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "./current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "./current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, currentPcbDiagnosticPcbOpeningArguments } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningPhase } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_LAYERS_FUNCTION } from "./current-pcb-209-layers.ts";
import { CURRENT_PCB_209_PRIMITIVES_FUNCTION } from "./current-pcb-209-primitives.ts";
import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION } from "./current-pcb-209-extended-primitives.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, currentPcbStringScopeCommand, currentPcbStringWorkerCommand } from "./current-pcb-string-commands.ts";
import type { CurrentPcbStringPrecreateCommand } from "./current-pcb-string-commands.ts";
import { currentPcbStringActorClockWire } from "./current-pcb-string-actor-clock-wire.ts";
import type { CurrentPcbStringActorClockWireCommand } from "./current-pcb-string-actor-clock-wire.ts";
import { currentPcbStringWorkerProducerWire } from "./current-pcb-string-worker-producer-wire.ts";
import type { CurrentPcbStringWorkerProducerWireCommand } from "./current-pcb-string-worker-producer-wire.ts";
import { currentPcbStringMoveWire } from "./current-pcb-string-move-wire.ts";
import type { CurrentPcbStringMoveWireCommand } from "./current-pcb-string-move-wire.ts";

// The original complete worker path uses32 requests. Project opening adds8.
// The existing-PCB model path uses69; the complete project/PCB opening and
// Model observation path uses93, or103 with the original ancillary OBJECT's
// Five DOM reproofs. Totals include18 constructor-bundle/source checks and21
// Bound-teardrop-owner checks. No writer or caller override is admitted.
export const DIAGNOSTIC_REQUEST_LIMIT = 103;
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

export function diagnosticLayers209Params(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): ReturnType<typeof diagnosticOpeningParams> {
  const fixed = diagnosticPcbOpeningParams(uniqueContextId, target, "observe");
  return Object.freeze({ ...fixed, functionDeclaration: CURRENT_PCB_209_LAYERS_FUNCTION });
}

export function diagnosticPrimitives209Params(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): ReturnType<typeof diagnosticOpeningParams> {
  const fixed = diagnosticPcbOpeningParams(uniqueContextId, target, "observe");
  return Object.freeze({ ...fixed, functionDeclaration: CURRENT_PCB_209_PRIMITIVES_FUNCTION });
}

export function diagnosticExtendedPrimitives209Params(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): ReturnType<typeof diagnosticOpeningParams> {
  const fixed = diagnosticPcbOpeningParams(uniqueContextId, target, "observe");
  return Object.freeze({ ...fixed, functionDeclaration: CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION });
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
  | CurrentPcbStringActorClockWireCommand
  | CurrentPcbStringWorkerProducerWireCommand
  | CurrentPcbStringMoveWireCommand
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
      ? Omit<Command, "modelPhase"> & Readonly<{ id: number; sessionId: string }> : never : never)
  | (CurrentPcbCommonBaselineCommand extends infer Command ? Command extends CurrentPcbCommonBaselineCommand
      ? Omit<Command, "commonPhase"> & Readonly<{ id: number; sessionId: string }> : never : never);
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
const COMMON_PROGRAMS = Object.freeze({ constructors: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common,
  "presentation-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.presentation, "rules-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.rules,
  "preference-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.preference, assets: CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION,
  metadata: CURRENT_PCB_COMMON_METADATA_FUNCTION });
const COMMON_PROGRAM_PHASES = ["constructors", "presentation-seed", "rules-seed", "preference-seed", "assets", "metadata"] as const;
const COMMON_PACKET_PROGRAMS = Object.freeze({ "packet-advance": CURRENT_PCB_COMMON_PACKET_ADVANCE,
  "packet-read": CURRENT_PCB_COMMON_PACKET_READ, "packet-result": CURRENT_PCB_COMMON_PACKET_RESULT });
const COMMON_PACKET_PHASES = ["packet-advance", "packet-read", "packet-result"] as const;
/** Common scope properties and handler are byte-identical to existing fixed
 * model requests. Only distinct group/program variants get a common phase. */
function commonWire(id: number, method: unknown, params: Record<string, unknown>, sessionId: string):
  Readonly<{ command: DiagnosticCommand; request: Readonly<Record<string, unknown>> }> | null {
  const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
  const base = { action: "send", requestId: id, method, sessionId };
  let command: DiagnosticCommand, request: Readonly<Record<string, unknown>>;
  if (method === "Runtime.evaluate" && params["objectGroup"] === CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP) {
    const uniqueContextId = modelHandle(params["uniqueContextId"]);
    command = { id, method, params: { ...effects, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
      uniqueContextId, objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false,
      timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId };
    request = { ...base, commonPhase: "wrapper", uniqueContextId };
  } else if (method === "Runtime.releaseObjectGroup" && params["objectGroup"] === CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP) {
    command = { id, method, params: { objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP }, sessionId };
    request = { ...base, commonPhase: "release" };
  } else if (method === "Runtime.callFunctionOn") {
    const packetPhase = COMMON_PACKET_PHASES.find(key => COMMON_PACKET_PROGRAMS[key] === params["functionDeclaration"]);
    if (packetPhase !== undefined) {
      const objectId = modelHandle(params["objectId"]);
      command = { id, method, params: { ...effects, objectId, functionDeclaration: COMMON_PACKET_PROGRAMS[packetPhase],
        objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: packetPhase !== "packet-advance" }, sessionId };
      request = { ...base, commonPhase: packetPhase, objectId };
      if (JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); }
      return { command, request };
    }
    const phase = COMMON_PROGRAM_PHASES.find(key => COMMON_PROGRAMS[key] === params["functionDeclaration"]);
    if (phase === undefined) { return null; }
    const args = params["arguments"], withConstructors = phase !== "constructors" && phase !== "metadata";
    if (!Array.isArray(args) || args.length !== (withConstructors ? 2 : 1) ||
        args.some(arg => !diagnosticRecord(arg) || !diagnosticExact(arg, ["objectId"]))) { return fail(); }
    const first: unknown = args[0], second: unknown = args[1];
    if (!diagnosticRecord(first) || withConstructors && !diagnosticRecord(second)) { return fail(); }
    const callbackObjectId = modelHandle(first["objectId"]), objectId = modelHandle(params["objectId"]);
    if (withConstructors) {
      const constructorObjectId = modelHandle(diagnosticRecord(second) ? second["objectId"] : undefined);
      command = phase === "assets"
        ? { id, method, params: { ...effects, objectId, functionDeclaration: COMMON_PROGRAMS.assets, returnByValue: true,
          arguments: [{ objectId: callbackObjectId }, { objectId: constructorObjectId }] }, sessionId }
        : { id, method, params: { ...effects, objectId, functionDeclaration: COMMON_PROGRAMS[phase],
          objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false,
          arguments: [{ objectId: callbackObjectId }, { objectId: constructorObjectId }] }, sessionId };
      request = { ...base, commonPhase: phase, objectId, callbackObjectId, constructorObjectId };
    } else {
      command = phase === "metadata" ?
        { id, method, params: { ...effects, objectId, functionDeclaration: COMMON_PROGRAMS.metadata, returnByValue: true,
          arguments: [{ objectId: callbackObjectId }] }, sessionId } :
        { id, method, params: { ...effects, objectId, functionDeclaration: COMMON_PROGRAMS.constructors, returnByValue: false,
          arguments: [{ objectId: callbackObjectId }] }, sessionId };
      request = { ...base, commonPhase: phase, objectId, callbackObjectId };
    }
  } else { return null; }
  if (!("params" in command) || JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); }
  return { command, request };
}
/** Derive a fixed private model phase from the exact wire function/options.
 * No model phase or raw expression is accepted from a public request. */
function modelWire(id: number, method: unknown, params: Record<string, unknown>, sessionId: string, stringPurpose: boolean):
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
  } else if (method === "Runtime.callFunctionOn" && (params["functionDeclaration"] === CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR ||
    params["functionDeclaration"] === CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION)) {
    const args = params["arguments"], owner = params["functionDeclaration"] === CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION;
    if (!Array.isArray(args) || args.length !== (owner ? 14 : 1)) { return fail(); }
    const argument = (index: number): Readonly<{ objectId: string }> => {
      const value: unknown = args[index];
      if (!diagnosticRecord(value) || !diagnosticExact(value, ["objectId"])) { return fail(); }
      return { objectId: modelHandle(value["objectId"]) };
    };
    const callback = argument(0), objectId = modelHandle(params["objectId"]);
    if (owner) {
      const argumentsList = [callback, argument(1), argument(2), argument(3), argument(4), argument(5), argument(6), argument(7),
        argument(8), argument(9), argument(10), argument(11), argument(12), argument(13)] as const;
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION,
        returnByValue: false, arguments: argumentsList }, sessionId };
      request = { ...base, modelPhase: "teardrop-owner", objectId, callbackObjectId: callback.objectId,
        teardropCallbacksObjectId: argumentsList[1].objectId,
        teardropReceiver0: argumentsList[2].objectId, teardropReceiver1: argumentsList[3].objectId,
        teardropReceiver2: argumentsList[4].objectId, teardropReceiver3: argumentsList[5].objectId,
        teardropReceiver4: argumentsList[6].objectId, teardropReceiver5: argumentsList[7].objectId,
        teardropTarget0: argumentsList[8].objectId, teardropTarget1: argumentsList[9].objectId,
        teardropTarget2: argumentsList[10].objectId, teardropTarget3: argumentsList[11].objectId,
        teardropTarget4: argumentsList[12].objectId, teardropTarget5: argumentsList[13].objectId };
    } else {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR,
        returnByValue: false, arguments: [callback] }, sessionId };
      request = { ...base, modelPhase: "teardrop-callbacks", objectId, callbackObjectId: callback.objectId };
    }
  } else if (method === "Runtime.callFunctionOn" && (params["functionDeclaration"] === CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.diagnostic ||
    params["functionDeclaration"] === CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate)) {
    const functionDeclaration = stringPurpose ? CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate : CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.diagnostic;
    if (params["functionDeclaration"] !== functionDeclaration) { return fail(); }
    const args = params["arguments"];
    if (!Array.isArray(args) || args.length !== 2 || args.some(arg => !diagnosticRecord(arg) || !diagnosticExact(arg, ["objectId"])) ||
        !diagnosticRecord(args[0]) || !diagnosticRecord(args[1])) { return fail(); }
    const callbackObjectId = modelHandle(args[0]["objectId"]), objectId = modelHandle(params["objectId"]);
    const teardropObjectId = modelHandle(args[1]["objectId"]);
    command = { id, method, params: { ...effects, objectId, functionDeclaration, returnByValue: false,
      arguments: [{ objectId: callbackObjectId }, { objectId: teardropObjectId }] }, sessionId };
    request = { ...base, modelPhase: stringPurpose ? "constructors-precreate" : "constructors-diagnostic", objectId, callbackObjectId, teardropObjectId };
  } else if (method === "Runtime.callFunctionOn" && (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION ||
    params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION)) {
    const args = params["arguments"];
    const modelV2 = params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION;
    const pendingV2 = params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION;
    if ((modelV2 || pendingV2) && !stringPurpose) { return fail(); }
    const withConstructors = params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION ||
      params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION || pendingV2;
    const withTeardrop = params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION || pendingV2;
    let argumentCount = withConstructors ? 2 : 1;
    if (withTeardrop) { argumentCount = 3; }
    if (!Array.isArray(args) || args.length !== argumentCount ||
        args.some(arg => !diagnosticRecord(arg) || !diagnosticExact(arg, ["objectId"]))) { return fail(); }
    const first: unknown = args[0], second: unknown = args[1];
    if (!diagnosticRecord(first) || withConstructors && !diagnosticRecord(second)) { return fail(); }
    const callbackObjectId = modelHandle(first["objectId"]), objectId = modelHandle(params["objectId"]);
    const callParams = { returnByValue: true, arguments: [{ objectId: callbackObjectId }] as const } as const;
    const constructorObjectId = diagnosticRecord(second) ? modelHandle(second["objectId"]) : undefined;
    const third: unknown = args[2];
    const teardropObjectId = diagnosticRecord(third) ? modelHandle(third["objectId"]) : undefined;
    let modelPhase = "snapshot";
    if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION || pendingV2) {
      if (constructorObjectId === undefined || teardropObjectId === undefined) { return fail(); }
      command = { id, method, params: { ...effects, objectId, functionDeclaration: pendingV2 ? CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION : CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION,
        returnByValue: true, arguments: [{ objectId: callbackObjectId }, { objectId: constructorObjectId }, { objectId: teardropObjectId }] }, sessionId };
      modelPhase = pendingV2 ? "pending-v2" : "pending";
    } else if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION) {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, ...callParams }, sessionId };
      modelPhase = "raw-strings";
    } else if (params["functionDeclaration"] === CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION) {
      if (constructorObjectId === undefined) { return fail(); }
      command = { id, method, params: { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION,
        returnByValue: true, arguments: [{ objectId: callbackObjectId }, { objectId: constructorObjectId }] }, sessionId };
      modelPhase = "root-inventory";
    } else {
      command = { id, method, params: { ...effects, objectId, functionDeclaration: modelV2 ? CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION : CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, ...callParams }, sessionId };
      modelPhase = modelV2 ? "snapshot-v2" : "snapshot";
    }
    request = { ...base, modelPhase, objectId, callbackObjectId, ...(constructorObjectId === undefined ? {} : { constructorObjectId }),
      ...(teardropObjectId === undefined ? {} : { teardropObjectId }) };
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
  return fixedNativeRequest(chunk, false);
}
/** Separate fixed factory path. The public diagnostic owner never selects this
 * profile; it cannot upgrade its original native or byte-transport purpose. */
export function stringPrecreateNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  return fixedNativeRequest(chunk, true);
}
function stringWire(id: number, method: unknown, params: Record<string, unknown>, sessionId: string):
  Readonly<{ command: Omit<CurrentPcbStringPrecreateCommand, "stringPhase"> & Readonly<{ id: number; sessionId: string }>;
    request: Readonly<Record<string, unknown>> }> | null {
  let fixed: CurrentPcbStringPrecreateCommand | null = null;
  if (method === "Runtime.evaluate" && typeof params["uniqueContextId"] === "string") {
    const candidate = currentPcbStringWorkerCommand(params["uniqueContextId"]);
    if ("expression" in candidate.params && params["expression"] === candidate.params.expression) { fixed = candidate; }
  } else if (method === "Runtime.callFunctionOn") {
    const args = params["arguments"];
    if (Array.isArray(args) && (args.length === 1 || args.length === 2) && typeof params["objectId"] === "string" &&
        args.every(arg => diagnosticRecord(arg) && diagnosticExact(arg, ["objectId"]) && typeof arg["objectId"] === "string")) {
      const first: unknown = args[0], second: unknown = args[1];
      if (!diagnosticRecord(first)) { return fail(); }
      const callback = modelHandle(first["objectId"]);
      const candidates = args.length === 1 ? [currentPcbStringScopeCommand("renderer-association", params["objectId"], callback)] :
        (["empty-producers", "empty-producers-v2", "producer-markers-v2"] as const).map(phase =>
          currentPcbStringScopeCommand(phase, String(params["objectId"]), callback, modelHandle(diagnosticRecord(second) ? second["objectId"] : undefined)));
      fixed = candidates.find(candidate => "functionDeclaration" in candidate.params && params["functionDeclaration"] === candidate.params.functionDeclaration) ?? null;
    }
  }
  if (fixed === null) { return null; }
  if (JSON.stringify(params) !== JSON.stringify(fixed.params)) { return fail(); }
  const { stringPhase, ...wire } = fixed;
  return { command: { id, ...wire, sessionId }, request: { action: "send", requestId: id, method, sessionId, stringPhase,
    ...("uniqueContextId" in fixed.params ? { uniqueContextId: fixed.params.uniqueContextId } :
      { objectId: fixed.params.objectId, callbackObjectId: fixed.params.arguments[0].objectId,
        ...(fixed.stringPhase === "renderer-association" ? {} : { constructorObjectId: fixed.params.arguments[1].objectId }) }) } };
}
function fixedNativeRequest(chunk: Buffer, stringPurpose: boolean): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { return fail(); }
  const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8"));
  if (!diagnosticRecord(raw) || !Number.isSafeInteger(raw["id"]) || typeof raw["id"] !== "number" || raw["id"] < 1 ||
      raw["id"] > (stringPurpose ? CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT : DIAGNOSTIC_REQUEST_LIMIT)) { return fail(); }
  const id = raw["id"], method = raw["method"], params = raw["params"], sessionId = raw["sessionId"];
  if (Object.hasOwn(raw, "movePhase")) {
    if (!stringPurpose || method === "Runtime.evaluate" && chunk.length > 8192 ||
        method !== "Runtime.evaluate" && method !== "Runtime.callFunctionOn" && chunk.length > 1024) { return fail(); }
    const fixed = currentPcbStringMoveWire(raw, id);
    if (chunk.toString("utf8") !== `${JSON.stringify(fixed.command)}\0`) { return fail(); } return fixed.request;
  }
  if (Object.hasOwn(raw, "actorClockPhase")) {
    if (!stringPurpose) { return fail(); }
    const fixed = currentPcbStringActorClockWire(raw, id);
    if (chunk.toString("utf8") !== `${JSON.stringify(fixed.command)}\0`) { return fail(); } return fixed.request;
  }
  if (Object.hasOwn(raw, "workerProducerPhase")) {
    if (!stringPurpose || method === "Runtime.evaluate" && chunk.length > 8192 ||
        method !== "Runtime.evaluate" && method !== "Runtime.callFunctionOn" && chunk.length > 1024) { return fail(); }
    const fixed = currentPcbStringWorkerProducerWire(raw, id);
    if (chunk.toString("utf8") !== `${JSON.stringify(fixed.command)}\0`) { return fail(); } return fixed.request;
  }
  if (method === "Runtime.evaluate" && chunk.length > 8192 ||
      method !== "Runtime.evaluate" && method !== "Runtime.callFunctionOn" && chunk.length > 1024) { return fail(); }
  let command: DiagnosticCommand | (Omit<CurrentPcbStringPrecreateCommand, "stringPhase"> & Readonly<{ id: number; sessionId: string }>);
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
    const common = stringPurpose ? commonWire(id, method, params, sessionId) : null;
    const string = common === null && stringPurpose ? stringWire(id, method, params, sessionId) : null;
    const model = common === null && string === null ? modelWire(id, method, params, sessionId, stringPurpose) : null;
    if (common !== null) { command = common.command; request = common.request; }
    else if (string !== null) { command = string.command; request = string.request; }
    else if (model !== null) { command = model.command; request = model.request; }
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
      const layers209 = params["functionDeclaration"] === CURRENT_PCB_209_LAYERS_FUNCTION;
      const primitives209 = params["functionDeclaration"] === CURRENT_PCB_209_PRIMITIVES_FUNCTION;
      const extendedPrimitives209 = params["functionDeclaration"] === CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION;
      let fixed: ReturnType<typeof diagnosticOpeningParams>;
      if (extendedPrimitives209) {
        if (phase !== "observe") { return fail(); }
        fixed = diagnosticExtendedPrimitives209Params(params["uniqueContextId"], selected);
      } else if (primitives209) {
        if (phase !== "observe") { return fail(); }
        fixed = diagnosticPrimitives209Params(params["uniqueContextId"], selected);
      } else if (layers209) {
        if (phase !== "observe") { return fail(); }
        fixed = diagnosticLayers209Params(params["uniqueContextId"], selected);
      } else if (pcb) {
        if (phase !== "preflight" && phase !== "open-document" && phase !== "observe") { return fail(); }
        fixed = diagnosticPcbOpeningParams(params["uniqueContextId"], selected, phase);
      } else {
        if (phase !== "preflight" && phase !== "open-project") { return fail(); }
        fixed = diagnosticOpeningParams(params["uniqueContextId"], selected, phase);
      }
      if (JSON.stringify(params) !== JSON.stringify(fixed)) { return fail(); }
      command = { id, method, params: fixed, sessionId };
      let selectedPhase: Record<string, unknown> = { openingPhase: phase };
      if (extendedPrimitives209) { selectedPhase = { pcbExtendedPrimitives209Phase: phase }; }
      else if (primitives209) { selectedPhase = { pcbPrimitives209Phase: phase }; }
      else if (layers209) { selectedPhase = { pcbLayers209Phase: phase }; }
      else if (pcb) { selectedPhase = { pcbOpeningPhase: phase }; }
      request = { action: "send", requestId: id, method, sessionId, uniqueContextId: params["uniqueContextId"],
        ...selectedPhase,
        targetRawWindowsPath: selected.rawWindowsPath, targetProjectUuid: selected.projectUuid,
        targetBranchUuid: selected.branchUuid, targetDocumentUuid: selected.documentUuid, targetExpectedSourceSha256: selected.expectedSourceSha256 };
    } else { return fail(); }
  }
  if (chunk.toString("utf8") !== `${JSON.stringify(command)}\0`) { return fail(); }
  return request;
}
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }

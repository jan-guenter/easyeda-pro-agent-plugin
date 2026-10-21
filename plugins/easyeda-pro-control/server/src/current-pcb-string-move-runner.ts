/** Private, single-use eL collector. Full source/frame admission belongs to the
 * enclosing owner. This runner never calls eL, clears its timer or grants a write.
 * Mutable V8 scopes are freshly acquired, not adopted from a previous sample. */
import { types } from "node:util";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_STRING_MOVE_SELECTOR, CURRENT_PCB_STRING_MOVE_STATE, decodeCurrentPcbStringMoveClosure } from "./current-pcb-string-producer-program.ts";
import { decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "./current-pcb-string-producer-scope.ts";
import { retainCurrentPcbStringWorkerProducerReply } from "./current-pcb-string-worker-producer-evidence.ts";
import type { CurrentPcbStringWorkerProducerReply } from "./current-pcb-string-worker-producer-evidence.ts";
import { CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION, inspectCurrentPcbStringStartupRoute } from "./current-pcb-string-startup-state.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_MOVE_OBJECT_GROUP = "easyeda-pro-control-string-move-v1";
export const CURRENT_PCB_STRING_MOVE_REQUEST_COUNT = 12;
export const CURRENT_PCB_STRING_MOVE_EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true,
  awaitPromise: false, generatePreview: false, userGesture: false } as const);
export const CURRENT_PCB_STRING_MOVE_CALLS = Object.freeze({ handler: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  select: CURRENT_PCB_STRING_MOVE_SELECTOR, sample: CURRENT_PCB_STRING_MOVE_STATE, startup: CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION });
export const CURRENT_PCB_STRING_MOVE_ARGUMENT_COUNTS = Object.freeze({ handler: 0, select: 1, sample: 3, startup: 1 } as const);
export const CURRENT_PCB_STRING_MOVE_SEQUENCE = Object.freeze(["wrapper", "properties", "properties", "handler", "properties", "properties",
  "select", "properties", "properties", "sample", "startup", "release"] as const);
type Effects = typeof CURRENT_PCB_STRING_MOVE_EFFECTS;
export type CurrentPcbStringMoveCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ movePhase: "wrapper"; method: "Runtime.evaluate"; params: Effects & Readonly<{
    expression: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION; uniqueContextId: string; returnByValue: false;
    objectGroup: typeof CURRENT_PCB_STRING_MOVE_OBJECT_GROUP; timeout: 1000; includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ movePhase: keyof typeof CURRENT_PCB_STRING_MOVE_CALLS; method: "Runtime.callFunctionOn"; params: Effects & Readonly<{
    objectId: string; functionDeclaration: string; arguments: readonly Readonly<{ objectId: string }>[]; returnByValue: boolean;
    objectGroup: typeof CURRENT_PCB_STRING_MOVE_OBJECT_GROUP;
  }> }>
  | Readonly<{ movePhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ movePhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_PCB_STRING_MOVE_OBJECT_GROUP }> }>
);
export interface CurrentPcbStringMoveTransport {
  /** Fixed private adapter only. Reconstruct programs from movePhase. */
  readonly request: (command: CurrentPcbStringMoveCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
}
export interface CurrentPcbStringMoveOwner { readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string }
export interface CurrentPcbStringMoveIdentity { readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly windowTabId: string }
export interface CurrentPcbStringMoveObservation {
  readonly schema: "easyeda-pro-control.pcb-string-move-observation.v1";
  /** Project/branch/window come from the enclosing original owner. The fixed
   * native leaf independently matches documentUuid, not the entire association. */
  readonly identity: CurrentPcbStringMoveIdentity;
  readonly state: ReturnType<typeof decodeCurrentPcbStringMoveClosure>;
  readonly startup: ReturnType<typeof inspectCurrentPcbStringStartupRoute>;
  readonly noRetainedMoveState: boolean;
  readonly originalRunnerIssued: true;
  readonly continuousObservation: false;
  readonly completeProducerInventoryVerified: false;
  readonly queueCompletionVerified: false;
  readonly writeDestinationsContained: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}
export interface CurrentPcbStringMoveFailure {
  readonly schema: "easyeda-pro-control.pcb-string-move-failure.v1";
  readonly phase: CurrentPcbStringMoveCommand["movePhase"] | "owner" | "owner-final" | "identity" | "bounds";
  readonly requests: number;
  readonly cleanup: "not-started" | "released" | "failed";
  readonly sampleRetained: boolean;
  readonly startupSampleRetained: boolean;
  readonly executionAuthorized: false;
}
export interface CurrentPcbStringMoveReplies { readonly move: CurrentPcbStringWorkerProducerReply; readonly startup: CurrentPcbStringWorkerProducerReply }
const issued = new WeakMap<CurrentPcbStringMoveObservation, CurrentPcbStringMoveReplies>();
const failures = new WeakMap<object, Readonly<{ detail: CurrentPcbStringMoveFailure; reply: CurrentPcbStringWorkerProducerReply | null;
  startupReply: CurrentPcbStringWorkerProducerReply | null }>>();
function refuse(): never { throw new Error("PCB_STRING_MOVE_OBSERVATION"); }
function handle(value: string): string { if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); } return value; }
function empty(value: unknown): void {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null || Reflect.ownKeys(value).length > 0) { refuse(); }
}
/** Historical issuance only; runner.requireOriginal also rechecks its owner. */
export function requireOriginalCurrentPcbStringMoveReply(observation: CurrentPcbStringMoveObservation): CurrentPcbStringWorkerProducerReply {
  const reply = issued.get(observation); return reply?.move ?? refuse();
}
export function requireOriginalCurrentPcbStringMoveReplies(observation: CurrentPcbStringMoveObservation): CurrentPcbStringMoveReplies {
  return issued.get(observation) ?? refuse();
}
export function currentPcbStringMoveFailureDetail(error: unknown): CurrentPcbStringMoveFailure | null {
  return error !== null && typeof error === "object" ? failures.get(error)?.detail ?? null : null;
}
export function requireOriginalCurrentPcbStringMoveFailureReply(error: unknown): CurrentPcbStringWorkerProducerReply | null {
  const retained = error !== null && typeof error === "object" ? failures.get(error) : undefined;
  if (retained === undefined) { return refuse(); } return retained.reply;
}
export function requireOriginalCurrentPcbStringMoveFailureReplies(error: unknown):
Readonly<{ move: CurrentPcbStringWorkerProducerReply | null; startup: CurrentPcbStringWorkerProducerReply | null }> {
  const retained = error !== null && typeof error === "object" ? failures.get(error) : undefined;
  if (retained === undefined) { return refuse(); } return Object.freeze({ move: retained.reply, startup: retained.startupReply });
}

export class CurrentPcbStringMoveRunner {
  readonly #transport: CurrentPcbStringMoveTransport;
  readonly #owner: CurrentPcbStringMoveOwner;
  readonly #identity: CurrentPcbStringMoveIdentity;
  #consumed = false;
  #started = false;
  #lost = false;
  #requests = 0;
  #phase: CurrentPcbStringMoveFailure["phase"] = "owner";
  #result: CurrentPcbStringMoveObservation | undefined;
  #sample: CurrentPcbStringWorkerProducerReply | null = null;
  #startupSample: CurrentPcbStringWorkerProducerReply | null = null;
  public constructor(transport: CurrentPcbStringMoveTransport, owner: CurrentPcbStringMoveOwner, identity: CurrentPcbStringMoveIdentity) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#owner = Object.freeze({ sessionId: handle(owner.sessionId), scriptId: handle(owner.scriptId), uniqueContextId: handle(owner.uniqueContextId) });
    if (!/^(?:[a-f\d]{32}|[a-f\d]{64})$/u.test(identity.projectUuid) || !/^[a-f\d]{32}$/u.test(identity.branchUuid) ||
        !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(identity.documentUuid) || !/^[A-Za-z\d_-]{1,128}$/u.test(identity.windowTabId)) { refuse(); }
    this.#identity = Object.freeze({ projectUuid: identity.projectUuid, branchUuid: identity.branchUuid,
      documentUuid: identity.documentUuid, windowTabId: identity.windowTabId });
  }
  #current(): void {
    if (this.#lost) { refuse(); }
    try { this.#transport.assertCurrent(); } catch (error) { this.#lost = true; throw error; }
  }
  async #request(command: CurrentPcbStringMoveCommand): Promise<unknown> {
    this.#phase = command.movePhase; this.#current();
    if (this.#requests >= CURRENT_PCB_STRING_MOVE_REQUEST_COUNT - 1) { return refuse(); }
    this.#requests += 1; this.#started = true;
    const reply = await this.#transport.request(freezeDeep(command));
    if (command.movePhase === "sample" || command.movePhase === "startup") {
      // Snapshot the received own string before any owner callback can mutate
      // Its transport alias. Preserve it even when that callback then refuses.
      const retained = retainCurrentPcbStringWorkerProducerReply(reply);
      if (command.movePhase === "sample") { this.#sample = retained; } else { this.#startupSample = retained; }
      this.#current(); return retained;
    }
    this.#current(); return reply;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ sessionId: this.#owner.sessionId, movePhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #call(movePhase: keyof typeof CURRENT_PCB_STRING_MOVE_CALLS, objectId: string, arguments_: readonly string[]): Promise<unknown> {
    return this.#request({ sessionId: this.#owner.sessionId, movePhase, method: "Runtime.callFunctionOn", params: {
      ...CURRENT_PCB_STRING_MOVE_EFFECTS, objectId: handle(objectId), functionDeclaration: CURRENT_PCB_STRING_MOVE_CALLS[movePhase],
      arguments: arguments_.map(value => ({ objectId: handle(value) })), returnByValue: movePhase === "sample" || movePhase === "startup", objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP,
    } });
  }
  public requireOriginal(observation: CurrentPcbStringMoveObservation): CurrentPcbStringMoveObservation {
    this.#current(); if (observation !== this.#result || !issued.has(observation)) { return refuse(); } return observation;
  }
  public async observe(): Promise<CurrentPcbStringMoveObservation> {
    if (this.#consumed) { return refuse(); } this.#consumed = true;
    const errors: unknown[] = []; let result: CurrentPcbStringMoveObservation | undefined;
    let reply: CurrentPcbStringWorkerProducerReply | null = null;
    let startupReply: CurrentPcbStringWorkerProducerReply | null = null;
    let cleanup: CurrentPcbStringMoveFailure["cleanup"] = "not-started";
    try {
      const wrapper = decodeCurrentPcbDiagnosticModelFunction(await this.#request({ sessionId: this.#owner.sessionId,
        movePhase: "wrapper", method: "Runtime.evaluate", params: { ...CURRENT_PCB_STRING_MOVE_EFFECTS,
          expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#owner.uniqueContextId,
          returnByValue: false, objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } }), "rpc-wrapper");
      const wrapperList = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(wrapper), this.#owner.scriptId, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(wrapperList), "rpc-wrapper");
      const handler = decodeCurrentPcbDiagnosticModelFunction(await this.#call("handler", wrapperScope, []), "save-handler");
      const handlerList = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(handler), this.#owner.scriptId, "save-handler");
      const handlerScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(handlerList), "save-handler");
      const move = decodeCurrentPcbStringProducerFunction(await this.#call("select", handlerScope, [wrapper]), "move");
      const moveList = decodeCurrentPcbStringProducerScopeList(await this.#properties(move), this.#owner.scriptId, "move");
      const moveScopes = decodeCurrentPcbStringProducerScopes(await this.#properties(moveList), "move");
      reply = retainCurrentPcbStringWorkerProducerReply(await this.#call("sample", moveScopes[0] ?? refuse(), [move, handlerScope, wrapper]));
      const state = decodeCurrentPcbStringMoveClosure(reply); this.#phase = "identity";
      if (state.documentUuid !== this.#identity.documentUuid) { refuse(); }
      startupReply = retainCurrentPcbStringWorkerProducerReply(await this.#call("startup", handlerScope, [wrapper]));
      const startup = inspectCurrentPcbStringStartupRoute(startupReply); this.#phase = "identity";
      if (startup.state.documentUuid !== this.#identity.documentUuid) { refuse(); }
      this.#phase = "bounds"; if (this.#requests !== 11 || Buffer.byteLength(reply.result.value) > 4096 || Buffer.byteLength(startupReply.result.value) > 4096) { refuse(); }
      result = freezeDeep({ schema: "easyeda-pro-control.pcb-string-move-observation.v1", identity: this.#identity, state, startup,
        noRetainedMoveState: state.timer === "null" && state.selectionCount === 0 && state.builder === "null" && state.command === "null",
        originalRunnerIssued: true, continuousObservation: false, completeProducerInventoryVerified: false,
        queueCompletionVerified: false, writeDestinationsContained: false, saveAuthorized: false, executionAuthorized: false });
    } catch (error) { errors.push(error); }
    reply ??= this.#sample; startupReply ??= this.#startupSample;
    if (this.#started) {
      try {
        empty(await this.#transport.request(freezeDeep({ sessionId: this.#owner.sessionId, movePhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_STRING_MOVE_OBJECT_GROUP } })));
        cleanup = "released";
      } catch (error) { if (errors.length === 0) { this.#phase = "release"; } errors.push(error); cleanup = "failed"; }
      try { this.#current(); } catch (error) { if (errors.length === 0) { this.#phase = "owner-final"; } errors.push(error); }
    }
    if (errors.length > 0) {
      this.#lost = true;
      const detail: CurrentPcbStringMoveFailure = Object.freeze({ schema: "easyeda-pro-control.pcb-string-move-failure.v1", phase: this.#phase,
        requests: this.#requests, cleanup, sampleRetained: reply !== null, startupSampleRetained: startupReply !== null, executionAuthorized: false });
      const error = new AggregateError(errors, `PCB_STRING_MOVE_FAILED:${this.#phase}:${cleanup}`, { cause: errors[0] });
      failures.set(error, Object.freeze({ detail, reply, startupReply })); throw error;
    }
    if (result === undefined || reply === null || startupReply === null) { return refuse(); }
    issued.set(result, Object.freeze({ move: reply, startup: startupReply })); this.#result = result; return result;
  }
}

/** One retained-source PCB observation. The owner must already have admitted
 * an existing PCB default frame or the sealed opener's verified PCB child,
 * its exact source bytes, session/context and original native lifecycle.
 * This module has no public caller-JavaScript or remote-object selector input.
 */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, decodeCurrentPcbDiagnosticModelReply } from "./current-pcb-diagnostic-model-program.ts";
import type { CurrentPcbDiagnosticModelState } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, decodeCurrentPcbDiagnosticPendingReply } from "./current-pcb-diagnostic-pending-program.ts";
import type { CurrentPcbDiagnosticPendingState } from "./current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import type { CurrentPcbDiagnosticRawStrings } from "./current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, decodeCurrentPcbDiagnosticRootInventoryReply } from "./current-pcb-diagnostic-root-inventory.ts";
import type { CurrentPcbDiagnosticRootInventory } from "./current-pcb-diagnostic-root-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentPcbObservationFailure } from "./current-pcb-observation-failure.ts";
import type { CurrentPcbObservationPhase } from "./current-pcb-observation-failure.ts";

export const CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP = "easyeda-pro-control-pcb-model-v1";
const OBSERVATION_BYTES = 131_072;
export type CurrentPcbDiagnosticModelObservation = Readonly<{
  readonly schema: "easyeda-pro-control.pcb-diagnostic-model-observation.v1";
  readonly documentUuid: string;
  readonly compilerState: CurrentPcbDiagnosticModelState;
  readonly pendingProducers: CurrentPcbDiagnosticPendingState;
  readonly rawStrings: CurrentPcbDiagnosticRawStrings;
  readonly rootInventory: CurrentPcbDiagnosticRootInventory;
  readonly atomicSnapshotVerified: false;
  readonly continuousObservation: false;
  readonly completeModelMembershipVerified: false;
  readonly completePendingProducerInventoryVerified: false;
  readonly queueCompletionVerified: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}>;
const EFFECT_FLAGS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
interface EffectFlags {
  readonly throwOnSideEffect: true; readonly silent: true; readonly awaitPromise: false;
  readonly generatePreview: false; readonly userGesture: false;
}
export type CurrentPcbDiagnosticModelCommand =
  | Readonly<{ modelPhase: "wrapper"; method: "Runtime.evaluate"; params: EffectFlags & Readonly<{
    expression: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION; uniqueContextId: string;
    objectGroup: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP; returnByValue: false;
    includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false; timeout: 1000;
  }> }>
  | Readonly<{ modelPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ modelPhase: "handler"; method: "Runtime.callFunctionOn"; params: EffectFlags & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION; returnByValue: false;
  }> }>
  | Readonly<{ modelPhase: "snapshot"; method: "Runtime.callFunctionOn"; params: EffectFlags & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ modelPhase: "pending"; method: "Runtime.callFunctionOn"; params: EffectFlags & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ modelPhase: "raw-strings"; method: "Runtime.callFunctionOn"; params: EffectFlags & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ modelPhase: "root-inventory"; method: "Runtime.callFunctionOn"; params: EffectFlags & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ modelPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP;
  }> }>;
export interface CurrentPcbDiagnosticModelTransport {
  /** Must use the already retained page session/pipe, never a new attachment.
   * The native receiver reconstructs the fixed program from modelPhase and
   * validates only the bounded retained object/context handles in the command.
   */
  request: (command: CurrentPcbDiagnosticModelCommand) => Promise<unknown>;
  /** Must recheck the same admitted native/session/frame/context/source owner.
   * Called before/after every observation request; no new target discovery.
   */
  assertCurrent: () => void;
}
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_MODEL_OBSERVATION"); }
function handle(value: string): string {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); }
  return value;
}
function emptyReply(value: unknown): void {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null ||
      Reflect.ownKeys(value).length > 0) { refuse(); }
}

export class CurrentPcbDiagnosticModelRunner {
  readonly #transport: CurrentPcbDiagnosticModelTransport;
  readonly #scriptId: string;
  readonly #uniqueContextId: string;
  #consumed = false;
  #phase: CurrentPcbObservationPhase = "owner";

  /** These identities come from the original source-admitted context object,
   * never public tool arguments. A matching supplied ID is not source proof. */
  public constructor(transport: CurrentPcbDiagnosticModelTransport, scriptId: string, uniqueContextId: string) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#scriptId = handle(scriptId); this.#uniqueContextId = handle(uniqueContextId);
  }
  async #request(command: CurrentPcbDiagnosticModelCommand): Promise<unknown> {
    this.#phase = command.modelPhase;
    this.#transport.assertCurrent();
    const reply = await this.#transport.request(freezeDeep(command));
    this.#transport.assertCurrent();
    return reply;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ modelPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  public async observe(): Promise<CurrentPcbDiagnosticModelObservation> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true;
    let cleanupFailed = false, started = false;
    const failures: unknown[] = [];
    let result: CurrentPcbDiagnosticModelObservation | undefined;
    try {
      this.#transport.assertCurrent(); started = true;
      const wrapper = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        modelPhase: "wrapper", method: "Runtime.evaluate", params: { ...EFFECT_FLAGS,
          expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#uniqueContextId,
          objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP, returnByValue: false, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false },
      }), "rpc-wrapper");
      const wrapperScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(wrapper), this.#scriptId, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(wrapperScopes), "rpc-wrapper");
      const handler = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        modelPhase: "handler", method: "Runtime.callFunctionOn", params: { ...EFFECT_FLAGS,
          objectId: wrapperScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false },
      }), "save-handler");
      const handlerScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(handler), this.#scriptId, "save-handler");
      const handlerScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(handlerScopes), "save-handler");
      const compilerState = decodeCurrentPcbDiagnosticModelReply(await this.#request({
        modelPhase: "snapshot", method: "Runtime.callFunctionOn", params: { ...EFFECT_FLAGS,
          objectId: handlerScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION,
          returnByValue: true, arguments: [{ objectId: wrapper }] },
      }));
      const pendingProducers = decodeCurrentPcbDiagnosticPendingReply(await this.#request({
        modelPhase: "pending", method: "Runtime.callFunctionOn", params: { ...EFFECT_FLAGS,
          objectId: handlerScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION,
          returnByValue: true, arguments: [{ objectId: wrapper }] },
      }));
      const rawStrings = decodeCurrentPcbDiagnosticRawStringsReply(await this.#request({
        modelPhase: "raw-strings", method: "Runtime.callFunctionOn", params: { ...EFFECT_FLAGS,
          objectId: handlerScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION,
          returnByValue: true, arguments: [{ objectId: wrapper }] },
      }));
      const rootInventory = decodeCurrentPcbDiagnosticRootInventoryReply(await this.#request({
        modelPhase: "root-inventory", method: "Runtime.callFunctionOn", params: { ...EFFECT_FLAGS,
          objectId: handlerScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION,
          returnByValue: true, arguments: [{ objectId: wrapper }] },
      }));
      this.#phase = "identity";
      if (compilerState.main.uuid !== pendingProducers.documentUuid || compilerState.main.uuid !== rawStrings.documentUuid ||
          compilerState.main.uuid !== rootInventory.documentUuid) { return refuse(); }
      // Separate synchronous samples remain non-atomic across these CDP calls.
      // They do not establish a writer baseline or pending-producer completion.
      const observation: CurrentPcbDiagnosticModelObservation = freezeDeep({
        schema: "easyeda-pro-control.pcb-diagnostic-model-observation.v1", documentUuid: compilerState.main.uuid,
        compilerState, pendingProducers, rawStrings, rootInventory, atomicSnapshotVerified: false, continuousObservation: false,
        completeModelMembershipVerified: false, completePendingProducerInventoryVerified: false,
        queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false,
      });
      this.#phase = "bounds";
      if (Buffer.byteLength(canonicalJson(observation), "utf8") > OBSERVATION_BYTES) { return refuse(); }
      result = observation;
    } catch (caughtError) { failures.push(caughtError); }
    const failurePhase = this.#phase;
    if (started) {
      try {
        // Release only this original object group, even after context rejection.
        // A failed/poisoned transport must reject without dispatching another
        // Request. Release failure withholds the observation; no fallback pipe.
        emptyReply(await this.#transport.request(freezeDeep({ modelPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } })));
      } catch (caughtError) { cleanupFailed = true; failures.push(caughtError); }
    }
    if (failures.length > 0) { throw currentPcbObservationFailure("MODEL", failures.length === 1 && cleanupFailed ? "release" : failurePhase, failures, cleanupFailed); }
    if (result === undefined) { return refuse(); }
    return result;
  }
}

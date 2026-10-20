/** Original-context observations only. This runner issues no writer baseline,
 * publication-capture, FileSource, Save or saved-state authority. */
/* oxlint-disable import/max-dependencies -- The joined runner retains seven independently audited fixed readers and their strict decoders rather than merging their trust boundaries. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLES, CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS,
  decodeCurrentPcbConstructorBundle, decodeCurrentPcbConstructorProperties, decodeCurrentPcbConstructorTuple } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, decodeCurrentPcbDiagnosticModelReply } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelCommand } from "./current-pcb-diagnostic-model-runner.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, decodeCurrentPcbDiagnosticPendingReply } from "./current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, decodeCurrentPcbDiagnosticRootInventoryReply } from "./current-pcb-diagnostic-root-inventory.ts";
import { compareCurrentPcbStringChannelAssociation, decodeCurrentPcbStringRendererAssociation,
  decodeCurrentPcbStringWorkerAssociation } from "./current-pcb-string-association.ts";
import { currentPcbStringScopeCommand, currentPcbStringWorkerCommand } from "./current-pcb-string-commands.ts";
import type { CurrentPcbStringPrecreateCommand } from "./current-pcb-string-commands.ts";
import { inspectCurrentPcbStringEmptyBaseline } from "./current-pcb-string-empty-baseline.ts";
import { decodeCurrentPcbStringEmptyProducers } from "./current-pcb-string-empty-producers.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentPcbObservationFailure } from "./current-pcb-observation-failure.ts";
import type { CurrentPcbObservationPhase } from "./current-pcb-observation-failure.ts";

export type CurrentPcbStringObservationCommand = CurrentPcbDiagnosticModelCommand | CurrentPcbStringPrecreateCommand;
export interface CurrentPcbStringPrecreateTransport {
  readonly request: (command: CurrentPcbStringObservationCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
  /** Exactly Target.getTargets and Page.getFrameTree. The owner rechecks the
   * original UI, PCB and selected worker contexts against their retained tree. */
  readonly observeCurrent: () => Promise<void>;
}
interface Target {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly windowTabId: string;
}
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
function refuse(): never { throw new Error("PCB_STRING_PRECREATE_OBSERVATION"); }
function handle(value: string): string {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); }
  return value;
}
export class CurrentPcbStringPrecreateRunner {
  readonly #transport: CurrentPcbStringPrecreateTransport;
  readonly #script: string;
  readonly #context: string;
  readonly #worker: string;
  readonly #target: Target;
  #consumed = false;
  #phase: CurrentPcbObservationPhase = "owner";
  public constructor(transport: CurrentPcbStringPrecreateTransport, script: string, context: string,
    workerContext: string, target: Target) {
    this.#transport = Object.freeze({ ...transport }); this.#script = handle(script); this.#context = handle(context);
    this.#worker = handle(workerContext);
    if (!/^[a-f\d]{64}$/u.test(target.projectUuid) || !/^[a-f\d]{32}$/u.test(target.branchUuid) ||
        !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(target.documentUuid) ||
        !/^[A-Za-z\d_-]{1,128}$/u.test(target.windowTabId)) { refuse(); }
    this.#target = Object.freeze({ projectUuid: target.projectUuid, branchUuid: target.branchUuid,
      documentUuid: target.documentUuid, windowTabId: target.windowTabId });
  }
  async #request(command: CurrentPcbStringObservationCommand): Promise<unknown> {
    this.#phase = "stringPhase" in command ? command.stringPhase : command.modelPhase;
    this.#transport.assertCurrent();
    const reply = await this.#transport.request(freezeDeep(command));
    this.#transport.assertCurrent(); return reply;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ modelPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #constructors(scope: string, wrapper: string): Promise<string> {
    const bundle = decodeCurrentPcbConstructorBundle(await this.#request({ modelPhase: "constructors-precreate",
      method: "Runtime.callFunctionOn", params: { ...EFFECTS, objectId: scope,
        functionDeclaration: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate, returnByValue: false,
        arguments: [{ objectId: wrapper }] } }), "precreate");
    const handles = decodeCurrentPcbConstructorTuple(await this.#properties(bundle), "precreate"), prototypes = new Set<string>();
    for (const [index, name] of CURRENT_PCB_CONSTRUCTOR_BUNDLES.precreate.entries()) {
      const selected = handles[index]; if (selected === undefined) { return refuse(); }
      const qualified = decodeCurrentPcbConstructorProperties(await this.#properties(selected), this.#script, name);
      if (prototypes.has(qualified.prototypeId)) { return refuse(); } prototypes.add(qualified.prototypeId);
    }
    return bundle;
  }
  async #sweep(scope: string, wrapper: string, constructors: string): Promise<Readonly<Record<string, unknown>>> {
    this.#phase = "owner-observation";
    this.#transport.assertCurrent(); await this.#transport.observeCurrent(); this.#transport.assertCurrent();
    const args = Object.freeze([{ objectId: wrapper }] as const);
    const params = { ...EFFECTS, objectId: scope } as const;
    const call = { returnByValue: true, arguments: args } as const;
    const modelReply = await this.#request({ modelPhase: "snapshot", method: "Runtime.callFunctionOn",
      params: { ...params, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, ...call } });
    const compilerState = decodeCurrentPcbDiagnosticModelReply(modelReply);
    const pendingReply = await this.#request({ modelPhase: "pending", method: "Runtime.callFunctionOn",
      params: { ...params, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, returnByValue: true,
        arguments: [{ objectId: wrapper }, { objectId: constructors }] } });
    const pendingProducers = decodeCurrentPcbDiagnosticPendingReply(pendingReply);
    const stringsReply = await this.#request({ modelPhase: "raw-strings", method: "Runtime.callFunctionOn",
      params: { ...params, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, ...call } });
    const rawStrings = decodeCurrentPcbDiagnosticRawStringsReply(stringsReply);
    const rootReply = await this.#request({ modelPhase: "root-inventory", method: "Runtime.callFunctionOn",
      params: { ...params, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, returnByValue: true,
        arguments: [{ objectId: wrapper }, { objectId: constructors }] } });
    const rootInventory = decodeCurrentPcbDiagnosticRootInventoryReply(rootReply);
    const rendererReply = await this.#request(currentPcbStringScopeCommand("renderer-association", scope, wrapper));
    const rendererAssociation = decodeCurrentPcbStringRendererAssociation(rendererReply);
    const workerReply = await this.#request(currentPcbStringWorkerCommand(this.#worker));
    const workerAssociation = decodeCurrentPcbStringWorkerAssociation(workerReply);
    const producersReply = await this.#request(currentPcbStringScopeCommand("empty-producers", scope, wrapper, constructors));
    const emptyProducers = decodeCurrentPcbStringEmptyProducers(producersReply);
    this.#phase = "identity";
    const channelAssociation = compareCurrentPcbStringChannelAssociation(rendererReply, workerReply);
    const identity = channelAssociation.identity;
    if (identity.projectUuid !== this.#target.projectUuid || identity.branchUuid !== this.#target.branchUuid ||
        identity.windowTabId !== this.#target.windowTabId || identity.uniqueId !== compilerState.main.uniqueId ||
        [compilerState.main.uuid, pendingProducers.documentUuid, rawStrings.documentUuid, rootInventory.documentUuid,
          identity.documentUuid, emptyProducers.documentUuid].some(value => value !== this.#target.documentUuid)) { return refuse(); }
    this.#phase = "empty-baseline";
    const emptyBaseline = inspectCurrentPcbStringEmptyBaseline(this.#target.documentUuid, { modelReply, pendingReply, stringsReply, rootReply });
    const sample = freezeDeep({ compilerState, pendingProducers, rawStrings, rootInventory, rendererAssociation,
      workerAssociation, emptyProducers, channelAssociation, emptyBaseline });
    // Four diagnostic samples retain their combined128KiB limit; three added
    // Readers each retain16KiB. Composition metadata has a separate8KiB reserve.
    this.#phase = "bounds";
    if (Buffer.byteLength(canonicalJson({ compilerState, pendingProducers, rawStrings, rootInventory })) > 131_072 ||
        Buffer.byteLength(canonicalJson(sample)) > 188_416) { return refuse(); }
    this.#phase = "owner-observation";
    this.#transport.assertCurrent(); await this.#transport.observeCurrent(); this.#transport.assertCurrent();
    return sample;
  }
  public async observe(): Promise<Readonly<Record<string, unknown>>> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true; let cleanupFailed = false, started = false;
    const failures: unknown[] = [];
    let result: Readonly<Record<string, unknown>> | undefined;
    try {
      this.#transport.assertCurrent(); started = true;
      const wrapper = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        modelPhase: "wrapper", method: "Runtime.evaluate", params: { ...EFFECTS,
          expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#context,
          objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP, returnByValue: false, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false },
      }), "rpc-wrapper");
      const wrapperScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(wrapper), this.#script, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(wrapperScopes), "rpc-wrapper");
      const handler = decodeCurrentPcbDiagnosticModelFunction(await this.#request({
        modelPhase: "handler", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId: wrapperScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false },
      }), "save-handler");
      const handlerScopes = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties(handler), this.#script, "save-handler");
      const scope = decodeCurrentPcbDiagnosticModelScope(await this.#properties(handlerScopes), "save-handler");
      const constructors = await this.#constructors(scope, wrapper);
      const first = await this.#sweep(scope, wrapper, constructors), second = await this.#sweep(scope, wrapper, constructors);
      this.#phase = "sample-match";
      if (canonicalJson(first) !== canonicalJson(second)) { return refuse(); }
      result = freezeDeep({ schema: "easyeda-pro-control.pcb-string-precreate-observation.v1",
        target: this.#target, first, second, matchingSamples: true, atomicSnapshotVerified: false,
        originalContextsRechecked: true, projectWorkerAssociationVerified: false, publicationCaptureVerified: false,
        completeLiveSourceVerified: false, continuousObservation: false, queueCompletionVerified: false,
        saveAuthorized: false, executionAuthorized: false });
    } catch (caughtError) { failures.push(caughtError); }
    let failurePhase = this.#phase;
    if (started) {
      try {
        const reply = await this.#transport.request(freezeDeep({ modelPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } }));
        if (reply === null || typeof reply !== "object" || types.isProxy(reply) || Array.isArray(reply) ||
            Object.getPrototypeOf(reply) !== Object.prototype && Object.getPrototypeOf(reply) !== null ||
            Reflect.ownKeys(reply).length > 0) { refuse(); }
      } catch (caughtError) { cleanupFailed = true; failures.push(caughtError); }
    }
    if (failures.length === 0) {
      failurePhase = "owner-final";
      try { this.#transport.assertCurrent(); } catch (caughtError) { failures.push(caughtError); }
    }
    if (failures.length > 0) { throw currentPcbObservationFailure("STRING_PRECREATE", failures.length === 1 && cleanupFailed ? "release" : failurePhase, failures, cleanupFailed); }
    if (result === undefined) { return refuse(); }
    return result;
  }
}

/** Single-use original-worker collector. The native owner admits full source,
 * worker association and context before construction and rechecks every await.
 * No callback is called; this is not publisher containment or writer authority. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { decodeCurrentPcbStringBufferedCallbackEnvironment } from "./current-pcb-string-producer-callback-program.ts";
import { decodeCurrentPcbStringProducerCallbackFunction, decodeCurrentPcbStringProducerCallbackScope,
  decodeCurrentPcbStringProducerCallbackScopeList } from "./current-pcb-string-producer-callback-scope.ts";
import type { CurrentPcbStringProducerCallbackKind } from "./current-pcb-string-producer-callback-scope.ts";
import { decodeCurrentPcbStringCooperationClosure, decodeCurrentPcbStringDebounceClosure,
  decodeCurrentPcbStringSerialClosure, decodeCurrentPcbStringUploadClosure } from "./current-pcb-string-producer-program.ts";
import { decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "./current-pcb-string-producer-scope.ts";
import type { CurrentPcbStringProducerKind } from "./current-pcb-string-producer-scope.ts";
import { decodeCurrentPcbStringWorkerGates } from "./current-pcb-string-worker-gate-program.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_ORDER, decodeCurrentPcbStringWorkerGateBundle,
  decodeCurrentPcbStringWorkerGateProperties, decodeCurrentPcbStringWorkerGateScope,
  decodeCurrentPcbStringWorkerGateTuple, decodeCurrentPcbStringWorkerProject } from "./current-pcb-string-worker-gate-scope.ts";
import { CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP, CURRENT_PCB_STRING_WORKER_PRODUCER_OBSERVATION_BYTES,
  CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT, CURRENT_PCB_STRING_WORKER_PRODUCER_RETAINED_BYTES } from "./current-pcb-string-worker-producer-commands.ts";
import type { CurrentPcbStringWorkerProducerCall, CurrentPcbStringWorkerProducerCommand,
  CurrentPcbStringWorkerProducerEvaluation } from "./current-pcb-string-worker-producer-commands.ts";
import { currentPcbStringWorkerProducerFailure, retainCurrentPcbStringWorkerProducerReply } from "./current-pcb-string-worker-producer-evidence.ts";
import type { CurrentPcbStringWorkerProducerPhase, CurrentPcbStringWorkerProducerReplies,
  CurrentPcbStringWorkerProducerReply, CurrentPcbStringWorkerProducerSample } from "./current-pcb-string-worker-producer-evidence.ts";
// oxlint-disable-next-line import/max-dependencies -- One fixed runner composes the separately audited worker readers, decoders, grammar and evidence boundary.
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbStringWorkerProducerTransport {
  readonly request: (command: CurrentPcbStringWorkerProducerCommand) => Promise<unknown>;
  /** Recheck the original retained worker, full source, context and native owner;
   * must not rediscover, reattach, repair, navigate or accept a new context. */
  readonly assertCurrent: () => void;
}
export interface CurrentPcbStringWorkerProducerOwner { readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string }
export interface CurrentPcbStringWorkerProducerIdentity { readonly projectUuid: string; readonly branchUuid: string; readonly windowTabId: string }
export interface CurrentPcbStringWorkerProducerObservation {
  readonly schema: "easyeda-pro-control.pcb-string-worker-producer-observation.v1";
  readonly identity: CurrentPcbStringWorkerProducerIdentity;
  readonly gates: ReturnType<typeof decodeCurrentPcbStringWorkerGates>;
  readonly uploadStructure: ReturnType<typeof decodeCurrentPcbStringSerialClosure>;
  readonly structure: ReturnType<typeof decodeCurrentPcbStringSerialClosure>;
  readonly debounce: ReturnType<typeof decodeCurrentPcbStringDebounceClosure>;
  readonly cooperation: ReturnType<typeof decodeCurrentPcbStringCooperationClosure>;
  readonly upload: ReturnType<typeof decodeCurrentPcbStringUploadClosure>;
  readonly bufferedEnvironment: ReturnType<typeof decodeCurrentPcbStringBufferedCallbackEnvironment>;
  readonly qualifiedCallbacks: readonly CurrentPcbStringProducerCallbackKind[];
  readonly originalRunnerIssued: true;
  readonly hiddenCallbackReceiversVerified: false;
  readonly completePublishersVerified: false;
  readonly writeDestinationsContained: false;
  readonly atomicSnapshotVerified: false;
  readonly continuousObservation: false;
  readonly queueCompletionVerified: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}
const issued = new WeakMap<CurrentPcbStringWorkerProducerObservation, CurrentPcbStringWorkerProducerReplies>();
/** Historical issuance only. Use runner.requireOriginal for a current-owner
 * check. No decoded JSON, supplied handles or substituted report can be adopted. */
export function requireOriginalCurrentPcbStringWorkerProducerReplies(observation: CurrentPcbStringWorkerProducerObservation): CurrentPcbStringWorkerProducerReplies {
  const replies = issued.get(observation); if (replies === undefined) { return refuse(); } return replies;
}
function refuse(): never { throw new Error("PCB_STRING_WORKER_PRODUCER_OBSERVATION"); }
function handle(value: string): string { if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); } return value; }
function empty(value: unknown): void {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null || Reflect.ownKeys(value).length > 0) { refuse(); }
}
const EFFECTS = CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS;
const GROUP = CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP;

export class CurrentPcbStringWorkerProducerRunner {
  readonly #transport: CurrentPcbStringWorkerProducerTransport;
  readonly #owner: CurrentPcbStringWorkerProducerOwner;
  readonly #identity: CurrentPcbStringWorkerProducerIdentity;
  readonly #replies: Partial<Record<CurrentPcbStringWorkerProducerSample, CurrentPcbStringWorkerProducerReply>> = {};
  #consumed = false;
  #started = false;
  #requests = 0;
  #phase: CurrentPcbStringWorkerProducerPhase = "owner";
  #result: CurrentPcbStringWorkerProducerObservation | undefined;
  #lost = false;
  public constructor(transport: CurrentPcbStringWorkerProducerTransport, owner: CurrentPcbStringWorkerProducerOwner,
    identity: CurrentPcbStringWorkerProducerIdentity) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#owner = Object.freeze({ sessionId: handle(owner.sessionId), scriptId: handle(owner.scriptId), uniqueContextId: handle(owner.uniqueContextId) });
    if (!/^(?:[a-f\d]{32}|[a-f\d]{64})$/u.test(identity.projectUuid) || !/^[a-f\d]{32}$/u.test(identity.branchUuid) ||
        !/^[A-Za-z\d_-]{1,128}$/u.test(identity.windowTabId)) { refuse(); }
    this.#identity = Object.freeze({ projectUuid: identity.projectUuid, branchUuid: identity.branchUuid, windowTabId: identity.windowTabId });
  }
  #current(): void {
    if (this.#lost) { refuse(); }
    try { this.#transport.assertCurrent(); } catch (error) { this.#lost = true; throw error; }
  }
  async #request(command: CurrentPcbStringWorkerProducerCommand): Promise<unknown> {
    this.#phase = command.workerProducerPhase; this.#current();
    if (this.#requests >= CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT - 1) { return refuse(); }
    this.#requests += 1;
    this.#started = true;
    const reply = await this.#transport.request(freezeDeep(command));
    const phase = command.workerProducerPhase;
    if (phase === "gates" || phase === "upload-structure" || phase === "structure" || phase === "debounce" ||
        phase === "cooperation" || phase === "upload" || phase === "buffered-environment") {
      // Retain the received own string before post-arrival owner callbacks,
      // Including callbacks which refuse or mutate the transport alias.
      const retained = retainCurrentPcbStringWorkerProducerReply(reply);
      this.#replies[phase] = retained; this.#current(); return retained;
    }
    this.#current(); return reply;
  }
  #evaluate(workerProducerPhase: CurrentPcbStringWorkerProducerEvaluation): Promise<unknown> {
    return this.#request({ sessionId: this.#owner.sessionId, workerProducerPhase, method: "Runtime.evaluate", params: {
      ...EFFECTS, expression: CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS[workerProducerPhase], uniqueContextId: this.#owner.uniqueContextId,
      objectGroup: GROUP, returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
    } });
  }
  #call(workerProducerPhase: CurrentPcbStringWorkerProducerCall, objectId: string, args: readonly string[] = []): Promise<unknown> {
    const signature = CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS[workerProducerPhase];
    if (args.length !== signature.count) { return refuse(); }
    return this.#request({ sessionId: this.#owner.sessionId, workerProducerPhase, method: "Runtime.callFunctionOn", params: {
      ...EFFECTS, objectId: handle(objectId), functionDeclaration: CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS[workerProducerPhase], objectGroup: GROUP,
      returnByValue: signature.returnByValue, arguments: args.map(value => ({ objectId: handle(value) })),
    } });
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ sessionId: this.#owner.sessionId, workerProducerPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #scopes(original: string, kind: CurrentPcbStringProducerKind): Promise<readonly string[]> {
    const list = decodeCurrentPcbStringProducerScopeList(await this.#properties(original), this.#owner.scriptId, kind);
    return decodeCurrentPcbStringProducerScopes(await this.#properties(list), kind);
  }
  async #firstScope(original: string, kind: CurrentPcbStringProducerKind): Promise<string> {
    const scopes = await this.#scopes(original, kind); return scopes[0] ?? refuse();
  }
  #matches(identity: CurrentPcbStringWorkerProducerIdentity): void {
    if (identity.projectUuid !== this.#identity.projectUuid || identity.branchUuid !== this.#identity.branchUuid ||
        identity.windowTabId !== this.#identity.windowTabId) { refuse(); }
  }
  async #sample(phase: CurrentPcbStringWorkerProducerSample, receiver: string, args: readonly string[]): Promise<CurrentPcbStringWorkerProducerReply> {
    await this.#call(phase, receiver, args); return this.#replies[phase] ?? refuse();
  }
  async #callback(phase: "upload-structure-callback" | "structure-callback" | "cooperation-callback" | "upload-callback" | "buffer-callback" | "drain-callback",
    kind: CurrentPcbStringProducerCallbackKind, receiver: string, args: readonly string[]): Promise<string> {
    const callback = decodeCurrentPcbStringProducerCallbackFunction(await this.#call(phase, receiver, args), kind);
    decodeCurrentPcbStringProducerCallbackScopeList(await this.#properties(callback), this.#owner.scriptId, kind); return callback;
  }
  async #callbackScope(callback: string, kind: "buffer" | "drain"): Promise<string> {
    const list = decodeCurrentPcbStringProducerCallbackScopeList(await this.#properties(callback), this.#owner.scriptId, kind);
    return decodeCurrentPcbStringProducerCallbackScope(await this.#properties(list.scopesId), kind);
  }
  async #gates(): Promise<ReturnType<typeof decodeCurrentPcbStringWorkerGates>> {
    const project = decodeCurrentPcbStringWorkerProject(await this.#evaluate("project"));
    const bundle = decodeCurrentPcbStringWorkerGateBundle(await this.#call("gate-select", project));
    const methods = decodeCurrentPcbStringWorkerGateTuple(await this.#properties(bundle));
    for (const [index, kind] of CURRENT_PCB_STRING_WORKER_GATE_ORDER.entries()) {
      decodeCurrentPcbStringWorkerGateProperties(await this.#properties(methods[index] ?? refuse()), this.#owner.scriptId, kind);
    }
    const list = decodeCurrentPcbStringWorkerGateProperties(await this.#properties(methods[2] ?? refuse()), this.#owner.scriptId, "canPublish");
    const scope = decodeCurrentPcbStringWorkerGateScope(await this.#properties(list.scopesId));
    const result = decodeCurrentPcbStringWorkerGates(await this.#sample("gates", project, [bundle, scope])); this.#matches(result.identity); return result;
  }
  async #serial(phase: "upload-structure" | "structure"):
  Promise<Readonly<{ original: string; scope: string; state: ReturnType<typeof decodeCurrentPcbStringSerialClosure> }>> {
    const original = decodeCurrentPcbStringProducerFunction(await this.#evaluate(phase === "structure" ? "structure-select" : "upload-structure-select"), "serial");
    const scope = await this.#firstScope(original, "serial");
    const state = decodeCurrentPcbStringSerialClosure(await this.#sample(phase, scope, [original]));
    this.#matches(state.identity); if (state.kind !== (phase === "structure" ? "structure" : "uploadStructure")) { return refuse(); }
    return { original, scope, state };
  }
  async #collect(): Promise<CurrentPcbStringWorkerProducerObservation> {
    const gates = await this.#gates(), uploadStructure = await this.#serial("upload-structure");
    // Callback selection only reads immutable source-defined function bindings;
    // No later mutable-state sample reuses these wrappers.
    await this.#callback("upload-structure-callback", "uploadStructure", uploadStructure.scope, [uploadStructure.original]);
    const structure = await this.#serial("structure");
    const serialScope = await this.#firstScope(structure.original, "serial");
    const debounceHandle = decodeCurrentPcbStringProducerFunction(await this.#call("debounce-select", serialScope, [structure.original]), "debounce");
    const debounceScopes = await this.#scopes(debounceHandle, "debounce"), parameters = debounceScopes[1] ?? refuse();
    const debounce = decodeCurrentPcbStringDebounceClosure(await this.#sample("debounce", debounceScopes[0] ?? refuse(),
      [parameters, serialScope, structure.original, debounceHandle])); this.#matches(debounce.identity);
    await this.#callback("structure-callback", "structure", parameters, [structure.original, serialScope, debounceHandle]);
    const cooperationHandle = decodeCurrentPcbStringProducerFunction(await this.#evaluate("cooperation-select"), "cooperation");
    const cooperationScope = await this.#firstScope(cooperationHandle, "cooperation");
    const cooperation = decodeCurrentPcbStringCooperationClosure(await this.#sample("cooperation", cooperationScope, [cooperationHandle]));
    this.#matches(cooperation.identity);
    await this.#callback("cooperation-callback", "cooperation", cooperationScope, [cooperationHandle]);
    const uploadHandle = decodeCurrentPcbStringProducerFunction(await this.#evaluate("upload-select"), "upload");
    const uploadScope = await this.#firstScope(uploadHandle, "upload");
    const upload = decodeCurrentPcbStringUploadClosure(await this.#sample("upload", uploadScope, [uploadHandle])); this.#matches(upload.identity);
    const callbackScope = await this.#firstScope(uploadHandle, "upload");
    const uploadCallback = await this.#callback("upload-callback", "upload", callbackScope, [uploadHandle]);
    const buffer = await this.#callback("buffer-callback", "buffer", callbackScope, [uploadHandle]);
    const drain = await this.#callback("drain-callback", "drain", callbackScope, [uploadHandle]);
    const environmentScope = await this.#firstScope(uploadHandle, "upload");
    const bufferScope = await this.#callbackScope(buffer, "buffer"), drainScope = await this.#callbackScope(drain, "drain");
    const bufferedEnvironment = decodeCurrentPcbStringBufferedCallbackEnvironment(await this.#sample("buffered-environment", environmentScope,
      [uploadHandle, bufferScope, drainScope, uploadCallback, buffer, drain])); this.#matches(bufferedEnvironment.identity);
    return freezeDeep({ schema: "easyeda-pro-control.pcb-string-worker-producer-observation.v1", identity: this.#identity,
      gates, uploadStructure: uploadStructure.state, structure: structure.state, debounce, cooperation, upload, bufferedEnvironment,
      qualifiedCallbacks: ["uploadStructure", "structure", "cooperation", "upload", "buffer", "drain"], originalRunnerIssued: true,
      hiddenCallbackReceiversVerified: false, completePublishersVerified: false, writeDestinationsContained: false,
      atomicSnapshotVerified: false, continuousObservation: false, queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false,
    });
  }
  public async observe(): Promise<CurrentPcbStringWorkerProducerObservation> {
    if (this.#consumed) { return refuse(); } this.#consumed = true;
    const errors: unknown[] = []; let result: CurrentPcbStringWorkerProducerObservation | undefined;
    try {
      result = await this.#collect(); this.#phase = "bounds";
      const rawBytes = Object.values(this.#replies).reduce((bytes, reply) => bytes + Buffer.byteLength(reply.result.value), 0);
      if (this.#requests !== CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT - 1 || Object.keys(this.#replies).length !== 7 ||
          rawBytes > CURRENT_PCB_STRING_WORKER_PRODUCER_RETAINED_BYTES ||
          Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_STRING_WORKER_PRODUCER_OBSERVATION_BYTES) { refuse(); }
    } catch (error) { errors.push(error); }
    let cleanup: "not-started" | "released" | "failed" = "not-started", phase = this.#phase;
    if (this.#started) {
      // Cleanup still targets the original session/group after owner loss.
      // No reattachment or new worker is permitted, and no primary error is lost.
      try {
        empty(await this.#transport.request(freezeDeep({ sessionId: this.#owner.sessionId, workerProducerPhase: "release",
          method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }))); cleanup = "released";
      } catch (error) { if (errors.length === 0) { phase = "release"; } cleanup = "failed"; errors.push(error); }
      try { this.#current(); } catch (error) { if (errors.length === 0) { phase = "owner-final"; } errors.push(error); }
    }
    if (errors.length > 0) { throw currentPcbStringWorkerProducerFailure(phase, this.#requests, cleanup, errors, this.#replies); }
    if (result === undefined || cleanup !== "released") { return refuse(); }
    issued.set(result, Object.freeze({ ...this.#replies })); this.#result = result; return result;
  }
  public requireOriginal(observation: CurrentPcbStringWorkerProducerObservation): CurrentPcbStringWorkerProducerReplies {
    if (this.#result !== observation) { return refuse(); } this.#current(); return requireOriginalCurrentPcbStringWorkerProducerReplies(observation);
  }
}

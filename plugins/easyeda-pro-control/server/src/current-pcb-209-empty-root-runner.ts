/** Original Save-scope capture with two fixed raw-root observations around a
 * private enclosing operation. Issuance is withheld until group cleanup and
 * final owner reproof. Matching supplied JSON cannot enter this runner. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_FUNCTION, decodeCurrentPcb209EmptyRootReply } from "./current-pcb-209-empty-root-program.ts";
import type { CurrentPcb209EmptyRootObservation } from "./current-pcb-209-empty-root-program.ts";
import { decodeCurrentPcb209CommonModelFunction, decodeCurrentPcb209CommonModelScope,
  decodeCurrentPcb209CommonModelScopeList } from "./current-pcb-209-common-model-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT = 9;
export const CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP = "easyeda-pro-control-pcb209-empty-root-v1";
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
export type CurrentPcb209EmptyRootCommand =
  | Readonly<{ rootPhase: "wrapper"; method: "Runtime.evaluate"; params: typeof EFFECTS & Readonly<{
    expression: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION; uniqueContextId: string;
    objectGroup: typeof CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP; returnByValue: false; timeout: 1000;
    includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ rootPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ rootPhase: "handler"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION; returnByValue: false;
  }> }>
  | Readonly<{ rootPhase: "before" | "after"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_EMPTY_ROOT_FUNCTION; returnByValue: true;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ rootPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP;
  }> }>;
export interface CurrentPcb209EmptyRootTransport {
  readonly request: (command: CurrentPcb209EmptyRootCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
}
export interface CurrentPcb209EmptyRootPair {
  readonly profile: "private.current-pcb209-empty-root-pair.v1";
  readonly documentUuid: string;
  readonly before: CurrentPcb209EmptyRootObservation;
  readonly after: CurrentPcb209EmptyRootObservation;
  readonly beforeReplySha256: string;
  readonly afterReplySha256: string;
  readonly originalRunnerIssued: true;
  readonly rawManagersSampled: 17;
  readonly matchingSamples: true;
  readonly continuousObservation: false;
  readonly atomicSnapshotVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly queueCompletionVerified: false;
  readonly executionAuthorized: false;
}
type Phase = "ready" | CurrentPcb209EmptyRootCommand["rootPhase"] | "between" | "owner-final" | "completed" | "failed";
const issued = new WeakMap<CurrentPcb209EmptyRootPair, CurrentPcb209EmptyRootRunner>();
function need(condition: boolean, code: string): asserts condition {
  if (!condition) { throw new Error(`PCB209_EMPTY_ROOT_RUNNER_${code}`); }
}
function handle(input: string): string {
  need(typeof input === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(input), "HANDLE"); return input;
}
function own(input: unknown, keys: readonly string[]): Readonly<Record<string, unknown>> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input), "OWN_DATA");
  need(Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null, "OWN_DATA");
  const actual = Reflect.ownKeys(input);
  need(actual.length === keys.length && actual.every(key => typeof key === "string" && keys.includes(key)), "FIELDS");
  return Object.fromEntries(keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "OWN_DATA");
    return [key, descriptor.value as unknown];
  }));
}
function capture(input: unknown): Readonly<{ result: Readonly<{ type: "string"; value: string }> }> {
  const result = own(own(input, ["result"])["result"], ["type", "value"]), value = result["value"];
  need(result["type"] === "string" && typeof value === "string" && value.isWellFormed() && Buffer.byteLength(value) <= 16_384, "REPLY");
  return Object.freeze({ result: Object.freeze({ type: "string", value }) });
}

export class CurrentPcb209EmptyRootRunner {
  readonly #transport: CurrentPcb209EmptyRootTransport;
  readonly #requestMethod: CurrentPcb209EmptyRootTransport["request"];
  readonly #assertMethod: CurrentPcb209EmptyRootTransport["assertCurrent"];
  readonly #scriptId: string;
  readonly #contextId: string;
  readonly #documentUuid: string;
  #phase: Phase = "ready";
  #failurePhase: Phase | null = null;
  #pair: CurrentPcb209EmptyRootPair | null = null;
  #failure: unknown;
  public constructor(transport: CurrentPcb209EmptyRootTransport, scriptId: string, contextId: string, documentUuid: string) {
    const fields = own(transport, ["request", "assertCurrent"]);
    need(typeof fields["request"] === "function" && typeof fields["assertCurrent"] === "function", "TRANSPORT");
    this.#transport = transport; this.#requestMethod = transport.request; this.#assertMethod = transport.assertCurrent;
    this.#scriptId = handle(scriptId); this.#contextId = handle(contextId);
    need(typeof documentUuid === "string" && /^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(documentUuid), "DOCUMENT"); this.#documentUuid = documentUuid;
  }
  #current(): void {
    const methods = own(this.#transport, ["request", "assertCurrent"]);
    need(this.#phase !== "failed" && methods["request"] === this.#requestMethod && methods["assertCurrent"] === this.#assertMethod, "OWNER");
    this.#assertMethod.call(this.#transport);
    const after = own(this.#transport, ["request", "assertCurrent"]);
    need(after["request"] === this.#requestMethod && after["assertCurrent"] === this.#assertMethod, "OWNER");
  }
  public status(): Readonly<{ phase: Phase; failurePhase: Phase | null; originalPairRetained: boolean; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, failurePhase: this.#failurePhase, originalPairRetained: this.#pair !== null, executionAuthorized: false });
  }
  public retainedFailure(): unknown { return this.#failure; }
  async #request(command: CurrentPcb209EmptyRootCommand): Promise<unknown> {
    this.#phase = command.rootPhase; this.#current();
    const raw = await this.#requestMethod.call(this.#transport, freezeDeep(command));
    const result = command.rootPhase === "before" || command.rootPhase === "after" ? capture(raw) : raw;
    this.#current(); return result;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ rootPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #sample(scope: string, wrapper: string, rootPhase: "before" | "after"): Promise<Readonly<{
    observation: CurrentPcb209EmptyRootObservation; sha256: string;
  }>> {
    const reply = capture(await this.#request({ rootPhase, method: "Runtime.callFunctionOn",
      params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_209_EMPTY_ROOT_FUNCTION, returnByValue: true,
        arguments: [{ objectId: wrapper }] } }));
    const observation = decodeCurrentPcb209EmptyRootReply(reply);
    need(observation.documentUuid === this.#documentUuid, "DOCUMENT_CHANGED");
    return Object.freeze({ observation, sha256: sha256Text(reply.result.value) });
  }
  /** Private host composition only. The callback is never sent to EasyEDA. */
  public async observeAround<T>(between: () => Promise<T>): Promise<Readonly<{ pair: CurrentPcb209EmptyRootPair; value: T }>> {
    need(this.#phase === "ready" && typeof between === "function", "CONSUMED");
    this.#phase = "wrapper"; let result: Readonly<{ pair: CurrentPcb209EmptyRootPair; value: T }> | undefined, started = false;
    const failures: unknown[] = [];
    try {
      this.#current(); started = true;
      const wrapper = decodeCurrentPcb209CommonModelFunction(await this.#request({ rootPhase: "wrapper", method: "Runtime.evaluate",
        params: { ...EFFECTS, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: this.#contextId,
          objectGroup: CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP, returnByValue: false, timeout: 1000,
          includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } }), "rpc-wrapper");
      const wrapperList = decodeCurrentPcb209CommonModelScopeList(await this.#properties(wrapper), this.#scriptId, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcb209CommonModelScope(await this.#properties(wrapperList), "rpc-wrapper");
      const handler = decodeCurrentPcb209CommonModelFunction(await this.#request({ rootPhase: "handler", method: "Runtime.callFunctionOn",
        params: { ...EFFECTS, objectId: wrapperScope, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false } }), "save-handler");
      const handlerList = decodeCurrentPcb209CommonModelScopeList(await this.#properties(handler), this.#scriptId, "save-handler");
      const scope = decodeCurrentPcb209CommonModelScope(await this.#properties(handlerList), "save-handler");
      const before = await this.#sample(scope, wrapper, "before");
      this.#phase = "between"; this.#current(); const value = await between(); this.#current();
      const after = await this.#sample(scope, wrapper, "after");
      need(before.sha256 === after.sha256 && canonicalJson(before.observation) === canonicalJson(after.observation), "ROOTS_CHANGED");
      const pair = freezeDeep({ profile: "private.current-pcb209-empty-root-pair.v1" as const, documentUuid: this.#documentUuid,
        before: before.observation, after: after.observation, beforeReplySha256: before.sha256, afterReplySha256: after.sha256,
        originalRunnerIssued: true as const, rawManagersSampled: 17 as const, matchingSamples: true as const,
        continuousObservation: false as const, atomicSnapshotVerified: false as const, completeLiveBaselineVerified: false as const,
        queueCompletionVerified: false as const, executionAuthorized: false as const });
      result = Object.freeze({ pair, value });
    } catch (error) { this.#failurePhase = this.#phase; failures.push(error); }
    if (started) {
      try {
        this.#phase = "release";
        own(await this.#requestMethod.call(this.#transport, freezeDeep({ rootPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP } })), []);
      } catch (error) { this.#failurePhase ??= "release"; failures.push(error); }
    }
    if (failures.length === 0) {
      try { this.#phase = "owner-final"; this.#current(); } catch (error) { this.#failurePhase = "owner-final"; failures.push(error); }
    }
    if (failures.length > 0 || result === undefined) {
      this.#phase = "failed"; this.#failure = new AggregateError(failures, "PCB209_EMPTY_ROOT_RUNNER_FAILED"); throw this.#failure;
    }
    this.#pair = result.pair; issued.set(result.pair, this); this.#phase = "completed"; return result;
  }
  public requireOriginal(pair: CurrentPcb209EmptyRootPair): void {
    need(this.#phase === "completed" && pair === this.#pair && issued.get(pair) === this, "ORIGINAL_PAIR");
    try { this.#current(); }
    catch (error) { this.#phase = "failed"; this.#failurePhase = "owner-final"; this.#failure = error; throw error; }
  }
}

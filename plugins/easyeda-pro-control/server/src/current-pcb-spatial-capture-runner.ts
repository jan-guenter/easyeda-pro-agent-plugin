/** Original-context point callback capture. The fixed programs inspect the
 * source-admitted registry and lexical bindings without calling a hit handler.
 * No remote handle, code selector or source profile is accepted from a tool.
 */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION,
  CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION } from "./current-pcb-209-spatial-capture-program.ts";
import { decodeCurrentPcbSpatialFunction, decodeCurrentPcbSpatialFunctionScope,
  decodeCurrentPcbSpatialFunctionScopeList } from "./current-pcb-spatial-function-scope.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION } from "./current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialQuerySchema, decodeCurrentPcb209SpatialReply } from "./current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery, CurrentPcb209SpatialResult } from "./current-pcb-209-spatial-read.ts";
import { currentPcb209SpatialTrackQueriesSchema, decodeCurrentPcb209SpatialTrackReply } from "./current-pcb-209-spatial-track-read.ts";
import type { CurrentPcb209SpatialTrackResult } from "./current-pcb-209-spatial-track-read.ts";
import type { CurrentPcbSpatialVariant } from "./current-pcb-spatial-function-source.ts";
import { decodeCurrentPcbSpatialFunctionSourceArray, decodeCurrentPcbSpatialFunctionSourceMetadata,
  decodeCurrentPcbSpatialFunctionSourceTuple } from "./current-pcb-spatial-function-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_SPATIAL_OBJECT_GROUP = "easyeda-pro-control-pcb209-spatial-v1";
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
export type CurrentPcbSpatialCaptureCommand =
  | Readonly<{ spatialPhase: "wrapper"; method: "Runtime.evaluate"; params: typeof EFFECTS & Readonly<{
    expression: typeof CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION; uniqueContextId: string;
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP; returnByValue: false; timeout: 1000;
    includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ spatialPhase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ spatialPhase: "handler"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION;
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP; returnByValue: false;
  }> }>
  | Readonly<{ spatialPhase: "bindings" | "bindings-track"; method: "Runtime.callFunctionOn"; params: Omit<typeof EFFECTS, "throwOnSideEffect"> & Readonly<{
    throwOnSideEffect: false;
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION;
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP; returnByValue: false;
    arguments: readonly [Readonly<{ objectId: string }>];
  }> }>
  | Readonly<{ spatialPhase: "read" | "read-track"; method: "Runtime.callFunctionOn"; params: Omit<typeof EFFECTS, "throwOnSideEffect"> & Readonly<{
    throwOnSideEffect: false; objectId: string; functionDeclaration: typeof CURRENT_PCB_209_SPATIAL_READ_FUNCTION;
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP; returnByValue: true;
    arguments: readonly [Readonly<{ value: CurrentPcb209SpatialQuery }>];
  }> }>
  | Readonly<{ spatialPhase: "functions"; method: "Runtime.callFunctionOn"; params: typeof EFFECTS & Readonly<{
    objectId: string; functionDeclaration: typeof CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION;
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP; returnByValue: false;
  }> }>
  | Readonly<{ spatialPhase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_SPATIAL_OBJECT_GROUP;
  }> }>;

export interface CurrentPcbSpatialCaptureTransport {
  /** The retained original PCB page session only. No new attachment. */
  readonly request: (command: CurrentPcbSpatialCaptureCommand) => Promise<unknown>;
  /** Check original owner, full admitted source and context at every await. */
  readonly assertCurrent: () => void;
}
export interface CurrentPcbSpatialCaptureObservation {
  readonly schema: "easyeda-pro-control.pcb209-spatial-capture.v1";
  readonly originalPointCallbackCaptured: true;
  readonly originalModuleBindingsCaptured: true;
  readonly remoteObjectGroupReleased: true;
  readonly nativeHitExecuted: false;
  readonly completeGeometryClosureVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
function refuse(): never { throw new Error("PCB_SPATIAL_CAPTURE"); }
/** Bound an opaque original inspector identifier without resolving or adopting it. */
function token(value: string): string {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); }
  return value;
}
/** Copy an exact own-data envelope without getters, proxies or inherited fields. */
function record(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const actual = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || actual.length !== keys.length ||
      actual.some(key => typeof key !== "string" || !keys.includes(key))) { return refuse(); }
  const copy: Record<string, unknown> = {};
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (field === undefined || !Object.hasOwn(field, "value")) { return refuse(); }
    copy[key] = field.value as unknown;
  }
  return copy;
}
/** Decode the fixed private binding-container handle. Its Object label alone
 * Proves no source identity; the runner separately qualifies its fixed callees. */
function bundleHandle(input: unknown): string {
  const outer = record(input, ["result"]), remote = record(outer["result"], ["type", "className", "description", "objectId"]);
  if (remote["type"] !== "object" || remote["className"] !== "Object" || remote["description"] !== "Object" ||
      typeof remote["objectId"] !== "string") { return refuse(); }
  return token(remote["objectId"]);
}

/** Single-consumption original capture. Its result carries no remote handles
 * and grants neither a later native call nor eligibility for an existing owner.
 */
export class CurrentPcbSpatialCaptureRunner {
  readonly #transport: CurrentPcbSpatialCaptureTransport;
  readonly #requestCallback: CurrentPcbSpatialCaptureTransport["request"];
  readonly #assertCallback: CurrentPcbSpatialCaptureTransport["assertCurrent"];
  readonly #scriptId: string;
  readonly #contextId: string;
  readonly #documentUuid: string;
  #consumed = false;
  /** Retain the original receiver and callbacks with their admitted context.
   * Construction sends no request and cannot reconstruct an original owner. */
  public constructor(transport: CurrentPcbSpatialCaptureTransport, scriptId: string, uniqueContextId: string, documentUuid: string) {
    this.#transport = transport;
    this.#requestCallback = transport.request; this.#assertCallback = transport.assertCurrent;
    this.#scriptId = token(scriptId); this.#contextId = token(uniqueContextId);
    if (!/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(documentUuid)) { refuse(); }
    this.#documentUuid = documentUuid;
  }
  /** Recheck callback identity before and after the original context assertion. */
  #current(): void {
    if (this.#transport.request !== this.#requestCallback || this.#transport.assertCurrent !== this.#assertCallback) { refuse(); }
    this.#assertCallback.call(this.#transport);
    if (this.#transport.request !== this.#requestCallback || this.#transport.assertCurrent !== this.#assertCallback) { refuse(); }
  }
  /** Dispatch through the original receiver, decode before hooks can change
   * Reply aliases, then reprove the same retained context after the await. */
  async #request<T>(command: CurrentPcbSpatialCaptureCommand, decode: (input: unknown) => T): Promise<T> {
    this.#current();
    const arrived = await this.#requestCallback.call(this.#transport, freezeDeep(command));
    // Decode before an owner hook can alter aliases to the reply envelope.
    const result = decode(arrived);
    this.#current(); return result;
  }
  /** Read only own descriptors of an original group handle through the same
   * Guarded request path; no getter or new target is selected. */
  #properties<T>(objectId: string, decode: (input: unknown) => T): Promise<T> {
    return this.#request({ spatialPhase: "properties", method: "Runtime.getProperties", params: {
      objectId: token(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
    } }, decode);
  }
  /** Consume capture once and retain all handles inside its original group.
   * After any started attempt, release uses the original callback even on drift;
   * Capture, consume, release or final-context failures all withhold the result. */
  async #run<T>(consume: (bundle: string) => Promise<T>, qualify: boolean, variant: CurrentPcbSpatialVariant = "via"): Promise<T> {
    if (this.#consumed) { return refuse(); }
    this.#consumed = true;
    let started = false;
    let result: T | undefined;
    const failures: unknown[] = [];
    try {
      this.#current(); started = true;
      const wrapper = await this.#request({ spatialPhase: "wrapper", method: "Runtime.evaluate", params: {
        ...EFFECTS, expression: CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, uniqueContextId: this.#contextId,
        objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false, timeout: 1000,
        includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
      } }, input => decodeCurrentPcbSpatialFunction(input, "rpc-wrapper"));
      const wrapperScopes = await this.#properties(wrapper, input => decodeCurrentPcbSpatialFunctionScopeList(input, this.#scriptId, "rpc-wrapper"));
      const wrapperScope = await this.#properties(wrapperScopes, input => decodeCurrentPcbSpatialFunctionScope(input, "rpc-wrapper"));
      const handler = await this.#request({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: {
        ...EFFECTS, objectId: wrapperScope, functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION,
        objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false,
      } }, input => decodeCurrentPcbSpatialFunction(input, "point-handler"));
      const handlerScopes = await this.#properties(handler, input => decodeCurrentPcbSpatialFunctionScopeList(input, this.#scriptId, "point-handler"));
      const handlerScope = await this.#properties(handlerScopes, input => decodeCurrentPcbSpatialFunctionScope(input, "point-handler"));
      const bundle = await this.#request({ spatialPhase: variant === "via" ? "bindings" : "bindings-track", method: "Runtime.callFunctionOn", params: {
        // The fixed bindings program only allocates and seals private containers.
        // V8 refuses its defineProperty/freeze calls under the side-effect flag.
        // No vendor getter, callback or hit method runs or app object changes.
        ...EFFECTS, throwOnSideEffect: false, objectId: handlerScope, functionDeclaration: variant === "via" ? CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION : CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION,
        objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false, arguments: [{ objectId: wrapper }],
      } }, bundleHandle);
      if (qualify) {
        const functions = await this.#request({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: {
          ...EFFECTS, objectId: bundle, functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION,
          objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false,
        } }, input => decodeCurrentPcbSpatialFunctionSourceArray(input, variant));
        const references = await this.#properties(functions, input => decodeCurrentPcbSpatialFunctionSourceTuple(input, variant));
        for (const reference of references) {
          await this.#properties(reference.objectId, reply => decodeCurrentPcbSpatialFunctionSourceMetadata(reply, this.#scriptId, reference.key, variant));
        }
      }
      result = await consume(bundle);
    } catch (caughtError) { failures.push(caughtError); }
    if (started) {
      try {
        record(await this.#requestCallback.call(this.#transport, freezeDeep({ spatialPhase: "release", method: "Runtime.releaseObjectGroup",
          params: { objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP } })), []);
      } catch (caughtError) { failures.push(caughtError); }
    }
    if (failures.length === 0) {
      try { this.#current(); } catch (caughtError) { failures.push(caughtError); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, "PCB_SPATIAL_CAPTURE"); }
    if (result === undefined) { return refuse(); }
    return result;
  }
  /** Passive qualification only, followed by original group release. */
  public observe(): Promise<CurrentPcbSpatialCaptureObservation> {
    return this.#run(() => Promise.resolve(Object.freeze({ schema: "easyeda-pro-control.pcb209-spatial-capture.v1",
      originalPointCallbackCaptured: true, originalModuleBindingsCaptured: true, remoteObjectGroupReleased: true,
      nativeHitExecuted: false, completeGeometryClosureVerified: false, executionAuthorized: false, saveAuthorized: false })), false);
  }
  /** Original application functions are qualified before the private reader.
   * Standard renderer intrinsics remain a declared, unverified trust assumption.
   * The kernel admits its fixed bit-mask and geometry scratch effects. It never
   * uses the selecting public region getter or transfers retained handles.
   */
  public async read(input: unknown): Promise<CurrentPcb209SpatialResult> {
    const results = await this.readBatch([input]);
    const result = results[0]; if (result === undefined) { return refuse(); } return result;
  }
  /** Amortize original function qualification across at most sixteen reads.
   * The same original group survives only this bounded call, and every kernel
   * invocation rechecks current retained references and scene state itself.
   */
  public readBatch(input: unknown): Promise<readonly CurrentPcb209SpatialResult[]> {
    const queries = freezeDeep(z.array(currentPcb209SpatialQuerySchema).min(1).max(16).parse(input));
    return this.#run(async bundle => {
      const results: CurrentPcb209SpatialResult[] = [];
      for (const query of queries) {
        results.push(await this.#request({ spatialPhase: "read", method: "Runtime.callFunctionOn", params: {
          ...EFFECTS, throwOnSideEffect: false, objectId: bundle, functionDeclaration: CURRENT_PCB_209_SPATIAL_READ_FUNCTION,
          objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: true, arguments: [{ value: query }],
        } }, reply => {
          const result = decodeCurrentPcb209SpatialReply(reply);
          if (result.documentUuid !== this.#documentUuid || canonicalJson(result.query) !== canonicalJson(query)) { return refuse(); }
          return result;
        }));
      }
      return Object.freeze(results);
    }, true);
  }
  /** The separate mixed-family program consumes the same original capture and
   * group, qualifies all256 callees and retains the unchanged native ID cap. */
  public readTrackBatch(input: unknown): Promise<readonly CurrentPcb209SpatialTrackResult[]> {
    const queries = freezeDeep(currentPcb209SpatialTrackQueriesSchema.parse(input));
    return this.#run(async bundle => {
      const results: CurrentPcb209SpatialTrackResult[] = [];
      for (const query of queries) {
        results.push(await this.#request({ spatialPhase: "read-track", method: "Runtime.callFunctionOn", params: {
          ...EFFECTS, throwOnSideEffect: false, objectId: bundle, functionDeclaration: CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION,
          objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: true, arguments: [{ value: query }],
        } }, reply => {
          const result = decodeCurrentPcb209SpatialTrackReply(reply);
          if (result.documentUuid !== this.#documentUuid || canonicalJson(result.query) !== canonicalJson(query)) { return refuse(); }
          return result;
        }));
      }
      return Object.freeze(results);
    }, true, "line-via");
  }
}

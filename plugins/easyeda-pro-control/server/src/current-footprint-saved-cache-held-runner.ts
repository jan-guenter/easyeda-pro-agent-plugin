/** Unmounted staged observation of one held native cache tuple. An injected
 * transport or matching JSON cannot mint native/runtime/replay authority. The
 * future original native owner must retain this runner through release.
 */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_CALLS as CALLS } from "./current-footprint-saved-cache-held-programs.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_GROUP as GROUP,
  CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as LIMITS } from "./current-footprint-saved-cache-held-profile.ts";
import { currentFootprintSavedCacheHeldHandleSchema, decodeCurrentFootprintSavedCacheHeldTuple,
  validateCurrentFootprintSavedCacheHeldEngine, validateCurrentFootprintSavedCacheHeldFunction } from "./current-footprint-saved-cache-held-metadata.ts";
import { validateCurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import type { CurrentFootprintSavedCacheHeldCommand as Command } from "./current-footprint-saved-cache-held-protocol.ts";
import { decodeCurrentFootprintCopySavedQueueReply } from "./current-footprint-copy-saved-queue.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintSavedCacheHeldTransport {
  readonly assertCurrent: () => Promise<void>;
  readonly request: (command: Command) => Promise<unknown>;
}
type Phase = "new" | "preparing" | "prepared" | "first-observing" | "first-observed" |
  "fresh-observing" | "fresh-observed" | "failed" | "releasing" | "released";
const session = currentFootprintSavedCacheHeldHandleSchema.max(128);
const bindingSchema = z.object({ sessionId: session, uniqueContextId: session,
  projectUuid: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
const booleanReply = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const arrayReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(5)"), objectId: currentFootprintSavedCacheHeldHandleSchema }).strict() }).strict();
const flags = { objectGroup: GROUP, silent: true, generatePreview: false, userGesture: false } as const;
export interface CurrentFootprintSavedCacheHeldObservation {
  readonly profile: "private.current-footprint-saved-cache-held-observation.v1";
  readonly stage: "first" | "fresh";
  readonly queue: Readonly<Record<string, unknown>>;
  readonly metadataRosterConformant: true;
  readonly originalTupleRechecked: true;
  readonly namespaceMatches: 2;
  readonly cacheGetterInvocations: 1;
  readonly nativeQualificationIssued: false;
  readonly runtimeAdmissionGranted: false;
  readonly replayTokenIssued: false;
  readonly executionAuthorized: false;
}

/** Refuse a failed lifetime condition without exposing received fields or granting
 * retry. The enclosing stage retains the first failed phase for inspection.
 */
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`SAVED_CACHE_HELD_${detail}`); }
}

/** Retain the exact two own transport callbacks without invoking property
 * accessors. Proxies, extra fields and substituted methods refuse.
 */
function methods(value: CurrentFootprintSavedCacheHeldTransport): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype &&
    Reflect.ownKeys(value).length === 2, "TRANSPORT");
  return ["assertCurrent", "request"].map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "TRANSPORT");
    return descriptor.value as unknown;
  });
}

export class CurrentFootprintSavedCacheHeldRunner {
  readonly #transport: CurrentFootprintSavedCacheHeldTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: z.infer<typeof bindingSchema>;
  readonly #engine: ReturnType<typeof validateCurrentFootprintSavedCacheHeldEngine>;
  readonly #raw: Readonly<{ phase: Command["heldCachePhase"]; reply: unknown }>[] = [];
  readonly #packets = new Map<"first" | "fresh", CurrentFootprintSavedCacheHeldObservation>();
  #phase: Phase = "new";
  #tuple: string | null = null;
  #normal = 0;
  #cleanup = 0;
  #replyBytes = 0;
  #pending = 0;
  #position: Command["heldCachePhase"] | null = null;
  #failure: Command["heldCachePhase"] | "owner" | null = null;
  #releaseAttempted = false;
  #released = false;
  #rosterConformant = false;

  /** Retain callback identities and one immutable target/context after exact engine
   * matching. Construction performs no request and issues no native, runtime or
   * replay qualification; the eventual native factory must own this instance.
   */
  public constructor(transport: CurrentFootprintSavedCacheHeldTransport, binding: z.infer<typeof bindingSchema>, engine: unknown) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#binding = freezeDeep(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
    this.#engine = validateCurrentFootprintSavedCacheHeldEngine(engine);
  }

  /** Check callback identity before invoking the original owner assertion. */
  #same(): void { need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "TRANSPORT_CHANGED"); }

  /** Track the original promise until settlement even after the outer deadline.
   * An unresolved original callback prevents object-group cleanup dispatch; later
   * settlement never revives a consumed stage or native authority.
   */
  async #settled<T>(work: () => Promise<T>): Promise<T> {
    try { this.#same(); return await work(); } finally { this.#pending -= 1; }
  }

  /** Reserve pending accounting before invoking a callback, then apply the host
   * deadline. The original promise remains tracked after timeout; only its actual
   * settlement clears pending state, without restoring a failed lifetime.
   */
  async #bounded<T>(work: () => Promise<T>): Promise<T> {
    this.#pending += 1;
    const deadline = Promise.withResolvers<never>();
    const original = this.#settled(work);
    const timer = setTimeout(() => { deadline.reject(new Error("SAVED_CACHE_HELD_DEADLINE")); }, LIMITS.requestMilliseconds);
    try { return await Promise.race([original, deadline.promise]); } finally { clearTimeout(timer); }
  }

  /** Reprove transport identity around the original asynchronous owner assertion.
   * Its void contract requires an actual undefined result. A resolved false or
   * other acknowledgment cannot substitute for a successful assertion.
   */
  async #current(): Promise<void> {
    this.#same();
    const result = await this.#bounded<unknown>(() => this.#transport.assertCurrent());
    this.#same(); need(result === undefined, "ASSERTION_RESULT");
  }

  /** Capture a complete bounded inert response before any post-await owner check.
   * Late responses remain private evidence and cannot restore the failed stage.
   */
  async #exchange(command: Command): Promise<unknown> {
    this.#same();
    const reply = captureCurrentPcbStringClockReply(await this.#transport.request(command));
    const bytes = Buffer.byteLength(reply.text);
    need(bytes <= LIMITS.replyBytes && this.#replyBytes + bytes <= LIMITS.aggregateReplyBytes, "REPLY_BOUND");
    this.#replyBytes += bytes; this.#raw.push(Object.freeze({ phase: command.heldCachePhase, reply: reply.value }));
    return reply.value;
  }

  /** Consume a fixed normal or cleanup slot before dispatch. Recheck the original
   * transport around every request; malformed or exception replies remain retained
   * and are rejected by the exact phase decoder.
   */
  async #request(input: Command, cleanup = false): Promise<unknown> {
    need(this.#pending === 0, "ORIGINAL_CALLBACK_PENDING");
    if (!cleanup) { need(!this.#releaseAttempted && this.#failure === null, "NORMAL_LIFETIME_ENDED"); }
    const command = validateCurrentFootprintSavedCacheHeldCommand(input); this.#position = command.heldCachePhase;
    await this.#current();
    if (!cleanup) { need(!this.#releaseAttempted && this.#failure === null, "NORMAL_LIFETIME_ENDED"); }
    if (cleanup) { need(command.heldCachePhase === "release" && this.#cleanup < LIMITS.cleanup, "CLEANUP_BUDGET"); this.#cleanup += 1; }
    else { need(command.heldCachePhase !== "release" && this.#normal < LIMITS.normal, "NORMAL_BUDGET"); this.#normal += 1; }
    const reply = await this.#bounded(() => this.#exchange(command)); await this.#current();
    if (!cleanup) { need(!this.#releaseAttempted && this.#failure === null, "NORMAL_LIFETIME_ENDED"); }
    return reply;
  }

  /** Request the complete own metadata of one handle from the original tuple. */
  #properties(heldCachePhase: "array-properties" | "constructor-properties" | "match-properties" | "getter-properties", objectId: string): Promise<unknown> {
    return this.#request({ heldCachePhase, method: "Runtime.getProperties", sessionId: this.#binding.sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }

  /** Reprove original realm identities without comparing repeated CDP IDs. */
  async #recheck(heldCachePhase: "recheck-before-getter" | "recheck-first" | "recheck-fresh"): Promise<void> {
    need(this.#tuple !== null, "TUPLE_REQUIRED");
    const functionDeclaration = { "recheck-before-getter": CALLS.recheckBeforeGetter,
      "recheck-first": CALLS.recheckFirst, "recheck-fresh": CALLS.recheckFresh }[heldCachePhase];
    booleanReply.parse(await this.#request({ heldCachePhase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
      params: { ...flags, objectId: this.#tuple, functionDeclaration, arguments: [], throwOnSideEffect: true, awaitPromise: false, returnByValue: true } }));
  }

  /** Keep the primary failed stage and attempt its once-only original cleanup.
   * A failed or still-pending cleanup remains visible for native-owner teardown.
   */
  async #failed(): Promise<void> {
    this.#failure ??= this.#position ?? "owner"; this.#phase = "failed";
    try { await this.release(); } catch {
      // Retain the primary failure and original cleanup state.
    }
  }

  /** Capture and qualify fresh metadata before invoking the held getter exactly
   * once. The resulting receiver stays in the private original realm tuple; no
   * native/runtime/replay token is returned to callers.
   */
  public async prepare(): Promise<void> {
    need(this.#phase === "new", "PREPARE_CONSUMED"); this.#phase = "preparing";
    try {
      const array = arrayReply.parse(await this.#request({ heldCachePhase: "capture", method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
        params: { ...flags, uniqueContextId: this.#binding.uniqueContextId, functionDeclaration: CALLS.capture, arguments: [],
          throwOnSideEffect: true, awaitPromise: false, returnByValue: false } }));
      this.#tuple = array.result.objectId;
      const tuple = decodeCurrentFootprintSavedCacheHeldTuple(await this.#properties("array-properties", this.#tuple));
      for (const role of ["constructor", "match", "getter"] as const) {
        validateCurrentFootprintSavedCacheHeldFunction(await this.#properties(`${role}-properties`, tuple[role]), role);
      }
      await this.#recheck("recheck-before-getter"); this.#rosterConformant = true;
      booleanReply.parse(await this.#request({ heldCachePhase: "retain-receiver", method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
        params: { ...flags, objectId: this.#tuple, functionDeclaration: CALLS.retainReceiver, arguments: [],
          throwOnSideEffect: false, awaitPromise: false, returnByValue: true } }));
      this.#phase = "prepared";
    } catch (error) { await this.#failed(); throw error; }
  }

  /** Run one of the two distinct namespace observations on the same sealed target.
   * Each fixed program reads both namespaces and consumes its realm phase before
   * awaits. A later packet is a freshness sample, never ongoing replay exclusion.
   */
  async #observe(stage: "first" | "fresh"): Promise<CurrentFootprintSavedCacheHeldObservation> {
    need(this.#phase === (stage === "first" ? "prepared" : "first-observed") && this.#tuple !== null, "OBSERVATION_CONSUMED");
    this.#phase = stage === "first" ? "first-observing" : "fresh-observing";
    try {
      const reply = await this.#request({ heldCachePhase: stage === "first" ? "queue-first" : "queue-fresh", method: "Runtime.callFunctionOn",
        sessionId: this.#binding.sessionId, params: { ...flags, objectId: this.#tuple, functionDeclaration: stage === "first" ? CALLS.first : CALLS.fresh,
          arguments: [{ value: this.#binding.projectUuid }, { value: this.#binding.branchUuid }], throwOnSideEffect: false, awaitPromise: true, returnByValue: true } });
      const queue = decodeCurrentFootprintCopySavedQueueReply(reply,
        { projectUuid: this.#binding.projectUuid, branchUuid: this.#binding.branchUuid });
      await this.#recheck(stage === "first" ? "recheck-first" : "recheck-fresh");
      const packet = freezeDeep<CurrentFootprintSavedCacheHeldObservation>({ profile: "private.current-footprint-saved-cache-held-observation.v1", stage, queue,
        metadataRosterConformant: true, originalTupleRechecked: true, namespaceMatches: 2, cacheGetterInvocations: 1,
        nativeQualificationIssued: false, runtimeAdmissionGranted: false, replayTokenIssued: false, executionAuthorized: false });
      this.#packets.set(stage, packet); this.#phase = stage === "first" ? "first-observed" : "fresh-observed"; return packet;
    } catch (error) { await this.#failed(); throw error; }
  }

  /** Observe both namespaces once after preparation, retaining the tuple for the
   * separately timed pre-open freshness call. This is not a replay permit.
   */
  public observeFirst(): Promise<CurrentFootprintSavedCacheHeldObservation> { return this.#observe("first"); }

  /** Observe both namespaces again on the original held tuple and sealed target.
   * Only the first successful observation enables this once-only stage.
   */
  public observeFresh(): Promise<CurrentFootprintSavedCacheHeldObservation> { return this.#observe("fresh"); }

  /** Reject copied observation objects and reprove the original transport. This
   * reference check does not refresh the point-in-time sample or grant authority.
   */
  public async requireOriginal(packet: CurrentFootprintSavedCacheHeldObservation, stage: "first" | "fresh"): Promise<void> {
    need(stage === "first" || stage === "fresh", "OBSERVATION_STAGE");
    const phase = stage === "first" ? "first-observed" : "fresh-observed";
    const original = this.#packets.get(stage);
    need(this.#phase === phase && original !== undefined && original === packet, "ORIGINAL_PACKET");
    try {
      await this.#current(); need(this.#phase === phase && !this.#releaseAttempted, "NORMAL_LIFETIME_ENDED");
    } catch (error) { await this.#failed(); throw error; }
  }

  /** Consume one group release, including on a failed stage. If an original
   * callback remains pending, dispatch nothing further and require native-owner
   * termination. Missing acknowledgment never makes release retryable.
   */
  public async release(): Promise<void> {
    need(!this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#phase = "releasing";
    try {
      z.object({}).strict().parse(await this.#request({ heldCachePhase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId,
        params: { objectGroup: GROUP } }, true));
      this.#released = true; this.#phase = "released";
    } catch (error) { this.#failure ??= this.#position ?? "owner"; this.#phase = "failed"; throw error; }
  }

  /** Return bounded retained evidence and stage accounting. Even successful
   * synthetic callbacks or conforming metadata issue no native/runtime authority.
   */
  public retained(): Readonly<Record<string, unknown>> {
    return freezeDeep({ phase: this.#phase, failure: this.#failure, normalRequests: this.#normal, cleanupRequests: this.#cleanup,
      pendingCallbacks: this.#pending, releaseAttempted: this.#releaseAttempted, released: this.#released,
      metadataRosterConformant: this.#rosterConformant, engine: this.#engine, replies: [...this.#raw],
      nativeQualificationIssued: false, runtimeAdmissionGranted: false, replayTokenIssued: false, executionAuthorized: false });
  }
}

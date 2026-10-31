/** Unmounted delete metadata collector. The future adapter must retain a
 * bounded, single-flight original transport and reserve its object group.
 * Callback identity checks and matched replies do not authenticate that owner. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_FOOTPRINT_DELETE_METADATA_BUDGET as BUDGET, CURRENT_FOOTPRINT_DELETE_METADATA_GROUP as GROUP,
  CURRENT_FOOTPRINT_DELETE_METADATA_ORDER as ORDER, currentFootprintDeleteMetadataArrayCaptureSchema,
  currentFootprintDeleteMetadataBindingSchema, decodeCurrentFootprintDeleteMetadataTuple, decodeCurrentFootprintDeleteMethodMetadata,
  validateCurrentFootprintDeleteMetadataCommand } from "./current-footprint-delete-metadata-protocol.ts";
import type { CurrentFootprintDeleteMetadataBinding as Binding, CurrentFootprintDeleteMetadataCommand as Command } from "./current-footprint-delete-metadata-protocol.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "./current-footprint-delete-trigger-programs.ts";
import { currentFootprintDeleteTriggerExpectationSchema, decodeCurrentFootprintDeleteTriggerPreflight } from "./current-footprint-delete-trigger-protocol.ts";
import type { CurrentFootprintDeleteTriggerExpectation as Expectation } from "./current-footprint-delete-trigger-protocol.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_METHODS as METHODS } from "./current-footprint-delete-trigger-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Both callbacks must enforce original native ownership and transport
 * deadlines themselves. Their additional native reproof work is outside this
 * leaf's closed command count. A shape-compatible object supplies no authority. */
export interface CurrentFootprintDeleteMetadataTransport {
  readonly assertCurrent: () => Promise<unknown>;
  readonly request: (command: Command) => Promise<unknown>;
}
const consumed = new WeakSet<CurrentFootprintDeleteMetadataTransport>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_DELETE_METADATA_${code}`); } }
/** Read only own data-function descriptors; neither proxies nor callback
 * getters may run while taking the transport's immutable method snapshot. */
function methods(value: CurrentFootprintDeleteMetadataTransport): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype &&
    Reflect.ownKeys(value).length === 2, "TRANSPORT");
  return ["assertCurrent", "request"].map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "TRANSPORT_METHOD");
    return descriptor.value as unknown;
  });
}
export interface CurrentFootprintDeleteMetadataObservation {
  readonly profile: "private.current-footprint-delete-metadata-observation.v1";
  readonly selectedMethodCount: number;
  readonly tupleMetadataSamplesMatched: 2;
  readonly preflightSamplesMatched: 2;
  readonly functionMetadataMatchedDeclaredProfiles: number;
  readonly functionPrototypeMetadataQualified: false;
  readonly originalTupleComparedByFixedProgram: true;
  readonly objectGroupReleaseAcknowledged: true;
  readonly fullWorkerSourceQualified: false;
  readonly entryProducerQualified: false;
  readonly nativeObjectsQualified: false;
  readonly originalRuntimeOwnerQualified: false;
  readonly dependencyEligibilityVerified: false;
  readonly nativeClockProvenanceVerified: false;
  readonly deleteInvoked: false;
  readonly executionAuthorized: false;
}

/** One consumed fixed schedule retains complete bounded replies before owner
 * postchecks and attempts its reserved cleanup once on every outcome. Native
 * ownership, head/dependency eligibility and later deletion remain unmounted. */
export class CurrentFootprintDeleteMetadataRunner {
  readonly #transport: CurrentFootprintDeleteMetadataTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: Binding;
  readonly #expected: Expectation;
  readonly #replies: Readonly<{ phase: Command["phase"]; index: number | null; reply: unknown }>[] = [];
  #normal = 0;
  #cleanup = 0;
  #assertions = 0;
  #attempted = false;
  #cleanupAttempted = false;
  #released = false;
  #failed = false;
  #position: Command["phase"] | null = null;
  #completed = false;
  public constructor(transport: CurrentFootprintDeleteMetadataTransport, binding: Binding, expected: Expectation) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#binding = freezeDeep(currentFootprintDeleteMetadataBindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
    this.#expected = freezeDeep(currentFootprintDeleteTriggerExpectationSchema.parse(captureCurrentPcbStringClockReply(expected).value));
  }
  /** Match retained method identities around every owner assertion. A false
   * or otherwise non-void assertion return is refused rather than ignored. */
  async #current(): Promise<void> {
    this.#same(); need(this.#assertions < BUDGET.ownerAssertionCallbacks, "ASSERTION_BUDGET"); this.#assertions += 1;
    const result = await this.#transport.assertCurrent(); this.#same(); need(result === undefined, "OWNER_ASSERTION");
  }
  #same(): void { need(methods(this.#transport).every((value, index) => value === this.#methods[index]), "TRANSPORT_CHANGED"); }
  /** Charge before awaits, then send the immutable closed command. The
   * transport must refuse overlapping or orphaned requests; this leaf never
   * retries a missing reply or restores a consumed reservation. */
  async #request(input: Command): Promise<unknown> {
    const command = validateCurrentFootprintDeleteMetadataCommand(input); this.#position = command.phase;
    if (command.phase === "release") {
      need(this.#cleanup === 0, "CLEANUP_CONSUMED"); this.#cleanup += 1;
    } else {
      const next = ORDER[this.#normal];
      need(next !== undefined && !next.cleanup && next.phase === command.phase &&
        (!("index" in next) || "index" in command && command.index === next.index), "ORDER");
      need(this.#normal < BUDGET.normalRequests && !this.#failed && !this.#cleanupAttempted, "NORMAL_BUDGET"); this.#normal += 1;
    }
    await this.#current(); this.#same();
    const raw = captureCurrentPcbStringClockReply(await this.#transport.request(command));
    need(Buffer.byteLength(raw.text) <= BUDGET.replyBytes, "REPLY_BYTES");
    this.#replies.push(Object.freeze({ phase: command.phase, index: "index" in command ? command.index : null, reply: raw.value }));
    await this.#current(); this.#same(); return raw.value;
  }
  #properties(phase: "tuple-before" | "tuple-after", objectId: string): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.getProperties", sessionId: this.#binding.sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #preflight(phase: "preflight-before" | "preflight-after", tuple: string): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
      params: { ...this.#flags(), functionDeclaration: PROGRAMS.preflight.program, returnByValue: true,
        arguments: [...this.#arguments(), { objectId: tuple }, { value: this.#expected }] } });
  }
  #flags(): Readonly<{ objectId: string; objectGroup: typeof GROUP; silent: true; generatePreview: false;
    userGesture: false; throwOnSideEffect: true; awaitPromise: false }> {
    return { objectId: this.#binding.project, objectGroup: GROUP, silent: true, generatePreview: false,
      userGesture: false, throwOnSideEffect: true, awaitPromise: false };
  }
  #arguments(): [{ readonly objectId: string }, { readonly objectId: string }, { readonly objectId: string }, { readonly objectId: string }] {
    return [{ objectId: this.#binding.bus }, { objectId: this.#binding.manager }, { objectId: this.#binding.consistency }, { objectId: this.#binding.constructors }];
  }
  #comparePreflight(raw: unknown): void {
    const value = decodeCurrentFootprintDeleteTriggerPreflight(raw);
    need(canonicalJson(value) === canonicalJson({ ...this.#expected, ownLiveFootprintPresent: true,
      managerUserAbsent: true, dependencyEligibilityVerified: false, executionAuthorized: false }), "PREFLIGHT_DRIFT");
  }
  /** Read the exact tuple and all nine function rosters, then rerun the fixed
   * preflight's in-realm identity comparisons. Cleanup acknowledgment is
   * required for success; a failed cleanup retains the primary error as well. */
  public async observe(): Promise<CurrentFootprintDeleteMetadataObservation> {
    need(!this.#attempted && !consumed.has(this.#transport), "ATTEMPT_CONSUMED");
    this.#attempted = true; consumed.add(this.#transport);
    let failed = false, failure: unknown;
    try {
      const capture = currentFootprintDeleteMetadataArrayCaptureSchema.parse(await this.#request({ phase: "capture",
        method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId, params: { ...this.#flags(),
          functionDeclaration: PROGRAMS.capture.program, arguments: this.#arguments(), returnByValue: false } }));
      const tuple = capture.result.objectId;
      const selected = decodeCurrentFootprintDeleteMetadataTuple(await this.#properties("tuple-before", tuple));
      this.#comparePreflight(await this.#preflight("preflight-before", tuple));
      for (const [index, objectId] of selected.entries()) {
        decodeCurrentFootprintDeleteMethodMetadata(await this.#request({ phase: "method-properties", index,
          method: "Runtime.getProperties", sessionId: this.#binding.sessionId,
          params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), this.#binding.scriptId, index);
      }
      decodeCurrentFootprintDeleteMetadataTuple(await this.#properties("tuple-after", tuple));
      this.#comparePreflight(await this.#preflight("preflight-after", tuple));
      need(this.#normal === BUDGET.normalRequests, "INCOMPLETE");
    } catch (error) { failed = true; failure = error; this.#failed = true; }
    this.#cleanupAttempted = true;
    try {
      z.object({}).strict().parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup",
        sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } })); this.#released = true;
    } catch (error) {
      this.#failed = true;
      if (failed) { throw new AggregateError([failure, error], "FOOTPRINT_DELETE_METADATA_CLEANUP", { cause: error }); }
      throw error;
    }
    if (failed) { throw failure; } this.#completed = true;
    return Object.freeze({ profile: "private.current-footprint-delete-metadata-observation.v1", selectedMethodCount: METHODS.length,
      tupleMetadataSamplesMatched: 2, preflightSamplesMatched: 2, functionMetadataMatchedDeclaredProfiles: METHODS.length,
      functionPrototypeMetadataQualified: false, originalTupleComparedByFixedProgram: true, objectGroupReleaseAcknowledged: true, fullWorkerSourceQualified: false,
      entryProducerQualified: false, nativeObjectsQualified: false, originalRuntimeOwnerQualified: false,
      dependencyEligibilityVerified: false, nativeClockProvenanceVerified: false, deleteInvoked: false, executionAuthorized: false });
  }
  /** Return inert bounded diagnostic replies and sticky progress. Recorded
   * metadata can neither recreate transport custody nor qualify an owner. */
  public retained(): Readonly<Record<string, unknown>> {
    return freezeDeep({ attempted: this.#attempted, failed: this.#failed, completed: this.#completed, phase: this.#position,
      normalRequests: this.#normal, cleanupRequests: this.#cleanup, ownerAssertions: this.#assertions,
      cleanupAttempted: this.#cleanupAttempted, objectGroupReleaseAcknowledged: this.#released, replies: [...this.#replies],
      fullWorkerSourceQualified: false, functionPrototypeMetadataQualified: false, nativeObjectsQualified: false, originalRuntimeOwnerQualified: false,
      deleteInvoked: false, executionAuthorized: false });
  }
}

/* oxlint-disable import/max-dependencies -- This original controller joins closed target preparation, durable evidence, native ownership and the fixed held runner without caller-selected infrastructure. */
/** Read-only public diagnostic controller. Durable records describe consumed
 * work; only retained factory-issued objects can continue native operations. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { prepareCurrentDisposableOpenCheckpoint, readCurrentPcbCommonOpenInventory, verifyCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion,
  assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleBindingSchema, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { CurrentFootprintHeldCacheValidationOwner, assertOriginalCurrentFootprintHeldCacheValidationOwner,
  currentFootprintHeldCacheValidationAllocationOutcome, startCurrentFootprintHeldCacheValidationOwner } from "./current-pcb-diagnostic-owner.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "./current-footprint-saved-cache-held-runner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { assertFootprintHeldCacheJournalBudget, captureFootprintHeldCacheValidationRecord, currentFootprintHeldCacheValidationRequestSchema } from "./current-footprint-held-cache-validation-schema.ts";
import type { CurrentFootprintHeldCacheValidationRecord as RecordEntry, CurrentFootprintHeldCacheValidationRequest as Request } from "./current-footprint-held-cache-validation-schema.ts";
import { assertFootprintHeldCacheValidationChain, assertNoUnresolvedFootprintHeldCacheValidation, publishFootprintHeldCacheValidationRecord,
  readFootprintHeldCacheValidation, reserveFootprintHeldCacheValidation } from "./current-footprint-held-cache-validation-journal.ts";

export interface CurrentFootprintHeldCacheValidationBinding {
  readonly operationId: string;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly originalTarget: CurrentDisposableOpenTarget;
  readonly prepared: CurrentDisposableOpenCheckpoint;
  readonly inventory: Inventory;
  readonly runtime: MachineProfile["runtime"];
}
type Stage = "new" | "starting" | "started" | "first-observing" | "first-observed" | "fresh-observing" | "fresh-observed" |
  "cache-released" | "closing" | "closed" | "released" | "failed";
const normalActions = new Set(["launch", "observe-first", "observe-fresh", "release-cache"]);
const names = ["startFootprintHeldCacheValidationGeneration", "retainedFootprintCopyHeldSavedCache", "requireOriginalFootprintCopyHeldSavedCache",
  "prepareFootprintCopyHeldSavedCache", "observeFirstFootprintCopyHeldSavedCache", "observeFreshFootprintCopyHeldSavedCache",
  "releaseFootprintCopyHeldSavedCache", "observeApplicationWindow", "requestNormalClose", "observeTermination", "releaseClosed",
  "releaseUnlaunched", "releaseNoProcess", "status", "reserveFootprintHeldCacheValidationAbort", "dispatchFootprintHeldCacheValidationAbort"] as const;
type Methods = Pick<CurrentFootprintHeldCacheValidationOwner, typeof names[number]>;
/* oxlint-disable typescript/unbound-method -- Captured methods are called only with their registry-checked original private-field receiver. */
const requirePacket = CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal;
const retained = CurrentFootprintSavedCacheHeldRunner.prototype.retained;
/** Capture the native class vocabulary before any factory or application launch. */
function captureMethods(): Methods {
  const prototype = CurrentFootprintHeldCacheValidationOwner.prototype;
  return Object.freeze({ startFootprintHeldCacheValidationGeneration: prototype.startFootprintHeldCacheValidationGeneration,
    retainedFootprintCopyHeldSavedCache: prototype.retainedFootprintCopyHeldSavedCache,
    requireOriginalFootprintCopyHeldSavedCache: prototype.requireOriginalFootprintCopyHeldSavedCache,
    prepareFootprintCopyHeldSavedCache: prototype.prepareFootprintCopyHeldSavedCache,
    observeFirstFootprintCopyHeldSavedCache: prototype.observeFirstFootprintCopyHeldSavedCache,
    observeFreshFootprintCopyHeldSavedCache: prototype.observeFreshFootprintCopyHeldSavedCache,
    releaseFootprintCopyHeldSavedCache: prototype.releaseFootprintCopyHeldSavedCache,
    observeApplicationWindow: prototype.observeApplicationWindow, requestNormalClose: prototype.requestNormalClose,
    observeTermination: prototype.observeTermination, releaseClosed: prototype.releaseClosed, releaseUnlaunched: prototype.releaseUnlaunched,
    releaseNoProcess: prototype.releaseNoProcess, status: prototype.status,
    reserveFootprintHeldCacheValidationAbort: prototype.reserveFootprintHeldCacheValidationAbort,
    dispatchFootprintHeldCacheValidationAbort: prototype.dispatchFootprintHeldCacheValidationAbort });
}
/* oxlint-enable typescript/unbound-method */

/** Refuse without promoting a durable record or a resolved boolean into custody. */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`HELD_CACHE_VALIDATION_${code}`); } }

export class CurrentFootprintHeldCacheValidation {
  readonly #options: CurrentPcbDiagnosticLifecycleOptions;
  readonly #methods = captureMethods();
  readonly #records: RecordEntry[] = [];
  #operationId: string | null = null;
  #binding: CurrentFootprintHeldCacheValidationBinding | null = null;
  #bindingText: string | null = null;
  #completion: ReturnType<typeof readerCompletion> | null = null;
  #owner: CurrentFootprintHeldCacheValidationOwner | null = null;
  #runner: CurrentFootprintSavedCacheHeldRunner | null = null;
  #first: CurrentFootprintSavedCacheHeldObservation | null = null;
  #fresh: CurrentFootprintSavedCacheHeldObservation | null = null;
  #rawFirst: unknown = null;
  #rawFresh: unknown = null;
  #recordedReplies = 0;
  #recordedRepliesSha256 = sha256Json([]);
  #recordedFirst = false;
  #recordedFresh = false;
  #lastFailure: string | null = null;
  #abortToken: object | null = null;
  #stage: Stage = "new";
  #busy = false;
  #abortBusy = false;
  #failed = false;
  #reserved = false;
  #reservationSettled = false;
  #allocationInvoked = false;
  #allocationOutcome = "not-attempted";
  #launchAttempted = false;
  #closeAttempted = false;
  #abortAttempted = false;
  #cacheReleaseAttempted = false;
  #terminated = false;
  #terminationObservations = 0;
  #releaseAttempted = false;
  #noResourceCleanupAttempted = false;
  #released = false;
  #publication: Promise<void> = Promise.resolve();

  /** Options are facade-owned configuration. No public request can inject a
   * factory, runtime, verifier, owner, checkpoint receipt or native command. */
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions) { this.#options = Object.freeze({ ...options }); }

  /** Keep other facade routes excluded from original reservation through real
   * cleanup. Historical JSON cannot clear this process-local ownership state. */
  public hasActiveReservation(): boolean { return this.#reserved && !this.#reservationSettled; }

  /** Shutdown may retain this actual helper even after a partial launch fails. */
  public hasOwnedAllocation(): boolean { return this.#owner !== null && !this.#released; }

  /** Reprove exact owner/method/input custody synchronously across awaits. This
   * local check makes no fresh Windows or ongoing cache-absence claim. */
  #current(normal = false): void {
    this.#options.assertLocalAllowed();
    if (normal) { need(!this.#failed && !this.#abortAttempted && !this.#closeAttempted && !this.#releaseAttempted, "NORMAL_ENDED"); }
    if (this.#binding !== null) {
      need(canonicalJson({ ...this.#binding, inventory: undefined }) === this.#bindingText &&
        readerCompletion(this.#binding.inventory) === this.#completion, "ORIGINAL_PREPARATION_CHANGED");
    }
    if (this.#owner !== null) {
      const owner = this.#owner; assertOriginalCurrentFootprintHeldCacheValidationOwner(owner);
      need(!types.isProxy(owner) && Object.getPrototypeOf(owner) === CurrentFootprintHeldCacheValidationOwner.prototype &&
        Reflect.ownKeys(owner).length === 0, "ORIGINAL_OWNER");
      for (const name of names) { need(owner[name] === this.#methods[name] && CurrentFootprintHeldCacheValidationOwner.prototype[name] === this.#methods[name], "ORIGINAL_METHOD"); }
      if (this.#runner !== null) {
        need(CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal === requirePacket && CurrentFootprintSavedCacheHeldRunner.prototype.retained === retained,
          "RUNNER_METHOD_CHANGED");
        this.#methods.requireOriginalFootprintCopyHeldSavedCache.call(owner, this.#runner);
      }
    }
  }

  /** Return only the actual factory-issued owner retained before launch. */
  #native(): CurrentFootprintHeldCacheValidationOwner { this.#current(); need(this.#owner !== null, "ORIGINAL_OWNER_REQUIRED"); return this.#owner; }

  /** Compare the entire disk chain with this controller's original record prefix.
   * Missing original publications can be settled; foreign additions never pass. */
  async #durable(): Promise<void> {
    need(this.#operationId !== null && this.#reserved, "JOURNAL_REQUIRED");
    const actual = await readFootprintHeldCacheValidation(this.#operationId); this.#current();
    need(actual !== null && actual.records.length <= this.#records.length && actual.records.every((record, index) =>
      canonicalJson(record) === canonicalJson(this.#records[index])), "JOURNAL_CHANGED");
  }

  /** Publish retained records in order. A filesystem acknowledgment failure
   * never retries native work or permits another owner to adopt the operation. */
  async #settle(): Promise<void> {
    const previous = this.#publication;
    const work = (async (): Promise<void> => {
      await previous; await this.#durable();
      const actual = await readFootprintHeldCacheValidation(this.#operationId ?? ""); this.#current(); need(actual !== null, "JOURNAL_REQUIRED");
      for (const record of this.#records.slice(actual.records.length)) { await publishFootprintHeldCacheValidationRecord(record); this.#current(); }
      await this.#durable();
      const last = this.#records.at(-1);
      if (this.#released && last !== undefined && ["release-closed-result", "cleanup-unlaunched-result", "cleanup-no-process-result"].includes(last.kind) ||
          this.#noResourceCleanupAttempted && last?.kind === "cleanup-no-resource-result" ||
          !this.#allocationInvoked && last?.kind === "failure" && last.evidence["nativeAllocationNeverAttempted"] === true) {
        this.#reservationSettled = true;
      }
    })();
    this.#publication = (async (): Promise<void> => {
      try { await work; }
      catch {
        // Preserve the original error while permitting original evidence-only settlement.
      }
    })();
    await work;
  }

  /** Retain a complete bounded record before publication. The chained digest
   * detects changes; it is not authentication or a native capability. */
  async #record(kind: RecordEntry["kind"], evidence: Readonly<Record<string, unknown>>): Promise<void> {
    need(this.#operationId !== null && this.#records.length < 512, "RECORD_BOUND");
    const capturedEvidence: Record<string, unknown> = { ...evidence };
    let replyCount = this.#recordedReplies, replySha256 = this.#recordedRepliesSha256;
    if (this.#runner !== null) {
      const { replies, ...summary } = retained.call(this.#runner); need(Array.isArray(replies), "RETAINED_REPLIES");
      const original: unknown[] = replies.map((value: unknown): unknown => value);
      need(original.length >= this.#recordedReplies && sha256Json(original.slice(0, this.#recordedReplies)) === this.#recordedRepliesSha256, "RETAINED_REPLY_PREFIX");
      capturedEvidence["held"] = { summary, replyStart: this.#recordedReplies, previousRepliesSha256: this.#recordedRepliesSha256,
        replyDelta: original.slice(this.#recordedReplies) }; replyCount = original.length; replySha256 = sha256Json(original);
    }
    if (!this.#recordedFirst && this.#rawFirst !== null) { capturedEvidence["firstObservation"] = this.#rawFirst; }
    if (!this.#recordedFresh && this.#rawFresh !== null) { capturedEvidence["freshObservation"] = this.#rawFresh; }
    const record = captureFootprintHeldCacheValidationRecord({
      schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1", operationId: this.#operationId, sequence: this.#records.length,
      createdAt: new Date().toISOString(), previousSha256: this.#records.length === 0 ? null : sha256Json(this.#records.at(-1)), kind, evidence: capturedEvidence });
    assertFootprintHeldCacheValidationChain([...this.#records, record]);
    assertFootprintHeldCacheJournalBudget([...this.#records, record]); this.#records.push(record);
    this.#recordedReplies = replyCount; this.#recordedRepliesSha256 = replySha256;
    this.#recordedFirst ||= this.#rawFirst !== null; this.#recordedFresh ||= this.#rawFresh !== null;
    await this.#settle();
  }

  /** Prepare exact target/default-branch/full-SQL references before allocating
   * the new native role. Launch intent precedes helper and application work. */
  async #launch(request: Extract<Request, { action: "launch" }>): Promise<void> {
    need(!this.#launchAttempted && this.#stage === "new", "LAUNCH_CONSUMED");
    this.#launchAttempted = true; this.#stage = "starting"; this.#operationId = request.operationId;
    const lease = acquireCurrentPcbDiagnosticLaunchExclusion();
    try {
      await this.#options.assertAllowed(); assertCurrentPcbDiagnosticLaunchExclusion(lease); this.#current(true);
      if (this.#options.assertOtherLaunchesSettled !== this.#options.assertAllowed) { await this.#options.assertOtherLaunchesSettled(); this.#current(true); }
      await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); this.#current(true);
      await assertNoUnresolvedFootprintHeldCacheValidation(); this.#current(true);
      await reserveFootprintHeldCacheValidation(request.operationId); this.#reserved = true;
      await this.#record("launch-intent", { request }); this.#current(true);
      const target = Object.freeze(request.target);
      const prepared = await prepareCurrentDisposableOpenCheckpoint(target); this.#current(true);
      const inventory = await readCurrentPcbCommonOpenInventory(prepared, target); this.#current(true);
      const completion = readerCompletion(inventory);
      need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
        inventory.checkpointSha256 === prepared.checkpoint.checkpointSha256, "COMPLETE_SQL_REQUIRED");
      const selected = currentDisposableOpenSealedTargetSchema.parse({ ...target, branchUuid: prepared.targetEvidence.branchUuid });
      const configured = await loadRuntimeMachineProfile(); this.#current(true);
      this.#binding = Object.freeze({ operationId: request.operationId, target: Object.freeze(selected), originalTarget: target, prepared,
        inventory, runtime: Object.freeze({ ...configured.profile.runtime }) }); this.#completion = completion;
      this.#bindingText = canonicalJson({ ...this.#binding, inventory: undefined });
      await verifyCurrentDisposableOpenCheckpoint(prepared, target); this.#current(true);
      await this.#record("prepared", { target: selected, checkpoint: prepared.checkpoint, beforeSqlSha256: inventory.logicalSha256 }); this.#current(true);
      await this.#record("allocation-intent", { purpose: "footprint-held-cache209", beforeSqlSha256: inventory.logicalSha256 }); this.#current(true);
      this.#allocationInvoked = true; this.#allocationOutcome = "pending";
      try { this.#owner = await startCurrentFootprintHeldCacheValidationOwner(this.#options, this.#binding); }
      catch (error) {
        const outcome = currentFootprintHeldCacheValidationAllocationOutcome(this.#binding);
        this.#owner = outcome.owner; this.#allocationOutcome = outcome.status; throw error;
      }
      this.#allocationOutcome = "retained"; this.#current(true);
      await this.#record("allocation-result", { retained: true, applicationLaunchDispatched: false }); this.#current(true);
      await this.#methods.startFootprintHeldCacheValidationGeneration.call(this.#native()); this.#current(true);
      const binding = diagnosticLifecycleBindingSchema.parse(this.#methods.status.call(this.#native()).binding);
      need(binding.rootCreated !== "0", "NATIVE_ROOT_REQUIRED");
      this.#runner = this.#methods.retainedFootprintCopyHeldSavedCache.call(this.#native()); this.#current(true);
      await this.#record("launch-result", { binding, target: selected, originalCheckpointSelected: true, projectOpened: false }); this.#current(true);
      this.#stage = "started";
    } finally { releaseCurrentPcbDiagnosticLaunchExclusion(lease); }
  }

  /** Qualify the actual original getter tuple before its first namespace sample.
   * Only the retained original packet can complete this consumed stage. */
  async #observeFirst(): Promise<void> {
    need(this.#stage === "started", "FIRST_CONSUMED"); this.#stage = "first-observing";
    await this.#record("observe-first-intent", { prepareGetter: true, namespaceMatches: 2 }); this.#current(true);
    const owner = this.#native(); await this.#methods.prepareFootprintCopyHeldSavedCache.call(owner); this.#current(true);
    const packet = await this.#methods.observeFirstFootprintCopyHeldSavedCache.call(owner); this.#rawFirst = packet; this.#current(true);
    need(this.#runner !== null, "RUNNER_REQUIRED"); await requirePacket.call(this.#runner, packet, "first"); this.#current(true);
    this.#first = packet;
    await this.#record("observe-first-result", { observationSha256: sha256Json(packet) }); this.#current(true); this.#stage = "first-observed";
  }

  /** Sample both namespaces again on the same held tuple at a separate action.
   * The result supplies no saved-copy/replay or continuous-absence witness. */
  async #observeFresh(): Promise<void> {
    need(this.#stage === "first-observed" && this.#first !== null, "FRESH_CONSUMED"); this.#stage = "fresh-observing";
    await this.#record("observe-fresh-intent", { firstSha256: sha256Json(this.#first), namespaceMatches: 2 }); this.#current(true);
    const packet = await this.#methods.observeFreshFootprintCopyHeldSavedCache.call(this.#native()); this.#rawFresh = packet; this.#current(true);
    need(this.#runner !== null, "RUNNER_REQUIRED"); await requirePacket.call(this.#runner, packet, "fresh"); this.#current(true);
    this.#fresh = packet;
    await this.#record("observe-fresh-result", { observationSha256: sha256Json(packet) }); this.#current(true); this.#stage = "fresh-observed";
  }

  /** Release the original group once. Lost acknowledgment remains consumed and
   * cannot be repaired by observing later native process termination. */
  async #releaseCache(): Promise<void> {
    need(!this.#cacheReleaseAttempted && (this.#stage === "first-observed" || this.#stage === "fresh-observed"), "CACHE_RELEASE_CONSUMED");
    this.#cacheReleaseAttempted = true; await this.#record("release-cache-intent", { retryAllowed: false }); this.#current(true);
    await this.#methods.releaseFootprintCopyHeldSavedCache.call(this.#native()); this.#current(true);
    need(this.#runner !== null && retained.call(this.#runner)["released"] === true, "CACHE_RELEASE_ACK_REQUIRED");
    await this.#record("release-cache-result", { released: true }); this.#current(true); this.#stage = "cache-released";
  }

  /** Consume one original close. Unlaunched/no-process cleanup is observed
   * separately; normal close never selects Save/Discard or repeats a window call. */
  async #close(): Promise<void> {
    const owner = this.#native(), status = this.#methods.status.call(owner);
    need(!this.#closeAttempted && !this.#releaseAttempted && !this.#released, "CLOSE_CONSUMED");
    need(status.launchConsumed && !status.noProcessCleanupAvailable && status.binding !== null, "NORMAL_CLOSE_REQUIRES_ORIGINAL_ROOT");
    this.#closeAttempted = true; this.#stage = "closing";
    await this.#record("normal-close-intent", { saveOrDiscardSelected: false });
    const window = await this.#methods.observeApplicationWindow.call(owner); this.#current(); need(window !== null, "CLOSE_WINDOW_MISSING");
    await this.#methods.requestNormalClose.call(owner, window); this.#current();
    await this.#record("normal-close-result", { closeDispatched: true, saveOrDiscardSelected: false });
  }

  /** Abort may run while an original observation is pending. Its intent is
   * consumed first, and every delayed normal continuation then refuses. */
  async #abort(): Promise<void> {
    need(this.#abortAttempted && this.#abortToken !== null && !this.#released && !this.#terminated, "ABORT_CONSUMED");
    await this.#record("abort-intent", { confirmOriginalJob: true, retryAllowed: false });
    await this.#methods.dispatchFootprintHeldCacheValidationAbort.call(this.#native(), this.#abortToken, true); this.#current();
    await this.#record("abort-result", { abortRequested: true, originalJobOnly: true, terminationObserved: false });
  }

  /** Bound actual original kernel observations. A false or missing reply grants
   * no exit/release proof and never permits another close or abort attempt. */
  async #observeTermination(): Promise<void> {
    need(this.#records.some(record => record.kind === "normal-close-intent" || record.kind === "abort-intent") &&
      !this.#released && !this.#terminated && this.#terminationObservations < 240,
      "TERMINATION_CONSUMED"); this.#terminationObservations += 1;
    await this.#record("termination-intent", { ordinal: this.#terminationObservations });
    const ended = await this.#methods.observeTermination.call(this.#native()); this.#current();
    need(typeof ended === "boolean", "TERMINATION_RESULT"); this.#terminated = ended;
    if (ended) { this.#stage = "closed"; }
    await this.#record("termination-result", { ordinal: this.#terminationObservations, originalRootAndJobTerminated: ended });
  }

  /** Release only this retained terminated generation. The genuine owner
   * independently reproves original root and complete Job closure. */
  async #releaseClosed(): Promise<void> {
    need(this.#terminated && !this.#releaseAttempted && !this.#released, "RELEASE_CONSUMED"); this.#releaseAttempted = true;
    await this.#record("release-closed-intent", { originalTerminationObserved: true });
    await this.#methods.releaseClosed.call(this.#native()); this.#current();
    const status = this.#methods.status.call(this.#native()); need(status.released && status.helperClosed, "RELEASE_ACK_REQUIRED");
    this.#released = true; this.#stage = "released"; await this.#record("release-closed-result", { released: true, originalTerminationObserved: true });
    this.#reservationSettled = true;
  }

  /** Release only a genuine retained helper whose original owner proves that
   * app launch was never attempted or produced no process. No PID is adopted. */
  async #cleanupHelper(kind: "cleanup-unlaunched" | "cleanup-no-process"): Promise<void> {
    need(!this.#releaseAttempted && !this.#released, "CLEANUP_CONSUMED");
    const owner = this.#native(), status = this.#methods.status.call(owner);
    need(kind === "cleanup-unlaunched" ? !status.launchConsumed : status.noProcessCleanupAvailable, "ORIGINAL_HELPER_CLEANUP_REQUIRED");
    this.#releaseAttempted = true;
    await this.#record(kind === "cleanup-unlaunched" ? "cleanup-unlaunched-intent" : "cleanup-no-process-intent", { applicationTerminationObserved: false });
    await (kind === "cleanup-unlaunched" ? this.#methods.releaseUnlaunched.call(owner) : this.#methods.releaseNoProcess.call(owner));
    this.#current(); const after = this.#methods.status.call(owner); need(after.released && after.helperClosed, "HELPER_RELEASE_ACK_REQUIRED");
    this.#released = true; this.#stage = "released";
    await this.#record(kind === "cleanup-unlaunched" ? "cleanup-unlaunched-result" : "cleanup-no-process-result",
      { helperReleased: true, applicationTerminationObserved: false, noApplicationGeneration: true });
    this.#reservationSettled = true;
  }

  /** A no-resource outcome is issued only by the original factory registry.
   * Absence of a retained owner or a historical JSON record cannot establish it. */
  async #cleanupNoResource(): Promise<void> {
    need(!this.#noResourceCleanupAttempted && this.#binding !== null && this.#allocationInvoked && this.#owner === null && !this.#released,
      "NO_RESOURCE_CLEANUP_CONSUMED"); this.#noResourceCleanupAttempted = true;
    const outcome = currentFootprintHeldCacheValidationAllocationOutcome(this.#binding);
    need(outcome.status === "no-resource" && outcome.owner === null && this.#allocationOutcome === "no-resource", "ORIGINAL_NO_RESOURCE_REQUIRED");
    await this.#record("cleanup-no-resource-result", { nativeAllocationOutcome: "no-resource", nativeTerminationObserved: false,
      nativeResourceReleaseObserved: false }); this.#stage = "released"; this.#reservationSettled = true;
  }

  /** Return bounded summaries. Historical records cannot adopt a native owner,
   * and raw constructor/getter metadata remains in private managed evidence. */
  async #inspect(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    const journal = await readFootprintHeldCacheValidation(operationId), original = operationId === this.#operationId;
    if (original) { this.#current(); }
    return { operationId, originalOwnerRetained: original && this.#owner !== null, phase: original ? this.#stage : "historical",
      attemptConsumed: journal !== null || original && this.#launchAttempted, failed: original && this.#failed,
      records: journal?.records.map(record => ({ sequence: record.sequence, kind: record.kind, sha256: sha256Json(record) })) ?? [],
      retainedUnpublishedRecords: original ? this.#records.length - (journal?.records.length ?? 0) : 0,
      allocationOutcome: original ? this.#allocationOutcome : "historical-owner-unavailable",
      firstObserved: original && this.#first !== null, freshObserved: original && this.#fresh !== null,
      cacheReleaseAcknowledged: original && this.#runner !== null && retained.call(this.#runner)["released"] === true,
      closeAttemptConsumed: original && this.#closeAttempted, abortAttemptConsumed: original && this.#abortAttempted,
      lastFailure: original ? this.#lastFailure : null,
      heldCacheStartupObservation: original && this.#owner !== null ? this.#methods.status.call(this.#owner).heldCacheStartupObservation ?? null : null,
      originalTerminationObserved: original && this.#terminated, released: original && this.#released,
      cleanupNoResourceAvailable: original && this.#binding !== null && this.#owner === null && this.#allocationOutcome === "no-resource" && !this.#noResourceCleanupAttempted,
      cleanupUnlaunchedAvailable: original && this.#owner !== null && !this.#methods.status.call(this.#owner).launchConsumed && !this.#releaseAttempted,
      cleanupNoProcessAvailable: original && this.#owner !== null && this.#methods.status.call(this.#owner).noProcessCleanupAvailable && !this.#releaseAttempted,
      nativeQualificationIssued: false, runtimeAdmissionGranted: false, replayTokenIssued: false, writerAuthority: false,
      saveAuthorized: false, executionAuthorized: false, projectOpened: false };
  }

  /** Retain primary failure and complete original raw evidence before publishing
   * a failure row. A publication error preserves both errors and owner custody. */
  async #recordFailure(originalError: unknown, action: Request["action"]): Promise<void> {
    this.#lastFailure = originalError instanceof Error ? originalError.message.slice(0, 512) : "non-error refusal";
    const results: Partial<Record<Request["action"], RecordEntry["kind"]>> = { launch: "launch-result", "observe-first": "observe-first-result",
      "observe-fresh": "observe-fresh-result", "release-cache": "release-cache-result", "normal-close": "normal-close-result", abort: "abort-result",
      "observe-termination": "termination-result", "release-closed": "release-closed-result", "cleanup-unlaunched": "cleanup-unlaunched-result",
      "cleanup-no-process": "cleanup-no-process-result", "cleanup-no-resource": "cleanup-no-resource-result" };
    // A retained result already consumes this attempt's second row, including
    // An unpublished result. Settlement must not add a third poll/failure row.
    if (action === "settle-records" || this.#records.at(-1)?.kind === results[action]) { return; }
    if (this.#reserved) {
      try {
        const native = this.#owner === null ? null : this.#methods.status.call(this.#owner);
        const startup = native?.heldCacheStartupObservation ?? null;
        await this.#record("failure", { action, nativeAllocationNeverAttempted: !this.#allocationInvoked,
          nativeAllocationOutcome: this.#allocationOutcome, retryAllowed: false,
          ...(action === "launch" && native?.binding !== null && native?.binding !== undefined ? { nativeBinding: diagnosticLifecycleBindingSchema.parse(native.binding) } : {}),
          ...(action === "launch" && startup !== null ? { heldCacheStartupObservation: startup } : {}),
          failure: this.#lastFailure });
        if (!this.#allocationInvoked) { this.#reservationSettled = true; }
      } catch (error) {
        throw new AggregateError([originalError, error], "Held-cache validation failed with retained unpublished evidence.", { cause: error });
      }
    }
  }

  /** Dispatch only fixed actions. Native attempts remain consumed on every
   * failure; evidence settlement can publish retained data but never retry them. */
  public async run(input: unknown): Promise<Readonly<Record<string, unknown>>> {
    const request = currentFootprintHeldCacheValidationRequestSchema.parse(captureCurrentPcbStringClockReply(input).value);
    this.#options.assertLocalAllowed();
    if (request.action === "inspect") { return this.#inspect(request.operationId); }
    need(request.action === "settle-records" || !this.#reservationSettled, "TERMINAL_OPERATION");
    need(request.action !== "launch" || !this.#launchAttempted, "LAUNCH_CONSUMED");
    if (request.action !== "launch") { need(this.#operationId === request.operationId, "ORIGINAL_OPERATION_REQUIRED"); }
    if (normalActions.has(request.action) && request.action !== "launch") { this.#current(true); }
    need(request.action !== "normal-close" || !this.#closeAttempted, "CLOSE_CONSUMED");
    need(request.action !== "abort" || !this.#abortAttempted, "ABORT_CONSUMED");
    need(request.action !== "cleanup-no-resource" || !this.#noResourceCleanupAttempted, "NO_RESOURCE_CLEANUP_CONSUMED");
    need(request.action !== "observe-termination" || this.#records.some(record => record.kind === "normal-close-intent" || record.kind === "abort-intent") && !this.#released &&
      !this.#terminated && this.#terminationObservations < 240, "TERMINATION_CONSUMED");
    need(request.action !== "release-closed" && request.action !== "cleanup-unlaunched" && request.action !== "cleanup-no-process" || !this.#releaseAttempted,
      "RELEASE_CONSUMED");
    if (request.action === "normal-close" || request.action === "cleanup-unlaunched" || request.action === "cleanup-no-process") {
      const status = this.#methods.status.call(this.#native());
      switch (request.action) {
        case "cleanup-unlaunched": { need(!status.launchConsumed, "ORIGINAL_CLEANUP_READINESS"); break; }
        case "cleanup-no-process": { need(status.noProcessCleanupAvailable, "ORIGINAL_CLEANUP_READINESS"); break; }
        case "normal-close": { need(status.launchConsumed && !status.noProcessCleanupAvailable && status.binding !== null, "ORIGINAL_CLEANUP_READINESS"); break; }
        default: { throw new Error("HELD_CACHE_VALIDATION_CLEANUP_ACTION"); }
      }
    }
    need(request.action !== "release-closed" || this.#terminated, "ORIGINAL_TERMINATION_REQUIRED");
    need(request.action !== "cleanup-no-resource" || this.#binding !== null && this.#allocationInvoked && this.#owner === null &&
      this.#allocationOutcome === "no-resource", "ORIGINAL_NO_RESOURCE_REQUIRED");
    const abort = request.action === "abort";
    need(abort ? !this.#abortBusy : !this.#busy && !this.#abortBusy, "BUSY");
    // Startup may already own a native Job while verification is pending.
    // Reprove custody before allowing abort, or refuse without consuming it.
    if (abort && this.#stage === "starting") {
      this.#current();
      need(this.#owner !== null && this.#methods.status.call(this.#owner).binding !== null, "BUSY");
    }
    if (abort) { this.#abortBusy = true; this.#abortAttempted = true; this.#failed = true; } else { this.#busy = true; }
    try {
      if (abort) { this.#abortToken = this.#methods.reserveFootprintHeldCacheValidationAbort.call(this.#native()); }
      if (request.action !== "launch") { need(this.#operationId === request.operationId, "ORIGINAL_OPERATION_REQUIRED"); await this.#settle(); this.#current(normalActions.has(request.action)); }
      switch (request.action) {
        case "launch": { await this.#launch(request); break; }
        case "observe-first": { await this.#observeFirst(); break; }
        case "observe-fresh": { await this.#observeFresh(); break; }
        case "release-cache": { await this.#releaseCache(); break; }
        case "normal-close": { await this.#close(); break; }
        case "abort": { await this.#abort(); break; }
        case "observe-termination": { await this.#observeTermination(); break; }
        case "release-closed": { await this.#releaseClosed(); break; }
        case "cleanup-unlaunched": case "cleanup-no-process": { await this.#cleanupHelper(request.action); break; }
        case "cleanup-no-resource": { await this.#cleanupNoResource(); break; }
        case "settle-records": { await this.#settle(); break; }
        default: { throw new Error("HELD_CACHE_VALIDATION_ACTION"); }
      }
      return await this.#inspect(request.operationId);
    } catch (error) {
      this.#failed = true; if (!this.#closeAttempted && !this.#terminated && !this.#released) { this.#stage = "failed"; }
      await this.#recordFailure(error, request.action); throw error;
    } finally { if (abort) { this.#abortBusy = false; } else { this.#busy = false; } }
  }
}

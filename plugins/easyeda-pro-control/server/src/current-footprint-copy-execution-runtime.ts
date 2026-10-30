/* oxlint-disable eslint/max-classes-per-file -- The coordinator accepts only this private-field original owner; their registries and method identity checks stay together. */
/* oxlint-disable import/max-dependencies -- This coordinator composes the existing native argument/result, original clocks, complete SQL and saved-reader implementations instead of duplicating their proofs. */
/** Concrete private copy/closure/reopen coordinator. Its native dependency has
 * no implementation or MCP mount yet. Preparation owners cannot provide it.
 * Normal generation closure replaces a callback-completion claim, not source,
 * receiver, destination, actor or external-effect qualification before create. */
import { types } from "node:util";
import process from "node:process";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as LIMITS,
  currentFootprintCopyExecutionAdvanceSchema, currentFootprintCopyExecutionGenerationSchema } from "./current-footprint-copy-execution.ts";
import type { CurrentFootprintCopyExecutionGeneration, CurrentFootprintCopyExecutionPhase } from "./current-footprint-copy-execution.ts";
import { currentFootprintCopyV2Before } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { currentFootprintCopyV2NativeCreateArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import { decodeCurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import type { CurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import { reserveCurrentFootprintCopyV2Capacity } from "./current-footprint-copy-v2-capacity.ts";
import { completedCurrentFootprintCopyV2SqlSource, prepareCurrentFootprintCopyV2SqlPlan,
  verifyCurrentFootprintCopyV2SqlEffect } from "./current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlPlan, CurrentFootprintCopyV2SqlWitness } from "./current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { CurrentFootprintCopyPairedScheduler } from "./current-footprint-copy-paired-scheduler.ts";
import type { CurrentFootprintCopyPairedScheduleObservation } from "./current-footprint-copy-paired-scheduler.ts";
import type { CurrentFootprintCopyClockRpcObservation } from "./current-footprint-copy-clock-rpc-runner.ts";
import { CurrentFootprintCopyV2SavedReadRunner } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopyV2SavedReadPacket } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { CurrentFootprintCopyOutputLedger, reserveCurrentFootprintCopyOutput } from "./current-footprint-copy-output-reservation.ts";
import type { CurrentFootprintCopyOutputKind } from "./current-footprint-copy-output-reservation.ts";

export interface CurrentFootprintCopyExecutionQualification {
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly witness: CurrentFootprintCopyV2SqlWitness;
  /** The genuine native factory has armed the original main and allocated
   * renderer sequencers, with no create dispatched. */
  readonly schedule: CurrentFootprintCopyPairedScheduler;
}
/** Tokens are retained native references, never persisted JSON or booleans.
 * requireTermination must prove original root exit and complete Job emptiness. */
type Termination = Readonly<{ status: "pending" }> | Readonly<{ status: "terminated"; original: object }>;
export type CurrentFootprintCopySavedStartOutcome = "not-started" | "pending" | "no-resource" | "retained" | "unresolved";
export interface CurrentFootprintCopySavedExecutionNative {
  readonly generation: object;
  readonly assertOwned: () => void;
  /** This owner is allocated and retained before its first native launch. */
  readonly start: (projection: CurrentFootprintCopyV2SavedProjection, after: Inventory) => Promise<void>;
  /** Original allocation outcome, including admission failure before spawn.
   * No-resource grants no termination, release or saved-content evidence. */
  readonly startOutcome: () => CurrentFootprintCopySavedStartOutcome;
  readonly excludeReplay: () => Promise<object>;
  readonly requireReplayExclusion: (original: object) => Promise<void>;
  /** Must check original post-edit bytes and both upload-cache namespaces
   * immediately before its sole open, using the original exclusion reference. */
  readonly open: (projection: CurrentFootprintCopyV2SavedProjection, after: Inventory, replay: object) => Promise<Readonly<{
    state: CurrentFootprintCopyStatePacket; transport: CurrentFootprintCopySourceReadTransport;
  }>>;
  readonly close: () => Promise<unknown>;
  readonly termination: () => Promise<Termination>;
  readonly requireTermination: (original: object) => Promise<void>;
  readonly snapshot: (original: object) => Promise<Inventory>;
  readonly release: (original: object) => Promise<void>;
  /** Observes the retained original release command without sending it again. */
  readonly observeRelease: (original: object) => Promise<"pending" | "released">;
}
export interface CurrentFootprintCopyExecutionNative {
  readonly generation: CurrentFootprintCopyExecutionGeneration;
  readonly nativeGeneration: object;
  /** Rechecks the original sealed purpose, process/Job/pipe and immutable
   * methods, including retained terminated/released state during cleanup. A
   * matching purpose string is not proof. No same-PID handle adoption. */
  readonly assertOwned: () => void;
  /** Must join original preparation, constructor callbacks, reciprocal source
   * route, backend actor/RPC, native Windows clock and whole execution budget.
   * Existing preparation tokens alone do not satisfy this contract. */
  readonly qualify: () => Promise<CurrentFootprintCopyExecutionQualification>;
  readonly requireQualification: (original: CurrentFootprintCopyExecutionQualification) => Promise<void>;
  readonly publish: (phase: string, evidence: unknown) => Promise<void>;
  readonly close: () => Promise<unknown>;
  readonly termination: () => Promise<Termination>;
  readonly requireTermination: (original: object) => Promise<void>;
  readonly snapshot: (original: object) => Promise<Inventory>;
  readonly verifyClockClosure: (qualification: CurrentFootprintCopyExecutionQualification,
    paired: CurrentFootprintCopyPairedScheduleObservation, termination: object) => Promise<void>;
  readonly release: (original: object) => Promise<void>;
  readonly observeRelease: (original: object) => Promise<"pending" | "released">;
  /** Pure owner allocation, no process launch. The coordinator retains the
   * returned owner before calling start, including when start later fails. */
  readonly verification: () => CurrentFootprintCopySavedExecutionNative;
}
const nativeFields = ["generation", "nativeGeneration", "assertOwned", "qualify", "requireQualification", "publish", "close",
  "termination", "requireTermination", "snapshot", "verifyClockClosure", "release", "observeRelease", "verification"] as const;
const verificationFields = ["generation", "assertOwned", "start", "startOutcome", "excludeReplay", "requireReplayExclusion", "open", "close",
  "termination", "requireTermination", "snapshot", "release", "observeRelease"] as const;
const cleanupPhases = new Set<CurrentFootprintCopyExecutionPhase>(["close-writer", "observe-writer-exit", "release-writer",
  "close-verification", "observe-verification-exit", "release-verification"]);
/* oxlint-disable typescript/unbound-method -- Methods are captured from the original class and called only on its private-field receiver. */
const scheduleMethods = Object.freeze({ requireExecutionReady: CurrentFootprintCopyPairedScheduler.prototype.requireExecutionReady,
  dispatchCreate: CurrentFootprintCopyPairedScheduler.prototype.dispatchCreate,
  collectClocks: CurrentFootprintCopyPairedScheduler.prototype.collectClocks,
  collectMain: CurrentFootprintCopyPairedScheduler.prototype.collectMain,
  joinCreate: CurrentFootprintCopyPairedScheduler.prototype.joinCreate,
  requireOriginalResult: CurrentFootprintCopyPairedScheduler.prototype.requireOriginalResult,
  requireQuiescentClose: CurrentFootprintCopyPairedScheduler.prototype.requireQuiescentClose,
  observeOriginalGenerationEnded: CurrentFootprintCopyPairedScheduler.prototype.observeOriginalGenerationEnded,
  diagnostics: CurrentFootprintCopyPairedScheduler.prototype.diagnostics });
/* oxlint-enable typescript/unbound-method */
const owners = new WeakSet<CurrentFootprintCopyExecutionOwner>();
const consumed = new WeakSet<CurrentFootprintCopyExecutionOwner>();
const monotonic = process.hrtime.bigint.bind(process.hrtime);
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_EXECUTION_${detail}`); }
}
function fields(value: unknown, names: readonly string[], objects: number): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.isFrozen(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === names.length, "ORIGINAL_BINDING");
  return names.map((name, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
      typeof descriptor.value === (index < objects ? "object" : "function") && descriptor.value !== null && !types.isProxy(descriptor.value), "ORIGINAL_FIELDS");
    return descriptor.value as unknown;
  });
}
function finished(inventory: Inventory): void {
  const reader = readerCompletion(inventory);
  need(reader.observedChildClose && reader.exitCode === 0 && reader.exitSignal === null, "COMPLETE_SQL_READER");
}
function requireOriginalSchedule(schedule: CurrentFootprintCopyPairedScheduler): CurrentFootprintCopyPairedScheduler {
  need(schedule !== null && typeof schedule === "object" && !types.isProxy(schedule) && Object.getPrototypeOf(schedule) === CurrentFootprintCopyPairedScheduler.prototype &&
    Reflect.ownKeys(schedule).length === 0 && Object.entries(scheduleMethods)
      .every(([key, method]) => Object.getOwnPropertyDescriptor(CurrentFootprintCopyPairedScheduler.prototype, key)?.value === method), "ORIGINAL_PAIRED_SCHEDULE");
  // A copied prototype cannot acquire cleanup custody. This captured original
  // Method must accept the actual private-field receiver before any retention.
  scheduleMethods.diagnostics.call(schedule); return schedule;
}
function requireSchedule(q: CurrentFootprintCopyExecutionQualification): CurrentFootprintCopyPairedScheduler {
  // Outer qualification immutability and field shape are checked separately.
  // Even a rejected envelope can already hold this genuine armed resource.
  need(q !== null && typeof q === "object" && !types.isProxy(q), "ORIGINAL_PAIRED_SCHEDULE");
  const descriptor = Object.getOwnPropertyDescriptor(q, "schedule");
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "ORIGINAL_PAIRED_SCHEDULE");
  return requireOriginalSchedule(q.schedule);
}
function qualificationText(q: CurrentFootprintCopyExecutionQualification): string {
  fields(q, ["copyPlan", "witness", "schedule"], 3);
  currentFootprintCopyV2Before(q.copyPlan);
  scheduleMethods.requireExecutionReady.call(requireSchedule(q), q.copyPlan, q.witness.documentClockMinMs, q.witness.documentClockMaxMs);
  return canonicalJson({ copyPlan: q.copyPlan, witness: captureCurrentPcbStringClockReply(q.witness).value });
}
/** Native mounting must construct this class inside its genuine purpose
 * factory. Its typed dependency is internal infrastructure, never an MCP
 * argument, an injectable public verifier or evidence reconstructed from disk. */
export class CurrentFootprintCopyExecutionOwner {
  readonly #native: CurrentFootprintCopyExecutionNative;
  readonly #fields: readonly unknown[];
  readonly #generationText: string;
  public constructor(native: CurrentFootprintCopyExecutionNative) {
    this.#fields = fields(native, nativeFields, 2); this.#native = native;
    this.#generationText = canonicalJson(currentFootprintCopyExecutionGenerationSchema.parse(captureCurrentPcbStringClockReply(native.generation).value));
    native.assertOwned(); owners.add(this);
  }
  public requireOriginal(): CurrentFootprintCopyExecutionNative {
    need(owners.has(this) && fields(this.#native, nativeFields, 2).every((value, index) => value === this.#fields[index]) &&
      canonicalJson(captureCurrentPcbStringClockReply(this.#native.generation).value) === this.#generationText, "ORIGINAL_OWNER");
    this.#native.assertOwned(); return this.#native;
  }
}
// oxlint-disable-next-line typescript/unbound-method -- Invoke only on this original private-field owner, never a caller verifier.
const requireOwner = CurrentFootprintCopyExecutionOwner.prototype.requireOriginal;
export class CurrentFootprintCopyExecutionCoordinator {
  readonly #owner: CurrentFootprintCopyExecutionOwner;
  readonly #native: CurrentFootprintCopyExecutionNative;
  readonly #created = monotonic();
  #phase: CurrentFootprintCopyExecutionPhase = "prepare";
  #busy = false;
  #failed = false;
  readonly #failures: unknown[] = [];
  #records = 0;
  #writerPolls = 0;
  #verificationPolls = 0;
  #qualification: CurrentFootprintCopyExecutionQualification | null = null;
  #qualificationText: string | null = null;
  #schedule: CurrentFootprintCopyPairedScheduler | null = null;
  #sqlPlan: CurrentFootprintCopyV2SqlPlan | null = null;
  #output: CurrentFootprintCopyOutputLedger | null = null;
  #before: Inventory | null = null;
  #rawCreate: string | null = null;
  #createAttempted = false;
  #result: CurrentFootprintCopyV2NativeResult | null = null;
  #paired: CurrentFootprintCopyPairedScheduleObservation | null = null;
  #clocks: CurrentFootprintCopyClockRpcObservation | null = null;
  #writerClosed = false;
  #writerReleased = false;
  #writerTermination: object | null = null;
  #writerReleaseAttempted = false;
  #writerReleasePolls = 0;
  #clockCleanupAttempted = false;
  #clockTerminationReleaseAttempted = false;
  #clockReleased = true;
  #after: Inventory | null = null;
  #projection: CurrentFootprintCopyV2SavedProjection | null = null;
  #verification: CurrentFootprintCopySavedExecutionNative | null = null;
  #verificationFields: readonly unknown[] | null = null;
  #replay: object | null = null;
  #savedReader: CurrentFootprintCopyV2SavedReadRunner | null = null;
  #saved: CurrentFootprintCopyV2SavedReadPacket | null = null;
  #verificationClosed = false;
  #verificationReleased = false;
  #verificationTermination: object | null = null;
  #verificationReleaseAttempted = false;
  #verificationReleasePolls = 0;
  #verificationNoResource = false;
  #finalEquality = false;
  public constructor(owner: CurrentFootprintCopyExecutionOwner) {
    need(owner !== null && typeof owner === "object" && !types.isProxy(owner) && owners.has(owner) &&
      Object.getPrototypeOf(owner) === CurrentFootprintCopyExecutionOwner.prototype && !consumed.has(owner), "ORIGINAL_OWNER");
    this.#owner = owner; this.#native = requireOwner.call(owner); consumed.add(owner);
  }
  #current(): void {
    need(CurrentFootprintCopyExecutionOwner.prototype.requireOriginal === requireOwner && requireOwner.call(this.#owner) === this.#native, "OWNER_CHANGED");
  }
  #workCurrent(): void {
    this.#current(); const age = monotonic() - this.#created;
    need(age >= 0n && age < BigInt(LIMITS.milliseconds) * 1_000_000n, "LIFETIME");
  }
  #verificationCurrent(): CurrentFootprintCopySavedExecutionNative {
    this.#current(); const verification = this.#verification;
    need(verification !== null && this.#verificationFields !== null && fields(verification, verificationFields, 1)
      .every((value, index) => value === this.#verificationFields?.[index]), "ORIGINAL_VERIFICATION");
    verification.assertOwned(); return verification;
  }
  async #record(phase: string, evidence: unknown): Promise<void> {
    this.#current(); need(this.#records < LIMITS.journalRecords, "JOURNAL_BUDGET"); this.#records += 1;
    const text = JSON.stringify({ phase, evidence });
    if (this.#output === null) {
      // Before a complete original SQL/copy plan exists, only bounded cleanup
      // Metadata can be published; no create is reachable in that state.
      need(!this.#createAttempted && Buffer.byteLength(text) <= 65_536, "PREPARATION_JOURNAL_BYTES");
    } else {
      let kind: CurrentFootprintCopyOutputKind = "journal-control";
      if (phase === "create-result") { kind = "journal-create"; }
      else if (phase === "verification-saved-read") { kind = "journal-saved"; }
      else if (phase === "clock-cleanup-failed") { kind = "journal-clock-failure"; }
      const slot = cleanupPhases.has(this.#phase) && (kind === "journal-control" || kind === "journal-clock-failure") ?
        this.#output.beginCleanup(kind) : this.#output.begin(kind);
      this.#output.retain(slot, text);
    }
    await this.#native.publish(phase, evidence); this.#current();
  }
  async #prepared(): Promise<CurrentFootprintCopyExecutionQualification> {
    this.#current(); const qualification = this.#qualification;
    need(qualification !== null && this.#qualificationText === qualificationText(qualification), "ORIGINAL_PREPARATION");
    await this.#native.requireQualification(qualification); this.#current();
    need(this.#qualificationText === qualificationText(qualification), "ORIGINAL_PREPARATION"); return qualification;
  }
  async #prepare(): Promise<void> {
    const q = await this.#native.qualify();
    // The genuine qualifier has already armed resources. Retain their original
    // Cleanup owner before owner/copy/window/witness validation can refuse.
    this.#schedule = requireSchedule(q);
    this.#clockReleased = false;
    this.#qualification = q; this.#current();
    this.#qualificationText = qualificationText(q);
    this.#before = currentFootprintCopyV2Before(q.copyPlan); finished(this.#before);
    await this.#prepared();
    this.#sqlPlan = await prepareCurrentFootprintCopyV2SqlPlan({ before: this.#before, copyPlan: q.copyPlan, witness: q.witness });
    const capacity = reserveCurrentFootprintCopyV2Capacity(q.copyPlan, this.#sqlPlan);
    this.#output = new CurrentFootprintCopyOutputLedger(reserveCurrentFootprintCopyOutput(q.copyPlan, this.#sqlPlan));
    await this.#prepared(); await this.#record("prepared", { generation: this.#native.generation, sqlPlan: this.#sqlPlan, capacity });
    this.#workCurrent(); await this.#prepared(); this.#phase = "create";
  }
  async #create(): Promise<void> {
    const q = await this.#prepared(); const args = currentFootprintCopyV2NativeCreateArguments(q.copyPlan);
    await this.#record("create-intent", { nativeArguments: args, copyPlanSha256: sha256Json(q.copyPlan), witness: q.witness,
      nativeCreateAttempts: 1, explicitSaveAttempts: 0, replayAllowed: false });
    await this.#prepared(); this.#workCurrent(); const schedule = requireSchedule(q); this.#createAttempted = true;
    const same = (): void => { this.#current(); need(requireSchedule(q) === schedule, "ORIGINAL_PAIRED_SCHEDULE"); };
    need(this.#output !== null, "OUTPUT_RESERVATION");
    const rawSlot = this.#output.begin("create-result");
    await scheduleMethods.dispatchCreate.call(schedule); same();
    await scheduleMethods.collectClocks.call(schedule); same();
    await scheduleMethods.collectMain.call(schedule); same();
    const paired = await scheduleMethods.joinCreate.call(schedule);
    const raw = paired.serializedCreateResult;
    need(typeof raw === "string" && raw.length <= 2_097_152, "NATIVE_RESULT_BYTES");
    this.#rawCreate = raw; this.#output.retain(rawSlot, raw); same(); scheduleMethods.requireOriginalResult.call(schedule, paired);
    this.#paired = paired;
    this.#result = decodeCurrentFootprintCopyV2NativeResult(q.copyPlan, raw);
    this.#clocks = paired.clocks;
    const [first, second] = this.#clocks.samples;
    need(this.#clocks.samples.length === 2 && first?.ordinal === 1 && first.producer === "buildString" &&
      second?.ordinal === 2 && second.producer === "canvasString" &&
      first.documentUuid === this.#result.returnedUuid && second.documentUuid === first.documentUuid &&
      first.updateTime <= second.updateTime && first.updateTime >= q.witness.documentClockMinMs && second.updateTime <= q.witness.documentClockMaxMs &&
      this.#result.envelope.result["createTime"] === first.updateTime && this.#result.envelope.result["updateTime"] === second.updateTime &&
      paired.main.value.backendActorUuid === q.witness.backendActorUuid, "NATIVE_CLOCK_RESULT");
    await this.#record("create-result", { serializedEnvelope: raw, result: this.#result, paired });
    this.#phase = "close-writer";
  }
  async #closeWriter(): Promise<void> {
    if (this.#schedule !== null && !this.#clockCleanupAttempted) {
      this.#clockCleanupAttempted = true;
      try { scheduleMethods.requireQuiescentClose.call(requireOriginalSchedule(this.#schedule)); }
      catch (error) { this.#failed = true; this.#failures.push(error);
        await this.#record("clock-cleanup-failed", { retained: scheduleMethods.diagnostics.call(requireOriginalSchedule(this.#schedule)) }); }
    }
    await this.#record("writer-close-intent", { replayAllowed: false, explicitSaveAttempts: 0 });
    // Advance before dispatch. Missing acknowledgment never permits another close.
    this.#phase = "observe-writer-exit";
    const reply = await this.#native.close(); await this.#record("writer-close-result", reply);
  }
  async #writerExit(): Promise<void> {
    need(this.#writerPolls < LIMITS.terminationObservationsPerGeneration, "TERMINATION_BUDGET"); this.#writerPolls += 1;
    const termination = await this.#native.termination(); this.#current();
    if (termination.status === "pending") { return; }
    await this.#native.requireTermination(termination.original); this.#current();
    this.#writerTermination = termination.original; this.#writerClosed = true; this.#phase = "release-writer";
    const slot = this.#output?.beginCleanup("closed-sql") ?? null;
    this.#after = await this.#native.snapshot(termination.original);
    if (slot !== null) { this.#output?.retain(slot, JSON.stringify(this.#after)); }
    this.#current(); finished(this.#after);
    if (!this.#failed && this.#result !== null && this.#qualification !== null && this.#clocks !== null && this.#paired !== null && this.#sqlPlan !== null) {
      scheduleMethods.requireOriginalResult.call(requireSchedule(this.#qualification), this.#paired);
      await this.#native.verifyClockClosure(this.#qualification, this.#paired, termination.original); this.#current();
      const effect = await verifyCurrentFootprintCopyV2SqlEffect(this.#sqlPlan, this.#after, { returnedUuid: this.#result.returnedUuid });
      const closed = completedCurrentFootprintCopyV2SqlSource(this.#sqlPlan, effect, this.#after);
      need(closed.documentClocks.every((value, index) => value === this.#clocks?.samples[index]?.updateTime), "EXACT_CLOSED_TRANSACTION_CLOCKS");
      need(effect["newHistoryUuid"] === this.#paired.main.value.historyUuid, "EXACT_CLOSED_MAIN_HISTORY");
      need(closed.projectUpdatedAtLiteral === this.#paired.main.value.observedProjectUpdatedAt, "EXACT_CLOSED_MAIN_PROJECT_TIME");
      await this.#native.requireTermination(termination.original); this.#current();
      this.#projection = await prepareCurrentFootprintCopyV2SavedProjection(this.#sqlPlan, effect, this.#after);
      await this.#record("writer-closed-effect", { effect, projection: this.#projection, generationClosureVerified: true,
        callbacksCompleted: false, explicitSaveDispatched: false });
    } else {
      await this.#record("writer-closed-without-continuation", { afterSqlSha256: this.#after.logicalSha256,
        mutationMayHaveOccurred: this.#createAttempted, replayAllowed: false });
    }
  }
  async #releaseWriter(): Promise<void> {
    need(this.#writerTermination !== null && this.#writerClosed, "ORIGINAL_WRITER_TERMINATION");
    const failures: unknown[] = [];
    if (this.#schedule !== null) {
      try {
        const schedule = requireOriginalSchedule(this.#schedule);
        if (scheduleMethods.diagnostics.call(schedule)["phase"] !== "ended") {
          need(!this.#clockTerminationReleaseAttempted, "CLOCK_TERMINATION_RELEASE_UNRESOLVED");
          this.#clockTerminationReleaseAttempted = true;
          await scheduleMethods.observeOriginalGenerationEnded.call(schedule); this.#current();
        }
        this.#clockReleased = scheduleMethods.diagnostics.call(schedule)["phase"] === "ended";
        need(this.#clockReleased, "CLOCK_TERMINATION_RELEASE_UNRESOLVED");
      } catch (error) { failures.push(error); }
    }
    // Collector failure does not strand an independently owned native helper.
    // Both original resources must still prove release before terminal status.
    let nativeReleaseFailed = false;
    if (!this.#writerReleaseAttempted) {
      try {
        await this.#native.requireTermination(this.#writerTermination); this.#current();
        this.#writerReleaseAttempted = true; await this.#native.release(this.#writerTermination); this.#current();
      } catch (error) { nativeReleaseFailed = true; failures.push(error); }
    }
    if (!nativeReleaseFailed && !this.#writerReleased) {
      try {
        need(this.#writerReleasePolls < LIMITS.releaseObservationsPerGeneration, "RELEASE_BUDGET"); this.#writerReleasePolls += 1;
        const result = await this.#native.observeRelease(this.#writerTermination); this.#current();
        need(result === "pending" || result === "released", "RELEASE_REPLY"); this.#writerReleased = result === "released";
      } catch (error) { failures.push(error); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, "FOOTPRINT_COPY_EXECUTION_RELEASE_UNRESOLVED"); }
    if (this.#writerReleased && this.#clockReleased) {
      this.#phase = this.#projection === null || this.#failed ? "failed-closed" : "start-verification";
    }
  }
  async #startVerification(): Promise<void> {
    need(this.#projection !== null && this.#after !== null && this.#writerReleased, "ORIGINAL_CLOSED_EFFECT");
    const verification = this.#native.verification();
    this.#verificationFields = fields(verification, verificationFields, 1);
    need(verification.generation !== this.#native.nativeGeneration, "FRESH_GENERATION"); this.#verification = verification;
    try {
      this.#verificationCurrent(); await this.#record("verification-start-intent", { afterSqlSha256: this.#after.logicalSha256 });
      this.#workCurrent(); await verification.start(this.#projection, this.#after);
    }
    catch (error) {
      this.#verificationCurrent();
      const outcome = verification.startOutcome(); this.#verificationCurrent();
      if (outcome === "no-resource" || outcome === "not-started") {
        this.#verificationNoResource = true;
        await this.#record("verification-not-allocated", { startAttemptConsumed: outcome === "no-resource", startOutcome: outcome, retryAllowed: false,
          nativeGenerationAllocated: false, nativeTerminationObserved: false, nativeReleaseObserved: false, savedContentVerified: false });
      }
      throw error;
    }
    this.#verificationCurrent(); need(verification.startOutcome() === "retained", "VERIFICATION_ALLOCATION_REQUIRED");
    this.#phase = "exclude-replay";
  }
  async #excludeReplay(): Promise<void> {
    const verification = this.#verificationCurrent();
    this.#replay = await verification.excludeReplay(); this.#verificationCurrent();
    await verification.requireReplayExclusion(this.#replay); this.#verificationCurrent();
    await this.#record("verification-replay-excluded", { scope: "both-upload-cache-namespaces-before-open", explicitSaveDispatched: false });
    this.#phase = "open-verification";
  }
  async #openVerification(): Promise<void> {
    const verification = this.#verificationCurrent(); need(this.#projection !== null && this.#after !== null && this.#replay !== null, "VERIFICATION_INPUTS");
    await verification.requireReplayExclusion(this.#replay); this.#verificationCurrent();
    await this.#record("verification-open-intent", { projection: this.#projection, afterSqlSha256: this.#after.logicalSha256, replayAllowed: false });
    this.#workCurrent();
    const observed = await verification.open(this.#projection, this.#after, this.#replay); this.#verificationCurrent();
    this.#savedReader = new CurrentFootprintCopyV2SavedReadRunner(observed.transport, observed.state, this.#projection);
    this.#phase = "read-verification";
  }
  async #readVerification(): Promise<void> {
    this.#verificationCurrent(); need(this.#savedReader !== null && this.#output !== null, "SAVED_READER");
    const output = this.#output;
    const frames = [output.begin("saved-frame"), output.begin("saved-frame")];
    const observations = [output.begin("saved-observation"), output.begin("saved-observation")];
    const states = Array.from({ length: 4 }, () => output.begin("saved-state"));
    const packet = output.begin("saved-packet");
    let failed = false, failure: unknown;
    try {
      this.#saved = await this.#savedReader.observe();
      output.retain(packet, JSON.stringify(this.#saved));
    } catch (error) { failed = true; failure = error; }
    try {
      // Retain already captured partial or stale-arrival replies as data even
      // When observe fails. Missing replies leave their consumed slots pending.
      const replies = this.#savedReader.retainedReplies();
      for (const [index, reply] of replies.entries()) {
        if (index === 1 || index === 4) {
          const ordinal = index === 1 ? 0 : 1;
          const frameSlot = frames[ordinal], observationSlot = observations[ordinal];
          need(frameSlot !== undefined && observationSlot !== undefined && reply !== null && typeof reply === "object", "SAVED_OUTPUT_SEQUENCE");
          output.retain(frameSlot, JSON.stringify(reply));
          const result = Object.getOwnPropertyDescriptor(reply, "result")?.value as unknown;
          need(result !== null && typeof result === "object", "SAVED_OUTPUT_SEQUENCE");
          output.retain(observationSlot, Object.getOwnPropertyDescriptor(result, "value")?.value);
        } else {
          const ordinal = [0, 2, 3, 5].indexOf(index);
          const stateSlot = states[ordinal]; need(stateSlot !== undefined, "SAVED_OUTPUT_SEQUENCE");
          output.retain(stateSlot, JSON.stringify(reply));
        }
      }
    } catch (error) {
      if (failed) { throw new AggregateError([failure, error], "FOOTPRINT_COPY_SAVED_OUTPUT_RETENTION", { cause: error }); }
      throw error;
    }
    if (failed) { throw failure; }
    const saved = this.#saved;
    need(saved !== null, "ORIGINAL_SAVED_PACKET"); this.#verificationCurrent();
    await this.#savedReader.requireOriginal(saved); this.#verificationCurrent();
    need(this.#saved === saved, "ORIGINAL_SAVED_PACKET");
    await this.#record("verification-saved-read", saved);
    need(this.#saved === saved, "ORIGINAL_SAVED_PACKET"); this.#phase = "close-verification";
  }
  async #closeVerification(): Promise<void> {
    const verification = this.#verificationCurrent(); await this.#record("verification-close-intent", { replayAllowed: false });
    this.#phase = "observe-verification-exit";
    const reply = await verification.close(); await this.#record("verification-close-result", reply);
  }
  async #verificationExit(): Promise<void> {
    const verification = this.#verificationCurrent();
    need(this.#verificationPolls < LIMITS.terminationObservationsPerGeneration, "TERMINATION_BUDGET"); this.#verificationPolls += 1;
    const termination = await verification.termination(); this.#verificationCurrent();
    if (termination.status === "pending") { return; }
    await verification.requireTermination(termination.original); this.#verificationCurrent();
    this.#verificationTermination = termination.original; this.#verificationClosed = true; this.#phase = "release-verification";
    need(this.#output !== null, "OUTPUT_RESERVATION"); const slot = this.#output.beginCleanup("closed-sql");
    const final = await verification.snapshot(termination.original);
    this.#output.retain(slot, JSON.stringify(final)); this.#verificationCurrent(); finished(final);
    need(this.#after !== null, "ORIGINAL_POST_EDIT_SQL");
    const equality = await compareCompleteClosedSql(this.#after, final);
    await verification.requireTermination(termination.original); this.#verificationCurrent();
    await this.#record("verification-final-sql", equality); this.#finalEquality = true;
  }
  async #releaseVerification(): Promise<void> {
    const verification = this.#verificationCurrent();
    need(this.#verificationTermination !== null && this.#verificationClosed, "ORIGINAL_VERIFICATION_TERMINATION");
    if (!this.#verificationReleaseAttempted) {
      await verification.requireTermination(this.#verificationTermination); this.#verificationCurrent();
      this.#verificationReleaseAttempted = true; await verification.release(this.#verificationTermination); this.#verificationCurrent();
    }
    need(this.#verificationReleasePolls < LIMITS.releaseObservationsPerGeneration, "RELEASE_BUDGET"); this.#verificationReleasePolls += 1;
    const result = await verification.observeRelease(this.#verificationTermination); this.#verificationCurrent();
    need(result === "pending" || result === "released", "RELEASE_REPLY");
    if (result === "released") {
      this.#verificationReleased = true;
      this.#phase = !this.#failed && this.#saved !== null && this.#finalEquality ? "complete" : "failed-closed";
    }
  }
  public async advance(input: unknown): Promise<ReturnType<CurrentFootprintCopyExecutionCoordinator["status"]>> {
    const request = currentFootprintCopyExecutionAdvanceSchema.parse(captureCurrentPcbStringClockReply(input).value);
    need(!this.#busy && request.expectedPhase === this.#phase && !["complete", "failed-closed"].includes(this.#phase), "PHASE_CONSUMED");
    this.#busy = true;
    try {
      this.#current();
      // Stop new work at the deadline. Original close/exit/release remain
      // Available under their separate bounded cleanup reservations.
      if (!cleanupPhases.has(this.#phase)) { this.#workCurrent(); }
      switch (this.#phase) {
        case "prepare": { await this.#prepare(); break; }
        case "create": { await this.#create(); break; }
        case "close-writer": { await this.#closeWriter(); break; }
        case "observe-writer-exit": { await this.#writerExit(); break; }
        case "release-writer": { await this.#releaseWriter(); break; }
        case "start-verification": { await this.#startVerification(); break; }
        case "exclude-replay": { await this.#excludeReplay(); break; }
        case "open-verification": { await this.#openVerification(); break; }
        case "read-verification": { await this.#readVerification(); break; }
        case "close-verification": { await this.#closeVerification(); break; }
        case "observe-verification-exit": { await this.#verificationExit(); break; }
        case "release-verification": { await this.#releaseVerification(); break; }
        case "complete": case "failed-closed": { throw new Error("FOOTPRINT_COPY_EXECUTION_PHASE_CONSUMED"); }
        default: { throw new Error("FOOTPRINT_COPY_EXECUTION_PHASE_INVALID"); }
      }
      return this.status();
    } catch (error) {
      this.#failed = true; this.#failures.push(error);
      if (this.#writerReleased && this.#clockReleased && (this.#verification === null || this.#verificationNoResource) || this.#verificationReleased) { this.#phase = "failed-closed"; }
      else if (!cleanupPhases.has(this.#phase)) {
        this.#phase = this.#verification === null ? "close-writer" : "close-verification";
      }
      throw error;
    } finally { this.#busy = false; }
  }
  public status(): Readonly<{ phase: CurrentFootprintCopyExecutionPhase; busy: boolean; failed: boolean;
    createAttempted: boolean; nativeReplyRetained: boolean; nativeReplySha256: string | null;
    writerGenerationClosed: boolean; writerReleased: boolean; verificationGenerationClosed: boolean; verificationReleased: boolean; verificationNoResource: boolean;
    completeClosedSqlEffectVerified: boolean; savedContentVerified: boolean; finalClosedSqlEqual: boolean;
    persistentUploadReplayExcluded: boolean; explicitSaveDispatched: false; callbacksCompleted: false; executionAuthorized: false;
    nativeExecutionMounted: false; journalRecords: number; failureCount: number; cleanupPending: boolean; clockReleased: boolean;
    output: ReturnType<CurrentFootprintCopyOutputLedger["status"]> | null }> {
    return Object.freeze({ phase: this.#phase, busy: this.#busy, failed: this.#failed, createAttempted: this.#createAttempted,
      nativeReplyRetained: this.#rawCreate !== null, nativeReplySha256: this.#rawCreate === null ? null : sha256Text(this.#rawCreate),
      writerGenerationClosed: this.#writerClosed, writerReleased: this.#writerReleased,
      verificationGenerationClosed: this.#verificationClosed, verificationReleased: this.#verificationReleased,
      verificationNoResource: this.#verificationNoResource,
      completeClosedSqlEffectVerified: this.#projection !== null, savedContentVerified: this.#saved !== null, finalClosedSqlEqual: this.#finalEquality,
      persistentUploadReplayExcluded: this.#replay !== null && this.#savedReader !== null, explicitSaveDispatched: false,
      callbacksCompleted: false, executionAuthorized: false, nativeExecutionMounted: false, journalRecords: this.#records,
      failureCount: this.#failures.length, cleanupPending: cleanupPhases.has(this.#phase), clockReleased: this.#clockReleased,
      output: this.#output?.status() ?? null });
  }
}

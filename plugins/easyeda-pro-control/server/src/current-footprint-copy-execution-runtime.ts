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
import type { CurrentFootprintCopyV2NativeArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import { decodeCurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import type { CurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import { reserveCurrentFootprintCopyV2Capacity } from "./current-footprint-copy-v2-capacity.ts";
import { completedCurrentFootprintCopyV2SqlSource, prepareCurrentFootprintCopyV2SqlPlan,
  verifyCurrentFootprintCopyV2SqlEffect } from "./current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlPlan, CurrentFootprintCopyV2SqlWitness } from "./current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { CurrentFootprintCopyTransactionClockEvents } from "./current-footprint-copy-transaction-clock-events.ts";
import type { CurrentFootprintCopyTransactionClocks } from "./current-footprint-copy-transaction-clock-runner.ts";
import { CurrentFootprintCopyV2SavedReadRunner } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopyV2SavedReadPacket } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { readerCompletion } from "./sqlite-inventory.ts";

export interface CurrentFootprintCopyExecutionQualification {
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly witness: CurrentFootprintCopyV2SqlWitness;
  readonly clocks: CurrentFootprintCopyTransactionClockEvents;
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
  readonly create: (argument: CurrentFootprintCopyV2NativeArguments["createArgument"]) => Promise<string>;
  readonly close: () => Promise<unknown>;
  readonly termination: () => Promise<Termination>;
  readonly requireTermination: (original: object) => Promise<void>;
  readonly snapshot: (original: object) => Promise<Inventory>;
  readonly verifyClockClosure: (qualification: CurrentFootprintCopyExecutionQualification,
    clocks: CurrentFootprintCopyTransactionClocks, termination: object) => Promise<void>;
  readonly release: (original: object) => Promise<void>;
  readonly observeRelease: (original: object) => Promise<"pending" | "released">;
  /** Pure owner allocation, no process launch. The coordinator retains the
   * returned owner before calling start, including when start later fails. */
  readonly verification: () => CurrentFootprintCopySavedExecutionNative;
}
const nativeFields = ["generation", "nativeGeneration", "assertOwned", "qualify", "requireQualification", "publish", "create", "close",
  "termination", "requireTermination", "snapshot", "verifyClockClosure", "release", "observeRelease", "verification"] as const;
const verificationFields = ["generation", "assertOwned", "start", "startOutcome", "excludeReplay", "requireReplayExclusion", "open", "close",
  "termination", "requireTermination", "snapshot", "release", "observeRelease"] as const;
const cleanupPhases = new Set<CurrentFootprintCopyExecutionPhase>(["close-writer", "observe-writer-exit", "release-writer",
  "close-verification", "observe-verification-exit", "release-verification"]);
/* oxlint-disable typescript/unbound-method -- Methods are captured from the original class and called only on its private-field receiver. */
const clockMethods = Object.freeze({ arm: CurrentFootprintCopyTransactionClockEvents.prototype.arm,
  consumeBeforeCreate: CurrentFootprintCopyTransactionClockEvents.prototype.consumeBeforeCreate,
  result: CurrentFootprintCopyTransactionClockEvents.prototype.result,
  requireOriginal: CurrentFootprintCopyTransactionClockEvents.prototype.requireOriginal,
  cleanup: CurrentFootprintCopyTransactionClockEvents.prototype.cleanup,
  releaseAfterTermination: CurrentFootprintCopyTransactionClockEvents.prototype.releaseAfterTermination,
  retained: CurrentFootprintCopyTransactionClockEvents.prototype.retained });
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
function qualificationText(q: CurrentFootprintCopyExecutionQualification): string {
  fields(q, ["copyPlan", "witness", "clocks"], 3);
  currentFootprintCopyV2Before(q.copyPlan);
  need(Object.getPrototypeOf(q.clocks) === CurrentFootprintCopyTransactionClockEvents.prototype && Reflect.ownKeys(q.clocks).length === 0 &&
    Object.entries(clockMethods).every(([key, method]) => Object.getOwnPropertyDescriptor(CurrentFootprintCopyTransactionClockEvents.prototype, key)?.value === method), "ORIGINAL_CLOCK_COLLECTOR");
  clockMethods.retained.call(q.clocks);
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
  #sqlPlan: CurrentFootprintCopyV2SqlPlan | null = null;
  #before: Inventory | null = null;
  #rawCreate: string | null = null;
  #createAttempted = false;
  #result: CurrentFootprintCopyV2NativeResult | null = null;
  #clocks: CurrentFootprintCopyTransactionClocks | null = null;
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
    await this.#native.publish(phase, evidence); this.#current();
  }
  async #prepared(): Promise<CurrentFootprintCopyExecutionQualification> {
    this.#current(); const qualification = this.#qualification;
    need(qualification !== null && this.#qualificationText === qualificationText(qualification), "ORIGINAL_PREPARATION");
    await this.#native.requireQualification(qualification); this.#current();
    need(this.#qualificationText === qualificationText(qualification), "ORIGINAL_PREPARATION"); return qualification;
  }
  async #prepare(): Promise<void> {
    this.#qualification = await this.#native.qualify(); this.#current();
    const q = this.#qualification;
    this.#qualificationText = qualificationText(q);
    this.#clockReleased = false;
    this.#before = currentFootprintCopyV2Before(q.copyPlan); finished(this.#before);
    await this.#prepared();
    this.#sqlPlan = await prepareCurrentFootprintCopyV2SqlPlan({ before: this.#before, copyPlan: q.copyPlan, witness: q.witness });
    const capacity = reserveCurrentFootprintCopyV2Capacity(q.copyPlan, this.#sqlPlan);
    await this.#prepared(); await this.#record("prepared", { generation: this.#native.generation, sqlPlan: this.#sqlPlan, capacity });
    this.#workCurrent(); await clockMethods.arm.call(q.clocks); await this.#prepared(); this.#phase = "create";
  }
  async #create(): Promise<void> {
    const q = await this.#prepared(); const args = currentFootprintCopyV2NativeCreateArguments(q.copyPlan);
    await this.#record("create-intent", { nativeArguments: args, copyPlanSha256: sha256Json(q.copyPlan), witness: q.witness,
      nativeCreateAttempts: 1, explicitSaveAttempts: 0, replayAllowed: false });
    await this.#prepared(); this.#workCurrent(); clockMethods.consumeBeforeCreate.call(q.clocks); this.#createAttempted = true;
    const raw = await this.#native.create(args.createArgument);
    need(typeof raw === "string" && raw.length <= 2_097_152, "NATIVE_RESULT_BYTES");
    this.#rawCreate = raw; this.#current();
    this.#result = decodeCurrentFootprintCopyV2NativeResult(q.copyPlan, raw);
    this.#clocks = await clockMethods.result.call(q.clocks); this.#current(); await clockMethods.requireOriginal.call(q.clocks, this.#clocks); this.#current();
    const [first, second] = this.#clocks.samples;
    need(first.documentUuid === this.#result.returnedUuid && second.documentUuid === first.documentUuid &&
      first.updateTime <= second.updateTime && first.updateTime >= q.witness.documentClockMinMs && second.updateTime <= q.witness.documentClockMaxMs &&
      this.#result.envelope.result["createTime"] === first.updateTime && this.#result.envelope.result["updateTime"] === second.updateTime, "NATIVE_CLOCK_RESULT");
    await this.#record("create-result", { serializedEnvelope: raw, result: this.#result, clocks: this.#clocks });
    this.#phase = "close-writer";
  }
  async #closeWriter(): Promise<void> {
    if (this.#qualification !== null && this.#qualificationText !== null && !this.#clockCleanupAttempted) {
      this.#clockCleanupAttempted = true;
      try { await clockMethods.cleanup.call(this.#qualification.clocks); }
      catch (error) { this.#failed = true; this.#failures.push(error);
        await this.#record("clock-cleanup-failed", { retained: clockMethods.retained.call(this.#qualification.clocks) }); }
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
    this.#after = await this.#native.snapshot(termination.original); this.#current(); finished(this.#after);
    if (!this.#failed && this.#result !== null && this.#qualification !== null && this.#clocks !== null && this.#sqlPlan !== null) {
      await this.#native.verifyClockClosure(this.#qualification, this.#clocks, termination.original); this.#current();
      const effect = await verifyCurrentFootprintCopyV2SqlEffect(this.#sqlPlan, this.#after, { returnedUuid: this.#result.returnedUuid });
      const closed = completedCurrentFootprintCopyV2SqlSource(this.#sqlPlan, effect, this.#after);
      need(closed.documentClocks.every((value, index) => value === this.#clocks?.samples[index]?.updateTime), "EXACT_CLOSED_TRANSACTION_CLOCKS");
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
    if (this.#qualification !== null && this.#qualificationText !== null) {
      try {
        const clocks = this.#qualification.clocks;
        if (!clockMethods.retained.call(clocks).released) {
          need(!this.#clockTerminationReleaseAttempted, "CLOCK_TERMINATION_RELEASE_UNRESOLVED");
          this.#clockTerminationReleaseAttempted = true;
          await clockMethods.releaseAfterTermination.call(clocks); this.#current();
        }
        this.#clockReleased = clockMethods.retained.call(clocks).released;
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
    this.#verificationCurrent(); need(this.#savedReader !== null, "SAVED_READER");
    this.#saved = await this.#savedReader.observe(); this.#verificationCurrent();
    await this.#savedReader.requireOriginal(this.#saved); this.#verificationCurrent();
    await this.#record("verification-saved-read", this.#saved); this.#phase = "close-verification";
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
    const final = await verification.snapshot(termination.original); this.#verificationCurrent(); finished(final);
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
    nativeExecutionMounted: false; journalRecords: number; failureCount: number; cleanupPending: boolean; clockReleased: boolean }> {
    return Object.freeze({ phase: this.#phase, busy: this.#busy, failed: this.#failed, createAttempted: this.#createAttempted,
      nativeReplyRetained: this.#rawCreate !== null, nativeReplySha256: this.#rawCreate === null ? null : sha256Text(this.#rawCreate),
      writerGenerationClosed: this.#writerClosed, writerReleased: this.#writerReleased,
      verificationGenerationClosed: this.#verificationClosed, verificationReleased: this.#verificationReleased,
      verificationNoResource: this.#verificationNoResource,
      completeClosedSqlEffectVerified: this.#projection !== null, savedContentVerified: this.#saved !== null, finalClosedSqlEqual: this.#finalEquality,
      persistentUploadReplayExcluded: this.#replay !== null && this.#savedReader !== null, explicitSaveDispatched: false,
      callbacksCompleted: false, executionAuthorized: false, nativeExecutionMounted: false, journalRecords: this.#records,
      failureCount: this.#failures.length, cleanupPending: cleanupPhases.has(this.#phase), clockReleased: this.#clockReleased });
  }
}

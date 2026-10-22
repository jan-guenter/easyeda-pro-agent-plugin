/* oxlint-disable import/max-dependencies -- This dormant ledger composes the fixed create, publication, Save and complete-SQL comparators; it supplies no transport or execution verifier. */
/** Unregistered String transcript sequencing and durable attempt accounting.
 * This module cannot dispatch CAD work, issue an eligibility permit, adopt a
 * native owner or reconstruct one from JSON. Its intent tokens prove ONLY that
 * this original ledger durably consumed an attempt. Supplied replies remain
 * supplied replies even when every comparison succeeds. */
import { mkdir, opendir } from "node:fs/promises";
import { join } from "node:path";
import { types } from "node:util";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive,
  verifyExactManagedArtifact } from "./artifacts.ts";
import type { PublishedManagedAttachment } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringActorClockPacket, CurrentPcbStringActorClockRunner } from "./current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { compareCurrentPcbStringCreateObservation, requireOriginalCurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringPostCreate } from "./current-pcb-string-postcreate.ts";
import { compareCapturedCurrentPcbStringPublication } from "./current-pcb-string-publication-capture.ts";
import type { CurrentPcbStringPublicationPlan } from "./current-pcb-string-publication.ts";
import { compareCurrentPcbStringSaveObservation, planCurrentPcbStringSaveObservation } from "./current-pcb-string-save-observation.ts";
import type { CurrentPcbStringSaveObservationPlan } from "./current-pcb-string-save-observation.ts";
import { compareCurrentPcbStringSaveHistoryProvenance, currentPcbStringSaveProvenanceSource,
  prepareCurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { compareCurrentPcbStringSaveClockHistory, prepareCurrentPcbStringSaveClock,
  recordCurrentPcbStringSaveClockPost, requireOriginalCurrentPcbStringSaveClock } from "./current-pcb-string-save-clock.ts";
import type { CurrentPcbStringSaveClockPlan } from "./current-pcb-string-save-clock.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import type { CurrentPcbStringNativeClockObservation } from "./current-pcb-string-native-clock.ts";
import { CurrentPcbStringServerClockRunner } from "./current-pcb-string-server-clock-runner.ts";
import type { CurrentPcbStringServerClockPacket } from "./current-pcb-string-server-clock-runner.ts";
import { currentPcbStringServerClockCommand } from "./current-pcb-string-server-clock.ts";
import { CURRENT_PCB_STRING_LEDGER_DIRECTORY, assertNoUnresolvedCurrentPcbStringLedgers,
  readCurrentPcbStringLedgerReservations } from "./current-pcb-string-ledger-exclusion.ts";
import type { CurrentPcbStringHistoryProjection } from "./current-pcb-string-history.ts";
import { prepareCurrentPcbStringSql, verifyCurrentPcbStringSql } from "./current-pcb-string-sql.ts";
import type { CurrentPcbStringSqlPlan, CurrentPcbStringSqlWitness } from "./current-pcb-string-sql.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Phase = "prepared" | "create-intent" | "create-acknowledged" | "postcreate-compared" | "publication-compared" |
  "save-intent" | "save-acknowledged" | "closed-sql-compared" | "reopened-string-compared" |
  "comparisons-complete-awaiting-native-lifecycle-proof" | "failed";
type AttemptKind = "create" | "save" | "server-clock";
const DIRECTORY = CURRENT_PCB_STRING_LEDGER_DIRECTORY;
let originalPreparationBusy = false;
const MAX_RECORD_BYTES = 256 * 1024;
const LIMITS = Object.freeze({ nativeDispatchPerformed: false, nativeOwnerVerified: false, createEligibilityVerified: false,
  saveEligibilityVerified: false, originalPublicationVerified: false, originalSaveVerified: false,
  generationClosureVerified: false, persistentUploadReplayExcluded: false, freshReopenOwnerVerified: false,
  visualAcceptanceVerified: false, completeLifecycleVerified: false, connectedValidation: false,
  writerSupported: false, executionAuthorized: false } as const);
export interface CurrentPcbStringLedgerAttempt {
  readonly profile: "private.current-pcb-string-ledger-attempt.v1";
  readonly operationId: string;
  readonly kind: AttemptKind;
  readonly intentSha256: string;
  readonly durableIntentPublished: true;
  readonly dispatchAuthorized: false;
}
export interface CurrentPcbStringLedgerStatus extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-lifecycle-ledger.v1";
  readonly operationId: string;
  readonly phase: Phase;
  readonly busy: boolean;
  readonly createAttemptConsumed: boolean;
  readonly saveAttemptConsumed: boolean;
  readonly serverClockAttemptConsumed: boolean;
  readonly serverClockResultRecorded: boolean;
  readonly recordCount: number;
  readonly acknowledgedPrimitiveId: string | null;
  readonly originalSourcesRetained: boolean;
  readonly saveClockPlanRecorded: boolean;
  readonly saveClockPostRecorded: boolean;
}
const originalAttempts = new WeakMap<CurrentPcbStringLedgerAttempt, CurrentPcbStringLifecycleLedger>();
const consumedPlans = new WeakSet<CurrentPcbStringCreateObservationPlan>();
const consumedProvenances = new WeakSet<CurrentPcbStringSaveProvenance>();
// oxlint-disable typescript/unbound-method -- Captured private-field methods are called with their original class receivers only.
const originalNativeClock = CurrentPcbStringNativeClockIssuer.prototype.requireOriginal;
const originalServerProvenance = CurrentPcbStringServerClockRunner.prototype.requireOriginalProvenance;
const originalServerPacket = CurrentPcbStringServerClockRunner.prototype.requireOriginal;
const originalServerReply = CurrentPcbStringServerClockRunner.prototype.retainedReply;
const originalServerFailure = CurrentPcbStringServerClockRunner.prototype.retainedFailureState;
// oxlint-enable typescript/unbound-method
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`PCB_STRING_LIFECYCLE_LEDGER: ${detail}`); }
}
function finished(inventory: Inventory): void {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "original completed SQL reader required");
  need(inventory.logicalSha256 === sha256Json({ schema: inventory.schema, properties: inventory.properties, tables: inventory.tables }),
    "original SQL inventory changed");
}
function rawJson(value: unknown): string | null {
  return typeof value === "string" && value.isWellFormed() && Buffer.byteLength(value) <= 8192 ? value : null;
}
function originalCandidate(candidate: CurrentPcbStringCreateCandidate): void {
  need(candidate !== null && typeof candidate === "object" && !types.isProxy(candidate), "original candidate required");
  const body = Object.getOwnPropertyDescriptor(candidate, "expectedBodyText");
  need(body !== undefined && Object.hasOwn(body, "value"), "original candidate required");
  compareCurrentPcbStringCreateBody(candidate, body.value as unknown);
}

/** The constructor is private. There is no resume/adoption endpoint. An
 * operation directory, including a partial one, permanently reserves its ID.
 * A future live coordinator must separately own eligibility, transport,
 * closure, reopen and visual proof; these ledger tokens grant none of them. */
export class CurrentPcbStringLifecycleLedger {
  readonly #operationId: string;
  readonly #path: string;
  readonly #directoryIdentity: string;
  readonly #candidate: CurrentPcbStringCreateCandidate;
  readonly #createPlan: CurrentPcbStringCreateObservationPlan;
  readonly #before: Inventory;
  readonly #records: PublishedManagedAttachment[] = [];
  #phase: Phase = "prepared";
  #busy = false;
  #createConsumed = false;
  #saveConsumed = false;
  #createAttempt: CurrentPcbStringLedgerAttempt | null = null;
  #saveAttempt: CurrentPcbStringLedgerAttempt | null = null;
  #serverClockAttempt: CurrentPcbStringLedgerAttempt | null = null;
  #serverClockConsumed = false;
  #serverClockResultRecorded = false;
  #serverClockOwner: Readonly<{ issuer: CurrentPcbStringNativeClockIssuer; before: CurrentPcbStringNativeClockObservation;
    runner: CurrentPcbStringServerClockRunner }> | null = null;
  #serverClockPacket: CurrentPcbStringServerClockPacket | null = null;
  #createResult: string | null = null;
  #primitiveId: string | null = null;
  #publication: CurrentPcbStringPublicationPlan | null = null;
  #afterRawProjection: string | null = null;
  #savePlan: CurrentPcbStringSaveObservationPlan | null = null;
  #sqlPlan: CurrentPcbStringSqlPlan | null = null;
  #afterSql: Inventory | null = null;
  #originalProvenance: CurrentPcbStringSaveProvenance | null = null;
  #clockPlan: CurrentPcbStringSaveClockPlan | null = null;
  #clockAttempted = false;
  #clockPostRecorded = false;
  #history: CurrentPcbStringHistoryProjection | null = null;

  private constructor(operationId: string, directoryIdentity: string, candidate: CurrentPcbStringCreateCandidate,
    createPlan: CurrentPcbStringCreateObservationPlan, before: Inventory) {
    this.#operationId = operationId; this.#path = join(controlDataDirectory(), DIRECTORY, operationId);
    this.#directoryIdentity = directoryIdentity; this.#candidate = candidate; this.#createPlan = createPlan; this.#before = before;
  }
  public static async prepare(operationId: string, candidate: CurrentPcbStringCreateCandidate,
    createPlan: CurrentPcbStringCreateObservationPlan, before: Inventory): Promise<CurrentPcbStringLifecycleLedger> {
    need(typeof operationId === "string" && /^string-ledger-[a-z0-9][a-z0-9_-]{0,63}$/u.test(operationId), "operation ID differs");
    originalCandidate(candidate); requireOriginalCurrentPcbStringCreateObservationPlan(createPlan); finished(before);
    need(candidate.requestSha256 === createPlan.requestSha256 && candidate.expectedBodySha256 === createPlan.expectedBodySha256,
      "original plans differ");
    need(!consumedPlans.has(createPlan), "original create plan already reserved"); consumedPlans.add(createPlan);
    const root = await controlRootCapability();
    const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY));
    try {
      await mkdir(`/proc/self/fd/${String(parent.handle.fd)}/${operationId}`, { mode: 0o700 });
      await parent.handle.sync(); await root.assertCurrent();
    } finally { await parent.handle.close(); }
    const directory = await root.openDirectory(join(controlDataDirectory(), DIRECTORY, operationId), false);
    const identity = `${String(directory.info.dev)}:${String(directory.info.ino)}`;
    await directory.handle.close();
    const ledger = new CurrentPcbStringLifecycleLedger(operationId, identity, candidate, createPlan, before);
    try {
      await ledger.#append("prepared", { createPlanSha256: createPlan.planSha256, requestSha256: candidate.requestSha256,
        target: createPlan.target, beforeSqlSha256: before.logicalSha256, ...LIMITS });
      return ledger;
    } catch (error) { ledger.#phase = "failed"; throw error; }
  }
  /** Original-source composition for the future retained native owner. No
   * injected dispatch callback is accepted. The existing comparison-only
   * factory cannot create this mode or clear its durable global blocker. */
  public static async prepareOriginalSources(operationId: string, candidate: CurrentPcbStringCreateCandidate,
    createPlan: CurrentPcbStringCreateObservationPlan, runner: CurrentPcbStringActorClockRunner,
    packet: CurrentPcbStringActorClockPacket, before: Inventory): Promise<CurrentPcbStringLifecycleLedger> {
    originalCandidate(candidate); requireOriginalCurrentPcbStringCreateObservationPlan(createPlan);
    need(typeof operationId === "string" && /^string-ledger-[a-z0-9][a-z0-9_-]{0,63}$/u.test(operationId), "operation ID differs");
    need(!originalPreparationBusy, "original preparation busy"); originalPreparationBusy = true;
    try {
      await assertNoUnresolvedCurrentPcbStringLedgers();
      const provenance = prepareCurrentPcbStringSaveProvenance(runner, packet, before);
      return await CurrentPcbStringLifecycleLedger.#prepareOriginalLedger(operationId, candidate, createPlan, provenance);
    } finally { originalPreparationBusy = false; }
  }
  /** The actual retained owner already issued its actor/SQL provenance. Join
   * that exact original token instead of consuming its actor packet twice.
   * This private module API still cannot dispatch or admit a native owner. */
  public static async prepareOriginalProvenance(operationId: string, candidate: CurrentPcbStringCreateCandidate,
    createPlan: CurrentPcbStringCreateObservationPlan, provenance: CurrentPcbStringSaveProvenance): Promise<CurrentPcbStringLifecycleLedger> {
    originalCandidate(candidate); requireOriginalCurrentPcbStringCreateObservationPlan(createPlan);
    currentPcbStringSaveProvenanceSource(provenance);
    need(typeof operationId === "string" && /^string-ledger-[a-z0-9][a-z0-9_-]{0,63}$/u.test(operationId), "operation ID differs");
    need(!originalPreparationBusy, "original preparation busy"); originalPreparationBusy = true;
    try {
      await assertNoUnresolvedCurrentPcbStringLedgers();
      return await CurrentPcbStringLifecycleLedger.#prepareOriginalLedger(operationId, candidate, createPlan, provenance);
    } finally { originalPreparationBusy = false; }
  }
  static async #prepareOriginalLedger(operationId: string, candidate: CurrentPcbStringCreateCandidate,
    createPlan: CurrentPcbStringCreateObservationPlan, provenance: CurrentPcbStringSaveProvenance): Promise<CurrentPcbStringLifecycleLedger> {
    const { before } = currentPcbStringSaveProvenanceSource(provenance);
    need(!consumedProvenances.has(provenance), "original provenance already reserved"); consumedProvenances.add(provenance);
    need(createPlan.target.projectUuid === provenance.identity.projectUuid && createPlan.target.branchUuid === provenance.identity.branchUuid &&
      createPlan.target.documentUuid === provenance.identity.documentUuid, "original source target differs");
    const ledger = await CurrentPcbStringLifecycleLedger.prepare(operationId, candidate, createPlan, before);
    ledger.#originalProvenance = provenance;
    try {
      currentPcbStringSaveProvenanceSource(provenance);
      await ledger.#current(); await ledger.#append("original-sources", { provenance, nativeOwnerVerified: false });
      currentPcbStringSaveProvenanceSource(provenance); return ledger;
    } catch (error) { ledger.#phase = "failed"; throw error; }
  }
  public status(): CurrentPcbStringLedgerStatus {
    return Object.freeze({ profile: "private.current-pcb-string-lifecycle-ledger.v1", operationId: this.#operationId,
      phase: this.#phase, busy: this.#busy, createAttemptConsumed: this.#createConsumed, saveAttemptConsumed: this.#saveConsumed,
      serverClockAttemptConsumed: this.#serverClockConsumed, serverClockResultRecorded: this.#serverClockResultRecorded,
      recordCount: this.#records.length, acknowledgedPrimitiveId: this.#primitiveId,
      originalSourcesRetained: this.#originalProvenance !== null, saveClockPlanRecorded: this.#clockPlan !== null,
      saveClockPostRecorded: this.#clockPostRecorded, ...LIMITS });
  }
  public records(): readonly PublishedManagedAttachment[] { return Object.freeze([...this.#records]); }
  async #current(): Promise<void> {
    if (this.#originalProvenance !== null) {
      const operations = await readCurrentPcbStringLedgerReservations();
      need(operations.length === 1 && operations[0] === this.#operationId, "other unresolved String lifecycle");
    }
    originalCandidate(this.#candidate); requireOriginalCurrentPcbStringCreateObservationPlan(this.#createPlan); finished(this.#before);
    const root = await controlRootCapability(false);
    const directory = await root.openDirectory(this.#path, false);
    try {
      need(`${String(directory.info.dev)}:${String(directory.info.ino)}` === this.#directoryIdentity, "original journal directory changed");
      const names = new Set(this.#records.map(record => record.path.slice(record.path.lastIndexOf("/") + 1)));
      const handle = await opendir(`/proc/self/fd/${String(directory.handle.fd)}`);
      for await (const entry of handle) { need(entry.isFile() && names.delete(entry.name), "journal roster changed"); }
      need(names.size === 0, "journal record missing");
      for (const record of this.#records) { await verifyExactManagedArtifact(record); }
      await root.assertCurrent();
    } finally { await directory.handle.close(); }
  }
  async #append(kind: string, data: Readonly<Record<string, unknown>>): Promise<PublishedManagedAttachment> {
    await this.#current();
    const previous = this.#records.at(-1);
    const sequence = this.#records.length;
    need(sequence < 16, "journal record bound exceeded");
    const record = { schema: "easyeda-pro-control.pcb-string-dormant-ledger-record.v1", operationId: this.#operationId,
      sequence, kind, previousSha256: previous?.sha256 ?? null, data, executionAuthorized: false };
    const bytes = Buffer.from(`${JSON.stringify(record)}\n`);
    need(bytes.length <= MAX_RECORD_BYTES, "journal record byte bound exceeded");
    const result = await publishManagedAttachmentExclusive(join(this.#path, `${String(sequence).padStart(2, "0")}-${kind}.json`),
      "Dormant String lifecycle record", bytes, "easyeda-pro-control.pcb-string-dormant-ledger.v1");
    const retained = Object.freeze(result); this.#records.push(retained); await this.#current(); return retained;
  }
  async #step<T>(expected: Phase, action: () => Promise<T>): Promise<T> {
    need(!this.#busy && this.#phase === expected, "phase changed or attempt consumed"); this.#busy = true;
    try { await this.#current(); return await action(); }
    catch (error) { this.#phase = "failed"; throw error; }
    finally { this.#busy = false; }
  }
  #attempt(kind: AttemptKind, record: PublishedManagedAttachment): CurrentPcbStringLedgerAttempt {
    const token = Object.freeze({ profile: "private.current-pcb-string-ledger-attempt.v1", operationId: this.#operationId,
      kind, intentSha256: record.sha256, durableIntentPublished: true, dispatchAuthorized: false } as const);
    originalAttempts.set(token, this); return token;
  }
  #requireAttempt(token: CurrentPcbStringLedgerAttempt, kind: AttemptKind): void {
    const expected = { create: this.#createAttempt, save: this.#saveAttempt, "server-clock": this.#serverClockAttempt }[kind];
    need(originalAttempts.get(token) === this && token === expected,
      "original ledger attempt required");
  }
  /** Publishes a durable reservation only. A live caller still needs an
   * independently issued original eligibility capability before any dispatch. */
  public reserveCreate(): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("prepared", async () => {
      if (this.#originalProvenance !== null) { currentPcbStringSaveProvenanceSource(this.#originalProvenance); }
      this.#createConsumed = true; this.#phase = "create-intent";
      const record = await this.#append("create-intent", { createPlanSha256: this.#createPlan.planSha256,
        candidateBodySha256: this.#candidate.expectedBodySha256, dispatchAuthorized: false });
      if (this.#originalProvenance !== null) { currentPcbStringSaveProvenanceSource(this.#originalProvenance); }
      this.#createAttempt = this.#attempt("create", record); return this.#createAttempt;
    });
  }
  /** Malformed, failed or missing acknowledgment leaves this attempt consumed.
   * No returned field is promoted to original native execution evidence. */
  public recordCreateOutcome(token: CurrentPcbStringLedgerAttempt, supplied: unknown): Promise<CurrentPcbStringLedgerStatus> {
    this.#requireAttempt(token, "create");
    return this.#step("create-intent", async () => {
      const raw = rawJson(supplied); let accepted = false, completed = false, primitiveId: string | null = null;
      try {
        const result = compareCurrentPcbStringCreateObservation(this.#createPlan, raw);
        accepted = true; completed = result.completed; primitiveId = result.acknowledgedPrimitiveId;
      } catch {
        // Invalid raw acknowledgment is retained, never retried or repaired.
      }
      await this.#append("create-result", { intentSha256: token.intentSha256, rawJson: raw,
        resultContractAccepted: accepted, suppliedCompleted: completed, acknowledgedPrimitiveId: primitiveId });
      this.#primitiveId = primitiveId;
      if (!completed || raw === null) { this.#phase = "failed"; return this.status(); }
      this.#createResult = raw; this.#savePlan = planCurrentPcbStringSaveObservation(this.#createPlan, raw);
      this.#phase = "create-acknowledged"; return this.status();
    });
  }
  public comparePostCreate(publication: CurrentPcbStringPublicationPlan, beforeFirst: unknown, beforeSecond: unknown,
    afterFirst: unknown, afterSecond: unknown, suppliedPublication: unknown): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("create-acknowledged", async () => {
      const relation = compareCurrentPcbStringPostCreate(this.#candidate, this.#createPlan, publication,
        { createResultJson: this.#createResult, beforeFirst, beforeSecond, afterFirst, afterSecond, publication: suppliedPublication });
      const after = decodeCurrentPcbDiagnosticRawStringsReply(afterFirst);
      await this.#append("postcreate-comparison", { relation });
      this.#publication = publication; this.#afterRawProjection = canonicalJson(after);
      this.#phase = "postcreate-compared"; return this.status();
    });
  }
  public compareDeliveredPublication(suppliedCapture: unknown): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("postcreate-compared", async () => {
      need(this.#publication !== null, "original publication plan missing");
      const relation = compareCapturedCurrentPcbStringPublication(this.#publication, suppliedCapture);
      await this.#append("publication-comparison", { relation });
      this.#phase = "publication-compared"; return this.status();
    });
  }
  /** Reserve the fixed effectful RPC before its original runner is used. This
   * ledger supplies no sender, route containment or execution authority. */
  public reserveServerClock(issuer: CurrentPcbStringNativeClockIssuer, before: CurrentPcbStringNativeClockObservation,
    runner: CurrentPcbStringServerClockRunner): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("publication-compared", async () => {
      need(this.#originalProvenance !== null && !this.#serverClockConsumed, "original server clock missing or consumed");
      const provenance = this.#originalProvenance;
      const check = (): void => {
        currentPcbStringSaveProvenanceSource(provenance); originalNativeClock.call(issuer, before);
        need(before.phase === "before" && originalServerProvenance.call(runner, provenance).phase === "ready",
          "unstarted original server runner and native before required");
      };
      check(); this.#serverClockConsumed = true;
      this.#serverClockOwner = Object.freeze({ issuer, before, runner });
      const source = currentPcbStringSaveProvenanceSource(provenance);
      const command = currentPcbStringServerClockCommand(source.packet.contexts.worker, provenance.identity, provenance.workerUserText);
      const record = await this.#append("server-clock-intent", { before, commandSha256: sha256Json(command),
        actorPacketSha256: provenance.actorPacketSha256, beforeSqlSha256: provenance.beforeSqlSha256,
        dispatchAuthorized: false, rpcCancellationProved: false });
      check(); this.#serverClockAttempt = this.#attempt("server-clock", record); return this.#serverClockAttempt;
    });
  }
  /** Retain the original raw runner reply before sealing a Save clock plan.
   * A copied packet or a runner that was already used before reservation fails. */
  public recordServerClock(token: CurrentPcbStringLedgerAttempt, runner: CurrentPcbStringServerClockRunner,
    packet: CurrentPcbStringServerClockPacket): Promise<CurrentPcbStringLedgerStatus> {
    this.#requireAttempt(token, "server-clock");
    return this.#step("publication-compared", async () => {
      need(this.#originalProvenance !== null && this.#serverClockOwner?.runner === runner && !this.#serverClockResultRecorded,
        "original reserved server runner required");
      const provenance = this.#originalProvenance;
      originalServerProvenance.call(runner, provenance); originalServerPacket.call(runner, packet);
      const raw = captureCurrentPcbStringClockReply(originalServerReply.call(runner));
      need(raw.sha256 === packet.rawReplySha256, "original server reply differs");
      await this.#append("server-clock-result", { intentSha256: token.intentSha256, packet, rawReply: raw.value,
        rawReplySha256: raw.sha256, originalRunnerRetained: true, dispatchAuthorized: false });
      originalServerProvenance.call(runner, provenance); originalServerPacket.call(runner, packet);
      this.#serverClockPacket = packet; this.#serverClockResultRecorded = true; return this.status();
    });
  }
  /** An unknown or failed RPC never becomes a retry. Keep the reservation and
   * any safely captured original reply; absence is not non-dispatch proof. */
  public stopServerClock(token: CurrentPcbStringLedgerAttempt): Promise<CurrentPcbStringLedgerStatus> {
    this.#requireAttempt(token, "server-clock");
    return this.#step("publication-compared", async () => {
      need(this.#originalProvenance !== null && this.#serverClockOwner !== null, "original reserved server runner missing");
      const runner = this.#serverClockOwner.runner;
      const state = originalServerFailure.call(runner, this.#originalProvenance);
      const raw = state.rawReplyRetained ? captureCurrentPcbStringClockReply(originalServerReply.call(runner)) : null;
      await this.#append("server-clock-stopped", { intentSha256: token.intentSha256, runner: state,
        rawReply: raw?.value ?? null, rawReplySha256: raw?.sha256 ?? null, rpcCancellationProved: false, retryAuthorized: false });
      this.#phase = "failed"; return this.status();
    });
  }
  /** Seals and publishes actual original clock objects before Save reservation.
   * The owner must have admitted the fixed RPC separately; this method does
   * not dispatch it or treat a supplied scalar as that observation. */
  public armSaveClock(issuer: CurrentPcbStringNativeClockIssuer, before: CurrentPcbStringNativeClockObservation,
    armed: CurrentPcbStringNativeClockObservation, serverRunner: CurrentPcbStringServerClockRunner,
    server: CurrentPcbStringServerClockPacket): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("publication-compared", async () => {
      need(this.#originalProvenance !== null && !this.#clockAttempted, "original clock source missing or consumed");
      need(this.#serverClockResultRecorded && this.#serverClockPacket === server && this.#serverClockOwner?.issuer === issuer &&
        this.#serverClockOwner.before === before && this.#serverClockOwner.runner === serverRunner,
      "original durable server clock reservation/result required");
      this.#clockAttempted = true;
      const plan = prepareCurrentPcbStringSaveClock(this.#originalProvenance, issuer, before, armed, serverRunner, server);
      await this.#append("save-clock-plan", { plan });
      requireOriginalCurrentPcbStringSaveClock(plan, this.#originalProvenance); this.#clockPlan = plan; return this.status();
    });
  }
  /** Returns this ledger's original provenance only while the retained actor
   * and SQL objects still pass their own validators. It is not owner authority. */
  public originalSaveProvenance(): CurrentPcbStringSaveProvenance {
    need(this.#originalProvenance !== null && this.#phase !== "failed", "original String sources missing");
    currentPcbStringSaveProvenanceSource(this.#originalProvenance); return this.#originalProvenance;
  }
  /** Reserves the Save only after composing original String actor selection,
   * publication and SQL plans. Their supplied clocks still grant no authority. */
  public reserveSave(provenance: CurrentPcbStringSaveProvenance, history: CurrentPcbStringHistoryProjection,
    witness: CurrentPcbStringSqlWitness): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("publication-compared", async () => {
      need(this.#publication !== null && this.#savePlan !== null, "original create/publication missing");
      const actor = compareCurrentPcbStringSaveHistoryProvenance(provenance, history);
      if (this.#originalProvenance !== null) {
        need(provenance === this.#originalProvenance && this.#clockPlan !== null, "original Save clock/provenance required");
        const clock = requireOriginalCurrentPcbStringSaveClock(this.#clockPlan, provenance);
        need(witness !== null && typeof witness === "object" && !types.isProxy(witness) &&
          (Object.getPrototypeOf(witness) === Object.prototype || Object.getPrototypeOf(witness) === null), "own SQL clock witness required");
        const suppliedClocks = ["backendClockMinMs", "backendClockMaxMs", "backendLocalOffsetMinutes"].map(key => {
          const descriptor = Object.getOwnPropertyDescriptor(witness, key);
          need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "own SQL clock fields required");
          return descriptor.value as unknown;
        });
        need(suppliedClocks[0] === clock.backendWindow.minimumMs && suppliedClocks[1] === clock.backendWindow.maximumMs &&
          suppliedClocks[2] === clock.backendLocalOffsetMinutes && history.saveTime >= clock.saveWindow.minimumMs &&
          history.saveTime <= clock.saveWindow.maximumMs && history.backendTime >= clock.backendWindow.minimumMs &&
          history.backendTime <= clock.backendWindow.maximumMs, "Save clock-derived witness differs");
      }
      need(actor.beforeSqlSha256 === this.#before.logicalSha256 && history.primitiveId === this.#primitiveId &&
        history.targetUuid === this.#createPlan.target.documentUuid && history.client === this.#publication.binding.client &&
        history.uniqueId === this.#publication.binding.uniqueId && history.publicationTicket === this.#publication.expectedTicket &&
        history.bodyText === this.#candidate.expectedBodyText, "history and original create differ");
      const sql = await prepareCurrentPcbStringSql({ before: this.#before, history, witness });
      compareCurrentPcbStringSaveHistoryProvenance(provenance, history);
      if (this.#clockPlan !== null) { requireOriginalCurrentPcbStringSaveClock(this.#clockPlan, provenance); }
      await this.#current(); this.#saveConsumed = true; this.#phase = "save-intent";
      const record = await this.#append("save-intent", { savePlanSha256: this.#savePlan.planSha256,
        historyChunkSha256: history.chunkSha256, actor, sql, dispatchAuthorized: false });
      if (this.#clockPlan !== null) { requireOriginalCurrentPcbStringSaveClock(this.#clockPlan, provenance); }
      this.#sqlPlan = sql; this.#history = history; this.#saveAttempt = this.#attempt("save", record); return this.#saveAttempt;
    });
  }
  public recordSaveOutcome(token: CurrentPcbStringLedgerAttempt, supplied: unknown): Promise<CurrentPcbStringLedgerStatus> {
    this.#requireAttempt(token, "save");
    return this.#step("save-intent", async () => {
      need(this.#savePlan !== null, "original Save plan missing");
      const raw = rawJson(supplied); let accepted = false, completed = false;
      try { const result = compareCurrentPcbStringSaveObservation(this.#savePlan, raw); accepted = true; completed = result.completed; }
      catch {
        // Missing or invalid acknowledgment consumes the sole reservation.
      }
      await this.#append("save-result", { intentSha256: token.intentSha256, rawJson: raw,
        resultContractAccepted: accepted, suppliedCompleted: completed });
      this.#phase = completed ? "save-acknowledged" : "failed"; return this.status();
    });
  }
  public recordSavePost(post: CurrentPcbStringNativeClockObservation): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("save-acknowledged", async () => {
      need(this.#clockPlan !== null && !this.#clockPostRecorded, "original Save post missing or consumed");
      recordCurrentPcbStringSaveClockPost(this.#clockPlan, post);
      await this.#append("save-clock-post", { post }); this.#clockPostRecorded = true; return this.status();
    });
  }
  public compareClosedSql(after: Inventory, termination?: CurrentPcbStringNativeClockObservation): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("save-acknowledged", async () => {
      need(this.#sqlPlan !== null && after !== this.#before, "distinct original post-Save SQL required"); finished(after);
      let clockRelation: ReturnType<typeof compareCurrentPcbStringSaveClockHistory> | null = null;
      if (this.#originalProvenance === null) { need(termination === undefined, "comparison-only ledger cannot adopt native clocks"); }
      else {
        need(this.#clockPlan !== null && this.#clockPostRecorded && this.#history !== null && termination !== undefined,
          "original post and termination clocks required");
        clockRelation = compareCurrentPcbStringSaveClockHistory(this.#clockPlan, this.#history, termination);
      }
      const relation = await verifyCurrentPcbStringSql(this.#sqlPlan, after); finished(after);
      await this.#append("closed-sql-comparison", { relation, clockRelation, ...(clockRelation === null ? {} : { termination }) }); this.#afterSql = after;
      this.#phase = "closed-sql-compared"; return this.status();
    });
  }
  public compareReopenedString(first: unknown, second: unknown): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("closed-sql-compared", async () => {
      const a = decodeCurrentPcbDiagnosticRawStringsReply(first), b = decodeCurrentPcbDiagnosticRawStringsReply(second);
      const text = canonicalJson(a);
      need(text === this.#afterRawProjection && text === canonicalJson(b), "supplied reopened String differs");
      await this.#append("reopened-string-comparison", { suppliedRawProjectionMatches: true, rawProjectionSha256: sha256Text(text),
        freshReopenOwnerVerified: false });
      this.#phase = "reopened-string-compared"; return this.status();
    });
  }
  public compareFinalSql(final: Inventory): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("reopened-string-compared", async () => {
      need(this.#afterSql !== null && final !== this.#afterSql && final !== this.#before, "distinct final original SQL reader required");
      finished(this.#afterSql); finished(final);
      const relation = await compareCompleteClosedSql(this.#afterSql, final); finished(final);
      await this.#append("final-sql-comparison", { relation, ...LIMITS });
      this.#phase = "comparisons-complete-awaiting-native-lifecycle-proof"; return this.status();
    });
  }
}

export const CURRENT_PCB_STRING_LEDGER_REMAINING = freezeDeep([
  "Original eligibility must cover full native baseline, all effects and contained destinations before either reserved attempt may dispatch.",
  "A future owner must call the fixed create and Save programs exactly once after these durable reservations; this ledger has no transport.",
  "Global launch/bridge/native-edit admission blocks every String ledger, including partial and comparison-complete journals; native completion cannot yet clear them.",
  "Observed generation closure and cache-excluded fresh reopening require retained original handles, not supplied SQL or matching raw samples.",
  "Original visual evidence and a separate acceptance review remain required; the final comparison state is deliberately not lifecycle completion.",
]);

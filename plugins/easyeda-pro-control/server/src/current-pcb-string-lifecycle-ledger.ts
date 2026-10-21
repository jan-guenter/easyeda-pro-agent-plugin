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
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { compareCurrentPcbStringCreateObservation, requireOriginalCurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringPostCreate } from "./current-pcb-string-postcreate.ts";
import { compareCapturedCurrentPcbStringPublication } from "./current-pcb-string-publication-capture.ts";
import type { CurrentPcbStringPublicationPlan } from "./current-pcb-string-publication.ts";
import { compareCurrentPcbStringSaveObservation, planCurrentPcbStringSaveObservation } from "./current-pcb-string-save-observation.ts";
import type { CurrentPcbStringSaveObservationPlan } from "./current-pcb-string-save-observation.ts";
import { compareCurrentPcbStringSaveHistoryProvenance } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
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
type AttemptKind = "create" | "save";
const DIRECTORY = "pcb-string-dormant-lifecycle-v1";
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
  readonly recordCount: number;
  readonly acknowledgedPrimitiveId: string | null;
}
const originalAttempts = new WeakMap<CurrentPcbStringLedgerAttempt, CurrentPcbStringLifecycleLedger>();
const consumedPlans = new WeakSet<CurrentPcbStringCreateObservationPlan>();
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
  #createResult: string | null = null;
  #primitiveId: string | null = null;
  #publication: CurrentPcbStringPublicationPlan | null = null;
  #afterRawProjection: string | null = null;
  #savePlan: CurrentPcbStringSaveObservationPlan | null = null;
  #sqlPlan: CurrentPcbStringSqlPlan | null = null;
  #afterSql: Inventory | null = null;

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
  public status(): CurrentPcbStringLedgerStatus {
    return Object.freeze({ profile: "private.current-pcb-string-lifecycle-ledger.v1", operationId: this.#operationId,
      phase: this.#phase, busy: this.#busy, createAttemptConsumed: this.#createConsumed, saveAttemptConsumed: this.#saveConsumed,
      recordCount: this.#records.length, acknowledgedPrimitiveId: this.#primitiveId, ...LIMITS });
  }
  public records(): readonly PublishedManagedAttachment[] { return Object.freeze([...this.#records]); }
  async #current(): Promise<void> {
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
    need(sequence < 12, "journal record bound exceeded");
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
    need(originalAttempts.get(token) === this && (kind === "create" ? token === this.#createAttempt : token === this.#saveAttempt),
      "original ledger attempt required");
  }
  /** Publishes a durable reservation only. A live caller still needs an
   * independently issued original eligibility capability before any dispatch. */
  public reserveCreate(): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("prepared", async () => {
      this.#createConsumed = true; this.#phase = "create-intent";
      const record = await this.#append("create-intent", { createPlanSha256: this.#createPlan.planSha256,
        candidateBodySha256: this.#candidate.expectedBodySha256, dispatchAuthorized: false });
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
  /** Reserves the Save only after composing original String actor selection,
   * publication and SQL plans. Their supplied clocks still grant no authority. */
  public reserveSave(provenance: CurrentPcbStringSaveProvenance, history: CurrentPcbStringHistoryProjection,
    witness: CurrentPcbStringSqlWitness): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("publication-compared", async () => {
      need(this.#publication !== null && this.#savePlan !== null, "original create/publication missing");
      const actor = compareCurrentPcbStringSaveHistoryProvenance(provenance, history);
      need(actor.beforeSqlSha256 === this.#before.logicalSha256 && history.primitiveId === this.#primitiveId &&
        history.targetUuid === this.#createPlan.target.documentUuid && history.client === this.#publication.binding.client &&
        history.uniqueId === this.#publication.binding.uniqueId && history.publicationTicket === this.#publication.expectedTicket &&
        history.bodyText === this.#candidate.expectedBodyText, "history and original create differ");
      const sql = await prepareCurrentPcbStringSql({ before: this.#before, history, witness });
      compareCurrentPcbStringSaveHistoryProvenance(provenance, history);
      await this.#current(); this.#saveConsumed = true; this.#phase = "save-intent";
      const record = await this.#append("save-intent", { savePlanSha256: this.#savePlan.planSha256,
        historyChunkSha256: history.chunkSha256, actor, sql, dispatchAuthorized: false });
      this.#sqlPlan = sql; this.#saveAttempt = this.#attempt("save", record); return this.#saveAttempt;
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
  public compareClosedSql(after: Inventory): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("save-acknowledged", async () => {
      need(this.#sqlPlan !== null && after !== this.#before, "distinct original post-Save SQL required"); finished(after);
      const relation = await verifyCurrentPcbStringSql(this.#sqlPlan, after); finished(after);
      await this.#append("closed-sql-comparison", { relation }); this.#afterSql = after;
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
  "Launch/quarantine integration must block every unresolved original operation; a fresh operation ID must not bypass an ambiguous earlier attempt.",
  "Observed generation closure and cache-excluded fresh reopening require retained original handles, not supplied SQL or matching raw samples.",
  "Original visual evidence and a separate acceptance review remain required; the final comparison state is deliberately not lifecycle completion.",
]);

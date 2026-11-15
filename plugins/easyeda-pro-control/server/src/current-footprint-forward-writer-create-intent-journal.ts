/** Fixed durable pre-Create intent component. Historical bytes describe a
 * single consumed attempt, never a native owner, successful edit or replay. */
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath, updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const PREFIX = "footprint-create-intent-", PROFILE = "private.current-footprint-forward-writer-create-intent-plan.v1";
const BUDGET = Object.freeze({ records: 3, recordBytes: 8192, manifestBytes: 65_536, artifactPathUnits: 8192 });
const BUDGET_SHA256 = sha256Json(BUDGET), TERMINAL = new Set(["original-exit"]);
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
export const currentFootprintForwardWriterCreateIntentIdSchema = z.string().regex(/^footprint-create-intent-[a-z\d][a-z\d-]{0,63}$(?![\s\S])/u);
const window = z.strictObject({ minimum: z.number().int().positive().max(8_640_000_000_000_000), maximum: z.number().int().positive().max(8_640_000_000_000_000) }).refine(value => value.maximum >= value.minimum && value.maximum - value.minimum <= 60_000);
export const currentFootprintForwardWriterCreateIntentPlanSchema = z.strictObject({
 operationId: currentFootprintForwardWriterCreateIntentIdSchema, sourceOperationId: z.string().regex(/^footprint-forward-writer-[a-z\d-]{1,96}$(?![\s\S])/u),
 sourceInputSha256: digest, nativeBindingSha256: digest, beforeSqlSha256: digest, copyPlanSha256: digest, mainReservationSha256: digest,
 nativeAgeRequired: z.boolean(), headObservationSha256: digest.nullable(), clockWindow: window,
 confirmDisposableCopy: z.literal(true), acceptUnsupportedInverse: z.literal(true), destinationAllocated: z.literal(false)
}).refine(value => value.nativeAgeRequired === (value.headObservationSha256 !== null));
export type IntentPlan = Readonly<z.infer<typeof currentFootprintForwardWriterCreateIntentPlanSchema>>;
const phases = ["create-intent", "dispatch-intent", "original-exit"] as const;
type Phase = typeof phases[number];
export const currentFootprintForwardWriterCreateIntentRecordSchema = z.strictObject({
 schema: z.literal("easyeda-pro-control.footprint-forward-writer-create-intent-record.v1"), operationId: currentFootprintForwardWriterCreateIntentIdSchema,
 sequence: z.number().int().min(0).max(BUDGET.records - 1), previousSha256: digest.nullable(), kind: z.enum(phases), evidence: z.record(z.string(), z.unknown()),
 executionAuthorized: z.literal(false), saveAuthorized: z.literal(false)
});
type Entry = Readonly<z.infer<typeof currentFootprintForwardWriterCreateIntentRecordSchema>>;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_CREATE_INTENT_JOURNAL_${code}`); } }
function core(value: Readonly<UnknownRecord>): string { const { journalSha256: _hash, integrityModel: _model, ...fields } = value; return canonicalJson(fields); }
export function assertCurrentFootprintForwardWriterCreateIntentChain(records: readonly Entry[]): void {
 need(records.length <= BUDGET.records, "CHAIN_BOUND"); let previous: Entry | null = null;
 for (const [index, raw] of records.entries()) {
  const entry = currentFootprintForwardWriterCreateIntentRecordSchema.parse(raw); need(Buffer.byteLength(`${JSON.stringify(entry)}\n`) <= BUDGET.recordBytes, "RECORD_BOUND");
  need(entry.sequence === index && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) && (previous === null || previous.operationId === entry.operationId && previous.kind !== "original-exit"), "CHAIN_IDENTITY");
  if (index === 0) { need(entry.kind === "create-intent", "ORIGINAL_INTENT_REQUIRED"); const evidence = z.strictObject({ plan: currentFootprintForwardWriterCreateIntentPlanSchema }).parse(entry.evidence); need(evidence.plan.operationId === entry.operationId, "PLAN_IDENTITY"); }
  else if (entry.kind === "dispatch-intent") { need(index === 1, "DISPATCH_POSITION"); z.strictObject({ dispatchReservedOnce: z.literal(true), destinationAllocated: z.literal(false) }).parse(entry.evidence); }
  else { need(entry.kind === "original-exit", "EXIT_POSITION"); z.strictObject({ originalGenerationExited: z.literal(true), executionResultClaimed: z.literal(false), persistenceVerified: z.literal(false) }).parse(entry.evidence); }
  previous = entry;
 }
}
function artifact(operationId: string, entry: Entry): ArtifactDescriptor { const text = `${JSON.stringify(entry)}\n`; return { path: join(dirname(operationPath(operationId)), operationId, `${String(entry.sequence).padStart(2, "0")}-${entry.kind}.json`), bytes: Buffer.byteLength(text), sha256: sha256Text(text) }; }
const artifactSchema = z.strictObject({ path: z.string().max(BUDGET.artifactPathUnits), bytes: z.number().int().positive().max(BUDGET.recordBytes), sha256: digest });
const manifestSchema = z.object({ schema: z.literal(OPERATION_SCHEMA), operationId: currentFootprintForwardWriterCreateIntentIdSchema, planHash: digest,
 plan: z.strictObject({ profile: z.literal(PROFILE), intent: currentFootprintForwardWriterCreateIntentPlanSchema, nonce: digest, budgetSha256: z.literal(BUDGET_SHA256) }),
 records: z.array(currentFootprintForwardWriterCreateIntentRecordSchema).max(BUDGET.records), artifacts: z.array(artifactSchema).max(BUDGET.records), state: z.enum(["prepared", "completed"])
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
 const value = manifestSchema.parse(input); const records = value.records; assertCurrentFootprintForwardWriterCreateIntentChain(records);
 need(value.plan.intent.operationId === value.operationId && value.planHash === buildPlanHash(value.plan) && value.artifacts.length === records.length, "MANIFEST_IDENTITY");
 for (const [index, entry] of records.entries()) { need(entry.operationId === value.operationId && canonicalJson(value.artifacts[index]) === canonicalJson(artifact(value.operationId, entry)), "ARTIFACT_BINDING"); }
 if (records.length > 0) { need(canonicalJson(records[0]?.evidence["plan"]) === canonicalJson(value.plan.intent), "ORIGINAL_PLAN"); }
 need(value.state === (records.at(-1)?.kind === "original-exit" ? "completed" : "prepared"), "TERMINAL_STATE"); return records;
}
/** Pure parsed summary for the shared fresh launch scan; grants no ownership. */
export function projectCurrentFootprintForwardWriterCreateIntentLaunchState(value: UnknownRecord): Readonly<{ operationId: string; settled: boolean }> | undefined {
 const id = value["operationId"], plan = value["plan"];
 if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
 const entries = parse(value); need(typeof id === "string", "OPERATION_ID"); return { operationId: id, settled: entries.at(-1)?.kind === "original-exit" };
}
const scan = createOperationScanner(projectCurrentFootprintForwardWriterCreateIntentLaunchState);
/** New launches must check this component too. A current original operation may
 * exclude only its own ID; no stored description recreates live authority. */
export async function assertNoUnresolvedCurrentFootprintForwardWriterCreateIntents(exceptOperationId?: string): Promise<void> {
 if (exceptOperationId !== undefined) { currentFootprintForwardWriterCreateIntentIdSchema.parse(exceptOperationId); }
 for (const value of await scan()) { need(value.operationId === exceptOperationId || value.settled, "UNRESOLVED_INTENT"); }
}

export class CurrentFootprintForwardWriterCreateIntentJournal {
  readonly #intentPlan: IntentPlan;
  #operation: OperationJournal;
  #reserved = false;
  #reserveAttempted = false;
  #reservationEntered = false;
  #reservationConflict = false;
  #writing = false;
  #publicationIdle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  public constructor(request: IntentPlan) {
    this.#intentPlan = freezeDeep(currentFootprintForwardWriterCreateIntentPlanSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#intentPlan.operationId);
    const plan = { profile: PROFILE, intent: this.#intentPlan, nonce: randomBytes(32).toString("hex"), budgetSha256: BUDGET_SHA256 };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: this.#intentPlan.operationId, plan, planHash: buildPlanHash(plan),
      state: "prepared", records: [], artifacts: [] };
    Object.freeze(this);
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async () => {
      await ensureOperationStorage(); await assertOperationIdUnused(this.#intentPlan.operationId); this.#reservationEntered = true;
      try { await createOperation(this.#operation); }
      catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") { this.#reservationConflict = true; }
        throw error;
      }
      this.#reserved = true;
      this.#queue("create-intent", { plan: this.#intentPlan }); await this.#settlePending();
    });
  }
  /** Describe only this instance's original reservation attempt. A known
   * pre-create refusal or EEXIST conflict owns no managed journal. An unknown
   * create cannot be discarded or adopted and must settle its original bytes. */
  public reservationOutcome(): "not-entered" | "conflict" | "create-unknown" | "reserved" {
    need(!this.#writing, "PUBLICATION_BUSY");
    if (this.#reservationConflict) { return "conflict"; }
    if (!this.#reservationEntered) { return "not-entered"; }
    return this.#reserved ? "reserved" : "create-unknown";
  }
  public async assertCurrent(): Promise<void> {
    need(!this.#writing, "PUBLICATION_BUSY"); await this.#assertPublished(); need(!this.#writing, "PUBLICATION_BUSY");
  }
  async #assertPublished(): Promise<void> {
    need(this.#reserved && this.#pending === null, "PUBLICATION_PENDING");
    const actual = await loadOperation(this.#intentPlan.operationId); parse(actual); need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
  }
  public async append(kind: "dispatch-intent" | "original-exit", evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(currentFootprintForwardWriterCreateIntentRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-writer-create-intent-record.v1", operationId: this.#intentPlan.operationId,
      sequence: records.length, previousSha256, kind, evidence,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardWriterCreateIntentChain([...records, entry]); const descriptor = artifact(this.#intentPlan.operationId, entry);
    const artifacts = this.#operation.artifacts ?? [];
    const next = { ...this.#operation, records: [...records, entry], artifacts: [...artifacts, descriptor], state: TERMINAL.has(kind) ? "completed" : "prepared" };
    parse(next);
    this.#pending = Object.freeze({ entry, descriptor, next });
  }
  public async settle(): Promise<void> {
    await this.#exclusive(() => this.#settlePending());
  }
  /** Join only the original publication active at invocation. This always
   * settles and issues no read, retry, publication or admission authority. */
  public async waitForCurrentPublication(): Promise<void> { await this.#publicationIdle; }
  async #exclusive(action: () => Promise<void>): Promise<void> {
    need(!this.#writing, "PUBLICATION_BUSY");
    const idle = Promise.withResolvers<null>(); this.#writing = true; this.#publicationIdle = idle.promise;
    try { await action(); } finally { this.#writing = false; idle.resolve(null); }
  }
  async #settlePending(): Promise<void> {
    need(this.#reserveAttempted && this.#reservationEntered && !this.#reservationConflict, "ORIGINAL_RESERVATION_REQUIRED");
    let actual = await loadOperation(this.#intentPlan.operationId);
    if (!this.#reserved) { need(core(actual) === core(this.#operation), "RESERVATION_CHANGED"); this.#reserved = true; }
    let pending = this.#pending;
    if (pending === null) {
      need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
      if (parse(this.#operation).length > 0) { return; }
      this.#queue("create-intent", { plan: this.#intentPlan }); pending = this.#pending;
    }
    need(pending !== null, "ORIGINAL_PENDING_REQUIRED");
    need(core(actual) === core(this.#operation) || core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    try { await verifyExactManagedArtifact(pending.descriptor); }
    catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
      const written = await writePhaseArtifact(this.#intentPlan.operationId, pending.entry.sequence, pending.entry.kind, pending.entry);
      need(canonicalJson(written) === canonicalJson(pending.descriptor), "ARTIFACT_CHANGED");
    }
    if (core(actual) !== core(pending.next)) { await updateOperation(pending.next); }
    actual = await loadOperation(this.#intentPlan.operationId); parse(actual); need(core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; publicationPending: boolean; reserved: boolean }> {
    return Object.freeze({ records: Object.freeze([...parse(this.#operation)]), publicationPending: this.#pending !== null || this.#writing, reserved: this.#reserved });
  }
}

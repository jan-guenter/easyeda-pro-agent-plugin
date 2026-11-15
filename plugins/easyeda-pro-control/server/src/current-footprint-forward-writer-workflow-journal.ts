/** Durable original workflow facts with exclusive publication and retained
 * settlement. Historical JSON supplies no native ownership or retry grant. */
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET as BUDGET, currentFootprintForwardWriterWorkflowEvidenceSchemas as EVIDENCE,
  CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES as NORMAL, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PROFILE as PROFILE,
  currentFootprintForwardWriterWorkflowIdSchema, currentFootprintForwardWriterWorkflowRecordSchema, currentFootprintForwardWriterWorkflowRequestSchema } from "./current-footprint-forward-writer-workflow-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowRecord as Entry, CurrentFootprintForwardWriterWorkflowPhase as Phase,
  CurrentFootprintForwardWriterWorkflowRequest as Request } from "./current-footprint-forward-writer-workflow-contract.ts";

const PREFIX = "footprint-forward-flow-";
const MAX_RECORDS = BUDGET.records;
const BUDGET_SHA256 = sha256Json(BUDGET);
const TERMINAL = new Set<Phase>(["complete", "terminal-failure"]);
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`FORWARD_WRITER_WORKFLOW_JOURNAL_${code}`); } }
function core(value: Readonly<UnknownRecord>): string {
  const { journalSha256: _hash, integrityModel: _model, ...fields } = value; return canonicalJson(fields);
}
type Stage = typeof NORMAL[number];
type Generation = "writer" | "saved";
type Cleanup = z.infer<typeof EVIDENCE["cleanup-intent"]>;
/** Post-exit snapshots and comparisons use the ended generation's retained
 * facts. Every other stage needs its own generation before cleanup starts. */
function assertStageGenerationOpen(stage: Stage, cleanupStarted: Readonly<Record<Generation, boolean>>): void {
  if (stage === "writer-snapshot" || stage === "closed-effect" || stage === "saved-snapshot" || stage === "saved-checkpoint") { return; }
  need(!cleanupStarted[stage.startsWith("saved-") ? "saved" : "writer"], "GENERATION_CLEANUP_STARTED");
}
/** Validate the entire phase/hash chain. Fixed facts remain data, while the
 * original controller independently proves every native/SQL/source relation. */
export function assertCurrentFootprintForwardWriterWorkflowChain(records: readonly Entry[]): void {
  need(records.length <= MAX_RECORDS, "CHAIN_BOUND");
  let previous: Entry | null = null;
  let normalAt = 0;
  let normalPending: Stage | null = null;
  let cleanupPending: Cleanup | null = null;
  let failed = false;
  let aborted = false;
  let ended = false;
  let normalRecords = 0;
  let cleanupRecords = 0;
  let normalBytes = 0;
  let cleanupBytes = 0;
  const attempts = new Map<string, number>();
  const terminated: Record<Generation, boolean> = { writer: false, saved: false };
  const observers: Record<Generation, boolean> = { writer: false, saved: false };
  const closed: Record<Generation, boolean> = { writer: false, saved: false };
  const cleanupStarted: Record<Generation, boolean> = { writer: false, saved: false };
  for (const [index, input] of records.entries()) {
    const entry = currentFootprintForwardWriterWorkflowRecordSchema.parse(input);
    const bytes = Buffer.byteLength(`${JSON.stringify(entry)}\n`);
    const cleanup = entry.kind === "cleanup-intent" || entry.kind === "cleanup-result" || entry.kind === "terminal-failure";
    need(bytes <= (cleanup ? BUDGET.cleanupRecordBytes : BUDGET.normalRecordBytes), "RECORD_BOUND");
    if (cleanup) { cleanupRecords += 1; cleanupBytes += bytes; } else { normalRecords += 1; normalBytes += bytes; }
    need(normalRecords <= BUDGET.normalRecords && cleanupRecords <= BUDGET.cleanupRecords && normalBytes <= BUDGET.normalBytes && cleanupBytes <= BUDGET.cleanupBytes, "CLASS_RESERVATION");
    need(!ended && entry.sequence === index && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) &&
      (previous === null || previous.operationId === entry.operationId), "CHAIN_IDENTITY");
    need(index !== 0 || entry.kind === "operation-intent", "OPERATION_INTENT");
    if (entry.kind === "operation-intent") {
      const value = EVIDENCE["operation-intent"].parse(entry.evidence);
      need(index === 0 && value.request.operationId === entry.operationId, "ORIGINAL_REQUEST");
    } else if (entry.kind === "stage-intent") {
      const value = EVIDENCE["stage-intent"].parse(entry.evidence);
      need(!failed && !aborted && cleanupPending === null && normalPending === null && value.stage === NORMAL[normalAt], "NORMAL_PREDECESSOR");
      assertStageGenerationOpen(value.stage, cleanupStarted);
      if (value.stage === "writer-snapshot") { need(terminated.writer, "WRITER_EXIT_REQUIRED"); }
      if (value.stage === "saved-allocation") { need(terminated.writer && closed.writer, "WRITER_RELEASE_REQUIRED"); }
      if (value.stage === "saved-snapshot") { need(terminated.saved, "SAVED_EXIT_REQUIRED"); }
      if (value.stage === "saved-checkpoint") { need(terminated.saved && closed.saved, "SAVED_RELEASE_REQUIRED"); }
      normalPending = value.stage;
    } else if (entry.kind === "stage-result") {
      const value = EVIDENCE["stage-result"].parse(entry.evidence);
      need(!failed && !aborted && cleanupPending === null && normalPending === value.stage && value.stage === NORMAL[normalAt], "ORIGINAL_STAGE_RESULT");
      assertStageGenerationOpen(value.stage, cleanupStarted);
      normalPending = null; normalAt += 1;
    } else if (entry.kind === "failure") {
      need(!failed, "FAILURE_CONSUMED"); failed = true;
    } else if (entry.kind === "cleanup-intent") {
      const value = EVIDENCE["cleanup-intent"].parse(entry.evidence);
      const key = `${value.generation}:${value.action}`;
      need(cleanupPending === null && !closed[value.generation], "CLEANUP_PREDECESSOR");
      const count = attempts.get(key) ?? 0;
      need(value.attempt === count + 1 && (value.action === "termination" || count === 0), "CLEANUP_ATTEMPT");
      if (value.action === "termination") { need(!terminated[value.generation], "TERMINATION_CONSUMED"); }
      else if (value.action === "observers") { need(terminated[value.generation], "OBSERVER_EXIT_REQUIRED"); }
      else if (value.action === "release") { need(terminated[value.generation] && observers[value.generation], "RELEASE_JOIN_REQUIRED"); }
      else if (value.action === "close" || value.action === "abort") { need(!terminated[value.generation] && (normalPending === null || failed || value.action === "abort"), "CLOSE_PREDECESSOR"); }
      else { need(!terminated[value.generation] && (value.generation === "writer" ? normalAt === 0 : normalAt <= NORMAL.indexOf("saved-allocation")), "UNALLOCATED_PREDECESSOR"); }
      cleanupStarted[value.generation] = true;
      if (value.action === "abort") { aborted = true; }
      attempts.set(key, value.attempt); cleanupPending = value;
    } else if (entry.kind === "cleanup-result") {
      const value = EVIDENCE["cleanup-result"].parse(entry.evidence);
      const pending = cleanupPending;
      need(pending !== null && pending.generation === value.generation && pending.action === value.action && pending.attempt === value.attempt, "ORIGINAL_CLEANUP_RESULT");
      if (value.outcome !== "failed") {
        if (value.action === "termination") { need(value.outcome === "pending" || value.outcome === "terminated", "TERMINATION_OUTCOME"); terminated[value.generation] = value.outcome === "terminated"; }
        else if (value.action === "observers") { need(value.outcome === "released", "OBSERVER_OUTCOME"); observers[value.generation] = true; }
        else if (value.action === "release") { need(value.outcome === "released", "RELEASE_OUTCOME"); closed[value.generation] = true; }
        else if (value.action === "close" || value.action === "abort") { need(value.outcome === "dispatched", "CLOSE_OUTCOME"); }
        else { need(value.outcome === "no-resource" || value.outcome === "released", "UNALLOCATED_OUTCOME"); closed[value.generation] = true; }
      }
      cleanupPending = null;
    } else if (entry.kind === "complete") {
      const value = EVIDENCE.complete.parse(entry.evidence);
      need(!failed && !aborted && normalAt === NORMAL.length && normalPending === null && cleanupPending === null && terminated.writer && terminated.saved &&
        observers.writer && observers.saved && closed.writer && closed.saved && value.writerSqlSha256 === value.savedSqlSha256, "COMPLETE_PREDECESSOR");
    } else { need(failed && cleanupPending === null && closed.writer && closed.saved, "TERMINAL_FAILURE_PREDECESSOR"); }
    ended = TERMINAL.has(entry.kind); previous = entry;
  }
}
const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/u),
}).strict();
const manifestSchema = z.object({
  operationId: currentFootprintForwardWriterWorkflowIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintForwardWriterWorkflowRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$/u), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintForwardWriterWorkflowRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintForwardWriterWorkflowChain(entries);
  need(entries.every(entry => entry.operationId === operation.operationId) && operation.artifacts.length === entries.length, "ARTIFACT_ROSTER");
  for (const [index, entry] of entries.entries()) {
    const text = `${JSON.stringify(entry)}\n`; const descriptor = operation.artifacts[index];
    need(descriptor !== undefined && descriptor.path === artifact(operation.operationId, entry).path && descriptor.sha256 === sha256Text(text) && descriptor.bytes === Buffer.byteLength(text), "ARTIFACT_BINDING");
  }
  const terminal = entries.at(-1); need(operation.state === (terminal !== undefined && TERMINAL.has(terminal.kind) ? "completed" : "prepared"), "TERMINAL_STATE");
  return entries;
}
function artifact(operationId: string, entry: Entry): ArtifactDescriptor {
  const text = `${JSON.stringify(entry)}\n`;
  return { path: join(dirname(operationPath(operationId)), operationId, `${String(entry.sequence).padStart(2, "0")}-${entry.kind}.json`), bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
}
/** Read the maintained full chain and freshly verified artifacts without
 * constructing a publisher, native owner or resumable opening lifecycle. */
export async function readCurrentFootprintForwardWriterWorkflowHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardWriterWorkflowIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  return freezeDeep({ operation, records });
}
const scan = createOperationScanner((operation): Readonly<{ operationId: string; settled: boolean }> | undefined => {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
});
/** Fresh bounded metadata for the genuine controller's own isolation guard.
 * A matching operation ID alone is never an exemption or native capability. */
export async function scanCurrentFootprintForwardWriterWorkflowSummaries():Promise<readonly Readonly<{operationId:string;settled:boolean}>[]>{
 const values=await scan();return Object.freeze(values.map(value=>Object.freeze({...value})));
}
/** Every unfinished full opening blocks another native launch. Historical JSON
 * cannot reconstruct its original allocation or create a retry exception. */
export async function assertNoUnresolvedCurrentFootprintForwardWriterWorkflows():Promise<void> {
  for(const operation of await scan()) { need(operation.settled,"UNRESOLVED_OWNER"); }
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardWriterWorkflowJournal {
  readonly #request: Request;
  #operation: OperationJournal;
  #reserved = false;
  #reserveAttempted = false;
  #reservationEntered = false;
  #reservationConflict = false;
  #writing = false;
  #publicationIdle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  public constructor(request: Request) {
    this.#request = freezeDeep(currentFootprintForwardWriterWorkflowRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
    const plan = { profile: PROFILE, request: this.#request, nonce: randomBytes(32).toString("hex"), budgetSha256: BUDGET_SHA256 };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: this.#request.operationId, plan, planHash: buildPlanHash(plan),
      state: "prepared", records: [], artifacts: [] };
    Object.freeze(this);
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async () => {
      await ensureOperationStorage(); await assertOperationIdUnused(this.#request.operationId); this.#reservationEntered = true;
      try { await createOperation(this.#operation); }
      catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") { this.#reservationConflict = true; }
        throw error;
      }
      this.#reserved = true;
      this.#queue("operation-intent", { request: this.#request }); await this.#settlePending();
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
    const actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
  }
  public async append(kind: Phase, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(currentFootprintForwardWriterWorkflowRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-flow-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardWriterWorkflowChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
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
    let actual = await loadOperation(this.#request.operationId);
    if (!this.#reserved) { need(core(actual) === core(this.#operation), "RESERVATION_CHANGED"); this.#reserved = true; }
    let pending = this.#pending;
    if (pending === null) {
      need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
      if (parse(this.#operation).length > 0) { return; }
      this.#queue("operation-intent", { request: this.#request }); pending = this.#pending;
    }
    need(pending !== null, "ORIGINAL_PENDING_REQUIRED");
    need(core(actual) === core(this.#operation) || core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    try { await verifyExactManagedArtifact(pending.descriptor); }
    catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
      const written = await writePhaseArtifact(this.#request.operationId, pending.entry.sequence, pending.entry.kind, pending.entry);
      need(canonicalJson(written) === canonicalJson(pending.descriptor), "ARTIFACT_CHANGED");
    }
    if (core(actual) !== core(pending.next)) { await updateOperation(pending.next); }
    actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; publicationPending: boolean; reserved: boolean }> {
    return Object.freeze({ records: Object.freeze([...parse(this.#operation)]), publicationPending: this.#pending !== null || this.#writing, reserved: this.#reserved });
  }
}

/* oxlint-disable import/max-dependencies -- Keep the unchanged V1 reader and independent V2 chain/profile explicit at this durable mixed-version boundary. */
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
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PROFILE as V1_PROFILE, currentFootprintForwardWriterWorkflowIdSchema,
  currentFootprintForwardWriterWorkflowRequestSchema } from "./current-footprint-forward-writer-workflow-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowPhase as Phase, CurrentFootprintForwardWriterWorkflowRequest as Request } from "./current-footprint-forward-writer-workflow-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET as BUDGET, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_PROFILE as PROFILE,
  currentFootprintForwardWriterWorkflowV2RecordSchema as currentFootprintForwardWriterWorkflowRecordSchema } from "./current-footprint-forward-writer-workflow-v2-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowV2Record as Entry } from "./current-footprint-forward-writer-workflow-v2-contract.ts";
import { assertCurrentFootprintForwardWriterWorkflowV2Chain as assertCurrentFootprintForwardWriterWorkflowChain } from "./current-footprint-forward-writer-workflow-v2-chain.ts";
import { readCurrentFootprintForwardWriterWorkflowHistory } from "./current-footprint-forward-writer-workflow-journal.ts";

const PREFIX = "footprint-forward-flow-";
const MAX_RECORDS = BUDGET.records;
const BUDGET_SHA256 = sha256Json(BUDGET);
const TERMINAL = new Set<Phase>(["complete", "terminal-failure"]);
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`FORWARD_WRITER_WORKFLOW_JOURNAL_${code}`); } }
function core(value: Readonly<UnknownRecord>): string {
  const { journalSha256: _hash, integrityModel: _model, ...fields } = value; return canonicalJson(fields);
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
export async function readCurrentFootprintForwardWriterWorkflowV2History(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardWriterWorkflowIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  return freezeDeep({ operation, records });
}
type Selected = Readonly<{ version: "v1"; operationId: string; coreSha256: string }> | Readonly<{ version: "v2"; operationId: string; settled: boolean }>;
/** Select only bounded metadata. Every V1 row is subsequently read by its
 * unchanged historical reader and compared with this fresh scan's exact core. */
const scan = createOperationScanner((operation): Selected | undefined => {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && (plan["profile"] === PROFILE || plan["profile"] === V1_PROFILE))) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  if (plan["profile"] === V1_PROFILE) { return { version: "v1", operationId: id, coreSha256: sha256Text(core(operation)) }; }
  need(plan["profile"] === PROFILE, "UNKNOWN_WORKFLOW_PROFILE");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { version: "v2", operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
});
/** Fresh mixed-version isolation. Historical records supply no original owner,
 * proof, replay exception or current publisher capability. */
export async function scanCurrentFootprintForwardWriterCurrentWorkflowSummaries(): Promise<readonly Readonly<{ operationId: string; settled: boolean }>[]> {
  const selected = await scan(), values: Readonly<{ operationId: string; settled: boolean }>[] = [];
  for (const value of selected) {
    if (value.version === "v2") { values.push(Object.freeze({ operationId: value.operationId, settled: value.settled })); }
    else {
      const history = await readCurrentFootprintForwardWriterWorkflowHistory(value.operationId);
      need(sha256Text(core(history.operation)) === value.coreSha256, "HISTORICAL_SCAN_CHANGED");
      const last = history.records.at(-1);
      values.push(Object.freeze({ operationId: value.operationId, settled: last !== undefined && TERMINAL.has(last.kind) }));
    }
  }
  return Object.freeze(values);
}
export async function assertNoUnresolvedCurrentFootprintForwardWriterCurrentWorkflows(): Promise<void> {
  for (const operation of await scanCurrentFootprintForwardWriterCurrentWorkflowSummaries()) { need(operation.settled, "UNRESOLVED_OWNER"); }
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardWriterWorkflowV2Journal {
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
      schema: "easyeda-pro-control.footprint-forward-flow-record.v2", operationId: this.#request.operationId,
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

/** V2 input evidence uses the maintained managed operation/artifact publisher.
 * Durable hashes detect corruption; no journal can reconstruct native custody. */
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET as BUDGET,
  CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES as NORMAL, CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PROFILE as PROFILE,
  currentFootprintForwardExecutionOpeningIdSchema, currentFootprintForwardExecutionOpeningRecordSchema,
  currentFootprintForwardExecutionOpeningRequestSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import type { CurrentFootprintForwardExecutionOpeningRecord as Entry, CurrentFootprintForwardExecutionOpeningPhase as Phase,
  CurrentFootprintForwardExecutionOpeningRequest as Request } from "./current-footprint-forward-execution-opening-contract.ts";
import type { CurrentFootprintForwardSourceHistoricalSnapshot } from "./current-footprint-forward-source-relinquishment-journal.ts";

const PREFIX = "footprint-forward-execution-";
const MAX_RECORDS = BUDGET.records;
const BUDGET_SHA256 = sha256Json(BUDGET);
const TERMINAL = new Set<Phase>(["release-result", "cleanup-before-launch", "cleanup-no-process", "cleanup-no-allocation"]);
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`FORWARD_EXECUTION_JOURNAL_${code}`); } }
function core(value: Readonly<UnknownRecord>): string {
  const { journalSha256: _hash, integrityModel: _model, ...fields } = value; return canonicalJson(fields);
}
/** Cleanup evidence has a fixed small shape so normal records cannot consume
 * its reserved bytes and later schema growth cannot silently spend that room. */
function cleanupEvidence(entry: Entry): void {
  const kind: string = entry.kind;
  const empty = z.object({}).strict();
  switch (kind) {
    case "failure": { z.object({ phase: z.enum(["new", "launched", "main", "browser", "frames", "ui-source", "sealed"]), originalErrorRetained: z.literal(true), code: z.literal("ORIGINAL_STAGE_FAILED") }).strict().parse(entry.evidence); break;
    }
    case "close-intent": { z.object({ hwnd: z.string().regex(/^[1-9]\d{0,18}$(?![\s\S])/u) }).strict().parse(entry.evidence); break;
    }
    case "close-result": { z.object({ requested: z.literal(true) }).strict().parse(entry.evidence); break;
    }
    case "abort-intent": case "release-intent": case "no-process-release-intent": { empty.parse(entry.evidence); break;}
    case "abort-result": { z.object({ requested: z.literal(true), originalJobOnly: z.literal(true) }).strict().parse(entry.evidence); break;
    }
    case "termination-intent": { z.object({ ordinal: z.number().int().min(1).max(BUDGET.terminationObservations) }).strict().parse(entry.evidence); break;
    }
    case "termination-result": { z.object({ ordinal: z.number().int().min(1).max(BUDGET.terminationObservations), terminated: z.boolean() }).strict().parse(entry.evidence); break;
    }
    case "release-result": { z.object({ released: z.literal(true) }).strict().parse(entry.evidence); break;
    }
    case "cleanup-before-launch": { z.object({ helperClosed: z.literal(true), stdinBytesWritten: z.literal(0) }).strict().parse(entry.evidence); break;
    }
    case "cleanup-no-process": { z.object({ helperReleased: z.literal(true), noProcessProved: z.literal(true) }).strict().parse(entry.evidence); break;
    }
    case "cleanup-no-allocation": { z.object({ noAllocationProved: z.literal(true) }).strict().parse(entry.evidence); break;
    }
    default: { throw new Error("FORWARD_EXECUTION_JOURNAL_CLEANUP_KIND");
    }
  }
}
function stagePredecessor(stage: typeof NORMAL[number]): Phase {
  const position = NORMAL.indexOf(stage);
  if (position === 0) { return "operation-intent"; }
  if (stage === "main") { return "binding"; }
  if (stage === "launch") { return "allocation-result"; }
  return currentFootprintForwardExecutionOpeningRecordSchema.shape.kind.parse(`${NORMAL[position - 1]}-result`);
}
/** Validate the complete bounded phase chain, including pending intents and
 * native closure predecessors. Terminal JSON grants no owner or send lease. */
export function assertCurrentFootprintForwardExecutionOpeningChain(records: readonly Entry[]): void {
  need(records.length <= MAX_RECORDS, "CHAIN_BOUND");
  const seen = new Set<Phase>();
  let cleanup = false; let ended = false; let failed = false; let ordinal = 0; let pendingTermination = false; let previous: Entry | null = null; let terminated = false;
  let cleanupBytes = 0; let cleanupRecords = 0; let failures = 0; let normalBytes = 0; let normalRecords = 0;
  for (const [index, input] of records.entries()) {
    const entry = currentFootprintForwardExecutionOpeningRecordSchema.parse(input);
    const bytes = Buffer.byteLength(`${JSON.stringify(entry)}\n`);
    const normal = entry.kind === "operation-intent" || entry.kind === "binding" || NORMAL.some(stage => entry.kind === `${stage}-intent` || entry.kind === `${stage}-result`);
    let limit: number = BUDGET.cleanupRecordBytes;
    if (normal) { limit = entry.kind === "source-result" ? BUDGET.sourceRecordBytes : BUDGET.normalRecordBytes; }
    need(bytes <= limit, "RECORD_BOUND");
    if (normal) { normalRecords += 1; normalBytes += bytes; }
    else { cleanupEvidence(entry); cleanupRecords += 1; cleanupBytes += bytes; }
    need(normalRecords <= BUDGET.normalRecords && normalBytes <= BUDGET.normalBytes && cleanupRecords <= BUDGET.cleanupRecords && cleanupBytes <= BUDGET.cleanupBytes, "CLASS_RESERVATION");
    need(!ended && entry.sequence === index && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) &&
      (previous === null || previous.operationId === entry.operationId), "CHAIN_IDENTITY");
    need(index !== 0 || entry.kind === "operation-intent", "OPERATION_INTENT");
    if (entry.kind === "operation-intent") {
      const request = currentFootprintForwardExecutionOpeningRequestSchema.parse(entry.evidence["request"]);
      need(index === 0 && request.operationId === entry.operationId, "ORIGINAL_REQUEST");
    } else if (entry.kind === "failure") { failures += 1; need(failures <= 1, "FAILURE_RECORD_CONSUMED"); failed = true; }
    else if (entry.kind === "termination-intent") {
      need(ordinal < BUDGET.terminationObservations, "TERMINATION_BOUND");
      need(cleanup && !pendingTermination && !terminated && entry.evidence["ordinal"] === ordinal + 1, "TERMINATION_INTENT");
      ordinal += 1; pendingTermination = true;
    } else if (entry.kind === "termination-result") {
      need(pendingTermination && entry.evidence["ordinal"] === ordinal && typeof entry.evidence["terminated"] === "boolean", "TERMINATION_RESULT");
      pendingTermination = false; terminated =  entry.evidence["terminated"];
    } else {
      need(!seen.has(entry.kind), "STAGE_CONSUMED");
      if (entry.kind === "binding") { need(seen.has("launch-intent"), "BINDING_PREDECESSOR"); }
      else if (entry.kind === "close-intent" || entry.kind === "abort-intent") {
        need(seen.has("launch-intent") && !terminated && (entry.kind === "abort-intent" || !cleanup), "CLEANUP_PREDECESSOR"); cleanup = true;
      } else if (entry.kind === "close-result" || entry.kind === "abort-result") {
        need(seen.has(entry.kind === "close-result" ? "close-intent" : "abort-intent"), "CLEANUP_RESULT");
      } else if (entry.kind === "release-intent") { need(terminated && !pendingTermination, "TERMINATION_REQUIRED"); }
      else if (entry.kind === "release-result") { need(seen.has("release-intent") && terminated && entry.evidence["released"] === true, "RELEASE_RESULT"); }
      else if (entry.kind === "cleanup-before-launch") { need(seen.has("allocation-intent") && !seen.has("launch-intent") && entry.evidence["helperClosed"] === true, "BEFORE_LAUNCH_REQUIRED"); }
      else if (entry.kind === "no-process-release-intent") { need(seen.has("launch-intent") && !cleanup && !seen.has("release-intent"), "NO_PROCESS_INTENT"); cleanup = true; }
      else if (entry.kind === "cleanup-no-process") { need(seen.has("no-process-release-intent") && entry.evidence["helperReleased"] === true && entry.evidence["noProcessProved"] === true, "NO_PROCESS_REQUIRED"); }
      else if (entry.kind === "cleanup-no-allocation") { need(!seen.has("allocation-result") && entry.evidence["noAllocationProved"] === true, "NO_ALLOCATION_REQUIRED"); }
      else {
        need(!failed && !cleanup, "NORMAL_ENDED");
        const stage = NORMAL.find(value => entry.kind === `${value}-intent` || entry.kind === `${value}-result`);
        need(stage !== undefined, "UNKNOWN_STAGE");
        if (entry.kind.endsWith("-result")) { need(seen.has(`${stage}-intent` as Phase), "INTENT_REQUIRED"); }
        else {
          need(seen.has(stagePredecessor(stage)), "PREDECESSOR_REQUIRED");
        }
      }
    }
    seen.add(entry.kind); ended = TERMINAL.has(entry.kind); previous = entry;
  }
}
const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/u),
}).strict();
const manifestSchema = z.object({
  operationId: currentFootprintForwardExecutionOpeningIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintForwardExecutionOpeningRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$/u), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintForwardExecutionOpeningRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintForwardExecutionOpeningChain(entries);
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
export async function readCurrentFootprintForwardExecutionOpeningHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardExecutionOpeningIdSchema.parse(operationId);
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
/** Every empty, partial or failed v2 journal blocks another native launch. */
export async function assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(): Promise<void> {
  for (const operation of await scan()) {
    if (!operation.settled) {
      const { inspectCurrentFootprintForwardSourceRelinquishment } = await import("./current-footprint-forward-source-relinquishment-journal.ts");
      need(await inspectCurrentFootprintForwardSourceRelinquishment(operation.operationId) !== null, "UNRESOLVED_OWNER");
    }
  }
}

/** Exempt only one exact private historical snapshot during its resolver.
 * Every other Source opening still needs its original terminal or receipt. */
export async function assertCurrentFootprintForwardSourceHistoricalIsolation(
  snapshot: CurrentFootprintForwardSourceHistoricalSnapshot,
): Promise<void> {
  const { requireCurrentFootprintForwardSourceHistoricalSnapshot, assertCurrentFootprintForwardSourceHistoricalSnapshot,
    inspectCurrentFootprintForwardSourceRelinquishment } = await import("./current-footprint-forward-source-relinquishment-journal.ts");
  const original = requireCurrentFootprintForwardSourceHistoricalSnapshot(snapshot);
  await assertCurrentFootprintForwardSourceHistoricalSnapshot(snapshot);
  let selected = false;
  for (const operation of await scan()) {
    if (operation.operationId === original.operationId) { selected = true; }
    else if (!operation.settled) { need(await inspectCurrentFootprintForwardSourceRelinquishment(operation.operationId) !== null, "UNRESOLVED_OWNER"); }
  }
  need(selected, "HISTORICAL_ORIGINAL_MISSING"); await assertCurrentFootprintForwardSourceHistoricalSnapshot(snapshot);
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardExecutionOpeningJournal {
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
    this.#request = freezeDeep(currentFootprintForwardExecutionOpeningRequestSchema.parse(request)); operationPath(this.#request.operationId);
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
    const entry = freezeDeep(currentFootprintForwardExecutionOpeningRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-execution-opening-record.v2", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardExecutionOpeningChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
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

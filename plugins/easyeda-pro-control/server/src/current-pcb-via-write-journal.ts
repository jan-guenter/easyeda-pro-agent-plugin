/** Original operation publication and once-only create/Save intent. Artifact
 * JSON remains historical evidence and cannot recreate an owner or dispatch. */
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation,
  operationPath, updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";

export const CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES = ["baseline", "allocation", "launch", "main", "opening", "sdk", "preflight",
  "native-before", "scene-before", "create", "native-after", "scene-after", "effect", "save", "close", "exit", "closed-sql",
  "reopen", "reopened-native", "reopened-scene", "reopen-close", "reopen-exit", "reopened-sql", "complete"] as const;
export type CurrentPcbViaWriteJournalStage = typeof CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES[number];
type Kind = "operation-intent" | "failure" | "no-allocation" | "abort-intent" | "abort-result" | "termination-intent" |
  "termination-result" | "release-intent" | "release-result" | `${CurrentPcbViaWriteJournalStage}-${"intent" | "result"}`;
const maximumRecordBytes = 65_536, maximumRecords = 64, profile = "private.pcb209-via-write-journal.v1";
const kinds = new Set<string>(["operation-intent", "failure", "no-allocation", "abort-intent", "abort-result", "termination-intent",
  "termination-result", "release-intent", "release-result", ...CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES.flatMap(stage => [`${stage}-intent`, `${stage}-result`])]);
const hash = z.string().regex(/^[a-f\d]{64}$/u);
const entrySchema = z.strictObject({ schema: z.literal("easyeda-pro-control.pcb209-via-write-record.v1"),
  operationId: z.string().max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  sequence: z.number().int().nonnegative().max(maximumRecords - 1), previousSha256: hash.nullable(),
  kind: z.custom<Kind>((value): value is Kind => typeof value === "string" && kinds.has(value)),
  evidence: z.record(z.string(), z.unknown()), inverseAvailable: z.literal(false),
}).refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= maximumRecordBytes);
type Entry = z.infer<typeof entrySchema>;
const artifactSchema = z.strictObject({ path: z.string().max(4096), sha256: hash, bytes: z.number().int().positive().max(maximumRecordBytes) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_WRITE_JOURNAL_${code}`); } }
function terminal(kind: Kind | undefined): boolean { return kind === "complete-result" || kind === "no-allocation"; }
function resultEvidence(entry: Entry): void {
  if (entry.kind === "create-result" || entry.kind === "save-result") {
    const result = currentPcbViaWriteStageResultSchema.parse(entry.evidence);
    need(result.ok && result.stage === entry.kind.slice(0, -7), "SDK_ACKNOWLEDGEMENT");
  }
  if (entry.kind === "exit-result" || entry.kind === "reopen-exit-result") {
    z.strictObject({ rootExited: z.literal(true), jobEmpty: z.literal(true), helperReleased: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "closed-sql-result" || entry.kind === "reopened-sql-result") {
    z.strictObject({ logicalSha256: hash, nativeHistorySha256: hash, completeSqlVerified: z.literal(true), sourceMembershipVerified: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "complete-result") {
    z.strictObject({ saved: z.literal(true), reopened: z.literal(true), completeSqlVerified: z.literal(true), peerRosterPreserved: z.literal(true), inverseAvailable: z.literal(false) }).parse(entry.evidence);
  }
}

/** Save cannot skip native/source effect acceptance. A second attempt cannot
 * occur after an acknowledgement, failure, cleanup or pending publication. */
export function assertCurrentPcbViaWriteJournalChain(input: readonly Entry[]): void {
  need(input.length <= maximumRecords, "RECORD_BOUND");
  let failed = false, next = 0, pending: string | null = null, previous: Entry | null = null;
  const seen = new Set<string>();
  for (const [index, raw] of input.entries()) {
    const entry = entrySchema.parse(raw);
    resultEvidence(entry);
    need(entry.sequence === index && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) &&
      (previous === null || entry.operationId === previous.operationId) && !seen.has(entry.kind) && !terminal(previous?.kind), "CHAIN");
    if (index === 0) { need(entry.kind === "operation-intent", "FIRST"); }
    else if (entry.kind === "failure") { need(!failed, "DUPLICATE_FAILURE"); failed = true; }
    else if (entry.kind === "no-allocation") {
      need(failed && !seen.has("allocation-intent") && entry.evidence["allocationNeverEntered"] === true, "NO_ALLOCATION");
    } else if (entry.kind.startsWith("abort-") || entry.kind.startsWith("termination-") || entry.kind.startsWith("release-")) {
      need(failed, "CLEANUP_BEFORE_FAILURE");
      if (entry.kind.endsWith("-result")) { need(seen.has(entry.kind.replace(/-result$/u, "-intent")), "CLEANUP_INTENT"); }
      if (entry.kind === "termination-result") { need(entry.evidence["rootExited"] === true && entry.evidence["jobEmpty"] === true, "ORIGINAL_EXIT"); }
      if (entry.kind === "release-intent") { need(seen.has("termination-result"), "EXIT_BEFORE_RELEASE"); }
      if (entry.kind === "release-result") { need(entry.evidence["released"] === true, "ORIGINAL_RELEASE"); }
    } else {
      need(!failed, "NORMAL_AFTER_FAILURE"); const stage = CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES[next]; need(stage !== undefined, "STAGE_BOUND");
      if (entry.kind.endsWith("-intent")) { need(pending === null && entry.kind === `${stage}-intent`, "INTENT_ORDER"); pending = stage; }
      else { need(pending === stage && entry.kind === `${stage}-result`, "RESULT_ORDER"); pending = null; next += 1; }
    }
    seen.add(entry.kind); previous = entry;
  }
}
function entries(input: Readonly<Record<string, unknown>>): readonly Entry[] {
  const operation = z.looseObject({ operationId: z.string(), plan: z.looseObject({ profile: z.literal(profile) }), planHash: hash,
    records: z.array(entrySchema).max(maximumRecords), state: z.enum(["completed", "prepared"]),
    artifacts: z.array(artifactSchema).max(maximumRecords) }).parse(input);
  const records = operation.records; assertCurrentPcbViaWriteJournalChain(records);
  need(operation.state === (terminal(records.at(-1)?.kind) ? "completed" : "prepared") &&
    records.every(entry => entry.operationId === operation.operationId), "MANIFEST_STATE");
  const artifacts = operation.artifacts; need(artifacts !== undefined && artifacts.length === records.length, "ARTIFACT_ROSTER");
  for (const [index, record] of records.entries()) { need(canonicalJson(artifacts[index]) === canonicalJson(artifact(record)), "ARTIFACT_BINDING"); }
  return records;
}
function manifestCore(operation: OperationJournal): string {
  const { journalSha256: _hash, integrityModel: _model, ...value } = operation; return canonicalJson(value);
}
function artifact(entry: Entry): ArtifactDescriptor {
  const text = `${JSON.stringify(entry)}\n`; return { path: join(dirname(operationPath(entry.operationId)), entry.operationId,
    `${String(entry.sequence).padStart(2, "0")}-${entry.kind}.json`), sha256: sha256Text(text), bytes: Buffer.byteLength(text) };
}
export interface CurrentPcbViaWriteDispatch { readonly profile: "private.current-pcb-via-write-dispatch.v1" }
interface Dispatch { readonly journal: CurrentPcbViaWriteJournal; readonly owner: object; readonly plan: CurrentPcbViaWritePlan;
  readonly stage: "create" | "save"; readonly sequence: number; consumed: boolean }
const dispatches = new WeakMap<CurrentPcbViaWriteDispatch, Dispatch>();
const journals = new WeakSet<CurrentPcbViaWriteJournal>();
/** The actual native owner must pass itself before its first dispatch await.
 * A token bound to another owner or a copied plan cannot spend this slot. */
export function consumeCurrentPcbViaWriteDispatch(token: CurrentPcbViaWriteDispatch, stage: "create" | "save", owner: object,
  plan: CurrentPcbViaWritePlan): Readonly<{ assertPublished: () => Promise<void> }> {
  const original = dispatches.get(token);
  need(original !== undefined && !original.consumed && original.owner === owner && original.plan === plan && original.stage === stage, "ORIGINAL_DISPATCH");
  original.journal.requireDispatchIntent(stage, original.sequence); requireOriginalCurrentPcbViaWritePlan(plan); original.consumed = true;
  return Object.freeze({ assertPublished: (): Promise<void> => original.journal.assertCurrent() });
}
/** Failed journals stay unresolved after resource cleanup. Closing a process
 * cannot turn an unknown Save into a completed design operation. */
export class CurrentPcbViaWriteJournal {
  readonly #plan: CurrentPcbViaWritePlan;
  #operation: OperationJournal;
  #owner: object | null = null;
  #reserveAttempted = false;
  #entered = false;
  #reserved = false;
  #busy = false;
  #idle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  readonly #dispatchTokens = new Map<"create" | "save", CurrentPcbViaWriteDispatch>();
  public constructor(plan: CurrentPcbViaWritePlan) {
    requireOriginalCurrentPcbViaWritePlan(plan); this.#plan = plan;
    const data = { profile, plan, nonce: randomBytes(32).toString("hex") };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: plan.operationId, plan: data, planHash: buildPlanHash(data), state: "prepared", records: [], artifacts: [] };
    journals.add(this); Object.freeze(this);
  }
  public bindWriter(owner: object): void {
    need(this.#owner === null && this.#reserved && !this.#busy && this.#pending === null && typeof owner === "object" && owner !== null, "WRITER_BINDING");
    this.#owner = owner;
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async (): Promise<void> => {
      await ensureOperationStorage(); await assertOperationIdUnused(this.#plan.operationId); this.#entered = true;
      await createOperation(this.#operation); this.#reserved = true; this.#queue("operation-intent", { plan: this.#plan }); await this.#settle();
    });
  }
  async #assertCurrent(): Promise<void> {
    need(this.#reserved && this.#pending === null, "PUBLICATION_PENDING");
    const actual = await loadOperation(this.#plan.operationId); entries(actual);
    need(manifestCore(actual) === manifestCore(this.#operation), "ORIGINAL_CHANGED");
    for (const descriptor of actual.artifacts ?? []) { await verifyExactManagedArtifact(descriptor); }
    requireOriginalCurrentPcbViaWritePlan(this.#plan);
  }
  public async assertCurrent(): Promise<void> { need(!this.#busy, "BUSY"); await this.#assertCurrent(); need(!this.#busy, "BUSY"); }
  #queue(kind: Kind, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = entries(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(entrySchema.parse({ schema: "easyeda-pro-control.pcb209-via-write-record.v1", operationId: this.#plan.operationId,
      sequence: records.length, previousSha256, kind, evidence, inverseAvailable: false }));
    const descriptor = artifact(entry), next = { ...this.#operation, records: [...records, entry], artifacts: [...this.#operation.artifacts ?? [], descriptor],
      state: terminal(kind) ? "completed" : "prepared" };
    entries(next); this.#pending = Object.freeze({ entry, descriptor, next });
  }
  public async append(kind: Kind, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async (): Promise<void> => { await this.#assertCurrent(); this.#queue(kind, evidence); await this.#settle(); });
  }
  public async appendIntent(stage: "create" | "save", evidence: Readonly<Record<string, unknown>>, owner: object): Promise<CurrentPcbViaWriteDispatch> {
    need(this.#owner === owner && !this.#busy && this.#pending === null && !this.#dispatchTokens.has(stage), "WRITER_BINDING");
    const sequence = entries(this.#operation).length, token = Object.freeze({ profile: "private.current-pcb-via-write-dispatch.v1" as const });
    dispatches.set(token, { journal: this, owner, plan: this.#plan, stage, sequence, consumed: false }); this.#dispatchTokens.set(stage, token);
    await this.append(`${stage}-intent`, evidence); return this.retainedDispatchIntent(stage);
  }
  /** Publication settlement can return the same original unconsumed marker.
   * It never allocates a replacement marker or repeats a native attempt. */
  public retainedDispatchIntent(stage: "create" | "save"): CurrentPcbViaWriteDispatch {
    const token = this.#dispatchTokens.get(stage);
    const original = token === undefined ? undefined : dispatches.get(token);
    need(token !== undefined && original !== undefined && !original.consumed, "ORIGINAL_DISPATCH");
    this.requireDispatchIntent(stage, original.sequence); return token;
  }
  public requireDispatchIntent(stage: "create" | "save", sequence: number): void {
    need(!this.#busy && this.#pending === null && this.#reserved, "PUBLICATION_PENDING"); const last = entries(this.#operation).at(-1);
    need(last?.kind === `${stage}-intent` && last.sequence === sequence, "CURRENT_DISPATCH_INTENT");
  }
  public async settlePublication(): Promise<void> { await this.#exclusive((): Promise<void> => this.#settle()); }
  public async waitForPublication(): Promise<void> { await this.#idle; }
  async #exclusive(action: () => Promise<void>): Promise<void> {
    need(!this.#busy, "BUSY"); this.#busy = true; const idle = Promise.withResolvers<null>(); this.#idle = idle.promise;
    try { await action(); } finally { this.#busy = false; idle.resolve(null); }
  }
  async #settle(): Promise<void> {
    need(this.#reserveAttempted && this.#entered, "ORIGINAL_RESERVATION"); let actual = await loadOperation(this.#plan.operationId);
    if (!this.#reserved) { need(manifestCore(actual) === manifestCore(this.#operation), "RESERVATION_CHANGED"); this.#reserved = true; }
    if (this.#pending === null) {
      need(manifestCore(actual) === manifestCore(this.#operation), "ORIGINAL_CHANGED");
      if (entries(actual).length > 0) { return; } this.#queue("operation-intent", { plan: this.#plan });
    }
    const pending = this.#pending; need(pending !== null, "ORIGINAL_PENDING");
    need(manifestCore(actual) === manifestCore(this.#operation) || manifestCore(actual) === manifestCore(pending.next), "PUBLICATION_CHANGED");
    try { await verifyExactManagedArtifact(pending.descriptor); } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
      need(canonicalJson(await writePhaseArtifact(this.#plan.operationId, pending.entry.sequence, pending.entry.kind, pending.entry)) === canonicalJson(pending.descriptor), "ARTIFACT_CHANGED");
    }
    if (manifestCore(actual) !== manifestCore(pending.next)) { await updateOperation(pending.next); }
    actual = await loadOperation(this.#plan.operationId); entries(actual); need(manifestCore(actual) === manifestCore(pending.next), "PUBLICATION_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; reserved: boolean; publicationPending: boolean }> {
    return Object.freeze({ records: Object.freeze([...entries(this.#operation)]), reserved: this.#reserved, publicationPending: this.#busy || this.#pending !== null });
  }
}
const scan = createOperationScanner(operation => {
  const data = operation["plan"], id = operation["operationId"];
  if (!(typeof id === "string" && id.startsWith("pcb209-via-write-")) && !(isRecord(data) && data["profile"] === profile)) {
    // oxlint-disable-next-line unicorn/no-useless-undefined -- The operation scanner's explicit omission result must stay distinct from a parsed reserved journal.
    return undefined;
  }
  need(typeof id === "string", "RESERVED_OPERATION"); return { operationId: id, completed: terminal(entries(operation).at(-1)?.kind) };
});
export async function assertNoUnresolvedCurrentPcbViaWrites(except?: CurrentPcbViaWriteJournal): Promise<void> {
  if (except !== undefined) { need(journals.has(except), "ORIGINAL_EXCEPTION"); await except.assertCurrent(); }
  const exceptId = except?.retained().records[0]?.operationId;
  for (const row of await scan()) { need(row.completed || row.operationId === exceptId, "UNRESOLVED_OPERATION"); }
}

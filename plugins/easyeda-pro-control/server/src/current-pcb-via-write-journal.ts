/** Original operation publication and once-only create/Save intent. Artifact
 * JSON remains historical evidence and cannot recreate an owner or dispatch. */
/* oxlint-disable import/max-dependencies -- Original reader no-root release adds its separately branded factory/checkpoint to the existing durable writer journal; lazy genuine module checks cannot be caller supplied. */
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
import type { requireOriginalCurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaSavedReadbackOwner, assertOriginalCurrentPcbViaSavedReadbackOwner, originalCurrentPcbViaSavedReadbackTarget } from "./current-pcb-via-saved-readback-owner.ts";
import type { CurrentPcbViaWriteNoResourceProof, CurrentPcbViaWriteOwner, assertOriginalCurrentPcbViaWriteOwner, currentPcbViaWriteAllocationOutcome, originalCurrentPcbViaWriteTarget } from "./current-pcb-via-write-owner.ts";

export const CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES = ["baseline", "allocation", "launch", "main", "opening", "sdk", "preflight",
  "native-before", "scene-before", "create", "native-after", "scene-after", "effect", "save", "close", "exit", "closed-sql",
  "reopen", "reopened-native", "reopened-scene", "reopen-close", "reopen-exit", "reopened-sql", "complete"] as const;
export type CurrentPcbViaWriteJournalStage = typeof CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES[number];
type Kind = "no-process-release-intent" | "no-process-release-result" | "operation-intent" | "failure" | "no-allocation" | "allocation-refused" | "abort-intent" | "abort-result" | "termination-intent" |
  "termination-result" | "release-intent" | "release-result" | `${CurrentPcbViaWriteJournalStage}-${"intent" | "result"}`;
const legacyProfile = "private.pcb209-via-write-journal.v1", maximumRecordBytes = 65_536, maximumRecords = 64, profile = "private.pcb209-via-write-journal.v2";
const kinds = new Set<string>(["no-process-release-intent", "no-process-release-result", "operation-intent", "failure", "no-allocation", "allocation-refused", "abort-intent", "abort-result", "termination-intent",
  "termination-result", "release-intent", "release-result", ...CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES.flatMap(stage => [`${stage}-intent`, `${stage}-result`])]);
const hash = z.string().regex(/^[a-f\d]{64}$/u);
const entrySchema = z.strictObject({ schema: z.enum(["easyeda-pro-control.pcb209-via-write-record.v1", "easyeda-pro-control.pcb209-via-write-record.v2"]),
  operationId: z.string().max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  sequence: z.number().int().nonnegative().max(maximumRecords - 1), previousSha256: hash.nullable(),
  kind: z.custom<Kind>((value): value is Kind => typeof value === "string" && kinds.has(value)),
  evidence: z.record(z.string(), z.unknown()), inverseAvailable: z.literal(false),
}).refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= maximumRecordBytes &&
  (!["allocation-refused", "no-process-release-intent", "no-process-release-result"].includes(value.kind) || value.schema === "easyeda-pro-control.pcb209-via-write-record.v2"));
type Entry = z.infer<typeof entrySchema>;
const artifactSchema = z.strictObject({ path: z.string().max(4096), sha256: hash, bytes: z.number().int().positive().max(maximumRecordBytes) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_WRITE_JOURNAL_${code}`); } }
function terminal(kind: Kind | undefined): boolean { return kind === "complete-result" || kind === "no-allocation" || kind === "allocation-refused"; }
function resultEvidence(entry: Entry): void {
  if (entry.kind === "no-process-release-intent") {
    z.strictObject({ generation: z.enum(["writer", "readback"]), originalFactoryVerified: z.literal(true), rootNeverCreated: z.literal(true), jobEmpty: z.literal(true),
      releaseOriginalHelperOnly: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "no-process-release-result") {
    z.strictObject({ generation: z.enum(["writer", "readback"]), originalFactoryVerified: z.literal(true), rootNeverCreated: z.literal(true), jobEmpty: z.literal(true),
      helperReleaseVerified: z.literal(true), designCompletionClaimed: z.literal(false), readbackCompletionClaimed: z.literal(false) }).parse(entry.evidence);
  }
  if (entry.kind === "allocation-refused") {
    z.strictObject({ allocationIntentPublished: z.literal(true), nativeAllocationNeverEntered: z.literal(true), originalFactoryNoResourceVerified: z.literal(true),
      originalProcessExitClaimed: z.literal(false), nativeOwnershipTransferred: z.literal(false) }).parse(entry.evidence);
  }
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
      (previous === null || entry.operationId === previous.operationId && entry.schema === previous.schema) && !seen.has(entry.kind) && !terminal(previous?.kind), "CHAIN");
    if (index === 0) { need(entry.kind === "operation-intent", "FIRST"); }
    else if (entry.kind === "failure") { need(!failed, "DUPLICATE_FAILURE"); failed = true; }
    else if (entry.kind === "no-allocation") {
      need(failed && !seen.has("allocation-intent") && entry.evidence["allocationNeverEntered"] === true, "NO_ALLOCATION");
    } else if (entry.kind === "allocation-refused") {
      need(failed && previous?.kind === "failure" && pending === "allocation" && seen.has("allocation-intent") && !seen.has("allocation-result") && !seen.has("launch-intent"), "ORIGINAL_FACTORY_REFUSAL");
    } else if (entry.kind === "no-process-release-intent" || entry.kind === "no-process-release-result") {
      need(failed && ![...seen].some(kind => /^(?:abort|termination|release)-/u.test(kind)), "NO_PROCESS_AFTER_FAILURE_ONLY");
      if (entry.kind === "no-process-release-result") {
        need(seen.has("no-process-release-intent") && previous?.kind === "no-process-release-intent" && previous.evidence["generation"] === entry.evidence["generation"], "NO_PROCESS_RELEASE_INTENT");
      }
    } else if (entry.kind.startsWith("abort-") || entry.kind.startsWith("termination-") || entry.kind.startsWith("release-")) {
      need(failed && !seen.has("no-process-release-intent") && !seen.has("no-process-release-result"), "CLEANUP_BEFORE_FAILURE");
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
  const operation = z.looseObject({ operationId: z.string(), plan: z.looseObject({ profile: z.enum([legacyProfile, profile]) }), planHash: hash,
    records: z.array(entrySchema).max(maximumRecords), state: z.enum(["completed", "prepared"]),
    artifacts: z.array(artifactSchema).max(maximumRecords) }).parse(input);
  const records = operation.records; assertCurrentPcbViaWriteJournalChain(records);
  need(operation.state === (terminal(records.at(-1)?.kind) ? "completed" : "prepared") &&
    records.every(entry => entry.operationId === operation.operationId && entry.schema === (operation.plan.profile === legacyProfile ?
      "easyeda-pro-control.pcb209-via-write-record.v1" : "easyeda-pro-control.pcb209-via-write-record.v2")), "MANIFEST_STATE");
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
  readonly stage: "create" | "save"; readonly sequence: number; consumed: boolean; enrolled: boolean }
const dispatches = new WeakMap<CurrentPcbViaWriteDispatch, Dispatch>();
export interface CurrentPcbViaPollingCancellationIntent { readonly profile: "private.current-pcb-via-polling-cancellation-intent.v1" }
interface PollingIntent { readonly journal: CurrentPcbViaWriteJournal; readonly owner: object; readonly plan: CurrentPcbViaWritePlan;
  readonly sequence: number; consumed: boolean; enrolled: boolean }
const pollingIntents = new WeakMap<CurrentPcbViaPollingCancellationIntent, PollingIntent>();
export interface CurrentPcbViaPollingCancellationEnrollment {
  readonly assertCurrent: () => void; readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void; readonly assertPublished: () => Promise<void>;
}
export function requireOriginalCurrentPcbViaPollingCancellationIntent(token: CurrentPcbViaPollingCancellationIntent, owner: object, plan: CurrentPcbViaWritePlan): void {
  const original = pollingIntents.get(token);
  need(original !== undefined && original.owner === owner && original.plan === plan, "ORIGINAL_POLLING_INTENT");
  requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireRetainedDispatchIntent("opening", original.sequence);
}
/** Arming retains the original opening intent without spending the distinct
 * effectful cancellation. Its target timer is never a caller argument. */
export function enrollCurrentPcbViaPollingCancellationIntent(token: CurrentPcbViaPollingCancellationIntent, owner: object,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaPollingCancellationEnrollment {
  const original = pollingIntents.get(token);
  need(original !== undefined && original.owner === owner && original.plan === plan && !original.consumed && !original.enrolled, "ORIGINAL_POLLING_ENROLLMENT");
  const before = (): void => { need(pollingIntents.get(token) === original && !original.consumed, "POLLING_BEFORE_ATTEMPT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireDispatchIntent("opening", original.sequence); };
  before(); original.enrolled = true;
  const current = (): void => { need(pollingIntents.get(token) === original && original.enrolled, "ORIGINAL_POLLING_ENROLLMENT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireRetainedDispatchIntent("opening", original.sequence); };
  return Object.freeze({ assertCurrent: current, assertBeforeAttempt: before,
    assertOriginalAttempted: (): void => { current(); need(original.consumed, "POLLING_ORIGINAL_ATTEMPT_REQUIRED"); },
    assertPublished: async (): Promise<void> => { current(); await original.journal.assertCurrent(); current(); } });
}
/** Only the actual effect request consumes this slot, synchronously before its
 * first await. Missing acknowledgment can never refund or replace the marker. */
export function consumeCurrentPcbViaPollingCancellationIntent(token: CurrentPcbViaPollingCancellationIntent, owner: object,
  plan: CurrentPcbViaWritePlan): Readonly<{ assertPublished: () => Promise<void> }> {
  const original = pollingIntents.get(token);
  need(original !== undefined && original.owner === owner && original.plan === plan && original.enrolled && !original.consumed, "ORIGINAL_POLLING_DISPATCH");
  original.journal.requireDispatchIntent("opening", original.sequence); requireOriginalCurrentPcbViaWritePlan(plan); original.consumed = true;
  return Object.freeze({ assertPublished: (): Promise<void> => original.journal.assertCurrent() });
}
const journals = new WeakMap<CurrentPcbViaWriteJournal, CurrentPcbViaWritePlan>();
/** Fixed nested workflows share only this original operation's publication
 * journal. Equal JSON, another genuine plan and a copied instance refuse. */
export function assertOriginalCurrentPcbViaWriteJournal(journal: CurrentPcbViaWriteJournal, plan: CurrentPcbViaWritePlan): void {
  need(journals.get(journal) === plan, "ORIGINAL_JOURNAL_AND_PLAN"); requireOriginalCurrentPcbViaWritePlan(plan);
}
/** The actual native owner must pass itself before its first dispatch await.
 * A token bound to another owner or a copied plan cannot spend this slot. */
export function consumeCurrentPcbViaWriteDispatch(token: CurrentPcbViaWriteDispatch, stage: "create" | "save", owner: object,
  plan: CurrentPcbViaWritePlan): Readonly<{ assertPublished: () => Promise<void> }> {
  const original = dispatches.get(token);
  need(original !== undefined && !original.consumed && original.owner === owner && original.plan === plan && original.stage === stage, "ORIGINAL_DISPATCH");
  original.journal.requireDispatchIntent(stage, original.sequence); requireOriginalCurrentPcbViaWritePlan(plan); original.consumed = true;
  return Object.freeze({ assertPublished: (): Promise<void> => original.journal.assertCurrent() });
}
export interface CurrentPcbViaCreateIntentEnrollment {
  readonly assertCurrent: () => void;
  readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void;
  readonly assertPublished: () => Promise<void>;
}
/** Prospective custody of one already-published original create intent.
 * Enrollment never spends or refunds the separate actual dispatch slot. */
export function enrollCurrentPcbViaWriteCreateIntent(token: CurrentPcbViaWriteDispatch, owner: object,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaCreateIntentEnrollment {
  const original = dispatches.get(token);
  need(original !== undefined && original.owner === owner && original.plan === plan && original.stage === "create" && !original.consumed && !original.enrolled, "ORIGINAL_CREATE_ENROLLMENT");
  const before = (): void => { need(dispatches.get(token) === original && !original.consumed, "CREATE_ENROLLMENT_BEFORE_ATTEMPT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireDispatchIntent("create", original.sequence); };
  before(); original.enrolled = true;
  const current = (): void => { need(dispatches.get(token) === original && original.enrolled, "ORIGINAL_CREATE_ENROLLMENT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireRetainedDispatchIntent("create", original.sequence); };
  return Object.freeze({ assertCurrent: current, assertBeforeAttempt: before,
    assertOriginalAttempted: (): void => { current(); need(original.consumed, "CREATE_ENROLLMENT_ORIGINAL_ATTEMPT_REQUIRED"); },
    assertPublished: async (): Promise<void> => { current(); await original.journal.assertCurrent(); current(); } });
}
/** Separate prospective custody for the one published Save marker. It does
 * not stand in for an effect, observer arm, SQL grant or native attempt. */
export interface CurrentPcbViaSaveIntentEnrollment {
  readonly assertCurrent: () => void;
  readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void;
  readonly assertPublished: () => Promise<void>;
}
export function enrollCurrentPcbViaWriteSaveIntent(token: CurrentPcbViaWriteDispatch, owner: object,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaSaveIntentEnrollment {
  const original = dispatches.get(token);
  need(original !== undefined && original.owner === owner && original.plan === plan && original.stage === "save" && !original.consumed && !original.enrolled, "ORIGINAL_SAVE_ENROLLMENT");
  const before = (): void => { need(dispatches.get(token) === original && !original.consumed, "SAVE_ENROLLMENT_BEFORE_ATTEMPT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireDispatchIntent("save", original.sequence); };
  before(); original.enrolled = true;
  const current = (): void => { need(dispatches.get(token) === original && original.enrolled, "ORIGINAL_SAVE_ENROLLMENT"); requireOriginalCurrentPcbViaWritePlan(plan); original.journal.requireRetainedDispatchIntent("save", original.sequence); };
  return Object.freeze({ assertCurrent: current, assertBeforeAttempt: before,
    assertOriginalAttempted: (): void => { current(); need(original.consumed, "SAVE_ENROLLMENT_ORIGINAL_ATTEMPT_REQUIRED"); },
    assertPublished: async (): Promise<void> => { current(); await original.journal.assertCurrent(); current(); } });
}
interface OriginalWriterNoProcessRelease {
  readonly owner: CurrentPcbViaWriteOwner;
  readonly native: Readonly<{ assertOriginalCurrentPcbViaWriteOwner: typeof assertOriginalCurrentPcbViaWriteOwner; currentPcbViaWriteAllocationOutcome: typeof currentPcbViaWriteAllocationOutcome; originalCurrentPcbViaWriteTarget: typeof originalCurrentPcbViaWriteTarget }>;
  readonly assertOwner: typeof assertOriginalCurrentPcbViaWriteOwner;
  readonly target: typeof originalCurrentPcbViaWriteTarget;
  readonly allocation: typeof currentPcbViaWriteAllocationOutcome;
  readonly prepared: ReturnType<typeof originalCurrentPcbViaWriteTarget>;
  readonly mode: "unlaunched" | "native-refused"; resultAttempted: boolean;
}
interface OriginalReaderNoProcessRelease {
  readonly owner: CurrentPcbViaSavedReadbackOwner;
  readonly native: Readonly<{ assertOriginalCurrentPcbViaSavedReadbackOwner: typeof assertOriginalCurrentPcbViaSavedReadbackOwner; originalCurrentPcbViaSavedReadbackTarget: typeof originalCurrentPcbViaSavedReadbackTarget }>;
  readonly checkpoint: Readonly<{ requireOriginalCurrentPcbViaWriteClosedCheckpoint: typeof requireOriginalCurrentPcbViaWriteClosedCheckpoint }>;
  readonly assertOwner: typeof assertOriginalCurrentPcbViaSavedReadbackOwner;
  readonly target: typeof originalCurrentPcbViaSavedReadbackTarget;
  readonly requireCheckpoint: typeof requireOriginalCurrentPcbViaWriteClosedCheckpoint;
  readonly prepared: ReturnType<typeof originalCurrentPcbViaSavedReadbackTarget>;
  readonly mode: "unlaunched" | "native-refused"; resultAttempted: boolean;
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
  #allocationRefusalAttempted = false;
  #readerNoProcess: OriginalReaderNoProcessRelease | null = null;
  #noProcessGeneration: "writer" | "readback" | null = null;
  #writerNoProcess: OriginalWriterNoProcessRelease | null = null;
  #busy = false;
  #idle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  readonly #dispatchTokens = new Map<"create" | "save", CurrentPcbViaWriteDispatch>();
  #pollingIntent: CurrentPcbViaPollingCancellationIntent | null = null;
  public constructor(plan: CurrentPcbViaWritePlan) {
    requireOriginalCurrentPcbViaWritePlan(plan); this.#plan = plan;
    const data = { profile, plan, nonce: randomBytes(32).toString("hex") };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: plan.operationId, plan: data, planHash: buildPlanHash(data), state: "prepared", records: [], artifacts: [] };
    journals.set(this, plan); Object.freeze(this);
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
    const entry = freezeDeep(entrySchema.parse({ schema: "easyeda-pro-control.pcb209-via-write-record.v2", operationId: this.#plan.operationId,
      sequence: records.length, previousSha256, kind, evidence, inverseAvailable: false }));
    const descriptor = artifact(entry), next = { ...this.#operation, records: [...records, entry], artifacts: [...this.#operation.artifacts ?? [], descriptor],
      state: terminal(kind) ? "completed" : "prepared" };
    entries(next); this.#pending = Object.freeze({ entry, descriptor, next });
  }
  public async append(kind: Kind, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    need(!["allocation-refused", "no-process-release-intent", "no-process-release-result"].includes(kind), "ORIGINAL_NO_RESOURCE_PROOF_REQUIRED");
    await this.#exclusive(async (): Promise<void> => { await this.#assertCurrent(); this.#queue(kind, evidence); await this.#settle(); });
  }
  /** This one new terminal differs from the immutable v1 pre-intent refusal.
   * Only the original factory's never-allocated state can issue its evidence.
   * Lost publication joins the same pending record through settlePublication. */
  public async recordAllocationRefusal(proof: CurrentPcbViaWriteNoResourceProof): Promise<void> {
    need(!this.#allocationRefusalAttempted && !this.#busy && this.#pending === null, "ALLOCATION_REFUSAL_CONSUMED"); this.#allocationRefusalAttempted = true;
    await this.#exclusive(async (): Promise<void> => {
      const native = await import("./current-pcb-via-write-owner.ts"); const requireProof = native.requireOriginalCurrentPcbViaWriteNoResourceProof;
      requireProof(proof, this.#plan);
      await this.#assertCurrent(); need(native.requireOriginalCurrentPcbViaWriteNoResourceProof === requireProof, "ORIGINAL_NO_RESOURCE_ISSUER"); requireProof(proof, this.#plan);
      this.#queue("allocation-refused", { allocationIntentPublished: true, nativeAllocationNeverEntered: true, originalFactoryNoResourceVerified: true,
        originalProcessExitClaimed: false, nativeOwnershipTransferred: false }); await this.#settle(); requireProof(proof, this.#plan);
    });
  }
  #requireWriterNoProcess(context: OriginalWriterNoProcessRelease, released: boolean): void {
    need(this.#noProcessGeneration === "writer" && this.#writerNoProcess === context && this.#owner === context.owner &&
      context.native.assertOriginalCurrentPcbViaWriteOwner === context.assertOwner && context.native.currentPcbViaWriteAllocationOutcome === context.allocation &&
      context.native.originalCurrentPcbViaWriteTarget === context.target, "ORIGINAL_WRITER_MODULES");
    context.assertOwner(context.owner); const allocation = context.allocation(context.prepared);
    need(context.target(context.owner) === context.prepared && requireOriginalCurrentPcbViaWritePlan(this.#plan).prepared === context.prepared && allocation.owner === context.owner && allocation.state === "retained", "ORIGINAL_WRITER_TARGET");
    const state = context.owner.status(); need(state.binding === null && state.launchConsumed === (context.mode === "native-refused"), "ORIGINAL_WRITER_NO_ROOT");
    if (released) { need(state.released && state.helperClosed, "ORIGINAL_WRITER_RELEASE_ACK"); }
    else { need(!state.released && !state.helperClosed && (context.mode === "unlaunched" || state.noProcessCleanupAvailable), "ORIGINAL_WRITER_NO_PROCESS"); }
  }
  public async recordWriterNoProcessReleaseIntent(owner: CurrentPcbViaWriteOwner): Promise<void> {
    need(this.#noProcessGeneration === null && !this.#busy && this.#pending === null, "ORIGINAL_WRITER_RELEASE_CONSUMED"); this.#noProcessGeneration = "writer";
    await this.#exclusive(async (): Promise<void> => {
      const native = await import("./current-pcb-via-write-owner.ts"); native.assertOriginalCurrentPcbViaWriteOwner(owner);
      const prepared = native.originalCurrentPcbViaWriteTarget(owner), state = owner.status();
      need(this.#owner === owner && state.binding === null && !state.released && !state.helperClosed && (!state.launchConsumed || state.noProcessCleanupAvailable), "ORIGINAL_WRITER_NO_PROCESS");
      const context: OriginalWriterNoProcessRelease = { owner, native, assertOwner: native.assertOriginalCurrentPcbViaWriteOwner,
        target: native.originalCurrentPcbViaWriteTarget, allocation: native.currentPcbViaWriteAllocationOutcome, prepared,
        mode: state.launchConsumed ? "native-refused" : "unlaunched", resultAttempted: false }; this.#writerNoProcess = context;
      this.#requireWriterNoProcess(context, false); await this.#assertCurrent(); this.#requireWriterNoProcess(context, false);
      this.#queue("no-process-release-intent", { generation: "writer", originalFactoryVerified: true, rootNeverCreated: true, jobEmpty: true, releaseOriginalHelperOnly: true });
      await this.#settle(); this.#requireWriterNoProcess(context, false);
    });
  }
  public requireWriterNoProcessReleaseReady(owner: CurrentPcbViaWriteOwner): void {
    const context = this.#writerNoProcess;
    need(context !== null && context.owner === owner && !context.resultAttempted && !this.#busy && this.#pending === null &&
      entries(this.#operation).at(-1)?.kind === "no-process-release-intent", "ORIGINAL_WRITER_RELEASE_INTENT"); this.#requireWriterNoProcess(context, false);
  }
  public async recordWriterNoProcessReleaseResult(owner: CurrentPcbViaWriteOwner): Promise<void> {
    const context = this.#writerNoProcess;
    need(context !== null && context.owner === owner && !context.resultAttempted && !this.#busy && this.#pending === null, "ORIGINAL_WRITER_RELEASE_CONSUMED"); context.resultAttempted = true;
    await this.#exclusive(async (): Promise<void> => { this.#requireWriterNoProcess(context, true); await this.#assertCurrent(); this.#requireWriterNoProcess(context, true);
      this.#queue("no-process-release-result", { generation: "writer", originalFactoryVerified: true, rootNeverCreated: true, jobEmpty: true, helperReleaseVerified: true,
        designCompletionClaimed: false, readbackCompletionClaimed: false }); await this.#settle(); this.#requireWriterNoProcess(context, true); });
  }
  #requireReaderNoProcess(context: OriginalReaderNoProcessRelease, released: boolean): void {
    need(this.#noProcessGeneration === "readback" && this.#readerNoProcess === context && context.native.assertOriginalCurrentPcbViaSavedReadbackOwner === context.assertOwner &&
      context.native.originalCurrentPcbViaSavedReadbackTarget === context.target && context.checkpoint.requireOriginalCurrentPcbViaWriteClosedCheckpoint === context.requireCheckpoint, "ORIGINAL_READER_MODULES");
    context.assertOwner(context.owner); need(context.target(context.owner) === context.prepared && context.requireCheckpoint(context.prepared).plan === this.#plan, "ORIGINAL_READER_TARGET");
    const state = context.owner.status(); need(state.binding === null && state.launchConsumed === (context.mode === "native-refused"), "ORIGINAL_READER_NO_ROOT");
    if (released) { need(state.released && state.helperClosed, "ORIGINAL_READER_RELEASE_ACK"); }
    else { need(!state.released && !state.helperClosed && (context.mode === "unlaunched" || state.noProcessCleanupAvailable), "ORIGINAL_READER_NO_PROCESS"); }
  }
  /** A separate v2 cleanup records absence of root creation honestly. It
   * cannot borrow a terminated writer or manufacture rootExited evidence. */
  public async recordReaderNoProcessReleaseIntent(owner: CurrentPcbViaSavedReadbackOwner): Promise<void> {
    need(this.#noProcessGeneration === null && !this.#busy && this.#pending === null, "ORIGINAL_READER_RELEASE_CONSUMED"); this.#noProcessGeneration = "readback";
    await this.#exclusive(async (): Promise<void> => {
      const checkpoint = await import("./current-pcb-via-write-closed-checkpoint.ts"), native = await import("./current-pcb-via-saved-readback-owner.ts");
      native.assertOriginalCurrentPcbViaSavedReadbackOwner(owner); const prepared = native.originalCurrentPcbViaSavedReadbackTarget(owner);
      need(checkpoint.requireOriginalCurrentPcbViaWriteClosedCheckpoint(prepared).plan === this.#plan, "ORIGINAL_READER_TARGET");
      const state = owner.status(); need(state.binding === null && !state.released && !state.helperClosed && (!state.launchConsumed || state.noProcessCleanupAvailable), "ORIGINAL_READER_NO_PROCESS");
      const context: OriginalReaderNoProcessRelease = { owner, native, checkpoint, assertOwner: native.assertOriginalCurrentPcbViaSavedReadbackOwner,
        target: native.originalCurrentPcbViaSavedReadbackTarget, requireCheckpoint: checkpoint.requireOriginalCurrentPcbViaWriteClosedCheckpoint, prepared,
        mode: state.launchConsumed ? "native-refused" : "unlaunched", resultAttempted: false }; this.#readerNoProcess = context;
      this.#requireReaderNoProcess(context, false); await this.#assertCurrent(); this.#requireReaderNoProcess(context, false);
      this.#queue("no-process-release-intent", { generation: "readback", originalFactoryVerified: true, rootNeverCreated: true, jobEmpty: true, releaseOriginalHelperOnly: true });
      await this.#settle(); this.#requireReaderNoProcess(context, false);
    });
  }
  public requireReaderNoProcessReleaseReady(owner: CurrentPcbViaSavedReadbackOwner): void {
    const context = this.#readerNoProcess;
    need(context !== null && context.owner === owner && !context.resultAttempted && !this.#busy && this.#pending === null &&
      entries(this.#operation).at(-1)?.kind === "no-process-release-intent", "ORIGINAL_READER_RELEASE_INTENT");
    this.#requireReaderNoProcess(context, false);
  }
  public async recordReaderNoProcessReleaseResult(owner: CurrentPcbViaSavedReadbackOwner): Promise<void> {
    const context = this.#readerNoProcess;
    need(context !== null && context.owner === owner && !context.resultAttempted && !this.#busy && this.#pending === null, "ORIGINAL_READER_RELEASE_CONSUMED");
    context.resultAttempted = true;
    await this.#exclusive(async (): Promise<void> => { this.#requireReaderNoProcess(context, true); await this.#assertCurrent(); this.#requireReaderNoProcess(context, true);
      this.#queue("no-process-release-result", { generation: "readback", originalFactoryVerified: true, rootNeverCreated: true, jobEmpty: true, helperReleaseVerified: true,
        designCompletionClaimed: false, readbackCompletionClaimed: false }); await this.#settle(); this.#requireReaderNoProcess(context, true); });
  }
  public async appendIntent(stage: "create" | "save", evidence: Readonly<Record<string, unknown>>, owner: object): Promise<CurrentPcbViaWriteDispatch> {
    need(this.#owner === owner && !this.#busy && this.#pending === null && !this.#dispatchTokens.has(stage), "WRITER_BINDING");
    const sequence = entries(this.#operation).length, token = Object.freeze({ profile: "private.current-pcb-via-write-dispatch.v1" as const });
    dispatches.set(token, { journal: this, owner, plan: this.#plan, stage, sequence, consumed: false, enrolled: false }); this.#dispatchTokens.set(stage, token);
    await this.append(`${stage}-intent`, evidence); return this.retainedDispatchIntent(stage);
  }
  /** Reserve the entire fixed opening and this temporary first-timer action.
   * No timer ID, expression, callback, receiver or caller program is accepted. */
  public async appendPollingCancellationIntent(owner: object): Promise<CurrentPcbViaPollingCancellationIntent> {
    need(this.#owner === owner && !this.#busy && this.#pending === null && this.#pollingIntent === null, "POLLING_ORIGINAL_WRITER");
    const sequence = entries(this.#operation).length, token: CurrentPcbViaPollingCancellationIntent = Object.freeze({ profile: "private.current-pcb-via-polling-cancellation-intent.v1" });
    pollingIntents.set(token, { journal: this, owner, plan: this.#plan, sequence, consumed: false, enrolled: false }); this.#pollingIntent = token;
    await this.append("opening-intent", { temporarySessionMutation: true, scope: "original-first-checkProject-timer-only", arbitraryTimerSelection: false,
      firstOriginalEntryAndReturnRequired: true, originalNativeClearTimeoutRequired: true, generationExitEndsTemporaryScope: true });
    return this.retainedPollingCancellationIntent();
  }
  public retainedPollingCancellationIntent(): CurrentPcbViaPollingCancellationIntent {
    const token = this.#pollingIntent; const original = token === null ? undefined : pollingIntents.get(token);
    need(token !== null && original !== undefined && !original.consumed, "ORIGINAL_POLLING_DISPATCH"); this.requireDispatchIntent("opening", original.sequence); return token;
  }
  /** Publication settlement can return the same original unconsumed marker.
   * It never allocates a replacement marker or repeats a native attempt. */
  public retainedDispatchIntent(stage: "create" | "save"): CurrentPcbViaWriteDispatch {
    const token = this.#dispatchTokens.get(stage);
    const original = token === undefined ? undefined : dispatches.get(token);
    need(token !== undefined && original !== undefined && !original.consumed, "ORIGINAL_DISPATCH");
    this.requireDispatchIntent(stage, original.sequence); return token;
  }
  public requireDispatchIntent(stage: "create" | "save" | "opening", sequence: number): void {
    need(!this.#busy && this.#pending === null && this.#reserved, "PUBLICATION_PENDING"); const last = entries(this.#operation).at(-1);
    need(last?.kind === `${stage}-intent` && last.sequence === sequence, "CURRENT_DISPATCH_INTENT");
  }
  /** Original marker remains historical evidence after its one dispatch or
   * later journal stages. It cannot become an unconsumed marker again. */
  public requireRetainedDispatchIntent(stage: "create" | "save" | "opening", sequence: number): void {
    need(!this.#busy && this.#pending === null && this.#reserved, "PUBLICATION_PENDING");
    const record = entries(this.#operation)[sequence]; need(record?.kind === `${stage}-intent` && record.sequence === sequence, "RETAINED_DISPATCH_INTENT");
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
  if (!(typeof id === "string" && id.startsWith("pcb209-via-write-")) && !(isRecord(data) && (data["profile"] === profile || data["profile"] === legacyProfile))) {
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

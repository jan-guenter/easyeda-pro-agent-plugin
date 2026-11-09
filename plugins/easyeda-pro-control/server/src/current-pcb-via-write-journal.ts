/** Original operation publication and once-only create/Save intent. Artifact
 * JSON remains historical evidence and cannot recreate an owner or dispatch. */
import { randomBytes } from "node:crypto";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaPreopeningHistoricalSnapshot } from "./current-pcb-via-preopening-relinquishment-journal.ts";
import { artifact, entries, entrySchema, legacyProfile, profile, terminal } from "./current-pcb-via-write-journal-codec.ts";
import type { Entry, Kind } from "./current-pcb-via-write-journal-codec.ts";

import type { requireOriginalCurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaSavedReadbackOwner, assertOriginalCurrentPcbViaSavedReadbackOwner, originalCurrentPcbViaSavedReadbackTarget } from "./current-pcb-via-saved-readback-owner.ts";
import type { CurrentPcbViaWriteNoResourceProof, CurrentPcbViaWriteOwner, assertOriginalCurrentPcbViaWriteOwner, currentPcbViaWriteAllocationOutcome, originalCurrentPcbViaWriteTarget } from "./current-pcb-via-write-owner.ts";

export { CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES, assertCurrentPcbViaWriteJournalChain, currentPcbViaWriteHistoricalTerminal } from "./current-pcb-via-write-journal-codec.ts";
export type { CurrentPcbViaWriteJournalStage } from "./current-pcb-via-write-journal-codec.ts";

function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_WRITE_JOURNAL_${code}`); } }
function manifestCore(operation: OperationJournal): string {
  const { journalSha256: _hash, integrityModel: _model, ...value } = operation; return canonicalJson(value);
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
  need(typeof id === "string" && typeof operation["journalSha256"] === "string" && /^[a-f\d]{64}$/u.test(operation["journalSha256"]), "RESERVED_OPERATION");
  return { operationId: id, storedJournalSha256: operation["journalSha256"], entireStoredJournalSha256: sha256Json(operation) };
});
export async function assertNoUnresolvedCurrentPcbViaWrites(except?: CurrentPcbViaWriteJournal): Promise<void> {
  if (except !== undefined) { need(journals.has(except), "ORIGINAL_EXCEPTION"); await except.assertCurrent(); }
  const exceptId = except?.retained().records[0]?.operationId;
  const { inspectCurrentPcbViaWriteAdmission } = await import("./current-pcb-via-write-admission.ts");
  for (const row of await scan()) { if (row.operationId !== exceptId) {
    const qualified = await inspectCurrentPcbViaWriteAdmission(row); need(qualified.terminal || qualified.abandoned === true, "UNRESOLVED_OPERATION"); }
  }
  if (except !== undefined) { await except.assertCurrent(); }
}

/** A separate historical resolver can exempt only its reader-issued complete
 * failed-main snapshot. Normal writer admission has no such selector. */
export async function assertCurrentPcbViaPreopeningRelinquishmentIsolated(
  snapshot: CurrentPcbViaPreopeningHistoricalSnapshot,
): Promise<void> {
  const { assertCurrentPcbViaPreopeningHistoricalSnapshot, requireCurrentPcbViaPreopeningHistoricalSnapshot } = await import("./current-pcb-via-preopening-relinquishment-journal.ts");
  const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(snapshot); await assertCurrentPcbViaPreopeningHistoricalSnapshot(snapshot);
  const { inspectCurrentPcbViaWriteAdmission } = await import("./current-pcb-via-write-admission.ts"); let found = false;
  for (const row of await scan()) {
    if (row.operationId === original.operationId) {
      need(row.entireStoredJournalSha256 === original.originalEntireJournalSha256 && row.storedJournalSha256 === original.originalStoredJournalSha256, "HISTORICAL_ORIGINAL_CHANGED"); found = true;
    } else { const result = await inspectCurrentPcbViaWriteAdmission(row); need(result.terminal || result.abandoned === true, "UNRESOLVED_OPERATION"); }
  }
  need(found, "HISTORICAL_ORIGINAL_MISSING"); await assertCurrentPcbViaPreopeningHistoricalSnapshot(snapshot);
}

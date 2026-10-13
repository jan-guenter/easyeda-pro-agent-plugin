/** Private closed-session SQL stages. No writer, restored proof or completion grant. */
/* oxlint-disable import/max-dependencies -- Bind actual witness, writer, copy, clock and managed journal owners directly; forwarding imports would hide the original-object boundaries. */
import { assertOriginalClosedSymbolWitness } from "./closed-symbol-witness.ts";
// oxlint-disable-next-line import/no-cycle -- Fixed original-owner lookups follow prepare -> write -> compare after ESM initialization; there are no top-level invocations or public registration hooks.
import { assertOriginalClosedSymbolWrite } from "./closed-symbol-write.ts";
import type { OriginalClosedSymbolWrite } from "./closed-symbol-write.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { ProjectSymbolMetadataPlan } from "./project-symbol-metadata.ts";
import { metadataPlanForOriginalSymbolSqlPlan, prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "./symbol-sql-comparator.ts";
import type { SymbolNewHeadSqlPlan } from "./symbol-sql-comparator.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof, IssuedWindowsClockObservation } from "./windows-authority.ts";
import { bindClosedSqlCopy, readWitnessClockArtifact, sqlDigests } from "./closed-sql-bindings.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { qualifyClosedSymbolTerminationClock } from "./closed-sql-clock.ts";
import type { Inventory } from "./closed-sql-equality.ts";

export interface PreparedClosedSymbolSql {
  readonly profile: "private.closed-symbol-prepared-sql.v1";
  readonly operationId: string; readonly closedPlanSha256: string;
  readonly baselineCopyReceiptSha256: string; readonly baselineSqlSha256: string; readonly baselineArtifactSha256: string;
  readonly witnessArtifactSha256: string; readonly witnessSha256: string; readonly operationSha256: string;
  readonly witnessClockArtifactSha256: string; readonly witnessClockArtifact: Readonly<ArtifactDescriptor>;
  readonly metadataPlan: Readonly<ProjectSymbolMetadataPlan>; readonly metadataPlanSha256: string;
  readonly sqlPlan: SymbolNewHeadSqlPlan; readonly preparedSqlPlanSha256: string;
  readonly producerBindingVerified: false; readonly executionAuthorized: false; readonly completionProved: false;
}
export interface ClosedSymbolSqlComparison {
  readonly profile: "private.closed-symbol-sql-comparison-stage.v1";
  readonly operationId: string; readonly phase: "edit-sql-compare" | "verify-sql-compare";
  readonly preparedSqlPlanSha256: string; readonly copyReceiptSha256: string;
  readonly comparison: Readonly<Record<string, unknown>>; readonly resultSha256: string;
  readonly producerBindingVerified: false; readonly executionAuthorized: false; readonly completionProved: false;
}
export interface OriginalClosedSymbolEditSource {
  readonly comparison: ClosedSymbolSqlComparison; readonly comparisonArtifactSha256: string;
  readonly preparation: PreparedClosedSymbolSql; readonly copy: ClosedFileCopyReceipt; readonly inventory: Inventory;
}
interface PreparedSlot {
  readonly descriptor: PreparedClosedSymbolSql; readonly text: string;
  readonly baselineCopy: ClosedFileCopyReceipt; readonly baselineInventory: Inventory;
  readonly witnessResult: unknown; readonly witnessText: string; readonly generationText: string;
  ready: boolean;
}
interface ComparisonSlot {
  readonly result: ClosedSymbolSqlComparison; readonly text: string;
  readonly preparation: PreparedSlot; readonly copy: ClosedFileCopyReceipt; readonly inventory: Inventory;
  ready: boolean; artifactSha256: string | undefined;
}
type ClosedInput = Readonly<{ journal: ClosedJournal; copy: ClosedFileCopyReceipt; inventory: Inventory; proof: ClosedSessionTerminationProof }>;
type SqlRuntime = Parameters<typeof readClosedCopySqlInventory>[0]["runtime"];
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>();
const issuedPreparations = new WeakMap<object, {
  readonly engine: EasyedaControlEngine; readonly operationId: string; readonly descriptor: PreparedClosedSymbolSql; readonly text: string;
}>();
const issuedComparisons = new WeakMap<object, {
  readonly engine: EasyedaControlEngine; readonly operationId: string; readonly phase: ClosedSymbolSqlComparison["phase"];
  readonly result: ClosedSymbolSqlComparison; readonly text: string;
  readonly source: OriginalClosedSymbolEditSource; readonly runtime: SqlRuntime;
}>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Fixed issuer lookup, not a caller-selected verifier or class method. */
export function assertOriginalClosedSymbolPreparation(value: unknown, engine: EasyedaControlEngine, operationId: string): PreparedClosedSymbolSql {
  need(value !== null && typeof value === "object", "Original closed SQL preparation missing.");
  const owner = issuedPreparations.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && canonicalJson(value) === owner.text,
    "Closed SQL preparation is not the unchanged original successful preparation.");
  return owner.descriptor;
}

/** Fixed successful-result lookup; inspectable unready returns cannot qualify. */
export function assertOriginalClosedSymbolComparison(value: unknown, engine: EasyedaControlEngine, operationId: string,
  phase: ClosedSymbolSqlComparison["phase"]): ClosedSymbolSqlComparison {
  need(value !== null && typeof value === "object", "Original closed SQL comparison missing.");
  const owner = issuedComparisons.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && owner.phase === phase && canonicalJson(value) === owner.text,
    "Closed SQL comparison is not the unchanged original successful comparison.");
  return owner.result;
}

/** Historical originals only. This lookup never grants current copy authority. */
export function originalClosedSymbolEditSource(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalClosedSymbolEditSource {
  const comparison = assertOriginalClosedSymbolComparison(value, engine, operationId, "edit-sql-compare");
  const owner = issuedComparisons.get(comparison); need(owner !== undefined, "Closed SQL source owner missing.");
  need(assertOriginalClosedSymbolPreparation(owner.source.preparation, engine, operationId) === owner.source.preparation,
    "Closed SQL source preparation changed.");
  return owner.source;
}

/** Fixed original-owner reader; no caller-selected runtime or authority callback. */
export async function revalidateOriginalClosedSymbolEditSource(value: unknown, engine: EasyedaControlEngine, operationId: string): Promise<OriginalClosedSymbolEditSource> {
  const source = originalClosedSymbolEditSource(value, engine, operationId);
  const owner = issuedComparisons.get(source.comparison); need(owner !== undefined, "Closed SQL source owner missing.");
  const current = (): void => { need(originalClosedSymbolEditSource(value, engine, operationId) === source, "Closed SQL source original changed."); };
  const loaded = await loadClosedSymbolJournal(operationId); current();
  const bind = (data: typeof loaded): void => {
    const { journal, events } = data;
    need(!journal.hardStop && !journal.orphanedCallPossible && journal.closedPlanSha256 === source.preparation.closedPlanSha256 &&
      sha256Json(journal.plan.operation) === source.preparation.operationSha256, "Closed SQL source journal/operation changed.");
    bindClosedSqlCopy({ journal, events, phase: "edit-copy", copy: source.copy, inventory: source.inventory });
    const result = events.find((event) => event.step === "edit-sql-compare" && event.kind === "result");
    need(result !== undefined && canonicalJson(result.data) === owner.text &&
      journal.artifacts[result.sequence - 1]?.sha256 === source.comparisonArtifactSha256, "Closed SQL source comparison artifact changed.");
  };
  bind(loaded);
  const reread = await readClosedCopySqlInventory({ copy: source.copy, runtime: owner.runtime }); current();
  await compareCompleteClosedSql(source.inventory, reread); current();
  const final = await loadClosedSymbolJournal(operationId); current(); bind(final);
  need(canonicalJson(final.journal) === canonicalJson(loaded.journal), "Closed SQL source journal changed during revalidation.");
  return source;
}

export class ClosedSymbolSqlComparisonStage {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: SqlRuntime;
  private readonly prepared = new Map<string, PreparedSlot>();
  private readonly comparisons = new Map<string, ComparisonSlot>();
  public constructor(engine: EasyedaControlEngine, runtime: SqlRuntime) { this.engine = engine; this.runtime = structuredClone(runtime); }

  public originalPreparation(operationId: string): PreparedClosedSymbolSql | undefined { return this.prepared.get(operationId)?.descriptor; }
  public assertOriginalPreparation(value: unknown, operationId: string): PreparedClosedSymbolSql {
    const descriptor = assertOriginalClosedSymbolPreparation(value, this.engine, operationId);
    const slot = this.prepared.get(operationId);
    need(slot !== undefined && slot.ready && descriptor === slot.descriptor && canonicalJson(slot.descriptor) === slot.text,
      "Closed SQL preparation is not the unchanged original successful preparation.");
    return slot.descriptor;
  }
  public originalComparison(operationId: string, phase: ClosedSymbolSqlComparison["phase"]): ClosedSymbolSqlComparison | undefined {
    return this.comparisons.get(`${operationId}:${phase}`)?.result;
  }
  private consume(operationId: string, phase: string): void {
    let used = attempts.get(this.engine);
    if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    const key = `${operationId}:${phase}`;
    need(!used.has(key), "Closed SQL stage attempt already consumed."); used.add(key);
  }

  /** Pure plan preparation follows the collector's only edit-witness result.
   * It cannot publish another witness phase or grant permission to dispatch.
   */
  public async prepareForWrite(input: Readonly<{
    journal: ClosedJournal; generation: Generation; witnessResult: unknown;
    baselineCopy: ClosedFileCopyReceipt; baselineInventory: Inventory;
  }>): Promise<PreparedClosedSymbolSql> {
    const operationId = input.journal.operationId;
    const callerText = canonicalJson(input.journal), generationText = canonicalJson(input.generation);
    const copy = input.baselineCopy, inventory = input.baselineInventory, witnessResult = input.witnessResult;
    this.consume(operationId, "prepare");
    const witness = assertOriginalClosedSymbolWitness(witnessResult, this.engine, operationId), witnessText = canonicalJson(witness);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(typeof scopeReader === "function", "Closed SQL preparation cannot inspect bridge scope.");
    const scope = scopeReader.call(this.engine.upstream);
    need(scope !== undefined, "Closed SQL preparation requires its active authenticated scope.");
    const scopeText = canonicalJson(scope);
    const current = (): void => {
      need(input.baselineCopy === copy && input.baselineInventory === inventory && input.witnessResult === witnessResult &&
        canonicalJson(input.journal) === callerText && canonicalJson(input.generation) === generationText, "Closed SQL preparation caller changed.");
      need(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
        canonicalJson(scopeReader.call(this.engine.upstream)) === scopeText, "Closed SQL preparation scope changed.");
      need(canonicalJson(assertOriginalClosedSymbolWitness(witnessResult, this.engine, operationId)) === witnessText, "Closed SQL original witness changed.");
    };
    const { journal, events } = await loadClosedSymbolJournal(operationId); current();
    need(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible, "Closed SQL preparation journal is stale or quarantined.");
    const artifact = journal.artifacts.at(-1), last = events.at(-1);
    need(last?.step === "edit-witness" && last.kind === "result" && canonicalJson(last.generation) === generationText &&
      canonicalJson(witness.generation) === generationText && witness.generation.ordinal === 1 && artifact?.sha256 === witness.artifactSha256,
    "Closed SQL preparation lacks its original witness result.");
    const baseline = bindClosedSqlCopy({ journal, events, phase: "baseline-copy", copy, inventory });
    need(witness.baselineCopyReceiptSha256 === copy.receiptSha256 && witness.baselineLogicalSha256 === inventory.logicalSha256 &&
      witness.operationSha256 === sha256Json(journal.plan.operation) && witness.witness.projectUuid === journal.plan.projectUuid &&
      witness.witness.branchUuid === journal.plan.branchUuid, "Closed SQL witness baseline/operation binding differs.");
    await readWitnessClockArtifact(operationId, witness.clockArtifact, witness.clockArtifactSha256); current();
    await this.engine.assertBridgeDispatchAllowed(); current();
    await this.engine.assertRecoveryOperationIsolated(operationId); current();
    const reread = await readClosedCopySqlInventory({ copy, runtime: this.runtime }); current();
    await compareCompleteClosedSql(inventory, reread); current();
    const sqlPlan = await prepareSymbolNewHeadSqlPlan({ before: inventory, operation: journal.plan.operation, witness: witness.witness });
    const metadataPlan = metadataPlanForOriginalSymbolSqlPlan(sqlPlan);
    const body = { profile: "private.closed-symbol-prepared-sql.v1" as const, operationId, closedPlanSha256: journal.closedPlanSha256,
      baselineCopyReceiptSha256: copy.receiptSha256, baselineSqlSha256: inventory.logicalSha256, baselineArtifactSha256: baseline.resultArtifactSha256,
      witnessArtifactSha256: witness.artifactSha256, witnessSha256: sha256Json(witness.witness), operationSha256: witness.operationSha256,
      witnessClockArtifactSha256: witness.clockArtifactSha256, witnessClockArtifact: witness.clockArtifact,
      metadataPlan, metadataPlanSha256: sha256Json(metadataPlan), sqlPlan,
      producerBindingVerified: false as const, executionAuthorized: false as const, completionProved: false as const };
    const descriptor: PreparedClosedSymbolSql = Object.freeze({ ...body, preparedSqlPlanSha256: sha256Json(body) });
    const slot: PreparedSlot = { descriptor, text: canonicalJson(descriptor), baselineCopy: copy, baselineInventory: inventory,
      witnessResult, witnessText, generationText, ready: false };
    this.prepared.set(operationId, slot);
    current();
    await readWitnessClockArtifact(operationId, witness.clockArtifact, witness.clockArtifactSha256); current();
    const final = await loadClosedSymbolJournal(operationId); current();
    need(canonicalJson(final.journal) === canonicalJson(journal), "Closed SQL preparation journal advanced.");
    slot.ready = true;
    issuedPreparations.set(descriptor, { engine: this.engine, operationId, descriptor, text: slot.text });
    return descriptor;
  }

  public compareEdit(input: ClosedInput & Readonly<{ preparation: PreparedClosedSymbolSql; originalWriteResult: unknown }>): Promise<ClosedSymbolSqlComparison> {
    return this.compare(input, "edit-sql-compare", input.preparation, input.originalWriteResult);
  }
  public compareVerification(input: ClosedInput & Readonly<{ originalEditComparison: ClosedSymbolSqlComparison }>): Promise<ClosedSymbolSqlComparison> {
    return this.compare(input, "verify-sql-compare", input.originalEditComparison);
  }

  private async compare(input: ClosedInput, phase: ClosedSymbolSqlComparison["phase"], reference: PreparedClosedSymbolSql | ClosedSymbolSqlComparison,
    originalWriteResult?: unknown): Promise<ClosedSymbolSqlComparison> {
    const operationId = input.journal.operationId;
    const callerText = canonicalJson(input.journal);
    const copy = input.copy, inventory = input.inventory, proof = input.proof;
    const preparation = this.prepared.get(operationId);
    need(preparation !== undefined && preparation.ready && canonicalJson(preparation.descriptor) === preparation.text, "Closed SQL comparison requires its original successful preparation.");
    const prior = this.comparisons.get(`${operationId}:edit-sql-compare`);
    if (phase === "edit-sql-compare") { need(reference === preparation.descriptor, "Closed SQL prepared reference is not original."); }
    else { need(prior !== undefined && prior.ready && reference === prior.result && canonicalJson(prior.result) === prior.text, "Closed SQL verification requires its original successful edit comparison."); }
    let writeResult: OriginalClosedSymbolWrite | undefined;
    if (phase === "edit-sql-compare") { writeResult = assertOriginalClosedSymbolWrite(originalWriteResult, this.engine, operationId); }
    const writeText = writeResult === undefined ? undefined : canonicalJson(writeResult);
    this.consume(operationId, phase);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => {
      const descriptor = Object.getOwnPropertyDescriptor(input, phase === "edit-sql-compare" ? "preparation" : "originalEditComparison");
      need(input.copy === copy && input.inventory === inventory && input.proof === proof && canonicalJson(input.journal) === callerText,
        "Closed SQL comparison caller changed.");
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.value === reference,
        "Closed SQL comparison caller reference changed.");
      need(canonicalJson(preparation.descriptor) === preparation.text, "Closed SQL retained plan changed.");
      if (phase === "edit-sql-compare") {
        const writeDescriptor = Object.getOwnPropertyDescriptor(input, "originalWriteResult");
        need(writeDescriptor !== undefined && Object.hasOwn(writeDescriptor, "value") && writeDescriptor.value === originalWriteResult &&
          canonicalJson(assertOriginalClosedSymbolWrite(originalWriteResult, this.engine, operationId)) === writeText,
          "Closed SQL original write result changed.");
      }
      if (prior !== undefined) { need(canonicalJson(prior.result) === prior.text, "Closed SQL retained edit result changed."); }
    };
    unchanged();
    need(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible &&
      journal.closedPlanSha256 === preparation.descriptor.closedPlanSha256 &&
      sha256Json(journal.plan.operation) === preparation.descriptor.operationSha256, "Closed SQL comparison journal/operation changed.");
    const copyPhase = phase === "edit-sql-compare" ? "edit-copy" : "verify-copy";
    const bound = bindClosedSqlCopy({ journal, events, phase: copyPhase, copy, inventory, proof });
    const last = events.at(-1);
    need(last?.step === copyPhase && last.kind === "result", "Closed SQL comparison is not immediately after its original copy.");
    const baseline = bindClosedSqlCopy({ journal, events, phase: "baseline-copy", copy: preparation.baselineCopy, inventory: preparation.baselineInventory });
    need(baseline.resultArtifactSha256 === preparation.descriptor.baselineArtifactSha256, "Closed SQL baseline event changed.");
    const witness = events.find((event) => event.step === "edit-witness" && event.kind === "result");
    const witnessArtifact = witness === undefined ? undefined : journal.artifacts[witness.sequence - 1];
    const write = events.find((event) => event.step === "edit-write" && event.kind === "intent");
    need(witnessArtifact?.sha256 === preparation.descriptor.witnessArtifactSha256 && isRecord(write?.data) &&
      write.data["witnessArtifactSha256"] === preparation.descriptor.witnessArtifactSha256 &&
      write.data["witnessClockArtifactSha256"] === preparation.descriptor.witnessClockArtifactSha256 &&
      canonicalJson(write.data["witnessClockArtifact"]) === canonicalJson(preparation.descriptor.witnessClockArtifact) &&
      write.data["metadataPlanSha256"] === preparation.descriptor.metadataPlanSha256 &&
      write.data["preparedSqlPlanSha256"] === preparation.descriptor.preparedSqlPlanSha256 &&
      canonicalJson(write.generation) === preparation.generationText, "Closed SQL write does not bind the pre-dispatch witness and plan.");
    if (phase === "edit-sql-compare") {
      const resultEvent = events.find((event) => event.step === "edit-write" && event.kind === "result");
      need(writeResult !== undefined && resultEvent !== undefined && resultEvent.requestSha256 === writeResult.requestSha256 &&
        write.requestSha256 === writeResult.requestSha256 && journal.artifacts[resultEvent.sequence - 1]?.sha256 === writeResult.artifactSha256 &&
        canonicalJson(writeResult.generation) === preparation.generationText && writeResult.witnessArtifactSha256 === preparation.descriptor.witnessArtifactSha256 &&
        writeResult.witnessClockArtifactSha256 === preparation.descriptor.witnessClockArtifactSha256 &&
        writeResult.preparedSqlPlanSha256 === preparation.descriptor.preparedSqlPlanSha256 && writeResult.metadataPlanSha256 === preparation.descriptor.metadataPlanSha256,
        "Closed SQL comparison lacks its original bound write result.");
    }
    if (phase === "verify-sql-compare") {
      need(prior !== undefined, "Closed SQL original edit comparison missing.");
      bindClosedSqlCopy({ journal, events, phase: "edit-copy", copy: prior.copy, inventory: prior.inventory });
      const event = events.find((item) => item.step === "edit-sql-compare" && item.kind === "result");
      need(event !== undefined && journal.artifacts[event.sequence - 1]?.sha256 === prior.artifactSha256 &&
        canonicalJson(event.data) === prior.text, "Closed SQL original edit comparison event changed.");
    }
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(typeof scopeReader === "function", "Closed SQL comparison cannot inspect bridge scope.");
    const outside = (): void => {
      unchanged();
      need(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
        "Closed SQL comparison requires no authenticated scope.");
    };
    const current = async (): Promise<void> => {
      outside(); need(await assertClosedSessionCopyAuthority(proof) === proof, "Closed SQL comparison closure changed."); outside();
    };
    await current();
    const qualification = await readWitnessClockArtifact(operationId, preparation.descriptor.witnessClockArtifact, preparation.descriptor.witnessClockArtifactSha256); await current();
    let clockRelation: Readonly<Record<string, unknown>> | null = null;
    let terminationObservation: IssuedWindowsClockObservation | null = null;
    if (phase === "edit-sql-compare") {
      const originalWitness = assertOriginalClosedSymbolWitness(preparation.witnessResult, this.engine, operationId);
      need(canonicalJson(originalWitness) === preparation.witnessText, "Closed SQL original witness changed.");
      const clockProof = await qualifyClosedSymbolTerminationClock({ operationId, generation: bound.generation, proof, qualification,
        witnessArtifactSha256: preparation.descriptor.witnessArtifactSha256, witness: originalWitness.witness }); await current();
      clockRelation = clockProof.relation;
      terminationObservation = clockProof.termination;
    }
    await this.engine.assertBridgeDispatchAllowed(); await current();
    await this.engine.assertRecoveryOperationIsolated(operationId); await current();
    const reread = await readClosedCopySqlInventory({ copy, runtime: this.runtime }); await current();
    await compareCompleteClosedSql(inventory, reread); await current();
    if (phase === "verify-sql-compare") {
      need(prior !== undefined, "Closed SQL original edit comparison missing.");
      const originalEdit = await readClosedCopySqlInventory({ copy: prior.copy, runtime: this.runtime }); await current();
      await compareCompleteClosedSql(prior.inventory, originalEdit); await current();
    }
    // Retain source-issued clock data for read-only restart reproof.
    // A digest alone cannot reproduce the UTC/QPC window relation.
    need(terminationObservation === null || clockRelation?.["terminationObservationSha256"] === sha256Json(terminationObservation),
      "Closed SQL termination observation changed before retention.");
    const request = { profile: "private.closed-symbol-sql-comparison-request.v1", phase,
      preparedSqlPlanSha256: preparation.descriptor.preparedSqlPlanSha256, witnessArtifactSha256: preparation.descriptor.witnessArtifactSha256,
      witnessClockArtifactSha256: preparation.descriptor.witnessClockArtifactSha256, metadataPlanSha256: preparation.descriptor.metadataPlanSha256,
      originalWriteResultArtifactSha256: writeResult?.artifactSha256 ?? null,
      clockRelation, terminationObservation,
      copyReceiptSha256: copy.receiptSha256, copyArtifactSha256: bound.resultArtifactSha256, sqlDigests: sqlDigests(inventory),
      originalEditComparisonSha256: phase === "verify-sql-compare" ? prior?.result.resultSha256 : null };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation: bound.generation, requestSha256, data: request });
    await current();
    let comparison: Readonly<Record<string, unknown>>;
    if (phase === "edit-sql-compare") { comparison = await verifySymbolNewHeadSqlEffect(preparation.descriptor.sqlPlan, inventory); }
    else {
      need(prior !== undefined, "Closed SQL original edit comparison missing.");
      comparison = await compareCompleteClosedSql(prior.inventory, inventory);
    }
    const body = { profile: "private.closed-symbol-sql-comparison-stage.v1" as const, operationId, phase,
      preparedSqlPlanSha256: preparation.descriptor.preparedSqlPlanSha256, copyReceiptSha256: copy.receiptSha256, comparison,
      producerBindingVerified: false as const, executionAuthorized: false as const, completionProved: false as const };
    const result: ClosedSymbolSqlComparison = Object.freeze({ ...body, resultSha256: sha256Json(body) });
    const slot: ComparisonSlot = { result, text: canonicalJson(result), preparation, copy, inventory, ready: false, artifactSha256: undefined };
    this.comparisons.set(`${operationId}:${phase}`, slot);
    // Preserve the original settled comparison before publication or reproof.
    await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation: bound.generation, requestSha256, data: result });
    slot.artifactSha256 = journal.artifacts.at(-1)?.sha256;
    await current();
    const finalCopy = await readClosedCopySqlInventory({ copy, runtime: this.runtime }); await current();
    await compareCompleteClosedSql(inventory, finalCopy); await current();
    await readWitnessClockArtifact(operationId, preparation.descriptor.witnessClockArtifact, preparation.descriptor.witnessClockArtifactSha256); await current();
    const final = await loadClosedSymbolJournal(operationId); outside();
    assertCurrentClosedSessionCopyAuthority(proof);
    need(canonicalJson(final.journal) === canonicalJson(journal), "Closed SQL comparison journal advanced.");
    need(slot.artifactSha256 !== undefined, "Closed SQL result artifact missing.");
    Object.assign(input.journal, journal);
    slot.ready = true;
    const source = Object.freeze({ comparison: result, comparisonArtifactSha256: slot.artifactSha256,
      preparation: preparation.descriptor, copy, inventory });
    issuedComparisons.set(result, { engine: this.engine, operationId, phase, result, text: slot.text, source, runtime: this.runtime });
    return result;
  }
}

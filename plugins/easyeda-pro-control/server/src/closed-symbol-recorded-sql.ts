/** Historical data relations only. The caller separately replays lifecycle,
 * witness and clock evidence. No old Stage or native authority is restored. */
import { join } from "node:path";
import { operationPath } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { STEPS } from "./closed-symbol-journal.ts";
import type { ClosedJournal, PhaseEvent } from "./closed-symbol-journal.ts";
import type { ClosedSymbolSqlComparison, PreparedClosedSymbolSql } from "./closed-symbol-sql-comparison.ts";
import type { OriginalSavedSymbolSource } from "./closed-symbol-saved-source.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeRawHistoryForOriginalSymbolSqlPlan, metadataPlanForOriginalSymbolSqlPlan, prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "./symbol-sql-comparator.ts";
import type { SymbolSqlWitness } from "./symbol-sql-comparator.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "./saved-symbol-projection.ts";
import type { SavedSymbolProjection } from "./saved-symbol-projection.ts";

type Bag = Readonly<Record<string, unknown>>;
export interface RecordedSymbolSqlInput {
  readonly journal: ClosedJournal; readonly events: readonly PhaseEvent[];
  readonly baselineInventory: Inventory; readonly editInventory: Inventory; readonly verificationInventory: Inventory;
  readonly witness: Readonly<SymbolSqlWitness>; readonly witnessClockArtifact: Readonly<ArtifactDescriptor>;
}
export interface RecordedSymbolSqlEvidence {
  readonly preparation: PreparedClosedSymbolSql; readonly editComparison: ClosedSymbolSqlComparison;
  readonly verificationComparison: ClosedSymbolSqlComparison; readonly savedSource: OriginalSavedSymbolSource;
  readonly projection: SavedSymbolProjection;
  readonly resultHashes: Readonly<Record<"preparationSha256" | "editComparisonSha256" | "verificationComparisonSha256" | "savedSourceSha256", string>>;
  readonly requiresIndependentWitnessClockAndLifecycleReplay: true;
  readonly authorityRestored: false; readonly executionAuthorized: false; readonly completionProved: false;
}
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`Recorded symbol SQL: ${message}`); } }
function bag(value: unknown): Bag { need(isRecord(value), "object required"); return value; }
function hash(value: unknown): string { need(typeof value === "string" && /^[a-f0-9]{64}$/u.test(value), "digest refused"); return value; }
function same(actual: unknown, expected: unknown, message: string): void { need(canonicalJson(actual) === canonicalJson(expected), message); }
function digests(inventory: Inventory): Readonly<Record<string, string>> {
  need(readerCompletion(inventory).exitCode === 0, "completed original SQL inventory required");
  return { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 };
}
function comparison(operationId: string, phase: ClosedSymbolSqlComparison["phase"], preparedSqlPlanSha256: string,
  copyReceiptSha256: string, relation: Bag): ClosedSymbolSqlComparison {
  const body = { profile: "private.closed-symbol-sql-comparison-stage.v1" as const, operationId, phase,
    preparedSqlPlanSha256, copyReceiptSha256, comparison: relation,
    producerBindingVerified: false as const, executionAuthorized: false as const, completionProved: false as const };
  return Object.freeze({ ...body, resultSha256: sha256Json(body) });
}

/** Inputs are fixed-loader data and newly completed retained-copy readers.
 * Pure preparation/projection create new computational brands, never old Stage
 * brands. No file read, dispatch or original authority lookup occurs here. */
export async function reconstructClosedSymbolSqlEvidence(input: RecordedSymbolSqlInput): Promise<RecordedSymbolSqlEvidence> {
  const { journal, events, baselineInventory, editInventory, verificationInventory, witness, witnessClockArtifact } = input;
  const snapshot = canonicalJson({ journal, events, witness, witnessClockArtifact });
  const current = (): void => {
    need(input.journal === journal && input.events === events && input.baselineInventory === baselineInventory && input.editInventory === editInventory &&
      input.verificationInventory === verificationInventory && input.witness === witness && input.witnessClockArtifact === witnessClockArtifact,
      "caller reference changed");
    need(canonicalJson({ journal, events, witness, witnessClockArtifact }) === snapshot, "caller data changed");
  };
  need(journal.sequence === 44 && events.length === 44 && journal.artifacts.length === 44 && !journal.hardStop && !journal.orphanedCallPossible &&
    !journal.saved && !journal.reopened && journal.closedPlanSha256 === sha256Json(journal.plan) &&
    journal.markerSha256 === sha256Json(journal.plan.marker), "complete sealed phase data required");
  const operationId = journal.operationId; const directory = operationPath(operationId).slice(0, -5);
  for (const [index, event] of events.entries()) {
    const step = STEPS[Math.floor(index / 2)]; const kind = index % 2 === 0 ? "intent" : "result"; const artifact = journal.artifacts[index];
    need(step !== undefined && artifact !== undefined && event.sequence === index + 1 && event.step === step && event.kind === kind &&
      event.operationId === operationId && event.closedPlanSha256 === journal.closedPlanSha256 && event.markerSha256 === journal.markerSha256 &&
      event.dataSha256 === sha256Json(event.data) && event.previousArtifactSha256 === (journal.artifacts[index - 1]?.sha256 ?? null), "phase binding differs");
    need(artifact.path === join(directory, `${String(index + 1).padStart(2, "0")}-${step}-${kind}.json`) &&
      Number.isSafeInteger(artifact.bytes) && artifact.bytes > 0 && artifact.bytes <= 60_000, "phase artifact descriptor differs"); hash(artifact.sha256);
    if (kind === "result") { need(event.requestSha256 === events[index - 1]?.requestSha256, "paired request differs"); }
  }
  const event = (sequence: number): PhaseEvent => { const value = events[sequence - 1]; need(value !== undefined, "required phase absent"); return value; };
  const artifactHash = (sequence: number): string => hash(journal.artifacts[sequence - 1]?.sha256);
  const copy = (sequence: number, inventory: Inventory): Readonly<{ receiptSha256: string }> => {
    const data = bag(event(sequence).data), receipt = bag(data["copyReceipt"]);
    same(data, { copyReceipt: receipt, sqlDigests: digests(inventory) }, "complete copy-result SQL binding differs");
    need(receipt["source"] === journal.plan.projectPath && receipt["sha256"] === inventory.checkpointSha256 &&
      receipt["executionAuthorized"] === false && receipt["sourceProjectGenerationBindingVerified"] === false && receipt["sourceEqualsArtifactBytes"] === true,
      "copy source/digest/flags differ");
    const { receiptSha256, ...body } = receipt; need(hash(receiptSha256) === sha256Json(body), "copy receipt digest differs");
    return Object.freeze({ receiptSha256: hash(receiptSha256) });
  };
  const baselineCopy = copy(10, baselineInventory), editCopy = copy(26, editInventory), verificationCopy = copy(42, verificationInventory);
  need(witness.projectUuid === journal.plan.projectUuid && witness.branchUuid === journal.plan.branchUuid && !Object.hasOwn(witness, "agedHead"),
    "first historical profile requires the exact locked witness");
  need(witnessClockArtifact.path === join(directory, "20-edit-witness-clock-qualification.json") && Number.isSafeInteger(witnessClockArtifact.bytes) &&
    witnessClockArtifact.bytes > 0 && witnessClockArtifact.bytes <= 60_000, "witness auxiliary descriptor differs"); hash(witnessClockArtifact.sha256);
  const sqlPlan = await prepareSymbolNewHeadSqlPlan({ before: baselineInventory, operation: journal.plan.operation, witness }); current();
  need(sqlPlan.headEligibility === "locked", "only the locked-head historical profile is admitted");
  const metadataPlan = metadataPlanForOriginalSymbolSqlPlan(sqlPlan);
  need(metadataPlan.projectUuid === journal.plan.projectUuid && metadataPlan.branchUuid === journal.plan.branchUuid &&
    metadataPlan.ownerUuid === journal.plan.ownerUuid && metadataPlan.targetUuid === journal.plan.targetUuid, "metadata identity differs");
  const body = { profile: "private.closed-symbol-prepared-sql.v1" as const, operationId, closedPlanSha256: journal.closedPlanSha256,
    baselineCopyReceiptSha256: baselineCopy.receiptSha256, baselineSqlSha256: baselineInventory.logicalSha256, baselineArtifactSha256: artifactHash(10),
    witnessArtifactSha256: artifactHash(20), witnessSha256: sha256Json(witness), operationSha256: sha256Json(journal.plan.operation),
    witnessClockArtifactSha256: witnessClockArtifact.sha256, witnessClockArtifact: Object.freeze(structuredClone(witnessClockArtifact)),
    metadataPlan, metadataPlanSha256: sha256Json(metadataPlan), sqlPlan,
    producerBindingVerified: false as const, executionAuthorized: false as const, completionProved: false as const };
  const preparation: PreparedClosedSymbolSql = Object.freeze({ ...body, preparedSqlPlanSha256: sha256Json(body) });
  const write = bag(event(21).data);
  need(event(21).requestSha256 === sha256Json(write) && write["profile"] === "private.closed-symbol-write-request.v1" &&
    write["sameOriginalClockWindow"] === true && write["witnessArtifactSha256"] === preparation.witnessArtifactSha256 &&
    write["witnessClockArtifactSha256"] === preparation.witnessClockArtifactSha256 && write["metadataPlanSha256"] === preparation.metadataPlanSha256 &&
    write["preparedSqlPlanSha256"] === preparation.preparedSqlPlanSha256, "write preparation binding differs");
  same(write["witnessClockArtifact"], preparation.witnessClockArtifact, "write qualification descriptor differs");
  same(event(20).generation, event(21).generation, "witness/write generation differs");
  const editRelation = await verifySymbolNewHeadSqlEffect(sqlPlan, editInventory); current();
  const editComparison = comparison(operationId, "edit-sql-compare", preparation.preparedSqlPlanSha256, editCopy.receiptSha256, editRelation);
  same(event(28).data, editComparison, "recorded edit comparison differs from full recomputation");
  const verificationRelation = await compareCompleteClosedSql(editInventory, verificationInventory); current();
  const verificationComparison = comparison(operationId, "verify-sql-compare", preparation.preparedSqlPlanSha256, verificationCopy.receiptSha256, verificationRelation);
  same(event(44).data, verificationComparison, "recorded verification comparison differs from full recomputation");
  for (const phase of ["edit-sql-compare", "verify-sql-compare"] as const) {
    const editing = phase === "edit-sql-compare"; const sequence = editing ? 27 : 43; const request = bag(event(sequence).data);
    if (editing) {
      const relation = bag(request["clockRelation"]), termination = bag(request["terminationObservation"]);
      need(relation["terminationObservationSha256"] === sha256Json(termination), "retained termination relation digest differs");
    } else { need(request["clockRelation"] === null && request["terminationObservation"] === null, "verification clock fields differ"); }
    const expected = { profile: "private.closed-symbol-sql-comparison-request.v1", phase,
      preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, witnessArtifactSha256: preparation.witnessArtifactSha256,
      witnessClockArtifactSha256: preparation.witnessClockArtifactSha256, metadataPlanSha256: preparation.metadataPlanSha256,
      originalWriteResultArtifactSha256: editing ? artifactHash(22) : null,
      clockRelation: request["clockRelation"], terminationObservation: request["terminationObservation"],
      copyReceiptSha256: editing ? editCopy.receiptSha256 : verificationCopy.receiptSha256,
      copyArtifactSha256: artifactHash(editing ? 26 : 42), sqlDigests: digests(editing ? editInventory : verificationInventory),
      originalEditComparisonSha256: editing ? null : editComparison.resultSha256 };
    same(request, expected, "SQL comparison request differs"); need(event(sequence).requestSha256 === sha256Json(expected), "SQL request digest differs");
  }
  const decoded = await decodeRawHistoryForOriginalSymbolSqlPlan(sqlPlan, editInventory); current();
  need(decoded.history.projectUuid === metadataPlan.projectUuid && decoded.history.branchUuid === metadataPlan.branchUuid &&
    decoded.history.projectOwnerUuid === metadataPlan.ownerUuid && decoded.maximumTicket === sqlPlan.expectedTicket, "decoded raw history identity differs");
  const projection = await prepareSavedSymbolProjection({ chunks: decoded.chunks, targetUuid: metadataPlan.targetUuid,
    maximumTicket: sqlPlan.expectedTicket, currentEditVersion: metadataPlan.headerEditVersion }); current();
  const projectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection, "0".repeat(16)));
  need(projectedContentBytes > 0 && projectedContentBytes <= 65_536, "projected saved content bound exceeded");
  const sourceBody = { profile: "private.closed-symbol-saved-source.v1" as const, operationId,
    editComparisonResultSha256: editComparison.resultSha256, editComparisonArtifactSha256: artifactHash(28),
    preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, editCopyReceiptSha256: editCopy.receiptSha256, editSqlSha256: editInventory.logicalSha256,
    projectUuid: metadataPlan.projectUuid, branchUuid: metadataPlan.branchUuid, ownerUuid: metadataPlan.ownerUuid, targetUuid: metadataPlan.targetUuid,
    maximumTicket: sqlPlan.expectedTicket, headerEditVersion: metadataPlan.headerEditVersion, rawHistorySha256: projection.rawHistorySha256,
    rawHistoryBytes: projection.rawHistoryBytes, chunkCount: decoded.chunks.length, projectedContentBytes,
    executionAuthorized: false as const, producerBindingVerified: false as const, completionProved: false as const };
  const savedSource: OriginalSavedSymbolSource = Object.freeze({ ...sourceBody, sourceSha256: sha256Json(sourceBody) });
  const readRequest = bag(event(37).data);
  need(readRequest["profile"] === "private.closed-symbol-saved-read-request.v1" && event(37).requestSha256 === sha256Json(readRequest), "saved-read request differs");
  same(readRequest["source"], savedSource, "saved source differs from complete raw history reconstruction");
  current();
  return Object.freeze({ preparation, editComparison, verificationComparison, savedSource, projection,
    resultHashes: Object.freeze({ preparationSha256: sha256Json(preparation), editComparisonSha256: sha256Json(editComparison),
      verificationComparisonSha256: sha256Json(verificationComparison), savedSourceSha256: sha256Json(savedSource) }),
    requiresIndependentWitnessClockAndLifecycleReplay: true, authorityRestored: false, executionAuthorized: false, completionProved: false });
}

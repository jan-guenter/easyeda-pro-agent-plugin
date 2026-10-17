/** Original successful copy comparison to one saved destination read. */
/* oxlint-disable import/max-dependencies -- Keep the original writer, snapshot, SQL and projection owners; no supplied verifier can replace these checks. */
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- The shared capture registry must bind this source to its original complete snapshot, not a replaceable verifier.
import { assertOriginalCurrentSymbolCopyFinishSnapshot } from "./current-symbol-baseline-copy.ts";
import { completedCurrentSymbolCopyClockSource } from "./current-symbol-copy-clock.ts";
import type { CurrentSymbolCopyPlan } from "./current-symbol-copy-plan.ts";
import { currentSymbolCopySavedReadRequestSchema } from "./current-symbol-copy-saved-read-program.ts";
import type { CurrentSymbolCopySavedReadRequest } from "./current-symbol-copy-saved-read-program.ts";
// oxlint-disable-next-line import/no-cycle -- Only the actual writer registry can prove this returned UUID and completed one-shot continuation.
import { assertOriginalCurrentSymbolCopyWriterContinuation } from "./current-symbol-copy-writer-runtime.ts";
import type { CurrentSymbolCopyWriterContinuation, CurrentSymbolCopyWriterContinuationSource } from "./current-symbol-copy-writer-runtime.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT } from "./current-symbol-saved-read-program.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, verifyCurrentCreatedCopySavedSymbolProjectionAlternatives } from "./saved-symbol-projection.ts";
import type { CurrentCreatedCopySavedSymbolProjection } from "./saved-symbol-projection.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

export interface CurrentCopiedSymbolSource {
  readonly profile: "private.current-symbol-copy-saved-source.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly sourceUuid: string; readonly destinationUuid: string;
  readonly posteditCheckpointSha256: string; readonly posteditSqlSha256: string;
  readonly comparisonSha256: string; readonly rawHistorySha256: string; readonly rawHistoryBytes: number;
  readonly projectedContentBytes: number; readonly documentCacheProjectedContentBytes: number;
  readonly maximumTicket: number; readonly metadataTicket: number;
  readonly workerSourceSha256: string; readonly cacheBranchObserved: false;
  readonly executionAuthorized: false; readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly continuation: CurrentSymbolCopyWriterContinuation;
  readonly source: CurrentSymbolCopyWriterContinuationSource; readonly descriptor: CurrentCopiedSymbolSource;
  readonly text: string; readonly request: CurrentSymbolCopySavedReadRequest; readonly requestText: string;
  readonly copyPlan: CurrentSymbolCopyPlan; readonly projection: CurrentCreatedCopySavedSymbolProjection;
}
const issued = new WeakMap<object, Original>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current copy saved source requires its original successful copy result."); } }
export function assertCurrentCopiedSymbolSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSymbolCopyWriterContinuation): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.continuation === continuation && original.text === canonicalJson(value));
  need(assertOriginalCurrentSymbolCopyWriterContinuation(continuation, engine) === original.source && canonicalJson(original.request) === original.requestText);
  assertOriginalCurrentSymbolCopyFinishSnapshot(original.source.snapshot, engine); return original;
}

/** Retained checkpoint data only; never revalidate a retired Job as live. */
export async function revalidateCurrentCopiedSymbolSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSymbolCopyWriterContinuation): Promise<Original> {
  const original = assertCurrentCopiedSymbolSource(value, engine, continuation), { snapshot } = original.source;
  const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshot.checkpoint.checkpoint,
    expectedSha256: snapshot.checkpoint.checkpointSha256, projectUuid: snapshot.native.projectUuid, libraryAtomHeaders: "preserve" });
  need(assertCurrentCopiedSymbolSource(value, engine, continuation) === original && history.semanticSha256 === snapshot.native.historySemanticSha256 &&
    history.branchUuid === snapshot.native.branchUuid && history.projectOwnerUuid === snapshot.native.ownerUuid);
  return original;
}

export async function prepareCurrentCopiedSymbolSource(continuation: CurrentSymbolCopyWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentCopiedSymbolSource> {
  const source = assertOriginalCurrentSymbolCopyWriterContinuation(continuation, engine);
  const snapshot = assertOriginalCurrentSymbolCopyFinishSnapshot(source.snapshot, engine);
  const current = (): void => { need(assertOriginalCurrentSymbolCopyWriterContinuation(continuation, engine) === source &&
    assertOriginalCurrentSymbolCopyFinishSnapshot(source.snapshot, engine) === snapshot); };
  const completed = completedCurrentSymbolCopyClockSource(source.clockPlan, source.dispatchOwner, snapshot.inventory);
  const { copyPlan, append } = completed;
  need(source.original.baseline.preparation === copyPlan && append.plan === copyPlan && append.targetUuid === source.writeResult.createdUuid);
  const decoded = await decodeCurrentSymbolPreEditHistory(snapshot.inventory, copyPlan.source); current();
  need(decoded.history.semanticSha256 === source.snapshot.native.historySemanticSha256 && decoded.history.projectUuid === copyPlan.source.projectUuid &&
    decoded.history.branchUuid === copyPlan.source.branchUuid && decoded.history.projectOwnerUuid === copyPlan.ownerUuid &&
    decoded.maximumTicket === copyPlan.canvasHeaderTicket);
  const document = decoded.history.documents.find(item => item.uuid === append.targetUuid);
  need(document?.docType === "SYMBOL" && document.metadata["version"] === source.writeResult.created.version &&
    source.writeResult.created.ticket === copyPlan.metadataTicket);
  const wanted = copyPlan.destinationMetadata;
  const request = currentSymbolCopySavedReadRequestSchema.parse({ target: { projectUuid: copyPlan.source.projectUuid,
    branchUuid: copyPlan.source.branchUuid, symbolUuid: append.targetUuid, ownerUuid: copyPlan.ownerUuid },
  expectedBefore: { name: wanted.title, description: wanted.description, tagsJson: JSON.stringify(wanted.tags), source: "",
    version: document.metadata["version"], ticket: copyPlan.metadataTicket }, maximumTicket: copyPlan.canvasHeaderTicket,
  expectedActor: completed.expectedActor, startup: selectCurrentSymbolStartupExpectation(decoded.history) });
  need(canonicalJson(request.expectedActor) === canonicalJson(source.writeInput.expectedActor) &&
    canonicalJson(request.startup) === canonicalJson(source.writeInput.startup));
  const producer = CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION;
  need(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION.files.some(pin => pin.relativePath === producer.relativePath && pin.bytes === producer.bytes && pin.sha256 === producer.sha256));
  const projection = append.projection;
  const projectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection.raw, "0".repeat(16)));
  const documentCacheProjectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection.documentCache, "0".repeat(16)));
  need(projectedContentBytes > 0 && projectedContentBytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT &&
    documentCacheProjectedContentBytes > 0 && documentCacheProjectedContentBytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT);
  const body = { profile: "private.current-symbol-copy-saved-source.v1" as const, operationId: source.operationId,
    sourceUuid: copyPlan.source.symbolUuid, destinationUuid: append.targetUuid,
    posteditCheckpointSha256: source.snapshot.checkpoint.checkpointSha256, posteditSqlSha256: snapshot.inventory.logicalSha256,
    comparisonSha256: sha256Json(completed.comparison), rawHistorySha256: projection.raw.rawHistorySha256, rawHistoryBytes: projection.raw.rawHistoryBytes,
    projectedContentBytes, documentCacheProjectedContentBytes, maximumTicket: copyPlan.canvasHeaderTicket, metadataTicket: copyPlan.metadataTicket,
    workerSourceSha256: producer.sha256, cacheBranchObserved: false as const, executionAuthorized: false as const, completionProved: false as const };
  const descriptor: CurrentCopiedSymbolSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(descriptor, { engine, continuation, source, descriptor, text: canonicalJson(descriptor), request,
    requestText: canonicalJson(request), copyPlan, projection });
  await revalidateCurrentCopiedSymbolSource(descriptor, engine, continuation); current(); return descriptor;
}

export function verifyCurrentCopiedSymbolContent(value: CurrentCopiedSymbolSource, engine: EasyedaControlEngine,
  continuation: CurrentSymbolCopyWriterContinuation, observation: unknown): Readonly<Record<string, unknown>> {
  const original = assertCurrentCopiedSymbolSource(value, engine, continuation);
  return Object.freeze({ ...verifyCurrentCreatedCopySavedSymbolProjectionAlternatives(original.projection, observation),
    sourceSha256: value.sourceSha256, comparisonSha256: value.comparisonSha256 });
}

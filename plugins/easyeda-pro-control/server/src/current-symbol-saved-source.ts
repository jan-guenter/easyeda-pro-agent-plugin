/** Original current post-edit SQL-to-getStr relation. No live reader authority. */
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Saved-source preparation requires the actual snapshot issuer shared with inverse baseline adoption, never a caller copy.
import { assertOriginalCurrentSymbolFinishSnapshot } from "./current-symbol-baseline-copy.ts";
import { decodeCompletedCurrentSymbolTransactionHistory } from "./current-symbol-transaction-clock.ts";
// oxlint-disable-next-line import/no-cycle -- Only the writer's lexical continuation registry supplies this saved-source relation through the inverse lifecycle.
import { assertOriginalCurrentSymbolWriterContinuation } from "./current-symbol-writer-runtime.ts";
import type { CurrentSymbolWriterContinuation, CurrentSymbolWriterContinuationSource } from "./current-symbol-writer-runtime.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, currentSavedSymbolReadRequestSchema } from "./current-symbol-saved-read-program.ts";
import type { CurrentSavedSymbolReadRequest } from "./current-symbol-saved-read-program.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, prepareCurrentCanvasSegmentsSavedSymbolProjection,
  prepareCurrentDocumentCacheSavedSymbolProjection, prepareSavedSymbolProjection, verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives,
  verifyCurrentSavedSymbolProjectionAlternatives } from "./saved-symbol-projection.ts";
import type { CurrentCanvasSegmentsSavedSymbolProjection, CurrentDocumentCacheSavedSymbolProjection, SavedSymbolProjection } from "./saved-symbol-projection.ts";

export interface CurrentSavedSymbolSource {
  readonly profile: "private.current-symbol-saved-source.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly purpose: "disposable-validation" | "ordinary-symbol-metadata";
  readonly posteditCheckpointSha256: string; readonly posteditSqlSha256: string;
  readonly comparisonSha256: string; readonly rawHistorySha256: string; readonly rawHistoryBytes: number;
  readonly projectedContentBytes: number; readonly maximumTicket: number;
  readonly documentCacheProjectedContentBytes: number | null; readonly workerSourceSha256: string; readonly cacheBranchObserved: false;
  readonly executionAuthorized: false; readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly continuation: CurrentSymbolWriterContinuation;
  readonly source: CurrentSymbolWriterContinuationSource; readonly descriptor: CurrentSavedSymbolSource;
  readonly text: string; readonly request: CurrentSavedSymbolReadRequest; readonly requestText: string;
  readonly projection: SavedSymbolProjection;
  readonly documentCacheProjection: CurrentDocumentCacheSavedSymbolProjection | CurrentCanvasSegmentsSavedSymbolProjection;
}
const issued = new WeakMap<object, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("Current saved symbol source requires its original complete post-edit result."); } }
export function assertCurrentSavedSymbolSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSymbolWriterContinuation): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.continuation === continuation && original.text === canonicalJson(value));
  need(assertOriginalCurrentSymbolWriterContinuation(continuation, engine) === original.source && canonicalJson(original.request) === original.requestText);
  assertOriginalCurrentSymbolFinishSnapshot(original.source.snapshot, engine);
  return original;
}

/** Rehash the preserved checkpoint, not the reopened live database and not old
 * process authority. Its original full SQL inventory remains separately bound.
 */
export async function revalidateCurrentSavedSymbolSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSymbolWriterContinuation): Promise<Original> {
  const original = assertCurrentSavedSymbolSource(value, engine, continuation), { snapshot } = original.source;
  const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshot.checkpoint.checkpoint,
    expectedSha256: snapshot.checkpoint.checkpointSha256, projectUuid: snapshot.native.projectUuid, libraryAtomHeaders: "preserve" });
  need(assertCurrentSavedSymbolSource(value, engine, continuation) === original && history.semanticSha256 === snapshot.native.historySemanticSha256 &&
    history.branchUuid === snapshot.native.branchUuid && history.projectOwnerUuid === snapshot.native.ownerUuid);
  return original;
}

export async function prepareCurrentSavedSymbolSource(continuation: CurrentSymbolWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentSavedSymbolSource> {
  const source = assertOriginalCurrentSymbolWriterContinuation(continuation, engine);
  const purpose = source.original.source.purpose;
  need(purpose === "disposable-validation" || purpose === "ordinary-symbol-metadata");
  const snapshot = assertOriginalCurrentSymbolFinishSnapshot(source.snapshot, engine);
  const current = (): void => { need(assertOriginalCurrentSymbolWriterContinuation(continuation, engine) === source &&
    assertOriginalCurrentSymbolFinishSnapshot(source.snapshot, engine) === snapshot); };
  const decoded = await decodeCompletedCurrentSymbolTransactionHistory(source.clockPlan, source.dispatchOwner, snapshot.inventory); current();
  const { metadataPlan, expectedTicket, expectedDocumentEditVersion } = decoded;
  need(decoded.decoded.history.semanticSha256 === source.snapshot.native.historySemanticSha256 &&
    decoded.decoded.history.projectUuid === metadataPlan.projectUuid && decoded.decoded.history.branchUuid === metadataPlan.branchUuid &&
    decoded.decoded.history.projectOwnerUuid === metadataPlan.ownerUuid && decoded.decoded.maximumTicket === expectedTicket);
  const document = decoded.decoded.history.documents.find((entry) => entry.uuid === metadataPlan.targetUuid);
  need(document?.docType === "SYMBOL");
  const request = currentSavedSymbolReadRequestSchema.parse({ target: { projectUuid: metadataPlan.projectUuid, branchUuid: metadataPlan.branchUuid,
    symbolUuid: metadataPlan.targetUuid, ownerUuid: metadataPlan.ownerUuid }, expectedBefore: { name: metadataPlan.desiredTitle,
    description: metadataPlan.desiredDescription, tagsJson: JSON.stringify(metadataPlan.beforeTags), source: metadataPlan.beforeSource,
    version: document.metadata["version"], ticket: expectedTicket }, maximumTicket: expectedTicket,
  expectedActor: decoded.expectedActor, startup: selectCurrentSymbolStartupExpectation(decoded.decoded.history) });
  need(canonicalJson(request.target) === canonicalJson(source.writeInput.target) &&
    canonicalJson(request.expectedActor) === canonicalJson(source.writeInput.expectedActor) &&
    expectedDocumentEditVersion === "3.2.206");
  // The saved reader verifies this same worker pin before and after dispatch.
  // Descriptor linkage is not a claim that the cache branch was observed.
  const producer = CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION;
  need(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION.files.some((pin) => pin.relativePath === producer.relativePath &&
    pin.bytes === producer.bytes && pin.sha256 === producer.sha256));
  const projection = await prepareSavedSymbolProjection({ chunks: decoded.decoded.chunks, targetUuid: metadataPlan.targetUuid,
    maximumTicket: expectedTicket, currentEditVersion: expectedDocumentEditVersion }); current();
  // The original successful writer already qualified this purpose's complete
  // Baseline and clock budget. Both supported purposes use the same exact
  // Canvas relation; no caller flag or generic metadata route selects it.
  const documentCacheProjection = projection.canvasRecords === 0
    ? await prepareCurrentDocumentCacheSavedSymbolProjection({ chunks: decoded.decoded.chunks, targetUuid: metadataPlan.targetUuid,
      maximumTicket: expectedTicket, currentEditVersion: expectedDocumentEditVersion })
    : await prepareCurrentCanvasSegmentsSavedSymbolProjection({ chunks: decoded.decoded.chunks, targetUuid: metadataPlan.targetUuid,
      maximumTicket: expectedTicket, currentEditVersion: expectedDocumentEditVersion });
  current();
  const projectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection, "0".repeat(16)));
  // Admitted segment orders permute exact lines, preserving UTF8 size.
  // This representative therefore bounds every cache-order alternative.
  const documentCacheProjectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(documentCacheProjection, "0".repeat(16)));
  need(projectedContentBytes > 0 && projectedContentBytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT);
  need(documentCacheProjectedContentBytes > 0 && documentCacheProjectedContentBytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT);
  const body = { profile: "private.current-symbol-saved-source.v1" as const, operationId: source.operationId, purpose,
    posteditCheckpointSha256: source.snapshot.checkpoint.checkpointSha256, posteditSqlSha256: snapshot.inventory.logicalSha256,
    comparisonSha256: sha256Json(decoded.comparison), rawHistorySha256: projection.rawHistorySha256,
    rawHistoryBytes: projection.rawHistoryBytes, projectedContentBytes, maximumTicket: expectedTicket,
    documentCacheProjectedContentBytes, cacheProjectionProfile: documentCacheProjection.profile, workerSourceSha256: producer.sha256, cacheBranchObserved: false as const,
    executionAuthorized: false as const, completionProved: false as const };
  const descriptor: CurrentSavedSymbolSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(descriptor, { engine, continuation, source, descriptor, text: canonicalJson(descriptor), request,
    requestText: canonicalJson(request), projection, documentCacheProjection });
  await revalidateCurrentSavedSymbolSource(descriptor, engine, continuation); current();
  return descriptor;
}

export function verifyCurrentSavedSymbolContent(value: CurrentSavedSymbolSource, engine: EasyedaControlEngine,
  continuation: CurrentSymbolWriterContinuation, observation: unknown): Readonly<Record<string, unknown>> {
  const original = assertCurrentSavedSymbolSource(value, engine, continuation);
  const cache = original.documentCacheProjection;
  const relation = cache.profile === "private.current-canvas-segments-saved-symbol-getstr-projection.v1"
    ? verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(original.projection, cache, observation)
    : verifyCurrentSavedSymbolProjectionAlternatives(original.projection, cache, observation);
  return Object.freeze({ ...relation, sourceSha256: value.sourceSha256,
    comparisonSha256: value.comparisonSha256 });
}

/** Original current post-edit SQL-to-getStr relation. No live reader authority. */
import { canonicalJson, sha256Json } from "./core.ts";
import { assertOriginalCurrentSymbolFinishSnapshot } from "./current-symbol-baseline-copy.ts";
import { decodeCompletedCurrentSymbolTransactionHistory } from "./current-symbol-transaction-clock.ts";
import { assertOriginalCurrentSymbolWriterContinuation } from "./current-symbol-writer-runtime.ts";
import type { CurrentSymbolWriterContinuation, CurrentSymbolWriterContinuationSource } from "./current-symbol-writer-runtime.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, currentSavedSymbolReadRequestSchema } from "./current-symbol-saved-read-program.ts";
import type { CurrentSavedSymbolReadRequest } from "./current-symbol-saved-read-program.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection, verifySavedSymbolContent } from "./saved-symbol-projection.ts";
import type { SavedSymbolProjection } from "./saved-symbol-projection.ts";

export interface CurrentSavedSymbolSource {
  readonly profile: "private.current-symbol-saved-source.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly posteditCheckpointSha256: string; readonly posteditSqlSha256: string;
  readonly comparisonSha256: string; readonly rawHistorySha256: string; readonly rawHistoryBytes: number;
  readonly projectedContentBytes: number; readonly maximumTicket: number;
  readonly executionAuthorized: false; readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly continuation: CurrentSymbolWriterContinuation;
  readonly source: CurrentSymbolWriterContinuationSource; readonly descriptor: CurrentSavedSymbolSource;
  readonly text: string; readonly request: CurrentSavedSymbolReadRequest; readonly requestText: string;
  readonly projection: SavedSymbolProjection;
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
  const projection = await prepareSavedSymbolProjection({ chunks: decoded.decoded.chunks, targetUuid: metadataPlan.targetUuid,
    maximumTicket: expectedTicket, currentEditVersion: expectedDocumentEditVersion }); current();
  const projectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection, "0".repeat(16)));
  need(projectedContentBytes > 0 && projectedContentBytes <= CURRENT_SAVED_SYMBOL_CONTENT_LIMIT);
  const body = { profile: "private.current-symbol-saved-source.v1" as const, operationId: source.operationId,
    posteditCheckpointSha256: source.snapshot.checkpoint.checkpointSha256, posteditSqlSha256: snapshot.inventory.logicalSha256,
    comparisonSha256: sha256Json(decoded.comparison), rawHistorySha256: projection.rawHistorySha256,
    rawHistoryBytes: projection.rawHistoryBytes, projectedContentBytes, maximumTicket: expectedTicket,
    executionAuthorized: false as const, completionProved: false as const };
  const descriptor: CurrentSavedSymbolSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(descriptor, { engine, continuation, source, descriptor, text: canonicalJson(descriptor), request,
    requestText: canonicalJson(request), projection });
  await revalidateCurrentSavedSymbolSource(descriptor, engine, continuation); current();
  return descriptor;
}

export function verifyCurrentSavedSymbolContent(value: CurrentSavedSymbolSource, engine: EasyedaControlEngine,
  continuation: CurrentSymbolWriterContinuation, observation: unknown): Readonly<Record<string, unknown>> {
  const original = assertCurrentSavedSymbolSource(value, engine, continuation);
  return Object.freeze({ ...verifySavedSymbolContent(original.projection, observation), sourceSha256: value.sourceSha256,
    comparisonSha256: value.comparisonSha256 });
}

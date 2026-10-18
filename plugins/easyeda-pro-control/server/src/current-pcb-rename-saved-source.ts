/** Original successful PCB rename result to a fresh native metadata read.
 * Complete saved design invariance comes from SQL, not from metadata samples.
 */
/* oxlint-disable import/max-dependencies -- Retain original writer, completed clock/SQL and snapshot identities instead of accepting supplied source validators. */
import { verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertOriginalCurrentPcbNativeMetadata, compareCurrentPcbNativeMetadata, prepareCurrentPcbNativeMetadata } from "./current-pcb-native-metadata.ts";
import type { CurrentPcbNativeMetadata } from "./current-pcb-native-metadata.ts";
import { completedCurrentPcbRenameClockSource } from "./current-pcb-rename-clock.ts";
import type { CurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import { assertOriginalCurrentPcbRenameSnapshot } from "./current-pcb-rename-snapshot.ts";
import { assertOriginalCurrentPcbRenameWriterContinuation } from "./current-pcb-rename-writer-runtime.ts";
import type { CurrentPcbRenameWriterContinuation, CurrentPcbRenameWriterContinuationSource } from "./current-pcb-rename-writer-runtime.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";

export interface CurrentPcbRenameSavedSource {
  readonly profile: "private.current-pcb-rename-saved-source.v1";
  readonly operationId: string;
  readonly targetUuid: string;
  readonly sourceSha256: string;
  readonly posteditCheckpointSha256: string;
  readonly posteditSqlSha256: string;
  readonly comparisonSha256: string;
  readonly projectionSha256: string;
  readonly maximumTicket: number;
  readonly metadataOnlyNativeRead: true;
  readonly completeCanvasRead: false;
  readonly executionAuthorized: false;
  readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly continuation: CurrentPcbRenameWriterContinuation;
  readonly source: CurrentPcbRenameWriterContinuationSource;
  readonly descriptor: CurrentPcbRenameSavedSource; readonly text: string;
  readonly projection: CurrentPcbNativeMetadata;
  readonly request: CurrentPcbNativeMetadata["request"];
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly expectedActor: ActorProjection;
}
const issued = new WeakMap<object, Original>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current PCB saved source requires its original successful rename result."); } }

export function assertCurrentPcbRenameSavedSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentPcbRenameWriterContinuation): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.continuation === continuation && original.text === canonicalJson(value) &&
    assertOriginalCurrentPcbRenameWriterContinuation(continuation, engine) === original.source);
  const snapshot = assertOriginalCurrentPcbRenameSnapshot(original.source.snapshot, engine);
  need(original.source.snapshot.phase === "closed-edit"); assertOriginalCurrentPcbNativeMetadata(original.projection, snapshot.inventory); return original;
}

/** Recheck retained post-edit artifacts, never the old live process or current
 * project path. A new verification generation separately owns native dispatch.
 */
export async function revalidateCurrentPcbRenameSavedSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentPcbRenameWriterContinuation): Promise<Original> {
  const original = assertCurrentPcbRenameSavedSource(value, engine, continuation), { snapshot } = original.source;
  const current = (): void => { need(assertCurrentPcbRenameSavedSource(value, engine, continuation) === original); };
  await verifyExactManagedArtifact({ path: snapshot.copy.artifact, bytes: snapshot.copy.bytes, sha256: snapshot.copy.sha256 }); current();
  const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshot.checkpoint.checkpoint,
    expectedSha256: snapshot.checkpoint.checkpointSha256, projectUuid: snapshot.native.projectUuid, libraryAtomHeaders: "preserve" }); current();
  need(history.semanticSha256 === snapshot.native.historySemanticSha256 && history.branchUuid === snapshot.native.branchUuid &&
    history.projectOwnerUuid === snapshot.native.ownerUuid); return original;
}

export async function prepareCurrentPcbRenameSavedSource(continuation: CurrentPcbRenameWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentPcbRenameSavedSource> {
  const source = assertOriginalCurrentPcbRenameWriterContinuation(continuation, engine);
  const snapshot = assertOriginalCurrentPcbRenameSnapshot(source.snapshot, engine); need(source.snapshot.phase === "closed-edit");
  const current = (): void => { need(assertOriginalCurrentPcbRenameWriterContinuation(continuation, engine) === source &&
    assertOriginalCurrentPcbRenameSnapshot(source.snapshot, engine) === snapshot); };
  const completed = completedCurrentPcbRenameClockSource(source.clockPlan, engine, source.dispatchOwner, snapshot.inventory);
  const { preparation, history } = completed;
  need(source.preparation === preparation && source.storedEffect === completed.storedEffect &&
    source.original.baseline === snapshot.baseline && source.original.baseline.inventory.logicalSha256 === preparation.baseline.sqlSha256 &&
    history.semanticSha256 === source.snapshot.native.historySemanticSha256 && history.projectOwnerUuid === preparation.target.ownerUuid &&
    completed.maximumTicket === source.writeResult.afterMaxTicket && source.writeResult.after.uuid === preparation.target.pcbUuid);
  const previous: unknown = JSON.parse(preparation.beforeMetaText); need(isRecord(previous) && typeof previous["title"] === "string");
  // Query the old name only to observe its absence. No inverse or new mutation
  // Is prepared, and the requested saved title still comes from original intent.
  const projection = await prepareCurrentPcbNativeMetadata({ before: snapshot.inventory, target: preparation.target, desiredTitle: previous["title"] }); current();
  const { uuid: _uuid, ...acknowledged } = source.writeResult.after;
  need(canonicalJson(projection.request.expectedBefore) === canonicalJson(acknowledged) &&
    projection.request.expectedBefore.displayTitle === preparation.desiredTitle && projection.maximumTicket === completed.maximumTicket);
  const expectation = selectCurrentSymbolStartupExpectation(history), expectedActor = completed.expectedActor;
  need(canonicalJson(expectation) === canonicalJson(source.writeInput.startup) && canonicalJson(expectedActor) === canonicalJson(source.writeInput.expectedActor));
  const body = { profile: "private.current-pcb-rename-saved-source.v1" as const, operationId: source.operationId,
    targetUuid: preparation.target.pcbUuid, posteditCheckpointSha256: source.snapshot.checkpoint.checkpointSha256,
    posteditSqlSha256: snapshot.inventory.logicalSha256, comparisonSha256: sha256Json(completed.comparison), projectionSha256: projection.projectionSha256,
    maximumTicket: completed.maximumTicket, metadataOnlyNativeRead: true as const, completeCanvasRead: false as const,
    executionAuthorized: false as const, completionProved: false as const };
  const descriptor: CurrentPcbRenameSavedSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(descriptor, Object.freeze({ engine, continuation, source, descriptor, text: canonicalJson(descriptor),
    projection, request: projection.request, expectation, expectedActor }));
  await revalidateCurrentPcbRenameSavedSource(descriptor, engine, continuation); current(); return descriptor;
}

export function verifyCurrentPcbRenameSavedMetadata(value: CurrentPcbRenameSavedSource, engine: EasyedaControlEngine,
  continuation: CurrentPcbRenameWriterContinuation, observation: CurrentPcbRenamePreflightResult): Readonly<Record<string, unknown>> {
  const original = assertCurrentPcbRenameSavedSource(value, engine, continuation);
  const snapshot = assertOriginalCurrentPcbRenameSnapshot(original.source.snapshot, engine);
  compareCurrentPcbNativeMetadata(original.projection, snapshot.inventory, observation);
  need(canonicalJson(observation.runtimeObservation.actor) === canonicalJson(original.expectedActor));
  return Object.freeze({ profile: "private.current-pcb-rename-saved-metadata-relation.v1", sourceSha256: value.sourceSha256,
    comparisonSha256: value.comparisonSha256, targetUuid: value.targetUuid, maximumTicket: value.maximumTicket,
    reopenedPcbMetadataVerified: true, completeNativePcbPeersMatched: true, completeCanvasRead: false,
    persistenceLifecycleComplete: false, executionAuthorized: false });
}

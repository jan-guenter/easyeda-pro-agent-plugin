/** Original successful SCH continuation to its post-write metadata/child data.
 * This binding preserves provenance without reviving the retired native owner.
 */
import { verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { compareCurrentSchematicRenameSavedObservations, originalCurrentSchematicRenameSavedSource,
  prepareCurrentSchematicRenameSavedSource } from "./current-schematic-rename-saved-source.ts";
import type { CurrentSchematicRenameSavedSource } from "./current-schematic-rename-saved-source.ts";
import { assertOriginalCurrentSchematicRenameSnapshot } from "./current-schematic-rename-snapshot.ts";
import { assertOriginalCurrentSchematicRenameWriterContinuation } from "./current-schematic-rename-writer-runtime.ts";
import type { CurrentSchematicRenameWriterContinuation, CurrentSchematicRenameWriterContinuationSource } from "./current-schematic-rename-writer-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";

export interface CurrentSchematicRenameSavedLifecycleSource {
  readonly profile: "private.current-schematic-rename-saved-lifecycle-source.v1";
  readonly operationId: string;
  readonly targetUuid: string;
  readonly sourceSha256: string;
  readonly posteditCheckpointSha256: string;
  readonly posteditSqlSha256: string;
  readonly dataSourceSha256: string;
  readonly maximumTicket: number;
  readonly metadataAndChildRosterOnly: true;
  readonly completeCanvasRead: false;
  readonly executionAuthorized: false;
  readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine;
  readonly continuation: CurrentSchematicRenameWriterContinuation;
  readonly source: CurrentSchematicRenameWriterContinuationSource;
  readonly descriptor: CurrentSchematicRenameSavedLifecycleSource;
  readonly text: string;
  readonly dataSource: CurrentSchematicRenameSavedSource;
  readonly request: ReturnType<typeof originalCurrentSchematicRenameSavedSource>["metadata"]["request"];
  readonly expectation: ReturnType<typeof originalCurrentSchematicRenameSavedSource>["children"]["startupInput"];
}
const issued = new WeakMap<object, Original>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current SCH saved source requires its original successful rename continuation."); } }

export function assertCurrentSchematicRenameSavedLifecycleSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSchematicRenameWriterContinuation): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.continuation === continuation && original.text === canonicalJson(value) &&
    assertOriginalCurrentSchematicRenameWriterContinuation(continuation, engine) === original.source);
  const snapshot = assertOriginalCurrentSchematicRenameSnapshot(original.source.snapshot, engine);
  need(original.source.snapshot.phase === "closed-edit");
  const data = originalCurrentSchematicRenameSavedSource(original.dataSource, snapshot.inventory);
  need(data.metadata.request === original.request && data.children.startupInput === original.expectation); return original;
}

/** Recheck retained post-edit artifacts. The newly opened verification runtime
 * owns later dispatch; this does not reassert the former live closure epoch.
 */
export async function revalidateCurrentSchematicRenameSavedLifecycleSource(value: unknown, engine: EasyedaControlEngine,
  continuation: CurrentSchematicRenameWriterContinuation): Promise<Original> {
  const original = assertCurrentSchematicRenameSavedLifecycleSource(value, engine, continuation), { snapshot } = original.source;
  const current = (): void => { need(assertCurrentSchematicRenameSavedLifecycleSource(value, engine, continuation) === original); };
  await verifyExactManagedArtifact({ path: snapshot.copy.artifact, bytes: snapshot.copy.bytes, sha256: snapshot.copy.sha256 }); current();
  const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshot.checkpoint.checkpoint,
    expectedSha256: snapshot.checkpoint.checkpointSha256, projectUuid: snapshot.native.projectUuid, libraryAtomHeaders: "preserve" }); current();
  need(history.semanticSha256 === snapshot.native.historySemanticSha256 && history.branchUuid === snapshot.native.branchUuid &&
    history.projectOwnerUuid === snapshot.native.ownerUuid); return original;
}

export async function prepareCurrentSchematicRenameSavedLifecycleSource(continuation: CurrentSchematicRenameWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentSchematicRenameSavedLifecycleSource> {
  const source = assertOriginalCurrentSchematicRenameWriterContinuation(continuation, engine);
  const snapshot = assertOriginalCurrentSchematicRenameSnapshot(source.snapshot, engine);
  need(source.snapshot.phase === "closed-edit" && snapshot.baseline === source.original.baseline);
  const current = (): void => { need(assertOriginalCurrentSchematicRenameWriterContinuation(continuation, engine) === source &&
    assertOriginalCurrentSchematicRenameSnapshot(source.snapshot, engine) === snapshot); };
  const baseline = source.original.baseline;
  const dataSource = await prepareCurrentSchematicRenameSavedSource(source.preparation, baseline.inventory, baseline.metadata,
    baseline.children, source.storedEffect, snapshot.inventory); current();
  const data = originalCurrentSchematicRenameSavedSource(dataSource, snapshot.inventory);
  const { uuid, ...acknowledged } = source.writeResult.after;
  need(uuid === baseline.intent.target.schematicUuid && uuid === source.snapshot.native.schematicUuid &&
    canonicalJson(data.metadata.request.expectedBefore) === canonicalJson(acknowledged) &&
    dataSource.maximumTicket === source.writeResult.afterMaxTicket && data.metadata.request.expectedBefore.displayName === baseline.intent.desiredTitle &&
    canonicalJson(data.children.startupInput) === canonicalJson(baseline.children.startupInput) &&
    canonicalJson(source.writeResult.actor) === canonicalJson(source.writeInput.expectedActor));
  const body = { profile: "private.current-schematic-rename-saved-lifecycle-source.v1" as const, operationId: source.operationId,
    targetUuid: uuid, posteditCheckpointSha256: source.snapshot.checkpoint.checkpointSha256,
    posteditSqlSha256: snapshot.inventory.logicalSha256, dataSourceSha256: dataSource.sourceSha256, maximumTicket: dataSource.maximumTicket,
    metadataAndChildRosterOnly: true as const, completeCanvasRead: false as const, executionAuthorized: false as const, completionProved: false as const };
  const descriptor: CurrentSchematicRenameSavedLifecycleSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(descriptor, Object.freeze({ engine, continuation, source, descriptor, text: canonicalJson(descriptor), dataSource,
    request: data.metadata.request, expectation: data.children.startupInput }));
  await revalidateCurrentSchematicRenameSavedLifecycleSource(descriptor, engine, continuation); current(); return descriptor;
}

/** Supplied data relations only. The saved reader separately binds its raw
 * native return to the original verification generation and journal.
 */
export function verifyCurrentSchematicRenameSavedMetadataAndChildren(value: CurrentSchematicRenameSavedLifecycleSource,
  engine: EasyedaControlEngine, continuation: CurrentSchematicRenameWriterContinuation, metadata: unknown,
  children: unknown): Readonly<Record<string, unknown>> {
  const original = assertCurrentSchematicRenameSavedLifecycleSource(value, engine, continuation);
  const snapshot = assertOriginalCurrentSchematicRenameSnapshot(original.source.snapshot, engine);
  return compareCurrentSchematicRenameSavedObservations(original.dataSource, snapshot.inventory, metadata, children,
    original.source.writeInput.expectedActor);
}

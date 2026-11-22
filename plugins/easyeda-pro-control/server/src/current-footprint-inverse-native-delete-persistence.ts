/** Native DEL persistence is issued from the original completed caller,
 * unchanged preferences, Main receipts and root/whole-Job closed SQL reader.
 * This module launches no editor, Save, native owner or cold generation. */
import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { captureCurrentFootprintInverseClosedSnapshot, requireCurrentFootprintInverseClosedSnapshot } from "./current-footprint-inverse-v4-closed-snapshot.ts";
import type { CurrentFootprintCopyClosedSnapshot } from "./current-footprint-inverse-v4-closed-snapshot.ts";
import { compareCurrentFootprintInverseNativeDeleteClosedSqlDelta } from "./current-footprint-inverse-native-delete-closed-sql-delta.ts";
import type { CurrentFootprintInverseNativeDeleteClosedSqlDelta } from "./current-footprint-inverse-native-delete-closed-sql-delta.ts";
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInverseNativeDeletePersistenceOrigin, CurrentFootprintInverseNativeDeletePersistenceOriginal } from "./current-footprint-inverse-native-delete-persistence-origin.ts";
// Only the late original Core registry can issue this native result; initialization allocates no owner.
import { assertOriginalCurrentFootprintInverseTermination, requireOriginalCurrentFootprintInverseNativeDeletePersistenceOriginAfterOriginalExit, requireOriginalCurrentFootprintInverseNativeDeletePoststateResultAfterOriginalExit } from "./current-footprint-inverse-v4-native-owner.ts";
import type { CurrentFootprintInverseNativeOwner } from "./current-footprint-inverse-v4-native-owner.ts";

export interface CurrentFootprintInverseNativeDeletePersistenceResult {
  readonly profile: "private.current-footprint-inverse-native-delete-persistence-result.v1";
}
export interface CurrentFootprintInverseNativeDeletePersistenceData {
  readonly profile: "private.current-footprint-inverse-native-delete-persistence-data.v1";
  readonly targetUuid: string;
  readonly beforeLogicalSha256: string;
  readonly afterLogicalSha256: string;
  readonly workerUploadSha256: string;
  readonly maximumTicket: number;
  readonly retainedDocuments: number;
  readonly visibleDocuments: number;
  readonly visibleRosterSha256: string;
  readonly targetSemanticSha256: string;
  readonly originalNativeCallerCompleted: true;
  readonly originalSelectedPreferencesUnchanged: true;
  readonly originalMainHistoryAndNaturalReadTailCompleted: true;
  readonly originalRootAndWholeJobExited: true;
  readonly completeClosedSqlRelationVerified: true;
  readonly allPeerDocumentsAndStructureUnchanged: true;
  readonly targetLogicallyDeleted: true;
  readonly targetHistoryRetained: true;
  readonly persistenceVerified: true;
  readonly explicitSaveAttempts: 0;
  readonly publicSdkParity: false;
  readonly nativeManagerColdAbsenceVerified: false;
  readonly coldAbsenceVerified: false;
  readonly wholeInverseVerified: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly owner: CurrentFootprintInverseNativeOwner;
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly origin: CurrentFootprintInverseNativeDeletePersistenceOrigin;
  readonly bindings: CurrentFootprintInverseNativeDeletePersistenceOriginal;
  readonly termination: object;
  readonly snapshot: CurrentFootprintCopyClosedSnapshot;
  readonly delta: CurrentFootprintInverseNativeDeleteClosedSqlDelta;
  readonly data: Readonly<CurrentFootprintInverseNativeDeletePersistenceData>;
}
interface Attempt {
  readonly owner: CurrentFootprintInverseNativeOwner;
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly termination: object;
  readonly pending: Promise<CurrentFootprintInverseNativeDeletePersistenceResult>;
}
const attempts = new WeakMap<CurrentFootprintInverseNativeDeletePersistenceOrigin, Attempt>();
const completed = new WeakMap<CurrentFootprintInverseNativeDeletePersistenceResult, Original>();
function need(value: boolean, code: string): asserts value {
  if (!value) { throw new Error(`INVERSE_NATIVE_DELETE_PERSISTENCE_${code}`); }
}
function current(original: Pick<Original, "owner" | "prepared" | "origin" | "bindings" | "termination">): void {
  const actual = requireOriginalCurrentFootprintInverseNativeDeletePersistenceOriginAfterOriginalExit(original.origin, original.owner, original.prepared);
  need(actual === original.bindings && actual.main.owner === original.owner && actual.main.prepared === original.prepared, "ORIGINAL_BINDINGS");
  actual.assertOriginalExit();
  const post = requireOriginalCurrentFootprintInverseNativeDeletePoststateResultAfterOriginalExit(actual.poststate, original.owner, original.prepared);
  need(post.source === actual.source, "ORIGINAL_POSTSTATE_SOURCE");
  assertOriginalCurrentFootprintInverseTermination(original.owner, original.termination);
}
/** The first call retains its entire original capture Promise synchronously.
 * Matching inventory JSON, filenames or termination data are never accepted. */
export function captureCurrentFootprintInverseNativeDeletePersistence(origin: CurrentFootprintInverseNativeDeletePersistenceOrigin,
  owner: CurrentFootprintInverseNativeOwner, prepared: CurrentFootprintInversePreparedCheckpoint,
  termination: object): Promise<CurrentFootprintInverseNativeDeletePersistenceResult> {
  const bindings = requireOriginalCurrentFootprintInverseNativeDeletePersistenceOriginAfterOriginalExit(origin, owner, prepared);
  const retained = { origin, owner, prepared, bindings, termination };
  current(retained);
  const prior = attempts.get(origin);
  if (prior !== undefined) {
    need(prior.owner === owner && prior.prepared === prepared && prior.termination === termination, "ORIGINAL_ATTEMPT");
    return prior.pending;
  }
  const gate = Promise.withResolvers<null>();
  const pending = (async (): Promise<CurrentFootprintInverseNativeDeletePersistenceResult> => {
    await gate.promise; current(retained);
    const after = await captureCurrentFootprintInverseClosedSnapshot(owner, termination); current(retained);
    const snapshot = requireCurrentFootprintInverseClosedSnapshot(owner, after);
    const completion = readerCompletion(after);
    need(bindings.main.source.before === bindings.main.beforeInventory && snapshot.inventory === after, "ORIGINAL_INVENTORIES");
    const delta = await compareCurrentFootprintInverseNativeDeleteClosedSqlDelta(bindings.main.beforeInventory, after,
      bindings.main.historyBaseline, bindings.main.bodyPlan, bindings.effects); current(retained);
    need(delta.targetUuid === bindings.main.bodyPlan.targetUuid && delta.maximumTicket === bindings.main.bodyPlan.ticket &&
      bindings.tail.historyUuid === bindings.effects.historyUuid &&
      bindings.projection.rows.historyUuid === bindings.effects.historyUuid &&
      bindings.tail.headIndexSha256 === bindings.projection.cache.headIndex.sha256 &&
      readerCompletion(after) === completion, "ORIGINAL_TOMBSTONE_AND_TAIL");
    const data: Readonly<CurrentFootprintInverseNativeDeletePersistenceData> = Object.freeze({
      profile: "private.current-footprint-inverse-native-delete-persistence-data.v1",
      targetUuid: delta.targetUuid, beforeLogicalSha256: bindings.main.beforeInventory.logicalSha256,
      afterLogicalSha256: after.logicalSha256, workerUploadSha256: bindings.main.bodyPlan.workerUploadSha256,
      maximumTicket: delta.maximumTicket, retainedDocuments: delta.retainedDocuments,
      visibleDocuments: delta.visibleDocuments,
      visibleRosterSha256: delta.visibleRosterSha256,
      targetSemanticSha256: delta.targetSemanticSha256, originalNativeCallerCompleted: true,
      originalSelectedPreferencesUnchanged: true, originalMainHistoryAndNaturalReadTailCompleted: true,
      originalRootAndWholeJobExited: true, completeClosedSqlRelationVerified: true,
      allPeerDocumentsAndStructureUnchanged: true, targetLogicallyDeleted: true, targetHistoryRetained: true,
      persistenceVerified: true, explicitSaveAttempts: 0, publicSdkParity: false,
      nativeManagerColdAbsenceVerified: false, coldAbsenceVerified: false, wholeInverseVerified: false, executionAuthorized: false,
    });
    const result: CurrentFootprintInverseNativeDeletePersistenceResult = Object.freeze({
      profile: "private.current-footprint-inverse-native-delete-persistence-result.v1",
    });
    const original = Object.freeze({ ...retained, snapshot, delta, data });
    completed.set(result, original);
    requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(result, owner, prepared);
    return result;
  })();
  attempts.set(origin, Object.freeze({ owner, prepared, termination, pending })); gate.resolve(null);
  return pending;
}
/** Historical persistence only. It neither reopens a project nor issues a
 * native manager/GET absence result from the SQL tombstone. */
export function requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(result: CurrentFootprintInverseNativeDeletePersistenceResult,
  owner: CurrentFootprintInverseNativeOwner, prepared: CurrentFootprintInversePreparedCheckpoint): Readonly<{
    origin: CurrentFootprintInverseNativeDeletePersistenceOrigin;
    bindings: CurrentFootprintInverseNativeDeletePersistenceOriginal;
    snapshot: CurrentFootprintCopyClosedSnapshot;
    delta: CurrentFootprintInverseNativeDeleteClosedSqlDelta;
    data: Readonly<CurrentFootprintInverseNativeDeletePersistenceData>;
  }> {
  const original = completed.get(result);
  need(original !== undefined && original.owner === owner && original.prepared === prepared, "ORIGINAL_RESULT");
  current(original);
  need(requireCurrentFootprintInverseClosedSnapshot(owner, original.snapshot.inventory) === original.snapshot &&
    canonicalJson(original.data).length <= 8192, "ORIGINAL_SNAPSHOT");
  return Object.freeze({ origin: original.origin, bindings: original.bindings, snapshot: original.snapshot, delta: original.delta, data: original.data });
}

/** Released native deletion -> distinct deleted cold-data handoff. This
 * issuer accepts no legacy saved checkpoint, supplied source or native owner. */
import { canonicalJson } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { verifyCurrentFootprintInverseV4NativeDeletePosteditPreopenSource } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintInverseNativeDeletePreopenSourceObservation } from "./current-footprint-copy-preopen-source.ts";
import { requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult } from "./current-footprint-inverse-native-delete-persistence.ts";
import type { CurrentFootprintInverseNativeDeletePersistenceResult } from "./current-footprint-inverse-native-delete-persistence.ts";
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import { deriveCurrentFootprintInverseNativeDeleteColdData } from "./current-footprint-inverse-native-delete-cold-data.ts";
import type { CurrentFootprintInverseNativeDeleteColdData } from "./current-footprint-inverse-native-delete-cold-data.ts";
import type { CurrentFootprintInverseNativeOwner } from "./current-footprint-inverse-v4-native-owner.ts";

export interface CurrentFootprintInverseNativeDeleteColdCheckpoint {
  readonly profile: "private.current-footprint-inverse-native-delete-cold-checkpoint.v1";
}
type Persistence = ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult>;
interface Original {
  readonly result: CurrentFootprintInverseNativeDeletePersistenceResult;
  readonly owner: CurrentFootprintInverseNativeOwner;
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly persistence: Persistence;
  readonly independent: NativeSqlInventory;
  readonly completion: ReturnType<typeof readerCompletion>;
  readonly data: CurrentFootprintInverseNativeDeleteColdData;
  readonly dataText: string;
  readonly preopen: CurrentFootprintInverseNativeDeletePreopenSourceObservation;
}
interface Attempt {
  readonly owner: CurrentFootprintInverseNativeOwner;
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly pending: Promise<CurrentFootprintInverseNativeDeleteColdCheckpoint>;
}
const attempts = new WeakMap<CurrentFootprintInverseNativeDeletePersistenceResult, Attempt>();
const issued = new WeakMap<CurrentFootprintInverseNativeDeleteColdCheckpoint, Original>();
function need(value: boolean, reason: string): asserts value {
  if (!value) { throw new Error(`INVERSE_NATIVE_DELETE_COLD_CHECKPOINT_${reason}`); }
}
function current(original: Pick<Original, "owner" | "prepared" | "result" | "persistence">): void {
  const same = requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(original.result, original.owner, original.prepared);
  need(same.origin === original.persistence.origin && same.bindings === original.persistence.bindings &&
    same.snapshot === original.persistence.snapshot && same.delta === original.persistence.delta && same.data === original.persistence.data, "ORIGINAL_PERSISTENCE");
  // The persistence getter has just rechecked the original Core class,
  // Descriptors, factory, exit and complete snapshot. Own fields are forbidden.
  const status = original.owner.status();
  need(status.released && status.helperClosed, "ORIGINAL_HELPER_RELEASE_REQUIRED");
}
/** The original capture/reader/descriptor reproof is retained before any
 * await. Failure consumes this handoff preparation; it grants no retry/open. */
export function prepareCurrentFootprintInverseNativeDeleteColdCheckpoint(result: CurrentFootprintInverseNativeDeletePersistenceResult,
  owner: CurrentFootprintInverseNativeOwner, prepared: CurrentFootprintInversePreparedCheckpoint): Promise<CurrentFootprintInverseNativeDeleteColdCheckpoint> {
  const persistence = requireOriginalCurrentFootprintInverseNativeDeletePersistenceResult(result, owner, prepared);
  const retained = { result, owner, prepared, persistence }; current(retained);
  const prior = attempts.get(result);
  if (prior !== undefined) {
    need(prior.owner === owner && prior.prepared === prepared, "ORIGINAL_ATTEMPT"); return prior.pending;
  }
  const gate = Promise.withResolvers<null>();
  const pending = (async (): Promise<CurrentFootprintInverseNativeDeleteColdCheckpoint> => {
    await gate.promise; current(retained);
    await verifyCurrentFootprintInverseV4NativeDeletePosteditPreopenSource(owner, persistence.snapshot.inventory); current(retained);
    const independent = await readExactSqlInventory({ checkpointPath: persistence.snapshot.checkpoint.checkpoint,
      expectedSha256: persistence.snapshot.checkpoint.checkpointSha256, runtime: persistence.bindings.main.source.runtime }); current(retained);
    const completion = readerCompletion(independent);
    need(independent !== persistence.snapshot.inventory && completion !== readerCompletion(persistence.snapshot.inventory) &&
      completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "INDEPENDENT_READER");
    await compareCompleteClosedSql(persistence.snapshot.inventory, independent); current(retained);
    const data = await deriveCurrentFootprintInverseNativeDeleteColdData(independent, {
      projectUuid: persistence.bindings.main.projectUuid, branchUuid: persistence.bindings.main.branchUuid,
      targetUuid: persistence.data.targetUuid, maximumTicket: persistence.data.maximumTicket,
    }); current(retained);
    need(data.afterLogicalSha256 === persistence.data.afterLogicalSha256 &&
      data.visibleRosterSha256 === persistence.data.visibleRosterSha256 &&
      data.targetSemanticSha256 === persistence.data.targetSemanticSha256 &&
      canonicalJson(data.cache) === canonicalJson(persistence.bindings.projection.cache), "ORIGINAL_DELETED_PROJECTION");
    const preopen = await verifyCurrentFootprintInverseV4NativeDeletePosteditPreopenSource(owner, persistence.snapshot.inventory); current(retained);
    const checkpoint: CurrentFootprintInverseNativeDeleteColdCheckpoint = Object.freeze({
      profile: "private.current-footprint-inverse-native-delete-cold-checkpoint.v1",
    });
    issued.set(checkpoint, Object.freeze({ ...retained, independent, completion, data, dataText: canonicalJson(data), preopen }));
    requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(checkpoint); return checkpoint;
  })();
  attempts.set(result, Object.freeze({ owner, prepared, pending })); gate.resolve(null); return pending;
}
/** Historical complete source data only. A cold factory must consume this
 * original token independently and exclude both persistent replay namespaces. */
export function requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(checkpoint: CurrentFootprintInverseNativeDeleteColdCheckpoint): Readonly<{
  owner: CurrentFootprintInverseNativeOwner; result: CurrentFootprintInverseNativeDeletePersistenceResult;
  persistence: Persistence; inventory: NativeSqlInventory; data: CurrentFootprintInverseNativeDeleteColdData;
  preopen: CurrentFootprintInverseNativeDeletePreopenSourceObservation;
}> {
  const original = issued.get(checkpoint); need(original !== undefined, "ORIGINAL_CHECKPOINT");
  current(original);
  need(readerCompletion(original.independent) === original.completion && canonicalJson(original.data) === original.dataText, "ORIGINAL_DATA");
  return Object.freeze({ owner: original.owner, result: original.result, persistence: original.persistence,
    inventory: original.independent, data: original.data, preopen: original.preopen });
}
/** Reproof immediately before a future separate open. The historical preopen
 * observation supplies no continuing file ownership or cache absence. */
export async function verifyCurrentFootprintInverseNativeDeleteColdCheckpoint(checkpoint: CurrentFootprintInverseNativeDeleteColdCheckpoint): Promise<CurrentFootprintInverseNativeDeletePreopenSourceObservation> {
  const original = requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(checkpoint);
  const observed = await verifyCurrentFootprintInverseV4NativeDeletePosteditPreopenSource(original.owner, original.persistence.snapshot.inventory);
  const same = requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(checkpoint);
  need(same.data === original.data && same.persistence.snapshot === original.persistence.snapshot, "ORIGINAL_PREOPEN"); return observed;
}

/** Complete logical forward/readback/inverse/readback join. Original effect
 * and reader objects are required; this performs no native open or mutation. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { currentFootprintCopyV2Before } from "./current-footprint-copy-v2-plan.ts";
import { completedCurrentFootprintCopyV2SqlSource } from "./current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlPlan, CurrentFootprintCopyV2SqlSource } from "./current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintDeleteSavedProjection, verifyCurrentFootprintDeleteSavedAbsence } from "./current-footprint-delete-saved-source.ts";
import { completedCurrentFootprintDeleteSqlSource } from "./current-footprint-delete-sql.ts";
import type { CurrentFootprintDeleteSqlPlan, CurrentFootprintDeleteSqlSource } from "./current-footprint-delete-sql.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

export interface CurrentFootprintCopyDeleteSqlInput {
  readonly copySqlPlan: CurrentFootprintCopyV2SqlPlan; readonly copyEffect: unknown;
  readonly copyAfter: Inventory; readonly copySaved: Inventory;
  readonly deleteSqlPlan: CurrentFootprintDeleteSqlPlan; readonly deleteEffect: unknown;
  readonly deleteAfter: Inventory; readonly deleteSaved: Inventory;
}
export interface CurrentFootprintCopyDeleteSqlRelation {
  readonly profile: "private.current-footprint-copy-delete-sql-lifecycle.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly sourceUuid: string; readonly targetUuid: string;
  readonly beforeSqlSha256: string; readonly copySqlSha256: string; readonly deleteSqlSha256: string;
  readonly copySavedSqlSha256: string; readonly deleteSavedSqlSha256: string;
  readonly originalReaderCount: 5; readonly historyAppends: 2;
  readonly retainedDocumentsBefore: number; readonly retainedDocumentsAfter: number; readonly visibleDocuments: number;
  readonly visibleRosterSha256: string;
  readonly completeCopyAndDeleteEffectsJoined: true; readonly exactReadbackSqlUnchanged: true;
  readonly originalVisibleRosterRestored: true; readonly originalDocumentsUnchanged: true;
  readonly createdCopyLogicallyDeleted: true; readonly createdCopyHistoryRetained: true;
  readonly databaseRestored: false; readonly nativeManagerAbsenceVerified: false;
  readonly persistentUploadReplayExcluded: false; readonly generationClosureVerified: false;
  readonly reopened: false; readonly nativeClockProvenanceVerified: false; readonly executionAuthorized: false;
}
interface Original {
  readonly input: CurrentFootprintCopyDeleteSqlInput; readonly before: Inventory;
  readonly copy: CurrentFootprintCopyV2SqlSource; readonly deletion: CurrentFootprintDeleteSqlSource;
  readonly inventories: readonly Inventory[]; readonly completions: readonly ReturnType<typeof readerCompletion>[];
}
const originals = new WeakMap<CurrentFootprintCopyDeleteSqlRelation, Original>();
const fields = ["copySqlPlan", "copyEffect", "copyAfter", "copySaved", "deleteSqlPlan", "deleteEffect", "deleteAfter", "deleteSaved"] as const;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_DELETE_SQL_LIFECYCLE_${detail}`); }
}
/** Capture references without invoking input accessors or proxy traps. */
function inputFields(input: CurrentFootprintCopyDeleteSqlInput): CurrentFootprintCopyDeleteSqlInput {
  need(input !== null && typeof input === "object" && !types.isProxy(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "INPUT");
  const actual = Reflect.ownKeys(input); need(actual.length === fields.length && actual.every(name => fields.some(field => field === name)), "INPUT_FIELDS");
  for (const name of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "INPUT_ACCESSORS");
  }
  // Every selected field is now an own data property on a non-Proxy receiver.
  // Capture synchronously before any await or caller callback can change it.
  return Object.freeze({ copySqlPlan: input.copySqlPlan, copyEffect: input.copyEffect,
    copyAfter: input.copyAfter, copySaved: input.copySaved, deleteSqlPlan: input.deleteSqlPlan,
    deleteEffect: input.deleteEffect, deleteAfter: input.deleteAfter, deleteSaved: input.deleteSaved });
}
/** Recheck both effect registries and the independent completed reader objects.
 * Matching hashes or copied source descriptors cannot replace these objects. */
function current(held: Original): void {
  const { input } = held;
  need(completedCurrentFootprintCopyV2SqlSource(input.copySqlPlan, input.copyEffect, input.copyAfter) === held.copy &&
    completedCurrentFootprintDeleteSqlSource(input.deleteSqlPlan, input.deleteEffect, input.deleteAfter) === held.deletion &&
    currentFootprintCopyV2Before(held.copy.copyPlan) === held.before && held.deletion.copySource === held.copy &&
    held.deletion.copyAfter === input.copyAfter && held.deletion.before === input.copySaved && held.deletion.after === input.deleteAfter,
  "ORIGINAL_EFFECT_CHAIN");
  for (const [index, inventory] of held.inventories.entries()) {
    const completion = readerCompletion(inventory);
    need(completion === held.completions[index] && completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
      "ORIGINAL_COMPLETE_READER");
  }
}
/** Join five completed SQL readers in the exact original effect order. The
 * saved-copy reader must be the inverse's actual baseline. Readback equality
 * proves persisted data relationships only, without asserting an editor reopen.
 * A future four-generation native coordinator calls this after its inverse
 * readback root/Job exit and final complete snapshot. The current two-generation
 * forward coordinator has no inverse readers and must not claim this result.
 */
export async function verifyCurrentFootprintCopyDeleteSqlLifecycle(raw: CurrentFootprintCopyDeleteSqlInput): Promise<CurrentFootprintCopyDeleteSqlRelation> {
  const input = inputFields(raw);
  const copy = completedCurrentFootprintCopyV2SqlSource(input.copySqlPlan, input.copyEffect, input.copyAfter);
  const deletion = completedCurrentFootprintDeleteSqlSource(input.deleteSqlPlan, input.deleteEffect, input.deleteAfter);
  const before = currentFootprintCopyV2Before(copy.copyPlan);
  const inventories = Object.freeze([before, input.copyAfter, input.copySaved, input.deleteAfter, input.deleteSaved]);
  const completions = Object.freeze(inventories.map(inventory => readerCompletion(inventory)));
  need(new Set(inventories).size === 5 && new Set(completions).size === 5, "INDEPENDENT_READERS");
  const held: Original = Object.freeze({ input, before, copy, deletion, inventories, completions }); current(held);
  need(copy.append.targetUuid === deletion.targetUuid && copy.copyPlan.source.projectUuid === deletion.projectUuid &&
    copy.copyPlan.source.branchUuid === deletion.branchUuid, "TARGET_IDENTITY");
  await compareCompleteClosedSql(input.copyAfter, input.copySaved); current(held);
  const projection = await prepareCurrentFootprintDeleteSavedProjection(input.deleteSqlPlan, input.deleteEffect, input.deleteAfter); current(held);
  await verifyCurrentFootprintDeleteSavedAbsence(projection, input.deleteSaved); current(held);
  const identity = { projectUuid: deletion.projectUuid, branchUuid: deletion.branchUuid };
  const initial = await decodeCurrentFootprintSourceHistory(before, identity); current(held);
  const final = await decodeCurrentFootprintSourceHistory(input.deleteSaved, identity); current(held);
  need(final.chunks.length === initial.chunks.length + 2 && final.links.length === initial.links.length + 2 &&
    canonicalJson(final.chunks.slice(0, -2)) === canonicalJson(initial.chunks) &&
    canonicalJson(final.links.slice(0, -2)) === canonicalJson(initial.links), "ORIGINAL_HISTORY_PREFIX");
  const observed = new Map(final.history.documents.map(document => [document.uuid, document]));
  need(observed.size === initial.history.documents.length + 1 && !initial.history.documents.some(document => document.uuid === deletion.targetUuid),
    "ONLY_CREATED_COPY_ADDED");
  for (const document of initial.history.documents) {
    const peer = observed.get(document.uuid);
    need(peer !== undefined && peer.semanticSha256 === document.semanticSha256, "ORIGINAL_DOCUMENT_CHANGED");
  }
  const target = observed.get(deletion.targetUuid);
  need(target !== undefined && target.docType === "FOOTPRINT" && isNativeDocumentDeleted(target), "RETAINED_TOMBSTONE");
  const visible = initial.history.documents.filter(document => !isNativeDocumentDeleted(document));
  const finalVisible = final.history.documents.filter(document => !isNativeDocumentDeleted(document));
  const roster = (documents: typeof visible): readonly Readonly<{ uuid: string; docType: string; semanticSha256: string }>[] =>
    documents.map(document => ({ uuid: document.uuid, docType: document.docType, semanticSha256: document.semanticSha256 }))
      .toSorted((left, right) => left.uuid < right.uuid ? -1 : Number(left.uuid > right.uuid));
  const originalRoster = roster(visible);
  need(canonicalJson(originalRoster) === canonicalJson(roster(finalVisible)) && before.logicalSha256 !== input.deleteSaved.logicalSha256,
    "VISIBLE_ROSTER_OR_RETAINED_HISTORY"); current(held);
  const relation: CurrentFootprintCopyDeleteSqlRelation = Object.freeze({ profile: "private.current-footprint-copy-delete-sql-lifecycle.v1",
    ...identity, sourceUuid: copy.copyPlan.source.footprintUuid, targetUuid: deletion.targetUuid,
    beforeSqlSha256: before.logicalSha256, copySqlSha256: input.copyAfter.logicalSha256, deleteSqlSha256: input.deleteAfter.logicalSha256,
    copySavedSqlSha256: input.copySaved.logicalSha256, deleteSavedSqlSha256: input.deleteSaved.logicalSha256,
    originalReaderCount: 5, historyAppends: 2, retainedDocumentsBefore: initial.history.documents.length,
    retainedDocumentsAfter: final.history.documents.length, visibleDocuments: visible.length, visibleRosterSha256: sha256Json(originalRoster),
    completeCopyAndDeleteEffectsJoined: true, exactReadbackSqlUnchanged: true, originalVisibleRosterRestored: true,
    originalDocumentsUnchanged: true, createdCopyLogicallyDeleted: true, createdCopyHistoryRetained: true,
    databaseRestored: false, nativeManagerAbsenceVerified: false, persistentUploadReplayExcluded: false,
    generationClosureVerified: false, reopened: false, nativeClockProvenanceVerified: false, executionAuthorized: false });
  originals.set(relation, held); return relation;
}
/** Retrieve only the original completed logical relation. Historical receipt
 * data supplies no process handle, reopen, replay exclusion or writer permit.
 */
export function requireCurrentFootprintCopyDeleteSqlLifecycle(relation: CurrentFootprintCopyDeleteSqlRelation): CurrentFootprintCopyDeleteSqlRelation {
  const held = originals.get(relation); need(held !== undefined, "ORIGINAL_RELATION"); current(held); return relation;
}

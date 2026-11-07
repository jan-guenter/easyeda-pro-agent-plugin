/** Separate observed-version saved SQL tombstone projection. Deleted documents remain in history;
 * no native manager enumeration, reopened owner or replay exclusion is issued. */
import type { CurrentFootprintDeleteWorkerEncoding } from "./current-footprint-delete-observed-plan.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { completedCurrentFootprintDeleteObservedSqlSource } from "./current-footprint-delete-sql.ts";
import type { CurrentFootprintDeleteObservedSqlPlan, CurrentFootprintDeleteSqlSource } from "./current-footprint-delete-sql.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export interface CurrentFootprintDeleteObservedSavedProjection {
  readonly profile: "private.current-footprint-delete-saved-projection.v2";
  readonly workerEncoding: CurrentFootprintDeleteWorkerEncoding;
  readonly targetUuid: string; readonly afterSqlSha256: string; readonly maximumTicket: number;
  readonly retainedDocuments: number; readonly visibleDocuments: number; readonly retainedTargetRecords: number;
  readonly visibleRosterSha256: string; readonly targetSemanticSha256: string;
  readonly targetLogicallyDeleted: true; readonly targetHistoryRetained: true;
  readonly nativeManagerAbsenceVerified: false; readonly reopened: false; readonly executionAuthorized: false;
}
interface Original {
  readonly plan: CurrentFootprintDeleteObservedSqlPlan; readonly effect: unknown; readonly after: Inventory;
  readonly source: CurrentFootprintDeleteSqlSource; readonly projection: CurrentFootprintDeleteObservedSavedProjection;
}
const originals = new WeakMap<CurrentFootprintDeleteObservedSavedProjection, Original>();
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_DELETE_OBSERVED_SAVED: ${detail}`); } }
function original(projection: CurrentFootprintDeleteObservedSavedProjection): Original {
  const held = originals.get(projection); need(held !== undefined && held.projection === projection, "original projection required");
  need(completedCurrentFootprintDeleteObservedSqlSource(held.plan, held.effect, held.after) === held.source, "original SQL relation changed"); return held;
}
/** This derives logical absence from the original completed delete relation.
 * An empty list or missing getter response cannot replace the retained marker. */
export async function prepareCurrentFootprintDeleteObservedSavedProjection(plan: CurrentFootprintDeleteObservedSqlPlan, effect: unknown,
  after: Inventory): Promise<CurrentFootprintDeleteObservedSavedProjection> {
  const source = completedCurrentFootprintDeleteObservedSqlSource(plan, effect, after);
  const completion = readerCompletion(after);
  const decoded = await decodeCurrentFootprintSourceHistory(after, { projectUuid: source.projectUuid, branchUuid: source.branchUuid });
  const target = decoded.history.documents.find(document => document.uuid === source.targetUuid);
  need(target !== undefined && target.docType === "FOOTPRINT" && isNativeDocumentDeleted(target) && decoded.maximumTicket === plan.expectedTicket,
    "retained target tombstone or ticket differs");
  const visible = decoded.history.documents.filter(document => !isNativeDocumentDeleted(document));
  need(visible.every(document => document.uuid !== source.targetUuid), "deleted target remains visible");
  need(completedCurrentFootprintDeleteObservedSqlSource(plan, effect, after) === source && readerCompletion(after) === completion, "original reader changed");
  const projection: CurrentFootprintDeleteObservedSavedProjection = Object.freeze({ profile: "private.current-footprint-delete-saved-projection.v2", workerEncoding: plan.workerEncoding,
    targetUuid: source.targetUuid, afterSqlSha256: after.logicalSha256, maximumTicket: decoded.maximumTicket,
    retainedDocuments: decoded.history.documents.length, visibleDocuments: visible.length, retainedTargetRecords: target.records.length,
    visibleRosterSha256: sha256Json(visible.map(document => ({ uuid: document.uuid, docType: document.docType, semanticSha256: document.semanticSha256 }))),
    targetSemanticSha256: target.semanticSha256, targetLogicallyDeleted: true, targetHistoryRetained: true,
    nativeManagerAbsenceVerified: false, reopened: false, executionAuthorized: false });
  originals.set(projection, { plan, effect, after, source, projection }); return projection;
}
/** Compare an independently completed reader, including every SQL cell and
 * the complete retained history. This still proves no actual editor reopen. */
export async function verifyCurrentFootprintDeleteObservedSavedAbsence(projection: CurrentFootprintDeleteObservedSavedProjection,
  saved: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const held = original(projection);
  const completion = readerCompletion(saved);
  need(saved !== held.after && completion !== readerCompletion(held.after), "independently completed saved SQL reader required");
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "complete saved SQL reader required");
  await compareCompleteClosedSql(held.after, saved); original(projection);
  const identity = { projectUuid: held.source.projectUuid, branchUuid: held.source.branchUuid };
  const expected = await decodeCurrentFootprintSourceHistory(held.after, identity), observed = await decodeCurrentFootprintSourceHistory(saved, identity);
  need(canonicalJson(expected.chunks) === canonicalJson(observed.chunks) && canonicalJson(expected.links) === canonicalJson(observed.links) &&
    expected.history.semanticSha256 === observed.history.semanticSha256, "complete saved history differs");
  const target = observed.history.documents.find(document => document.uuid === projection.targetUuid);
  const visible = observed.history.documents.filter(document => !isNativeDocumentDeleted(document));
  need(target !== undefined && target.docType === "FOOTPRINT" && isNativeDocumentDeleted(target) && target.semanticSha256 === projection.targetSemanticSha256 &&
    target.records.length === projection.retainedTargetRecords && visible.every(document => document.uuid !== projection.targetUuid) &&
    visible.length === projection.visibleDocuments && observed.history.documents.length === projection.retainedDocuments &&
    observed.maximumTicket === projection.maximumTicket && sha256Json(visible.map(document => ({ uuid: document.uuid,
      docType: document.docType, semanticSha256: document.semanticSha256 }))) === projection.visibleRosterSha256,
  "saved tombstone, retained records or peer visibility differs");
  need(readerCompletion(saved) === completion, "saved reader changed"); original(projection);
  return Object.freeze({ profile: "private.current-footprint-delete-saved-sql-absence.v2", workerEncoding: held.plan.workerEncoding, targetUuid: projection.targetUuid,
    afterSqlSha256: projection.afterSqlSha256, savedSqlSha256: saved.logicalSha256, exactLogicalSqlUnchanged: true,
    targetLogicallyDeleted: true, targetHistoryRetained: true, allPeerDocumentsUnchanged: true,
    nativeManagerAbsenceVerified: false, persistentUploadReplayExcluded: false, generationClosureVerified: false,
    reopened: false, executionAuthorized: false });
}

/** Historical data only, bound to the actual original completed v2 SQL source.
 * This does not issue a replay exclusion, worker, native manager or open route. */
export function currentFootprintDeleteObservedSavedSource(projection: CurrentFootprintDeleteObservedSavedProjection): Readonly<{
  plan: CurrentFootprintDeleteObservedSqlPlan; effect: unknown; after: Inventory; source: CurrentFootprintDeleteSqlSource;
}> {
  const held = original(projection); return Object.freeze({ plan: held.plan, effect: held.effect, after: held.after, source: held.source });
}

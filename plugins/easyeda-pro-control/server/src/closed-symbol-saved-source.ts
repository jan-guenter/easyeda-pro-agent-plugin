/** Private historical SQL-to-content relation issuer. No live/runtime authority. */
import { canonicalJson, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { originalClosedSymbolEditSource, revalidateOriginalClosedSymbolEditSource } from "./closed-symbol-sql-comparison.ts";
import type { OriginalClosedSymbolEditSource } from "./closed-symbol-sql-comparison.ts";
import { decodeRawHistoryForOriginalSymbolSqlPlan } from "./symbol-sql-comparator.ts";
import type { DecodedSymbolSqlRawHistory } from "./symbol-sql-comparator.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection, verifySavedSymbolContent } from "./saved-symbol-projection.ts";
import type { SavedSymbolProjection } from "./saved-symbol-projection.ts";

export interface OriginalSavedSymbolSource {
  readonly profile: "private.closed-symbol-saved-source.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly editComparisonResultSha256: string; readonly editComparisonArtifactSha256: string;
  readonly preparedSqlPlanSha256: string; readonly editCopyReceiptSha256: string; readonly editSqlSha256: string;
  readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string; readonly targetUuid: string;
  readonly maximumTicket: number; readonly headerEditVersion: string | null;
  readonly rawHistorySha256: string; readonly rawHistoryBytes: number; readonly chunkCount: number;
  readonly projectedContentBytes: number;
  readonly executionAuthorized: false; readonly producerBindingVerified: false; readonly completionProved: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly operationId: string; readonly descriptor: OriginalSavedSymbolSource;
  readonly text: string; readonly source: OriginalClosedSymbolEditSource; readonly projection: SavedSymbolProjection;
  readonly chunks: readonly string[]; readonly links: DecodedSymbolSqlRawHistory["links"];
}
const issued = new WeakMap<object, Original>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function original(value: unknown, engine: EasyedaControlEngine, operationId: string): Original {
  need(value !== null && typeof value === "object", "Original saved-symbol source missing.");
  const owner = issued.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && canonicalJson(value) === owner.text,
    "Original successful saved-symbol source required.");
  need(originalClosedSymbolEditSource(owner.source.comparison, engine, operationId) === owner.source,
    "Saved-symbol SQL source original changed.");
  return owner;
}
export function assertOriginalSavedSymbolSource(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalSavedSymbolSource {
  return original(value, engine, operationId).descriptor;
}
export async function revalidateOriginalSavedSymbolSource(value: unknown, engine: EasyedaControlEngine, operationId: string): Promise<OriginalSavedSymbolSource> {
  const owner = original(value, engine, operationId);
  need(await revalidateOriginalClosedSymbolEditSource(owner.source.comparison, engine, operationId) === owner.source,
    "Saved-symbol historical SQL source changed.");
  need(original(value, engine, operationId) === owner, "Saved-symbol source changed during historical reproof.");
  return owner.descriptor;
}
export async function prepareOriginalSavedSymbolSource(value: unknown, engine: EasyedaControlEngine, operationId: string): Promise<OriginalSavedSymbolSource> {
  const source = originalClosedSymbolEditSource(value, engine, operationId);
  const current = (): void => { need(originalClosedSymbolEditSource(value, engine, operationId) === source, "Saved-symbol original SQL comparison changed."); };
  need(await revalidateOriginalClosedSymbolEditSource(value, engine, operationId) === source, "Saved-symbol historical SQL source changed."); current();
  const { metadataPlan, sqlPlan } = source.preparation;
  const decoded = await decodeRawHistoryForOriginalSymbolSqlPlan(sqlPlan, source.inventory); current();
  need(decoded.history.projectUuid === metadataPlan.projectUuid && decoded.history.branchUuid === metadataPlan.branchUuid &&
    decoded.history.projectOwnerUuid === metadataPlan.ownerUuid && decoded.maximumTicket === sqlPlan.expectedTicket,
    "Saved-symbol decoded identity or ticket differs from the original prepared operation.");
  const projection = await prepareSavedSymbolProjection({ chunks: decoded.chunks, targetUuid: metadataPlan.targetUuid,
    maximumTicket: sqlPlan.expectedTicket, currentEditVersion: metadataPlan.headerEditVersion }); current();
  const projectedContentBytes = Buffer.byteLength(expectedSavedSymbolContent(projection, "0".repeat(16)));
  need(projectedContentBytes > 0 && projectedContentBytes <= 65_536, "Saved-symbol first-stage 64-KiB projected content bound exceeded.");
  const body = { profile: "private.closed-symbol-saved-source.v1" as const, operationId,
    editComparisonResultSha256: source.comparison.resultSha256, editComparisonArtifactSha256: source.comparisonArtifactSha256,
    preparedSqlPlanSha256: source.preparation.preparedSqlPlanSha256, editCopyReceiptSha256: source.copy.receiptSha256,
    editSqlSha256: source.inventory.logicalSha256, projectUuid: metadataPlan.projectUuid, branchUuid: metadataPlan.branchUuid,
    ownerUuid: metadataPlan.ownerUuid, targetUuid: metadataPlan.targetUuid, maximumTicket: sqlPlan.expectedTicket,
    headerEditVersion: metadataPlan.headerEditVersion, rawHistorySha256: projection.rawHistorySha256,
    rawHistoryBytes: projection.rawHistoryBytes, chunkCount: decoded.chunks.length, projectedContentBytes,
    executionAuthorized: false as const, producerBindingVerified: false as const, completionProved: false as const };
  const descriptor: OriginalSavedSymbolSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  need(await revalidateOriginalClosedSymbolEditSource(value, engine, operationId) === source, "Saved-symbol final historical SQL source changed."); current();
  issued.set(descriptor, { engine, operationId, descriptor, text: canonicalJson(descriptor), source, projection,
    chunks: decoded.chunks, links: decoded.links });
  return descriptor;
}
/** Exact data relation. The owning tracked read must independently bind its reply. */
export function verifyOriginalSavedSymbolContent(value: unknown, engine: EasyedaControlEngine, operationId: string,
  observation: unknown): Readonly<Record<string, unknown>> {
  const owner = original(value, engine, operationId);
  const relation = verifySavedSymbolContent(owner.projection, observation);
  return Object.freeze({ ...relation, sourceSha256: owner.descriptor.sourceSha256,
    editComparisonResultSha256: owner.descriptor.editComparisonResultSha256 });
}

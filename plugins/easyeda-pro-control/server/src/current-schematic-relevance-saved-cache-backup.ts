/** Original schematic saved-cache data and publication. The released writer
 * supplies historical data; this fresh reader owns its actual cache receipts. */
/* oxlint-disable import/max-dependencies -- This original-reference data issuer joins both complete cache ledgers, purpose custody and independent managed publication; none grants native deletion. */
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import { originalCurrentSchematicRelevanceSavedReadbackTarget, requireOriginalCurrentSchematicRelevanceSavedCacheOrigin } from "./current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { CurrentSchematicRelevanceSavedCacheOrigin } from "./current-schematic-relevance-saved-cache-origin.ts";
import type { CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheMetadataSnapshot } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { compareCurrentScopedCacheBackupData, requireCurrentScopedCacheBackupData } from "./current-scoped-cache-backup-data.ts";
import type { CurrentScopedCacheBackupData } from "./current-scoped-cache-backup-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const maximumBytes = 131_072;
export interface CurrentSchematicRelevanceSavedCacheBackupData extends CurrentScopedCacheBackupData {
  readonly schema: "private.current-schematic-relevance-saved-cache-backup-data.v1";
  readonly scope: Readonly<{ operationId: string; rawWindowsPath: string; projectUuid: string; branchUuid: string; pageUuid: string; schematicUuid: string;
    sourceSha256: string; checkpointSha256: string; closedLogicalSha256: string }>;
}
interface Original {
  readonly owner: CurrentSchematicRelevanceSavedReadbackOwner; readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan; readonly origin: CurrentSchematicRelevanceSavedCacheOrigin;
  readonly cdp: CurrentPcbViaSavedCacheSnapshot; readonly metadata: CurrentPcbViaSavedCacheMetadataSnapshot; readonly compared: CurrentScopedCacheBackupData;
  readonly source: ReturnType<typeof requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan>; readonly bindings: ReturnType<typeof requireOriginalCurrentSchematicRelevanceSavedCacheOrigin>;
  readonly text: string; readonly sha256: string;
}
const originals = new WeakMap<CurrentSchematicRelevanceSavedCacheBackupData, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_SAVED_CACHE_BACKUP_ORIGINAL"); } }
function current(original: Original): void {
  const { bindings, cdp, metadata } = original;
  need(requireOriginalCurrentSchematicRelevanceSavedCacheOrigin(original.origin, original.owner, original.prepared) === bindings && originalCurrentSchematicRelevanceSavedReadbackTarget(original.owner) === original.prepared && requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(original.prepared).data === original.source.data && requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(original.prepared).closed === original.source.closed);
  bindings.requireSnapshot(cdp); bindings.requireMetadataSnapshot(metadata);
  for (const packet of cdp.packets) { bindings.requirePacket(packet); }
  for (const packet of metadata.packets) { bindings.requireMetadataPacket(packet); }
  requireCurrentScopedCacheBackupData(original.compared, bindings.projectUuid, cdp, metadata);
}
export function buildCurrentSchematicRelevanceSavedCacheBackupData(owner: CurrentSchematicRelevanceSavedReadbackOwner, prepared: GeneratedSchematicRelevanceSavedReadbackPlan,
  origin: CurrentSchematicRelevanceSavedCacheOrigin, cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataSnapshot): CurrentSchematicRelevanceSavedCacheBackupData {
  const bindings = requireOriginalCurrentSchematicRelevanceSavedCacheOrigin(origin, owner, prepared), source = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(prepared);
  need(originalCurrentSchematicRelevanceSavedReadbackTarget(owner) === prepared);
  bindings.requireSnapshot(cdp); bindings.requireMetadataSnapshot(metadata);
  need(bindings.projectUuid === source.data.target.projectUuid && source.data.target.sourceSha256 === source.closed.checkpoint.target.sourceSha256 && source.data.loading.sourceSha256 === source.data.target.sourceSha256);
  const compared = compareCurrentScopedCacheBackupData(bindings.projectUuid, cdp, metadata);
  const scope = freezeDeep({ operationId: source.data.operationId, rawWindowsPath: source.data.target.rawWindowsPath, projectUuid: source.data.target.projectUuid,
    branchUuid: source.data.target.branchUuid, pageUuid: source.data.target.pageUuid, schematicUuid: source.data.target.schematicUuid, sourceSha256: source.data.target.sourceSha256,
    checkpointSha256: source.closed.checkpoint.preparationCheckpoint.sha256, closedLogicalSha256: source.data.loading.logicalSha256 });
  need(sha256Text(scope.rawWindowsPath) === scope.projectUuid && /^[a-f\d]{64}$/u.test(scope.closedLogicalSha256));
  const data: CurrentSchematicRelevanceSavedCacheBackupData = freezeDeep({ schema: "private.current-schematic-relevance-saved-cache-backup-data.v1", scope, ...compared });
  const text = canonicalJson(data); need(Buffer.byteLength(`${text}\n`) <= maximumBytes);
  const original = Object.freeze({ owner, prepared, origin, cdp, metadata, compared, source, bindings, text, sha256: sha256Text(text) }); current(original); originals.set(data, original); return data;
}
export function requireCurrentSchematicRelevanceSavedCacheBackupData(data: CurrentSchematicRelevanceSavedCacheBackupData, owner: CurrentSchematicRelevanceSavedReadbackOwner,
  prepared: GeneratedSchematicRelevanceSavedReadbackPlan, origin: CurrentSchematicRelevanceSavedCacheOrigin, cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataSnapshot): void {
  const original = originals.get(data); need(original !== undefined && original.owner === owner && original.prepared === prepared && original.origin === origin && original.cdp === cdp && original.metadata === metadata && original.text === canonicalJson(data)); current(original);
}
export interface CurrentSchematicRelevanceSavedCachePublishedData {
  readonly schema: "private.current-schematic-relevance-saved-cache-published-data.v1";
  readonly artifact: Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>; readonly dataSha256: string;
  readonly completeDataDurablyPublished: true; readonly nativeProvenanceVerified: false; readonly cacheDeletionAuthorized: false;
}
const publications = new WeakMap<CurrentSchematicRelevanceSavedCachePublishedData, Readonly<{ data: CurrentSchematicRelevanceSavedCacheBackupData; text: string }>>();
const pending = new WeakMap<CurrentSchematicRelevanceSavedCacheBackupData, Promise<CurrentSchematicRelevanceSavedCachePublishedData>>();
export function publishCurrentSchematicRelevanceSavedCacheBackupData(data: CurrentSchematicRelevanceSavedCacheBackupData): Promise<CurrentSchematicRelevanceSavedCachePublishedData> {
  const original = originals.get(data); need(original !== undefined && original.text === canonicalJson(data)); current(original);
  const prior = pending.get(data); if (prior !== undefined) { return prior; }
  const reprove = (): void => { need(originals.get(data) === original && original.text === canonicalJson(data)); current(original); };
  const promise = (async (): Promise<CurrentSchematicRelevanceSavedCachePublishedData> => {
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "schematic-relevance-saved-cache-backup")); reprove();
    const artifact = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Complete supported schematic saved-cache backup data",
      Buffer.from(`${original.text}\n`), "schematic-relevance-saved-cache-backup", (): Promise<void> => { reprove(); return Promise.resolve(); }); reprove();
    const value: CurrentSchematicRelevanceSavedCachePublishedData = freezeDeep({ schema: "private.current-schematic-relevance-saved-cache-published-data.v1", artifact, dataSha256: original.sha256,
      completeDataDurablyPublished: true, nativeProvenanceVerified: false, cacheDeletionAuthorized: false });
    publications.set(value, Object.freeze({ data, text: canonicalJson(value) })); await verifyCurrentSchematicRelevanceSavedCachePublishedData(value, data); reprove(); return value;
  })(); pending.set(data, promise); return promise;
}
export async function verifyCurrentSchematicRelevanceSavedCachePublishedData(value: CurrentSchematicRelevanceSavedCachePublishedData, data: CurrentSchematicRelevanceSavedCacheBackupData): Promise<void> {
  const original = originals.get(data), publication = publications.get(value);
  need(publication !== undefined && publication.data === data && original !== undefined && publication.text === canonicalJson(value));
  const reprove = (): void => { need(publications.get(value) === publication && originals.get(data) === original && original.text === canonicalJson(data) && publication.text === canonicalJson(value)); current(original); };
  reprove(); await verifyExactManagedArtifact(value.artifact); reprove(); const raw = await readArtifact(value.artifact.path, 0, maximumBytes); reprove();
  need(raw.eof && raw.text === `${original.text}\n` && value.dataSha256 === original.sha256); await verifyExactManagedArtifact(value.artifact); reprove();
}

/** Literal lazy-import contract used only by the original Core. */
export interface CurrentSchematicRelevanceSavedCacheBackupModule {
  readonly buildCurrentSchematicRelevanceSavedCacheBackupData: typeof buildCurrentSchematicRelevanceSavedCacheBackupData;
  readonly requireCurrentSchematicRelevanceSavedCacheBackupData: typeof requireCurrentSchematicRelevanceSavedCacheBackupData;
  readonly publishCurrentSchematicRelevanceSavedCacheBackupData: typeof publishCurrentSchematicRelevanceSavedCacheBackupData;
  readonly verifyCurrentSchematicRelevanceSavedCachePublishedData: typeof verifyCurrentSchematicRelevanceSavedCachePublishedData;
}

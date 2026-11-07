/** Original inverse data and publication. Runtime ownership stays with the
 * current inverse factory; the earlier saved owner supplies historical data. */
/* oxlint-disable import/max-dependencies -- This original-reference data issuer joins both complete cache ledgers, purpose custody and independent managed publication; none grants native deletion. */
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import { originalCurrentFootprintInverseNativeSource, requireOriginalCurrentFootprintInverseCacheOrigin } from "./current-footprint-inverse-native-owner.ts";
import type { CurrentFootprintInverseNativeOwner } from "./current-footprint-inverse-native-owner.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseCacheOrigin } from "./current-footprint-inverse-cache-origin.ts";
import type { CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheMetadataSnapshot } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { compareCurrentScopedCacheBackupData, requireCurrentScopedCacheBackupData } from "./current-scoped-cache-backup-data.ts";
import type { CurrentScopedCacheBackupData } from "./current-scoped-cache-backup-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const maximumBytes = 131_072;
export interface CurrentFootprintInverseCacheBackupData extends CurrentScopedCacheBackupData {
  readonly schema: "private.current-footprint-inverse-cache-backup-data.v1";
  readonly scope: Readonly<{ operationId: string; rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string;
    sourceSha256: string; checkpointSha256: string; closedLogicalSha256: string }>;
}
interface Original {
  readonly owner: CurrentFootprintInverseNativeOwner; readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly origin: CurrentFootprintInverseCacheOrigin;
  readonly cdp: CurrentPcbViaSavedCacheSnapshot; readonly metadata: CurrentPcbViaSavedCacheMetadataSnapshot; readonly compared: CurrentScopedCacheBackupData;
  readonly source: ReturnType<typeof originalCurrentFootprintInverseNativeSource>; readonly bindings: ReturnType<typeof requireOriginalCurrentFootprintInverseCacheOrigin>;
  readonly text: string; readonly sha256: string;
}
const originals = new WeakMap<CurrentFootprintInverseCacheBackupData, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_CACHE_BACKUP_ORIGINAL"); } }
function current(original: Original): void {
  const { bindings, cdp, metadata } = original;
  need(requireOriginalCurrentFootprintInverseCacheOrigin(original.origin, original.owner, original.prepared) === bindings && originalCurrentFootprintInverseNativeSource(original.owner) === original.source);
  bindings.requireSnapshot(cdp); bindings.requireMetadataSnapshot(metadata);
  for (const packet of cdp.packets) { bindings.requirePacket(packet); }
  for (const packet of metadata.packets) { bindings.requireMetadataPacket(packet); }
  requireCurrentScopedCacheBackupData(original.compared, bindings.projectUuid, cdp, metadata);
}
export function buildCurrentFootprintInverseCacheBackupData(owner: CurrentFootprintInverseNativeOwner, prepared: CurrentFootprintForwardSavedCheckpoint,
  origin: CurrentFootprintInverseCacheOrigin, cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataSnapshot): CurrentFootprintInverseCacheBackupData {
  const bindings = requireOriginalCurrentFootprintInverseCacheOrigin(origin, owner, prepared), source = originalCurrentFootprintInverseNativeSource(owner);
  bindings.requireSnapshot(cdp); bindings.requireMetadataSnapshot(metadata);
  need(bindings.projectUuid === source.target.projectUuid && source.target.expectedSourceSha256 === source.checkpoint.sourceSha256 && source.before.checkpointSha256 === source.checkpoint.checkpointSha256);
  const compared = compareCurrentScopedCacheBackupData(bindings.projectUuid, cdp, metadata);
  const scope = freezeDeep({ operationId: source.operationId, rawWindowsPath: source.target.rawWindowsPath, projectUuid: source.target.projectUuid,
    branchUuid: source.target.branchUuid, documentUuid: source.target.documentUuid, sourceSha256: source.target.expectedSourceSha256,
    checkpointSha256: source.checkpoint.checkpointSha256, closedLogicalSha256: source.before.logicalSha256 });
  need(sha256Text(scope.rawWindowsPath) === scope.projectUuid && /^[a-f\d]{64}$/u.test(scope.closedLogicalSha256));
  const data: CurrentFootprintInverseCacheBackupData = freezeDeep({ schema: "private.current-footprint-inverse-cache-backup-data.v1", scope, ...compared });
  const text = canonicalJson(data); need(Buffer.byteLength(`${text}\n`) <= maximumBytes);
  const original = Object.freeze({ owner, prepared, origin, cdp, metadata, compared, source, bindings, text, sha256: sha256Text(text) }); current(original); originals.set(data, original); return data;
}
export function requireCurrentFootprintInverseCacheBackupData(data: CurrentFootprintInverseCacheBackupData, owner: CurrentFootprintInverseNativeOwner,
  prepared: CurrentFootprintForwardSavedCheckpoint, origin: CurrentFootprintInverseCacheOrigin, cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataSnapshot): void {
  const original = originals.get(data); need(original !== undefined && original.owner === owner && original.prepared === prepared && original.origin === origin && original.cdp === cdp && original.metadata === metadata && original.text === canonicalJson(data)); current(original);
}
export interface CurrentFootprintInverseCachePublishedData {
  readonly schema: "private.current-footprint-inverse-cache-published-data.v1";
  readonly artifact: Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>; readonly dataSha256: string;
  readonly completeDataDurablyPublished: true; readonly nativeProvenanceVerified: false; readonly cacheDeletionAuthorized: false;
}
const publications = new WeakMap<CurrentFootprintInverseCachePublishedData, Readonly<{ data: CurrentFootprintInverseCacheBackupData; text: string }>>();
const pending = new WeakMap<CurrentFootprintInverseCacheBackupData, Promise<CurrentFootprintInverseCachePublishedData>>();
export function publishCurrentFootprintInverseCacheBackupData(data: CurrentFootprintInverseCacheBackupData): Promise<CurrentFootprintInverseCachePublishedData> {
  const original = originals.get(data); need(original !== undefined && original.text === canonicalJson(data)); current(original);
  const prior = pending.get(data); if (prior !== undefined) { return prior; }
  const reprove = (): void => { need(originals.get(data) === original && original.text === canonicalJson(data)); current(original); };
  const promise = (async (): Promise<CurrentFootprintInverseCachePublishedData> => {
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "footprint-inverse-cache-backup")); reprove();
    const artifact = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Complete supported original inverse cache backup data",
      Buffer.from(`${original.text}\n`), "footprint-inverse-cache-backup", (): Promise<void> => { reprove(); return Promise.resolve(); }); reprove();
    const value: CurrentFootprintInverseCachePublishedData = freezeDeep({ schema: "private.current-footprint-inverse-cache-published-data.v1", artifact, dataSha256: original.sha256,
      completeDataDurablyPublished: true, nativeProvenanceVerified: false, cacheDeletionAuthorized: false });
    publications.set(value, Object.freeze({ data, text: canonicalJson(value) })); await verifyCurrentFootprintInverseCachePublishedData(value, data); reprove(); return value;
  })(); pending.set(data, promise); return promise;
}
export async function verifyCurrentFootprintInverseCachePublishedData(value: CurrentFootprintInverseCachePublishedData, data: CurrentFootprintInverseCacheBackupData): Promise<void> {
  const original = originals.get(data), publication = publications.get(value);
  need(publication !== undefined && publication.data === data && original !== undefined && publication.text === canonicalJson(value));
  const reprove = (): void => { need(publications.get(value) === publication && originals.get(data) === original && original.text === canonicalJson(data) && publication.text === canonicalJson(value)); current(original); };
  reprove(); await verifyExactManagedArtifact(value.artifact); reprove(); const raw = await readArtifact(value.artifact.path, 0, maximumBytes); reprove();
  need(raw.eof && raw.text === `${original.text}\n` && value.dataSha256 === original.sha256); await verifyExactManagedArtifact(value.artifact); reprove();
}

/** Literal lazy-import contract used only by the original Core. */
export interface CurrentFootprintInverseCacheBackupModule {
  readonly buildCurrentFootprintInverseCacheBackupData: typeof buildCurrentFootprintInverseCacheBackupData;
  readonly requireCurrentFootprintInverseCacheBackupData: typeof requireCurrentFootprintInverseCacheBackupData;
  readonly publishCurrentFootprintInverseCacheBackupData: typeof publishCurrentFootprintInverseCacheBackupData;
  readonly verifyCurrentFootprintInverseCachePublishedData: typeof verifyCurrentFootprintInverseCachePublishedData;
}

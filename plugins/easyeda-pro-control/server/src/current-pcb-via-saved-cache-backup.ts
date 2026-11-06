import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { types } from "node:util";
import { z } from "zod";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import type { CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import { compareCurrentScopedCacheBackupData, requireCurrentScopedCacheBackupData } from "./current-scoped-cache-backup-data.ts";
import type { CurrentScopedCacheBackupData, CurrentScopedCacheMetadataDataSnapshot } from "./current-scoped-cache-backup-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcbViaSavedCacheMetadataDataSnapshot = CurrentScopedCacheMetadataDataSnapshot;
const hash = z.string().regex(/^[a-f0-9]{64}$/u), uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const scopeSchema = z.strictObject({ operationId: z.string().min(20).max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  rawWindowsPath: z.string().min(1).max(4096), projectUuid: hash, branchUuid: uuid, documentUuid: uuid, sourceSha256: hash, checkpointSha256: hash, closedLogicalSha256: hash });
type Scope = Readonly<z.infer<typeof scopeSchema>>;
export interface CurrentPcbViaSavedCacheBackupData extends CurrentScopedCacheBackupData {
  readonly schema: "private.pcb-via-saved-cache-backup-data.v1"; readonly scope: Scope;
}
type Attachment = Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>;
interface Built { readonly prepared: object; readonly cdp: CurrentPcbViaSavedCacheSnapshot; readonly metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot; readonly compared: CurrentScopedCacheBackupData; readonly text: string; readonly sha256: string }
const built = new WeakMap<CurrentPcbViaSavedCacheBackupData, Built>();
const maximumBackupBytes = 131_072;
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_COMPLETE_BACKUP_DATA"); } }
function own(input: unknown, key: string): unknown {
  need(input !== null && typeof input === "object" && !types.isProxy(input)); const d = Object.getOwnPropertyDescriptor(input, key);
  need(d !== undefined && Object.hasOwn(d, "value")); return d.value as unknown;
}
function scopeOf(prepared: object): Scope {
  need(own(prepared, "profile") === "private.current-pcb-via-write-closed-checkpoint.v1" && own(prepared, "completeOriginalClosedSqlVerified") === true);
  const checkpoint = own(prepared, "preparationCheckpoint"), target = own(prepared, "target"), vacuum = own(prepared, "vacuumProjection");
  const scope = scopeSchema.parse({ operationId: own(prepared, "operationId"), rawWindowsPath: own(target, "rawWindowsPath"), projectUuid: own(target, "projectUuid"),
    branchUuid: own(target, "branchUuid"), documentUuid: own(target, "documentUuid"), sourceSha256: own(target, "sourceSha256"), checkpointSha256: own(checkpoint, "sha256"), closedLogicalSha256: own(vacuum, "sourceLogicalSha256") });
  need(sha256Text(scope.rawWindowsPath) === scope.projectUuid && /^[A-Z]:\\[^/]+\\CodexEasyedaFixture_[a-f0-9]{32}\\Codex_(?:via_only|line_and_via)_[a-f0-9]{16}\.eprj2$/u.test(scope.rawWindowsPath));
  return freezeDeep(scope);
}
/** Inputs must separately pass their enclosing genuine owner lookups. The
 * original Via scope/schema and exact prepared/CDP/metadata lineage are retained. */
export function buildCurrentPcbViaSavedCacheBackupData(prepared: object, cdp: CurrentPcbViaSavedCacheSnapshot,
  metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot): CurrentPcbViaSavedCacheBackupData {
  const scope = scopeOf(prepared); const compared = compareCurrentScopedCacheBackupData(scope.projectUuid, cdp, metadata);
  const data: CurrentPcbViaSavedCacheBackupData = freezeDeep({ schema: "private.pcb-via-saved-cache-backup-data.v1", scope, ...compared });
  const text = canonicalJson(data); need(Buffer.byteLength(`${text}\n`) <= maximumBackupBytes);
  built.set(data, { prepared, cdp, metadata, compared, text, sha256: sha256Text(text) }); return data;
}
export function requireCurrentPcbViaSavedCacheBackupData(data: CurrentPcbViaSavedCacheBackupData, prepared: object,
  cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot): void {
  const value = built.get(data); need(value !== undefined && value.prepared === prepared && value.cdp === cdp && value.metadata === metadata && value.text === canonicalJson(data));
  requireCurrentScopedCacheBackupData(value.compared, data.scope.projectUuid, cdp, metadata);
}
export interface CurrentPcbViaSavedCachePublishedData {
  readonly schema: "private.pcb-via-saved-cache-published-data.v1"; readonly artifact: Attachment; readonly dataSha256: string;
  readonly completeDataDurablyPublished: true; readonly nativeProvenanceVerified: false; readonly cacheDeletionAuthorized: false;
}
const publications = new WeakMap<CurrentPcbViaSavedCachePublishedData, Readonly<{ data: CurrentPcbViaSavedCacheBackupData; text: string }>>();
const pending = new WeakMap<CurrentPcbViaSavedCacheBackupData, Promise<CurrentPcbViaSavedCachePublishedData>>();
/** Data publication only. The actual owner must reprove all original packet
 * refs, current UI/writer exclusion and this artifact before issuing a grant. */
export function publishCurrentPcbViaSavedCacheBackupData(data: CurrentPcbViaSavedCacheBackupData): Promise<CurrentPcbViaSavedCachePublishedData> {
  const source = built.get(data); need(source !== undefined && source.text === canonicalJson(data)); const old = pending.get(data); if (old !== undefined) { return old; }
  const current = (): void => { need(built.get(data) === source && source.text === canonicalJson(data)); };
  const promise = (async (): Promise<CurrentPcbViaSavedCachePublishedData> => {
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "pcb-via-saved-cache-backup")); current();
    const artifact = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Complete supported disposable cache backup data", Buffer.from(`${source.text}\n`), "pcb-via-saved-cache-backup", (): Promise<void> => { current(); return Promise.resolve(); }); current();
    const value: CurrentPcbViaSavedCachePublishedData = freezeDeep({ schema: "private.pcb-via-saved-cache-published-data.v1", artifact, dataSha256: source.sha256,
      completeDataDurablyPublished: true, nativeProvenanceVerified: false, cacheDeletionAuthorized: false });
    publications.set(value, Object.freeze({ data, text: canonicalJson(value) })); await verifyCurrentPcbViaSavedCachePublishedData(value, data); current(); return value;
  })(); pending.set(data, promise); return promise;
}
export async function verifyCurrentPcbViaSavedCachePublishedData(value: CurrentPcbViaSavedCachePublishedData, data: CurrentPcbViaSavedCacheBackupData): Promise<void> {
  const publication = publications.get(value), source = built.get(data); need(publication !== undefined && publication.data === data && source !== undefined && publication.text === canonicalJson(value));
  const current = (): void => { need(publications.get(value) === publication && built.get(data) === source && source.text === canonicalJson(data) && publication.text === canonicalJson(value)); };
  current(); await verifyExactManagedArtifact(value.artifact); current(); const raw = await readArtifact(value.artifact.path, 0, maximumBackupBytes); current();
  need(raw.eof && raw.text === `${source.text}\n` && value.dataSha256 === source.sha256); await verifyExactManagedArtifact(value.artifact); current();
}

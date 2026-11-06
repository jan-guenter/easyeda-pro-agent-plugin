/* oxlint-disable import/max-dependencies -- Pure complete-data join plus independent managed publication compose strict CDP/Fetch decoders and original-reference data brands; no native ownership is issued here. */
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { types } from "node:util";
import { z } from "zod";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentNativeRequestMetadataCatalogue } from "./current-native-request-metadata-intrinsics.ts";
import type { CurrentNativeRequestMetadataCatalogue } from "./current-native-request-metadata-intrinsics.ts";
import { decodeCurrentPcbViaSavedCacheEntries, decodeCurrentPcbViaSavedCacheNames, decodeCurrentPcbViaSavedCachedBody, requireCurrentPcbViaSavedCacheBodyBudget,
  requireCurrentPcbViaSavedCacheCombinedEntries, selectCurrentPcbViaSavedCacheNamespaces } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCacheEntries, CurrentPcbViaSavedCachedBody } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import { decodeCurrentPcbViaSavedCacheMetadata } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import type { CurrentPcbViaSavedCacheMetadata } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Round = "backup" | "verify";
export interface CurrentPcbViaSavedCacheMetadataDataSnapshot {
  readonly catalogue: CurrentNativeRequestMetadataCatalogue;
  readonly rounds: Readonly<Record<Round, readonly CurrentPcbViaSavedCacheMetadata[]>>;
}
const hash = z.string().regex(/^[a-f0-9]{64}$/u), uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const scopeSchema = z.strictObject({ operationId: z.string().min(20).max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  rawWindowsPath: z.string().min(1).max(4096), projectUuid: hash, branchUuid: uuid, documentUuid: uuid, sourceSha256: hash, checkpointSha256: hash, closedLogicalSha256: hash });
type Scope = Readonly<z.infer<typeof scopeSchema>>;
export interface CurrentPcbViaSavedCacheBackupData {
  readonly schema: "private.pcb-via-saved-cache-backup-data.v1";
  readonly scope: Scope; readonly storageKey: string; readonly securityOrigin: string; readonly peerRosterSha256: string;
  readonly requestGetterNames: readonly string[];
  readonly namespaces: readonly Readonly<{ name: string; existed: boolean; entries: readonly Readonly<{
    request: CurrentPcbViaSavedCacheMetadata["entries"][number]["request"];
    response: CurrentPcbViaSavedCacheMetadata["entries"][number]["response"];
    storedResponseTime: number; storedResponseHeaders: CurrentPcbViaSavedCacheEntries["cacheDataEntries"][number]["responseHeaders"];
    body: CurrentPcbViaSavedCachedBody;
  }>[] }>[];
  readonly totalEntries: number; readonly totalBodyBytes: number; readonly repeatedCompleteDataSha256: string;
  readonly suppliedObservationsOnly: true; readonly nativeProvenanceVerified: false; readonly cacheDeletionAuthorized: false;
}
type Attachment = Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>;
interface Built { readonly prepared: object; readonly cdp: CurrentPcbViaSavedCacheSnapshot; readonly metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot; readonly text: string; readonly sha256: string }
const built = new WeakMap<CurrentPcbViaSavedCacheBackupData, Built>();
const maximumBackupBytes = 131_072;
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_COMPLETE_BACKUP_DATA"); } }
function own(input: unknown, key: string): unknown {
  need(input !== null && typeof input === "object" && !types.isProxy(input)); const d = Object.getOwnPropertyDescriptor(input, key);
  need(d !== undefined && Object.hasOwn(d, "value")); return d.value as unknown;
}
function array(input: unknown, length: number): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Array.isArray(input) && Object.getPrototypeOf(input) === Array.prototype && own(input, "length") === length && Reflect.ownKeys(input).length === length + 1);
  return Array.from({ length }, (_, index) => own(input, String(index)));
}
function scopeOf(prepared: object): Scope {
  need(own(prepared, "profile") === "private.current-pcb-via-write-closed-checkpoint.v1" && own(prepared, "completeOriginalClosedSqlVerified") === true);
  const checkpoint = own(prepared, "preparationCheckpoint"), target = own(prepared, "target"), vacuum = own(prepared, "vacuumProjection");
  const scope = scopeSchema.parse({ operationId: own(prepared, "operationId"), rawWindowsPath: own(target, "rawWindowsPath"), projectUuid: own(target, "projectUuid"),
    branchUuid: own(target, "branchUuid"), documentUuid: own(target, "documentUuid"), sourceSha256: own(target, "sourceSha256"), checkpointSha256: own(checkpoint, "sha256"), closedLogicalSha256: own(vacuum, "sourceLogicalSha256") });
  need(sha256Text(scope.rawWindowsPath) === scope.projectUuid && /^[A-Z]:\\[^/]+\\CodexEasyedaFixture_[a-f0-9]{32}\\Codex_(?:via_only|line_and_via)_[a-f0-9]{16}\.eprj2$/u.test(scope.rawWindowsPath));
  return freezeDeep(scope);
}
function bodyOf(input: unknown): CurrentPcbViaSavedCachedBody {
  const body = decodeCurrentPcbViaSavedCachedBody({ response: { body: own(input, "base64") } });
  need(body.bytes === own(input, "bytes") && body.sha256 === own(input, "sha256")); return body;
}
/** Inputs must separately pass their enclosing genuine owner lookups. This
 * function deliberately creates only a complete supplied-data comparison. */
export function buildCurrentPcbViaSavedCacheBackupData(prepared: object, cdp: CurrentPcbViaSavedCacheSnapshot,
  metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot): CurrentPcbViaSavedCacheBackupData {
  const scope = scopeOf(prepared), storageKey = z.string().min(1).max(8192).parse(own(cdp, "storageKey"));
  const frame = z.strictObject({ frameId: z.string(), sessionId: z.string(), securityOrigin: z.string().min(1).max(8192), projectUuid: hash }).parse(captureCurrentPcbStringClockReply(own(cdp, "frame")).value);
  need(frame.projectUuid === scope.projectUuid && own(cdp, "completeRepeatedCdpData") === true);
  const catalogue = decodeCurrentNativeRequestMetadataCatalogue(own(metadata, "catalogue")), roster = decodeCurrentPcbViaSavedCacheNames(own(cdp, "roster"), storageKey, frame.securityOrigin);
  const selected = selectCurrentPcbViaSavedCacheNamespaces(roster, scope.projectUuid);
  const suppliedSelection = captureCurrentPcbStringClockReply(own(cdp, "selected")).value;
  need(canonicalJson(suppliedSelection) === canonicalJson(selected));
  const peerRosterSha256 = sha256Text(canonicalJson(roster.caches.filter(cache => !selected.some(value => value?.cacheName === cache.cacheName))));
  need(peerRosterSha256 === own(cdp, "peerRosterSha256"));
  const joins: Record<Round, CurrentPcbViaSavedCacheBackupData["namespaces"]> = { backup: [], verify: [] };
  let totalBodyBytes = 0, totalEntries = 0; const allBodies: CurrentPcbViaSavedCachedBody[] = [];
  for (const round of ["backup", "verify"] as const) {
    const native = array(own(own(metadata, "rounds"), round), 2), slots = array(own(own(cdp, "rounds"), round), 2);
    const lists = slots.map(value => { const data = own(value, "entries"); return data === null ? null : decodeCurrentPcbViaSavedCacheEntries(data, frame.securityOrigin); });
    const count = requireCurrentPcbViaSavedCacheCombinedEntries(lists[0] ?? null, lists[1] ?? null);
    const namespaces: CurrentPcbViaSavedCacheBackupData["namespaces"][number][] = [];
    for (const ordinal of [0, 1] as const) {
      const description = selected[ordinal], list = lists[ordinal] ?? null, observed = decodeCurrentPcbViaSavedCacheMetadata(native[ordinal], catalogue);
      need(observed.ordinal === ordinal && observed.existed === (description !== null) && (list !== null) === observed.existed && observed.entries.length === (list?.returnCount ?? 0));
      const bodies = array(own(slots[ordinal], "bodies"), list?.returnCount ?? 0).map(value => bodyOf(value)), entries: CurrentPcbViaSavedCacheBackupData["namespaces"][number]["entries"][number][] = [];
      for (const value of observed.entries) {
        const index = list?.cacheDataEntries.findIndex(entry => entry.requestURL === value.request.url) ?? -1; need(index >= 0);
        const body = bodies[index], stored = list?.cacheDataEntries[index];
        need(stored !== undefined && body !== undefined && (value.response.bodyPresent || body.bytes === 0));
        const header = stored.responseHeaders[0], pair = value.response.headers.pairs[0];
        need(header !== undefined && pair !== undefined && header.name.toLowerCase() === pair[0].toLowerCase() && header.value === pair[1] && stored.requestMethod === value.request.method && stored.responseType === value.response.type && stored.responseStatus === value.response.status && stored.responseStatusText === value.response.statusText);
        entries.push(freezeDeep({ request: value.request, response: value.response, storedResponseTime: stored.responseTime, storedResponseHeaders: stored.responseHeaders, body }));
      }
      namespaces.push(freezeDeep({ name: ordinal === 0 ? `project_${scope.projectUuid}_v6` : `localProject_${scope.projectUuid}_v1`, existed: observed.existed, entries }));
      if (round === "backup") { allBodies.push(...bodies); }
    }
    joins[round] = freezeDeep(namespaces);
    if (round === "backup") { totalEntries = count; } else { need(count === totalEntries && canonicalJson(joins.backup) === canonicalJson(joins.verify)); }
  }
  requireCurrentPcbViaSavedCacheBodyBudget(allBodies, totalEntries); for (const body of allBodies) { totalBodyBytes += body.bytes; }
  const data: CurrentPcbViaSavedCacheBackupData = freezeDeep({ schema: "private.pcb-via-saved-cache-backup-data.v1", scope, storageKey, securityOrigin: frame.securityOrigin, peerRosterSha256,
    requestGetterNames: catalogue.slice(3, -4).map(item => item.name.slice(4)), namespaces: joins.backup, totalEntries, totalBodyBytes, repeatedCompleteDataSha256: sha256Text(canonicalJson(joins.backup)),
    suppliedObservationsOnly: true, nativeProvenanceVerified: false, cacheDeletionAuthorized: false });
  const text = canonicalJson(data); need(Buffer.byteLength(`${text}\n`) <= maximumBackupBytes); built.set(data, { prepared, cdp, metadata, text, sha256: sha256Text(text) }); return data;
}
export function requireCurrentPcbViaSavedCacheBackupData(data: CurrentPcbViaSavedCacheBackupData, prepared: object,
  cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot): void {
  const value = built.get(data); need(value !== undefined && value.prepared === prepared && value.cdp === cdp && value.metadata === metadata && value.text === canonicalJson(data));
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

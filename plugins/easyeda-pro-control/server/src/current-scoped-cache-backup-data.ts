/** Origin-free bounded comparison of complete CDP and native Fetch cache data.
 * No scope, checkpoint, publication or native authority is issued here. */
import { types } from "node:util";
import { z } from "zod";
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
export interface CurrentScopedCacheMetadataDataSnapshot {
  readonly catalogue: CurrentNativeRequestMetadataCatalogue;
  readonly rounds: Readonly<Record<Round, readonly CurrentPcbViaSavedCacheMetadata[]>>;
}
export interface CurrentScopedCacheBackupData {
  readonly storageKey: string; readonly securityOrigin: string; readonly peerRosterSha256: string;
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
interface Comparison { readonly projectUuid: string; readonly cdp: CurrentPcbViaSavedCacheSnapshot; readonly metadata: CurrentScopedCacheMetadataDataSnapshot; readonly text: string }
const comparisons = new WeakMap<CurrentScopedCacheBackupData, Comparison>();
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_COMPLETE_BACKUP_DATA"); } }
function own(input: unknown, key: string): unknown {
  need(input !== null && typeof input === "object" && !types.isProxy(input)); const d = Object.getOwnPropertyDescriptor(input, key);
  need(d !== undefined && Object.hasOwn(d, "value")); return d.value as unknown;
}
function array(input: unknown, length: number): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Array.isArray(input) && Object.getPrototypeOf(input) === Array.prototype && own(input, "length") === length && Reflect.ownKeys(input).length === length + 1);
  return Array.from({ length }, (_, index) => own(input, String(index)));
}
function bodyOf(input: unknown): CurrentPcbViaSavedCachedBody {
  const body = decodeCurrentPcbViaSavedCachedBody({ response: { body: own(input, "base64") } });
  need(body.bytes === own(input, "bytes") && body.sha256 === own(input, "sha256")); return body;
}
/** Callers separately establish original packet and purpose custody. Only
 * bounded supplied-data equivalence and these exact three refs are retained. */
export function compareCurrentScopedCacheBackupData(projectUuid: string, cdp: CurrentPcbViaSavedCacheSnapshot,
  metadata: CurrentScopedCacheMetadataDataSnapshot): CurrentScopedCacheBackupData {
  const project = z.string().regex(/^[a-f0-9]{64}$/u).parse(projectUuid), storageKey = z.string().min(1).max(8192).parse(own(cdp, "storageKey"));
  const frame = z.strictObject({ frameId: z.string(), sessionId: z.string(), securityOrigin: z.string().min(1).max(8192), projectUuid: hash }).parse(captureCurrentPcbStringClockReply(own(cdp, "frame")).value);
  need(frame.projectUuid === project && own(cdp, "completeRepeatedCdpData") === true);
  const catalogue = decodeCurrentNativeRequestMetadataCatalogue(own(metadata, "catalogue")), roster = decodeCurrentPcbViaSavedCacheNames(own(cdp, "roster"), storageKey, frame.securityOrigin);
  const selected = selectCurrentPcbViaSavedCacheNamespaces(roster, project);
  const suppliedSelection = captureCurrentPcbStringClockReply(own(cdp, "selected")).value;
  need(canonicalJson(suppliedSelection) === canonicalJson(selected));
  const peerRosterSha256 = sha256Text(canonicalJson(roster.caches.filter(cache => !selected.some(value => value?.cacheName === cache.cacheName))));
  need(peerRosterSha256 === own(cdp, "peerRosterSha256"));
  const joins: Record<Round, CurrentScopedCacheBackupData["namespaces"]> = { backup: [], verify: [] };
  let totalBodyBytes = 0, totalEntries = 0; const allBodies: CurrentPcbViaSavedCachedBody[] = [];
  for (const round of ["backup", "verify"] as const) {
    const native = array(own(own(metadata, "rounds"), round), 2), slots = array(own(own(cdp, "rounds"), round), 2);
    const lists = slots.map(value => { const data = own(value, "entries"); return data === null ? null : decodeCurrentPcbViaSavedCacheEntries(data, frame.securityOrigin); });
    const count = requireCurrentPcbViaSavedCacheCombinedEntries(lists[0] ?? null, lists[1] ?? null);
    const namespaces: CurrentScopedCacheBackupData["namespaces"][number][] = [];
    for (const ordinal of [0, 1] as const) {
      const description = selected[ordinal], list = lists[ordinal] ?? null, observed = decodeCurrentPcbViaSavedCacheMetadata(native[ordinal], catalogue);
      need(observed.ordinal === ordinal && observed.existed === (description !== null) && (list !== null) === observed.existed && observed.entries.length === (list?.returnCount ?? 0));
      const bodies = array(own(slots[ordinal], "bodies"), list?.returnCount ?? 0).map(value => bodyOf(value)), entries: CurrentScopedCacheBackupData["namespaces"][number]["entries"][number][] = [];
      for (const value of observed.entries) {
        const index = list?.cacheDataEntries.findIndex(entry => entry.requestURL === value.request.url) ?? -1; need(index >= 0);
        const body = bodies[index], stored = list?.cacheDataEntries[index];
        need(stored !== undefined && body !== undefined && (value.response.bodyPresent || body.bytes === 0));
        const header = stored.responseHeaders[0], pair = value.response.headers.pairs[0];
        need(header !== undefined && pair !== undefined && header.name.toLowerCase() === pair[0].toLowerCase() && header.value === pair[1] && stored.requestMethod === value.request.method && stored.responseType === value.response.type && stored.responseStatus === value.response.status && stored.responseStatusText === value.response.statusText);
        entries.push(freezeDeep({ request: value.request, response: value.response, storedResponseTime: stored.responseTime, storedResponseHeaders: stored.responseHeaders, body }));
      }
      namespaces.push(freezeDeep({ name: ordinal === 0 ? `project_${project}_v6` : `localProject_${project}_v1`, existed: observed.existed, entries }));
      if (round === "backup") { allBodies.push(...bodies); }
    }
    joins[round] = freezeDeep(namespaces);
    if (round === "backup") { totalEntries = count; } else { need(count === totalEntries && canonicalJson(joins.backup) === canonicalJson(joins.verify)); }
  }
  requireCurrentPcbViaSavedCacheBodyBudget(allBodies, totalEntries); for (const body of allBodies) { totalBodyBytes += body.bytes; }
  const data: CurrentScopedCacheBackupData = freezeDeep({ storageKey, securityOrigin: frame.securityOrigin, peerRosterSha256,
    requestGetterNames: catalogue.slice(3, -4).map(item => item.name.slice(4)), namespaces: joins.backup, totalEntries, totalBodyBytes, repeatedCompleteDataSha256: sha256Text(canonicalJson(joins.backup)),
    suppliedObservationsOnly: true, nativeProvenanceVerified: false, cacheDeletionAuthorized: false });
  comparisons.set(data, Object.freeze({ projectUuid: project, cdp, metadata, text: canonicalJson(data) })); return data;
}
export function requireCurrentScopedCacheBackupData(data: CurrentScopedCacheBackupData, projectUuid: string,
  cdp: CurrentPcbViaSavedCacheSnapshot, metadata: CurrentScopedCacheMetadataDataSnapshot): void {
  const original = comparisons.get(data); need(original !== undefined && original.projectUuid === projectUuid && original.cdp === cdp && original.metadata === metadata && original.text === canonicalJson(data));
}

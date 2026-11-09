/** Strict CDP data decoders only. Actual correlated original-reply custody,
 * native Fetch metadata, durable backup and delete permission stay elsewhere. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_LIMITS as LIMITS } from "./current-pcb-via-saved-cache-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const text = z.string().max(8192);
const key = text.min(1);
const cacheSchema = z.strictObject({ cacheId: key, securityOrigin: key, storageKey: key,
  storageBucket: z.strictObject({ storageKey: key }).optional(), cacheName: z.string().max(256) });
const namesSchema = z.strictObject({ caches: z.array(cacheSchema).max(LIMITS.namespaceRoster) });
export type CurrentPcbViaSavedCacheNames = Readonly<z.infer<typeof namesSchema>>;
export type CurrentPcbViaSavedCacheDescription = Readonly<z.infer<typeof cacheSchema>>;
const headerSchema = z.strictObject({ name: z.string().min(1).max(256), value: text });
const entrySchema = z.strictObject({ requestURL: key, requestMethod: z.literal("GET"), requestHeaders: z.array(headerSchema).length(0),
  responseTime: z.number().min(0).refine(value => !Object.is(value, -0)), responseStatus: z.literal(200), responseStatusText: z.literal(""),
  responseType: z.literal("default"), responseHeaders: z.array(headerSchema).length(1) });
const entriesSchema = z.strictObject({ cacheDataEntries: z.array(entrySchema).max(LIMITS.entriesPerNamespaceMaximum),
  returnCount: z.number().int().min(0).max(LIMITS.entriesPerNamespaceMaximum).refine(value => !Object.is(value, -0)) });
export type CurrentPcbViaSavedCacheEntries = Readonly<z.infer<typeof entriesSchema>>;
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_SAVED_CACHE_DATA"); } }
export function decodeCurrentPcbViaSavedCacheNames(input: unknown, storageKey: string, securityOrigin: string): CurrentPcbViaSavedCacheNames {
  key.parse(storageKey); key.parse(securityOrigin); const value = namesSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const ids = new Set<string>(), names = new Set<string>();
  for (const cache of value.caches) {
    need(cache.storageKey === storageKey && cache.securityOrigin === securityOrigin && (cache.storageBucket === undefined || cache.storageBucket.storageKey === storageKey) && !ids.has(cache.cacheId) && !names.has(cache.cacheName));
    ids.add(cache.cacheId); names.add(cache.cacheName);
  }
  return freezeDeep(value);
}
/** The actual owner supplies its original checkpoint UUID. These descriptions
 * remain data and cannot select a cache outside its private native registry. */
export function selectCurrentPcbViaSavedCacheNamespaces(roster: CurrentPcbViaSavedCacheNames, projectUuid: string): readonly [CurrentPcbViaSavedCacheDescription | null, CurrentPcbViaSavedCacheDescription | null] {
  need(/^[a-f0-9]{64}$/u.test(projectUuid));
  return Object.freeze([roster.caches.find(cache => cache.cacheName === `project_${projectUuid}_v6`) ?? null,
    roster.caches.find(cache => cache.cacheName === `localProject_${projectUuid}_v1`) ?? null]);
}
/** No filter or partial page may be treated as a complete entry roster. This
 * narrow source profile also refuses unsupported Request/Response forms. */
export function decodeCurrentPcbViaSavedCacheEntries(input: unknown, securityOrigin: string): CurrentPcbViaSavedCacheEntries {
  const value = entriesSchema.parse(captureCurrentPcbStringClockReply(input).value); need(value.returnCount === value.cacheDataEntries.length);
  const requests = new Set<string>();
  for (const entry of value.cacheDataEntries) {
    const contentType = entry.responseHeaders[0], url = new URL(entry.requestURL);
    need(url.origin === securityOrigin && url.href === entry.requestURL && url.username === "" && url.password === "" && !requests.has(entry.requestURL) &&
      contentType !== undefined && contentType.name.toLowerCase() === "content-type" && ["application/json", "text/plain;charset=UTF-8"].includes(contentType.value));
    requests.add(entry.requestURL);
  }
  return freezeDeep(value);
}
/** Eight entries is one combined budget across both exact namespaces, never
 * eight per namespace. This must precede all body-fetch and delete admission. */
export function requireCurrentPcbViaSavedCacheCombinedEntries(first: CurrentPcbViaSavedCacheEntries | null, second: CurrentPcbViaSavedCacheEntries | null): number {
  const a = first === null ? 0 : first.returnCount, b = second === null ? 0 : second.returnCount;
  need(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= 0 && a === (first?.cacheDataEntries.length ?? 0) && b === (second?.cacheDataEntries.length ?? 0) && a + b <= LIMITS.combinedEntries);
  return a + b;
}
export interface CurrentPcbViaSavedCachedBody { readonly base64: string; readonly bytes: number; readonly sha256: string }
const maximumBase64Characters = 4 * Math.ceil(LIMITS.bodyBytesPerEntry / 3);
const bodySchema = z.strictObject({ response: z.strictObject({ body: z.string().max(maximumBase64Characters) }) });
export function decodeCurrentPcbViaSavedCachedBody(input: unknown): CurrentPcbViaSavedCachedBody {
  const value = bodySchema.parse(captureCurrentPcbStringClockReply(input).value);
  const bytes = Buffer.from(value.response.body, "base64");
  need(bytes.length <= LIMITS.bodyBytesPerEntry && bytes.toString("base64") === value.response.body);
  return Object.freeze({ base64: value.response.body, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
}
export function requireCurrentPcbViaSavedCacheBodyBudget(bodies: readonly CurrentPcbViaSavedCachedBody[], entries: number): void {
  need(Number.isSafeInteger(entries) && !Object.is(entries, -0) && entries >= 0 && entries <= LIMITS.combinedEntries && bodies.length === entries);
  let bytes = 0; for (const body of bodies) { need(Number.isSafeInteger(body.bytes) && !Object.is(body.bytes, -0) && body.bytes >= 0 && body.bytes <= LIMITS.bodyBytesPerEntry); bytes += body.bytes; }
  need(bytes <= LIMITS.bodyBytesTotal);
}
/** Exact unfiltered metadata/body equality is necessary for the second read.
 * It does not itself exclude a writer or prove original native packet custody. */
export function requireCurrentPcbViaSavedCacheRepeat(first: CurrentPcbViaSavedCacheEntries, second: CurrentPcbViaSavedCacheEntries,
  before: readonly CurrentPcbViaSavedCachedBody[], after: readonly CurrentPcbViaSavedCachedBody[]): void {
  requireCurrentPcbViaSavedCacheBodyBudget(before, first.returnCount); requireCurrentPcbViaSavedCacheBodyBudget(after, second.returnCount);
  need(canonicalJson(first) === canonicalJson(second) && canonicalJson(before) === canonicalJson(after));
}

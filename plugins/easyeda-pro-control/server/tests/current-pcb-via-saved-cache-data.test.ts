import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentPcbViaSavedCacheEntries, decodeCurrentPcbViaSavedCacheNames, decodeCurrentPcbViaSavedCachedBody,
  requireCurrentPcbViaSavedCacheBodyBudget, requireCurrentPcbViaSavedCacheCombinedEntries, requireCurrentPcbViaSavedCacheRepeat,
  selectCurrentPcbViaSavedCacheNamespaces } from "../src/current-pcb-via-saved-cache-data.ts";

const origin = "https://pro.lceda.cn", storageKey = `${origin}/`, uuid = "a".repeat(64);
function entries(count: number): object { return { cacheDataEntries: Array.from({ length: count }, (_, index) => ({ requestURL: `${origin}/dataStr/${String(index)}`,
  requestMethod: "GET", requestHeaders: [], responseTime: 1000, responseStatus: 200, responseStatusText: "", responseType: "default",
  responseHeaders: [{ name: "content-type", value: "text/plain;charset=UTF-8" }] })), returnCount: count }; }
void test("complete unfiltered entry rosters share one eight-entry/body budget across both namespaces", () => {
  const a = decodeCurrentPcbViaSavedCacheEntries(entries(4), origin), b = decodeCurrentPcbViaSavedCacheEntries(entries(4), origin);
  assert.equal(requireCurrentPcbViaSavedCacheCombinedEntries(a, b), 8);
  assert.throws(() => requireCurrentPcbViaSavedCacheCombinedEntries(decodeCurrentPcbViaSavedCacheEntries(entries(8), origin), decodeCurrentPcbViaSavedCacheEntries(entries(1), origin)));
  assert.throws(() => decodeCurrentPcbViaSavedCacheEntries({ ...entries(1), returnCount: 2 }, origin));
  const body = decodeCurrentPcbViaSavedCachedBody({ response: { body: Buffer.alloc(8192).toString("base64") } });
  requireCurrentPcbViaSavedCacheBodyBudget([body, body, body, body], 4); assert.throws(() => { requireCurrentPcbViaSavedCacheBodyBudget([body, body, body, body, body], 5); });
  assert.throws(() => decodeCurrentPcbViaSavedCachedBody({ response: { body: "YQ" } }));
  assert.throws(() => decodeCurrentPcbViaSavedCachedBody({ response: { body: Buffer.alloc(8193).toString("base64") } }));
  requireCurrentPcbViaSavedCacheRepeat(a, a, [body, body, body, body], [body, body, body, body]); assert.throws(() => { requireCurrentPcbViaSavedCacheRepeat(a, b, [body], []); });
});
void test("exact original storage scope and derived names never select peer cache IDs", () => {
  const input = { caches: ["peer", `project_${uuid}_v6`, `localProject_${uuid}_v1`].map((cacheName, index) => ({ cacheId: `opaque-${String(index)}`, securityOrigin: origin, storageKey, cacheName })) };
  const roster = decodeCurrentPcbViaSavedCacheNames(input, storageKey, origin), selected = selectCurrentPcbViaSavedCacheNamespaces(roster, uuid);
  assert.equal(selected[0]?.cacheId, "opaque-1"); assert.equal(selected[1]?.cacheId, "opaque-2");
  assert.throws(() => decodeCurrentPcbViaSavedCacheNames(input, "foreign-storage-key", origin));
  assert.throws(() => decodeCurrentPcbViaSavedCacheNames({ caches: [...input.caches, input.caches[0]] }, storageKey, origin));
  assert.throws(() => decodeCurrentPcbViaSavedCacheEntries(entries(1), "https://foreign.example"));
});
void test("unsupported forms and getters refuse before a complete-backup claim", () => {
  const input = entries(1); assert.ok("cacheDataEntries" in input && Array.isArray(input.cacheDataEntries));
  const first: unknown = input.cacheDataEntries[0]; assert.ok(first !== null && typeof first === "object");
  for (const change of [{ responseType: "opaqueResponse" }, { responseStatus: 0 }, { requestMethod: "POST" }, { requestHeaders: [{ name: "authorization", value: "hidden" }] }]) {
    assert.throws(() => decodeCurrentPcbViaSavedCacheEntries({ cacheDataEntries: [{ ...first, ...change }], returnCount: 1 }, origin));
  }
  let touched = false; const getter = Object.defineProperty({}, "caches", { enumerable: true, get: (): unknown => { touched = true; return []; } });
  assert.throws(() => decodeCurrentPcbViaSavedCacheNames(getter, storageKey, origin)); assert.equal(touched, false);
});

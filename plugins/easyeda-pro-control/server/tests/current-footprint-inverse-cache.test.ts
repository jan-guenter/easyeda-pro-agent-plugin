/** Actual automatic driver and both real custody ledgers with one explicit
 * original-native binding seam. No Cache API/native owner is constructed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { freshSyntheticSavedCacheDriver } from "./helpers/current-pcb-via-saved-cache-fixture.ts";

import { CurrentPcbViaSavedCacheLedger } from "../src/current-pcb-via-saved-cache-ledger.ts";
import { CurrentPcbViaSavedCacheMetadataLedger } from "../src/current-pcb-via-saved-cache-metadata-ledger.ts";
import { CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS, currentFootprintInverseCacheMetadataNativeFrame, currentFootprintInverseCacheMetadataWire,
  currentFootprintInverseCacheNativeFrame, currentFootprintInverseCacheWire } from "../src/current-footprint-inverse-cache-wire.ts";

const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
async function fixture(excess = false): Promise<Readonly<{ observe: () => Promise<void>; data: ReturnType<typeof freshSyntheticSavedCacheDriver> }>> {
  const data = freshSyntheticSavedCacheDriver(excess); const owner = Object.freeze({ inertOriginalOwner: true }); const origin = Object.freeze({ inertOriginalOrigin: true });
  const target = data.prepared["target"]; assert.ok(target !== null && typeof target === "object" && "projectUuid" in target && typeof target.projectUuid === "string");
  const bindings = Object.freeze({ prepared: data.prepared, projectUuid: target.projectUuid, request: data.request, metadataRequest: data.metadataRequest,
    assertCurrent: async (): Promise<void> => { await Promise.resolve(); },
    requirePacket: data.ledger.requireOriginalPacket.bind(data.ledger), requireMetadataPacket: data.metadata.requireOriginalPacket.bind(data.metadata),
    snapshot: data.ledger.snapshot.bind(data.ledger), requireSnapshot: data.ledger.requireOriginalSnapshot.bind(data.ledger),
    metadataSnapshot: data.metadata.snapshot.bind(data.metadata), requireMetadataSnapshot: data.metadata.requireOriginalSnapshot.bind(data.metadata) });
  const url = new URL("../src/current-footprint-inverse-cache-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-footprint-inverse-native-owner.ts" ? {
    requireOriginalCurrentFootprintInverseCacheOrigin: (actual: unknown, actor: unknown, prepared: unknown): object => { assert.equal(actual, origin); assert.equal(actor, owner); assert.equal(prepared, data.prepared); return bindings; },
  } : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const observe = loaded.exports["observeOriginalCurrentFootprintInverseCaches"]; assert.ok(typeof observe === "function");
  return { data, observe: async (): Promise<void> => { const result: unknown = Reflect.apply(observe, undefined, [owner, data.prepared, origin]); assert.ok(result instanceof Promise); await result; } };
}
void test("automatic original cache driver completes both actual ledgers and every original helper receipt", async () => {
  const f = await fixture(); await f.observe();
  assert.equal(f.data.ledger.snapshot().completeRepeatedCdpData, true); assert.equal(f.data.metadata.snapshot().completeHelperSourcesVerified, true);
  assert.equal(f.data.metadata.snapshot().helperEvents.length, 12); assert.equal(f.data.commands.filter(value => value === "saved-cache-native-helper-source").length, 12);
  assert.equal(f.data.commands.includes("saved-cache-delete"), false); assert.equal(f.data.commands.includes("saved-cache-untrack"), false);
});
void test("combined ninth entry stops the actual driver/ledger before any cache body or delete", async () => {
  const f = await fixture(true); await assert.rejects(f.observe());
  assert.equal(f.data.commands.filter(value => value === "saved-cache-entries").length, 2);
  assert.equal(f.data.commands.includes("saved-cache-body"), false); assert.equal(f.data.commands.includes("saved-cache-delete"), false);
});

void test("inverse native projection is bound to its actual reserved frame and metadata helper", () => {
  const projectUuid = "a".repeat(64), sessionId = "original-parent";
  const ledger = new CurrentPcbViaSavedCacheLedger(Object.freeze({ frameId: "original-frame", sessionId, securityOrigin: "https://client", projectUuid }));
  const plan = ledger.prepare({ phase: "saved-cache-key", step: "initial" }), wire = currentFootprintInverseCacheWire(plan, 700, sessionId);
  assert.deepEqual(currentFootprintInverseCacheNativeFrame(bytes(wire), plan, sessionId), {
    action: "footprint-inverse-cache", requestId: 700, sessionId, savedCachePhase: "saved-cache-key", savedCacheStep: "initial", frameId: "original-frame" });
  assert.throws(() => currentFootprintInverseCacheNativeFrame(bytes({ ...wire, params: { frameId: "foreign" } }), plan, sessionId));
  assert.throws(() => currentFootprintInverseCacheNativeFrame(bytes({ ...wire, savedReadbackCache: true }), plan, sessionId));
  const metadata = new CurrentPcbViaSavedCacheMetadataLedger(Object.freeze({ sessionId, uniqueContextId: "original-realm", executionContextId: 1, projectUuid }));
  const reserved = metadata.prepare({ phase: "saved-cache-native-constructors", kind: "cache-response" }); const native = currentFootprintInverseCacheMetadataWire(reserved, 701, sessionId);
  const frame = currentFootprintInverseCacheMetadataNativeFrame(bytes(native), reserved, sessionId);
  assert.equal(frame["action"], "footprint-inverse-cache-metadata"); assert.equal(frame["uniqueContextId"], "original-realm");
  assert.equal(Object.hasOwn(frame, "functionDeclaration"), false);
  assert.throws(() => currentFootprintInverseCacheMetadataNativeFrame(bytes({ ...native, params: { ...native.params, functionDeclaration: "function(){return true}" } }), reserved, sessionId));
  assert.equal(CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS.total, 114);
});

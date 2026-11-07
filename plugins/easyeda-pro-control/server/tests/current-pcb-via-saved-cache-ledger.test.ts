/** Inert reply data only; no transport, application, native cache or grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbViaSavedCacheNativeFrame, currentPcbViaSavedCacheWire } from "../src/current-pcb-via-saved-cache-wire.ts";
import { CurrentPcbViaSavedCacheLedger } from "../src/current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheCommand } from "../src/current-pcb-via-saved-cache-protocol.ts";

const origin = "http://127.0.0.1:54321", project = "a".repeat(64), storageKey = `${origin}/`;
const frame = Object.freeze({ frameId: "original-frame", sessionId: "original-session", securityOrigin: origin, projectUuid: project });
const description = (ordinal: 0 | 1): object => ({ cacheId: `original-cache-${String(ordinal)}`, securityOrigin: origin, storageKey,
  cacheName: ordinal === 0 ? `project_${project}_v6` : `localProject_${project}_v1` });
const entry = (index: number): object => ({ requestURL: `${origin}/upload/branch?key=${String(index)}`, requestMethod: "GET", requestHeaders: [],
  responseTime: 1000, responseStatus: 200, responseStatusText: "", responseType: "default", responseHeaders: [{ name: "Content-Type", value: "application/json" }] });
const entries = (count: number): object => ({ cacheDataEntries: Array.from({ length: count }, (_, index) => entry(index)), returnCount: count });
const body = { response: { body: Buffer.from('{"synthetic":true}').toString("base64") } };
function bootstrap(): CurrentPcbViaSavedCacheLedger {
  const ledger = new CurrentPcbViaSavedCacheLedger(frame);
  ledger.accept(ledger.prepare({ phase: "saved-cache-key", step: "initial" }), { storageKey });
  ledger.accept(ledger.prepare({ phase: "saved-cache-track" }), {});
  ledger.accept(ledger.prepare({ phase: "saved-cache-names", step: "before" }), { caches: [description(0), description(1), { cacheId: "peer", securityOrigin: origin, storageKey, cacheName: "unopened-peer" }] });
  return ledger;
}
void test("saved cache ledger substitutes only prior replies and retains a complete matching repeated capture", () => {
  const ledger = bootstrap();
  const first = ledger.prepare({ phase: "saved-cache-entries", round: "backup", ordinal: 0 });
  assert.deepEqual(first.params, { cacheId: "original-cache-0", skipCount: 0, pageSize: 9 });
  const wire = currentPcbViaSavedCacheWire(first, 25, frame.sessionId);
  const native = currentPcbViaSavedCacheNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`), first, frame.sessionId);
  assert.deepEqual(native, { action: "saved-readback-cache", requestId: 25, sessionId: frame.sessionId, savedCachePhase: "saved-cache-entries", savedCacheRound: "backup", namespaceOrdinal: 0, cacheId: "original-cache-0", skipCount: 0, pageSize: 9 });
  assert.throws(() => currentPcbViaSavedCacheNativeFrame(Buffer.from(`${JSON.stringify({ ...wire, params: { ...wire.params, cacheId: "peer" } })}\0`), first, frame.sessionId));

  assert.throws(() => ledger.accept({ ...first }, entries(1)), /ORIGINAL_LEDGER/u);
  const original = ledger.accept(first, entries(1)); ledger.requireOriginalPacket(original); assert.throws(() => { ledger.requireOriginalPacket({ ...original }); });
  ledger.accept(ledger.prepare({ phase: "saved-cache-entries", round: "backup", ordinal: 1 }), entries(1));
  for (const ordinal of [0, 1] as const) {
    const plan = ledger.prepare({ phase: "saved-cache-body", round: "backup", ordinal, entryIndex: 0 });
    assert.deepEqual(plan.params, { cacheId: `original-cache-${String(ordinal)}`, requestURL: `${origin}/upload/branch?key=0`, requestHeaders: [] }); ledger.accept(plan, body);
  }
  for (const ordinal of [0, 1] as const) { ledger.accept(ledger.prepare({ phase: "saved-cache-entries", round: "verify", ordinal }), entries(1)); }
  for (const ordinal of [0, 1] as const) { ledger.accept(ledger.prepare({ phase: "saved-cache-body", round: "verify", ordinal, entryIndex: 0 }), body); }
  ledger.accept(ledger.prepare({ phase: "saved-cache-names", step: "after-backup" }), { caches: [description(0), description(1), { cacheId: "peer", securityOrigin: origin, storageKey, cacheName: "unopened-peer" }] });
  assert.equal(ledger.status().completeRepeatedCdpData, true); assert.equal(ledger.status().packets, 12); assert.equal(ledger.status().nativeOwnershipVerified, false); assert.equal(ledger.status().deletionAuthorized, false);
  const snapshot = ledger.snapshot(); ledger.requireOriginalSnapshot(snapshot); assert.throws(() => { ledger.requireOriginalSnapshot({ ...snapshot }); }); assert.equal(snapshot.rounds.backup.length, 2); assert.equal(snapshot.rounds.backup[0]?.bodies.length, 1); assert.equal(snapshot.selected[0]?.cacheId, "original-cache-0"); assert.equal(snapshot.packets.includes(original), true); assert.equal(snapshot.deletionAuthorized, false);
  assert.throws(() => ledger.prepare({ phase: "saved-cache-delete", ordinal: 0 }), /COMPLETE_NATIVE_METADATA_REQUIRED/u);
  ledger.accept(ledger.prepare({ phase: "saved-cache-untrack" }), {}); assert.equal(ledger.status().tracked, false); assert.throws(() => ledger.snapshot());
  assert.throws(() => ledger.prepare({ phase: "saved-cache-key", step: "initial" }));
});
void test("combined8+1 refuses before any body and selectors cannot smuggle cache IDs or partial rosters", () => {
  const ledger = bootstrap();
  const forged = { phase: "saved-cache-entries", round: "backup", ordinal: 0, cacheId: "peer" } as CurrentPcbViaSavedCacheCommand;
  assert.throws(() => ledger.prepare(forged));
  ledger.accept(ledger.prepare({ phase: "saved-cache-entries", round: "backup", ordinal: 0 }), entries(8));
  assert.throws(() => ledger.prepare({ phase: "saved-cache-body", round: "backup", ordinal: 0, entryIndex: 0 }));
  assert.throws(() => ledger.accept(ledger.prepare({ phase: "saved-cache-entries", round: "backup", ordinal: 1 }), entries(1)));
  assert.equal(ledger.status().failed, true); assert.equal(ledger.status().deletionAuthorized, false);
  assert.throws(() => ledger.prepare({ phase: "saved-cache-body", round: "backup", ordinal: 0, entryIndex: 0 }));
  const partial = bootstrap(); assert.throws(() => partial.accept(partial.prepare({ phase: "saved-cache-entries", round: "backup", ordinal: 0 }), { cacheDataEntries: [entry(0)], returnCount: 2 }));
  assert.equal(partial.status().failed, true);
});
void test("malformed original replies consume their pending attempt without invoking accessors or admitting delete/loading", () => {
  const ledger = new CurrentPcbViaSavedCacheLedger(frame); let accesses = 0;
  const bad = Object.defineProperty({}, "storageKey", { enumerable: true, get: (): string => { accesses += 1; return storageKey; } });
  assert.throws(() => ledger.accept(ledger.prepare({ phase: "saved-cache-key", step: "initial" }), bad));
  assert.equal(accesses, 0); assert.equal(ledger.status().failed, true); assert.throws(() => ledger.prepare({ phase: "saved-cache-key", step: "initial" }));
  const fresh = bootstrap(); assert.throws(() => fresh.prepare({ phase: "saved-cache-key", step: "loading" }), /COMPLETE_NATIVE_METADATA_REQUIRED/u);
  assert.throws(() => fresh.prepare({ phase: "saved-cache-names", step: "absence" }), /COMPLETE_NATIVE_METADATA_REQUIRED/u);
});

void test("tracking begins before namespace enumeration and any original cache event refuses further authority", () => {
  const ledger = new CurrentPcbViaSavedCacheLedger(frame);
  ledger.accept(ledger.prepare({ phase: "saved-cache-key", step: "initial" }), { storageKey });
  assert.throws(() => ledger.prepare({ phase: "saved-cache-names", step: "before" }));
  ledger.accept(ledger.prepare({ phase: "saved-cache-track" }), {});
  assert.equal(ledger.observeOriginalEvent("Runtime.consoleAPICalled"), false);
  assert.throws(() => ledger.observeOriginalEvent("Storage.cacheStorageContentUpdated"), /CACHE_CHANGED/u);
  assert.equal(ledger.status().failed, true); assert.throws(() => ledger.prepare({ phase: "saved-cache-names", step: "before" }));
});

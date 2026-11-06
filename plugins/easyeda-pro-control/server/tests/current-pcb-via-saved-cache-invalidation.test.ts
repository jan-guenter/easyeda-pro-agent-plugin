/** Original-reply data only; no cache mutation, native owner or grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaSavedCacheInvalidationLedger } from "../src/current-pcb-via-saved-cache-invalidation-ledger.ts";
import { CurrentPcbViaSavedCacheLedger } from "../src/current-pcb-via-saved-cache-ledger.ts";
import { currentPcbViaSavedCacheNativeFrame, currentPcbViaSavedCacheWire } from "../src/current-pcb-via-saved-cache-wire.ts";
import type { CurrentPcbViaSavedCacheCommand } from "../src/current-pcb-via-saved-cache-protocol.ts";

const origin = "https://client", projectUuid = "a".repeat(64), storageKey = `${origin}/`;
const frame = Object.freeze({ frameId: "frame", sessionId: "session", securityOrigin: origin, projectUuid });
const selected = [0, 1].map(ordinal => ({ cacheId: `cache-${String(ordinal)}`, storageKey, securityOrigin: origin,
  cacheName: ordinal === 0 ? `project_${projectUuid}_v6` : `localProject_${projectUuid}_v1` }));
const peer = { cacheId: "peer", storageKey, securityOrigin: origin, cacheName: "unchanged-peer" };
function before(absent = false): ReturnType<CurrentPcbViaSavedCacheLedger["snapshot"]> {
  const ledger = new CurrentPcbViaSavedCacheLedger(frame);
  const run = (command: CurrentPcbViaSavedCacheCommand, reply: unknown): void => { ledger.accept(ledger.prepare(command), reply); };
  run({ phase: "saved-cache-key", step: "initial" }, { storageKey }); run({ phase: "saved-cache-track" }, {});
  run({ phase: "saved-cache-names", step: "before" }, { caches: absent ? [peer] : [...selected, peer] });
  if (!absent) { for (const round of ["backup", "verify"] as const) { for (const ordinal of [0, 1] as const) {
    run({ phase: "saved-cache-entries", round, ordinal }, { cacheDataEntries: [], returnCount: 0 });
  } } }
  run({ phase: "saved-cache-names", step: "after-backup" }, { caches: absent ? [peer] : [...selected, peer] }); return ledger.snapshot();
}
void test("ordered invalidation uses only retained two IDs, consumes each once and preserves every peer descriptor", () => {
  const ledger = new CurrentPcbViaSavedCacheInvalidationLedger(before());
  const run = (command: CurrentPcbViaSavedCacheCommand, reply: unknown): void => { const plan = ledger.prepare(command); assert.throws(() => ledger.accept({ ...plan }, reply)); ledger.accept(plan, reply); };
  assert.throws(() => ledger.prepare({ phase: "saved-cache-delete", ordinal: 0 }));
  for (const ordinal of [0, 1] as const) {
    run({ phase: "saved-cache-key", step: ordinal === 0 ? "before-delete-0" : "before-delete-1" }, { storageKey });
    run({ phase: "saved-cache-names", step: ordinal === 0 ? "before-delete-0" : "before-delete-1" }, { caches: [...selected.slice(ordinal), peer] });
    const plan = ledger.prepare({ phase: "saved-cache-delete", ordinal }); assert.deepEqual(plan.params, { cacheId: `cache-${String(ordinal)}` });
    const wire = currentPcbViaSavedCacheWire(plan, 142 + ordinal, frame.sessionId);
    const bytes = Buffer.from(`${JSON.stringify(wire)}\0`), native = currentPcbViaSavedCacheNativeFrame(bytes, plan, frame.sessionId);
    assert.equal(native["cacheId"], `cache-${String(ordinal)}`);
    const foreignWire = Buffer.from(`${JSON.stringify({ ...wire, params: { cacheId: "peer" } })}\0`);
    assert.throws(() => currentPcbViaSavedCacheNativeFrame(foreignWire, plan, frame.sessionId));
    ledger.accept(plan, {}); assert.throws(() => ledger.prepare({ phase: "saved-cache-delete", ordinal }));
    assert.equal(ledger.observeOriginalEvent({ method: "Storage.cacheStorageListUpdated", sessionId: frame.sessionId, params: { origin, storageKey, bucketId: "default" } }), true);
    run({ phase: "saved-cache-names", step: ordinal === 0 ? "after-delete-0" : "after-delete-1" }, { caches: [...selected.slice(ordinal + 1), peer] });
  }
  run({ phase: "saved-cache-names", step: "absence" }, { caches: [peer] }); const snapshot = ledger.snapshot();
  ledger.requireOriginalSnapshot(snapshot); assert.throws(() => { ledger.requireOriginalSnapshot({ ...snapshot }); });
  assert.deepEqual(snapshot.deleteOrdinals, [0, 1]); assert.equal(snapshot.freshLoadingVerified, false); assert.equal(ledger.status().complete, true);
});
void test("absent namespaces skip deletes; peer drift, lost reply and unexpected content event refuse", () => {
  const empty = new CurrentPcbViaSavedCacheInvalidationLedger(before(true));
  for (const ordinal of [0, 1] as const) {
    empty.accept(empty.prepare({ phase: "saved-cache-key", step: ordinal === 0 ? "before-delete-0" : "before-delete-1" }), { storageKey });
    empty.accept(empty.prepare({ phase: "saved-cache-names", step: ordinal === 0 ? "before-delete-0" : "before-delete-1" }), { caches: [peer] });
    assert.throws(() => empty.prepare({ phase: "saved-cache-delete", ordinal }));
    empty.accept(empty.prepare({ phase: "saved-cache-names", step: ordinal === 0 ? "after-delete-0" : "after-delete-1" }), { caches: [peer] });
  }
  empty.accept(empty.prepare({ phase: "saved-cache-names", step: "absence" }), { caches: [peer] }); assert.deepEqual(empty.snapshot().deleteOrdinals, []);
  const changed = new CurrentPcbViaSavedCacheInvalidationLedger(before());
  changed.accept(changed.prepare({ phase: "saved-cache-key", step: "before-delete-0" }), { storageKey });
  assert.throws(() => changed.accept(changed.prepare({ phase: "saved-cache-names", step: "before-delete-0" }), { caches: selected })); assert.equal(changed.status().failed, true);
  const lost = new CurrentPcbViaSavedCacheInvalidationLedger(before()); const original = lost.prepare({ phase: "saved-cache-key", step: "before-delete-0" }); lost.failOriginalDispatch(original);
  assert.throws(() => lost.prepare(original.command));
  const foreign = new CurrentPcbViaSavedCacheInvalidationLedger(before());
  assert.throws(() => foreign.observeOriginalEvent({ method: "Storage.cacheStorageContentUpdated", sessionId: frame.sessionId, params: { origin, storageKey, cacheName: "unchanged-peer" } }));
  assert.equal(foreign.status().failed, true);
});

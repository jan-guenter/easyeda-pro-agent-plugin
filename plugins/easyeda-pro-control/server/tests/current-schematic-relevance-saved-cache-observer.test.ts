/** Actual automatic driver and both real custody ledgers with one explicit
 * original-native binding seam. No Cache API/native owner is constructed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { freshSyntheticSavedCacheDriver } from "./helpers/current-pcb-via-saved-cache-fixture.ts";

async function fixture(excess = false): Promise<Readonly<{ observe: () => Promise<void>; data: ReturnType<typeof freshSyntheticSavedCacheDriver> }>> {
  const data = freshSyntheticSavedCacheDriver(excess); const owner = Object.freeze({ inertOriginalOwner: true }); const origin = Object.freeze({ inertOriginalOrigin: true });
  const bindings = Object.freeze({ prepared: data.prepared, projectUuid: "a".repeat(64), request: data.request, metadataRequest: data.metadataRequest,
    assertCurrent: async (): Promise<void> => { await Promise.resolve(); },
    requirePacket: data.ledger.requireOriginalPacket.bind(data.ledger), requireMetadataPacket: data.metadata.requireOriginalPacket.bind(data.metadata),
    snapshot: data.ledger.snapshot.bind(data.ledger), requireSnapshot: data.ledger.requireOriginalSnapshot.bind(data.ledger),
    metadataSnapshot: data.metadata.snapshot.bind(data.metadata), requireMetadataSnapshot: data.metadata.requireOriginalSnapshot.bind(data.metadata) });
  const url = new URL("../src/current-schematic-relevance-saved-cache-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-schematic-relevance-saved-readback-owner.ts" ? {
    requireOriginalCurrentSchematicRelevanceSavedCacheOrigin: (actual: unknown, actor: unknown, prepared: unknown): object => { assert.equal(actual, origin); assert.equal(actor, owner); assert.equal(prepared, data.prepared); return bindings; },
  } : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const observe = loaded.exports["observeOriginalCurrentSchematicRelevanceSavedCaches"]; assert.ok(typeof observe === "function");
  return { data, observe: async (): Promise<void> => { const result: unknown = Reflect.apply(observe, undefined, [owner, data.prepared, origin]); assert.ok(result instanceof Promise); await result; } };
}
void test("automatic schematic cache driver completes both actual ledgers and every original helper receipt", async () => {
  const f = await fixture(); await f.observe();
  assert.equal(f.data.ledger.snapshot().completeRepeatedCdpData, true); assert.equal(f.data.metadata.snapshot().completeHelperSourcesVerified, true);
  assert.equal(f.data.metadata.snapshot().helperEvents.length, 12); assert.equal(f.data.commands.filter(value => value === "saved-cache-native-helper-source").length, 12);
  assert.equal(f.data.commands.includes("saved-cache-delete"), false); assert.equal(f.data.commands.includes("saved-cache-untrack"), false);
});
void test("schematic combined ninth entry stops the actual driver/ledger before any cache body or delete", async () => {
  const f = await fixture(true); await assert.rejects(f.observe());
  assert.equal(f.data.commands.filter(value => value === "saved-cache-entries").length, 2);
  assert.equal(f.data.commands.includes("saved-cache-body"), false); assert.equal(f.data.commands.includes("saved-cache-delete"), false);
});

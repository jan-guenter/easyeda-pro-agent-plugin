import assert from "node:assert/strict";
import { test } from "node:test";
import { STORAGE_MARKER_DESCRIPTOR, validateStorageMarkerResult } from "../../src/storage-marker.ts";
import type { Fixture, marker as fixtureMarker } from "./storage-marker-fixture.ts";

interface FixtureSource {
  readonly cacheName: string;
  readonly fixture: () => Fixture;
  readonly marker: typeof fixtureMarker;
  readonly markerKey: string;
  readonly seed: (state: Fixture) => void;
}

const nondefault = Object.freeze({ profile: STORAGE_MARKER_DESCRIPTOR, namespaceNonce: "d".repeat(64), keyNonce: "e".repeat(64), bodyNonce: "f".repeat(64) });
const nondefaultCacheName = `easyeda-pro-agent.storage-continuity.v1.${nondefault.namespaceNonce}`;

async function storageCall(state: Fixture, name: "has" | "open", args: readonly unknown[]): Promise<unknown> {
  const method: unknown = Reflect.get(Object.getPrototypeOf(state.storage), name);
  assert.equal(typeof method, "function"); assert.ok(typeof method === "function");
  return await Reflect.apply(method, state.storage, args);
}

// Test registration only. Both entry wrappers supply their fixed imported fixture module.
export function registerNamespaceCases(source: FixtureSource): void {
  const { cacheName, fixture, marker, markerKey, seed } = source;
  void test("default creation preserves exact calls and native marker readback", async () => {
    const state = fixture();
    validateStorageMarkerResult(await state.run(true), marker, "created-and-readback");
    assert.deepEqual(state.calls.map((call) => call.kind), ["has", "open", "keys", "put", "match", "body-read", "body-read", "keys"]);
    assert.deepEqual(state.calls[0]?.args, [cacheName]); assert.deepEqual(state.calls[1]?.args, [cacheName]);
    assert.deepEqual(structuredClone(state.calls[4]?.args), [markerKey, { cacheName, ignoreSearch: false, ignoreMethod: false, ignoreVary: false }]);
    assert.equal(state.entries.size, 1); assert.equal(state.cleared, 1);
  });
  void test("default seeded cache remains readable without creation", async () => {
    const state = fixture(); seed(state);
    validateStorageMarkerResult(await state.run(), marker, "observed-present");
    assert.deepEqual(state.calls.map((call) => call.kind), ["match", "body-read", "body-read"]);
    assert.equal(state.exists, true); assert.equal(state.entries.size, 1);
    await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:HAS/u);
  });
  void test("default manually existing empty cache retains its old refusal", async () => {
    const state = fixture(); state.exists = true;
    assert.equal(await storageCall(state, "has", [cacheName]), true);
    await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:MATCH/u);
    assert.equal(state.entries.size, 0); assert.equal(state.exists, true);
  });
  void test("nondefault 64-hex namespace creates and reads back through unchanged compiled expressions", async () => {
    const state = fixture();
    validateStorageMarkerResult(await state.run(true, nondefault), nondefault, "created-and-readback");
    assert.deepEqual(state.calls[0]?.args, [nondefaultCacheName]); assert.deepEqual(state.calls[1]?.args, [nondefaultCacheName]);
    assert.deepEqual(structuredClone(state.calls[4]?.args), [`https://client/.easyeda-pro-agent/storage-continuity/v1/${nondefault.keyNonce}`, { cacheName: nondefaultCacheName, ignoreSearch: false, ignoreMethod: false, ignoreVary: false }]);
    const before = state.calls.length;
    validateStorageMarkerResult(await state.run(false, nondefault), nondefault, "observed-present");
    assert.deepEqual(state.calls.slice(before).map((call) => call.kind), ["match", "body-read", "body-read"]);
    assert.equal(state.entries.size, 1); assert.equal(state.calls.filter((call) => call.kind === "put").length, 1);
  });
  void test("has honors the retained opened namespace rather than any existing cache", async () => {
    const state = fixture();
    assert.equal(await storageCall(state, "has", [cacheName]), false);
    assert.equal(await storageCall(state, "has", [nondefaultCacheName]), false);
    assert.equal(await storageCall(state, "open", [nondefaultCacheName]), state.cache);
    assert.equal(await storageCall(state, "has", [nondefaultCacheName]), true);
    assert.equal(await storageCall(state, "has", [cacheName]), false);
  });
  void test("wrong namespace cannot read matching key and body from the opened cache", async () => {
    const state = fixture();
    validateStorageMarkerResult(await state.run(true, nondefault), nondefault, "created-and-readback");
    const before = state.calls.length, entries = structuredClone([...state.entries]);
    await assert.rejects(state.run(false, { ...nondefault, namespaceNonce: marker.namespaceNonce }), /STORAGE_MARKER_REFUSED:MATCH/u);
    assert.deepEqual(state.calls.slice(before).map((call) => call.kind), ["match"]);
    assert.deepEqual([...state.entries], entries); assert.equal(state.exists, true);
    validateStorageMarkerResult(await state.run(false, nondefault), nondefault, "observed-present");
  });
  void test("single-cache fixture refuses a second existing namespace before aliasing entries", async () => {
    const state = fixture(); seed(state);
    const entries = structuredClone([...state.entries]);
    await assert.rejects(state.run(true, nondefault), /STORAGE_MARKER_REFUSED:OPEN/u);
    assert.deepEqual(state.calls.map((call) => call.kind), ["has"]);
    assert.deepEqual([...state.entries], entries); assert.equal(state.exists, true);
    validateStorageMarkerResult(await state.run(), marker, "observed-present");
  });
  void test("opening the same existing namespace retains the original single cache", async () => {
    const state = fixture(); seed(state);
    const entries = structuredClone([...state.entries]);
    assert.equal(await storageCall(state, "open", [cacheName]), state.cache);
    assert.equal(await storageCall(state, "open", [cacheName]), state.cache);
    assert.deepEqual([...state.entries], entries);
    assert.deepEqual(state.calls.map((call) => call.kind), ["open", "open"]);
  });
  void test("legacy default exists and entries transfer remains readable", async () => {
    const original = fixture(); seed(original);
    const state = fixture(); state.exists = original.exists; state.entries = original.entries;
    validateStorageMarkerResult(await state.run(), marker, "observed-present");
    assert.deepEqual(state.calls.map((call) => call.kind), ["match", "body-read", "body-read"]);
    assert.equal(state.entries, original.entries);
  });
}

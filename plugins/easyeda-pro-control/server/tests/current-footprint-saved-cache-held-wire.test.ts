/** Fixed encoding parity only. No native cache getter, namespace operation,
 * Windows process or mounted transport is exercised by these tests. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentFootprintSavedCacheHeldNativeCases, currentFootprintSavedCacheHeldNativeSource } from "../src/current-footprint-saved-cache-held-native.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as LIMITS } from "../src/current-footprint-saved-cache-held-profile.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_REQUEST_COUNT as REQUESTS, currentFootprintSavedCacheHeldWire } from "../src/current-footprint-saved-cache-held-wire.ts";
import { combinedDiagnosticNativeRequest, diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentFootprintCombinedStartupWire, currentFootprintCopySavedStartupWire } from "../src/current-pcb-worker-startup-wire.ts";

void test("held-cache physical int32 IDs remain separate from unit counts and old native purposes refuse it", () => {
  const cases = currentFootprintSavedCacheHeldNativeCases();
  assert.equal(REQUESTS, LIMITS.normal + LIMITS.cleanup); assert.equal(REQUESTS, 12); assert.equal(cases.length, REQUESTS);
  assert.deepEqual(cases.map(command => command.heldCachePhase), ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties",
    "recheck-before-getter", "retain-receiver", "queue-first", "recheck-first", "queue-fresh", "recheck-fresh", "release"]);
  for (const command of cases) {
    for (const id of [1, 73, 2_147_483_647]) {
      const wire = currentFootprintSavedCacheHeldWire(command, id);
      assert.equal(wire.request["action"], "saved-cache-held"); assert.equal(wire.request["requestId"], id);
      assert.equal(wire.request["phase"], command.heldCachePhase); assert.equal(wire.request["sessionId"], command.sessionId);
      assert.equal(Object.isFrozen(wire.command.params), true); assert.equal(Object.isFrozen(wire.request), true);
      for (const field of ["params", "program", "functionDeclaration", "arguments", "objectGroup", "budget", "throwOnSideEffect"]) { assert.equal(Object.hasOwn(wire.request, field), false, field); }
      const chunk = Buffer.from(`${JSON.stringify(wire.command)}\0`);
      for (const encode of [diagnosticNativeRequest, combinedDiagnosticNativeRequest, stringPrecreateNativeRequest]) { assert.throws(() => encode(chunk)); }
      for (const encode of [currentFootprintCopySavedStartupWire, currentFootprintCombinedStartupWire]) { assert.throws(() => encode(command, id)); }
    }
    for (const id of [0, -0, -1, 2_147_483_648, Number.MAX_SAFE_INTEGER, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) { assert.throws(() => currentFootprintSavedCacheHeldWire(command, id)); }
  }
});

void test("held-cache native table independently preserves all twelve complete commands and smoke hashes", () => {
  const native = currentFootprintSavedCacheHeldNativeSource();
  const table = /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z0-9+/=]+)",(\d+),@"([a-f0-9]{64})",@"([a-f0-9]{64})",(\d+),4\)/u.exec(native);
  assert.ok(table?.[1] !== undefined && table[2] !== undefined && table[3] !== undefined && table[4] !== undefined && table[5] !== undefined);
  const compressed = Buffer.from(table[1], "base64"); assert.equal(compressed.toString("base64"), table[1]);
  assert.ok(compressed.length >= 18 && compressed.length <= 65_536); assert.equal(createHash("sha256").update(compressed).digest("hex"), table[4]);
  // oxlint-disable-next-line node/no-sync -- Decode one generated table with its declared64KiB ceiling; no native code executes.
  const bytes = gunzipSync(compressed, { maxOutputLength: 65_536 });
  assert.equal(bytes.length, Number(table[2])); assert.equal(createHash("sha256").update(bytes).digest("hex"), table[3]);
  const cases = currentFootprintSavedCacheHeldNativeCases(), rows = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\0");
  assert.equal(rows.length, Number(table[5])); assert.equal(rows.length, REQUESTS);
  const vector = /string\[\] hashes=EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z0-9+/=]+)",(\d+)\)/u.exec(native);
  assert.ok(vector?.[1] !== undefined && vector[2] !== undefined); assert.equal(Number(vector[2]), REQUESTS);
  const hashes = Buffer.from(vector[1], "base64"); assert.equal(hashes.toString("base64"), vector[1]); assert.equal(hashes.length, REQUESTS * 32);
  for (const [index, row] of rows.entries()) {
    const command = cases[index], fields = row.split("\t"); assert.equal(fields.length, 4); assert.ok(command !== undefined);
    const [phase, method, names, template] = fields; assert.ok(names !== undefined && template !== undefined);
    assert.equal(phase, command.heldCachePhase); assert.equal(method, command.method);
    const wire = currentFootprintSavedCacheHeldWire(command, 73);
    assert.deepEqual(names.split(","), Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name)));
    const replaced = template.replaceAll(/"__heldcache_([A-Za-z0-9]+)__"/gu, (_match, name: string) => {
      const value = wire.request[name]; assert.equal(typeof value, "string"); return JSON.stringify(value);
    });
    const { heldCachePhase: _phase, ...expected } = command;
    assert.equal(replaced, JSON.stringify(expected));
    const packet = `{"id":73,${replaced.slice(1)}\0`;
    assert.equal(createHash("sha256").update(packet).digest("hex"), hashes.subarray(index * 32, (index + 1) * 32).toString("hex"));
  }
});

void test("held-cache wire rejects nonfixed programs, flags, identifiers and extra scalar vocabulary", () => {
  for (const command of currentFootprintSavedCacheHeldNativeCases()) {
    for (const changed of [{ ...command, heldCachePhase: "unknown" }, { ...command, method: "Runtime.evaluate" }, { ...command, extra: true },
      { ...command, sessionId: "x".repeat(129) }, { ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } },
      { ...command, params: { ...command.params, userGesture: true } }, { ...command, params: { ...command.params, budget: 12 } }]) {
      assert.throws(() => currentFootprintSavedCacheHeldWire(changed, 1));
    }
    if ("uniqueContextId" in command.params) {
      assert.throws(() => currentFootprintSavedCacheHeldWire({ ...command, params: { ...command.params, uniqueContextId: "x".repeat(129) } }, 1));
    }
    if ("objectId" in command.params) {
      assert.throws(() => currentFootprintSavedCacheHeldWire({ ...command, params: { ...command.params, objectId: "x".repeat(257) } }, 1));
    }
    if (command.heldCachePhase === "queue-first" || command.heldCachePhase === "queue-fresh") {
      for (const args of [[{ value: "a".repeat(63) }, { value: "b".repeat(32) }], [{ value: "A".repeat(64) }, { value: "b".repeat(32) }],
        [{ value: "a".repeat(64) }, { value: "B".repeat(32) }], [{ objectId: "retained" }, { value: "b".repeat(32) }]]) {
        assert.throws(() => currentFootprintSavedCacheHeldWire({ ...command, params: { ...command.params, arguments: args } }, 1));
      }
    }
  }
});

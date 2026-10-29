/** Pure fixed-wire parity. No native owner, renderer or application connects. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { currentFootprintCopyClockRpcNativeCases, currentFootprintCopyClockRpcNativeSource } from "../src/current-footprint-copy-clock-rpc-native.ts";
import { currentFootprintCopyClockRpcWire } from "../src/current-footprint-copy-clock-rpc-wire.ts";

const worker = "clockrpc_worker"; const ui = "clockrpc_ui";
void test("all24 fixed native templates preserve exact realms, source sites, conditions, programs and scalar comparison arguments", () => {
  const cases = currentFootprintCopyClockRpcNativeCases(), source = currentFootprintCopyClockRpcNativeSource(); assert.equal(cases.length, 24);
  const encoded = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1]; assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decode the bounded in-memory finite table, without reading application assets or an external input.
  const rows = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8").split("\0"); assert.equal(rows.length, 24);
  const phases = new Set<string>();
  for (const [index, command] of cases.entries()) {
    const wire = currentFootprintCopyClockRpcWire(command, 73, worker, ui); const row = rows[index]?.split("\t"); assert.ok(row !== undefined);
    const phase = row[0]; const realm = row[2]; const template = row[4]; assert.ok(phase !== undefined && realm !== undefined && template !== undefined);
    assert.equal(phases.has(phase), false); phases.add(phase); assert.equal(row[1], command.method);
    assert.ok(realm === "*" || realm === wire.request["realm"]);
    const inline = template.replaceAll("__clockrpc_inlineBus__", String(wire.request["busUuid"]));
    const restored = inline.replaceAll(/"__clockrpc_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(name === "sessionId" ? command.sessionId : wire.request[name]));
    const actual: unknown = JSON.parse(restored); assert.deepEqual(actual, { method: command.method, sessionId: command.sessionId, params: command.params });
    assert.equal(wire.request["action"], "footprint-clock-rpc-send");
    for (const forbidden of ["sessionId", "url", "functionDeclaration", "expression", "condition", "arguments", "params"]) { assert.equal(Object.hasOwn(wire.request, forbidden), false); }
    assert.ok(Object.values(wire.request).every(value => typeof value === "string" || typeof value === "number"));
    assert.throws(() => currentFootprintCopyClockRpcWire(command, 0, worker, ui));
    assert.throws(() => currentFootprintCopyClockRpcWire(command, 73, worker, worker));
    assert.throws(() => currentFootprintCopyClockRpcWire({ ...command, sessionId: "copied" }, 73, worker, ui));
    assert.throws(() => currentFootprintCopyClockRpcWire({ ...command, program: "function(){}" }, 73, worker, ui));
    if (realm !== "*") { assert.throws(() => currentFootprintCopyClockRpcWire({ ...command, sessionId: command.sessionId === worker ? ui : worker }, 73, worker, ui)); }
  }
  assert.deepEqual(CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS, { normal: 49, cleanup: 18, total: 67 });
});

void test("request IDs remain separate from actual clock IDs and scalar schema refusals precede flat transport", () => {
  const result = currentFootprintCopyClockRpcNativeCases().find(command => command.phase === "rpc-result"); assert.ok(result !== undefined);
  const wire = currentFootprintCopyClockRpcWire(result, 73, worker, ui);
  assert.equal(wire.request["requestId"], 73); assert.equal(wire.request["clockRequestId"], 41); assert.equal(wire.request["ordinal"], 1);
  const producer = currentFootprintCopyClockRpcNativeCases().find(command => command.phase === "rpc-producer"); assert.ok(producer !== undefined);
  const params = producer.params; const raw = params["arguments"]; assert.ok(Array.isArray(raw)); const args: readonly unknown[] = raw;
  for (const ordinal of [0, 3, "1", -0, 1.5, Number.NaN]) {
    assert.throws(() => currentFootprintCopyClockRpcWire({ ...producer, params: { ...params, arguments: [...args.slice(0, 2), { value: ordinal }] } }, 73, worker, ui));
  }
  const second = currentFootprintCopyClockRpcWire({ ...producer, params: { ...params, arguments: [...args.slice(0, 2), { value: 2 }] } }, 73, worker, ui);
  assert.equal(second.request["ordinal"], 2); assert.equal(second.request["observedValue"], 1_700_000_000_123);
});

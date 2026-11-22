import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_WIRE_NET_WATCH_LIMIT as WATCH } from "../src/current-schematic-wire-net-watch-protocol.ts";
import { currentSchematicWireV5NetNativeSource } from "../src/current-schematic-wire-v5-net-native.ts";
import { currentSchematicWireWriterV5NativeRequest } from "../src/current-schematic-wire-writer-v5-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_V5_NET_REQUESTS as LIMIT, currentSchematicWireV5NetCases, currentSchematicWireV5NetWire, decodeCurrentSchematicWireV5NetWire } from "../src/current-schematic-wire-v5-net-protocol.ts";

const table = /EasyedaDiagnosticFixedTable\.Load\("([\w+/=]+)", (\d+), "([\da-f]{64})", "([\da-f]{64})", (\d+), 5\)/gu;
const bound = Object.freeze({ id: 47, sessionId: "original-session.2" });
function digest(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function nativeRows(source: string): readonly (readonly string[])[] {
  return [...source.matchAll(table)].flatMap(([, packed, length, sha, packedSha, count]) => {
    assert.ok(packed !== undefined && length !== undefined && count !== undefined);
    const bytes = Buffer.from(packed, "base64");
    // oxlint-disable-next-line node/no-sync -- This synchronous fixture decodes only the small bounded native review tables.
    const plain = gunzipSync(bytes, { maxOutputLength: 65_536 });
    assert.equal(digest(bytes), packedSha);
    assert.equal(digest(plain), sha);
    assert.equal(plain.length, Number(length));
    const rows = plain.toString("utf8").split("\0");
    assert.equal(rows.length, Number(count));
    return rows.map(row => row.split("\t"));
  });
}
function frame(wire: object): Buffer { return Buffer.from(`${JSON.stringify(wire)}\0`); }

void test("V5 net observation wire and packed native rows admit only the exact finite requests", () => {
  const source = currentSchematicWireV5NetNativeSource();
  const rows = nativeRows(source);
  assert.equal(rows.length, 69);
  for (const [selector, command] of currentSchematicWireV5NetCases().entries()) {
    const expected = currentSchematicWireV5NetWire(command, bound);
    assert.deepEqual(decodeCurrentSchematicWireV5NetWire(frame(expected.wire), bound), expected);
    assert.equal(expected.native["selector"], selector);
    const row = rows[selector];
    assert.ok(row !== undefined && row.length === 5);
    const [lane, kind, method, names, native] = row;
    assert.equal(lane, expected.lane);
    assert.equal(kind, expected.kind);
    assert.equal(method, command.method);
    assert.ok(native !== undefined && names !== undefined);
    let rendered = native;
    for (const name of names === "" ? [] : names.split(",")) {
      const value = expected.native[name];
      assert.equal(typeof value, "string");
      rendered = rendered.replace(`"@wire_v5_net_${name}@"`, JSON.stringify(value));
    }
    assert.equal(rendered, JSON.stringify({ method: command.method, params: command.params }));
  }
  const property = currentSchematicWireV5NetCases().find(row => row.method === "Runtime.getProperties");
  const release = currentSchematicWireV5NetCases().find(row => row.phase === "wire-v5-net-watch-release");
  const arm = currentSchematicWireV5NetCases().find(row => row.phase === "wire-v5-net-geometry-arm");
  assert.ok(property !== undefined && release !== undefined && arm !== undefined);
  const packet = currentSchematicWireV5NetWire(property, bound);
  const valid = frame(packet.wire);
  assert.throws(() => currentSchematicWireWriterV5NativeRequest(valid));
  assert.throws(() => decodeCurrentSchematicWireV5NetWire(valid, { ...bound, id: bound.id + 1 }));
  assert.throws(() => decodeCurrentSchematicWireV5NetWire(valid, { ...bound, sessionId: "foreign" }));
  const duplicate = Buffer.from(valid.toString("utf8").replace("{", "{\"id\":48,"));
  assert.throws(() => decodeCurrentSchematicWireV5NetWire(duplicate, bound));
  assert.throws(() => decodeCurrentSchematicWireV5NetWire(frame({ ...packet.wire, originalOwner: true }), bound));
  assert.throws(() => currentSchematicWireV5NetWire({ ...property, method: "Runtime.evaluate" }, bound));
  assert.throws(() => currentSchematicWireV5NetWire({ ...property, params: { ...property.params, objectId: "@wire_v5_net_objectId@" } }, bound));
  assert.throws(() => currentSchematicWireV5NetWire({ ...release, params: { objectGroup: "foreign" } }, bound));
  assert.throws(() => currentSchematicWireV5NetWire({ ...arm, params: { ...arm.params, condition: "true" } }, bound));

  assert.equal(LIMIT.laneCommands.watch - LIMIT.watch.remove - LIMIT.watch.release, WATCH.normal);
  assert.equal(LIMIT.watch.remove, WATCH.cleanup);
  assert.equal(LIMIT.geometry.properties + LIMIT.geometry.call + LIMIT.geometry.frame + LIMIT.geometry.source, 46);
  assert.deepEqual(LIMIT.laneCommands, { watch: 97, geometry: 65 });
  assert.equal(LIMIT.wire, 162);
  assert.equal(LIMIT.addedContinuityChecks, 324);
  assert.equal(LIMIT.addedRendererRequests, 810);
  assert.equal(LIMIT.qualifiedHelperAndPauseEventReservation, 373);
  assert.equal(LIMIT.addedNativeSendAndPollControls, 203_310);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentSchematicRelevanceModifyStructureReply as capture, decodeCurrentSchematicRelevanceModifyStructureArrayFields as decode } from "../src/current-project-save-structure-observer.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_REQUESTS as WORKER } from "../src/current-schematic-relevance-modify-worker-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_REQUESTS as MODIFY } from "../src/current-schematic-relevance-modify-structure-protocol.ts";

function packet(size: number): Readonly<{ result: readonly object[] }> {
  return { result: [...Array.from({ length: size }, (_value, index) => ({ name: String(index), value: { type: "object", objectId: `held_${String(index)}` }, isOwn: true })), { name: "length", value: { type: "number", value: size }, isOwn: true }] };
}
void test("Modify cumulative rosters admit256 prior objects while preserving the128-new-object budget and strict dense data fields", () => {
  assert.equal(WORKER.objects, 256); assert.equal(MODIFY.objects, 128);
  for (const size of [0, 64, 128, 256]) { const fields = decode(packet(size), size); assert.equal(fields.size, size + 1); assert.equal(fields.get("length")?.value, size); }
  assert.throws(() => decode(packet(257))); assert.throws(() => decode(packet(128), 127));
  const original = packet(256); assert.throws(() => decode({ result: original.result.slice(1) })); assert.throws(() => decode({ result: [...original.result.slice(0, -2), original.result[0], original.result.at(-1)] }));
  assert.throws(() => decode({ result: [{ name: "0", get: { type: "function", objectId: "accessor" }, isOwn: true }, { name: "length", value: { type: "number", value: 1 }, isOwn: true }] }));
});

void test("the Modify send capture accepts the complete257-row roster only for the explicit array-property path", () => {
  for (const size of [0, 64, 128, 192, 256]) {
    const raw = packet(size); const captured = capture(raw, true); const fields = decode(captured, size);
    assert.equal(fields.size, size + 1); assert.equal(fields.get("length")?.value, size); assert.equal(Object.isFrozen(captured), true);
  }
  assert.throws(() => capture(packet(256))); assert.throws(() => capture(packet(256), false));
  assert.throws(() => capture(packet(257), true));
  const ordinary = { result: { type: "boolean", value: true } }; assert.deepEqual(structuredClone(capture(ordinary)), ordinary);
  let hooks = 0; const trap = (): never => { hooks += 1; throw new Error("must not inspect"); };
  assert.throws(() => capture(new Proxy({}, { getPrototypeOf: trap, ownKeys: trap }), true));
  assert.throws(() => capture({ result: [Object.defineProperty({}, "name", { enumerable: true, get: trap })] }, true));
  const row = { name: "0", value: { type: "object", objectId: "held" }, isOwn: true };
  assert.throws(() => capture({ result: [row, row] }, true));
  assert.throws(() => capture({ text: "x".repeat(16_385) }, true));
  assert.throws(() => capture({ fields: Array.from({ length: 9 }, () => "x".repeat(16_384)) }, true));
  assert.throws(() => capture({ result: Array.from({ length: 257 }, () => Object.fromEntries(Array.from({ length: 32 }, (_unused, index) => [String(index), true]))) }, true));
  assert.equal(hooks, 0);
});

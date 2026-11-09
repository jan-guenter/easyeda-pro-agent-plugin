import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentSchematicRelevanceModifyStructureArrayFields as decode } from "../src/current-project-save-structure-observer.ts";
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

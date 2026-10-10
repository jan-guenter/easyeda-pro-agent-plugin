import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { buildDesignStackAdapter, compileDesignStackOperation, expectedDesignStackSource, inverseDesignStackOperation, nativeStackZIndex, verifyDesignStackSourceEffect } from "../src/design-stack-adapter.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { verifyStackPersistence } from "../src/stack-persistence.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "stack-fixture", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...base, sha256: sha256Json(base) };
}

const BASELINE = snapshot([
  ...[1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 361].map((id): NativeSourceObject => ({ id: JSON.stringify(["LAYER", id]), type: "LAYER", body: { layerId: id, layerType: new Map([[1, "TOP"], [2, "BOTTOM"], [361, "SUBSTRATE"], [3, "TOP_SILK"], [4, "BOT_SILK"], [5, "TOP_SOLDER_MASK"], [6, "BOT_SOLDER_MASK"], [7, "TOP_PASTE_MASK"], [8, "BOT_PASTE_MASK"]]).get(id) ?? "SIGNAL", layerName: `layer${id}`, use: id < 9, show: id < 9, locked: false, activeColor: "#000000", activateTransparency: 1, inactiveColor: "#000000", inactiveTransparency: 0.5 } })),
  ...[3, 7, 5, 1, 361, 2, 6, 8, 4].map((id, index): NativeSourceObject => ({ id: JSON.stringify(["LAYER_PHYS", id]), type: "LAYER_PHYS", body: { material: null, thickness: [1, 361, 2].includes(id) ? 1 : 0, permittivity: null, lossTangent: null, isKeepIsland: true, zIndex: nativeStackZIndex(id, index) } })),
  { id: "ACTIVE_LAYER", type: "ACTIVE_LAYER", body: { layerId: 1 } },
  { id: "opaque", type: "FUTURE", body: { untouched: [1, 2, 3] } },
]);
const OPERATION = { id: "four-layer", action: "pcb.stack.replace", enabledCopperLayers: [1, 15, 16, 2], layers: [3, 7, 5, 1, 361, 15, 362, 16, 363, 2, 6, 8, 4].map((id) => ({ layerId: id, material: id >= 361 ? "FR4" : null, thicknessMm: id >= 361 ? 0.48 : 0.035, permittivity: id >= 361 ? 4.5 : null, lossTangent: id >= 361 ? 0.02 : null, isKeepIsland: true })) };

function checkpoint(source: NativeSourceSnapshot, retained: readonly NativeSourceObject[] = []): NativeHistorySnapshot {
  const base = { uuid: "stack-fixture", docType: "PCB", metadata: source.document, records: [...source.objects, ...retained].toSorted((left, right) => left.id.localeCompare(right.id)) };
  const documents = [{ ...base, records: base.records.map((record) => ({ ...record, ticket: 1, client: null })), semanticSha256: sha256Json(base) }];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), branchUuid: "22".repeat(16), headHistoryUuid: "33".repeat(16),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("physical stack replacement uses native layer identities, fixed units and exact unrelated records", () => {
  const expected = expectedDesignStackSource(OPERATION, BASELINE);
  const delta = verifyDesignStackSourceEffect(OPERATION, BASELINE, expected);
  assert.equal(delta.added.length, 6);
  assert.equal(expected.objects.find((object) => object.id === '["LAYER_PHYS",1]')?.body["thickness"], 1.378);
  assert.equal(expected.objects.find((object) => object.id === '["LAYER",362]')?.body["layerName"], "Dielectric2");
  assert.deepEqual(expected.objects.find((object) => object.id === "opaque"), BASELINE.objects.find((object) => object.id === "opaque"));
  assert.equal(buildDesignStackAdapter(OPERATION, BASELINE).expected.sha256, expected.sha256);
  assert.equal(compileDesignStackOperation(OPERATION).resultKind, "boolean");
  const inverse = inverseDesignStackOperation(OPERATION, BASELINE);
  assert.ok(inverse);
  assert.deepEqual(expectedDesignStackSource(inverse, expected), BASELINE);
  const collateral = snapshot(expected.objects.filter((object) => object.id !== "opaque"));
  assert.throws(() => verifyDesignStackSourceEffect(OPERATION, BASELINE, collateral), /unrelated/u);
});

void test("stack rejects ambiguous identities, invalid ordering, and disabling active or populated copper", () => {
  assert.throws(() => expectedDesignStackSource({ ...OPERATION, layers: OPERATION.layers.toReversed() }, BASELINE), /Top.to.Bottom|ascend/u);
  assert.throws(() => expectedDesignStackSource({ ...OPERATION, layers: OPERATION.layers.filter((entry) => entry.layerId !== 362) }, BASELINE), /alternate|consecutive/u);
  const twoLayer = { ...OPERATION, enabledCopperLayers: [1, 2], layers: OPERATION.layers.filter((entry) => ![15, 16, 362, 363].includes(entry.layerId)) };
  const active = snapshot(BASELINE.objects.map((object) => object.id === "ACTIVE_LAYER" ? { ...object, body: { layerId: 15 } } : object));
  assert.throws(() => expectedDesignStackSource(twoLayer, active), /active/u);
  const populated = snapshot([...BASELINE.objects, { id: "line", type: "LINE", body: { layerId: 15 } }]);
  assert.throws(() => expectedDesignStackSource(twoLayer, populated), /containing/u);
  assert.throws(() => expectedDesignStackSource({ ...OPERATION, rawSource: "untrusted" }, BASELINE));
  assert.throws(() => expectedDesignStackSource({ ...OPERATION, layers: OPERATION.layers.map((entry) => entry.layerId === 15 ? { ...entry, zIndex: 2000 } : entry) }, BASELINE), /canonical|ascend/u);
});

void test("stack reduction retains only exact prior substrate records filtered from the native source", () => {
  const four = expectedDesignStackSource(OPERATION, BASELINE), inverse = inverseDesignStackOperation(OPERATION, BASELINE);
  assert.ok(inverse);
  const retired = four.objects.filter((record) => record.type === "LAYER" && ['["LAYER",362]', '["LAYER",363]'].includes(record.id));
  const input = { before: checkpoint(four), after: checkpoint(BASELINE, retired), expectedBefore: four, expectedAfter: BASELINE };
  assert.equal(verifyStackPersistence(input, inverse)["ok"], true);
  assert.throws(() => verifyStackPersistence({ ...input, after: checkpoint(BASELINE) }, inverse));
  const changedRetired = structuredClone(retired);
  for (const record of changedRetired) { record.body["activeColor"] = "#FF0000"; }
  assert.throws(() => verifyStackPersistence({ ...input, after: checkpoint(BASELINE, changedRetired) }, inverse));
  const alteredObjects = structuredClone(BASELINE.objects);
  for (const record of alteredObjects) { if (record.id === "opaque") { record.body["changed"] = true; } }
  const altered = snapshot(alteredObjects);
  assert.throws(() => verifyStackPersistence({ ...input, after: checkpoint(altered, retired) }, inverse));
});

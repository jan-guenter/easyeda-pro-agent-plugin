import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { schematicNewWireOrders } from "../src/schematic-wire-order.ts";

void test("new wire order follows source insertion, junction ownership and label-ended dangling models", () => {
  const branch = "bb".repeat(8), branchAttr = "dd".repeat(8), main = "aa".repeat(8), mainAttr = "cc".repeat(8);
  const rows: NativeSourceObject[] = [
    { id: main, type: "WIRE", body: { zIndex: 10 } }, { id: branch, type: "WIRE", body: { zIndex: 11 } },
    { id: "01".repeat(8), type: "LINE", body: { lineGroup: main, startX: 0, startY: 0, endX: 10, endY: 0 } },
    { id: "02".repeat(8), type: "LINE", body: { lineGroup: main, startX: 10, startY: 0, endX: 20, endY: 0 } },
    { id: "03".repeat(8), type: "LINE", body: { lineGroup: branch, startX: 10, startY: 0, endX: 10, endY: 10 } },
    ...[[mainAttr, main], [branchAttr, branch]].map(([id, parentId]) => ({ id: String(id), type: "ATTR", body: { parentId, key: "Relevance", value: "[]", x: null, y: null, zIndex: 0 } })),
  ];
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "page" }, objects: [] };
  const before: NativeSourceSnapshot = { ...value, sha256: sha256Json(value) };
  const native: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: "unused-by-pure-order-model",
    components: [[0, 0], [20, 0], [10, 10]].map(([x, y], index) => ({ id: `part${index}`, kind: "part", locked: false, body: { zIndex: 1 }, attributes: [],
      pins: [{ id: `pin${index}`, body: { x: Number(x), y: Number(y) }, attributes: [], net: "N", noConnect: null }] })) };
  const created = new Map([[main, mainAttr], [branch, branchAttr]]), records = new Map(rows.map((row) => [row.id, row]));
  assert.deepEqual(schematicNewWireOrders(before, records, native, created).map(({ zIndex, junctions, danglingDots }) => ({ zIndex, junctions, danglingDots })),
    [{ zIndex: 3, junctions: 1, danglingDots: 0 }, { zIndex: 0, junctions: 0, danglingDots: 0 }]);
  native.components.pop();
  records.set("label", { id: "label", type: "ATTR", body: { parentId: "$$root", key: "_NETLABEL_", value: "N", x: 10, y: 10 } });
  assert.equal(schematicNewWireOrders(before, records, native, created)[1]?.zIndex, 2);
  const pin = native.components[0]?.pins[0]; assert.ok(pin); pin.body["x"] = 10.1;
  assert.throws(() => schematicNewWireOrders(before, records, native, created), /near-coincident/u);
});

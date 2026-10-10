import assert from "node:assert/strict";
import { test } from "node:test";
import type { NativeSourceObject } from "../src/document-source.ts";
import { bindSchematicWireLabels } from "../src/schematic-layout-net-label.ts";

void test("wire labels retain IDs and complete display fields while binding exact NET ownership and order", () => {
  const label: NativeSourceObject = { id: "label", type: "ATTR", body: { key: "_NETLABEL_", parentId: "$$root", value: "SUPPLY", x: 10, y: -20,
    zIndex: 100, locked: false, align: "RIGHT_BOTTOM", fontSize: 9, strikeout: null, valueVisible: true } };
  const records = new Map<string, NativeSourceObject>([
    ["label", structuredClone(label)], ["wire", { id: "wire", type: "WIRE", body: { zIndex: 5 } }],
    ["line", { id: "line", type: "LINE", body: { lineGroup: "wire", startX: 0, startY: -20, endX: 20, endY: -20 } }],
  ]);
  const order = { id: "wire", relevanceId: "relevance", lines: 1, junctions: 0, danglingDots: 2, recategorized: true, zIndex: 3 };
  const anchors = [{ id: "label", x: 10, y: -20 }];
  assert.deepEqual(bindSchematicWireLabels(records, anchors, [order]), [{ id: "label", wireId: "wire", net: "SUPPLY", x: 10, y: -20, zIndex: 4 }]);
  assert.deepEqual(records.get("label"), { ...label, body: { ...label.body, key: "NET", parentId: "wire", zIndex: 4 } });
  records.set("label", structuredClone(label));
  records.set("foreign-line", { id: "foreign-line", type: "LINE", body: { lineGroup: "foreign", startX: 10, startY: -30, endX: 10, endY: -10 } });
  assert.throws(() => bindSchematicWireLabels(records, anchors, [order]), /exactly one/u);
  records.delete("foreign-line");
  assert.throws(() => bindSchematicWireLabels(records, anchors, []), /exactly one/u);
  records.set("label", { ...label, body: { ...label.body, x: 100, y: -100 } });
  assert.equal(bindSchematicWireLabels(records, anchors, [order])[0]?.wireId, "wire");
  assert.equal(records.get("label")?.body["x"], 100);
});

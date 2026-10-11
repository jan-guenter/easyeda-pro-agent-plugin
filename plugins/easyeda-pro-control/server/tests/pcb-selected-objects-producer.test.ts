import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildExactReadExpression, validateExactReadPayload } from "../src/exact-readers.ts";
import { PCB_SELECTED_OBJECTS_METHOD, derivePcbSelectedObjects } from "../src/pcb-selected-objects.ts";
import { object, snapshot } from "./pcb-selected-objects-fixture.ts";

type State = Record<string, () => unknown>;
function state(values: Record<string, unknown>): State {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [`getState_${key}`, (): unknown => value]));
}
async function produce(pouredPieceId?: string): Promise<unknown> {
  const attribute = state({ PrimitiveId: "name" }), component = state({ PrimitiveId: "component" }), text = state({ PrimitiveId: "text" });
  const families: Record<string, State[]> = Object.fromEntries(["Component", "Pad", "Via", "Line", "Arc", "String", "Attribute", "Polyline", "Region", "Pour", "Fill", "Dimension", "Image", "Object", "Poured"]
    .map((name) => [name, []]));
  families["Component"] = [component]; families["String"] = [text]; families["Attribute"] = [attribute];
  if (pouredPieceId !== undefined) {
    const polygon = { getSource: (): number[] => [0, 0, 10, 10] };
    families["Pour"] = [state({ PrimitiveId: "pour", PrimitiveType: "Pour", Net: "GND", Layer: 1, ComplexPolygon: polygon,
      PourFillMethod: { mode: "solid" }, PreserveSilos: true, PourName: "Fixture", PourPriority: 1, LineWidth: 5, PrimitiveLock: false })];
    families["Poured"] = [state({ PrimitiveId: "pour", PrimitiveType: "Poured", PourPrimitiveId: "pour",
      PourFills: [{ id: pouredPieceId, path: polygon, lineWidth: 5, fill: true }] })];
  }
  const eda = Object.fromEntries(Object.entries(families).map(([name, objects]) => [`pcb_Primitive${name}`, {
    getAll: (): State[] => objects,
    getAllPrimitiveId: (): unknown[] => objects.map((row) => { const getter = row["getState_PrimitiveId"]; assert.ok(getter); return getter(); }),
    ...(name === "Component" ? { getAllPinsByPrimitiveId: (): never[] => [] } : {}),
  }]));
  const value: unknown = await runInNewContext(`(async()=>(${buildExactReadExpression({ kind: "pcb-inventory" })}))()`, { eda, globalThis });
  return validateExactReadPayload(value, { kind: "pcb-inventory" });
}
void test("real inventory producer and maintained validator admit selected Component plus STRING source DTOs", async () => {
  const inventory = await produce(), source = snapshot([object("COMPONENT", "component", { x: 10, y: 20 }),
    object("STRING", "text", { text: "Retained text", specialColor: null }), object("ATTR", "name", { parentId: "component", key: "Name", value: "Part" })]);
  const result = derivePcbSelectedObjects(source, inventory, ["text", "component"], { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} }, "board");
  assert.deepEqual(result.map((row) => row.primitiveId), ["text", "component"]);
  assert.equal(result[0]?.sourceRecord.body["specialColor"], null);
  assert.deepEqual(result[1]?.sourceAttributes.map((row) => row.id), ["name"]);
});
void test("real producer/validator permit a pour-piece/root ID collision but selected source coordinator refuses it", async () => {
  const inventory = await produce("text"), source = snapshot([object("COMPONENT", "component", { x: 10, y: 20 }),
    object("STRING", "text", { text: "Collision target" }), object("ATTR", "name", { parentId: "component", key: "Name", value: "Part" }),
    object("POUR", "pour", { netName: "GND" })]);
  assert.throws(() => derivePcbSelectedObjects(source, inventory, ["text"], { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} }, "board"));
});

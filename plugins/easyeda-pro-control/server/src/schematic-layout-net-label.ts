import type { NativeSourceObject } from "./document-source.ts";
import type { schematicNewWireOrders } from "./schematic-wire-order.ts";

export interface SchematicWireLabelBinding { readonly id: string; readonly wireId: string; readonly net: string; readonly x: number; readonly y: number; readonly zIndex: number }
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Wire label requires finite coordinates."); }
  return value;
}
/** Native source import creates a free E0 _NETLABEL_ without the interactive
 * A8 placement conversion. Electrical names must instead be ad NET children
 * of exactly one explicitly created wire. Keep the reserved ID and display.
 */
export function bindSchematicWireLabels(records: Map<string, NativeSourceObject>, labels: readonly { id: string; x: number; y: number }[], orders: ReturnType<typeof schematicNewWireOrders>): readonly SchematicWireLabelBinding[] {
  const bindings: SchematicWireLabelBinding[] = [];
  const used = new Set<string>();
  for (const anchor of labels) {
    const { id } = anchor;
    const label = records.get(id);
    if (label?.type !== "ATTR" || label.body["key"] !== "_NETLABEL_" || label.body["parentId"] !== "$$root" || label.body["locked"] !== false || typeof label.body["value"] !== "string") {
      throw new Error("Wire binding requires the exact newly created standalone label.");
    }
    // Electrical attachment uses the creation anchor; display offsets move only text.
    const x = number(anchor.x), y = number(anchor.y);
    const touching = new Set([...records.values()].filter((row) => {
      if (row.type !== "LINE") { return false; }
      const ex = number(row.body["endX"]), ey = number(row.body["endY"]), sx = number(row.body["startX"]), sy = number(row.body["startY"]);
      return (x - sx) * (ey - sy) === (y - sy) * (ex - sx) && x >= Math.min(sx, ex) && x <= Math.max(sx, ex) && y >= Math.min(sy, ey) && y <= Math.max(sy, ey);
    }).map((row) => String(row.body["lineGroup"])));
    const wireId = [...touching][0];
    const order = orders.find((entry) => entry.id === wireId);
    if (touching.size !== 1 || wireId === undefined || order === undefined || used.has(wireId) || records.get(wireId)?.type !== "WIRE" ||
        [...records.values()].some((row) => row.type === "ATTR" && row.body["parentId"] === wireId && ["NET", "Name"].includes(String(row.body["key"])))) {
      throw new Error("A layout label must touch exactly one newly created wire with no other name.");
    }
    used.add(wireId);
    // The r$ importer preserves explicit order; NetPoint categorization places this sole
    // NET immediately after the sole custom Relevance attribute.
    const zIndex = order.zIndex + 1;
    records.set(id, { ...label, body: { ...label.body, key: "NET", parentId: wireId, zIndex } });
    bindings.push({ id, wireId, net: label.body["value"], x, y, zIndex });
  }
  return bindings;
}

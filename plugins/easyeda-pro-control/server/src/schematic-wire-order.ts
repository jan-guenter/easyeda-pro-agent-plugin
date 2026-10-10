import { canonicalJson } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

interface WireOrder { readonly id: string; readonly relevanceId: string; readonly lines: number; readonly junctions: number; readonly danglingDots: number; readonly recategorized: boolean; readonly zIndex: number }
interface Node { readonly x: number; readonly y: number; readonly lines: Map<string, string>; readonly pins: number[]; zeroLine: boolean }
function number(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Wire-order coordinate or parent order is not finite."); } return value; }

/** Pinned SCH3.2.149: source rows create NetGroup entries in their first
 * WIRE/LINE occurrence order; ATTRs are deferred. getModels preserves that
 * insertion order, and the first group owns a shared endpoint. NetPoint
 * indexes endpoints/pins, not labels, with a0.25 drawing-unit square tolerance.
 * Refuse unequal near-points rather than guess the R-tree's first match.
 */
export function schematicNewWireOrders(before: NativeSourceSnapshot, records: ReadonlyMap<string, NativeSourceObject>, native: SchematicNativeSnapshot, created: ReadonlyMap<string, string>): readonly WireOrder[] {
  if (created.size === 0) { return []; }
  if ([...records.values()].some((row) => ["BUS", "BUSENTRY"].includes(row.type))) { throw new Error("New-wire child-order profile does not include buses."); }
  const wires = new Map([...records.values()].filter((row) => row.type === "WIRE").map((row) => [row.id, row]));
  const retained = new Set(before.objects.filter((row) => row.type === "WIRE" && wires.has(row.id)).map((row) => row.id));
  const lines = [...records.values()].filter((row) => row.type === "LINE" && wires.has(String(row.body["lineGroup"])));
  const first = new Map([...wires.keys()].map((id) => [id, id]));
  for (const row of lines) {
    const group = String(row.body["lineGroup"]), prior = first.get(group);
    if (prior !== undefined && row.id.localeCompare(prior) < 0) { first.set(group, row.id); }
  }
  const nodes = new Map<string, Node>();
  const point = (xInput: unknown, yInput: unknown): Node => {
    const x = number(xInput), y = number(yInput);
    const key = canonicalJson([x, y]);
    const found = nodes.get(key); if (found !== undefined) { return found; }
    if (nodes.size >= 8192 || [...nodes.values()].some((node) => Math.abs(node.x - x) <= 0.25 && Math.abs(node.y - y) <= 0.25)) { throw new Error("Wire-order graph exceeds its bound or has ambiguous near-coincident endpoints."); }
    const node: Node = { x, y, lines: new Map(), pins: [], zeroLine: false }; nodes.set(key, node); return node;
  };
  for (const row of lines) {
    const start = point(row.body["startX"], row.body["startY"]);
    const end = point(row.body["endX"], row.body["endY"]);
    start.lines.set(row.id, String(row.body["lineGroup"])); end.lines.set(row.id, String(row.body["lineGroup"]));
    if (start === end) { start.zeroLine = true; }
  }
  for (const component of native.components) {
    for (const pin of component.pins) { point(pin.body["x"], pin.body["y"]).pins.push(number(component.body["zIndex"])); }
  }
  const counts = new Map([...created.keys()].map((id) => [id, { junctions: 0, danglingDots: 0, recategorized: false }]));
  const visit = (node: Node): void => {
    const groups = [...new Set(node.lines.values())];
    if (groups.length === 0) { return; }
    const old = groups.filter((id) => retained.has(id));
    if (old.length > 1 && groups.some((id) => created.has(id))) { throw new Error("Wire-order shared endpoint has ambiguous retained-group insertion order."); }
    groups.sort((a, b) => String(first.get(a)).localeCompare(String(first.get(b))));
    const owner = old[0] ?? groups[0];
    const count = owner === undefined ? undefined : counts.get(owner);
    if (count === undefined || owner === undefined) { return; }
    const pinCount = node.pins.length, wireCount = node.lines.size;
    if (wireCount + pinCount === 1) { count.danglingDots += 1; count.recategorized = true; }
    const junction = (pinCount >= 3 && wireCount > 0) || (pinCount === 2 && wireCount > 0 && !node.zeroLine) || (pinCount === 1 && wireCount >= 2) || (pinCount === 0 && wireCount >= 3);
    if (junction) {
      count.junctions += 1;
      // Global order compares root component versus root wire order first.
      // On equality the pin's longer child path wins, so only strict > places
      // This junction directly under the group and requests categorization.
      const rootOrder = number(wires.get(owner)?.body["zIndex"]);
      if (node.pins.every((order) => rootOrder > order)) { count.recategorized = true; }
    }
  };
  for (const node of nodes.values()) { visit(node); }
  return [...created].map(([id, relevanceId]) => {
    const attr = records.get(relevanceId), count = counts.get(id);
    if (count === undefined || attr?.type !== "ATTR" || attr.body["parentId"] !== id || attr.body["key"] !== "Relevance" || attr.body["value"] !== "[]" || attr.body["x"] !== null || attr.body["y"] !== null) { throw new Error("Wire-order proof lost its exact new hidden Relevance attribute."); }
    const lineCount = lines.filter((row) => row.body["lineGroup"] === id).length;
    return { id, relevanceId, lines: lineCount, junctions: count.junctions, danglingDots: count.danglingDots,
      recategorized: count.recategorized, zIndex: count.recategorized ? lineCount + count.junctions + count.danglingDots : 0 };
  });
}

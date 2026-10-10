import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import type { SchematicNetFlagCloneDescriptor } from "./schematic-layout-netflag.ts";
import { schematicNewWireOrders } from "./schematic-wire-order.ts";

type Point = readonly [number, number];
type Segment = readonly [number, number, number, number];
const identifier = z.string().regex(/^[a-f0-9]{16}$/u);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const orderSchema = z.number().int().nonnegative();
export const schematicWireGroupRepairDescriptorSchema = z.object({
  profile: z.literal("easyeda-pro-control.schematic-wire-group-repair.v1"),
  operationSha256: hash, createdIdsSha256: hash, legacySourceSha256: hash, correctedSourceSha256: hash,
  merges: z.array(z.object({ flagId: identifier, mainWireId: identifier, dropWireId: identifier, lineId: identifier, relevanceId: identifier }).strict()).min(1).max(128),
  wireOrders: z.array(z.object({ id: identifier, before: orderSchema, after: orderSchema }).strict()).max(256),
}).strict();
export type SchematicWireGroupRepairDescriptor = z.infer<typeof schematicWireGroupRepairDescriptorSchema>;
interface Step { readonly id: string; readonly action: string }
interface Operation { readonly operations: readonly Step[] }
function number(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Wire-group proof needs exact finite coordinates."); } return value; }
const point = (body: Readonly<Record<string, unknown>>): Point => [number(body["x"]), number(body["y"])];
const equal = (a: Point, b: Point): boolean => a[0] === b[0] && a[1] === b[1];
const ends = (s: Segment): readonly Point[] => [[s[0], s[1]], [s[2], s[3]]];
const line = (row: NativeSourceObject): Segment => [number(row.body["startX"]), number(row.body["startY"]), number(row.body["endX"]), number(row.body["endY"])];
function lines(source: NativeSourceSnapshot): readonly NativeSourceObject[] {
  const wires = new Set(source.objects.filter((r) => r.type === "WIRE").map((r) => r.id));
  const result = source.objects.filter((r) => r.type === "LINE" && wires.has(String(r.body["lineGroup"])));
  if (result.length > 4096) { throw new Error("Net-flag attachment graph exceeds the reviewed segment bound."); }
  return result;
}
function groupsAt(rows: readonly NativeSourceObject[], p: Point): Set<string> {
  return new Set(rows.filter((r) => ends(line(r)).some((e) => equal(e, p))).map((r) => String(r.body["lineGroup"])));
}
function reaches(start: Point, anchors: readonly Point[], segments: readonly Segment[]): boolean {
  const pending: Point[] = [start], visited = new Set<string>();
  while (pending.length > 0) {
    const p = pending.pop(); if (p === undefined) { break; }
    const key = canonicalJson(p);
    if (!visited.has(key)) {
      visited.add(key);
      if (anchors.some((a) => equal(a, p))) { return true; }
      for (const s of segments) { if (ends(s).some((e) => equal(e, p))) { pending.push(...ends(s)); } }
    }
  }
  return false;
}
/** Native vJe uses only the first endpoint-indexed NetGroup for a pin. Importing two
 * touching WIRE records does not perform interactive wire polymerization.
 * Therefore a clone and an existing same-net pin must share ONE group, not
 * merely a geometric path through several source WIRE identities.
 */
export function verifySchematicFlagWireGroups(source: NativeSourceSnapshot, native: SchematicNativeSnapshot, flags: readonly SchematicNetFlagCloneDescriptor[]): void {
  if (flags.length === 0) { return; }
  const created = new Set(flags.map((f) => f.component.id)), rows = lines(source);
  for (const flag of flags) {
    const pin = flag.component.pins[0]; if (pin === undefined) { throw new Error("Net-flag attachment has no exact electrical pin."); }
    const origin = point(pin.body);
    const groups = groupsAt(rows, origin);
    const group = [...groups][0];
    if (groups.size !== 1 || group === undefined) { throw new Error("New net-flag pin is not physically wired to one unambiguous native WIRE group."); }
    const anchors = native.components.filter((m) => m.kind === "part" && !created.has(m.id)).flatMap((m) => m.pins)
      .filter((p) => p.net === flag.net && p.noConnect?.value !== "yes")
      .map((p) => point(p.body)).filter((p) => { const attached = groupsAt(rows, p); return attached.size === 1 && attached.has(group); });
    const segments = rows.filter((r) => r.body["lineGroup"] === group).map((row) => line(row));
    if (!reaches(origin, anchors, segments)) { throw new Error("New net-flag is not physically wired to an existing same-net pin within ONE native WIRE group."); }
  }
}
function snapshot(before: NativeSourceSnapshot, records: ReadonlyMap<string, NativeSourceObject>): NativeSourceSnapshot {
  const value = { schema: before.schema, document: before.document, objects: [...records.values()].toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
/** Deterministic retained-journal correction only. Caller supplies the original
 * internally simulated source, never arbitrary correction IDs or geometry.
 * Every merge is derived from a consecutive new island-WIRE/drop-WIRE/flag
 * sequence and its immutable allocation map. No identities are allocated.
 */
export function deriveSchematicWireGroupRepair(operation: Operation, before: NativeSourceSnapshot, legacy: NativeSourceSnapshot,
  native: SchematicNativeSnapshot, createdIds: Readonly<Record<string, string>>, flags: readonly SchematicNetFlagCloneDescriptor[]): {
    source: NativeSourceSnapshot; descriptor: SchematicWireGroupRepairDescriptor;
  } {
  const records = new Map(legacy.objects.map((r) => [r.id, structuredClone(r)]));
  const oldIds = new Set(before.objects.map((r) => r.id));
  const merges: SchematicWireGroupRepairDescriptor["merges"] = [];
  const consumed = new Set<string>();
  for (const flag of flags) {
    const index = operation.operations.findIndex((s) => s.action === "sch.net-flag.clone" && createdIds[s.id] === flag.component.id);
    const drop = operation.operations[index - 1], main = operation.operations[index - 2], pin = flag.component.pins[0];
    if (main?.action !== "sch.wire.create" || drop?.action !== "sch.wire.create" || pin === undefined) { throw new Error("Retained ground repair has no exact new island/drop/flag sequence."); }
    const dropId = createdIds[drop.id], lineId = createdIds[`${drop.id}:segment:0`], mainId = createdIds[main.id], relevanceId = createdIds[`${drop.id}:relevance`];
    if ([mainId, dropId, lineId, relevanceId].some((id) => id === undefined || oldIds.has(id) || consumed.has(id))) { throw new Error("Retained ground repair identity is absent, reused or pre-existing."); }
    if (mainId === undefined || dropId === undefined || lineId === undefined || relevanceId === undefined) { throw new Error("Retained ground repair identities are missing."); }
    const dropLine = records.get(lineId), dropRow = records.get(dropId), mainRow = records.get(mainId), relevance = records.get(relevanceId);
    const owned = [...records.values()].filter((r) => r.id === dropId || r.body["parentId"] === dropId || r.body["lineGroup"] === dropId);
    if (mainRow?.type !== "WIRE" || dropRow?.type !== "WIRE" || dropLine?.type !== "LINE" || relevance?.type !== "ATTR" ||
        owned.length !== 3 || !owned.every((r) => [dropId, lineId, relevanceId].includes(r.id)) ||
        dropLine.body["lineGroup"] !== dropId || relevance.body["parentId"] !== dropId || relevance.body["key"] !== "Relevance" || relevance.body["value"] !== "[]" ||
        [mainRow, ...owned].some((r) => r.body["locked"] === true)) { throw new Error("Retained ground repair drop group has unknown, named or locked content."); }
    const endpoints = ends(line(dropLine));
    const a = endpoints[0], b = endpoints[1];
    if (a === undefined || b === undefined || a[0] !== b[0] || a[1] === b[1] || !equal(b, point(pin.body))) { throw new Error("Retained ground repair drop geometry is not the exact vertical flag lead."); }
    const mainLines = [...records.values()].filter((r) => r.type === "LINE" && r.body["lineGroup"] === mainId);
    if (!mainLines.some((r) => ends(line(r)).some((p) => equal(p, a))) ||
        [...records.values()].some((r) => r.type === "ATTR" && r.body["parentId"] === mainId && ["NET", "Name"].includes(String(r.body["key"])))) {
      throw new Error("Retained ground repair main group is not the exact unnamed incident island.");
    }
    const attached = groupsAt(lines(legacy), a); attached.delete(dropId);
    if (attached.size !== 1 || !attached.has(mainId)) { throw new Error("Retained ground repair has an ambiguous incident main group."); }
    records.set(lineId, { ...dropLine, body: { ...dropLine.body, lineGroup: mainId } });
    records.delete(dropId); records.delete(relevanceId);
    merges.push({ flagId: flag.component.id, mainWireId: mainId, dropWireId: dropId, lineId, relevanceId });
    for (const id of [mainId, dropId, lineId, relevanceId]) { consumed.add(id); }
  }
  if (merges.length === 0 || merges.length !== flags.length) { throw new Error("Retained ground repair did not account for every original cloned flag."); }
  const groups = new Map<string, string>();
  for (const step of operation.operations.filter((s) => s.action === "sch.wire.create")) {
    const attr = createdIds[`${step.id}:relevance`], id = createdIds[step.id];
    if (id !== undefined && attr !== undefined && records.has(id)) { groups.set(id, attr); }
  }
  const wireOrders: SchematicWireGroupRepairDescriptor["wireOrders"] = [];
  for (const order of schematicNewWireOrders(before, records, native, groups)) {
    const row = records.get(order.relevanceId); if (row === undefined) { throw new Error("Retained ground repair lost a wire-order attribute."); }
    const previous = number(row.body["zIndex"]);
    if (previous !== order.zIndex) { wireOrders.push({ id: row.id, before: previous, after: order.zIndex }); records.set(row.id, { ...row, body: { ...row.body, zIndex: order.zIndex } }); }
  }
  const source = snapshot(legacy, records);
  verifySchematicFlagWireGroups(source, native, flags);
  const descriptor = schematicWireGroupRepairDescriptorSchema.parse({ profile: "easyeda-pro-control.schematic-wire-group-repair.v1",
    operationSha256: sha256Json(operation), createdIdsSha256: sha256Json(createdIds), legacySourceSha256: legacy.sha256,
    correctedSourceSha256: source.sha256, merges, wireOrders });
  return { source, descriptor };
}

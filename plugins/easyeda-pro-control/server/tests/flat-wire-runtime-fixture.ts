import assert from "node:assert/strict";
import { parseDocumentSource } from "../src/document-source.ts";
import { nativeExportSource } from "./flat-display-native-fixture.ts";
import { runtimeFixture } from "./flat-display-runtime-fixture.ts";
import { flatWireFixture } from "./flat-wire-fixture.ts";

class Point {
  public x: number;
  public y: number;
  public constructor(x: number, y: number) { this.x = x; this.y = y; }
  public scale(value: number): Point { return new Point(this.x * value, this.y * value); }
}
interface Change { id: string; points: Point[]; strokeColor: string | null; strokeWidth: number | null; strokeStyle: number | null }

// oxlint-disable-next-line typescript/explicit-module-boundary-types, typescript/explicit-function-return-type -- Infer the synthetic model's mutable receiver surface for adversarial runtime tests.
export function wireRuntimeFixture(value = flatWireFixture()) {
  const scene = runtimeFixture(value), source = parseDocumentSource(value.native.source);
  Object.assign(scene.runtime, { Object });
  const { shapes } = scene, ids = shapes.idManager.idMap;
  const group = source.objects.find((row) => row.id === "wire"); assert.ok(group);
  const attrs: object[] = [], children: object[] = [], lines: (Change & { getConsistencyData: () => object })[] = [], names: object[] = [];
  const wire = { id: "wire", modelType: "NetGroup", tagName: "NetGroup", type: "wire", combination: null,
    locked: group.body["locked"], isConnected: true, parent: shapes.root, shapeManager: shapes, lines, children, netNames: names,
    getAttr: (): object[] => attrs, getConsistencyData(): object { return { ...group.body, locked: this.locked }; },
    setLines: (changes: Change[]): void => {
      scene.calls.push("setLines");
      assert.equal(changes.length, lines.length);
      for (const change of changes) { const line = lines.find((item) => item.id === change.id); assert.ok(line); Object.assign(line, change); }
    } };
  for (const row of source.objects.filter((entry) => entry.type === "LINE" && entry.body["lineGroup"] === "wire")) {
    const line = { id: row.id, modelType: "Wire", isConnected: true, parent: wire, shapeManager: shapes,
      points: [new Point(Number(row.body["startX"]), Number(row.body["startY"])), new Point(Number(row.body["endX"]), Number(row.body["endY"]))],
      strokeColor: null as string | null, strokeWidth: 1 as number | null, strokeStyle: 0 as number | null,
      getConsistencyData(): object {
        const [a, b] = this.points; assert.ok(a && b);
        return { ...row.body, startX: a.x, startY: a.y, endX: b.x, endY: b.y, strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle === null ? null : ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"][this.strokeStyle] };
      } };
    lines.push(line); children.push(line); ids.set(line.id, line);
  }
  for (const row of source.objects.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === "wire")) {
    const net = row.body["key"] === "NET";
    const attr = { id: row.id, modelType: net ? "NetLabel" : "Attr", tagName: net ? "NetName" : "Attr", cmdKey: net ? "netlabel" : "attr",
      keyInSourceCode: row.body["key"], key: net ? "Name" : "Relevance", value: row.body["value"], zIndex: row.body["zIndex"],
      parent: wire, shapeManager: shapes, isConnected: true, getConsistencyData(): object { return { ...row.body, zIndex: this.zIndex }; } };
    attrs.push(attr); children.push(attr); ids.set(attr.id, attr); if (net) { names.push(attr); }
  }
  ids.set(wire.id, wire); shapes.root.children.splice(0, shapes.root.children.length, scene.part, wire);
  shapes.getModels = (kind): object[] => { if (kind === "Symbol") { return [scene.part]; } return kind === "NetGroup" ? [wire] : []; };
  const contacts = new Map<string, { x: number; y: number; wireNetGroup: typeof wire; Wire: Set<object>; Pin: Set<object>; Bus: Set<object>; BusEntry: Set<object> }>();
  const junctionModels = new Set<object>(), unConnectDotModels = new Set<object>();
  const groupDots = new Set<object>(), groupJunctions = new Set<object>();
  const netGroupLineJunctionIdMap: Record<string, Set<string>> = {}, netGroupLineUnConnectDotIdMap: Record<string, Set<string>> = {};
  Object.assign(wire, { _junctionModels: groupJunctions, _unConnectDotModels: groupDots });
  Object.assign(shapes.netPointManager, { junctionModels, unConnectDotModels, netGroupLineJunctionIdMap, netGroupLineUnConnectDotIdMap });
  function update(): void {
    contacts.clear();
    for (const marker of [...unConnectDotModels, ...junctionModels]) { const id: unknown = Reflect.get(marker, "id"); assert.equal(typeof id, "string"); ids.delete(String(id)); }
    unConnectDotModels.clear(); junctionModels.clear(); groupJunctions.clear(); groupDots.clear();
    for (const index of [netGroupLineJunctionIdMap, netGroupLineUnConnectDotIdMap]) {
      for (const key of Object.keys(index)) { Reflect.deleteProperty(index, key); }
    }
    const point = (x: number, y: number): NonNullable<ReturnType<typeof contacts.get>> => {
      const key = JSON.stringify([x, y]), previous = contacts.get(key);
      if (previous !== undefined) { return previous; }
      const entry = { x, y, wireNetGroup: wire, Wire: new Set<object>(), Pin: new Set<object>(), Bus: new Set<object>(), BusEntry: new Set<object>() };
      contacts.set(key, entry); return entry;
    };
    for (const line of lines) { for (const end of line.points) { point(end.x, end.y).Wire.add(line); } }
    point(scene.pin.origin.x, scene.pin.origin.y).Pin.add(scene.pin);
    children.splice(0, children.length, ...lines, ...attrs);
    for (const [key, node] of [...contacts].filter(([, entry]) => entry.Pin.size === 0 && (entry.Wire.size === 1 || entry.Wire.size >= 3))) {
      const junction = node.Wire.size >= 3, kind = junction ? "Junction" : "UnConnectDot";
      const dot = { id: `marker-${key}`, modelType: kind, tagName: kind, cmdKey: junction ? "junction" : "unConnectDot", parent: wire,
        isConnected: true, notAddHistory: true, shapeManager: shapes, cx: node.x, cy: node.y, r: junction ? 2.5 : 1,
        connectionPointNode: node, getConsistencyData: (): undefined => undefined };
      children.push(dot); ids.set(dot.id, dot); (junction ? junctionModels : unConnectDotModels).add(dot); (junction ? groupJunctions : groupDots).add(dot);
      for (const line of node.Wire) { const id: unknown = Reflect.get(line, "id"); assert.equal(typeof id, "string");
        ((junction ? netGroupLineJunctionIdMap : netGroupLineUnConnectDotIdMap)[String(id)] ??= new Set()).add(dot.id); }
    }
    const rows = source.objects.map((row) => {
      if (row.type !== "LINE" || row.body["lineGroup"] !== "wire") { return row; }
      const line = lines.find((item) => item.id === row.id); assert.ok(line);
      return { ...row, body: { ...row.body, ...line.getConsistencyData() } };
    });
    scene.source.raw = nativeExportSource({ ...source, objects: rows }).replace('"uuid":"page"', '"uuid":"page","client":"0123456789abcdef","updateTime":100,"version":"100"');
  }
  shapes.netPointManager.getNetPoint = (point): object | undefined => contacts.get(JSON.stringify([point.x, point.y]));
  Object.assign(shapes, { bboxMonitor: { update } }); update();
  return { ...scene, wire, update, contacts };
}

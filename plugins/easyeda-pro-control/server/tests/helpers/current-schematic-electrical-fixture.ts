import assert from "node:assert/strict";
import { isRecord } from "../../src/core.ts";
import { currentSchematicPageReadFixture } from "./current-schematic-page-read-fixture.ts";

const forbidden = (): never => { throw new Error("Forbidden compiler, effective attribute, serializer or cache rebuild"); };

/** Original model maps only; every compiler/exporter/effective getter throws. */
export function currentSchematicElectricalFixture(): ReturnType<typeof currentSchematicPageReadFixture> & {
  component: Record<string, unknown>; pins: Record<string, unknown>[]; attribute: Record<string, unknown>;
  contactNodes: Record<string, unknown>[]; contactCache: { points: Set<Record<string, unknown>> }; netManager: Record<string, unknown>;
} {
  const value = currentSchematicPageReadFixture();
  const component = value.index.get("component"); assert.ok(component);

  const attributes = new Map(), shapeMap = new Map([["Text", new Set(component.children)]]);
  Object.assign(component, { _origin: { x: 10, y: -20 }, _rotation: 0, _isMirror: false, _symbolUuid: "source-symbol", _deviceUuid: "source-device",
    _partTitle: "A", partId: "1", _attrMap: attributes, shapes: shapeMap, locked: false });
  value.modelMap.set("Symbol", new Set([component]));
  Reflect.set(value.handler, "sourceCodeIdMap", value.sources);
  for (const group of [value.wire, value.bus]) {
    const lines = group["lines"], names = group["netNames"]; assert.ok(Array.isArray(lines) && Array.isArray(names));
    const lineSet = new Set(lines), nameSet = new Set(names);
    const children = group.children; assert.ok(children);
    const custom = new Map(children.filter(item => item.modelType === "Attr").map(item => [item.id, item]));
    Object.assign(group, { _lines: lineSet, _netNames: nameSet, _customAttrMap: custom });
    delete group["lines"]; delete group["netNames"];
    Object.defineProperty(group, "lines", { get: (): unknown[] => [...lineSet] }); Object.defineProperty(group, "netNames", { get: (): unknown[] => [...nameSet] });
    for (const item of lines) { const line: unknown = item; assert.ok(isRecord(line)); Object.assign(line, { _points: line["points"], _strokeColor: line["strokeColor"], _strokeWidth: line["strokeWidth"], _strokeStyle: line["strokeStyle"] }); }
    for (const item of names) { const name: unknown = item; assert.ok(isRecord(name)); Reflect.set(name, "_value", name["value"]); delete name["value"]; Object.defineProperty(name, "value", { get: (): unknown => name["_value"] }); }
  }
  const attribute = { id: "component-designator", modelType: "Attr", tagName: "Attr", cmdKey: "text", key: "Designator", shapeManager: value.shapes,
    isConnected: true, _symbolValue: "U?", _blockValue: "U1", _variantValue: null, _x: 20, _y: -20, _rotation: 0 };
  value.addChild(component, attribute); attributes.set("Designator", attribute);
  for (const key of ["getValue", "getInstanceValue", "getAttr", "getShapes", "traversePins", "getApiShapeData", "getConsistencyData"]) { component[key] = forbidden; Reflect.set(attribute, key, forbidden); }
  for (const key of ["value", "symbolValue", "blockValue", "variantValue", "instanceValue"]) { Object.defineProperty(attribute, key, { get: forbidden }); }
  const pins = [{ x: 0, y: -10 }, { x: 40, y: -10 }].map((origin, index) => {
    const attrIdMap = new Map(), attrMap = new Map();
    const pin = { id: `pin-${String(index + 1)}`, modelType: "Pin", tagName: "Pin", cmdKey: "pin", shapeManager: value.shapes, isConnected: true,
      _origin: origin, _rotation: 0, _length: 20, _color: null, _pinShape: "None", _noConnect: null, _attrMap: attrMap, _attrIdMap: attrIdMap, children: [] };
    value.addChild(component, pin, false);
    const pinName = { id: `${pin.id}-number`, modelType: "Attr", tagName: "Attr", cmdKey: "text", key: "Pin Number", shapeManager: value.shapes,
      isConnected: true, _symbolValue: String(index + 1), _blockValue: null, _variantValue: null, _x: null, _y: null };
    value.addChild(pin, pinName, false); attrMap.set("Pin Number", pinName); attrIdMap.set(pinName.id, pinName);
    for (const key of ["getValue", "getAttr", "getShapes", "traversePins", "getApiShapeData", "getConsistencyData"]) { Reflect.set(pin, key, forbidden); Reflect.set(pinName, key, forbidden); }
    for (const key of ["value", "symbolValue", "blockValue", "variantValue", "instanceValue"]) { Object.defineProperty(pinName, key, { get: forbidden }); }
    return pin;
  });
  shapeMap.set("Pin", new Set(pins));
  const busLines = value.bus["lines"], wireLines = value.wire["lines"]; assert.ok(Array.isArray(wireLines) && Array.isArray(busLines));
  const contactNodes: Record<string, unknown>[] = [{ x: 0, y: -10, Wire: new Set(wireLines), Bus: new Set(busLines), Pin: new Set([pins[0]]), BusEntry: new Set() },
    { x: 20, y: -30, Wire: new Set(wireLines), Bus: new Set(busLines), Pin: new Set(), BusEntry: new Set() },
    { x: 40, y: -10, Wire: new Set(), Bus: new Set(), Pin: new Set([pins[1]]), BusEntry: new Set() }];
  const contactCache = { points: new Set(contactNodes) }, netManager: Record<string, unknown> = { shapeManager: value.shapes, _netPointData: contactCache };
  for (const key of ["getNetPoint", "analyzeNetPointData", "refreshNetPoint", "buildNetPointsIndexes"]) { netManager[key] = forbidden; }
  Object.defineProperty(netManager, "netPointData", { get: forbidden });
  const project = value.page["projectMgr"]; assert.ok(project !== null && typeof project === "object");
  Object.defineProperty(project, "astProject", { get: forbidden }); Object.defineProperty(value.page, "astPureSheet", { get: forbidden });
  value.shapes["netPointManager"] = netManager; value.shapes["modelHelpers"] = { pin: { getSchPinNet: forbidden } };
  return { ...value, component, pins, attribute, contactNodes, contactCache, netManager };
}

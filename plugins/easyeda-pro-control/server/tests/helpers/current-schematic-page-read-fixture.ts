import assert from "node:assert/strict";

interface Model extends Record<string, unknown> {
  id: string; modelType: string; tagName: string; cmdKey: string; shapeManager: unknown; parent?: Model; children?: Model[]; isConnected: boolean;
}
const forbidden = (): never => { throw new Error("Forbidden public/compiler/serializer/RPC/display path."); };
function legacyFixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>; root: Model;
  index: Map<string, Model>; sources: Map<string, number>; family: Set<Model>; modelMap: Map<string, Set<Model>>;
  text: Model; textFamily: Set<Model>; addText: (id: string) => Model;
  handler: { getSourceCodeIdMap: () => Map<string, number> }; wire: Model; bus: Model; line: Model; name: Model;
  addGroup: (id: string, kind: "wire" | "bus") => Model; addLine: (group: Model, id: string) => Model;
  addName: (group: Model, id: string, value: string) => Model; addChild: (group: Model, child: Model, stored?: boolean) => void;
} {
  const family = new Set<Model>(), index = new Map<string, Model>(), modelMap = new Map([["NetGroup", family]]), sources = new Map<string, number>();
  const textFamily = new Set<Model>(); modelMap.set("Text", textFamily);
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) }, ids = { idMap: index };
  const shapes: Record<string, unknown> = { idManager: ids, modelMap, getModels: (type: string): Model[] => [...(modelMap.get(type) ?? [])], actionRunner: { running: false } };
  const root: Model = { id: "root", modelType: "Root", tagName: "Root", cmdKey: "root", shapeManager: shapes, children: [], isConnected: true };
  shapes["root"] = root;
  const page: Record<string, unknown> = { uuid: "page", project_uuid: "project", tabId: "page@project", projectMgr: { uuid: "project" },
    shapeManager: shapes, idManager: ids, isSchSheetDoc: (): boolean => true, isBlockSymbolInstancePage: false,
    consistencyImpl: { state: "initialized", decodeAndRealTimeSyncHandler: handler }, getSourceCode: forbidden };
  shapes["docManager"] = page; Reflect.set(ids, "docManager", page);
  const consistency = page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object");
  Reflect.set(consistency, "docManager", page); Reflect.set(consistency, "handler", handler);
  Reflect.set(handler, "docManager", page); Reflect.set(handler, "consistencyImpl", consistency);
  const scope: Record<string, unknown> = { Map, Set, SCH: { docMemoryManager: { getActiveDoc: (): unknown => page } },
    UI: { tabBar: { getActiveTab: (): string => "page@project" } }, EXPECTED_DOCUMENT_TYPE: 1, EXPECTED_DOCUMENT_UUID: "page", EXPECTED_PROJECT_UUID: "project", EXPECTED_TAB_ID: "page@project",
    eda: { sch_PrimitiveWire: { get: forbidden, getAll: forbidden }, sch_PrimitiveBus: { get: forbidden, getAll: forbidden }, sch_Netlist: { getNetlist: forbidden } } };
  const addChild = (group: Model, child: Model, stored = true): void => {
    child.parent = group; group.children ??= []; group.children.push(child); index.set(child.id, child); if (stored) { sources.set(child.id, 1); }
    for (const method of ["getApiShapeData", "getConsistencyData", "uploadTo"]) { child[method] = forbidden; }
    Object.defineProperty(child, "attributes", { get: forbidden });
  };
  const addGroup = (id: string, kind: "wire" | "bus"): Model => {
    const group: Model = { id, modelType: "NetGroup", tagName: "NetGroup", cmdKey: "netGroup", type: kind, shapeManager: shapes, isConnected: true,
      lines: [], netNames: [], children: [] };
    family.add(group); addChild(root, group);
    const custom: Model = { id: `${id}-relevance`, modelType: "Attr", tagName: "Attr", cmdKey: "attr", shapeManager: shapes, isConnected: true };
    Object.defineProperty(custom, "value", { get: forbidden }); addChild(group, custom);
    return group;
  };
  const addLine = (group: Model, id: string): Model => {
    const kind = group["type"]; assert.ok(kind === "wire" || kind === "bus");
    const line: Model = { id, modelType: kind === "wire" ? "Wire" : "Bus", tagName: "NetGroupLine", cmdKey: kind, type: kind, shapeManager: shapes, isConnected: true,
      points: [{ x: 0, y: -10 }, { x: 20, y: -30 }], strokeColor: null, strokeWidth: null, strokeStyle: null };
    for (const field of ["displayStrokeColor", "displayStrokeWidth", "displayStrokeStyle"]) { Object.defineProperty(line, field, { get: forbidden }); }
    const lines = group["lines"]; assert.ok(Array.isArray(lines)); lines.push(line); addChild(group, line); return line;
  };
  const addName = (group: Model, id: string, value: string): Model => {
    // Native ad extends xb: the modelType is NetLabel, not NetName. Its tag
    // Distinguishes the stored group-name child from a standalone label.
    const name: Model = { id, modelType: "NetLabel", tagName: "NetName", cmdKey: "netlabel", key: "Name", keyInSourceCode: "NET", value, shapeManager: shapes, isConnected: true };
    const names = group["netNames"]; assert.ok(Array.isArray(names)); names.push(name); addChild(group, name); return name;
  };
  const bus = addGroup("a-bus", "bus"), wire = addGroup("z-wire", "wire");
  const line = addLine(wire, "z-line"), name = addName(wire, "z-name", "NET_A");
  const other = addLine(wire, "a-line"); other["strokeColor"] = "#112233"; other["strokeWidth"] = 2; other["strokeStyle"] = 3;
  addName(wire, "a-name", "NET_B"); addLine(bus, "bus-line"); addName(bus, "bus-name", "DATA[0:7]");
  for (const type of ["Junction", "UnConnectDot"]) {
    addChild(wire, { id: type, modelType: type, tagName: type, cmdKey: type.toLowerCase(), notAddHistory: true, shapeManager: shapes, isConnected: true }, false);
  }
  const addText = (id: string): Model => {
    const model: Model = { id, modelType: "Text", tagName: "Text", cmdKey: "text", shapeManager: shapes, isConnected: true,
      x: 10, y: -20, value: id, rotation: null, color: null, fontFamily: null, fontSize: null,
      fontWeight: null, italic: null, underline: null, hAlign: null, vAlign: null };
    textFamily.add(model); addChild(root, model); return model;
  };
  const text = addText("m-text");
  const component: Model = { id: "component", modelType: "Symbol", tagName: "Symbol", cmdKey: "part", shapeManager: shapes, children: [], isConnected: true };
  addChild(root, component);
  addChild(component, { id: "inherited-text", modelType: "Text", tagName: "Text", cmdKey: "text", shapeManager: shapes, isConnected: true }, false);
  return { text, textFamily, addText, scope, page, shapes, root, index, sources, family, modelMap, handler, wire, bus, line, name, addGroup, addLine, addName, addChild };
}

export function currentSchematicPageReadFixture(): ReturnType<typeof legacyFixture> & {
  target: { projectUuid: string; branchUuid: string; documentUuid: string; schematicUuid: string; tabId: string };
  selected: string[]; metadata: Record<string, unknown>; data: Record<string, unknown>;
} {
  const documentUuid = "b".repeat(16), projectUuid = "a".repeat(64), value = legacyFixture();
  const target = { projectUuid, documentUuid, branchUuid: "c".repeat(32), schematicUuid: "d".repeat(16), tabId: `${documentUuid}@${projectUuid}` };
  Object.assign(value.page, { uuid: documentUuid, project_uuid: projectUuid, tabId: target.tabId, schematicUuid: target.schematicUuid,
    docType: 1, source: "" });
  const project = value.page["projectMgr"]; assert.ok(project !== null && typeof project === "object");
  const selected = [value.line.id, value.text.id, value.bus.id];
  Object.assign(project, { uuid: projectUuid, selectMgr: { getTarget: (): string[] => [...selected] } });
  const data = { doctype: 1, pid: projectUuid }, tab = { tabId: target.tabId, data };
  const metadata = { projectId: projectUuid, branchUuid: target.branchUuid, isV2Format: false };
  const host = { currentProject: metadata, isHistoryMode: false };
  value.scope["gVars"] = host;
  value.scope["UI"] = { gVars: host, tabBar: { getActiveTab: (): string => target.tabId,
    getTabById: (id: string): unknown => id === target.tabId ? tab : undefined } };
  const href = `https://client/editor?cll=info#id=${projectUuid},tab=*${target.tabId}`;
  value.scope["location"] = { href, origin: "https://client" };
  value.scope["document"] = { URL: href, nodeType: 9 };
  return { ...value, target, selected, metadata, data };
}

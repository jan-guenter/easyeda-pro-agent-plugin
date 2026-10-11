import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SCHEMATIC_PRIMITIVE_GUARD_CODES, SCHEMATIC_PRIMITIVE_READ_METHODS, buildSchematicPrimitiveReadExpression, isSchematicPrimitiveReadMethod, schematicPrimitiveReadRequestSchema, schematicPrimitiveStatesSchema, validateSchematicPrimitiveStates } from "../src/schematic-primitive-read.ts";
import { buildSchematicTextReadExpression } from "../src/schematic-text-read.ts";
import { buildSchematicNetGroupReadExpression } from "../src/schematic-netgroup-read.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise actual registry, native builders, coordinator and failure classifier rather than duplicate their contracts.
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

const request = (ids: string | string[] = ["z-wire", "m-text", "a-bus"]): { method: string; arguments: { id: string } | { ids: string[] } } =>
  typeof ids === "string" ? { method: SCHEMATIC_PRIMITIVE_READ_METHODS[0], arguments: { id: ids } } : { method: SCHEMATIC_PRIMITIVE_READ_METHODS[1], arguments: { ids } };
const context: ExpectedContext = { project: { uuid: "project", path: "/tmp/mixed-schematic.eprj2" },
  document: { uuid: "page", documentType: 1, tabId: "page@project" } };
interface Model extends Record<string, unknown> {
  id: string; modelType: string; tagName: string; cmdKey: string; shapeManager: unknown; parent?: Model; children?: Model[]; isConnected: boolean;
}
const forbidden = (): never => { throw new Error("Forbidden public/compiler/serializer/RPC/display path."); };
function setObject(value: unknown, key: string, replacement: unknown): void {
  assert.ok(value !== null && typeof value === "object"); Reflect.set(value, key, replacement);
}
function fixture(): {
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
type Fixture = ReturnType<typeof fixture>;
function read(current: Fixture, input: unknown = request()): unknown {
  const value: unknown = runInNewContext(buildSchematicPrimitiveReadExpression(input), current.scope, { timeout: 1000 });
  return structuredClone(value);
}
async function wrapped(current: Fixture, code: string): Promise<unknown> {
  const eda = { sch_Primitive: { getPrimitiveByPrimitiveId: forbidden, getPrimitivesByPrimitiveId: forbidden, getPrimitiveTypeByPrimitiveId: forbidden },
    sch_PrimitiveText: { get: forbidden, getAll: forbidden }, sch_PrimitiveWire: { get: forbidden }, sch_PrimitiveBus: { get: forbidden },
    sch_Netlist: { getNetlist: forbidden }, sys_Document: { save: forbidden },
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } };
  return await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder, eda }, { timeout: 1000 }) as unknown;
}

void test("mixed lookup preserves caller order and exactly reuses the modeled family DTO fields", () => {
  const current = fixture();
  const family = (code: string): unknown[] => {
    const result: unknown = structuredClone(runInNewContext(code, current.scope)); assert.ok(Array.isArray(result)); return result;
  };
  const text = family(buildSchematicTextReadExpression({ method: "eda.sch_PrimitiveText.getAll", arguments: {} }))[0];
  const wire = family(buildSchematicNetGroupReadExpression({ method: "eda.sch_PrimitiveWire.getAll", arguments: {} }))[0];
  const bus = family(buildSchematicNetGroupReadExpression({ method: "eda.sch_PrimitiveBus.getAll", arguments: {} }))[0];
  assert.deepEqual(read(current), [wire, text, bus]);
  assert.deepEqual(read(current, request(["m-text", "a-bus", "z-wire"])), [text, bus, wire]);
  for (const [id, expected] of [["m-text", text], ["z-wire", wire], ["a-bus", bus]]) {
    assert.ok(typeof id === "string"); assert.deepEqual(read(current, request(id)), expected);
  }
  validateSchematicPrimitiveStates(read(current), request());
  current.text["x"] = -0; current.line["strokeWidth"] = -0;
  const rows = schematicPrimitiveStatesSchema.parse(read(current));
  const group = rows[0], label = rows[1];
  assert.ok(group?.modelType === "NetGroup" && label?.modelType === "Text");
  assert.ok(Object.is(label.x, -0) && Object.is(group.lines.find((line) => line.primitiveId === "z-line")?.width, -0));
});

void test("strict selectors reject missing/unsupported identities as a whole and never return a partial array", () => {
  for (const id of ["missing", "component", "inherited-text", "z-line", "z-name", "Junction", "z-wire-relevance"]) {
    for (const selector of [id, ["m-text", id]]) { assert.throws(() => read(fixture(), request(selector)), /SCH_PRIMITIVE_TARGET/u); }
  }
  for (const ids of [[], ["m-text", "m-text"], ["bad\n"], [""], ["x".repeat(257)], Array.from({ length: 257 }, (_, index) => String(index)), null, "m-text", {}]) {
    assert.equal(schematicPrimitiveReadRequestSchema.safeParse({ method: SCHEMATIC_PRIMITIVE_READ_METHODS[1], arguments: { ids } }).success, false);
  }
  for (const args of [{ id: "" }, { id: ["m-text"] }, { id: "m-text", code: "caller" }, { ids: ["m-text"] }, {}, null]) {
    assert.equal(schematicPrimitiveReadRequestSchema.safeParse({ method: SCHEMATIC_PRIMITIVE_READ_METHODS[0], arguments: args }).success, false);
  }
  const current = fixture(), id = String.raw`quoted"');globalThis.unexpected=true;//`;
  current.addText(id); validateSchematicPrimitiveStates(read(current, request(id)), request(id)); assert.equal(current.scope["unexpected"], undefined);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "non-page scene": (current) => { current.scope["EXPECTED_DOCUMENT_TYPE"] = 2; },
  "hierarchical instance": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "uninitialized decoder": (current) => { setObject(current.page["consistencyImpl"], "state", "loading"); },
  "busy action": (current) => { setObject(current.shapes["actionRunner"], "running", true); },
  "missing source": (current) => { current.sources.delete(current.text.id); },
  "structural GROUP": (current) => { current.sources.set("unmodeled-group", 1); },
  "unsupported group kind": (current) => { current.bus["type"] = "unknown"; },
  "combined group": (current) => { current.bus["combination"] = {}; },
  "missing Text family": (current) => { current.textFamily.clear(); },
  "Text family cross-alias": (current) => { current.textFamily.add(current.wire); },
  "cross-family identity alias": (current) => { current.text.id = current.wire.id; },
  "foreign Text parent": (current) => { current.text.parent = current.bus; },
  "generated Text promoted": (current) => { const text = current.index.get("inherited-text"); assert.ok(text); current.textFamily.add(text); },
  "missing line index": (current) => { current.index.delete(current.line.id); },
  "hidden child": (current) => { current.wire.children?.pop(); },
  "stored marker": (current) => { current.sources.set("Junction", 1); },
  "nonfinite Text": (current) => { current.text["x"] = Infinity; },
  "nonfinite line": (current) => { current.line["strokeWidth"] = Number.NaN; },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`mixed read refuses ${name} even when only an unrelated Text ID is selected`, () => {
    const current = fixture(); corrupt(current); assert.throws(() => read(current, request("m-text")), /SCH_PRIMITIVE_/u);
  });
}

void test("complete mixed families share one combined string budget before selection", () => {
  const current = fixture();
  for (let index = 0; index < 2; index += 1) { current.addText(`extra-${String(index)}`)["value"] = "x".repeat(65_536); }
  current.text["value"] = "x".repeat(65_536);
  current.name["value"] = "x".repeat(65_536);
  assert.throws(() => read(current, request("a-bus")), /SCH_PRIMITIVE_BOUND/u);
  const text = fixture(); for (let index = 0; index < 256; index += 1) { text.addText(`extra-${String(index)}`); }
  assert.throws(() => read(text, request("a-bus")), /SCH_PRIMITIVE_FAMILY/u);
  const groups = fixture(); for (let index = 0; index < 255; index += 1) { const group = groups.addGroup(`extra-${String(index)}`, "bus"); groups.addLine(group, `extra-line-${String(index)}`); }
  assert.throws(() => read(groups, request("m-text")), /SCH_PRIMITIVE_FAMILY/u);
});

void test("collection of the other family cannot conceal late Text scalar or owner changes", () => {
  for (const boundary of [1, 2]) {
    for (const change of ["text", "signed-zero", "project", "page", "text-family", "manager"]) {
      const current = fixture(); let groupReads = 0;
      current.shapes["getModels"] = (type: string): Model[] => {
        if (type === "NetGroup") { groupReads += 1; }
        if (type === "NetGroup" && groupReads === boundary) {
          if (change === "text") { current.text["value"] = "changed"; }
          if (change === "signed-zero") { current.text["rotation"] = -0; }
          if (change === "project") { current.page["projectMgr"] = { uuid: "project" }; }
          if (change === "text-family") { current.modelMap.set("Text", new Set(current.textFamily)); }
          if (change === "page") { setObject(current.scope["SCH"], "docMemoryManager", { getActiveDoc: (): unknown => ({ ...current.page }) }); }
          if (change === "manager") { current.page["shapeManager"] = { ...current.shapes }; }
        }
        return [...(current.modelMap.get(type) ?? [])];
      };
      assert.throws(() => read(current), /SCH_PRIMITIVE_/u, `${change}:${String(boundary)}`);
    }
  }
});

void test("final source callback changes cannot escape the complete mixed scalar and ownership reproof", () => {
  for (const change of ["text", "line", "source", "page"]) {
    const current = fixture(); let calls = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => {
      calls += 1;
      if (calls === 4) {
        if (change === "text") { current.text["value"] = "late"; }
        if (change === "line") { current.line["strokeStyle"] = -0; }
        if (change === "source") { current.sources.delete(current.text.id); }
        if (change === "page") { current.page["projectMgr"] = { uuid: "project" }; }
      }
      return new Map(current.sources);
    };
    current.line["strokeStyle"] = 0;
    assert.throws(() => read(current), /SCH_PRIMITIVE_/u, change);
  }
});

void test("final Text scalar reproof cannot conceal a line change after the mixed captures", () => {
  const current = fixture(); let calls = 0;
  Object.defineProperty(current.text, "value", { get: (): string => {
    // Two capture reads, their two source/tree reproofs, then final reproof.
    calls += 1;
    if (calls === 5) { current.line["strokeWidth"] = 99; }
    return "m-text";
  } });
  assert.throws(() => read(current), /SCH_PRIMITIVE_CHANGED/u); assert.equal(calls, 5);
});

void test("independent host proof retains exact result shape, order, child identities and combined bounds", () => {
  const rows = schematicPrimitiveStatesSchema.parse(read(fixture()));
  const group = rows[0], text = rows[1];
  assert.ok(group?.modelType === "NetGroup" && text?.modelType === "Text");
  for (const value of [rows.toReversed(), rows.slice(0, 2), [...rows, group], [{ ...group, secret: true }, ...rows.slice(1)],
    [{ ...group, customAttributeIds: ["m-text"] }, ...rows.slice(1)], rows.map((row) => row.modelType === "Text" ? { ...row, value: undefined } : row)]) {
    assert.throws(() => { validateSchematicPrimitiveStates(value, request()); });
  }
  assert.throws(() => { validateSchematicPrimitiveStates(rows, request("m-text")); });
  assert.throws(() => { validateSchematicPrimitiveStates(rows[1], request()); });
  const textRows = Array.from({ length: 4 }, (_, index) => ({ ...text, primitiveId: `text-${String(index)}`, value: "x".repeat(65_536) }));
  const selected = [...textRows, group];
  assert.throws(() => { validateSchematicPrimitiveStates(selected, request(selected.map((row) => row.primitiveId))); });
});

void test("registry and coverage admit exactly two narrowed DTO readers without current live authority", () => {
  for (const method of SCHEMATIC_PRIMITIVE_READ_METHODS) {
    assert.equal(isSchematicPrimitiveReadMethod(method), true);
    const descriptor = publicSdkReadDescriptors().find((row) => row.path === method); assert.ok(descriptor);
    assert.equal(descriptor.implementation.source, "server/src/schematic-primitive-read.ts"); assert.equal(descriptor.implementation.test, "server/tests/schematic-primitive-read.test.ts");
    assert.equal(descriptor.implementation.kind, "native-task-equivalent"); assert.equal(descriptor.parameterSupport, "narrowed");
    assert.equal(descriptor.result.optional, false); assert.equal(descriptor.liveValidation, "not-yet-validated");
    const input = method === SCHEMATIC_PRIMITIVE_READ_METHODS[0] ? request("m-text") : request();
    assert.deepEqual(validatePublicSdkReadRequest(input, 1), input);
    for (const type of [0, 2, 3, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(input, type)); }
    const coverage = inventoryExtensionApiCoverage().find((row) => row.path === method); assert.ok(coverage);
    assert.equal(coverage.status, "implemented-native-equivalent"); assert.equal(coverage.currentGenerationLiveValidation, "not-recorded");
  }
  assert.equal(isSchematicPrimitiveReadMethod("eda.sch_Primitive.delete"), false);
  assert.equal(publicSdkReadRequestSchema.safeParse({ method: "eda.sch_Primitive.delete", arguments: { ids: ["m-text"] } }).success, false);
});

void test("registered native wrappers run without public generic/type/family getters and refuse undefined evidence", async () => {
  for (const input of [request(), request("m-text")]) {
    const payload = decodeExactReadEnvelope(await wrapped(fixture(), buildPublicSdkReadCode(input)));
    assert.ok(payload !== null && typeof payload === "object");
    const result = validatePublicSdkReadPayload(payload, input);
    assert.deepEqual(result["value"], read(fixture(), input));
    assert.equal(result["assurance"], "bounded-native-mixed-primitive-state-observation-not-complete-source-connectivity-or-persistence-proof");
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, undefinedPaths: ["/value"] }, input));
  }
});

void test("diagnostics expose only fixed codes for exact method and stage tuples", async () => {
  const guards = [...new Set([...buildSchematicPrimitiveReadExpression(request()).matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => match[1] ?? ""))].toSorted();
  assert.deepEqual(guards, [...SCHEMATIC_PRIMITIVE_GUARD_CODES].toSorted());
  assert.throws(() => Reflect.apply(buildSchematicPrimitiveReadExpression, undefined, [request(), "caller-code"]));
  for (const method of SCHEMATIC_PRIMITIVE_READ_METHODS) {
    for (const code of SCHEMATIC_PRIMITIVE_GUARD_CODES) {
      const message = `Public SDK read could not produce a complete bounded observation; method=${method}|stage=call|code=SCH_PRIMITIVE_${code}|getter=none`;
      assert.equal(nativeFailureCategory(message), `native-schematic-primitive:${method}:${code}`);
      assert.equal(nativeFailureCategory(`${message}:private`), null);
      assert.equal(nativeFailureCategory(message.replace("stage=call", "stage=lookup")), null);
    }
  }
  const current = fixture(); Object.defineProperty(current.text, "value", { get: (): never => {
    throw Object.defineProperty(new Error("private"), "message", { get: forbidden });
  } });
  const code = buildPublicSdkReadCode(request());
  await assert.rejects(wrapped(current, code), /code=native-error\|getter=none/u);
});

void test("maintained coordinator samples the mixed native reader twice and preserves all drift/no-retry gates", async () => {
  for (const fault of ["none", "context", "profile", "quarantine", "transport", "state"]) {
    let calls = 0, contexts = 0, gates = 0, profiles = 0;
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- Synthetic source-admission seam; maintained coordinator, wrapper and native collectors execute.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1; return fault === "profile" && profiles === 2 ? Promise.reject(new Error("fixture profile")) : Promise.resolve();
      }
    }
    const current = fixture(), engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      calls += 1; assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string");
      if (fault === "transport") { throw new Error("fixture transport"); }
      if (fault === "state" && calls === 2) { current.text["value"] = "changed"; }
      return { structuredContent: { ok: true, result: await wrapped(current, args["code"]) } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => {
      gates += 1; return fault === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true);
    };
    engine.assertContext = (expected): Promise<ContextProbePayload> => {
      contexts += 1; return fault === "context" && contexts === 3 ? Promise.reject(new Error("fixture context")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "page@project" } });
    };
    if (fault === "none") {
      const result = await engine.publicSdkRead(request(), context);
      assert.equal(result["authority"], "native-mixed-primitive-state-observation-not-complete-source-connectivity-or-persistence-proof");
      assert.deepEqual({ calls, contexts, profiles, gates }, { calls: 2, contexts: 5, profiles: 2, gates: 3 });
    } else {
      await assert.rejects(engine.publicSdkRead(request(), context), /fixture|changed between consecutive samples/u);
      assert.equal(calls, ["profile", "state"].includes(fault) ? 2 : 1);
    }
  }
});

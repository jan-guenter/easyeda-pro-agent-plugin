import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";

import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { PUBLIC_SDK_READ_MAX_BYTES, buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import type { PublicSdkReadDescriptor, PublicSdkReadRequest } from "../src/public-sdk-read.ts";

const descriptors = publicSdkReadDescriptors();
// oxlint-disable-next-line eslint/no-template-curly-in-string -- This is the SDK's literal translation placeholder, not JavaScript interpolation.
const TRANSLATION_TAG = "Net ${1}";

function argumentsFor(descriptor: PublicSdkReadDescriptor): Record<string, unknown> {
  const parts = descriptor.path.split(".");
  const method = parts[2];
  if (method === "getSplitScreenIdByTabId") { return { tabId: "pcb-1@project-1" }; }
  if (method === "getTabsBySplitScreenId") { return { splitScreenId: "editor-1" }; }
  if (method === "get") { return { primitiveIds: "primitive-1" }; }
  if (method === "getAllPinsByPrimitiveId") { return { primitiveId: "component-1" }; }
  if (method === "getPrimitiveTypeByPrimitiveId") { return { id: "primitive-1" }; }
  if (method === "getPrimitivesBBox") { return { primitiveIds: ["primitive-1"] }; }
  if (method === "getBoardInfo") { return { boardName: "Board 1" }; }
  if (method === "getPcbInfo") { return { pcbUuid: "pcb-1" }; }
  if (method === "getPanelInfo") { return { panelUuid: "panel-1" }; }
  if (method === "getSchematicInfo") { return { schematicUuid: "schematic-1" }; }
  if (method === "getSchematicPageInfo") { return { schematicPageUuid: "sheet-1" }; }
  if (method === "text") { return { tag: TRANSLATION_TAG, args: ["GND", 1, false] }; }
  if (method === "convertCanvasOriginToDataOrigin" || method === "convertDataOriginToCanvasOrigin") { return { x: 10, y: 20 }; }
  if (parts[1] === "pcb_MathPolygon") { return method === "createPolygon" ? { polygon: [0, 0, "L", 10, 0, 10, 10] } : { complexPolygon: [0, 0, "L", 10, 0, 10, 10] }; }
  if (method === "getRuleConfiguration") { return { configurationName: "Default" }; }
  if (method === "getPadPairGroupMinWireLength") { return { padPairGroupName: "Pair 1" }; }
  if (method === "isLanguageSupported") { return { language: "en" }; }
  if (method === "splitLines") { return { lines: [0, 0, 10, 10] }; }
  if (method?.startsWith("milTo") === true) { return { mil: 1000, numberOfDecimals: 4 }; }
  if (method?.startsWith("mmTo") === true) { return { mm: 25.4, numberOfDecimals: 4 }; }
  if (method?.startsWith("inchTo") === true) { return { inch: 1, numberOfDecimals: 4 }; }
  if (parts[1] === "pcb_Net" && ["getNet", "getNetColor", "getNetLength"].includes(method ?? "")) { return { net: "GND" }; }
  return {};
}

function primitiveFixture(descriptor: PublicSdkReadDescriptor, primitiveId = "primitive-1"): Record<string, unknown> {
  const primitive: Record<string, unknown> = { privateStateMustNotEscape: "private" };
  const polygon = { getSource: (): unknown[] => [0, 0, "L", 10, 0, 10, 10] };
  const special: Record<string, unknown> = {
    PrimitiveId: primitiveId, PrimitiveType: descriptor.result.primitiveType, ComponentType: "part", Component: { uuid: "device-1", libraryUuid: "project-1" },
    Footprint: { uuid: "footprint-1", libraryUuid: "project-1" }, Symbol: { uuid: "symbol-1", libraryUuid: "project-1" }, Model3D: undefined,
    Net: "GND", Text: "R1", Content: "embedded", Key: "Name", Value: "10k", Name: "Resistor", Designator: "R1", UniqueId: "component-1", ParentPrimitiveId: "component-1", ParentComponentPrimitiveId: "component-1",
    PinNumber: "1", PinName: "IN", PinColor: null, PinShape: 0, pinType: 0, PadNumber: "1", Color: null, FillColor: null,
    FontName: null, FontFamily: "Arial", RegionName: undefined, PourName: "Ground", PourPrimitiveId: primitiveId, PourFillMethod: "solid",
    Polygon: polygon, ComplexPolygon: polygon, RuleType: [9], CoordinateSet: [0, 0, 10, 0], Line: [0, 0, 10, 0], Unit: "mil", Pad: ["ELLIPSE", 10, 10], Hole: null, SpecialPad: undefined,
    SolderMaskAndPasteMaskExpansion: null, SolderMaskExpansion: null, HeatWelding: null, DesignRuleBlindViaName: null,
    OtherProperty: { observed: true }, Pads: [], PourFills: [{ path: polygon, id: "fill-1", fill: true, lineWidth: 0 }],
    FileName: "image.svg", BinaryData: "00", Manufacturer: undefined, ManufacturerId: undefined, Supplier: undefined, SupplierId: undefined, SubPartName: undefined,
  };
  const booleanFields = new Set(["PrimitiveLock", "AddIntoBom", "AddIntoPcb", "Mirror", "HorizonMirror", "Metallization", "Reverse", "PreserveSilos", "KeyVisible", "ValueVisible", "Bold", "Italic", "UnderLine", "NoConnected"]);
  for (const field of descriptor.result.getterFields) {
    let value: unknown = booleanFields.has(field) ? false : 0;
    if (Object.hasOwn(special, field)) { value = special[field]; }
    primitive[`getState_${field}`] = function readState(this: unknown): unknown { assert.equal(this, primitive); return value; };
  }
  return primitive;
}

function resultFor(descriptor: PublicSdkReadDescriptor): unknown {
  if (descriptor.membership !== null) { return { uuid: argumentsFor(descriptor)[descriptor.membership.argument] }; }
  if (descriptor.path === "eda.pcb_Document.getCalculatingRatlineStatus") { return "active"; }
  if (descriptor.path === "eda.sys_Window.getCurrentTheme") { return "light"; }
  if (descriptor.path === "eda.sys_Unit.getFrontendDataUnit") { return "mil"; }
  if (descriptor.path === "eda.pcb_Drc.getAllDifferentialPairs") { return [{ name: "pair", positiveNet: "D+", negativeNet: "D-" }]; }
  if (descriptor.path === "eda.sch_Utils.splitLines") { return [[0, 0, 10, 10]]; }
  switch (descriptor.result.kind) {
    case "string": { return "observed"; }
    case "number": { return 1; }
    case "boolean": { return true; }
    case "strings": { return ["GND"]; }
    case "ids": { return ["primitive-1"]; }
    case "records": { return [{ observed: true }]; }
    case "record": { return { observed: true }; }
    case "bbox": { return { minX: 0, minY: 0, maxX: 10, maxY: 10 }; }
    case "point": { return { x: 0, y: 0 }; }
    case "origin": { return { offsetX: 0, offsetY: 0 }; }
    case "json": { return null; }
    case "primitive": { return [primitiveFixture(descriptor)]; }
    case "polygon": { return { getSource: (): unknown[] => [0, 0, "L", 10, 0, 10, 10] }; }
    default: { throw new Error("Unexpected test result contract."); }
  }
}

async function run(request: PublicSdkReadRequest, native: unknown, captured?: unknown[][], membershipRows?: unknown): Promise<unknown> {
  const [_root, namespace, method] = request.method.split(".");
  assert.ok(namespace !== undefined && namespace !== "");
  assert.ok(method !== undefined && method !== "");
  const receiver: Record<string, unknown> = {};
  receiver[method] = function readFixture(this: unknown, ...args: unknown[]): Promise<unknown> {
    assert.equal(this, receiver);
    captured?.push(args);
    return Promise.resolve(native);
  };
  const descriptor = descriptors.find((entry) => entry.path === request.method);
  const membership = descriptor?.membership;
  if (membership !== null && membership !== undefined) {
    const membershipMethod = membership.method.split(".")[2];
    assert.ok(membershipMethod !== undefined);
    receiver[membershipMethod] = (): Promise<unknown> => Promise.resolve(membershipRows ?? [{ uuid: request.arguments[membership.argument] }]);
  }
  const code = buildPublicSdkReadCode(request);
  // The maintained code generator, never caller code, is evaluated in the same
  // Realm so plain-object checks exercise actual native DTO semantics.
  const execute: unknown = runInThisContext(`(async (eda) => { ${code} })`, { timeout: 1000 });
  assert.equal(typeof execute, "function");
  if (typeof execute !== "function") { throw new TypeError("Generated adapter is not callable."); }
  const pending: unknown = Reflect.apply(execute, undefined, [{ [namespace]: receiver }]);
  const envelope = await pending;
  return decodeExactReadEnvelope(envelope);
}

void test("all fixed SDK readers are declared in the pinned runtime and expose isolated schemas", () => {
  const reviewed = extensionApiSnapshots.find((entry) => entry.reference === "reviewed-installed");
  assert.ok(reviewed);
  const declared = new Set(reviewed.namespaces.flatMap((namespace) => namespace.methods.map((method) => `eda.${namespace.name}.${method.name}`)));
  assert.ok(descriptors.length >= 147);
  assert.equal(new Set(descriptors.map((entry) => entry.path)).size, descriptors.length);
  for (const descriptor of descriptors) {
    assert.ok(declared.has(descriptor.path), descriptor.path);
    assert.equal(descriptor.liveValidation, "not-yet-validated");
    assert.ok(descriptor.documentTypes.every((type) => [1, 2, 3, 4].includes(type)));
    assert.ok(JSON.stringify(descriptor.inputSchema).length < 10_000);
    const [_root, namespace, method] = descriptor.path.split(".");
    const signature: string | undefined = reviewed.namespaces.find((entry) => entry.name === namespace)?.methods.find((entry) => entry.name === method)?.signature;
    assert.ok(signature !== undefined);
    const parameterList = signature.slice(signature.indexOf("(") + 1, signature.indexOf("):"));
    const parameters = [...parameterList.matchAll(/(?:^|, )(?:\.\.\.)?([A-Za-z]\w*)\??:/gu)].map((match) => match[1]);
    assert.deepEqual(descriptor.parameters, parameters, descriptor.path);
  }
  const altered = publicSdkReadDescriptors();
  altered[0]?.documentTypes.push(999);
  assert.notDeepEqual(altered, publicSdkReadDescriptors());
  const componentPads = descriptors.find((entry) => entry.path === "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId");
  assert.ok(componentPads);
  assert.ok(componentPads.limitations.some((limitation) => limitation.includes("known 0.1 drill-scale defect") && limitation.includes("exact component-pad reader intentionally excludes")));
});

for (const descriptor of descriptors.filter((entry) => entry.implementation.source === "server/src/public-sdk-read.ts")) {
  void test(`fixed public SDK call preserves receiver, awaits result and projects bounded data: ${descriptor.path}`, async () => {
    const documentType = descriptor.documentTypes[0];
    assert.ok(documentType !== undefined);
    const request = validatePublicSdkReadRequest({ method: descriptor.path, arguments: argumentsFor(descriptor) }, documentType);
    const calls: unknown[][] = [];
    const payload = await run(request, resultFor(descriptor), calls);
    assert.equal(calls.length, 1);
    const expectedArguments = descriptor.parameters.flatMap((parameter) => parameter === descriptor.restParameter ? request.arguments[parameter] : [request.arguments[parameter]]);
    assert.deepEqual(calls[0], expectedArguments);
    const result = validatePublicSdkReadPayload(payload, request);
    assert.equal(result["method"], descriptor.path);
    assert.equal(result["assurance"], "bounded-public-sdk-observation-not-native-or-persistence-proof");
    assert.ok(!JSON.stringify(result).includes("privateStateMustNotEscape"));
  });
}

void test("strict SDK schemas reject caller paths, code, arguments, type coercion and native context mismatch", () => {
  const good = { method: "eda.sys_Environment.getEditorCurrentVersion", arguments: {} };
  for (const input of [null, { ...good, code: "evil()" }, { method: "eda.sys_FileSystem.deleteFileInFileSystem", arguments: {} },
    { method: "eda.sys_Unit.mmToMil", arguments: { mm: "1" } }, { method: "eda.sys_Unit.mmToMil", arguments: { mm: 1, numberOfDecimals: 100 } },
    { method: "eda.pcb_PrimitivePad.get", arguments: { primitiveIds: ["one", "one"] } },
    { method: "eda.sch_PrimitiveComponent.getAll", arguments: { allSchematicPages: true } },
    { method: "eda.pcb_PrimitiveDimension.getAll", arguments: { layer: 1 } },
    { method: "eda.pcb_PrimitiveLine.getAll", arguments: { layer: 999 } },
    { method: "eda.sch_Utils.splitLines", arguments: { lines: [0, 0, 2, 2, 3] } },
    { ...good, arguments: { code: "return 1" } }, JSON.parse('{"method":"eda.sys_Environment.getEditorCurrentVersion","arguments":{"__proto__":{}}}') as unknown]) {
    assert.equal(publicSdkReadRequestSchema.safeParse(input).success, false);
  }
  assert.throws(() => validatePublicSdkReadRequest({ method: "eda.pcb_Layer.getAllLayers", arguments: {} }, 1), /document type/u);
  assert.throws(() => validatePublicSdkReadRequest(good, 17), /document type/u);
});

void test("plain-input gate refuses getters, sparse arrays, prototype instances and aggregate resource abuse without invoking accessors", () => {
  let getterCalls = 0;
  const accessor = Object.defineProperty({}, "method", { enumerable: true, get: () => { getterCalls += 1; return "eda.sys_Environment.isClient"; } });
  assert.equal(publicSdkReadRequestSchema.safeParse(accessor).success, false);
  assert.equal(getterCalls, 0);
  const sparse: unknown[] = [];
  sparse[2] = "primitive-1";
  for (const argumentData of [{ primitiveIds: sparse }, new Date(), { extra: "x".repeat(131_073) },
    { extra: Array.from({ length: 100 }, () => Array.from({ length: 200 }, () => 0)) }]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ method: "eda.pcb_PrimitivePad.get", arguments: argumentData }).success, false);
  }
});

void test("literal argument generation retains nullish slots and cannot inject bridge code", async () => {
  const calls: unknown[][] = [];
  const request = { method: "eda.pcb_PrimitiveLine.getAllPrimitiveId", arguments: { net: "GND'); throw new Error('injected", primitiveLock: false } };
  validatePublicSdkReadPayload(await run(request, [], calls), request);
  assert.deepEqual(calls, [[request.arguments.net, undefined, false]]);
  const unitCalls: unknown[][] = [];
  const units = { method: "eda.sys_Unit.mmToMil", arguments: { mm: 25.4, numberOfDecimals: 0 } };
  validatePublicSdkReadPayload(await run(units, 1000, unitCalls), units);
  assert.deepEqual(unitCalls, [[25.4, 0]]);
});

void test("transport retains every undefined location separately from null, including UTF-8 keys", async () => {
  const request = { method: "eda.pcb_Document.getCurrentFilterConfiguration", arguments: {} };
  const payload = await run(request, { clear: null, missing: undefined, nested: [{ "ä/~": undefined }] });
  const result = validatePublicSdkReadPayload(payload, request);
  assert.deepEqual(result["undefinedPaths"], ["/value/missing", "/value/nested/0/ä~1~0"]);
  assert.deepEqual(result["value"], { clear: null, missing: null, nested: [{ "ä/~": null }] });
  const missing: unknown = undefined;
  const absent = validatePublicSdkReadPayload(await run(request, missing), request);
  assert.equal(absent["present"], false);
  assert.deepEqual(absent["undefinedPaths"], ["/value"]);
});

void test("transport refuses live handles, callbacks, placeholders, cycles, sparse arrays and oversized values", async () => {
  const request = { method: "eda.pcb_Drc.getAllDifferentialPairs", arguments: {} };
  const circular: Record<string, unknown> = {};
  circular["self"] = circular;
  const sparse: unknown[] = [];
  sparse[1] = 1;
  const getter = Object.defineProperty({}, "value", { enumerable: true, get: () => { throw new Error("Getter must not run"); } });
  for (const native of [new Date(), (): number => 1, "[Truncated]", Number.NaN, Number.POSITIVE_INFINITY, circular, sparse, getter,
    "ä".repeat(PUBLIC_SDK_READ_MAX_BYTES), Array.from({ length: 20_001 }, () => 0), { ["x".repeat(4097)]: 1 }]) {
    await assert.rejects(() => run(request, native), /complete bounded observation/u);
  }
});

void test("primitive projections reject missing getters, wrong families, duplicate IDs, unexpected IDs and partial get results", async () => {
  const descriptor = descriptors.find((entry) => entry.path === "eda.pcb_PrimitiveLine.get");
  assert.ok(descriptor);
  const request = { method: descriptor.path, arguments: { primitiveIds: ["primitive-1", "primitive-2"] } };
  const wrongFamily = primitiveFixture(descriptor);
  wrongFamily["getState_PrimitiveType"] = (): string => "Pad";
  for (const native of [[{}], [wrongFamily], [primitiveFixture(descriptor), primitiveFixture(descriptor)],
    [primitiveFixture(descriptor, "foreign")], [primitiveFixture(descriptor)], []]) {
    await assert.rejects(() => run(request, native), /complete bounded observation/u);
  }
  const valid = await run(request, [primitiveFixture(descriptor), primitiveFixture(descriptor, "primitive-2")]);
  assert.doesNotThrow(() => validatePublicSdkReadPayload(valid, request));
});

void test("result validator rejects malformed or fabricated envelopes and contradictory undefined proof", () => {
  const request = { method: "eda.pcb_Net.getNetLength", arguments: { net: "GND" } };
  const good = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: 12, undefinedPaths: [] };
  for (const payload of [{ ...good, method: "eda.sys_Environment.isClient" }, { ...good, value: "12" },
    { ...good, extra: true }, { ...good, present: false }, { ...good, undefinedPaths: ["/value"] },
    { ...good, undefinedPaths: ["/missing"] }, { ...good, undefinedPaths: ["/value/a"] },
    { ...good, value: Number.NaN }]) { assert.throws(() => validatePublicSdkReadPayload(payload, request)); }
  const roundTrip = decodeExactReadEnvelope(encodeExactReadEnvelope(good));
  assert.equal(validatePublicSdkReadPayload(roundTrip, request)["value"], 12);
});

void test("component-pad parent identity matches the exact request in both native projection and host validation", async () => {
  const descriptor = descriptors.find((entry) => entry.path === "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId");
  assert.ok(descriptor);
  const request = { method: descriptor.path, arguments: { primitiveId: "component-1" } };
  const native = primitiveFixture(descriptor);
  const payload = await run(request, [native]);
  assert.doesNotThrow(() => validatePublicSdkReadPayload(payload, request));
  assert.throws(() => validatePublicSdkReadPayload(payload, { ...request, arguments: { primitiveId: "component-2" } }), /different parent/u);
  native["getState_ParentComponentPrimitiveId"] = (): string => "component-2";
  await assert.rejects(() => run(request, [native]), /code=sdk-wrong-parent/u);
});

void test("getter diagnostics identify reviewed field and stage without leaking native errors or substituting values", async () => {
  const descriptor = descriptors.find((entry) => entry.path === "eda.pcb_PrimitivePour.get");
  assert.ok(descriptor);
  const request = { method: descriptor.path, arguments: { primitiveIds: "primitive-1" } };
  const native = primitiveFixture(descriptor);
  native["getState_PourPriority"] = (): never => { throw new Error("secret project path and credential"); };
  await assert.rejects(() => run(request, native), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /stage=getter\|code=native-error\|getter=PourPriority/u);
    assert.ok(!error.message.includes("secret"));
    return true;
  });
  delete native["getState_PourPriority"];
  await assert.rejects(() => run(request, native), /stage=getter\|code=sdk-missing-getter\|getter=PourPriority/u);
});

void test("invalid argument diagnostics retain bounded parameter paths without native or caller content", () => {
  const result = publicSdkReadRequestSchema.safeParse({ method: "eda.sys_Unit.mmToMil", arguments: { mm: "secret" } });
  assert.equal(result.success, false);
  if (result.success) { throw new Error("Malformed input unexpectedly accepted."); }
  assert.deepEqual(result.error.issues[0]?.path, ["arguments", "mm"]);
  assert.ok(!JSON.stringify(result.error.issues).includes("secret"));
});

void test("primitive scalar types refuse coercion and required-undefined values after transport", async () => {
  const descriptor = descriptors.find((entry) => entry.path === "eda.pcb_PrimitiveLine.get");
  assert.ok(descriptor);
  const request = { method: descriptor.path, arguments: { primitiveIds: "primitive-1" } };
  for (const [field, wrong] of [["StartX", "0"], ["PrimitiveLock", 0], ["Net", 0], ["EndX", undefined]]) {
    const native = primitiveFixture(descriptor);
    native[`getState_${String(field)}`] = (): unknown => wrong;
    const payload = await run(request, native);
    assert.throws(() => validatePublicSdkReadPayload(payload, request), /getter/u);
  }
});

void test("schematic UUID metadata lookups prove active-project membership before dispatch and returned identity afterward", async () => {
  const request = { method: "eda.dmt_Schematic.getSchematicPageInfo", arguments: { schematicPageUuid: "sheet-1" } };
  for (const members of [[], [{ uuid: "foreign-sheet" }], [{ uuid: 42 }], "invalid"]) {
    const calls: unknown[][] = [];
    await assert.rejects(() => run(request, { uuid: "sheet-1" }, calls, members), /stage=membership/u);
    assert.equal(calls.length, 0);
  }
  await assert.rejects(() => run(request, { uuid: "foreign-sheet" }), /code=sdk-wrong-document/u);
});

void test("translation adapter admits only the official namespace and scalar interpolation values", async () => {
  const request = publicSdkReadRequestSchema.parse({ method: "eda.sys_I18n.text", arguments: { tag: TRANSLATION_TAG, args: ["GND", 1, false, null] } });
  const calls: unknown[][] = [];
  validatePublicSdkReadPayload(await run(request, "Net GND", calls), request);
  assert.deepEqual(calls, [[TRANSLATION_TAG, "eda", undefined, "GND", 1, false, null]]);
  for (const argumentsData of [{ tag: "x", namespace: "private-extension" }, { tag: "x", args: [{}] }]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ method: request.method, arguments: argumentsData }).success, false);
  }
});

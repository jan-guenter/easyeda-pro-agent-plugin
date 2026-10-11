import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { assertDesignActionSupported, compileDesignAction, inverseDesignAction, prepareDesignAction, verifyDesignAction } from "../src/design-action.ts";
import { listDesignActionCapabilities } from "../src/design-capabilities.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { PCB_TEXT_ACTION_PROFILE, PCB_TEXT_LIMITATIONS, buildPcbTextAdapter as buildNativePcbTextAdapter, compilePcbTextOperation, expectedPcbTextSource,
  inversePcbTextOperation, pcbTextOperationSchema, verifyPcbTextSourceEffect } from "../src/pcb-text-action.ts";

const componentId = "3333333333333333", peerId = "2222222222222222", targetId = "1111111111111111";
const branchId = "b".repeat(32), documentId = "d".repeat(16), projectId = "a".repeat(64);
const operation = { id: "move-text", action: "pcb.text.modify" as const, target: { primitiveId: targetId }, patch: { x: 120.1234, y: -50, text: "Fixture 2.1" } };
const body = { partitionId: "", groupId: 0, layerId: 3, x: 100, y: 200, text: "Fixture 1.0", fontFamily: "default",
  fontSize: 40, strokeWidth: 6, bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 0, reverse: false, expansion: 0,
  mirror: false, locked: false, zIndex: -1, specialColor: null };
function snapshot(): NativeSourceSnapshot {
  const objects = [
    { id: targetId, type: "STRING", body },
    { id: peerId, type: "STRING", body: { ...body, text: "Locked peer", locked: true, x: 500 } },
    { id: componentId, type: "COMPONENT", body: { partitionId: "", groupId: 0, x: 10, y: 20, locked: true } },
    { id: "attribute", type: "ATTR", body: { parentId: componentId, key: "Designator", value: "R1", keyVisible: false, valueVisible: true } },
    { id: "layer3", type: "LAYER", body: { layerId: 3, use: true, show: true, locked: false } },
    { id: "line", type: "LINE", body: { partitionId: "", groupId: 0, startX: 0, startY: 0, endX: 100, endY: 0, locked: true } },
    { id: "canvas", type: "CANVAS", body: { unit: "mil", originX: 0, originY: 0 } },
  ];
  return commit({ schema: "easyeda-pro-control.document-source.v1", document: { uuid: documentId, docType: "PCB", editVersion: "3.2.149.88089769" }, objects });
}
function checkpoint(source: NativeSourceSnapshot): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: projectId, branchUuid: branchId,
    headHistoryUuid: "c".repeat(32), checkpointSha256: "e".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents: [{ uuid: documentId, docType: "PCB", metadata: source.document, records: source.objects.map((row) => ({ ...row, ticket: 1, client: null })), semanticSha256: source.sha256 }],
    semanticSha256: source.sha256 };
}
function buildPcbTextAdapter(input: unknown, source: NativeSourceSnapshot): ReturnType<typeof buildNativePcbTextAdapter> {
  return buildNativePcbTextAdapter(input, source, checkpoint(source));
}
function commit(source: Omit<NativeSourceSnapshot, "sha256">): NativeSourceSnapshot {
  const value = { schema: source.schema, document: source.document, objects: source.objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function change(source: NativeSourceSnapshot, id: string, patch: Record<string, unknown>): NativeSourceSnapshot {
  return commit({ ...source, objects: source.objects.map((row) => row.id === id ? { ...row, body: { ...row.body, ...patch } } : row) });
}
function add(source: NativeSourceSnapshot, record: NativeSourceObject): NativeSourceSnapshot { return commit({ ...source, objects: [...source.objects, record] }); }
function encodeSource(source: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${source.objects.map((row) => `${JSON.stringify({ id: row.id, type: row.type })}||${JSON.stringify(row.body)}|\n`).join("")}`;
}

void test("standalone PCB text exposes only strict x/y/text data with exact native scalar precision", () => {
  assert.deepEqual(pcbTextOperationSchema.parse(operation), operation);
  assert.equal(compilePcbTextOperation(operation).documentType, 3);
  assert.equal(compileDesignAction(operation).profile, PCB_TEXT_ACTION_PROFILE);
  for (const patch of [{}, { x: undefined }, { x: 1, text: undefined }, { fontSize: 50 }, { layer: 4 }, { rotation: 90 }, { primitiveLock: false },
    { x: Number.NaN }, { x: Infinity }, { x: -0 }, { x: 1.00001 }, { x: 10_000_001 }, { text: "" }, { text: " " }, { text: "中文" },
    { text: "line\nbreak" }, { text: "{Designator}" }, { text: "');throw Error('injected" }, { text: "a".repeat(257) }]) {
    assert.throws(() => pcbTextOperationSchema.parse({ ...operation, patch }));
  }
  for (const input of [{ ...operation, code: "arbitrary" }, { ...operation, documentType: 4 },
    { ...operation, target: { resultOf: "prior" } }, { ...operation, target: { primitiveId: "inherited-component-text" } }]) {
    assert.throws(() => pcbTextOperationSchema.parse(input));
  }
  const capabilities = listDesignActionCapabilities();
  assert.ok(Array.isArray(capabilities["actions"]) && capabilities["actions"].includes(operation.action));
  assert.ok(PCB_TEXT_LIMITATIONS.some((line) => line.includes("not pcb_PrimitiveString.modify public-method execution parity")));
});

void test("standalone PCB text projects exactly three scalars and its inverse preserves the complete baseline", () => {
  const before = snapshot(), retained = structuredClone(before);
  const after = expectedPcbTextSource(operation, before);
  const delta = verifyPcbTextSourceEffect(operation, before, after);
  assert.equal(delta.changed.length, 1);
  assert.equal(delta.changed[0]?.before.id, targetId);
  assert.deepEqual(delta.changed[0]?.fields, ["text", "x", "y"]);
  assert.equal(delta.documentChanged, false);
  assert.deepEqual(delta.added, []);
  assert.deepEqual(delta.removed, []);
  assert.deepEqual(after.objects.find((row) => row.id === peerId), before.objects.find((row) => row.id === peerId));
  const inverse = inversePcbTextOperation(operation, before);
  assert.deepEqual(expectedPcbTextSource(inverse, after), before);
  const prepared = prepareDesignAction(operation, { source: before, history: checkpoint(before) }, { targetId });
  assert.equal(prepared.adapterProfile, PCB_TEXT_ACTION_PROFILE);
  assert.deepEqual(prepared.expectedSource, after);
  assert.ok(prepared.code.includes(`const EXPECTED_PCB_PROJECT_UUID="${projectId}";`));
  assert.ok(prepared.code.includes(`const EXPECTED_PCB_BRANCH_UUID="${branchId}";`));
  assert.deepEqual(verifyDesignAction(compileDesignAction(operation), { source: before }, { source: after }), delta);
  assert.deepEqual(inverseDesignAction(operation, { source: before }), inverse);
  assert.throws(() => { assertDesignActionSupported(operation, { source: before }, { targetId: peerId }); }, /journal identity/u);
  assert.deepEqual(before, retained);
  assert.throws(() => expectedPcbTextSource({ ...operation, patch: { x: body.x, text: body.text } }, before), /no source effect/u);
  for (const patch of [{ x: 0.0001 }, { y: -0.0001 }, { text: "New - label_3.1" }]) {
    const action = { ...operation, patch };
    assert.deepEqual(expectedPcbTextSource(inversePcbTextOperation(action, before), expectedPcbTextSource(action, before)), before);
  }
});

void test("standalone PCB text rejects incomplete native STRING shapes, ownership, lock and style ambiguity", () => {
  const before = snapshot();
  for (const patch of [{ parentId: componentId }, { parentId: "" }, { parentId: null }, { key: "Designator" }, { value: "R1" },
    { partitionId: "partition" }, { partitionId: null }, { partitionId: undefined }, { groupId: 1 }, { layerId: 4 },
    { fontFamily: "custom" }, { locked: true }, { locked: undefined }, { x: undefined }, { x: null }, { x: 0.00001 }, { x: -0 },
    { fontSize: 0 }, { strokeWidth: body.fontSize }, { bold: false }, { italic: 1 }, { origin: "CENTER_MIDDLE" }, { angle: 90 },
    { reverse: true }, { expansion: 1 }, { mirror: true }, { specialColor: "#FFFFFF" }, { unknown: "ignored-by-native" }]) {
    assert.throws(() => expectedPcbTextSource(operation, change(before, targetId, patch)));
  }
  assert.throws(() => expectedPcbTextSource({ ...operation, target: { primitiveId: peerId } }, before), /unlocked STRING/u);
  assert.throws(() => expectedPcbTextSource({ ...operation, target: { primitiveId: "aaaaaaaaaaaaaaaa" } }, before), /unlocked STRING/u);
  assert.throws(() => expectedPcbTextSource(operation, commit({ ...before, objects: before.objects.map((row) => row.id === targetId ? { ...row, type: "ATTR" } : row) })));
  assert.throws(() => expectedPcbTextSource(operation, change(before, peerId, { fontFamily: "custom" })));
});

void test("standalone PCB text preserves exact absent or pinned default-black color without admitting color edits", () => {
  for (const specialColor of [null, "#000000"]) {
    // Shape observed from native default-font placement, with synthetic IDs.
    const before = change(change(snapshot(), targetId, { specialColor, x: 95, y: 210, text: "Fixture1", fontSize: 120, strokeWidth: 8 }), peerId, { specialColor });
    const after = expectedPcbTextSource(operation, before);
    assert.equal(after.objects.find((row) => row.id === targetId)?.body["specialColor"], specialColor);
    assert.equal(after.objects.find((row) => row.id === peerId)?.body["specialColor"], specialColor);
    assert.deepEqual(expectedPcbTextSource(inversePcbTextOperation(operation, before), after), before);
    assert.doesNotThrow(() => buildPcbTextAdapter(operation, before));
    assert.throws(() => verifyPcbTextSourceEffect(operation, before, change(after, targetId, { specialColor: specialColor === null ? "#000000" : null })), /beyond its exact/u);
  }
  for (const specialColor of ["#FFFFFF", "#000", "black", "#000000FF", "#000000 ", "", undefined, 0]) {
    assert.throws(() => expectedPcbTextSource(operation, change(snapshot(), targetId, { specialColor })));
    assert.throws(() => expectedPcbTextSource(operation, change(snapshot(), peerId, { specialColor })));
  }
});

void test("standalone PCB text validates complete document structure and native ATTR ownership before generation", () => {
  const before = snapshot();
  for (const type of ["POUR", "POURED", "LAYER_FILL", "TEARDROP", "GROUP", "PARTITION", "PANELIZE_STAMP", "REUSE_BLOCK", "FONT", "DIMENSION", "UNKNOWN"]) {
    assert.throws(() => buildPcbTextAdapter(operation, add(before, { id: "extra", type, body: {} })), /unsupported record family/u);
  }
  for (const patch of [{ parentId: "" }, { parentId: undefined }, { parentId: "missing" }, { parentId: targetId },
    { key: "" }, { value: 42 }, { keyVisible: undefined }, { valueVisible: null }]) {
    assert.throws(() => buildPcbTextAdapter(operation, change(before, "attribute", patch)), /attribute ownership|Invalid input/u);
  }
  const attribute = before.objects.find((row) => row.id === "attribute");
  assert.ok(attribute);
  assert.throws(() => buildPcbTextAdapter(operation, add(before, { ...attribute, id: "duplicate-attribute" })), /duplicate native component attributes/u);
  for (const patch of [{ locked: true }, { locked: undefined }, { use: false }, { show: false }, { layerId: 4 }]) {
    assert.throws(() => buildPcbTextAdapter(operation, change(before, "layer3", patch)), /silkscreen layer|Invalid input/u);
  }
  assert.throws(() => buildPcbTextAdapter(operation, add(before, { id: "second-layer", type: "LAYER", body: { layerId: 3, use: true, show: true, locked: false } })), /silkscreen layer/u);
  for (const patch of [{ partitionId: "foreign" }, { groupId: 1 }, { groupID: "group" }, { parentId: componentId }]) {
    assert.throws(() => buildPcbTextAdapter(operation, change(before, "line", patch)), /ownership/u);
  }
  assert.throws(() => buildPcbTextAdapter(operation, { ...before, sha256: "0".repeat(64) }), /baseline/u);
  assert.throws(() => buildPcbTextAdapter(operation, commit({ ...before, document: { ...before.document, docType: "FOOTPRINT" } })), /baseline/u);
  assert.throws(() => buildPcbTextAdapter(operation, commit({ ...before, document: { ...before.document, editVersion: "new" } })), /baseline/u);
  assert.throws(() => buildPcbTextAdapter(operation, commit({ ...before, document: { ...before.document, uuid: "d".repeat(32) } })), /baseline/u);
  assert.throws(() => buildPcbTextAdapter(operation, add(before, before.objects[0] ?? attribute)), /duplicate identities/u);
});

void test("standalone PCB text admits only the exact disabled default panel shape", () => {
  const stamp = { on: true, stampHoleGroupQuantity: 1, stampHoleDiameter: 20, stampHoleQuantityPerGroup: 5, stampHoleSpacing: 40 };
  const side = { on: true, sideHeight: 100, positionHoleDiameter: 40, markDiameter: 30, markExpansion: 10 };
  const panel = { on: false, row: 1, column: 1, rowSpacing: 0, columnSpacing: 0, onlyOutline: true,
    horizontalStamp: stamp, verticalStamp: stamp, horizontalSize: side, verticalSize: side };
  const before = add(snapshot(), { id: "PANELIZE", type: "PANELIZE", body: panel });
  assert.equal(buildPcbTextAdapter(operation, before).expected.objects.length, before.objects.length);
  for (const patch of [{ on: true }, { row: 2 }, { columnSpacing: 1 }, { onlyOutline: false }, { unknown: 1 }, { horizontalStamp: { on: false } }]) {
    assert.throws(() => buildPcbTextAdapter(operation, change(before, "PANELIZE", patch)), /disabled default panel/u);
  }
  assert.throws(() => buildPcbTextAdapter(operation, add(snapshot(), { id: "other-panel", type: "PANELIZE", body: panel })), /disabled default panel/u);
});

void test("standalone PCB text effect proof refuses every collateral change and forged after commitment", () => {
  const before = snapshot();
  const after = expectedPcbTextSource(operation, before);
  for (const [id, patch] of [[targetId, { x: 120.1235 }], [targetId, { fontSize: 41 }], [peerId, { text: "Moved peer" }],
    [componentId, { x: 11 }], ["attribute", { value: "R2" }], ["line", { endX: 101 }], ["canvas", { unit: "mm" }]] as const) {
    assert.throws(() => verifyPcbTextSourceEffect(operation, before, change(after, id, patch)), /beyond its exact/u);
  }
  assert.throws(() => verifyPcbTextSourceEffect(operation, before, { ...after, sha256: "0".repeat(64) }), /baseline/u);
  assert.throws(() => verifyPcbTextSourceEffect(operation, before, commit({ ...after, document: { ...after.document, title: "changed" } })), /beyond its exact/u);
  assert.throws(() => verifyPcbTextSourceEffect(operation, before, commit({ ...after, objects: after.objects.filter((row) => row.id !== "line") })), /beyond its exact/u);
  assert.throws(() => verifyPcbTextSourceEffect(operation, before, add(after, { id: "new-line", type: "LINE", body: { endX: 100 } })), /beyond its exact/u);
});

void test("the action coordinator seals native project and branch for every type-3 source adapter", () => {
  const before = add(change(snapshot(), componentId, { locked: false }), { id: "transform", type: "ATTR",
    body: { parentId: componentId, key: "3D Model Transform", value: "10,20,30,0,0,0,0,0,0", locked: false } });
  const action = { id: "model", action: "pcb.component.model-transform", target: { primitiveId: componentId }, attributeId: "transform",
    transform: { format: "legacy", dimensionsMil: { x: 10, y: 20, z: 30 }, rotationDegrees: { x: 0, y: 0, z: 0 }, offsetMil: { x: 1, y: 0, z: 0 } } };
  const sealed = prepareDesignAction(action, { source: before, history: checkpoint(before) });
  assert.ok(sealed.code.includes(`const EXPECTED_PCB_PROJECT_UUID="${projectId}";`));
  assert.ok(sealed.code.includes(`const EXPECTED_PCB_BRANCH_UUID="${branchId}";`));
  const offline = prepareDesignAction(action, { source: before });
  assert.ok(offline.code.includes("const EXPECTED_PCB_PROJECT_UUID=null;"));
  assert.ok(offline.code.includes("const EXPECTED_PCB_BRANCH_UUID=null;"));
  for (const history of [{ ...checkpoint(before), branchUuid: "bad" }, { ...checkpoint(before), documents: [] },
    { ...checkpoint(before), projectUuid: "a".repeat(16) }, { ...checkpoint(before), checkpointSha256: "bad" }]) {
    assert.throws(() => prepareDesignAction(action, { source: before, history }), /source-adapter scope/u);
  }
});

interface RuntimeState { source: string; writes: number; acknowledgment: unknown; activeTab: string; onSourceReply?: () => void; }
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the exact nested mutable fixture graph for independently swapping native receivers in adversarial tests, without weakening it to unknown or any.
function runtimeFixture(source: NativeSourceSnapshot) {
  const tabId = `${documentId}@${projectId}`;
  const state: RuntimeState = { source: encodeSource(source), writes: 0, acknowledgment: true, activeTab: tabId };
  const rpcCall = (topic: string, data: unknown): Promise<{ message: unknown }> => {
    if (topic === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId, docType: 3 } }); }
    if (topic === "FileSource") {
      const retained = state.source;
      return Promise.resolve().then(() => { state.onSourceReply?.(); return { message: retained }; });
    }
    assert.equal(topic, "pcb/decode");
    assert.equal(typeof data, "string");
    state.source = String(data); state.writes += 1;
    return Promise.resolve({ message: state.acknowledgment });
  };
  const attributes = new Map<string, string>([["c_dbid", tabId], ["c_doctype", "3"], ["src", "editor?entry=pcb"], ["pcb-canvas", "true"]]);
  const frames: unknown[] = [];
  const document = { querySelectorAll: (_selector: string): unknown[] => frames };
  const frame = { tagName: "IFRAME", id: `frame_${tabId}`, ownerDocument: document, isConnected: true,
    contentWindow: { MSG_BUS_PCB: { messageBus: { rpcCall } } }, classList: { contains: (name: string): boolean => name === "editframe" },
    getAttribute: (name: string): string | null => attributes.get(name) ?? null, hasAttribute: (name: string): boolean => attributes.has(name),
    parentElement: { getAttribute: (name: string): string | null => name === "uuid" ? tabId : null } };
  frames.push(frame);
  const host = { currentProject: { projectId, branchUuid: branchId, isV2Format: false }, isHistoryMode: false };
  const tabs = { getActiveTab: (): string => state.activeTab, getTabById: (): unknown => ({ tabId, data: { doctype: 3, pid: projectId } }),
    getTabIframeSync: (): typeof frame => frame };
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): unknown => ({ disable: false }) };
  const runtime = { gVars: host, UI: { tabBar: tabs, concurrentDesign: permission }, document };
  return { attributes, document, frame, host, permission, runtime, state, tabs, tabId };
}

void test("generated standalone PCB text binds one exact native receiver and never retries a refused acknowledgment", async () => {
  const before = snapshot();
  const adapter = buildPcbTextAdapter(operation, before);
  assert.doesNotMatch(adapter.code, /getDocumentSource|setDocumentSource/u);
  // oxlint-disable-next-line eslint/no-new-func, typescript/no-implied-eval, typescript/no-unsafe-type-assertion -- Execute only the maintained generated program with isolated synthetic globals, never caller code or a live bridge.
  const run = new Function("globalThis", "EXPECTED_PROJECT_UUID", "EXPECTED_DOCUMENT_UUID", "EXPECTED_TAB_ID", "EXPECTED_DOCUMENT_TYPE", `return (async () => {${adapter.code}})();`) as (...args: unknown[]) => Promise<unknown>;
  const fixture = runtimeFixture(before);
  assert.equal(await run(fixture.runtime, projectId, documentId, fixture.tabId, 3), true);
  assert.equal(fixture.state.writes, 1);
  assert.deepEqual(parseDocumentSource(fixture.state.source), adapter.expected);
  fixture.state.source = encodeSource(change(before, "attribute", { value: "R2" }));
  await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /baseline:BASELINE/u);
  assert.equal(fixture.state.writes, 1);
  fixture.state.source = encodeSource(before);
  await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 4), /host:CONTEXT/u);
  fixture.state.acknowledgment = false;
  await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /acknowledgment:ACK/u);
  assert.equal(fixture.state.writes, 2);
  assert.deepEqual(parseDocumentSource(fixture.state.source), adapter.expected);
});

void test("late source replies cannot dispatch after tab, branch, frame, permission or receiver drift", async () => {
  const before = snapshot();
  const adapter = buildPcbTextAdapter(operation, before);
  // oxlint-disable-next-line eslint/no-new-func, typescript/no-implied-eval, typescript/no-unsafe-type-assertion -- Execute only the maintained generated program against independently replaceable synthetic receivers.
  const run = new Function("globalThis", "EXPECTED_PROJECT_UUID", "EXPECTED_DOCUMENT_UUID", "EXPECTED_TAB_ID", "EXPECTED_DOCUMENT_TYPE", `return (async () => {${adapter.code}})();`) as (...args: unknown[]) => Promise<unknown>;
  type Fixture = ReturnType<typeof runtimeFixture>;
  const changes: ((fixture: Fixture) => void)[] = [
    (fixture) => { fixture.state.activeTab = "foreign-tab"; },
    (fixture) => { fixture.host.currentProject.projectId = "f".repeat(32); },
    (fixture) => { fixture.host.currentProject.branchUuid = "f".repeat(32); },
    (fixture) => { fixture.host.currentProject = { ...fixture.host.currentProject }; },
    (fixture) => { fixture.host.isHistoryMode = true; },
    (fixture) => { fixture.frame.isConnected = false; },
    (fixture) => { fixture.attributes.set("c_dbid", "foreign-tab"); },
    (fixture) => { fixture.attributes.set("blankIframe", "true"); },
    (fixture) => { fixture.document.querySelectorAll = (): unknown[] => [fixture.frame, fixture.frame]; },
    (fixture) => { fixture.frame.contentWindow = { ...fixture.frame.contentWindow }; },
    (fixture) => { fixture.frame.contentWindow.MSG_BUS_PCB = { ...fixture.frame.contentWindow.MSG_BUS_PCB }; },
    (fixture) => { fixture.frame.contentWindow.MSG_BUS_PCB.messageBus.rpcCall = (): Promise<{ message: unknown }> => Promise.resolve({ message: true }); },
    (fixture) => { fixture.permission.isConcurrentStrictMode = true; },
    (fixture) => { fixture.permission.getIframeDisableStatusPanelPcb = (): unknown => ({ disable: true }); },
    (fixture) => { fixture.tabs.getTabById = (): unknown => ({ tabId: fixture.tabId, data: { doctype: 4, pid: projectId } }); },
  ];
  for (const changeRuntime of changes) {
    const fixture = runtimeFixture(before);
    fixture.state.onSourceReply = (): void => { changeRuntime(fixture); };
    await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /baseline:/u);
    assert.equal(fixture.state.writes, 0);
    assert.deepEqual(parseDocumentSource(fixture.state.source), before);
  }
  assert.throws(() => buildNativePcbTextAdapter(operation, before), /complete checkpoint/u);
  assert.throws(() => buildNativePcbTextAdapter(operation, before, { ...checkpoint(before), branchUuid: "" }), /complete checkpoint/u);
  assert.throws(() => buildNativePcbTextAdapter(operation, before, { ...checkpoint(before), projectUuid: "a".repeat(16) }), /complete checkpoint/u);
  assert.throws(() => buildNativePcbTextAdapter(operation, before, { ...checkpoint(before), documents: [] }), /complete checkpoint/u);
});

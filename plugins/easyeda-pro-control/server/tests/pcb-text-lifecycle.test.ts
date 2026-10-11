import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { prepareDesignAction } from "../src/design-action.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { assertPcbTextLifecycleAcknowledgment, assertPcbTextLifecycleSupported, buildPcbTextLifecycleAdapter, compilePcbTextLifecycleOperation,
  expectedPcbTextLifecycleSource, inversePcbTextLifecycleOperation, pcbTextLifecycleOperationSchema,
  verifyPcbTextLifecycleSourceEffect } from "../src/pcb-text-lifecycle.ts";
import { buildPcbTextLifecycleRuntime } from "../src/pcb-text-lifecycle-runtime.ts";

const branchId = "b".repeat(32), documentId = "d".repeat(16), projectId = "a".repeat(64);
const createdId = "3333333333333333", peerId = "2222222222222222", targetId = "1111111111111111";
const create = { id: "create-text", action: "pcb.text.create" as const,
  properties: { x: 120.1234, y: -50, text: "Fixture 2.1", fontSize: 40, strokeWidth: 6 } };
const remove = { id: "delete-text", action: "pcb.text.delete" as const, target: { primitiveId: targetId } };
const textBody = { partitionId: "", groupId: 0, layerId: 3, x: 100, y: 200, text: "Fixture 1.0", fontFamily: "default",
  fontSize: 40, strokeWidth: 6, bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 0, reverse: false, expansion: 0,
  mirror: false, locked: false, zIndex: -1, specialColor: null };
function commit(input: Omit<NativeSourceSnapshot, "sha256">): NativeSourceSnapshot {
  const source = { schema: input.schema, document: input.document, objects: input.objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...source, sha256: sha256Json(source) };
}
function snapshot(): NativeSourceSnapshot {
  return commit({ schema: "easyeda-pro-control.document-source.v1", document: { uuid: documentId, docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: [{ id: targetId, type: "STRING", body: textBody },
      { id: peerId, type: "STRING", body: { ...textBody, locked: true, text: "Locked peer", zIndex: 17 } },
      { id: "layer3", type: "LAYER", body: { layerId: 3, use: true, show: true, locked: false } },
      { id: "line", type: "LINE", body: { partitionId: "", groupId: 0, startX: 0, startY: 0, endX: 100, endY: 0, locked: true } },
      { id: "CANVAS", type: "CANVAS", body: { unit: "mil", originX: 0, originY: 0 } }] });
}
function checkpoint(source: NativeSourceSnapshot): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: projectId, branchUuid: branchId,
    headHistoryUuid: "c".repeat(32), checkpointSha256: "e".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents: [{ uuid: documentId, docType: "PCB", metadata: source.document,
      records: source.objects.map((row) => ({ ...row, ticket: 1, client: null })), semanticSha256: source.sha256 }], semanticSha256: source.sha256 };
}
function change(source: NativeSourceSnapshot, id: string, patch: Record<string, unknown>): NativeSourceSnapshot {
  return commit({ ...source, objects: source.objects.map((row) => row.id === id ? { ...row, body: { ...row.body, ...patch } } : row) });
}
function add(source: NativeSourceSnapshot, row: NativeSourceObject): NativeSourceSnapshot { return commit({ ...source, objects: [...source.objects, row] }); }
function encode(source: NativeSourceSnapshot): string {
  // Deliberately use unsorted rows and noncanonical whitespace/headers. Only
  // The selected STRING membership may change, not unrelated wire encoding.
  return `{"type":"DOCHEAD", "ticket":90}||${JSON.stringify(source.document)}|\n${source.objects.toReversed().map((row, index) =>
    `${JSON.stringify({ type: row.type, id: row.id, ticket: index + 1 })}|| ${JSON.stringify(row.body)}|\n`).join("")}`;
}

void test("PCB text lifecycle schemas expose explicit bounded creation data and exact single deletion target", () => {
  assert.deepEqual(pcbTextLifecycleOperationSchema.parse(create), create);
  assert.deepEqual(pcbTextLifecycleOperationSchema.parse(remove), remove);
  assert.equal(compilePcbTextLifecycleOperation(create).resultKind, "created-primitive");
  assert.equal(compilePcbTextLifecycleOperation(remove).resultKind, "boolean");
  for (const patch of [{ x: -0 }, { x: Infinity }, { x: 0.00001 }, { y: Number.NaN }, { y: 10_000_001 }, { text: "" }, { text: " " },
    { text: "中文" }, { text: "a\nb" }, { text: "{Designator}" }, { text: "a".repeat(257) }, { fontSize: 0 }, { strokeWidth: -1 },
    { strokeWidth: 40 }, { strokeWidth: 0.00001 }, { layerId: 4 }, { fontFamily: "default" }, { origin: "LEFT_BOTTOM" },
    { locked: false }, { zIndex: -1 }, { nativeId: createdId }]) {
    assert.throws(() => pcbTextLifecycleOperationSchema.parse({ ...create, properties: { ...create.properties, ...patch } }));
  }
  for (const key of Object.keys(create.properties)) {
    const properties = Object.fromEntries(Object.entries(create.properties).filter(([name]) => name !== key));
    assert.throws(() => pcbTextLifecycleOperationSchema.parse({ ...create, properties }));
  }
  for (const input of [{ ...create, createdId }, { ...create, target: { primitiveId: targetId } }, { ...create, code: "arbitrary" },
    { ...remove, target: { resultOf: create.id } }, { ...remove, target: { primitiveId: `${targetId}-inherited` } },
    { ...remove, target: { primitiveIds: [targetId] } }, { ...remove, properties: {} }, { ...remove, documentType: 4 }]) {
    assert.throws(() => pcbTextLifecycleOperationSchema.parse(input));
  }
});

void test("PCB text create projects one fixed STRING and its original-ID deletion restores the entire source", () => {
  const before = snapshot(), retained = structuredClone(before);
  const after = expectedPcbTextLifecycleSource(create, before, { createdId });
  const delta = verifyPcbTextLifecycleSourceEffect(create, before, after, { createdId });
  assert.deepEqual(delta.added, [{ id: createdId, type: "STRING", body: { ...textBody, ...create.properties } }]);
  assert.deepEqual(delta.changed, []); assert.deepEqual(delta.removed, []); assert.equal(delta.documentChanged, false);
  const inverse = inversePcbTextLifecycleOperation(create, before, { createdId });
  assert.ok(inverse);
  assert.deepEqual(inverse.action, "pcb.text.delete");
  assert.deepEqual(expectedPcbTextLifecycleSource(inverse, after), before);
  assert.deepEqual(before, retained);
  assert.throws(() => expectedPcbTextLifecycleSource(create, before));
  assert.throws(() => inversePcbTextLifecycleOperation(create, before));
  for (const identity of [targetId, documentId, "bad", "A".repeat(16), "a".repeat(32)]) {
    assert.throws(() => expectedPcbTextLifecycleSource(create, before, { createdId: identity }));
  }
  assert.throws(() => expectedPcbTextLifecycleSource(create, before, { createdId, targetId }), /existing target/u);
});

void test("PCB text delete proves only the selected unlocked STRING removal and offers no identity-replacing inverse", () => {
  const before = snapshot();
  const after = expectedPcbTextLifecycleSource(remove, before, { targetId });
  const delta = verifyPcbTextLifecycleSourceEffect(remove, before, after, { targetId });
  assert.deepEqual(delta.removed.map((row) => row.id), [targetId]);
  assert.deepEqual(delta.added, []); assert.deepEqual(delta.changed, []);
  assert.equal(inversePcbTextLifecycleOperation(remove, before), undefined);
  assert.throws(() => expectedPcbTextLifecycleSource(remove, before, { targetId: peerId }), /journal-owned target/u);
  for (const primitiveId of [peerId, createdId]) {
    assert.throws(() => expectedPcbTextLifecycleSource({ ...remove, target: { primitiveId } }, before), /unlocked STRING/u);
  }
  const empty = commit({ ...before, objects: before.objects.filter((row) => row.type !== "STRING") });
  const single = expectedPcbTextLifecycleSource(create, empty, { createdId });
  assert.deepEqual(expectedPcbTextLifecycleSource({ ...remove, target: { primitiveId: createdId } }, single), empty);
});

void test("PCB text lifecycle retains the complete baseline guard for create and delete, including locked or malformed peers", () => {
  const before = snapshot();
  const cases = [change(before, peerId, { fontFamily: "custom" }), change(before, peerId, { parentId: "component" }),
    change(before, peerId, { zIndex: null }), change(before, "layer3", { show: false }), change(before, "line", { groupId: 1 }),
    change(before, "line", { partitionId: "foreign" }), change(before, targetId, { strokeWidth: 0 }),
    add(before, { id: "attr", type: "ATTR", body: { parentId: "missing", key: "Designator", value: "R1" } }),
    { ...before, sha256: "0".repeat(64) }, commit({ ...before, document: { ...before.document, editVersion: "new" } }),
    ...["POUR", "POURED", "PARTITION", "GROUP", "DIMENSION", "LAYER_FILL", "FONT", "UNKNOWN"].map((type) => add(before, { id: "unmodeled", type, body: {} }))];
  for (const source of cases) {
    assert.throws(() => expectedPcbTextLifecycleSource(create, source, { createdId }));
    assert.throws(() => expectedPcbTextLifecycleSource(remove, source));
  }
});

void test("PCB text lifecycle rejects every collateral delta and an acknowledgment identity different from preparation", () => {
  const before = snapshot();
  for (const operation of [create, remove]) {
    const after = expectedPcbTextLifecycleSource(operation, before, { createdId });
    for (const [id, patch] of [[peerId, { text: "changed peer" }], ["line", { endX: 101 }], ["CANVAS", { originX: 1 }], ["layer3", { activeColor: "changed" }]] as const) {
      assert.throws(() => verifyPcbTextLifecycleSourceEffect(operation, before, change(after, id, patch), { createdId }), /exact journal-owned STRING/u);
    }
    assert.throws(() => verifyPcbTextLifecycleSourceEffect(operation, before, { ...after, sha256: "0".repeat(64) }, { createdId }), /baseline/u);
    assert.throws(() => verifyPcbTextLifecycleSourceEffect(operation, before, add(after, { id: "extra", type: "LINE", body: {} }), { createdId }), /exact journal-owned STRING/u);
    assert.throws(() => verifyPcbTextLifecycleSourceEffect(operation, before, commit({ ...after, document: { ...after.document, title: "renamed" } }), { createdId }), /exact journal-owned STRING/u);
  }
  const after = expectedPcbTextLifecycleSource(create, before, { createdId });
  assert.throws(() => verifyPcbTextLifecycleSourceEffect(create, before, after, { createdId: "4444444444444444" }), /exact journal-owned STRING/u);
  for (const patch of [{ zIndex: 1 }, { x: create.properties.x + 1 }, { locked: true }]) {
    assert.throws(() => verifyPcbTextLifecycleSourceEffect(create, before, change(after, createdId, patch), { createdId }), /exact journal-owned STRING/u);
  }
});

void test("PCB text creation allocates once in preparation, preserves its returned ID, and refuses recovery regeneration", () => {
  const before = snapshot();
  const adapter = buildPcbTextLifecycleAdapter(create, before, checkpoint(before));
  assert.ok(adapter.createdId !== undefined);
  assert.match(adapter.createdId, /^[a-f0-9]{16}$/u);
  const retainedId = adapter.createdId;
  assert.notEqual(adapter.createdId, targetId);
  assert.deepEqual(adapter.expected, expectedPcbTextLifecycleSource(create, before, { createdId: adapter.createdId }));
  assert.ok(adapter.code.includes(`TEXT_CREATED_ID="${adapter.createdId}"`));
  assert.throws(() => buildPcbTextLifecycleAdapter(create, before, checkpoint(before), { createdId: retainedId }), /regenerate or redispatch/u);
  assert.throws(() => buildPcbTextLifecycleAdapter(create, before), /journal-owned complete checkpoint/u);
  assert.throws(() => buildPcbTextLifecycleAdapter(create, before, { ...checkpoint(before), branchUuid: "bad" }), /journal-owned complete checkpoint/u);
  assert.equal(buildPcbTextLifecycleAdapter(remove, before, checkpoint(before)).createdId, undefined);
});

interface RuntimeState { source: string; acknowledgment: unknown; writes: number; activeTab: string;
  calls: string[]; onSource?: () => void; onIdentity?: () => void; onDecode?: () => void; }
// oxlint-disable-next-line typescript/explicit-function-return-type -- Retain the exact independently replaceable synthetic receiver graph for race tests.
function runtimeFixture(before: NativeSourceSnapshot) {
  const tabId = `${documentId}@${projectId}`;
  const state: RuntimeState = { source: encode(before), acknowledgment: true, writes: 0, activeTab: tabId, calls: [] };
  const rpcCall = (topic: string, data: unknown): Promise<{ message: unknown }> => {
    state.calls.push(topic);
    if (topic === "getTabIdAndDocType") { return Promise.resolve().then(() => { state.onIdentity?.(); return { message: { tabId, docType: 3 } }; }); }
    if (topic === "FileSource") { const source = state.source; return Promise.resolve().then(() => { state.onSource?.(); return { message: source }; }); }
    assert.equal(topic, "pcb/decode"); assert.equal(typeof data, "string");
    state.source = String(data); state.writes += 1;
    return Promise.resolve().then(() => { state.onDecode?.(); return { message: state.acknowledgment }; });
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
  return { attributes, frame, frames, host, permission, runtime, state, tabs, tabId };
}
function runtimeFor(code: string): (...args: unknown[]) => Promise<unknown> {
  // oxlint-disable-next-line eslint/no-new-func, typescript/no-implied-eval, typescript/no-unsafe-type-assertion -- Execute only maintained generated source against isolated synthetic globals, never caller code or a live bridge.
  return new Function("globalThis", "EXPECTED_PROJECT_UUID", "EXPECTED_DOCUMENT_UUID", "EXPECTED_TAB_ID", "EXPECTED_DOCUMENT_TYPE", `return (async () => {${code}})();`) as (...args: unknown[]) => Promise<unknown>;
}

void test("PCB text lifecycle runtime preserves every unrelated raw row and order, with one acknowledgment and original ID", async () => {
  const before = snapshot();
  for (const operation of [create, remove]) {
    const adapter = buildPcbTextLifecycleAdapter(operation, before, checkpoint(before));
    assert.doesNotMatch(adapter.code, /getDocumentSource|setDocumentSource/u);
    const fixture = runtimeFixture(before), original = fixture.state.source.split("|\n").filter(Boolean);
    const result = await runtimeFor(adapter.code)(fixture.runtime, projectId, documentId, fixture.tabId, 3);
    assert.deepEqual(result, operation.action === "pcb.text.create" ? { primitiveId: adapter.createdId } : true);
    assert.equal(fixture.state.writes, 1);
    assert.deepEqual(fixture.state.calls, ["getTabIdAndDocType", "FileSource", "pcb/decode"]);
    assert.deepEqual(parseDocumentSource(fixture.state.source), adapter.expected);
    const rows = fixture.state.source.split("|\n").filter(Boolean);
    assert.deepEqual(operation.action === "pcb.text.create" ? rows.slice(0, -1) : rows,
      operation.action === "pcb.text.create" ? original : original.filter((row) => !row.includes(`"id":"${targetId}"`)));
    if (operation.action === "pcb.text.create") {
      const header = JSON.parse(rows.at(-1)?.split("||")[0] ?? "null") as unknown;
      assert.deepEqual(header, { type: "STRING", id: adapter.createdId, ticket: before.objects.length + 1 });
    }
  }
});

void test("typed action wrapper returns the exact lifecycle ACK with the original prepared ID and project binding", async () => {
  const before = snapshot();
  for (const operation of [create, remove]) {
    const prepared = prepareDesignAction(operation, { source: before, history: checkpoint(before) });
    const fixture = runtimeFixture(before);
    const result = await runtimeFor(prepared.code)(fixture.runtime, projectId, documentId, fixture.tabId, 3);
    assertPcbTextLifecycleAcknowledgment(operation, prepared.createdId === undefined ? {} : { createdId: prepared.createdId }, result);
    assert.deepEqual(parseDocumentSource(fixture.state.source), prepared.expectedSource);
    assert.equal(fixture.state.writes, 1);
    const otherProject = runtimeFixture(before);
    await assert.rejects(runtimeFor(prepared.code)(otherProject.runtime, "c".repeat(64), documentId, otherProject.tabId, 3), /CONTEXT/u);
    assert.equal(otherProject.state.writes, 0);
  }
});

void test("PCB text lifecycle never dispatches after either awaited read changes project, branch, tab, frame or permission", async () => {
  const before = snapshot();
  type Fixture = ReturnType<typeof runtimeFixture>;
  const changes: ((fixture: Fixture) => void)[] = [
    (fixture) => { fixture.state.activeTab = "other"; }, (fixture) => { fixture.host.currentProject.projectId = "c".repeat(64); },
    (fixture) => { fixture.host.currentProject.branchUuid = "c".repeat(32); }, (fixture) => { fixture.frame.isConnected = false; },
    (fixture) => { fixture.attributes.set("src", "other"); }, (fixture) => { fixture.permission.isConcurrentStrictMode = true; },
    (fixture) => { fixture.frame.contentWindow.MSG_BUS_PCB.messageBus.rpcCall = (): Promise<{ message: unknown }> => Promise.resolve({ message: true }); },
    (fixture) => { fixture.frames.push({ ...fixture.frame }); },
  ];
  for (const operation of [create, remove]) {
    const run = runtimeFor(buildPcbTextLifecycleAdapter(operation, before, checkpoint(before)).code);
    for (const mutate of changes) {
      for (const phase of ["onSource", "onIdentity"] as const) {
        const fixture = runtimeFixture(before);
        fixture.state[phase] = (): void => { mutate(fixture); };
        await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /Standalone PCB text lifecycle refused/u);
        assert.equal(fixture.state.writes, 0);
      }
    }
  }
});

void test("PCB text lifecycle preserves an ACK before fallible post-write state and never retries ambiguous decoder outcomes", async () => {
  const before = snapshot();
  for (const operation of [create, remove]) {
    const adapter = buildPcbTextLifecycleAdapter(operation, before, checkpoint(before)), run = runtimeFor(adapter.code);
    const drift = runtimeFixture(before);
    drift.state.onDecode = (): void => { drift.host.currentProject.branchUuid = "changed-after-dispatch"; };
    assert.deepEqual(await run(drift.runtime, projectId, documentId, drift.tabId, 3), operation.action === "pcb.text.create" ? { primitiveId: adapter.createdId } : true);
    assert.equal(drift.state.writes, 1);
    for (const acknowledgment of [false, undefined, null, 1, { primitiveId: createdId }, "true"]) {
      const fixture = runtimeFixture(before); fixture.state.acknowledgment = acknowledgment;
      await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /acknowledgment:ACK/u);
      assert.equal(fixture.state.writes, 1);
      assert.deepEqual(parseDocumentSource(fixture.state.source), adapter.expected);
    }
    const rejected = runtimeFixture(before);
    rejected.state.onDecode = (): never => { throw new Error("private payload must not escape"); };
    await assert.rejects(run(rejected.runtime, projectId, documentId, rejected.tabId, 3), /dispatch:EXCEPTION$/u);
    assert.equal(rejected.state.writes, 1);
  }
});

void test("PCB text lifecycle runtime refuses baseline drift, malformed tickets and unknown source changes before dispatch", async () => {
  const before = snapshot();
  const adapter = buildPcbTextLifecycleAdapter(create, before, checkpoint(before));
  const run = runtimeFor(adapter.code);
  for (const source of [encode(change(before, peerId, { text: "different peer" })),
    encode(before).replace('"ticket":1}', '"ticket":-1}'), encode(before).replace('"ticket":1}', '"ticket":1.5}'),
    encode(before).replace('"ticket":1}', '"ticket":-0}'), encode(before).replace('"ticket":1}', '"ticket":1,"unknown":true}'),
    encode(before).replace('"ticket":1}', `"ticket":${Number.MAX_SAFE_INTEGER}}`)]) {
    const fixture = runtimeFixture(before); fixture.state.source = source;
    await assert.rejects(run(fixture.runtime, projectId, documentId, fixture.tabId, 3), /BASELINE|TICKET|EFFECT|SOURCE/u);
    assert.equal(fixture.state.writes, 0);
  }
  const after = expectedPcbTextLifecycleSource(create, before, { createdId });
  const scope = { projectUuid: projectId, branchUuid: branchId };
  for (const expected of [before, change(after, peerId, { text: "collateral" }), add(after, { id: "extra", type: "LINE", body: {} })]) {
    assert.throws(() => buildPcbTextLifecycleRuntime(before, expected, scope, createdId), /one exact STRING/u);
  }
  assert.throws(() => buildPcbTextLifecycleRuntime(before, after, scope, "4444444444444444"), /one exact STRING/u);
  assert.doesNotThrow(() => { assertPcbTextLifecycleSupported(create, before); });
});

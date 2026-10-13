import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { buildSymbolNativeAdapter, expectedSymbolSource, inverseSymbolOperation, verifySymbolSourceEffect } from "../src/symbol-action.ts";
import { buildSymbolReopenCode, buildSymbolSaveCode } from "../src/symbol-lifecycle.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "SYMBOL", uuid: "symbol", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...base, sha256: sha256Json(base) };
}
const before = snapshot([{ id: "part", type: "PART", body: { title: "A" } }, { id: "opaque", type: "FUTURE", body: { preserve: { nested: [0, false] } } },
  { id: "default-symbol", type: "ATTR", body: { partId: "part", parentId: "part", key: "Symbol", value: null, x: null, y: null, zIndex: 1 } }]);
const scope = { libraryUuid: "collection", metadataOwnerUuid: "owner", symbolUuid: "symbol", symbolName: "Fixture", partId: "part" };
const circle = { id: "circle", documentType: 2, action: "sch.circle.create", properties: { centerX: 5, centerY: 10, radius: 3, color: null, fillColor: null, lineWidth: 1, lineType: 0, fillStyle: "None" } };
function source(value: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify({ ...value.document, client: "a".repeat(16), updateTime: 1, version: "1" })}|\n${value.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
}
async function execute(code: string, options: { owner?: string; raw?: string; save?: boolean; metadata?: Record<string, unknown>; calls?: string[]; preferences?: string } = {}): Promise<{ result: unknown; calls: string[]; written: string | undefined }> {
  const calls: string[] = options.calls ?? [];
  let written: string | undefined;
  const tab = "symbol@collection";
  const listeners = new Map<string, (value: unknown) => void>();
  const timers = new Map<number, () => void>();
  let open = true, timerId = 0;
  const element = (): { tagName: string; isConnected: boolean; getAttribute: (key: string) => string | null } => ({
    tagName: "DIV", isConnected: true,
    getAttribute: (key) => { if (key === "c_dbid") { return tab; } return key === "c_doctype" ? "2" : null; },
  });
  let frame: ReturnType<typeof element> | null = element();
  const doc = { uuid: "symbol", tabId: "symbol@collection", isSymbolDoc: (): boolean => true, activePart: { partId: "part" },
    consistencyImpl: { getSourceCode: (): string => options.raw ?? source(before), setSourceCode: (value: string): Promise<boolean> => { calls.push("source"); written = value; return Promise.resolve(true); }, manager: { save: (): Promise<{ success: boolean }> => { calls.push("save"); return Promise.resolve({ success: options.save ?? true }); } } },
    shapeManager: { actionRunner: { run: async (fn: () => Promise<void>): Promise<boolean> => { calls.push("history"); await fn(); return true; } } },
  };
  const eda = {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "collection" }) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "symbol", tabId: "symbol@collection", documentType: 2, parentLibraryUuid: options.owner ?? "owner" }) },
    lib_Symbol: {
      get: (): never => { throw new Error("The public symbol getter changes title projection and must not run."); },
      openInEditor: (uuid: string, collection: string): Promise<string> => {
        assert.deepEqual([uuid, collection], ["symbol", "collection"]); assert.equal(open, false); assert.equal(frame, null);
        calls.push("open"); frame = element(); open = true; return Promise.resolve(tab);
      },
    },
    dmt_EditorControl: {
      closeDocument: (id: string): Promise<boolean> => {
        assert.equal(id, tab); calls.push("close");
        // The public result precedes native frame teardown and notification.
        setImmediate(() => {
          assert.ok(frame); frame.isConnected = false; frame = null; open = false;
          listeners.get("sch/SubTabbarMapRemove")?.("symbol");
        });
        return Promise.resolve(true);
      },
      openLibraryDocument: (): never => { throw new Error("The hanging symbol open route must not be used."); },
      activateDocument: (id: string): Promise<boolean> => { assert.equal(id, "symbol@collection"); calls.push("activate"); return Promise.resolve(true); },
    },
  };
  const gVars = { currentProject: { projectId: "collection" }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    if (topic === "getModelTabId") { assert.equal(args, tab); return Promise.resolve({ message: tab }); }
    if (topic === "isOpenTab") { assert.equal(JSON.stringify(args), JSON.stringify([tab])); return Promise.resolve({ message: open }); }
    assert.equal(topic, "/PrjDB/symbol/getData");
    assert.equal(JSON.stringify(args), JSON.stringify(["symbol", "collection"]));
    return Promise.resolve({ message: { uuid: "symbol", project_uuid: "collection", owner: { uuid: "owner" }, title: "fixture", display_title: "Fixture", ...options.metadata } });
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Model the native subscription callback and its cancellation contract.
  }, subscribe: (topic: string, callback: (value: unknown) => void): { cancel: () => void } => {
    assert.equal(topic, "sch/SubTabbarMapRemove"); assert.equal(listeners.has(topic), false); listeners.set(topic, callback);
    return { cancel: (): void => { listeners.delete(topic); } };
  } } };
  const ui = { document: { getElementById: (id: string): unknown => { assert.equal(id, `frame_${tab}`); return frame; } },
    localStorage: { getItem: (): string => options.preferences ?? '{"pcbCommandTab":true}' },
    setTimeout: (callback: () => void, delay: number): number => {
      assert.ok(delay === 15_000 || delay === 50); timerId += 1; const id = timerId; timers.set(id, callback);
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, node/callback-return -- Model the native timer callback after cancellation checks; its return value is unused.
      if (delay === 50) { setImmediate(() => { if (timers.delete(id)) { callback(); } }); }
      return id;
    },
    clearTimeout: (id: number): void => { timers.delete(id); },
  };
  try {
    const result: unknown = await runInNewContext(`(async()=>{${code}})()`, { eda, gVars, window: { top: ui }, SCH: { docMemoryManager: { getActiveDoc: () => doc } } });
    return { result, calls, written };
  } finally { assert.equal(listeners.size, 0); assert.equal(timers.size, 0); }
}

void test("symbol native geometry keeps exact scope, one history action, complete source and retained inverse identity", async () => {
  const adapter = buildSymbolNativeAdapter(circle, before, scope, { createdId: "b".repeat(16) });
  assert.ok(typeof adapter.createdId === "string");
  assert.equal(Object.hasOwn(adapter.expected.objects.find((entry) => entry.id === adapter.createdId)?.body ?? {}, "groupId"), false);
  const result = await execute(adapter.code);
  assert.deepEqual(result.calls, ["history", "source"]);
  assert.ok(typeof result.written === "string");
  assert.deepEqual(parseDocumentSource(result.written), adapter.expected);
  assert.equal(verifySymbolSourceEffect(circle, before, adapter.expected, { createdId: adapter.createdId }).added.length, 1);
  const inverse = inverseSymbolOperation(circle, before, { createdId: adapter.createdId });
  assert.ok(inverse);
  assert.deepEqual(expectedSymbolSource(inverse, adapter.expected), before);
  await assert.rejects(execute(adapter.code, { owner: "collection" }), /CONTEXT_DRIFT/u);
  await assert.rejects(execute(adapter.code, { raw: source(before).replace('"nested":[0,false]', '"nested":[]') }), /SOURCE_CHANGED/u);
  assert.throws(() => buildSymbolNativeAdapter(circle, before, { ...scope, partId: "other" }), /scope differ/u);
});

void test("symbol Save and close refuse unsafe preferences when a complete SCH-only tab registry is unavailable", async () => {
  for (const code of [buildSymbolSaveCode(before, scope), buildSymbolReopenCode(before, scope)]) {
    const calls: string[] = [];
    await assert.rejects(execute(code, { preferences: '{"pcbCommandTab":false}', calls }), /PCB_NAVIGATION_PREFERENCES_UNSAFE/u);
    assert.deepEqual(calls, []);
  }
});

void test("symbol guard preserves raw display title and rejects native asset identity drift before mutation", async () => {
  const adapter = buildSymbolNativeAdapter(circle, before, scope, { createdId: "b".repeat(16) });
  const result = await execute(adapter.code);
  assert.deepEqual(result.calls, ["history", "source"]);
  for (const metadata of [{ uuid: "other" }, { project_uuid: "other" }, { owner: { uuid: "other" } }, { display_title: "fixture" }]) {
    const calls: string[] = [];
    await assert.rejects(execute(adapter.code, { metadata, calls }), /SYMBOL_METADATA_DRIFT/u);
    assert.deepEqual(calls, []);
  }
});

void test("first symbol edit proves and retains exactly the loader's null Symbol attribute materialization", () => {
  const baseline = snapshot([...before.objects.filter((entry) => entry.id !== "default-symbol"),
    { id: "existing", type: "RECT", body: { partId: "part", locked: false, zIndex: 10 } },
  ]);
  const createdId = "b".repeat(16), expected = expectedSymbolSource(circle, baseline, { createdId });
  const materialized: NativeSourceObject = { id: "c".repeat(16), type: "ATTR", body: {
    x: null, y: null, rotation: null, color: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null,
    underline: null, align: null, value: null, keyVisible: null, valueVisible: null, key: "Symbol", fillColor: null,
    parentId: "part", zIndex: 11, partId: "part",
  } };
  const actual = snapshot([...expected.objects, materialized]);
  const proof = verifySymbolSourceEffect(circle, baseline, actual, { createdId });
  assert.deepEqual(proof.symbolMaterializations, [{ kind: "native-part-symbol-attribute", partId: "part", record: materialized }]);
  assert.equal(proof.added.length, 2);
  assert.equal(proof.changed.length, 0);
  assert.equal(proof.removed.length, 0);
  assert.notEqual(actual.sha256, expected.sha256);
  assert.equal(inverseSymbolOperation(circle, baseline, { createdId }), undefined);
  for (const patch of [{ value: "replacement" }, { x: 0 }, { zIndex: 12 }, { extra: null }]) {
    const altered = snapshot([...expected.objects, { ...materialized, body: { ...materialized.body, ...patch } }]);
    assert.throws(() => verifySymbolSourceEffect(circle, baseline, altered, { createdId }), /outside its exact typed effect/u);
  }
});

void test("symbol pin inventory, renumber, translated attributes and modify inverse remain exact", () => {
  const create = { id: "pin", documentType: 2, action: "sch.pin.create", properties: { x: 10, y: 20, rotation: 0, pinNumber: "1", pinName: "A", pinLength: 10, pinColor: null, pinShape: "None", pinType: "Passive" } };
  const created = expectedSymbolSource(create, before, { createdId: "c".repeat(16) });
  assert.equal(created.objects.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === "c".repeat(16)).length, 3);
  const modify = { id: "move", action: "sch.pin.modify", documentType: 2, target: { primitiveId: "c".repeat(16) }, patch: { x: 20, y: 30, pinNumber: "7", pinShape: "Inverted" } };
  const changed = expectedSymbolSource(modify, created);
  const inverse = inverseSymbolOperation(modify, created);
  assert.ok(inverse);
  assert.deepEqual(expectedSymbolSource(inverse, changed), created);
  const attr = changed.objects.find((entry) => entry.body["key"] === "Pin Number");
  assert.ok(attr);
  assert.equal(attr.body["value"], "7");
  assert.equal(attr.body["y"], -30);
  assert.throws(() => expectedSymbolSource({ id: "rename", action: "sch.attribute.modify", documentType: 2, target: { primitiveId: attr.id }, patch: { key: "Lost Number" } }, changed), /attribute inventory/u);
  assert.throws(() => expectedSymbolSource(create, created, { createdId: "d".repeat(16) }), /duplicate pin numbers/u);
  assert.throws(() => expectedSymbolSource({ ...modify, patch: { rotation: 90 } }, created), /owned-attribute rotation/u);
});

void test("symbol save does not close or claim persistence; separate reopening preserves collection/owner distinction", async () => {
  const save = await execute(buildSymbolSaveCode(before, scope));
  assert.deepEqual(save.calls, ["save"]);
  assert.equal(JSON.stringify(save.result), JSON.stringify({ ok: true, kind: "symbol-save-requested", saved: false }));
  await assert.rejects(execute(buildSymbolSaveCode(before, scope), { save: false }), /COMPILER_SAVE_FAILED/u);
  const reopen = await execute(buildSymbolReopenCode(before, scope));
  assert.deepEqual(reopen.calls, ["close", "open", "activate"]);
  assert.equal(JSON.stringify(reopen.result), JSON.stringify({ ok: true, saved: true, closed: true, reopened: true,
    closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
    openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: "symbol@collection", newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
    document: { uuid: "symbol", documentType: 2, tabId: "symbol@collection" } }));
});

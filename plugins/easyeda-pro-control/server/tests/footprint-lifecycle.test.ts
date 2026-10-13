import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { buildFootprintReopenCode, buildFootprintSaveCode } from "../src/footprint-lifecycle.ts";

const body = { docType: "PCB", uuid: "footprint", editVersion: "3.2.149.88089769" };
const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: body, objects: [{ id: "name", type: "ATTR", body: { key: "Footprint", value: "Test" } }] };
const expected = { ...base, sha256: sha256Json(base) };
const scope = { libraryUuid: "collection", metadataOwnerUuid: "owner", footprintUuid: "footprint", footprintName: "Test" };
const nativeSource = `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ ...body, client: "a".repeat(16), updateTime: 1, version: "1" })}|\n${JSON.stringify({ type: "ATTR", id: "name", ticket: 2 })}||${JSON.stringify(base.objects[0]?.body)}|\n`;

async function execute(code: string, options: { source?: string; owner?: string; saved?: boolean; activation?: boolean | null; driftAfterActivation?: boolean; preferences?: string; latePreferences?: string; calls?: string[] } = {}): Promise<{ result: unknown; calls: string[] }> {
  const calls: string[] = options.calls ?? [];
  let preferences = options.preferences ?? '{"pcbCommandTab":true}';
  const tabId = "footprint@collection";
  const listeners = new Map<string, (value: unknown) => void>();
  let open = true;
  const element = (): { tagName: string; isConnected: boolean; getAttribute: (key: string) => string | null } => ({
    tagName: "IFRAME", isConnected: true, getAttribute: (key) => { if (key === "c_dbid") { return tabId; } if (key === "c_doctype") { return "4"; } return null; },
  });
  let frame: ReturnType<typeof element> | null = element();
  const gVars = { currentProject: { projectId: scope.libraryUuid }, messageBus: {
    rpcCall: (method: string): Promise<unknown> => { assert.equal(method, "isOpenTab"); return Promise.resolve({ message: open }); },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Models the pinned native message-bus subscription contract.
    subscribe: (event: string, callback: (value: unknown) => void): { cancel: () => void } => {
      listeners.set(event, callback); return { cancel: () => { listeners.delete(event); } };
    },
  } };
  const eda = {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: scope.libraryUuid }) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: options.driftAfterActivation === true && calls.includes("activate") ? "other" : scope.footprintUuid, documentType: 4, tabId: "footprint@collection", parentLibraryUuid: options.owner ?? scope.metadataOwnerUuid }) },
    lib_Footprint: {
      get: (): Promise<unknown> => Promise.resolve({ uuid: scope.footprintUuid, libraryUuid: scope.metadataOwnerUuid, name: scope.footprintName, libraryType: "4" }),
      updateDocumentSource: (): never => assert.fail("Commit must not decode source or ignore the compiler save result"),
    },
    sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(options.source ?? nativeSource) },
    dmt_EditorControl: {
      closeDocument: (tab: string): Promise<boolean> => { assert.equal(tab, tabId); calls.push("close"); setImmediate(() => { assert.ok(frame); frame.isConnected = false; frame = null; open = false; listeners.get("sch/SubTabbarMapRemove")?.("footprint"); }); return Promise.resolve(true); },
      openLibraryDocument: (collection: string, type: string, uuid: string): Promise<string> => { assert.equal(collection, scope.libraryUuid); assert.equal(type, "4"); assert.equal(uuid, scope.footprintUuid); assert.equal(frame, null); assert.equal(open, false); frame = element(); open = true; calls.push("open-library"); return Promise.resolve(tabId); },
      activateDocument: (tab: string): Promise<boolean | null> => { assert.equal(tab, "footprint@collection"); calls.push("activate"); return Promise.resolve(options.activation === undefined ? true : options.activation); },
    },
  };
  const window = { top: { frames: [], document: { getElementById: (): unknown => frame },
    localStorage: { getItem: (): string => preferences },
    setTimeout: (callback: () => void, delay: number): NodeJS.Timeout => setTimeout(callback, delay === 15_000 ? 100 : 1), clearTimeout,
    MSG_BUS_PCB: { messageBus: { rpcCall: (method: string, value: unknown): Promise<unknown> => {
    if (method === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId: "footprint@collection", docType: 4 } }); }
    if (method === "FileSource") { preferences = options.latePreferences ?? preferences; return Promise.resolve({ message: options.source ?? nativeSource }); }
    assert.equal(method, "pcb/saveCompiler"); assert.equal(value, ""); calls.push("compiler-save"); return Promise.resolve({ message: { success: options.saved ?? true } });
  } } } } };
  const result: unknown = await runInNewContext(`(async () => { ${code} })()`, { eda, window, gVars });
  assert.equal(listeners.size, 0);
  return { result, calls };
}

void test("footprint source-save preserves raw native header but cannot claim persistence or close", async () => {
  const code = buildFootprintSaveCode(expected, scope);
  const result = await execute(code);
  assert.deepEqual(result.calls, ["compiler-save"]);
  assert.equal(JSON.stringify(result.result), JSON.stringify({ ok: true, kind: "footprint-save-requested", saved: false, compilerAcknowledgment: { success: true } }));
  await assert.rejects(execute(code, { source: nativeSource.replace('"value":"Test"', '"value":"Changed"') }), /changed before/u);
  await assert.rejects(execute(code, { owner: "collection" }), /scope drift/u);
  await assert.rejects(execute(code, { saved: false }), /not acknowledged/u);
});

void test("separate post-checkpoint footprint reopen uses exact collection and owner without another save", async () => {
  const result = await execute(buildFootprintReopenCode(expected, scope));
  assert.deepEqual(result.calls, ["close", "open-library", "activate"]);
  assert.equal(JSON.stringify(result.result), JSON.stringify({ ok: true, saved: true, closed: true, reopened: true,
    closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
    openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: "footprint@collection", newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
    document: { uuid: "footprint", documentType: 4, tabId: "footprint@collection" } }));
  await execute(buildFootprintReopenCode(expected, scope), { activation: false });
  await assert.rejects(execute(buildFootprintReopenCode(expected, scope), { activation: false, driftAfterActivation: true }), /NATIVE_LIFECYCLE_OPEN_TIMEOUT/u);
  await assert.rejects(execute(buildFootprintReopenCode(expected, scope), { activation: null }), /NATIVE_LIFECYCLE_ACTIVATE_CONTEXT/u);
});

void test("footprint preferences refuse before Save or close and are rechecked after the last source await", async () => {
  for (const code of [buildFootprintSaveCode(expected, scope), buildFootprintReopenCode(expected, scope)]) {
    const calls: string[] = [];
    await assert.rejects(execute(code, { preferences: '{"pcbCommandTab":false}', calls }), /PCB_NAVIGATION_PREFERENCES_UNSAFE/u);
    assert.deepEqual(calls, []);
  }
  const calls: string[] = [];
  await assert.rejects(execute(buildFootprintSaveCode(expected, scope), { latePreferences: '{}', calls }), /PCB_NAVIGATION_PREFERENCES_UNSAFE/u);
  assert.deepEqual(calls, []);
});

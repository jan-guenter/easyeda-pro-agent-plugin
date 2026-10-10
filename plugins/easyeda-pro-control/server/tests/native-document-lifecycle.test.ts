import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildNativeDocumentCloseFunction, buildNativeDocumentOpenFunction } from "../src/native-document-lifecycle.ts";
import type { NativeDocumentLifecycleScope } from "../src/native-document-lifecycle.ts";

async function fixture(documentType: 1 | 2 | 3 | 4, mode: "success" | "timeout" | "shared" | "wrong-owner" = "success"): Promise<{ result?: unknown; error?: unknown; calls: string[] }> {
  const calls: string[] = [], tab = "document@project";
  const scope: NativeDocumentLifecycleScope = { projectUuid: "project", documentUuid: "document", documentType,
    ...(documentType === 2 || documentType === 4 ? { metadataOwnerUuid: "owner" } : {}) };
  const listeners = new Map<string, (value: unknown) => void>();
  let timeout: (() => void) | undefined;
  let polls = 0, timerId = 0;
  const timers = new Map<number, () => void>();
  let open = true, owner = "owner";
  const element = (): { tagName: string; isConnected: boolean; getAttribute: (key: string) => string | null } => ({
    tagName: documentType <= 2 ? "DIV" : "IFRAME", isConnected: true,
    getAttribute: (key) => { if (key === "c_dbid") { return tab; } if (key === "c_doctype") { return String(documentType); } return null; },
  });
  let frame: ReturnType<typeof element> | null = element();
  const host = { currentProject: { projectId: "project" }, messageBus: {
    rpcCall: (method: string, argument: unknown): Promise<unknown> => {
      if (method === "getModelTabId") { assert.equal(argument, tab); return Promise.resolve({ message: mode === "shared" ? "alias@project" : tab }); }
      assert.equal(method, "isOpenTab"); assert.equal(JSON.stringify(argument), JSON.stringify([tab])); return Promise.resolve({ message: open });
    },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Models the pinned native message-bus subscription contract.
    subscribe: (event: string, callback: (value: unknown) => void): { cancel: () => void } => {
      assert.equal(listeners.has(event), false); listeners.set(event, callback);
      return { cancel: () => { listeners.delete(event); calls.push("cancel"); } };
    },
  } };
  const openDocument = (): Promise<string> => {
    calls.push("open-once"); assert.equal(open, false); assert.equal(frame, null);
    owner = "";
    setImmediate(() => {
      frame = element(); open = true;
      calls.push("frame-created");
      setImmediate(() => { owner = mode === "wrong-owner" ? "other-owner" : "owner"; calls.push("owner-ready"); });
    });
    return Promise.resolve(tab);
  };
  const environment = { gVars: host, window: { top: {
    document: { getElementById: (id: string): unknown => { assert.equal(id, `frame_${tab}`); return frame; } },
    setTimeout: (callback: () => void, delay: number): number => {
      assert.ok(delay === 15_000 || delay === 50);
      timerId += 1; const id = timerId; timers.set(id, callback);
      if (delay === 15_000) { timeout = callback; }
      else { setImmediate(() => { if (!timers.has(id)) { return; } timers.delete(id); polls += 1;
        if (mode === "wrong-owner" && polls >= 4) { timeout?.(); }
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Runs the browser timer callback supplied by the generated program.
        callback();
      }); }
      return id;
    },
    clearTimeout: (timer: number): void => { if (timers.get(timer) === timeout) { timeout = undefined; } timers.delete(timer); },
  } }, eda: {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "document", documentType, tabId: tab, parentLibraryUuid: owner }) },
    dmt_EditorControl: {
      closeDocument: (id: string): Promise<boolean> => {
        assert.equal(id, tab); calls.push("close-once");
        // Public close acknowledges now; native teardown finishes in a later
        // Task completion is later; an immediate reopen would still find the old tab and frame.
        setImmediate(() => {
          listeners.get("sch/SubTabbarMapRemove")?.("unrelated");
          if (mode === "timeout") { timeout?.(); return; }
          assert.ok(frame); frame.isConnected = false; frame = null; open = false;
          calls.push("native-close-finished"); listeners.get("sch/SubTabbarMapRemove")?.("document");
        });
        return Promise.resolve(true);
      },
      openDocument, openLibraryDocument: openDocument,
      activateDocument: (id: string): Promise<boolean> => { assert.equal(id, tab); calls.push("activate"); return Promise.resolve(false); },
    },
    lib_Symbol: { openInEditor: openDocument },
  } };
  const pending: unknown = runInNewContext(`(async()=>{const close=await (${buildNativeDocumentCloseFunction(scope)})('document@project');const opened=await (${buildNativeDocumentOpenFunction(scope)})('document@project');return {close,opened};})()`, environment);
  try { return { result: await pending, calls }; } catch (error) { return { error, calls }; }
  finally { assert.equal(listeners.size, 0); assert.equal(timeout, undefined); assert.equal(timers.size, 0); }
}

void test("all four editors wait for delayed teardown and exact new frame/owner, including ordinary schematic model mapping", async () => {
  for (const type of [1, 2, 3, 4] as const) {
    const result = await fixture(type);
    assert.equal(result.error, undefined);
    assert.deepEqual(result.calls, ["close-once", "native-close-finished", "cancel", "open-once", "frame-created", "activate", "owner-ready"]);
  }
});

void test("close timeout, shared model and changed library owner cannot become a reopened success", async () => {
  const timedOut = await fixture(4, "timeout");
  assert.match(String(timedOut.error), /NATIVE_LIFECYCLE_CLOSE_TIMEOUT/u);
  assert.deepEqual(timedOut.calls, ["close-once", "cancel"]);
  const shared = await fixture(1, "shared");
  assert.match(String(shared.error), /NATIVE_LIFECYCLE_SHARED_MODEL/u);
  assert.deepEqual(shared.calls, []);
  const wrongOwner = await fixture(2, "wrong-owner");
  assert.match(String(wrongOwner.error), /NATIVE_LIFECYCLE_OPEN_TIMEOUT/u);
  assert.equal(wrongOwner.calls.filter((call) => call === "open-once").length, 1);
});

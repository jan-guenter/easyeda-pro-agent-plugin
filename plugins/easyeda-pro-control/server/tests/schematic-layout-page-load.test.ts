import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildSchematicLayoutPageLoadCode } from "../src/schematic-layout-page-load.ts";

void test("page loading opens once, waits for native readiness and returns without saving; foreign pages refuse before open", async () => {
  const projectUuid = "a".repeat(64);
  const scope = { projectUuid, projectPath: "/project.eprj2", schematicUuid: "schematic", activePageUuid: "original",
    activeTabId: `original@${projectUuid}`, pageUuids: ["original", "target"] };
  for (const foreign of [false, true]) {
    const calls: string[] = [];
    let active = "original", current: string | undefined = "original";
    const doc = (uuid: string): { uuid: string; tabId: string; project_uuid: string; schematicUuid: string; isSchSheetDoc: () => boolean } => ({
      uuid, tabId: `${uuid}@${projectUuid}`, project_uuid: foreign ? "foreign" : projectUuid, schematicUuid: "schematic", isSchSheetDoc: () => true,
    });
    const docs = new Map([["original", doc("original")]]);
    const host = { currentProject: { projectId: projectUuid }, messageBus: {
      subscribe: (): { cancel: () => void } => ({ cancel: (): void => undefined }),
      rpcCall: (method: string, argument: unknown): Promise<unknown> => {
        if (method === "getModelTabId") { return Promise.resolve({ message: argument }); }
        assert.equal(method, "isOpenTab"); assert.ok(Array.isArray(argument));
        return Promise.resolve({ message: docs.has(String(argument[0]).split("@")[0] ?? "") });
      },
    } };
    const environment = { gVars: host, SCH: { gVars: host, docMemoryManager: {
      get: (uuid: string): unknown => docs.get(uuid), getSchDocs: (): unknown[] => [...docs.values()], getActiveDoc: (): unknown => docs.get(active),
    } }, window: { top: { setTimeout, clearTimeout, document: {
      getElementById: (id: string): unknown => {
        const tab = id.slice(6), uuid = tab.split("@")[0] ?? "";
        if (!docs.has(uuid)) { return null; }
        return { tagName: "DIV", isConnected: true, getAttribute: (key: string): string | null => {
          if (key === "c_dbid") { return tab; } if (key === "c_doctype") { return "1"; } return null;
        } };
      },
    } } }, eda: {
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: projectUuid }) },
      dmt_Schematic: { getCurrentSchematicInfo: (): Promise<unknown> => Promise.resolve({ uuid: "schematic", parentProjectUuid: projectUuid,
        page: scope.pageUuids.map((uuid) => ({ uuid, parentSchematicUuid: "schematic", parentProjectUuid: projectUuid })) }) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(current === undefined ? undefined :
        { uuid: current, documentType: 1, tabId: `${current}@${projectUuid}`, parentProjectUuid: projectUuid }) },
      dmt_EditorControl: {
        openDocument: (uuid: string): Promise<string> => {
          assert.equal(uuid, "target"); calls.push("open-target"); current = undefined;
          setImmediate(() => { docs.set(uuid, doc(uuid)); current = uuid; active = uuid; });
          return Promise.resolve(`${uuid}@${projectUuid}`);
        },
        activateDocument: (tab: string): Promise<boolean> => {
          const uuid = tab.split("@")[0] ?? ""; calls.push(`activate-${uuid}`); current = undefined;
          setImmediate(() => { current = uuid; active = uuid; });
          return Promise.resolve(true);
        },
      },
    } };
    const pending: unknown = runInNewContext(`(async()=>{${buildSchematicLayoutPageLoadCode(scope, "target")}})()`, environment);
    if (foreign) {
      await assert.rejects(async () => { await pending; }, /SCH_LAYOUT_PAGE_LOAD_SCOPE/u);
      assert.deepEqual(calls, []);
    } else {
      const result = await pending;
      assert.equal(JSON.stringify(result), JSON.stringify({ ok: true, profile: "easyeda-pro-control.schematic-layout-page-load.v1", pageUuid: "target",
        activePageUuid: "original", activeTabId: scope.activeTabId, loaded: true, returned: true, saved: false }));
      assert.deepEqual(calls, ["open-target", "activate-target", "activate-original"]);
      assert.equal(current, "original");
    }
  }
});

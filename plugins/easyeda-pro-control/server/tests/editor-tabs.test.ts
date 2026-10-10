import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildEditorTabsReadCode, parseEditorTabsRead } from "../src/editor-tabs.ts";

const projectUuid = "a".repeat(64);
async function execute(tree: unknown, drift = false): Promise<unknown> {
  let reads = 0;
  const eda = {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: projectUuid }) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      reads += 1;
      return Promise.resolve({ uuid: drift && reads > 1 ? "other" : "board", documentType: 3, tabId: `board@${projectUuid}`, parentProjectUuid: projectUuid });
    } },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve(tree), openDocument: (): never => assert.fail("Inspection cannot open a document"), closeDocument: (): never => assert.fail("Inspection cannot close a document") },
  };
  const value: unknown = await runInNewContext(`(async()=>{${buildEditorTabsReadCode(projectUuid)}})()`, { eda, TextEncoder });
  return value;
}
void test("editor-tab inspection preserves native missing/null fields and excludes titles and arbitrary tab data", async () => {
  const value = await execute({ id: "root", tabs: [
    { tabId: "tab_page1", isAbleDelete: false, title: "SECRET_TITLE", data: { doctype: -1 } },
    { tabId: `board@${projectUuid}`, documentType: 3, data: { doctype: 3, pid: projectUuid, owner: null, privateData: "SECRET_CONTENT" } },
  ] });
  const result = parseEditorTabsRead(value);
  assert.deepEqual(result.nodes[0]?.items[0]?.parentProjectUuid, { kind: "undefined" });
  assert.deepEqual(result.nodes[0]?.items[1]?.dataOwner, { kind: "null" });
  assert.deepEqual(result.nodes[0]?.items[1]?.dataPid, { kind: "string", value: projectUuid });
  assert.equal(JSON.stringify(result).includes("SECRET_"), false);
  assert.equal(result.nodes[0]?.tabCount, 2);
});
void test("editor-tab inspection rejects context drift and bounds recursive trees", async () => {
  await assert.rejects(execute({ id: "root", tabs: [] }, true), /EDITOR_TABS_CONTEXT_DRIFT/u);
  const tree: { children?: unknown[] } = {};
  tree.children = [tree];
  await assert.rejects(execute(tree), /EDITOR_TABS_TREE_BOUND/u);
});

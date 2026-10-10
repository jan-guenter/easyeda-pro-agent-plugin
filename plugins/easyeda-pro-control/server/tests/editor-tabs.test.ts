import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildEditorTabsReadCode, buildEditorTargetAbsentExpression, parseEditorTabsRead } from "../src/editor-tabs.ts";

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

function requireClosedTarget(tree: unknown): Promise<unknown> {
  const eda = { dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve(tree) } };
  const result: unknown = runInNewContext(buildEditorTargetAbsentExpression({ targetUuid: "symbol", projectUuid, ownerUuid: "owner",
    active: { uuid: "pcb", documentType: 3, tabId: "pcb" } }), { eda });
  return Promise.resolve(result);
}
void test("closed-target precondition walks every split screen and binds project/library ownership", async () => {
  await requireClosedTarget({ children: [
    { tabs: [{ tabId: "tab_page1", documentType: -1, isAbleDelete: false }, { tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid }] },
    { tabs: [{ tabId: `other@${projectUuid}`, data: { doctype: 2, owner: "owner" } }] },
  ] });
  for (const tab of [
    { tabId: "pcb", documentType: 3 },
    { tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid, data: { pid: "other" } },
    { tabId: `other@${projectUuid}`, documentType: 2, parentLibraryUuid: "owner", data: { owner: "other" } },
    { tabId: "other@foreign", documentType: 2, parentLibraryUuid: "owner" },
    { tabId: "pcb", documentType: 3, data: { doctype: 2, pid: projectUuid } },
  ]) { await assert.rejects(requireClosedTarget({ tabs: [tab] }), /OWNER_UNPROVEN|TAB_SHAPE/u); }
  await assert.rejects(requireClosedTarget({ tabs: [{ tabId: `symbol@${projectUuid}`, documentType: 2, parentLibraryUuid: "owner" }] }), /TARGET_ALREADY_OPEN/u);
});
void test("closed-target precondition requires the exact owned active tab in the inventory", async () => {
  for (const tree of [
    { tabs: [] },
    { tabs: [{ tabId: "tab_page1", documentType: -1, isAbleDelete: false }] },
    { tabs: [{ tabId: "other", documentType: 3, parentProjectUuid: projectUuid }] },
    { tabs: [{ tabId: "pcb", documentType: 1, parentProjectUuid: projectUuid }] },
    { tabs: [{ tabId: `pcb@${projectUuid}`, documentType: 3, parentProjectUuid: projectUuid }] },
    { children: [{ tabs: [] }, { tabs: [{ tabId: `other@${projectUuid}`, documentType: 2, parentLibraryUuid: "owner" }] }] },
    { children: [{ tabs: [{ tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid }] }, { tabs: [] }] },
  ]) { await assert.rejects(requireClosedTarget(tree), /ACTIVE_UNPROVEN|INCOMPLETE/u); }
});
void test("closed-target precondition refuses malformed, cyclic, oversized and duplicate trees", async () => {
  const cycle: { children?: unknown[] } = {}; cycle.children = [cycle];
  for (const tree of [undefined, null, {}, { tabs: [] , children: [] }, { tabs: [null] }, cycle, { children: Array.from({ length: 129 }, () => ({ tabs: [] })) },
    { tabs: Array.from({ length: 257 }, () => ({ tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid })) },
    { tabs: [{ tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid }, { tabId: "pcb", documentType: 3, parentProjectUuid: projectUuid }] }]) {
    await assert.rejects(requireClosedTarget(tree), /TREE_BOUND|TREE_SHAPE|TAB_SHAPE/u);
  }
});

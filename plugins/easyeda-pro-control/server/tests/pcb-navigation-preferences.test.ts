import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { PCB_NAVIGATION_PREFERENCE_GUARD } from "../src/pcb-navigation-preferences.ts";

const scope = { projectUuid: "project", documentUuid: "document", documentType: 1 };
const activeTab = "document@project";
const refusal = /PCB_NAVIGATION_PREFERENCES_UNSAFE/u;
function evaluate(expression: string, environment: object): unknown {
  const result: unknown = runInNewContext(`(()=>{${PCB_NAVIGATION_PREFERENCE_GUARD};${expression}})()`, environment);
  return result;
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the inferred mutable synthetic registry used for adversarial substitutions.
function fixture(text: unknown = '{"pcbCommandTab":true}') {
  const reads: string[] = [], writes: string[] = [];
  const tab = { tabId: activeTab, data: { doctype: 1, pid: "project" } };
  const tabBar = { containerIds: ["main"], containerTree: { id: "main" }, getActiveTab: (): string => activeTab,
    getFilterTabs: (excluded: unknown[]): unknown[] => { assert.deepEqual(structuredClone(excluded), []); return [tab]; } };
  const environment = { gVars: { currentProject: { projectId: "project" } }, UI: { tabBar }, window: { top: { localStorage: {
    getItem: (key: string): unknown => { reads.push(key); return text; },
    setItem: (): never => { writes.push("write"); assert.fail("The guard is passive."); },
  } } } };
  return { environment, tabBar, tab, reads, writes };
}
const lifecycle = `assertPcbLifecyclePreferences(${JSON.stringify(scope)},${JSON.stringify(activeTab)});return true;`;

void test("passive preference admission requires the exact own boolean true and never leaks stored values", () => {
  const safe = fixture('{"pcbCommandTab":true,"private":"never returned"}');
  assert.equal(evaluate("assertPcbNavigationPreferences();return true;", safe.environment), true);
  assert.deepEqual(safe.reads, ["preferences"]); assert.deepEqual(safe.writes, []);
  for (const value of [null, undefined, 1, false, "", "{", "null", "[]", "false", "{}", '{"pcbCommandTab":false}',
    '{"pcbCommandTab":1}', '{"pcbCommandTab":"true"}', '{"pcbCommandTab":null}', " ".repeat(1_048_577)]) {
    const bad = fixture(value);
    // Passing undefined explicitly selects the helper's default; remove the API instead.
    if (value === undefined) { Object.defineProperty(bad.environment.window.top, "localStorage", { value: undefined }); }
    assert.throws(() => evaluate("assertPcbNavigationPreferences();", bad.environment), refusal);
    assert.deepEqual(bad.writes, []);
  }
  const throwing = fixture();
  Object.defineProperty(throwing.environment.window.top, "localStorage", { get: (): never => { throw new Error("private-storage-error"); } });
  assert.throws(() => evaluate("assertPcbNavigationPreferences();", throwing.environment), { message: "PCB_NAVIGATION_PREFERENCES_UNSAFE" });
});

void test("only the bounded complete owned SCH-only registry exempts Save/close from preference access", () => {
  const scene = fixture('{}');
  assert.equal(evaluate(lifecycle, scene.environment), true);
  assert.deepEqual(scene.reads, []);
  const symbol = { ...scope, documentType: 2, metadataOwnerUuid: "owner" };
  scene.tab.data = { ...scene.tab.data, doctype: 2 };
  Object.assign(scene.tab.data, { owner: "owner" });
  assert.equal(evaluate(`assertPcbLifecyclePreferences(${JSON.stringify(symbol)},${JSON.stringify(activeTab)});return true;`, scene.environment), true);
  assert.deepEqual(scene.reads, []);
});

void test("PCB peers, hidden types, malformed ownership and incomplete registry all require safe preferences", () => {
  const mutations: ((scene: ReturnType<typeof fixture>) => void)[] = [
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "pcb@project", data: { doctype: 3, pid: "project" } }]; },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "footprint@project", isDisplayNone: true, data: { doctype: 4, owner: "owner" } }]; },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "future", data: { doctype: 99 } }]; },
    (scene) => { scene.tab.data.pid = "foreign"; },
    (scene) => { Object.assign(scene.tab, { documentType: 3 }); },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, scene.tab]; },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => []; },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "0", data: { doctype: 0 } }]; },
    (scene) => { scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "tab_page1", data: { doctype: -1, owner: "other" }, isAbleDelete: false }]; },
    (scene) => { scene.tabBar.getActiveTab = (): string => "other"; },
    (scene) => { scene.tabBar.containerIds = ["main", "missing"]; },
    (scene) => { scene.tabBar.containerIds = ["main", "main"]; },
    (scene) => { scene.tabBar.containerIds = []; },
    (scene) => { Object.assign(scene.tabBar.containerTree, { children: [] }); },
    (scene) => { Object.assign(scene.tabBar.containerTree, { children: [scene.tabBar.containerTree] }); },
    (scene) => { scene.environment.gVars.currentProject.projectId = "foreign"; },
    (scene) => { Object.assign(scene.environment, { top: { UI: { tabBar: scene.tabBar } } }); },
  ];
  for (const mutate of mutations) {
    const refused = fixture('{}'); mutate(refused);
    assert.throws(() => evaluate(lifecycle, refused.environment), refusal);
    assert.deepEqual(refused.writes, []);
    const safe = fixture(); mutate(safe);
    assert.equal(evaluate(lifecycle, safe.environment), true);
    assert.deepEqual(safe.reads, ["preferences"]);
  }
});

void test("an independently guarded SCH-only state is re-evaluated, not cached across a new PCB peer", () => {
  const scene = fixture('{}');
  assert.equal(evaluate(lifecycle, scene.environment), true);
  scene.tabBar.getFilterTabs = (): unknown[] => [scene.tab, { tabId: "pcb@project", data: { doctype: 3, pid: "project" } }];
  assert.throws(() => evaluate(lifecycle, scene.environment), refusal);
});

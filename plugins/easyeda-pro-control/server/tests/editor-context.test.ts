import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildEditorContextProgram, editorContextResultSchema, parseEditorContextRequest, queryEditorContext, validateEditorContextArguments, validateEditorContextResult } from "../src/editor-context.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const request = { action: "observe-editor-context" };
const branchUuid = "b".repeat(32), projectUuid = "a".repeat(32);

function environment(setup = "", onContainer = ""): { run: () => Promise<Record<string, unknown>>; evaluate: (source: string) => unknown } {
  const context = createContext({ TextEncoder, queueMicrotask });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};
globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.start={tabId:'tab_page1',isAbleDelete:false,group:'start_blank',draggable:true,data:{doctype:-1},isDisplayNone:false};
globalThis.placeholder={tabId:'0',isDisplayNone:true,isAbleDelete:false,draggable:false,group:'start_blank',data:{doctype:0}};
globalThis.container={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
globalThis.calls=0;class Tabs {
 static getActiveTab(){if(this!==Tabs)throw new Error('PRIVATE_RECEIVER');return Tabs.currentTabId||'';}
 static getContainerInfo(id){if(this!==Tabs||id!==container.id)throw new Error('PRIVATE_RECEIVER');calls++;${onContainer}return container;}
}
Tabs.currentTabId='tab_page1';Tabs.belongContainer='editor-window-main';Tabs.containerIds=['editor-window-main'];Tabs.containerTree={id:'editor-window-main'};
globalThis.UI={gVars,tabBar:Tabs};
globalThis.activate=(tab)=>{container.tabs.push(tab);container.activeTabId=tab.tabId;Tabs.currentTabId=tab.tabId;};
${setup}`, context, { timeout: 1000 });
  return {
    run: async (): Promise<Record<string, unknown>> => {
      const raw: unknown = await runInContext(`(async()=>{${buildEditorContextProgram(request)}})()`, context, { timeout: 1000 });
      return validateEditorContextResult(request, decodeExactReadEnvelope(raw));
    },
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

function ordinary(documentType = 3, uuid = "c".repeat(16)): string {
  return `gVars.currentProject={projectId:'${projectUuid}',branchUuid:'${branchUuid}'};
globalThis.target={tabId:'${uuid}@${projectUuid}',data:{doctype:${String(documentType)},pid:'${projectUuid}'}};activate(target);`;
}

void test("editor context preserves native missing-field forms and distinguishes active sentinels", async () => {
  const initial = await environment().run();
  assert.deepEqual(initial["active"], { state: "start-page" });
  assert.deepEqual(initial["project"], { state: "undefined" });
  assert.deepEqual(initial["branch"], { state: "empty" });
  const closed = await environment("gVars.currentProject={};container.tabs=[];container.activeTabId='';Tabs.currentTabId='';").run();
  assert.deepEqual(closed["active"], { state: "none" });
  assert.deepEqual(closed["project"], { state: "absent" });
  assert.deepEqual(closed["branch"], { state: "absent" });
  const placeholder = await environment(`gVars.currentProject={projectId:'${projectUuid}'};activate(placeholder);`).run();
  assert.deepEqual(placeholder["active"], { state: "placeholder" });
  assert.deepEqual(placeholder["project"], { state: "value", value: projectUuid });
  assert.deepEqual(placeholder["branch"], { state: "absent" });
  const undefinedBranch = await environment("gVars.currentProject.branchUuid=undefined;").run();
  assert.deepEqual(undefinedBranch["branch"], { state: "undefined" });
});

void test("editor context projects ordinary PCB and schematic identities without reading unrelated payloads", async () => {
  for (const [documentType, uuid] of [[3, "c".repeat(16)], [1, "d".repeat(32)]] as const) {
    const fixture = environment(`${ordinary(documentType, uuid)}
Object.defineProperty(target,'title',{get(){throw new Error('PRIVATE_TITLE');}});
Object.defineProperty(target.data,'owner',{get(){throw new Error('PRIVATE_OWNER');}});
Object.defineProperty(gVars.currentProject,'settings',{get(){throw new Error('PRIVATE_SETTINGS');}});
container.tabs.push({tabId:'PRIVATE_OTHER',get data(){throw new Error('PRIVATE_DATA');}});`);
    const result = await fixture.run();
    assert.equal(fixture.evaluate("calls"), 2);
    assert.deepEqual(result["active"], { state: "document", documentType, documentUuid: uuid, projectUuid, tabId: `${uuid}@${projectUuid}` });
    assert.deepEqual(result["branch"], { state: "value", value: branchUuid });
    assert.equal(JSON.stringify(result).includes("PRIVATE_"), false);
    for (const key of ["visibilityVerified", "inputFocusVerified", "restorationCompletionVerified", "projectClosureVerified", "startupQualified", "cadAuthority", "persistenceVerified"]) {
      assert.equal(result[key], false);
    }
  }
});

void test("editor context explicitly reports unsupported active kinds and path-bearing IDs without leaking them", async () => {
  const library = await environment("activate({tabId:'PRIVATE_SYMBOL@PRIVATE_PATH',data:{doctype:2,get owner(){throw new Error('PRIVATE_OWNER');}}});").run();
  assert.deepEqual(library["active"], { state: "unsupported", reason: "document-type" });
  const path = await environment("activate({tabId:'PRIVATE_DOCUMENT@PRIVATE_PATH',data:{doctype:3,get pid(){throw new Error('PRIVATE_PID');}}});").run();
  assert.deepEqual(path["active"], { state: "unsupported", reason: "tab-identity" });
  assert.equal(JSON.stringify([library, path]).includes("PRIVATE_"), false);
});

void test("editor context refuses partial, accessor-backed or inconsistent active identity with fixed errors", async () => {
  for (const setup of [
    "activate({tabId:'PRIVATE_UNINITIALIZED'});",
    `${ordinary()}target.data.pid='${"e".repeat(32)}';`,
    `${ordinary()}Object.defineProperty(target.data,'doctype',{get(){throw new Error('PRIVATE_GETTER');}});`,
    "Object.defineProperty(gVars.currentProject,'branchUuid',{get(){throw new Error('PRIVATE_GETTER');}});",
    "gVars.currentProject.projectId=null;",
    `gVars.currentProject.branchUuid='${branchUuid}';`,
  ]) { await assert.rejects(environment(setup).run(), { message: "EDITOR_CONTEXT_READ_FAILED" }); }
});

void test("editor context retains active/project owners and even unsupported type observations across samples", async () => {
  for (const change of ["gVars.currentProject={...gVars.currentProject};", "target.data={...target.data};", "target.data.doctype=1;"]) {
    await assert.rejects(environment(ordinary(), `if(calls===1)queueMicrotask(()=>{${change}});`).run(), { message: "EDITOR_CONTEXT_READ_FAILED" });
  }
  await assert.rejects(environment("globalThis.target={tabId:'PRIVATE_TAB',data:{doctype:2}};activate(target);",
    "if(calls===1)queueMicrotask(()=>{target.data.doctype=4;});").run(), { message: "EDITOR_CONTEXT_READ_FAILED" });
});

void test("editor context discovery and result schemas reject caller code, fabricated claims and contradictory IDs", async () => {
  assert.equal(validateEditorContextArguments(request)["valid"], true);
  assert.equal(validateEditorContextArguments(request)["executionAuthorized"], false);
  assert.equal(queryEditorContext({ includeSchemas: true })["invocationEnabledByDiscovery"], false);
  for (const input of [{ ...request, method: "getProjectInfo" }, { action: "observe-editor-shell" }]) {
    assert.throws(() => parseEditorContextRequest(input)); assert.throws(() => buildEditorContextProgram(input));
  }
  assert.throws(() => queryEditorContext({ code: "PRIVATE" }));
  const result = await environment(ordinary()).run();
  const raw = { ok: result["ok"], kind: result["kind"], action: result["action"], active: result["active"], project: result["project"], branch: result["branch"],
    visibilityVerified: false, inputFocusVerified: false, restorationCompletionVerified: false, projectClosureVerified: false,
    startupQualified: false, cadAuthority: false, persistenceVerified: false };
  assert.equal(editorContextResultSchema.safeParse(raw).success, true);
  for (const bad of [{ ...raw, cadAuthority: true }, { ...raw, project: { state: "absent" } },
    { ...raw, active: { state: "document", documentType: 3, documentUuid: "e".repeat(16), projectUuid, tabId: `${"c".repeat(16)}@${projectUuid}` } },
    { ...raw, active: { state: "unsupported", reason: "tab-identity", tabId: "PRIVATE_PATH" } }, { ...raw, title: "PRIVATE_TITLE" }]) {
    assert.equal(editorContextResultSchema.safeParse(bad).success, false);
    assert.throws(() => validateEditorContextResult(request, bad));
  }
});

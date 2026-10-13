import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildEditorShellProgram, editorShellResultSchema, parseEditorShellRequest, queryEditorShell, validateEditorShellArguments, validateEditorShellResult } from "../src/editor-shell.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const request = { action: "observe-editor-shell" };

function environment(before = "", onContainer = ""): { run: () => Promise<unknown>; evaluate: (source: string) => unknown } {
  const context = createContext({ TextEncoder, queueMicrotask });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.gVars={};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.start={title:'Start Page',tabId:'tab_page1',icon:{iconClassName:'icon-eda-logo'},tabStyle:{width:'auto',minWidth:'76px'},isAbleDelete:false,group:'start_blank',draggable:true,data:{doctype:-1},isDisplayNone:false};
globalThis.placeholder={tabId:'0',title:'PRIVATE_PROJECT_TITLE',icon:{iconClassName:'icon-eda-project-fill'},isDisplayNone:true,tabStyle:{width:'115px'},isAbleDelete:false,draggable:false,group:'start_blank',data:{doctype:0}};
globalThis.containers={'editor-window-main':{id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'}};
globalThis.calls=0;class Tabs {
 static getActiveTab(){if(this!==Tabs)throw new Error('PRIVATE_RECEIVER');return Tabs.currentTabId||'';}
 static getContainerInfo(id){if(this!==Tabs)throw new Error('PRIVATE_RECEIVER');calls++;${onContainer}return containers[id];}
}
Tabs.currentTabId='tab_page1';Tabs.belongContainer='editor-window-main';Tabs.containerIds=['editor-window-main'];Tabs.containerTree={id:'editor-window-main',width:1,height:1};
globalThis.UI={gVars,tabBar:Tabs};${before}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildEditorShellProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

void test("editor shell observes exact native Start Page and placeholder shapes without reading private tab payloads", async () => {
  const fixture = environment(`containers['editor-window-main'].tabs.push(placeholder,{tabId:'PRIVATE_DOCUMENT_ID',get title(){throw new Error('PRIVATE_TITLE');},get data(){throw new Error('PRIVATE_DATA');}});
Object.defineProperty(start,'title',{get(){throw new Error('PRIVATE_START_TITLE');}});
Object.defineProperty(placeholder,'title',{get(){throw new Error('PRIVATE_PROJECT_TITLE');}});`);
  const result = validateEditorShellResult(request, decodeExactReadEnvelope(await fixture.run()));
  assert.equal(fixture.evaluate("calls"), 2);
  assert.equal(result["containerCount"], 1); assert.equal(result["tabCount"], 3);
  assert.equal(result["startPagePresent"], true); assert.equal(result["startPageActive"], true);
  assert.equal(result["placeholderTabCount"], 1); assert.equal(result["otherTabCount"], 1);
  for (const key of ["visibilityVerified", "restorationCompletionVerified", "projectClosureVerified", "startupQualified", "cadAuthority", "persistenceVerified"]) {
    assert.equal(result[key], false);
  }
  assert.equal(JSON.stringify(result).includes("PRIVATE_"), false);
  assert.equal(JSON.stringify(result).includes("editor-window-main"), false);
});

void test("editor shell binds complete split-container membership and distinguishes empty from missing state", async () => {
  const split = environment(`Tabs.containerIds=['left','right'];Tabs.containerTree={id:'editor-window-main',direction:'row',children:[{id:'left'},{id:'right'}]};
containers={left:{id:'left',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'},right:{id:'right',belong:'editor-window-main',tabs:[{tabId:'PRIVATE_OTHER'}],activeTabId:'PRIVATE_OTHER'}};Tabs.currentTabId='PRIVATE_OTHER';`);
  const result = validateEditorShellResult(request, decodeExactReadEnvelope(await split.run()));
  assert.equal(result["containerCount"], 2); assert.equal(result["tabCount"], 2);
  assert.equal(result["startPagePresent"], true); assert.equal(result["startPageActive"], false);
  const empty = environment("containers['editor-window-main'].tabs=[];containers['editor-window-main'].activeTabId='';Tabs.currentTabId='';");
  const emptyResult = validateEditorShellResult(request, decodeExactReadEnvelope(await empty.run()));
  assert.equal(emptyResult["tabCount"], 0); assert.equal(emptyResult["startPagePresent"], false); assert.equal(emptyResult["activeTabPresent"], false);
  await assert.rejects(environment("delete containers['editor-window-main'];").run(), { message: "EDITOR_SHELL_READ_FAILED" });
});

void test("editor shell refuses owner drift, mismatched membership, malformed sentinels and bounds with fixed errors", async () => {
  const changed = environment("", "if(calls===1)queueMicrotask(()=>{containers['editor-window-main'].tabs=[{...start}];});");
  await assert.rejects(changed.run(), { message: "EDITOR_SHELL_READ_FAILED" });
  for (const setup of [
    "Tabs.containerTree={id:'editor-window-main',children:[{id:'missing'}]};",
    "containers['editor-window-main'].tabs.push(start);",
    "start.data.doctype=0;",
    "containers['editor-window-main'].tabs.push({...placeholder,draggable:true});",
    "containers['editor-window-main'].tabs=Array.from({length:257},(_,i)=>({tabId:'other'+i}));",
    "Object.defineProperty(start,'tabId',{get(){throw new Error('PRIVATE_GETTER');}});",
    "globalThis.top={};",
  ]) { await assert.rejects(environment(setup).run(), { message: "EDITOR_SHELL_READ_FAILED" }); }
});

void test("editor shell schemas admit only the literal observation and consistent authority-free counts", async () => {
  assert.equal(validateEditorShellArguments(request)["valid"], true);
  assert.equal(validateEditorShellArguments(request)["executionAuthorized"], false);
  for (const input of [{ ...request, path: "private" }, { action: "launch" }]) {
    assert.throws(() => parseEditorShellRequest(input)); assert.throws(() => buildEditorShellProgram(input));
  }
  assert.equal(queryEditorShell({ includeSchemas: true })["invocationEnabledByDiscovery"], false);
  assert.throws(() => queryEditorShell({ topic: "other" }));
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object");
  for (const bad of [{ ...raw, tabCount: 2 }, { ...raw, startupQualified: true }, { ...raw, cadAuthority: true },
    { ...raw, title: "PRIVATE_TITLE" }, { ...raw, activeTabPresent: false }]) {
    assert.equal(editorShellResultSchema.safeParse(bad).success, false);
    assert.throws(() => validateEditorShellResult(request, bad));
  }
});

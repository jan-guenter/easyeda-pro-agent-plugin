import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_LAYERS_FUNCTION, decodeCurrentPcb209LayersReply } from "../src/current-pcb-209-layers.ts";
import { sha256Text } from "../src/core.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, diagnosticLayers209Params, diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { currentPcb209OpeningRequestSchema } from "../src/current-pcb-209-opening-validation.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";

const path = String.raw`C:\Reviewed\LayerFixture.eprj2`;
const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
function row(layerId = 1, type = "TOP", layerStatus = 1): Record<string, unknown> {
  return { layerId, type, name: "Layer", order: layerId, activeColor: "#a.492f", activeColorAlpha: 1,
    deactiveColor: "#800000", deactiveColorAlpha: 0.333333, visible: true, locked: false, active: layerId === 1, layerStatus };
}
function fixture(rows: unknown[] = [row()], afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<unknown>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.layerReads=0;
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||arg!==undefined||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();if(topic==="pcb/extensionAPI/pcblayer-getAllLayers")layerReads++;else if(topic!=="getTabIdAndDocType")throw new Error("PRIVATE_TOPIC");${afterCall}return {message:topic==="getTabIdAndDocType"?identity:rows};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};globalThis.location={href:"https://client/editor?entry=pcb"};${childBefore}`, child);
  const context = createContext({ child: runInContext("globalThis", child) as unknown, TextEncoder, setTimeout, clearTimeout });
  runInContext(`globalThis.sealed=${JSON.stringify(target)};globalThis.tabId=sealed.documentUuid+"@"+sealed.projectUuid;
globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:"https://client/editor?cll=warn#id="+sealed.projectUuid+",tab=*"+tabId,origin:"https://client"};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";
globalThis.tab={tabId,data:{doctype:3,pid:sealed.projectUuid}};globalThis.activeTab=tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:sealed.projectUuid,branchUuid:sealed.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.attributes={c_dbid:tabId,c_doctype:"3",src:"editor?entry=pcb","pcb-canvas":"true"};
globalThis.frame={tagName:"IFRAME",id:"frame_"+tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==="editframe";}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==="uuid"?tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;${before}`, context);
  return { run: async (): Promise<unknown> => {
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_LAYERS_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending;
    return decodeCurrentPcb209LayersReply({ result: { type: "string", value } }, target);
  }, childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 original layer program retains cross-realm RPC and projects two matching samples without current-layer authority", async () => {
  const rows = [row(), row(2, "BOTTOM"), row(3, "SIGNAL", 2), row(4, "PLANE"), row(5, "SIGNAL", 0)];
  const value = fixture(rows);
  const result = await value.run();
  assert.ok(result !== null && typeof result === "object");
  assert.deepEqual(Reflect.get(result, "nativeLayers"), rows);
  assert.equal(Reflect.get(result, "copperLayerCount"), 4);
  assert.equal(value.childRead("calls"), 6); assert.equal(value.childRead("layerReads"), 2);
  assert.equal(Reflect.get(result, "samples"), 2);
  const layers: unknown = Reflect.get(result, "layers"); assert.ok(Array.isArray(layers));
  assert.deepEqual(layers[0], { id: 1, name: "Layer", type: "SIGNAL", color: "#a.492f", transparency: 0,
    inactiveColor: "#800000", inactiveTransparency: 66.67, layerStatus: 1, locked: false });
  for (const field of ["startupCompletionVerified", "completeLiveBaselineVerified", "physicalStackVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) {
    assert.equal(Reflect.get(result, field), false);
  }
  assert.equal(Object.isFrozen(result), true);
});

void test("209 layer reader rejects changed receiver, frame, identity and every returned row field", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:rows});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';",
    "if(layerReads===2)rows[0].visible=false;", "if(layerReads===2)rows[0].active=false;", "if(layerReads===2)rows[0].order++;",
    "if(layerReads===2)rows[0].activeColor='#new';", "if(layerReads===2)rows[0].layerStatus=2;"]) {
    const value = fixture([row()], mutation);
    await assert.rejects(value.run(), /PCB209_LAYERS_REFUSED/u);
    assert.ok(Number(value.childRead("calls")) <= 6);
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];"]) {
    const value = fixture([row()], "", before); await assert.rejects(value.run(), /PCB209_LAYERS_REFUSED/u);
    assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 layer reader refuses malformed, oversized, accessor and failed samples without partial output", async () => {
  for (const rows of [[], [row(), row()], [{ ...row(), name: "x".repeat(1025) }], [{ ...row(), extra: true }],
    [{ ...row(), activeColorAlpha: 2 }], Array.from({ length: 100 }, (_, index) => ({ ...row(index + 1), name: "x".repeat(1024) }))]) {
    await assert.rejects(fixture(rows).run(), /PCB209_LAYERS_REFUSED/u);
  }
  for (const childBefore of ["rows[0].order=-0;", "rows[0].order=NaN;", "Object.defineProperty(rows[0],'name',{get(){throw new Error('PRIVATE');}});",
    "Bus.prototype.rpcCall=async()=>({message:undefined});", "Bus.prototype.rpcCall=async()=>{throw new Error('PRIVATE_PATH');};"]) {
    await assert.rejects(fixture([row()], "", "", childBefore).run(), /PCB209_LAYERS_REFUSED/u);
  }
});

void test("209 fixed command is native-reconstructed, phase-bound and absent from legacy grammar", async () => {
  const bound = { operationId: "pcb209-layers", expectedBindingSha256: "a".repeat(64) };
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "observe-layers", ...bound }).success, true);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ action: "observe-layers", ...bound }).success, false);
  for (const extra of [{ target }, { code: "x" }, { method: "eda.pcb_Layer.getCurrentLayer" }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "observe-layers", ...bound, ...extra }).success, false);
  }
  const command = { id: 54, method: "Runtime.callFunctionOn", params: diagnosticLayers209Params("ui-original", target), sessionId: "session-original" };
  const request = diagnosticNativeRequest(wire(command));
  assert.equal(request["pcbLayers209Phase"], "observe");
  assert.equal(request["uniqueContextId"], "ui-original"); assert.equal(request["functionDeclaration"], undefined);
  assert.equal(DIAGNOSTIC_REQUEST_LIMIT, 103);
  for (const params of [{ ...command.params, functionDeclaration: "async()=>1" }, { ...command.params, throwOnSideEffect: true },
    { ...command.params, arguments: [{ value: target }, { value: "open-document" }] }]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...command, params })));
  }
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(/const string Layers209Function=@"((?:""|[^"])*)";/u.exec(native)?.[1]?.replaceAll('""', '"'), CURRENT_PCB_209_LAYERS_FUNCTION);
  assert.ok(native.includes('if(!layers209 || stringPrecreate || workerStartup) throw Error("layers209-purpose")'));
  assert.ok(native.includes("if (-not $Layers209) {throw 'pcb-diagnostic-layers209-purpose'}"));
  assert.equal(native.includes("$request.functionDeclaration"), false);
});

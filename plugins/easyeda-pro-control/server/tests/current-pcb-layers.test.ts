import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentPcbLayersProgram, parseCurrentPcbLayersRequest, queryCurrentPcbLayers,
  validateCurrentPcbLayersArguments, validateCurrentPcbLayersResult } from "../src/current-pcb-layers.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const request = { method: "eda.pcb_Layer.getAllLayers", arguments: {}, target };
function row(layerId = 1, type = "TOP", layerStatus = 1): Record<string, unknown> {
  return { layerId, type, name: "Top", order: layerId, activeColor: "#a.492f", activeColorAlpha: 1,
    deactiveColor: "#800000", deactiveColorAlpha: 0.333333, visible: true, locked: false, active: layerId === 1, layerStatus };
}

interface Options { before?: string; beforeChild?: string; afterCall?: string; fastDeadline?: boolean; input?: typeof request; }
function environment(rows: unknown[] = [row()], options: Options = {}): {
  run: () => Promise<unknown>; evaluate: (source: string) => unknown; evaluateChild: (source: string) => unknown;
} {
  const input = options.input ?? request;
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.ok(topic === "getTabIdAndDocType" || topic === "pcb/extensionAPI/pcblayer-getAllLayers");
    assert.equal(arg, undefined); assert.equal(timeout, 0);
  } });
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.layerReads=0;globalThis.getterReads=0;
globalThis.identity={tabId:${JSON.stringify(input.target.tabId)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');checkCall(topic,arg,timeout);calls++;await Promise.resolve();if(topic==='pcb/extensionAPI/pcblayer-getAllLayers')layerReads++;${options.afterCall ?? ""}return {message:topic==='getTabIdAndDocType'?identity:rows,bridge:undefined,source:undefined};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};${options.beforeChild ?? ""}`, childContext, { timeout: 1000 });
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, TextEncoder, setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => { assert.equal(delay, 10_000); return setTimeout(callback, 1); }
    : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.target=${JSON.stringify(input.target)};
globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};
globalThis.activeTab=target.tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tab.tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={'c_dbid':target.tabId,'c_doctype':'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbLayersProgram(input)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    evaluateChild: (source: string): unknown => runInContext(source, childContext, { timeout: 1000 }) as unknown };
}

void test("current PCB layers retain cross-realm receiver and map exact raw colors, types and alpha semantics", async () => {
  const rows = [row(), row(2, "BOTTOM"), row(3, "PLANE"), row(4, "TOP_SILK"), row(5, "BOT_SOLDER_MASK"),
    row(6, "TOP_PASTE_MASK"), row(7, "BOT_ASSEMBLY"), row(8, "CUSTOM"), row(9, "UNRECOGNIZED")];
  const fixture = environment(rows);
  const raw: unknown = decodeExactReadEnvelope(await fixture.run());
  const result = validateCurrentPcbLayersResult(request, raw);
  assert.deepEqual(result["value"], rows.map((layer, index) => ({ id: layer["layerId"], name: "Top",
    type: ["SIGNAL", "SIGNAL", "PLANE", "SILKSCREEN", "SOLDER_MASK", "PASTE_MASK", "ASSEMBLY", "CUSTOM", "OTHER"][index],
    color: "#a.492f", transparency: 0, inactiveColor: "#800000", inactiveTransparency: 66.67, layerStatus: 1, locked: false })));
  assert.equal(result["nativeLayers"], undefined); assert.equal(result["observedLayerCount"], 9);
  assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("layerReads"), 2);
  assert.equal(result["implementationKind"], "native-task-equivalent");
  for (const field of ["cadAuthority", "persistenceVerified", "physicalStackVerified"]) { assert.equal(result[field], false); }
  const shortTarget = { ...target, projectUuid: "d".repeat(32), documentUuid: "e".repeat(32), tabId: `${"e".repeat(32)}@${"d".repeat(32)}` };
  const shortInput = { ...request, target: shortTarget };
  const shortFixture = environment([row()], { input: shortInput });
  const shortPayload = decodeExactReadEnvelope(await shortFixture.run());
  assert.deepEqual(validateCurrentPcbLayersResult(shortInput, shortPayload)["target"], shortTarget);
});

void test("current copper count uses enabled native SIGNAL and PLANE plus two, not public SIGNAL projection", async () => {
  const input = { ...request, method: "eda.pcb_Layer.getTheNumberOfCopperLayers" };
  const fixture = environment([row(), row(2, "BOTTOM"), row(3, "SIGNAL", 2), row(4, "PLANE", 1), row(5, "SIGNAL", 0), row(6, "CUSTOM")], { input });
  const raw: unknown = decodeExactReadEnvelope(await fixture.run());
  assert.equal(validateCurrentPcbLayersResult(input, raw)["value"], 4);
  assert.equal(fixture.evaluateChild("layerReads"), 2);
});

void test("current layer discovery and result validation keep target, empty arguments and authority strict", async () => {
  assert.deepEqual(parseCurrentPcbLayersRequest(request), request);
  assert.equal(validateCurrentPcbLayersArguments(request)["valid"], true);
  for (const invalid of [{ ...request, code: "private()" }, { ...request, arguments: { layerId: 1 } },
    { ...request, method: "eda.pcb_Layer.setLayerStatus" }, { ...request, target: { ...target, tabId: "wrong" } },
    { ...request, target: { ...target, branchUuid: "" } }]) {
    assert.throws(() => buildCurrentPcbLayersProgram(invalid)); assert.equal(validateCurrentPcbLayersArguments(invalid)["valid"], false);
  }
  const catalog = queryCurrentPcbLayers({ includeSchemas: true });
  assert.equal(catalog["total"], 2); assert.equal(catalog["invocationEnabledByDiscovery"], false); assert.match(JSON.stringify(catalog), /inputSchema/u);
  assert.equal(queryCurrentPcbLayers({ method: request.method })["total"], 1);
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object"); const payload = { ...raw };
  for (const invalid of [{ ...payload, target: { ...target, branchUuid: "f".repeat(32) } }, { ...payload, method: "eda.pcb_Layer.getTheNumberOfCopperLayers" },
    { ...payload, cadAuthority: true }, { ...payload, nativeLayers: [row(), row()] }, { ...payload, nativeLayers: [{ ...row(), order: -0 }] },
    { ...payload, extra: "PRIVATE" }]) { assert.throws(() => validateCurrentPcbLayersResult(request, invalid)); }
});

void test("current layer reader refuses owner, frame, native identity and complete-row drift after awaits", async () => {
  for (const afterCall of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.tab={...parent.tab};", "parent.frame.contentWindow={};", "globalThis.document={...document};",
    "Bus.prototype.rpcCall=async()=>({message:rows});", "identity.docType=23;", "identity.tabId='other';",
    "if(layerReads===2)rows[0].order++;", "if(layerReads===2)rows[0].visible=false;", "if(layerReads===2)rows[0].active=false;"]) {
    const fixture = environment([row()], { afterCall });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_LAYERS_READ_FAILED" });
    assert.ok(Number(fixture.evaluateChild("calls")) <= 6);
  }
  for (const before of ["attributes.fromFile='true';", "attributes.c_doctype='4';", "gVars.isHistoryMode=true;",
    "tab.parentLibraryUuid='private';", "document.querySelectorAll=()=>[frame,frame];", "eda.extensionUuid='other';"]) {
    const fixture = environment([row()], { before });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_LAYERS_READ_FAILED" });
    assert.equal(fixture.evaluateChild("calls"), 0);
  }
});

void test("current layer reader rejects incomplete, accessor, oversized, signed-zero and failed replies without leaking errors", async () => {
  for (const beforeChild of ["rows=[];", "rows[0].extra='PRIVATE';", "delete rows[0].order;", "rows[0].order=-0;",
    "rows[0].layerStatus=-0;", "rows[0].activeColorAlpha=NaN;", "rows[0].activeColorAlpha=1.1;", "rows[0].activeColor='x'.repeat(129);",
    "delete rows[0];", "rows.push({...rows[0]});", "rows=Array(513).fill(rows[0]);",
    "rows=Array.from({length:400},(_,i)=>({...rows[0],layerId:i+1,name:'x'.repeat(1024)}));",
    "Object.defineProperty(rows[0],'name',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});"]) {
    const fixture = environment([row()], { beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_LAYERS_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  const failed = environment([row()], { afterCall: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  await assert.rejects(failed.run(), { message: "CURRENT_PCB_LAYERS_READ_FAILED" });
  const hung = environment([row()], { afterCall: "return await new Promise(()=>{});", fastDeadline: true });
  await assert.rejects(hung.run(), { message: "CURRENT_PCB_LAYERS_READ_FAILED" });
  assert.equal(hung.evaluateChild("calls"), 1);
});

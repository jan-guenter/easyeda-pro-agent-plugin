import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { CURRENT_PCB_209_VISUAL_FUNCTION, currentPcb209VisualOperationSchema, decodeCurrentPcb209VisualReply } from "../src/current-pcb-209-visual-actions.ts";
import { diagnosticNativeRequest, diagnosticVisual209Params } from "../src/current-pcb-diagnostic-protocol.ts";

const path = String.raw`C:\Reviewed\VisualFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
function fixture(operation: unknown, childBefore = "", afterCall = "", before = ""): {
  raw: () => Promise<string>; run: () => Promise<Readonly<Record<string, unknown>>>; read: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows={track:[{globalIndex:"line-a"}],arc:[],via:[],component:[{globalIndex:"component-a"}],pad:[{globalIndex:"pad-a"}],string:[],attribute:[{attrs:[]}],dimension:[],image:[]};
globalThis.selected=["line-a"];globalThis.calls=[];globalThis.writes=[];globalThis.box={minX:-1,maxX:3,minY:-2,maxY:4};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls.push({topic,arg});await Promise.resolve();let result;
if(topic==="getTabIdAndDocType")result=identity;
else if(topic==="pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds")result=selected;
else if(topic==="pcb/extensionAPI/selectcontrol-clearSelected"){writes.push("clear");selected=[];result=true;}
else if(topic==="pcb/extensionAPI/selectcontrol-doSelectPrimitives"){writes.push("append");selected.push(...arg.primitiveIds);result=arg.primitiveIds.length>0;}
else if(["adaptAllAndGetBBox","adaptSelectAndGetBbox","pcbZoomTo"].includes(topic)){writes.push(topic);result=box;}
else{const family=/^pcb\\/extensionAPI\\/(track|arc|via|component|pad|string|attribute|dimension|image)-getAll$/.exec(topic)?.[1];if(!family)throw new Error("PRIVATE_TOPIC");result=rows[family];}
${afterCall}return {message:result};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};globalThis.location={href:"https://client/editor?entry=pcb"};${childBefore}`, child);
  const context = createContext({ child: runInContext("globalThis", child) as unknown, TextEncoder });
  runInContext(`globalThis.sealed=${JSON.stringify(target)};globalThis.operation=${JSON.stringify(operation)};globalThis.tabId=sealed.documentUuid+"@"+sealed.projectUuid;
globalThis.window=globalThis;globalThis.top=globalThis;globalThis.activeTab=tabId;
globalThis.setTimeout=(fn,ms)=>{if(ms!==3000)throw new Error("PRIVATE_TIMEOUT");globalThis.expire=fn;return 7;};globalThis.clearTimeout=id=>{if(id!==7)throw new Error("PRIVATE_TIMER");};
globalThis.location={href:"https://client/editor?cll=warn#id="+sealed.projectUuid+",tab=*"+tabId,origin:"https://client"};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};globalThis.PRO_EDITOR_MODE="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";
globalThis.tab={tabId,data:{doctype:3,pid:sealed.projectUuid}};class Tabs{static getActiveTab(){return activeTab;}static getTabById(id){return id===tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:sealed.projectUuid,branchUuid:sealed.branchUuid,isV2Format:false},isHistoryMode:false};globalThis.UI={gVars,tabBar:Tabs};
globalThis.attributes={c_dbid:tabId,c_doctype:"3",src:"editor?entry=pcb","pcb-canvas":"true"};
globalThis.frame={tagName:"IFRAME",id:"frame_"+tabId,ownerDocument:document,isConnected:true,contentWindow:child,classList:{contains(name){return name==="editframe";}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},parentElement:{getAttribute(name){return name==="uuid"?tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;${before}`, context);
  const raw = async (): Promise<string> => {
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_VISUAL_FUNCTION})(sealed,"visual",operation)`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209VisualReply({ result: { type: "string", value: await raw() } }, target, operation),
    read: (source): unknown => runInContext(source, child) as unknown };
}

void test("visual209 frame drift and local deadline forbid later camera dispatch", async () => {
  const drift = fixture({ kind: "fit-all" }, "", 'if(calls.length===3)parent.activeTab="other";');
  const driftResult = await drift.run(); assert.equal(driftResult["mutationMayHaveOccurred"], false); assert.equal(drift.read("writes.length"), 0);
  const oversized = fixture({ kind: "fit-all" }, 'selected=Array.from({length:256},(_,i)=>String(i)+"\\\"".repeat(120));');
  const oversizedResult = await oversized.run(); assert.equal(oversizedResult["ok"], false); assert.equal(oversized.read("writes.length"), 0);
  const timed = fixture({ kind: "fit-all" }, "", 'if(calls.length===2)parent.expire();');
  const timedResult = await timed.run(); assert.equal(timedResult["ok"], false); assert.equal(timedResult["viewportAttempted"], false);
  await Promise.resolve(); assert.equal(timed.read("writes.length"), 0);
});

void test("visual209 preserves an uncertain native viewport effect without retry", async () => {
  const value = fixture({ kind: "fit-all" }, "", 'if(topic==="adaptAllAndGetBBox")throw new Error("PRIVATE_LOST_ACK");');
  const result = await value.run(); assert.equal(result["ok"], false); assert.equal(result["stage"], "viewport-dispatched");
  assert.equal(result["mutationMayHaveOccurred"], true); assert.equal(value.read("writes.length"), 1);
  assert.equal(JSON.stringify(result).includes("PRIVATE_LOST_ACK"), false);
  const changed = fixture({ kind: "fit-all" }, "", 'if(topic==="adaptAllAndGetBBox")selected=[];');
  const changedResult = await changed.run(); assert.equal(changedResult["ok"], false); assert.equal(changedResult["viewportAcknowledged"], true);
});

void test("visual209 fit and zoom preserve selection and use exact mil/native unit conversions", async () => {
  for (const operation of [{ kind: "fit-all" }, { kind: "fit-selected", expectedSelection: ["line-a"] },
    { kind: "zoom-to", xMil: 120, yMil: -340, scaleRatio: 2.5 }]) {
    const value = fixture(operation); const result = await value.run(); assert.equal(result["ok"], true);
    assert.deepEqual(result["boundsMil"], { left: -10, right: 30, bottom: -20, top: 40 });
    assert.equal(result["cameraStateDoubleSampled"], false); assert.equal(value.read("writes.length"), 1);
    if (operation.kind === "zoom-to") { assert.deepEqual(z.object({ x: z.number(), y: z.number(), scaleRatio: z.number() }).parse(value.read('calls.find(c=>c.topic==="pcbZoomTo").arg')), { x: 12, y: -34, scaleRatio: 2.5 }); }
  }
  const nativeClass = fixture({ kind: "fit-all" }, "class NativeBox{constructor(){this.minX=-1;this.maxX=3;this.minY=-2;this.maxY=4;}get data(){throw new Error('MUST_NOT_READ');}}box=new NativeBox();");
  const classResult = await nativeClass.run(); assert.equal(classResult["ok"], true);
  const accessor = fixture({ kind: "fit-all" }, "Object.defineProperty(box,'minX',{get(){throw new Error('MUST_NOT_READ');}});");
  const accessorResult = await accessor.run(); assert.equal(accessorResult["ok"], false); assert.equal(accessorResult["viewportAttempted"], true);
  const stale = fixture({ kind: "fit-selected", expectedSelection: ["pad-a"] }); const staleResult = await stale.run(); assert.equal(staleResult["mutationMayHaveOccurred"], false);
  const degenerate = fixture({ kind: "fit-all" }, "box.maxX=box.minX;"); const degenerateResult = await degenerate.run(); assert.equal(degenerateResult["mutationMayHaveOccurred"], true);
});

void test("visual209 complete data grammar and flat escaped envelope are bounded", () => {
  for(const invalid of [{ kind: "fit-selected", expectedSelection: ["same", "same"] }, { kind: "fit-selected", expectedSelection: ["\uD800"] },
    { kind: "fit-selected", expectedSelection: Array.from({ length: 257 }, (_, i) => `id${i}`) }, { kind: "fit-all", code: "anything" },
    { kind: "select-primitives", expectedSelection: [], primitiveIds: ["pad-a"] }, { kind: "replace-selection", expectedSelection: [], primitiveIds: ["pad-a"] },
    { kind: "zoom-to", xMil: -0, yMil: 0, scaleRatio: 1 }, { kind: "zoom-to", xMil: 0, yMil: 0, scaleRatio: 0 }]) { assert.equal(currentPcb209VisualOperationSchema.safeParse(invalid).success, false); }
  const ids = Array.from({ length: 256 }, (_, i) => `pad-${i}`);
  const operation = currentPcb209VisualOperationSchema.parse({ kind: "fit-selected", expectedSelection: ids });
  const params = diagnosticVisual209Params("original-context", target, operation);
  const command = { id: 80, method: "Runtime.callFunctionOn", params, sessionId: "original-session" };
  const native = diagnosticNativeRequest(Buffer.from(`${JSON.stringify(command)}\0`));
  assert.equal(native["pcbVisual209Phase"], "visual"); assert.equal(native["visualOperationJson"], JSON.stringify(operation)); assert.ok(Buffer.byteLength(`${JSON.stringify(native)}\n`) < 32_768);
  assert.equal(currentPcb209VisualOperationSchema.safeParse({ ...operation, expectedSelection: ids.map(value => `${value}${String.raw`\"`.repeat(60)}`) }).success, false);
  assert.throws(() => diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...command, params: { ...params, functionDeclaration: "async()=>1" } })}\0`)));
});

void test("visual209 independent decoder rejects forged target causal flags and success", async () => {
  const operation = { kind: "fit-all" }, raw = await fixture({ kind: "fit-all" }).raw();
  const parsed: unknown = JSON.parse(raw); const packet = z.record(z.string(), z.unknown()).parse(parsed);
  for(const patch of [{ target: { wrong: "target" } }, { viewportAttempted: false }, { observedSelection: ["pad-a"] },
    { operation: { kind: "fit-selected", expectedSelection: ["line-a"] } }, { stage: "preflight" }, { viewportAcknowledged: false },
    { nativeBounds: { minX: 0, maxX: 1e12, minY: 0, maxY: 1 } }]) {
    assert.throws(() => decodeCurrentPcb209VisualReply({ result: { type: "string", value: JSON.stringify({ ...packet, ...patch }) } }, target, operation));
  }
  for(const topic of ["clearSelected", "doSelectPrimitives", "flushService", "flushSelectingInfo"]) { assert.equal(CURRENT_PCB_209_VISUAL_FUNCTION.includes(topic), false); }
});

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import {
  CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION_SHA256,
  CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES,
  decodeCurrentPcbDiagnosticRootInventoryReply,
} from "../src/current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_DIAGNOSTIC_INTERACTION_SETUP, currentPcbDiagnosticInteractionFixture } from "./helpers/current-pcb-diagnostic-interaction-fixture.ts";

/** Self-authored raw layouts. No vendor source, native owner or live project. */
const SETUP = `(()=>{
globalThis.getterReads=0;globalThis.vendorCalls=0;
class Ni{constructor(){this.map=new Map();this._last=undefined;}getAllItem(){vendorCalls++;throw new Error("VENDOR");}}
class Z4 extends Ni{} class u6 extends Ni{} class c6 extends Ni{} class B4 extends Ni{}
class g6 extends Ni{} class t6 extends Ni{} class U4 extends Ni{} class f6 extends Ni{}
class p6 extends Ni{} class C6 extends Ni{} class T6 extends Ni{} class r6 extends Ni{}
class a6 extends Ni{} class b6 extends Ni{} class s6 extends Ni{} class o6 extends Ni{} class l6 extends Ni{}
const families={vn:Z4,Jn:u6,Dn:c6,Xi:B4,ol:g6,nn:t6,bo:U4,_a:f6,Aa:p6,GR:C6,Ms:T6,Fi:r6,oa:a6,c0:b6,Yo:s6,zo:o6,Mp:l6};
for(const c of Object.values(families)){c.manager=new c();c.getInstance=()=>{vendorCalls++;throw new Error("LAZY");};}
class lD{constructor(){this._outlineCollect=new Map();this._autoGenerate=false;}}
lD.instance=new lD();
class Panel{constructor(){
for(const name of ["items","outlines","slots","originOutline","holes","positionHoles","stampGroups","marks","vCutShapes","closures","borderClosures_outerMost"])this[name]=[];
this.borderClosures=[[],[]];this._param={on:false,success:false};
}}
Panel.model=new Panel();
class Jse{constructor(){this.model=Panel.model;}}
const Si=new Jse();
class NI{constructor(parent=null){this.parent=parent;this.childs=[];}}
class iy{constructor(parent=null){this.parent=parent;this.childs=[];}}
class Md{constructor(){this.items=new Set();this.changeList=new Set();this.deadList=new Set();this.root=new NI();}}
class F0{constructor(){this.items=new Set();this.changeList=new Set();this.deadList=new Set();this.root=new iy();}}
class tV{constructor(){this.map=new Map();this.otherMap=new Map();this.ratlineMap=new Map();}}
const Ht=new tV();
class x{constructor(){this._id="a".repeat(32);this._doctype=3;}}
x.env=new x();
class Z1e{constructor(callback){this.callback=callback;this.isRunning=true;}}
class Oet{constructor(){this.subscribed={"pcb/saveCompiler":[new Z1e(()=>{vendorCalls++;})]};}}
class HJ{constructor(){this.messageBus=new Oet();}}
globalThis.MSG_BUS_PCB=new HJ();
globalThis.scope={object:{x,...families,_s:lD,ai:Panel,Jse,Si,tV,Ht,Md,F0,NI,iy}};
globalThis.state={families,board:lD.instance,panel:Panel.model,Si,Ht};
for(const p of [Ni.prototype,lD.prototype,Panel.prototype,Md.prototype,F0.prototype]){
for(const key of ["itemsCount","board","outlineCollect","getDefaultPanelize","size","bbox","flushWhenNeed"]){
Object.defineProperty(p,key,{get(){getterReads++;throw new Error("GETTER");}});
}}
})();
${CURRENT_PCB_DIAGNOSTIC_INTERACTION_SETUP}`;
const EXPRESSION = `(${CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`;
const reply = (value: unknown): unknown => ({ result: { type: "string", value } });

function rawSample(change = ""): string {
  const context = createContext({});
  runInContext(SETUP + change, context, { timeout: 1000 });
  const raw: unknown = runInContext(EXPRESSION, context, { timeout: 1000 });
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  assert.equal(typeof raw, "string");
  if (typeof raw !== "string") { throw new TypeError("Synthetic root census is not text."); }
  return raw;
}
function sample(change = ""): ReturnType<typeof decodeCurrentPcbDiagnosticRootInventoryReply> {
  return decodeCurrentPcbDiagnosticRootInventoryReply(reply(rawSample(change)));
}
function refused(change: string): void {
  const context = createContext({});
  runInContext(SETUP + change, context, { timeout: 1000 });
  assert.throws(() => runInContext(EXPRESSION, context, { timeout: 1000 }), /PCB_DIAGNOSTIC_ROOT_INVENTORY_STATE/u, change);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
}

void test("root census counts all fixed raw families without invoking getters or disclosing members", () => {
  const raw = rawSample(`for(const c of Object.values(state.families)){
c.manager.map.set("private-key",{hidden:true,_stateWatcher:undefined,modelType:"Future",text:"private-body"});
}`);
  assert.equal(raw.includes("private"), false);
  const value = decodeCurrentPcbDiagnosticRootInventoryReply(reply(raw));
  assert.equal(Object.keys(value.families).length, 17);
  for (const owner of Object.values(value.families)) { assert.deepEqual(owner, { marker: "present", count: 1 }); }
  assert.equal(value.collectionEntries, 20);
  assert.deepEqual(value.interaction, currentPcbDiagnosticInteractionFixture());
  assert.equal(value.completeModelMembershipVerified, false);
  assert.equal(value.emptyRootPcbVerified, false);
  assert.equal(value.completeLiveBaselineVerified, false);
  assert.equal(value.sourceOwnershipVerified, false);
  assert.equal(value.secondaryIndexesCovered, false);
  assert.equal(value.activeToolsCovered, false);
  assert.equal(value.queueCompletionVerified, false);
  assert.equal(value.writerSupported, false);
  assert.equal(value.executionAuthorized, false);
  assert.ok(Object.isFrozen(value.families)); assert.ok(Object.isFrozen(value.spatialIndexes.typed));
  assert.equal(CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION_SHA256,
    createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION).digest("hex"));
});

void test("lazy owner and board markers remain distinct from present empty maps", () => {
  const value = sample(`delete state.families.vn.manager;state.families.Jn.manager=undefined;state.families.Dn.manager=null;
scope.object._s.instance=undefined;delete scope.object.ai.model;`);
  assert.deepEqual(value.families.tracks, { marker: "absent", count: null });
  assert.deepEqual(value.families.pads, { marker: "undefined", count: null });
  assert.deepEqual(value.families.vias, { marker: "null", count: null });
  assert.deepEqual(value.families.circles, { marker: "present", count: 0 });
  assert.deepEqual(value.board, { ownerMarker: "undefined", boardMarker: null, outlineCount: null, autoGenerate: null });
  assert.deepEqual(value.panelization, { ownerMarker: "absent", viewModelMatchesOwner: null, activation: null, counts: null });
  assert.equal(value.collectionEntries, 1);
  assert.equal(sample().board.boardMarker, "absent");
  assert.equal(sample("state.board._board=undefined;").board.boardMarker, "undefined");
  assert.equal(sample("state.board._board=null;").board.boardMarker, "null");
  assert.equal(sample("state.board._board={};").board.boardMarker, "present");
});

void test("independent BOARD and populated panelization roots remain visible with empty ordinary maps", () => {
  const value = sample(`state.board._board={};state.board._outlineCollect.set("private-outline",{});
state.board._autoGenerate=true;state.panel.items.push({},{});
state.panel.outlines.push({});state.panel.slots.push({});state.panel.originOutline.push([{}]);
state.panel.holes.push({});state.panel.positionHoles.push({});state.panel.stampGroups.push([{},{}]);
state.panel.marks.push({});state.panel.vCutShapes.push({});state.panel.closures.push([{}]);
state.panel.borderClosures[0].push({},{});state.panel.borderClosures[1].push({});
state.panel.borderClosures_outerMost.push({});state.panel._param.on=true;state.panel._param.success=true;
state.Si.model={};`);
  for (const owner of Object.values(value.families)) { assert.equal(owner.count, 0); }
  assert.deepEqual(value.board, { ownerMarker: "present", boardMarker: "present", outlineCount: 1, autoGenerate: true });
  assert.equal(value.panelization.viewModelMatchesOwner, false);
  assert.deepEqual(value.panelization.activation, { on: true, success: true });
  assert.deepEqual(value.panelization.counts, {
    items: 2, outlines: 1, slots: 1, originOutline: 1, holes: 1, positionHoles: 1, stampGroups: 1,
    marks: 1, vCutShapes: 1, closures: 1, borderClosuresFirst: 2, borderClosuresSecond: 1, borderClosuresOuterMost: 1,
  });
  assert.equal(value.collectionEntries, 19);
  assert.equal(value.emptyRootPcbVerified, false);
});

void test("interaction sample recognizes the ordinary Eh chain and preserves unknown or missing tools", () => {
  const baseline = sample().interaction;
  assert.equal(baseline.toolChain.navigation?.idle?.drawing, false);
  assert.equal(baseline.controllers.smart.commandCount, 0);
  assert.equal(baseline.controllers.attributesUnmounted, false);
  assert.equal(baseline.selection.dialog, "absent");
  const value = sample(`scope.object.$0.nextTool.nextTool={secret:"private-tool"};
scope.object.$0.mouseDownStatus=0;scope.object.$0.mouseRightDownTimer=0;
scope.object.Sr.control={};scope.object.Sr.mouseMoveCheck=true;
scope.object.Fe.items.push({private:"selection"});scope.object.Fe.dragging=true;
scope.object.Us.command._commands.push({private:"command"});scope.object.Us.initCommandFromOutside=true;
scope.object.Xo._flipQueue.push(()=>{vendorCalls++;});scope.object.Xo._isProcessingFlip=true;
scope.object.nu._type="private-tool-type";scope.object.nu._ui2PCBAboutAttrDataUpdateTimer=0;`).interaction;
  assert.equal(value.toolChain.navigation?.nextKind, "other");
  assert.equal(value.toolChain.navigation?.idle, null);
  assert.equal(value.toolChain.mouseDownButton, 0);
  assert.equal(value.toolChain.rightDownTimer, "present");
  assert.equal(value.controllers.pointControl, "present");
  assert.equal(value.controllers.smart.commandCount, 1);
  assert.equal(value.controllers.smart.commandFromOutside, true);
  assert.equal(value.controllers.turn.queueCount, 1);
  assert.equal(value.controllers.turn.processing, true);
  assert.equal(value.controllers.attributeType, "present");
  assert.equal(value.controllers.attributeTimer, "present");
  assert.equal(value.collectionEntries, 4);
  assert.equal(JSON.stringify(value).includes("private"), false);
  const absent = sample("delete scope.object.$0.nextTool;scope.object.nu._type=undefined;").interaction;
  assert.equal(absent.toolChain.nextMarker, "absent");
  assert.equal(absent.toolChain.navigation, null);
  assert.equal(absent.controllers.attributeType, "undefined");
  const other = sample("scope.object.$0.nextTool={};scope.object.Fe._dialog=undefined;").interaction;
  assert.equal(other.toolChain.nextKind, "other");
  assert.equal(other.selection.dialog, "undefined");
});

void test("secondary indexes expose retained partition, inner and view members independently of raw roots", () => {
  const value = sample(`const s=scope.object;
s.Nn.manager=new s.Nn();s.Nn.manager.items.set("private-partition",{});
s.zo.manager.layerMapSet={"private-empty-layer":new Set(),"private-layer":new Set([{},{}])};
s.Wn.layerMapSet={"private-layer":new Set([{}])};s.Wn.mgr={};
s.Yh.map.set("private-dimension",{});s.Ft.map.set("private-group",{});
s.Hb.manager=new s.Hb();s.Hb.manager.map.set("private-line",{});s.Hb.manager.updateIds.add("private-line");
s.Cy.instance=new s.Cy();s.Cy.instance.activeToolHistory={};s.Cy.instance.activeToolId="private-history";`);
  for (const owner of Object.values(value.families)) { assert.equal(owner.count, 0); }
  const { secondary, controllers } = value.interaction;
  assert.deepEqual(secondary.partitions, { marker: "present", count: 1 });
  assert.deepEqual(secondary.innerModels, { keys: 2, members: 2 });
  assert.deepEqual(secondary.innerViews, { keys: 1, members: 1 });
  assert.equal(secondary.innerViewManagerMatches, false);
  assert.equal(secondary.smartDimensionViews, 1);
  assert.equal(secondary.groupViews, 1);
  assert.deepEqual(secondary.retainedLines, { mapCount: 1, updateCount: 1 });
  assert.deepEqual(controllers.toolHistory, { activeTool: "present", activeId: "present" });
  assert.equal(value.interaction.collectionEntries, 12);
  assert.equal(value.collectionEntries, 14);
  assert.equal(JSON.stringify(value).includes("private"), false);
  assert.equal(value.activeToolsCovered, false);
  assert.equal(value.secondaryIndexesCovered, false);
  assert.equal(value.executionAuthorized, false);
});

void test("interaction rejects getters, false timer/reference substitutions and malformed nested containers", () => {
  for (const change of [
    'Object.defineProperty(scope.object.$0,"nextTool",{get(){getterReads++;throw new Error("GETTER");}});',
    'scope.object.$0.nextTool=false;',
    'scope.object.$0.mouseRightDownTimer=false;',
    'scope.object.$0.mouseDownStatus=-0;',
    'scope.object.$0.mouseDownStatus=5;',
    'scope.object.$0.nextTool.nextTool.filterItems=[];',
    'scope.object.Pi.scene=[0];',
    'scope.object.Pi.scene=[3,3,3,3,3,3,3,3,3];',
    'scope.object.Fe.mouseLeftDown=0;',
    'scope.object.Fe._dialog=false;',
    'scope.object.Sr.lockedLayers={};',
    'scope.object.Us.command={_commands:[],waitingUploadStack:[],idMap:new Map()};',
    'scope.object.Us.command._commands.length=1;',
    'scope.object.Xo._flipQueue.length=1;',
    'scope.object.nu._type=false;',
    'scope.object.nu._ui2PCBAboutAttrDataUpdateTimer=-1;',
    'scope.object.Cy.instance={};',
    'scope.object.Cy.instance=new scope.object.Cy();scope.object.Cy.instance.activeToolId=false;',
    'scope.object.Nn.manager=new scope.object.Nn();scope.object.Nn.manager.items=new Set();',
    'scope.object.zo.manager.layerMapSet={x:[]};',
    'scope.object.zo.manager.layerMapSet={[Symbol("x")]:new Set()};',
    'Object.defineProperty(scope.object.Wn.layerMapSet,"x",{get(){getterReads++;throw new Error("GETTER");}});',
    'scope.object.Yh={map:new Map()};',
    'scope.object.Ft.map=new Set();',
  ]) { refused(change); }
  refused("for(let i=0;i<65534;i++)state.families.vn.manager.map.set(i,null);");
  const full = sample("for(let i=0;i<65533;i++)state.families.vn.manager.map.set(i,null);");
  assert.equal(full.collectionEntries, 65_536);
});

const POPULATED_TREES = `(()=>{
const a={},b={},c={},d={},e={},tree=new scope.object.Md();
tree.items=new Set([a,b,c]);tree.changeList=new Set([c]);tree.deadList=new Set([d]);
tree.root.childs=[a,d,e,a];state.Ht.map.set("private-type",new Map([[3,tree]]));
const other=new scope.object.F0(),node=new scope.object.iy(other.root),leaf={};
node.childs=[leaf];other.root.childs=[node];other.items.add(leaf);state.Ht.otherMap.set(1006,other);
state.Ht.ratlineMap.set("private-net",new scope.object.Md());
})();`;

void test("spatial witnesses preserve pending insertion/removal differences and unknown type branches", () => {
  const raw = rawSample(POPULATED_TREES), value = decodeCurrentPcbDiagnosticRootInventoryReply(reply(raw));
  assert.equal(raw.includes("private"), false);
  assert.deepEqual(value.spatialIndexes.typed, {
    outerKeyCount: 1, nestedKeyCount: 1, treeCount: 1, itemCount: 3, changeCount: 1, deadCount: 1,
    rootNodeCount: 1, rootLeafCount: 4, rootLeafWithoutItemCount: 2, rootLeafWithoutItemOrDeadCount: 1,
    itemWithoutRootLeafCount: 2, itemWithoutRootLeafOrChangeCount: 1, repeatedRootLeafCount: 1,
  });
  assert.equal(value.spatialIndexes.other.rootNodeCount, 2);
  assert.equal(value.spatialIndexes.other.rootLeafCount, 1);
  assert.equal(value.spatialIndexes.other.rootLeafWithoutItemCount, 0);
  assert.equal(value.spatialIndexes.ratline.treeCount, 1);
  assert.equal(value.treeCount, 3);
  assert.equal(value.collectionEntries, 23);
});

void test("census refuses accessors, inherited shadows and malformed original layouts before calling them", () => {
  for (const change of [
    'Object.defineProperty(state.families.vn.manager,"map",{get(){getterReads++;throw new Error("GETTER");}});',
    'delete state.families.vn.manager;Object.defineProperty(Object.getPrototypeOf(state.families.vn),"manager",{value:null});',
    'state.families.vn.manager.map=new Set();', 'state.families.vn.manager={map:new Map()};',
    'state.families.vn.manager.map.extra=true;', 'state.families.vn.manager.map[Symbol("x")]=0;',
    'scope.object.x.env._doctype=4;', 'scope.object.x.env._id="not-an-id";',
    'state.board._board=0;', 'state.board._outlineCollect={};', 'state.board._autoGenerate=0;',
    'state.panel._param.on=0;', 'state.panel.items.length=1;', 'state.panel.items.extra=true;',
    'state.panel.borderClosures=[[]];', 'state.panel.borderClosures[0]={length:0};',
    'Object.defineProperty(state.panel,"holes",{get(){getterReads++;throw new Error("GETTER");}});',
    'state.Ht.map.set("Text",{});', 'state.Ht.otherMap.set(1,{});',
    'state.Ht.ratlineMap.set("x",new scope.object.Md());state.Ht.ratlineMap.get("x").root={parent:null,childs:[]};',
    'const t=new scope.object.Md();t.root.parent={};state.Ht.otherMap.set(1,t);',
    'const t=new scope.object.Md();t.root.childs=[new scope.object.iy(t.root)];state.Ht.otherMap.set(1,t);',
    'const t=new scope.object.Md();t.root.childs.length=1;state.Ht.otherMap.set(1,t);',
    'const t=new scope.object.Md();t.items.add(0);state.Ht.otherMap.set(1,t);',
    'const t=new scope.object.Md();state.Ht.otherMap.set(1,t);state.Ht.otherMap.set(2,t);',
  ]) { refused(change); }
});

void test("global collection, tree and depth bounds refuse instead of truncating", () => {
  for (const change of [
    'for(let i=0;i<65537;i++)state.families.vn.manager.map.set(i,null);',
    'for(let i=0;i<40000;i++){state.families.vn.manager.map.set(i,null);state.families.Jn.manager.map.set(i,null);}',
    'for(let i=0;i<129;i++)state.Ht.otherMap.set(i,new scope.object.Md());',
    'const t=new scope.object.Md();let p=t.root;for(let i=0;i<65;i++){const n=new scope.object.NI(p);p.childs=[n];p=n;}state.Ht.otherMap.set(1,t);',
    'const t=new scope.object.Md(),n=new scope.object.NI(t.root);t.root.childs=[n];n.childs=[t.root];state.Ht.otherMap.set(1,t);',
  ]) { refused(change); }
  const maximumTrees = sample("for(let i=0;i<128;i++)state.Ht.otherMap.set(i,new scope.object.Md());");
  assert.equal(maximumTrees.treeCount, 128);
  assert.ok(Buffer.byteLength(rawSample(), "utf8") < CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES);
});

void test("decoder refuses contradictory counts, claims, duplicate keys, proxies and excess bytes", () => {
  const raw = rawSample(POPULATED_TREES);
  for (const value of [
    { result: { type: "string", value: raw, objectId: "handle" } },
    { result: { type: "string", value: raw }, exceptionDetails: {} },
    reply(raw.replace('"collectionEntries":23', '"collectionEntries":24')),
    reply(raw.replace('"collectionEntries":23', '"collectionEntries":23,"collectionEntries":23')),
    reply(raw.replace('"marker":"present","count":0', '"marker":"null","count":0')),
    reply(raw.replace('"marker":"present","count":0', '"marker":"present","count":null')),
    reply(raw.replace('"count":0', '"count":-0')),
    reply(raw.replace('"rootLeafWithoutItemOrDeadCount":1', '"rootLeafWithoutItemOrDeadCount":3')),
    reply(raw.replace('"nestedKeyCount":1', '"nestedKeyCount":2')),
    reply(raw.replace('"treeCount":3}', '"treeCount":4}')),
    reply(raw.replace('"viewModelMatchesOwner":true', '"viewModelMatchesOwner":null')),
    reply(raw.replace('"schema":', '"emptyRootPcbVerified":true,"schema":')),
    reply("é".repeat(CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_RESULT_BYTES)),
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticRootInventoryReply(value), /ROOT_INVENTORY_REPLY/u); }
  let read = false;
  const accessor = Object.defineProperty({}, "result", { get(): never { read = true; throw new Error("ACCESSOR"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticRootInventoryReply(accessor), /ROOT_INVENTORY_REPLY/u);
  assert.equal(read, false);
  const proxy = new Proxy({}, { ownKeys(): never { throw new Error("PROXY"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticRootInventoryReply(proxy), /ROOT_INVENTORY_REPLY/u);
});

void test("fixed populated census works with inspector effect checking and refuses a mutating proxy trap", async () => {
  const session = new Session(); session.connect();
  const name = "pcb-root-inventory-synthetic";
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueContextId = params.context.uniqueId;
    }
  });
  try {
    await session.post("Runtime.enable");
    const context = createContext({}, { name });
    runInContext(SETUP + POPULATED_TREES, context, { timeout: 1000 });
    assert.notEqual(uniqueContextId, "");
    const evaluate = (): Promise<unknown> => session.post("Runtime.evaluate", {
      expression: EXPRESSION, uniqueContextId, returnByValue: true, throwOnSideEffect: true,
      silent: true, awaitPromise: false, generatePreview: false, includeCommandLineAPI: false,
      allowUnsafeEvalBlockedByCSP: false, userGesture: false, timeout: 1000,
    });
    const observed = await evaluate();
    assert.ok(observed !== null && typeof observed === "object" && !Object.hasOwn(observed, "exceptionDetails"), JSON.stringify(observed));
    assert.equal(decodeCurrentPcbDiagnosticRootInventoryReply(observed).treeCount, 3);
    runInContext(`const c=state.families.vn;c.manager=new Proxy(c.manager,{
getOwnPropertyDescriptor(target,key){getterReads++;return Reflect.getOwnPropertyDescriptor(target,key);}});`, context);
    const refusedReply = await evaluate();
    assert.throws(() => decodeCurrentPcbDiagnosticRootInventoryReply(refusedReply), /ROOT_INVENTORY_REPLY/u);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});

import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialQuerySchema, decodeCurrentPcb209SpatialReply } from "../src/current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery } from "../src/current-pcb-209-spatial-read.ts";
import { CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS, CURRENT_PCB_209_SPATIAL_FAMILY_ORDER,
  CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS } from "../src/current-pcb-209-spatial-source-profile.ts";

// A synthetic original-context scene exercises the guard and result kernel.
// Its instrumented hit methods do not establish vendor geometry equivalence.
const scene = `
class HJ{}class Oet{}class Z1e{}
const callback=function(){};
const task=Object.assign(new Z1e,{isRunning:true,callback});
globalThis.MSG_BUS_PCB=Object.assign(new HJ,{messageBus:Object.assign(new Oet,{subscribed:{"pcb/extensionAPI/document-getPrimitiveAtPoint":[task]}})});
class LH{filter(value){return new Set(value)}filterElement(value){return value}}
class Qg{}class Ve{}class It{}class ki{}class qs{}class n3{}class D0{}
class iV{}class vD{}class Nd{}class V0{}class BI{}class iy{}class sy{}class GN{}class Ud{}class g0{}class V_e{}
class at{constructor(minX,maxX,minY,maxY){Object.assign(this,{minX,maxX,minY,maxY})}}
class mx{constructor(){this.scale=1}}
class wl{constructor(type,pick=true){Object.assign(this,{type,_pick:pick,_visible:true})}}
class zi{}class Ke{}class x{}
const camera=new mx,qt=new LH,Me={_smartMode:false};
zi.manager=Object.assign(new zi,{map:new Map([0,1,6,7,8,12,21,35,36,37].map(k=>[k,new wl(k,![7,8,12,35].includes(k))]))});
Ke.manager=Object.assign(new Ke,{activeLayer:1});
x.env=Object.assign(new x,{_doctype:3,partitionId:"",_envFlag:null,_id:"0123456789abcdef"});
const ye={modelManager:Ke.manager,grayIndex:0,_layerMap:{12:{model:{status:{state:6}}}}};
const box=new at(-1,1,-1,1);
const model=Object.assign(new Qg,{_dataState:0,_globalIndex:"via-one",_type:0,modelType:"Via",_center:{x:0,y:0},
_viaBaseInfo:{startLayer:1,endLayer:2,radius:1,holeRadius:.5},_viaExpansion:{topExpansion:0,bottomExpansion:0},
_unusedInnerLayers:[],_bbox:box,_net:"GND",_locked:false});
const view=Object.assign(new Ve,{model,_dataState:1,_bbox:box});model._stateWatcher=view;
const tree=Object.assign(new Nd,{items:new Set([view]),changeList:new Set,deadList:new Set,
root:Object.assign(new BI,{parent:null,childs:[view],_bbox:box})});
const Ht=Object.assign(new iV,{map:new Map([["Via",new Map([[12,tree]])]]),otherMap:new Map,ratlineMap:new Map});
const Sr={items:[view]},metrics={hits:0,getters:0},hook={run:()=>{}};
class Hr{static pointSelect(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return [view]}
static filterPartiton(value){return value}static getSelectInside(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([view])}
static getSelectContect(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([view])}}
const scope={Hr,qt,LH,Fi:()=>camera,a4:camera,Me,Ht,zi,Ve,Qg,It,ki,qs,n3,D0,iV,vD,Nd,V0,BI,iy,sy,GN,Ud,g0,V_e,
G_e:new V_e,at,Ll:value=>value,YP:value=>Array.from(value),x,ye,Sr,mx,wl,Ke};
`;
const qualifiedFixture = `
const plans=${JSON.stringify(CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS)};
Object.assign(scope,${JSON.stringify(CURRENT_PCB_209_SPATIAL_FAMILY_ORDER)});
for(const plan of plans)if(!Object.hasOwn(scope,plan.role))scope[plan.role]=class{};
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS)})){
if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}}
scope.St=new scope.StClass;Object.setPrototypeOf(Me,scope.qme.prototype);Object.setPrototypeOf(ye,scope.Ude.prototype);
scope.Jdt=Object.assign(new scope.Zdt,{fac:Object.assign(new scope.xe,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}),length:0,box:null,pt:null,i:0});
scope.vMe.instance=Object.assign(new scope.vMe,{boxCache:new Array(4)});Ht.func=()=>new vD;
for(const plan of plans){if(!["static","prototype"].includes(plan.target))continue;const owner=plan.target==="static"?scope[plan.role]:scope[plan.role].prototype;
if(!Object.hasOwn(owner,plan.property))Object.defineProperty(owner,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});}
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS)}))
for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
function touchScratch(bounds){const [l,r,b,t]=bounds;scope.vMe.instance.boxCache.splice(0,4,l,l,b,t);
const box=new at(l,l,b,t);Object.assign(scope.Jdt.fac,{minX:l,maxX:r,minY:b,maxY:t});Object.assign(scope.Jdt,{length:4,i:4,box,pt:Object.assign(new scope.M,{__bbox:box})});}
`;
function fixture(setup = ""): ReturnType<typeof createContext> {
  const context = createContext({ TextEncoder });
  runInContext(scene, context);
  runInContext(qualifiedFixture, context);
  runInContext(`globalThis.bundle=(${CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION}).call({object:scope},callback)`, context);
  runInContext(setup, context);
  return context;
}
function invoke(context: ReturnType<typeof createContext>, query: CurrentPcb209SpatialQuery): unknown {
  const encoded = JSON.stringify(query);
  return runInContext(`(${CURRENT_PCB_209_SPATIAL_READ_FUNCTION}).call(bundle,${encoded})`, context) as unknown;
}
function hits(context: ReturnType<typeof createContext>): unknown { return runInContext("metrics.hits", context) as unknown; }

void test("Via kernel preserves ordered identities and selected IDs over both native samples", () => {
  for (const query of [{ kind: "point", xMil: 0, yMil: 0 },
    { kind: "region", mode: "inside", leftMil: -20, rightMil: 20, bottomMil: -20, topMil: 20 },
    { kind: "region", mode: "intersects", leftMil: -20, rightMil: 20, bottomMil: -20, topMil: 20 }] as const) {
    const context = fixture(), raw = invoke(context, query);
    assert.equal(typeof raw, "string");
    const reply = decodeCurrentPcb209SpatialReply({ result: { type: "string", value: raw } });
    assert.deepEqual(reply.identities, [{ primitiveId: "via-one", family: "Via" }]);
    assert.deepEqual(reply.selectedPrimitiveIds, ["via-one"]);
    assert.equal(reply.samples, 2); assert.equal(reply.sourceMembershipVerified, false);
    assert.equal(reply.persistenceVerified, false); assert.equal(hits(context), 2);
  }
});

void test("unsupported index families, stale leaves, pending maintenance and border crossings refuse before native hit", () => {
  const point = { kind: "point", xMil: 0, yMil: 0 } as const;
  for (const setup of [
    'Ht.map=new Map([["Track",new Map([[1,tree]])]])',
    "tree.deadList.add(view)", "tree.changeList.add(view)", "model._dataState=4", "view._dataState=4",
    "model._locked=true", "model._locked=0", "delete model._locked",
    "tree.root.childs.push(view)", "tree.root.childs=[]", "tree.items=new Set(Array.from({length:257},()=>({})))",
    "model._parent={}", "Me._smartMode=true", "qt.dialog={}", "Hr.validType=[]",
    "zi.manager.map.get(7)._pick=true", "zi.manager.map.get(8)._pick=true", "zi.manager.map.get(12)._pick=true",
    "zi.manager.map.get(35)._pick=true", "ye.grayIndex=1", "scope.a4=null", "zi.manager=null",
    "task.callback=()=>{}", "model._viaBaseInfo.startLayer=15",
    'scope.N4.reverse()',
    "view.isSelect=()=>{metrics.hits++;return true}", "model.hasDataState=()=>{metrics.hits++;return false}",
    'Object.setPrototypeOf(Ve.prototype,{constructor:scope.ls,isEmpty:false})',
    'Object.defineProperty(scope.ls.prototype,"isEmpty",{value:false})',
  ]) {
    const context = fixture(setup);
    assert.throws(() => invoke(context, point), /PCB209_SPATIAL_(?:READ|CAPTURE)_REFUSED/u, setup);
    assert.equal(hits(context), 0, setup);
  }
  const context = fixture();
  assert.throws(() => invoke(context, { kind: "region", mode: "intersects", leftMil: -5, rightMil: 5, bottomMil: -5, topMil: 5 }),
    /PCB209_SPATIAL_READ_REFUSED/u);
  assert.equal(hits(context), 0);
});

void test("guard reads own data descriptors and never invokes a hostile source accessor", () => {
  const context = fixture('Object.defineProperty(model,"_viaBaseInfo",{get(){metrics.getters++;throw Error("executed getter")}})');
  assert.throws(() => invoke(context, { kind: "point", xMil: 0, yMil: 0 }), /PCB209_SPATIAL_READ_REFUSED/u);
  assert.equal(runInContext("metrics.getters", context), 0); assert.equal(hits(context), 0);
});

void test("source, selection, method, index and extra scratch mutations stop before a second native call", () => {
  for (const setup of [
    'hook.run=()=>{model._net="changed"}', "hook.run=()=>{model._center.x=1}",
    "hook.run=()=>{Sr.items.push(view)}", "hook.run=()=>{tree.items.delete(view)}",
    "hook.run=()=>{LH.prototype.filter=()=>new Set}", "hook.run=()=>{D0.code=8}",
    "hook.run=()=>{D0.extra=true}", "hook.run=()=>{ye._layerMap[12].model.status.state=7}",
    "hook.run=()=>{scope.Jdt.fac.minX=123}", "hook.run=()=>{scope.vMe.instance.boxCache[0]=123}",
  ]) {
    const context = fixture(setup);
    assert.throws(() => invoke(context, { kind: "point", xMil: 0, yMil: 0 }), /PCB209_SPATIAL_READ_REFUSED/u, setup);
    assert.equal(hits(context), 1, setup);
  }
});

void test("strict spatial data rejects malformed coordinates, source claims and duplicate identities", () => {
  for (const value of [
    { kind: "point", xMil: -0, yMil: 0 }, { kind: "point", xMil: Infinity, yMil: 0 },
    { kind: "point", xMil: "1", yMil: 0 }, { kind: "point", xMil: 0, yMil: 0, extra: true },
    { kind: "region", mode: "inside", leftMil: 1, rightMil: 1, bottomMil: 0, topMil: 1 },
    { kind: "region", mode: "inside", leftMil: 0, rightMil: 1, bottomMil: 0, topMil: -1 },
  ]) { assert.equal(currentPcb209SpatialQuerySchema.safeParse(value).success, false); }
  const raw = invoke(fixture(), { kind: "point", xMil: 0, yMil: 0 });
  assert.equal(typeof raw, "string"); assert.ok(typeof raw === "string");
  assert.throws(() => decodeCurrentPcb209SpatialReply({ result: { type: "string", value: raw.replace('"persistenceVerified":false', '"persistenceVerified":true') } }), /PCB209_SPATIAL_REPLY/u);
  assert.throws(() => decodeCurrentPcb209SpatialReply({ result: { type: "string", value: raw.replace('"samples":2', '"samples":2,"samples":2') } }), /PCB209_SPATIAL_REPLY/u);
});

void test("V8 side-effect guard requires scoped admission for native scratch and new local object sealing", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const defined = await session.post("Runtime.evaluate", { expression: "class D0{static _getCode(t){return t<0&&(t=0),this.code=1,this.code=this.code<<t,this.code}};D0.code=1;D0", returnByValue: false });
    const objectId = defined.result.objectId;
    assert.ok(objectId !== undefined);
    // The pinned Node inspector declarations omit CDP's implemented option.
    const guarded: Runtime.CallFunctionOnParameterType & { throwOnSideEffect: boolean } = {
      objectId, functionDeclaration: "function(){return this._getCode(0)}", throwOnSideEffect: true, returnByValue: true,
    };
    const refused = await session.post("Runtime.callFunctionOn", guarded);
    assert.ok(refused.exceptionDetails !== undefined);
    const unguarded: Runtime.CallFunctionOnParameterType & { throwOnSideEffect: boolean } = {
      objectId, functionDeclaration: "function(){return this._getCode(1)}", throwOnSideEffect: false, returnByValue: true,
    };
    const accepted = await session.post("Runtime.callFunctionOn", unguarded);
    assert.equal(accepted.exceptionDetails, undefined); assert.equal(accepted.result.value, 2);
    const localSealing: Runtime.CallFunctionOnParameterType & { throwOnSideEffect: boolean } = {
      objectId, functionDeclaration: 'function(){const local={};Object.defineProperty(local,"value",{value:1,enumerable:true});return Object.freeze(local)}',
      throwOnSideEffect: true, returnByValue: true,
    };
    const rejectedSealing = await session.post("Runtime.callFunctionOn", localSealing);
    assert.ok(rejectedSealing.exceptionDetails !== undefined);
    const allowedLocalSealing: Runtime.CallFunctionOnParameterType & { throwOnSideEffect: boolean } = { ...localSealing, throwOnSideEffect: false };
    const sealed = await session.post("Runtime.callFunctionOn", allowedLocalSealing);
    assert.equal(sealed.exceptionDetails, undefined); assert.deepEqual(sealed.result.value, { value: 1 });
    await session.post("Runtime.releaseObject", { objectId });
  } finally { session.disconnect(); }
});

import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialQuerySchema, decodeCurrentPcb209SpatialReply } from "../src/current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery } from "../src/current-pcb-209-spatial-read.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";

function fixture(setup = ""): ReturnType<typeof createContext> {
  const context = createContext({ TextEncoder });
  runInContext(spatialScene, context);
  runInContext(qualifiedSpatialScene, context);
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

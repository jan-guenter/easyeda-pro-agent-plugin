/** Inert descriptor/hit instrumentation. This is neither Chrome provenance
 * nor a connected Component clone or saved-design acceptance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION as BINDINGS, CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION as READ, currentPcb209ComponentClonedPointQueriesSchema, decodeCurrentPcb209ComponentClonedPointReply as decode } from "../src/current-pcb-209-component-cloned-point-read.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION as GPU_BINDINGS, CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION as GPU_READ } from "../src/current-pcb-209-component-point-read.ts";
import { CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PLANS as PLANS, deriveCurrentPcb209ComponentClonedPointBudget as budget } from "../src/current-pcb-209-component-cloned-point-source-profile.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_OMITTED_PAD_KEYS as RESTORED } from "../src/current-pcb-209-component-point-source-profile.ts";
import { componentPointScene } from "./helpers/current-pcb-component-point-scene.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";

const plans = PLANS.filter(row => RESTORED.some(key => key === row.key));
const cloned = `Object.assign(sourcePad,{_type:1,_plated:false});for(const key of Reflect.ownKeys(padModel))delete padModel[key];Object.setPrototypeOf(padModel,scope.tE.prototype);Object.assign(padModel,sourcePad,{_globalIndex:expectedScene.ownedPadId,_dataState:0,_parent:compModel,_stateWatcher:padView});padView._bbox=padModel._bbox;
for(const plan of ${JSON.stringify(plans)})Object.defineProperty(scope[plan.role].prototype,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});`;
function fixture(after = ""): ReturnType<typeof createContext> {
 const realm = createContext({ TextEncoder }); runInContext(spatialScene + qualifiedSpatialScene + componentPointScene + cloned + after, realm);
 runInContext(`globalThis.bundle=(${BINDINGS}).call({object:scope},callback,expectedScene);`, realm); return realm;
}
function read(realm: ReturnType<typeof createContext>, program = READ): unknown { return runInContext(`(${program}).call(bundle,{kind:"point",xMil:50,yMil:0})`, realm) as unknown; }
void test("cloned-tE mode compares both template and indexed geometry without inventing a wrapper link", () => {
 const realm = fixture(), result = decode({ result: { type: "string", value: read(realm) } });
 assert.deepEqual(result.identities, [{ primitiveId: "d".repeat(16) + "e".repeat(16), family: "Pad" }]);
 assert.equal(result.templateGeometryMatched, true); assert.equal(result.templateReferenceLinked, false); assert.equal(result.sourceMembershipVerified, false);
 assert.equal(runInContext("metrics.hits", realm), 2);
 const constructorState = fixture("padModel._dataState=5202"); assert.equal(decode({ result: { type: "string", value: read(constructorState) } }).cloneModelState, 5202);
 const gpu = fixture(); runInContext(`globalThis.bundle=(${GPU_BINDINGS}).call({object:scope},callback,expectedScene);`, gpu);
 assert.throws(() => read(gpu, GPU_READ), /PCB209_SPATIAL_READ_REFUSED/u); assert.equal(runInContext("metrics.hits", gpu), 0);
});
void test("foreign clone classes, wrapper links, dirty geometry and changed template fields refuse before hits", () => {
 for (const change of ["Object.setPrototypeOf(padModel,scope.rE.prototype)", "padModel._model=sourcePad", "padModel._dataState=2", "padModel._dataState=4", "padModel._parent={}", "padModel._type=2", "padModel._plated=true", "padModel._center={x:0,y:0}", "padModel._top={type:'ELLIPSE',width:20,height:20}", "sourcePad._type=2", "padView._smartPad={}"]) {
  const realm = fixture(change); assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, change); assert.equal(runInContext("metrics.hits", realm), 0, change);
 }
});
void test("five restored tE sites fit original419 IDs by limiting only the new variant to11 points", () => {
 assert.equal(plans.length, 5); assert.equal(budget(11).fullWorkflow, 419); assert.equal(budget(11).calleeProperties, 295); assert.throws(() => budget(12));
 assert.equal(currentPcb209ComponentClonedPointQueriesSchema.safeParse(Array.from({ length: 11 }, () => ({ kind: "point", xMil: 0, yMil: 0 }))).success, true);
 assert.equal(currentPcb209ComponentClonedPointQueriesSchema.safeParse(Array.from({ length: 12 }, () => ({ kind: "point", xMil: 0, yMil: 0 }))).success, false);
 const command = { id: 419, sessionId: "s".repeat(128), method: "Runtime.callFunctionOn", params: { objectId: "o".repeat(256), functionDeclaration: READ, objectGroup: "easyeda-pro-control-pcb209-component-spatial-v1", throwOnSideEffect: false, silent: true, awaitPromise: false, userGesture: false, generatePreview: false, returnByValue: true, arguments: [{ value: { kind: "point", xMil: -10_000_000, yMil: -10_000_000 } }] } };
 const bytes = Buffer.byteLength(JSON.stringify(command)) + 1 + 2 * (32 - String(-10_000_000).length); assert.ok(bytes <= 65_536);
});

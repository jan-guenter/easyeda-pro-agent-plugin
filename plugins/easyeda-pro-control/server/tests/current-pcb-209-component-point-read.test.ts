/** Synthetic graph/point instrumentation only; original callee/native source
 * and geometry proofs are separate, with every acceptance flag still false. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION, CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION, currentPcb209ComponentPointQueriesSchema, decodeCurrentPcb209ComponentPointReply } from "../src/current-pcb-209-component-point-read.ts";
import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES, deriveCurrentPcb209ComponentCompletePointBudget } from "../src/current-pcb-209-component-point-complete-source-profile.ts";
import { CURRENT_PCB_SPATIAL_PROFILE } from "../src/current-pcb-spatial-profile.ts";
import { componentPointScene } from "./helpers/current-pcb-component-point-scene.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";

function fixture(after = ""): ReturnType<typeof createContext> { const realm = createContext({ TextEncoder }); runInContext(spatialScene + qualifiedSpatialScene + componentPointScene, realm);
  runInContext(`globalThis.bundle=(${CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION}).call({object:scope},callback,expectedScene);${after}`, realm); return realm; }
function read(realm: ReturnType<typeof createContext>, xMil = 50): unknown { const value: unknown = runInContext(`(${CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION}).call(bundle,{kind:"point",xMil:${String(xMil)},yMil:0})`, realm); return value; }
void test("complete generated cache/parent/index graph retains hidden ATTRs and original Component/Pad winner", () => {
  const realm = fixture(); const pad = decodeCurrentPcb209ComponentPointReply({ result: { type: "string", value: read(realm) } });
  assert.deepEqual(pad.identities, [{ primitiveId: "d".repeat(16) + "e".repeat(16), family: "Pad" }]); assert.equal(pad.sceneHiddenAttributeCount, 2); assert.equal(pad.sourceMembershipVerified, false);
  const component = decodeCurrentPcb209ComponentPointReply({ result: { type: "string", value: read(realm, 80) } }); assert.deepEqual(component.identities, [{ primitiveId: "d".repeat(16), family: "Component" }]); assert.equal(runInContext("metrics.hits", realm), 4);
});
void test("missing/stale cache, foreign parents, shown or unready ATTRs and all other families refuse before hits", () => {
  for (const change of ["cache._layeredBoxMap=null", "cache.items.delete(expectedScene.padId)", "scope.Li.manager={}", "sourcePad._top.width=19", "compModel._position.x=1", "padModel._parent={}", "attrModels[0].base.showValue=true", "attrViews[0].textChange=true", "attrTree.items.delete(attrViews[0])", "Ht.map.set('Via',new Map)", "Ht.map.set('Track',new Map)", "Ht.map.set('ArcTrack',new Map)", "cache.attrDataMap.get('Footprint').index='borrowed'", "Fe.items=[compView]"]) {
    const realm = fixture(change); assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, change); assert.equal(runInContext("metrics.hits", realm), 0, change);
  }
});
void test("only the exact template constructor bitmap is admitted; indexed Pad readiness stays strict", () => {
  // oxlint-disable-next-line eslint/no-bitwise -- Exercise each independent native bitmap bit without accepting a dirty-mask class.
  for (const state of [0, 2, 5200, ...Array.from({ length: 21 }, (_, bit) => 5202 ^ (1 << bit))]) {
    const realm = fixture(`sourcePad._dataState=${String(state)}`);
    assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, `template state ${String(state)}`);
    assert.equal(runInContext("metrics.hits", realm), 0);
  }
  for (const state of [2, 4, 5202]) {
    const realm = fixture(`padModel._dataState=${String(state)}`);
    assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, `indexed state ${String(state)}`);
    assert.equal(runInContext("metrics.hits", realm), 0);
  }
});
void test("retained cache/ATTR/scratch mutation refuses after the first sample and exact290/419 budget leaves old384 unchanged", () => {
  for (const change of ["cache._layeredBoxMap[1].maxX=11", "attrModels[0].base.showValue=true", "scope.ws._modify=true", "cache.components.clear()", "attrTree.items.clear()"] ) {
    const realm = fixture(`hook.run=()=>{${change}}`); assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, change); assert.equal(runInContext("metrics.hits", realm), 1, change);
  }
  assert.equal(CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES.length, 290); assert.equal(deriveCurrentPcb209ComponentCompletePointBudget(16).fullWorkflow, 419);
  assert.equal(CURRENT_PCB_SPATIAL_PROFILE.requestLimit, 384); assert.equal(CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit, 383);
  assert.equal(currentPcb209ComponentPointQueriesSchema.safeParse(Array.from({ length: 16 }, () => ({ kind: "point", xMil: 0, yMil: 0 }))).success, true);
  assert.equal(currentPcb209ComponentPointQueriesSchema.safeParse([{ kind: "region", mode: "inside", leftMil: -100, rightMil: 100, bottomMil: -100, topMil: 100 }]).success, false);
});

void test("component evidence rejects duplicate keys and accessor envelopes before getter effects", () => {
  const text = read(fixture()); assert.equal(typeof text, "string"); assert.ok(typeof text === "string");
  assert.throws(() => decodeCurrentPcb209ComponentPointReply({ result: { type: "string", value: `{"schema":"contradiction",${text.slice(1)}` } }));
  let getters = 0; const envelope = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { getters += 1; throw new Error("foreign getter"); } });
  assert.throws(() => decodeCurrentPcb209ComponentPointReply(envelope)); assert.equal(getters, 0);
  assert.equal(Object.isFrozen(decodeCurrentPcb209ComponentPointReply({ result: { type: "string", value: text } })), true);
});

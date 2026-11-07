import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialArcQueriesSchema, decodeCurrentPcb209SpatialArcReply } from "../src/current-pcb-209-spatial-arc-read.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS } from "../src/current-pcb-209-spatial-arc-source-profile.ts";
import { CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION } from "../src/current-pcb-spatial-profile.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";
import { spatialTrackScene } from "./helpers/current-pcb-spatial-track-scene.ts";

// Instrumented synthetic functions test custody and refusal ordering. Vendor
// Function bodies and embedded runtime qualification have separate evidence.
const arcScene = `
for(const key of ["Oi","vi","tF"])scope[key]=class{};
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS)})){
if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}}
for(const plan of ${JSON.stringify(CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PLANS)}){
if(plan.target!=="prototype")continue;Object.defineProperty(scope[plan.role].prototype,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});}
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS)}))
for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
scope.le={0:"CW",1:"CCW",CW:0,CCW:1};scope.Fr=Math.PI*2;
const arcCom=Object.assign(new scope.oie,{layerId:1,width:1,locked:false,net:"GND"});
const arcBase=Object.assign(new scope.tF,{_center:Object.assign(new scope.E,{x:0,y:0}),_radius:1,_startAngle:0,_endAngle:Math.PI/2,_sweep:1,_arcType:1});
const arcBox=new at(-1.5,1.5,-1.5,1.5),arcModel=Object.assign(new scope.vi,{_dataState:0,_globalIndex:"arc-one",modelType:"ArcTrack",com:arcCom,_baseModel:arcBase,_bbox:arcBox});
const arcView=Object.assign(new scope.Oi,{model:arcModel,_dataState:1,_bbox:arcBox});arcModel._stateWatcher=arcView;
const arcRoot=Object.assign(new BI,{parent:null,childs:[arcView],_bbox:arcBox});
const arcTree=Object.assign(new Nd,{items:new Set([arcView]),changeList:new Set,deadList:new Set,root:arcRoot});
Ht.map.set("ArcTrack",new Map([[1,arcTree]]));Fe.items=[arcView,trackView,view];
Hr.pointSelect=function(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return [arcView]};
Hr.getSelectInside=function(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([arcView,trackView,view])};
Hr.getSelectContect=Hr.getSelectInside;
`;
/** Construct a new synthetic realm before its original binding capture. */
function fixture(after = ""): ReturnType<typeof createContext> {
  const realm = createContext({ TextEncoder });
  runInContext(spatialScene + qualifiedSpatialScene + spatialTrackScene + arcScene, realm);
  runInContext(`globalThis.bundle=(${CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION}).call({object:scope},callback)`, realm);
  runInContext(after, realm); return realm;
}
/** Execute the fixed module program only inside this test's synthetic realm. */
function read(realm: ReturnType<typeof createContext>, query: unknown): unknown {
  return runInContext(`(${CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION}).call(bundle,${JSON.stringify(query)})`, realm) as unknown;
}
const point = { kind: "point", xMil: 0, yMil: 0 } as const;

void test("Arc/Line/Via kernel preserves native identity and complete selected order", () => {
  const region = { kind: "region", mode: "inside", leftMil: -20, rightMil: 20, bottomMil: -20, topMil: 20 } as const;
  for (const query of [point, region, { ...region, mode: "intersects" }] as const) {
    const realm = fixture(); const raw = read(realm, query);
    const result = decodeCurrentPcb209SpatialArcReply({ result: { type: "string", value: raw } });
    assert.deepEqual(result.identities, query.kind === "point" ? [{ primitiveId: "arc-one", family: "Arc" }] :
      [{ primitiveId: "arc-one", family: "Arc" }, { primitiveId: "track-one", family: "Line" }, { primitiveId: "via-one", family: "Via" }]);
    assert.deepEqual(result.selectedPrimitiveIds, ["arc-one", "track-one", "via-one"]);
    assert.equal(result.sceneArcCount, 1); assert.equal(result.sceneLineCount, 1); assert.equal(result.sceneViaCount, 1);
    assert.equal(runInContext("metrics.hits", realm), 2); assert.equal(result.sourceMembershipVerified, false);
  }
});

void test("unsupported or pending Arc state refuses before any native hit", () => {
  for (const change of [
    "arcCom.locked=true", "arcCom.width=.01", "arcCom.layerId=2", "arcBase._radius=0", "arcBase._startAngle=-1",
    "arcBase._endAngle=7", "arcBase._sweep=2", "arcBase._arcType=2", "arcBase.extra=1", "arcModel._parent={}",
    "arcTree.changeList.add(arcView)", "arcTree.deadList.add(arcView)", "arcRoot.childs.push(arcView)",
    "arcTree.items.delete(arcView)", "arcModel._stateWatcher=view", "arcModel._bbox=new at(-1,1,-1,1)",
    "scope.le.CW=1", "scope.Fr=6", "arcView.isSelect=()=>{metrics.hits++;return true}",
  ]) {
    const realm = fixture(change);
    assert.throws(() => read(realm, point), /PCB209_SPATIAL_(?:READ|CAPTURE)_REFUSED/u, change);
    assert.equal(runInContext("metrics.hits", realm), 0, change);
  }
});

void test("Arc source and selection drift stop the second sample and border crossings stop the first", () => {
  for (const change of ["arcBase._radius=2", "arcBase._center.x=2", "arcCom.net='other'", "Fe.items=[]", "arcTree.items.clear()"]) {
    const realm = fixture(`hook.run=()=>{${change}}`);
    assert.throws(() => read(realm, point), /PCB209_SPATIAL_READ_REFUSED/u, change);
    assert.equal(runInContext("metrics.hits", realm), 1);
  }
  const realm = fixture();
  assert.throws(() => read(realm, { kind: "region", mode: "intersects", leftMil: -5, rightMil: 5, bottomMil: -5, topMil: 5 }), /PCB209_SPATIAL_READ_REFUSED/u);
  assert.equal(runInContext("metrics.hits", realm), 0);
});

void test("265 callees and six queries preserve the existing native command and request bounds", () => {
  assert.equal(CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION.calleeProperties, 265);
  assert.equal(CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION.fullWorkflow, 384);
  assert.equal(CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION.headroom, 0);
  assert.equal(currentPcb209SpatialArcQueriesSchema.safeParse(Array.from({ length: 6 }, () => point)).success, true);
  assert.equal(currentPcb209SpatialArcQueriesSchema.safeParse(Array.from({ length: 7 }, () => point)).success, false);
  assert.ok(Buffer.byteLength(JSON.stringify({ functionDeclaration: CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION })) + 2048 < 65_536);
});

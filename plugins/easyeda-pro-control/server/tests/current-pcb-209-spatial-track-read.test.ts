import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialTrackQueriesSchema, decodeCurrentPcb209SpatialTrackReply } from "../src/current-pcb-209-spatial-track-read.ts";
import { CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS } from "../src/current-pcb-209-spatial-track-source-profile.ts";
import { CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION } from "../src/current-pcb-spatial-profile.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";

// These instrumented native methods test guard ordering and complete scene
// Custody. They do not establish vendor geometry or connected execution.
const trackScene = `
for(const key of ["xr","qr","mt","bR","lEe","bC","oie"])scope[key]=class{};
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS)})){
if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}}
for(const plan of ${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS)}){
if(plan.target!=="prototype")continue;const owner=scope[plan.role].prototype;
if(plan.getter||!Object.hasOwn(owner,plan.property))Object.defineProperty(owner,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});}
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS)}))
for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
scope.yh=new scope.lEe;zi.manager.map.set(4,new wl(4));
ye._layerMap[1]={model:{status:{state:6}}};ye._layerMap[2]={model:{status:{state:6}}};
const shape=Object.assign(new scope.bC,{minX:-1,maxX:1,minY:-1,maxY:1,left_lower_x:-2,right_lower_x:2,left_upper_x:-2,right_upper_x:2});
const start=Object.assign(new scope.E,{x:-.5,y:0}),end=Object.assign(new scope.E,{x:.5,y:0});
const com=Object.assign(new scope.oie,{layerId:1,width:1,locked:false,net:"GND"});
const trackBase=Object.assign(new scope.bR,{_start:start,_end:end});
const trackModel=Object.assign(new scope.qr,{_dataState:0,_globalIndex:"track-one",modelType:"Track",com,_baseModel:trackBase,_bbox:new at(-1,1,-1,1)});
const trackView=Object.assign(new scope.xr,{model:trackModel,_dataState:1,_bbox:shape});trackModel._stateWatcher=trackView;
const trackRoot=Object.assign(new iy,{parent:null,childs:[trackView],_octagon:shape});
const trackTree=Object.assign(new V0,{items:new Set([trackView]),changeList:new Set,deadList:new Set,root:trackRoot});
Ht.map.set("Track",new Map([[1,trackTree]]));Sr.items=[trackView,view];
Hr.pointSelect=function(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return [trackView]};
Hr.getSelectInside=function(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([trackView,view])};
Hr.getSelectContect=Hr.getSelectInside;
`;

/** Make one synthetic original realm before capturing its fixed binding set. */
function fixture(before = "", after = ""): ReturnType<typeof createContext> {
  const realm = createContext({ TextEncoder });
  runInContext(spatialScene + qualifiedSpatialScene + trackScene + before, realm);
  runInContext(`globalThis.bundle=(${CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION}).call({object:scope},callback)`, realm);
  runInContext(after, realm); return realm;
}
/** Invoke the fixed program; caller code is confined to this test fixture. */
function read(realm: ReturnType<typeof createContext>, query: unknown): unknown {
  return runInContext(`(${CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION}).call(bundle,${JSON.stringify(query)})`, realm) as unknown;
}
const point = { kind: "point", xMil: 0, yMil: 0 } as const;

void test("mixed kernel retains native Line/Via order and complete selection over two samples", () => {
  const region = { kind: "region", mode: "inside", leftMil: -20, rightMil: 20, bottomMil: -20, topMil: 20 } as const;
  for (const query of [point, region, { ...region, mode: "intersects" }] as const) {
    const realm = fixture(), value = read(realm, query);
    const result = decodeCurrentPcb209SpatialTrackReply({ result: { type: "string", value } });
    assert.deepEqual(result.identities, query.kind === "point" ? [{ primitiveId: "track-one", family: "Line" }] :
      [{ primitiveId: "track-one", family: "Line" }, { primitiveId: "via-one", family: "Via" }]);
    assert.deepEqual(result.selectedPrimitiveIds, ["track-one", "via-one"]);
    assert.equal(result.sceneViaCount, 1); assert.equal(result.sceneLineCount, 1);
    assert.equal(runInContext("metrics.hits", realm), 2); assert.equal(result.persistenceVerified, false);
  }
});

void test("mixed guards reject unsupported, locked, stale or mismatched Track state before a hit", () => {
  for (const change of [
    "com.locked=true", "com.width=0", "com.width=.01", "com.layerId=2", "trackModel._dataState=4", "trackView._dataState=4",
    "end.x=start.x;end.y=start.y", "trackTree.changeList.add(trackView)", "trackTree.deadList.add(trackView)",
    "trackRoot.childs.push(trackView)", "trackRoot.childs=[]", "trackTree.items.delete(trackView)",
    "trackModel._parent={}", "trackModel._partition='other'", "shape.minX=-2", "trackView._bbox=new at(-1,1,-1,1)",
    "com.extra=1", "trackModel._stateWatcher=view", "trackModel._globalIndex='via-one'", "Ht.map.set('Pad',new Map)",
    "trackView.octagon=()=>{metrics.hits++;return shape}", "start.x=Infinity",
  ]) {
    const realm = fixture("", change);
    assert.throws(() => read(realm, point), /PCB209_SPATIAL_(?:READ|CAPTURE)_REFUSED/u, change);
    assert.equal(runInContext("metrics.hits", realm), 0, change);
  }
});

void test("Track source, index, geometry and selection changes prevent a second sample", () => {
  for (const change of ["com.net='other'", "start.x=1", "trackTree.items.delete(trackView)", "Sr.items=[]", "trackRoot._octagon={}"]) {
    const realm = fixture("", `hook.run=()=>{${change}}`);
    assert.throws(() => read(realm, point), /PCB209_SPATIAL_READ_REFUSED/u, change);
    assert.equal(runInContext("metrics.hits", realm), 1, change);
  }
});

void test("mixed batch reserves all original qualification requests and release without raising caps", () => {
  assert.equal(CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.calleeProperties, 256);
  assert.equal(CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.fullWorkflow, 384);
  assert.equal(CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.headroom, 0);
  assert.equal(currentPcb209SpatialTrackQueriesSchema.safeParse(Array.from({ length: 15 }, () => point)).success, true);
  assert.equal(currentPcb209SpatialTrackQueriesSchema.safeParse(Array.from({ length: 16 }, () => point)).success, false);
  const command = { id: 383, method: "Runtime.callFunctionOn", sessionId: "s".repeat(128), params: {
    objectId: "o".repeat(256), functionDeclaration: CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION,
    arguments: [{ value: { ...point, xMil: -9_999_999.999999998, yMil: 9_999_999.999999998 } }],
  } };
  assert.ok(Buffer.byteLength(JSON.stringify(command)) < 65_536);
});

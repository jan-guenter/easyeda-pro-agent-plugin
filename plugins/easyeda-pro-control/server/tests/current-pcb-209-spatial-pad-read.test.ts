import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION,
  currentPcb209SpatialPadQueriesSchema, decodeCurrentPcb209SpatialPadReply } from "../src/current-pcb-209-spatial-pad-read.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES } from "../src/current-pcb-209-spatial-pad-source-profile.ts";
import { CURRENT_PCB_SPATIAL_PAD_REQUEST_DERIVATION } from "../src/current-pcb-spatial-profile.ts";
import { spatialPadScene } from "./helpers/current-pcb-spatial-pad-scene.ts";
import { qualifiedSpatialScene, spatialScene } from "./helpers/current-pcb-spatial-scene.ts";

function fixture(after = ""): ReturnType<typeof createContext> { const realm = createContext({ TextEncoder });
  runInContext(spatialScene + qualifiedSpatialScene + spatialPadScene, realm);
  runInContext(`globalThis.bundle=(${CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION}).call({object:scope},callback);${after}`, realm); return realm; }
const point = { kind: "point", xMil: 50, yMil: 0 } as const;
function read(realm: ReturnType<typeof createContext>, query: unknown = point): unknown { return runInContext(`(${CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION}).call(bundle,${JSON.stringify(query)})`, realm) as unknown; }
void test("standalone Pad point preserves original winner and exact selection in both samples", () => {
  const realm = fixture(); const result = decodeCurrentPcb209SpatialPadReply({ result: { type: "string", value: read(realm) } });
  assert.deepEqual(result.identities, [{ primitiveId: "standalone-pad", family: "Pad" }]); assert.deepEqual(result.selectedPrimitiveIds, ["standalone-pad"]);
  assert.equal(result.scenePadCount, 1); assert.equal(result.sourceMembershipVerified, false); assert.equal(runInContext("metrics.hits", realm), 2);
});
void test("excluded families, regions and unsupported Pad geometry fail before hits", () => {
  for (const change of ["Ht.map.set('Component',new Map)", "Ht.map.set('Via',new Map)", "Ht.map.set('Track',new Map)", "Ht.map.set('Text',new Map)",
    "padTree.changeList.add(padView)", "padModel._rotation=1", "padModel._parent={}", "padView._parent={}", "padModel._padType=1", "circle.type='RECT'", "circle.height=1", "padView._smartPad={}", "padModel._dataState=2", "padModel._bbox=new at(3,7,-1,1)", "padTree.items.delete(padView)"]) {
    const realm = fixture(change); assert.throws(() => read(realm), /PCB209_SPATIAL/u, change); assert.equal(runInContext("metrics.hits", realm), 0, change);
  }
  const realm = fixture(); assert.throws(() => read(realm, { kind: "region", mode: "inside", leftMil: -100, rightMil: 100, bottomMil: -100, topMil: 100 })); assert.equal(runInContext("metrics.hits", realm), 0);
});
void test("second-sample drift refuses and215 original callees leave40 requests under384", () => {
  for (const change of ["center.x=6", "circle.width=3", "Fe.items=[]", "padTree.items.clear()"]) {
    const realm = fixture(`hook.run=()=>{${change}}`); assert.throws(() => read(realm), /PCB209_SPATIAL_READ_REFUSED/u, change); assert.equal(runInContext("metrics.hits", realm), 1, change);
  }
  assert.equal(CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES.length, 215); assert.equal(CURRENT_PCB_SPATIAL_PAD_REQUEST_DERIVATION.fullWorkflow, 344);
  assert.equal(currentPcb209SpatialPadQueriesSchema.safeParse(Array.from({ length: 16 }, () => point)).success, true);
  assert.equal(currentPcb209SpatialPadQueriesSchema.safeParse(Array.from({ length: 17 }, () => point)).success, false);
  assert.ok(Buffer.byteLength(JSON.stringify({ functionDeclaration: CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION })) + 2048 < 65_536);
});

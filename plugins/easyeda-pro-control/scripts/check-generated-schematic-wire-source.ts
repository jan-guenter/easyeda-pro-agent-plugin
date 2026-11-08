/** Pin actual installed source and execute its geometry methods on an inert
 * host graph. No original application instance, action or owner is supplied. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE, GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE } from "../server/src/generated-schematic-wire-source.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE } from "../server/src/generated-schematic-wire-native-source.ts";

async function main(): Promise<void> {
const assetsRoot = process.argv[2] ?? process.env["EASYEDA_ASSETS_ROOT"];
if (assetsRoot === undefined || assetsRoot === "") { throw new Error("EASYEDA_ASSETS_ROOT_REQUIRED"); }
for (const file of GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE.files) {
  const bytes: Buffer = await readFile(join(assetsRoot, file.relativePath)); assert.equal(bytes.length, file.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
  const method = bytes.toString("utf8").slice(file.setLines.start, file.setLines.end);
  assert.equal(createHash("sha256").update(method).digest("hex"), file.setLines.sha256); assert.equal(method, GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE);
  const result: unknown = runInNewContext(`const line={id:"original-line",points:[{x:0,y:0},{x:100,y:0}]},originalPoints=line.points;
    const group={_lines:new Set([line]),createLineBaseOn(){throw Error("unexpected allocation");}},Cr=()=>{throw Error("unexpected deletion");},qt={};
    const replacement=[{x:20,y:-30},{x:120,y:-30}],methods={${method}};
    methods.setLines.call(group,[{id:line.id,points:replacement}]);
    ({sameLine:[...group._lines][0]===line,originalPointsIntact:JSON.stringify(originalPoints)==='[{"x":0,"y":0},{"x":100,"y":0}]',replacementInstalled:line.points===replacement,points:line.points,lines:group._lines.size});`, {}, { timeout: 1000 });
  assert.equal(JSON.stringify(result), JSON.stringify({ sameLine: true, originalPointsIntact: true, replacementInstalled: true, points: [{ x: 20, y: -30 }, { x: 120, y: -30 }], lines: 1 }));
  const full = bytes.toString("utf8"), native = GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE.find(row => row.relativePath === file.relativePath); assert.ok(native !== undefined);
  for (const pin of Object.values(native.methods)) { assert.equal(createHash("sha256").update(full.slice(pin.start, pin.end)).digest("hex"), pin.sha256); }
  const take = (role: keyof typeof native.methods): string => { const pin = native.methods[role]; return full.slice(pin.start, pin.end); };
  assert.equal(take("pointConstructor"), native.methods.pointConstructor.source);
  const constructor = take("pointConstructor"); const normal = take("pointNormal"); const normalName = /this\.x=([A-Za-z\d_$]+)\.normal/u.exec(constructor)?.[1];
  const floatName = /,([A-Za-z\d_$]+)\[0\]=e/u.exec(constructor)?.[1], intName = /this\.hashed=([A-Za-z\d_$]+)\[0\]/u.exec(constructor)?.[1];
  assert.ok(normalName !== undefined && floatName !== undefined && intName !== undefined);
  // Execute actual constructor/normal/points/setLines/refresh/watch/sort bodies.
  // Only their host graph and monitor/event services are inert substitutes.
  const actual: unknown = runInNewContext(`const qt={},Cr=()=>{throw Error("deletion")},memory=new ArrayBuffer(16),${floatName}=new Float64Array(memory),${intName}=new Int32Array(memory),${normalName}={${normal.replace(/^static /u, "")}},Point=${constructor};
const methods={${take("pointsGet")},${take("pointsSet")},${method},${take("sortChildren")},${take("refreshNetPoint")},${take("netPointWatch")}},records=[],index=new Map;let allocations=0,removals=0,refreshes=0,callback;
const line={id:"original-line",shapeManager:{modifyMonitor:{record(value){records.push(value)}}},_points:[new Point(0,0),new Point(100,0)]};Object.defineProperty(line,"points",Object.getOwnPropertyDescriptor(methods,"points"));
const attr={id:"explicit-Relevance",zIndex:1},wire={_lines:new Set([line]),_netNames:new Set,_customAttrMap:new Map([["Relevance",attr]]),_unConnectDotModels:new Set,children:[line,attr],invalidZIndexChildMap:new Map([[attr.id,attr]]),minChildZIndex:0,maxChildZIndex:1,createLineBaseOn(){allocations++;throw Error("allocation")},sortChildrenByCategory:methods.sortChildrenByCategory,appendChild(dot){dot.parent=this;this._unConnectDotModels.add(dot);this.children.push(dot);this.invalidZIndexChildMap.set(dot.id,dot);index.set(dot.id,dot);}};line.parent=wire;attr.parent=wire;
const shapes={actionRunner:{running:true},bboxMonitor:{onUpdate(fn){callback=fn}},unConnectDot(args){const dot={id:args.id,cx:args.cx,cy:args.cy};let parent=null;Object.defineProperty(dot,"parent",{get(){return parent},set(next){if(parent&&next===null){removals++;parent._unConnectDotModels.delete(dot);parent.children=parent.children.filter(child=>child!==dot);manager.unConnectDotModels.delete(dot);index.delete(dot.id)}parent=next;if(next)manager.unConnectDotModels.add(dot)}});return dot;}};
const manager={shapeManager:shapes,_watchSubscriptions:{register(){}},junctionModels:new Set,unConnectDotModels:new Set,analyzeNetPointData(){return{wireUnConnect:line.points.map(p=>({x:p.x,y:p.y,Wire:new Set([line]),wireNetGroup:wire})),pinUnConnected:[],junction:[]}},refreshNetPoint(){refreshes++;return methods.refreshNetPoint.call(this)}};
methods.watch.call(manager);manager.refreshNetPoint();const originalDots=[...manager.unConnectDotModels],beforePoints=line.points;callback({modelTypes:new Set(["Text"])});const textDidNotRefresh=refreshes===1;
const replacement=[new Point(20,-30),new Point(120,-30)];methods.setLines.call(wire,[{id:line.id,points:replacement}]);callback({modelTypes:new Set(["Wire"])});
({sameLine:[...wire._lines][0]===line,oneRecord:records.length===1&&records[0].model===line&&records[0].attr==="points"&&records[0].oldValue===beforePoints&&records[0].newValue===replacement,oldPoints:beforePoints.map(p=>[p.x,p.y]),points:line.points.map(p=>[p.x,p.y]),pointPrototype:line.points.every(p=>Object.getPrototypeOf(p)===Point.prototype),attrIndex:attr.zIndex,childIndices:wire.children.map(child=>child.zIndex),dots:manager.unConnectDotModels.size,oldDotsRemoved:originalDots.every(dot=>dot.parent===null),dotPoints:[...manager.unConnectDotModels].map(dot=>[dot.cx,dot.cy]),refreshes,textDidNotRefresh,allocations,removals});`, {}, { timeout: 1000 });
  assert.equal(JSON.stringify(actual), JSON.stringify({ sameLine: true, oneRecord: true, oldPoints: [[0, 0], [100, 0]], points: [[20, -30], [120, -30]], pointPrototype: true,
    attrIndex: 3, childIndices: [0, 1, 2, 3], dots: 2, oldDotsRemoved: true, dotPoints: [[20, -30], [120, -30]], refreshes: 2, textDidNotRefresh: true, allocations: 0, removals: 2 }));
}
process.stdout.write(`${JSON.stringify({ ok: true, exactFiles: 2, existingIdSelectionOnly: true, actualGeometryMethodsExecutedInertly: true, exactTwoDerivedEndpointDots: true, nativeRelevanceIndex: 3, originalInvocationObserved: false, writerAuthority: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Offline CLI awaits its source checks; runtime does not import it.
await main();

import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { parseCurrentPcbGeometryRequest, queryCurrentPcbGeometry, validateCurrentPcbGeometryArguments,
  validateCurrentPcbGeometryResult } from "../src/current-pcb-geometry.ts";
import type { CurrentPcbGeometryRequest } from "../src/current-pcb-geometry.ts";
import { buildCurrentPcbGeometryProgram } from "../src/current-pcb-geometry-program.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
function request(primitiveIds?: string[]): CurrentPcbGeometryRequest {
  return parseCurrentPcbGeometryRequest({ method: primitiveIds === undefined ? "eda.pcb_PrimitiveImage.getAll" : "eda.pcb_PrimitiveImage.get",
    arguments: primitiveIds === undefined ? {} : { primitiveIds }, target });
}
const defaults = [
  { globalIndex: "vector-image", imageType: "Image", locked: false, layerId: 3, start: { x: 12.1234567, y: -20.1234567 },
    width: 33.1234567, height: 42.1234567, rotation: -45.1234567, mirror: true },
  { globalIndex: "picture", imageType: "Picture", locked: true, layerId: 4, start: { x: -3, y: 4 },
    width: 0, height: 0, rotation: 359.1234567, mirror: false },
];
interface Options { input?: CurrentPcbGeometryRequest; before?: string; beforeChild?: string; afterCall?: string; fastDeadline?: boolean; }
function environment(options: Options = {}): { run: () => Promise<unknown>; inspect: (source: string) => unknown } {
  const input = options.input ?? request();
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.equal(timeout, 0);
    if (topic === "getTabIdAndDocType") { assert.equal(arg, undefined); }
    else {
      assert.equal(topic, "pcb/extensionAPI/image-getAll");
      assert.ok(arg !== null && typeof arg === "object"); assert.deepEqual(Object.keys(arg), []);
    }
  } });
  runInContext(`globalThis.rows=${JSON.stringify(defaults)};globalThis.calls=0;globalThis.dataReads=0;globalThis.getterReads=0;
globalThis.identity={tabId:${JSON.stringify(input.target.tabId)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');
checkCall(topic,arg,timeout);calls++;await Promise.resolve();if(topic!=='getTabIdAndDocType')dataReads++;
${options.afterCall ?? ""}return {message:topic==='getTabIdAndDocType'?identity:rows};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};${options.beforeChild ?? ""}`, childContext, { timeout: 1000 });
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, TextEncoder, setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => { assert.equal(delay, 10_000); return setTimeout(callback, 1); }
    : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.target=${JSON.stringify(input.target)};globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};globalThis.activeTab=target.tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tab.tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={'c_dbid':target.tabId,'c_doctype':'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbGeometryProgram(input)}})()`, context, { timeout: 1000 }) as unknown),
    inspect: (source: string): unknown => runInContext(source, childContext, { timeout: 1000 }) as unknown };
}

void test("Image geometry preserves vector/Picture order, native mil/degrees and zero dimensions without asset fields", async () => {
  const input = request();
  const fixture = environment({ input, beforeChild: `
class Point {constructor(point){this.x=point.x;this.y=point.y;this._hashed=1;}get hashed(){getterReads++;throw new Error('PRIVATE_POINT_CACHE');}}
for(const row of rows){row.start=new Point(row.start);
for(const key of ['template','pathString','hashId','source','binaryData','silkColor','partition','groupId','parent','net'])
Object.defineProperty(row,key,{get(){getterReads++;throw new Error('PRIVATE_IMAGE_CONTENT');}});}` });
  const result = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await fixture.run()));
  assert.deepEqual(result["value"], defaults.map(row => ({ primitiveId: row.globalIndex, primitiveType: "Image", imageType: row.imageType,
    primitiveLock: row.locked, layer: row.layerId, x: row.start.x, y: row.start.y, width: row.width, height: row.height,
    rotation: row.rotation, horizonMirror: row.mirror })));
  assert.equal(fixture.inspect("getterReads"), 0); assert.equal(fixture.inspect("calls"), 6); assert.equal(fixture.inspect("dataReads"), 2);
  assert.equal(result["implementationKind"], "native-task-equivalent"); assert.equal(result["liveValidation"], "not-recorded");
  for (const field of ["cadAuthority", "persistenceVerified", "sourceMembershipVerified"]) { assert.equal(result[field], false); }
  assert.deepEqual(result["units"], { linear: "mil", arcAngle: "degrees", rotation: "degrees" });
  assert.match(JSON.stringify(result["limitations"]), /asset-backed source getter/u);
  const empty = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await environment({ beforeChild: "rows=[];" }).run()));
  assert.deepEqual(empty["value"], []); assert.equal(empty["observedRowCount"], 0);
});

void test("Image get selects from both complete samples in caller order and refuses all missing IDs", async () => {
  const input = request(["picture", "vector-image"]);
  const fixture = environment({ input });
  const result = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await fixture.run()));
  assert.ok(Array.isArray(result["value"]));
  assert.deepEqual(result["value"].map((row: Record<string, unknown>) => row["primitiveId"]), ["picture", "vector-image"]);
  assert.equal(result["returnedRowCount"], 2); assert.equal(result["observedRowCount"], 2); assert.equal(fixture.inspect("dataReads"), 2);
  for (const ids of [["absent"], ["vector-image", "absent"], ["line-a"]]) {
    await assert.rejects(environment({ input: request(ids) }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
});

void test("Image schemas expose only the narrow read subset and reject filters/scalar IDs/asset output", async () => {
  const input = request();
  for (const method of ["eda.pcb_PrimitiveImage.getAll", "eda.pcb_PrimitiveImage.get"]) {
    const entries = queryCurrentPcbGeometry({ method, includeSchemas: true });
    assert.equal(entries["total"], 1); assert.equal(entries["offline"], true); assert.equal(entries["invocationEnabledByDiscovery"], false);
  }
  for (const invalid of [{ ...input, arguments: { layer: 3 } }, { ...input, arguments: { primitiveLock: false } },
    { ...input, method: "eda.pcb_PrimitiveImage.get", arguments: { primitiveIds: "vector-image" } },
    { ...input, method: "eda.pcb_PrimitiveImage.get", arguments: { primitiveIds: [] } },
    { ...input, method: "eda.pcb_PrimitiveImage.get", arguments: { primitiveIds: ["picture", "picture"] } },
    { ...input, method: "eda.pcb_PrimitiveImage.create" }, { ...input, code: "source()" }]) {
    assert.equal(validateCurrentPcbGeometryArguments(invalid)["valid"], false); assert.throws(() => buildCurrentPcbGeometryProgram(invalid));
  }
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
  const row: unknown = raw.rows[0]; assert.ok(row !== null && typeof row === "object");
  for (const patch of [{ imageType: "Raster" }, { width: -1 }, { height: Number.NaN }, { rotation: -0 },
    { horizonMirror: 1 }, { primitiveType: "Picture" }, { layer: 65_536 }, { pathString: "PRIVATE" }, { hashId: "PRIVATE" }]) {
    assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, rows: [{ ...row, ...patch }] }));
  }
});

void test("Image projection requires own data fields and never invokes missing/accessor data", async () => {
  for (const field of ["globalIndex", "imageType", "locked", "layerId", "start", "width", "height", "rotation", "mirror"]) {
    for (const beforeChild of [`delete rows[0][${JSON.stringify(field)}];`,
      `Object.defineProperty(rows[0],${JSON.stringify(field)},{get(){getterReads++;throw new Error('PRIVATE_IMAGE_FIELD');}});`]) {
      const fixture = environment({ beforeChild });
      await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(fixture.inspect("getterReads"), 0);
    }
  }
  for (const beforeChild of ["delete rows[0].start.x;", "rows[0].start.extra=1;",
    "Object.defineProperty(rows[0].start,'y',{get(){getterReads++;throw new Error('PRIVATE_POSITION');}});"] ) {
    const fixture = environment({ beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(fixture.inspect("getterReads"), 0);
  }
});

void test("Image projection rejects malformed, oversized and coerced native fields without defaults", async () => {
  for (const patch of ["width=-1", "height=-1", "width=Infinity", "height=NaN", "rotation=-0", "start.x=-0", "start.y=1e12+1",
    "width='1'", "height=null", "rotation=undefined", "mirror=1", "locked=null", "layerId=1.5", "layerId=65536",
    "imageType='Unknown'", "imageType=''", "globalIndex=''", "globalIndex='a'.repeat(257)"]) {
    await assert.rejects(environment({ beforeChild: `rows[0].${patch};` }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  for (const beforeChild of ["rows[1].globalIndex=rows[0].globalIndex;", "delete rows[0];", "rows.extra=1;",
    "rows=Array.from({length:257},(_,i)=>({...rows[0],globalIndex:String(i)}));"]) {
    await assert.rejects(environment({ beforeChild }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  const limit = validateCurrentPcbGeometryResult(request(), decodeExactReadEnvelope(await environment({
    beforeChild: "rows=Array.from({length:256},(_,i)=>({...rows[0],globalIndex:String(i)}));" }).run()));
  assert.equal(limit["observedRowCount"], 256);
});

void test("Image get validates every peer and refuses full-family scalar, kind, order or membership drift", async () => {
  const input = request(["vector-image"]);
  await assert.rejects(environment({ input, beforeChild: "rows[1].width=-1;" }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  for (const afterCall of ["if(dataReads===2)rows[1].width++;", "if(dataReads===2)rows[1].imageType='Image';",
    "if(dataReads===2)rows.reverse();", "if(dataReads===2)rows.pop();", "if(dataReads===2)rows[1].mirror=true;"]) {
    await assert.rejects(environment({ input, afterCall }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
});

void test("Image reader preserves exact frame/receiver identity checks across awaited replies", async () => {
  for (const afterCall of ["if(calls===1)parent.activeTab='other';", "if(calls===2)parent.gVars.currentProject.branchUuid='f'.repeat(32);",
    "if(calls===3)identity.docType=4;", "if(calls===4)parent.frame.isConnected=false;",
    "if(calls===5)MSG_BUS_PCB.messageBus={rpcCall:MSG_BUS_PCB.messageBus.rpcCall};", "if(calls===6)parent.tab.data.pid='f'.repeat(64);"]) {
    await assert.rejects(environment({ afterCall }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  const foreign = environment({ before: "location.href+='id='+ 'f'.repeat(64);document.URL=location.href;" });
  await assert.rejects(foreign.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(foreign.inspect("calls"), 0);
  await assert.rejects(environment({ fastDeadline: true,
    afterCall: "if(topic!=='getTabIdAndDocType')await new Promise(()=>{});" }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
});

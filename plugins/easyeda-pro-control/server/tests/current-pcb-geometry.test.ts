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
const methods = ["eda.pcb_PrimitiveLine.getAll", "eda.pcb_PrimitiveArc.getAll", "eda.pcb_PrimitiveVia.getAll",
  "eda.pcb_PrimitiveComponent.getAll", "eda.pcb_PrimitivePad.getAll"] as const;
function inputFor(method: CurrentPcbGeometryRequest["method"] = methods[0], primitiveIds?: string[]): CurrentPcbGeometryRequest {
  return parseCurrentPcbGeometryRequest({ method, arguments: primitiveIds === undefined ? {} : { primitiveIds }, target });
}
const track = { globalIndex: "line-b", net: "MixedCase", locked: false, layerId: 1,
  startX: 1.1234567, startY: -2, endX: 3, endY: 4, width: 10 };
const defaults = { Line: [track, { ...track, globalIndex: "line-a", net: null, locked: true }],
  Arc: [{ ...track, globalIndex: "arc-a", arcAngle: 45.1234567, arcType: 1 }],
  Via: [{ globalIndex: "via-a", net: "", locked: true, center: { x: 1.234567, y: -2 }, holeRadius: 5.123456,
    radius: 10.123456, type: 0, name: null, startLayer: 1, endLayer: 2, expansion: 1, topExpansion: 0.15, bottomExpansion: -0.25 }],
  Component: [{ globalIndex: "component-b", locked: false, layerId: 1, position: { x: 10.1234567, y: -20 }, rotation: -45.1234567,
    attrsMap: { Designator: "U1", Name: "={Manufacturer Part}", Manufacturer: "Example Devices", "Manufacturer Part": "ABC-1",
      Supplier: "Example Supplier", "Supplier Part": "S123" } },
    { globalIndex: "component-a", locked: true, layerId: 2, position: { x: -30, y: 40 }, rotation: 180, attrsMap: { Designator: "", Name: "" } }],
  Pad: [{ globalIndex: "pad-b", locked: true, net: "MixedCase", layerId: 12, num: "A1", center: { x: 1.1234567, y: 2 }, rotation: 45.1234567, plated: true, padTypeAspect: 0, holeAspect: null },
    { globalIndex: "pad-a", locked: false, net: null, layerId: 1, num: "", center: { x: -3, y: 4 }, rotation: -90, plated: false, padTypeAspect: 2, holeAspect: null }] };
interface Options { before?: string; beforeChild?: string; afterCall?: string; input?: CurrentPcbGeometryRequest; fastDeadline?: boolean; }
function environment(options: Options = {}): { run: () => Promise<unknown>; evaluateChild: (source: string) => unknown } {
  const input = options.input ?? inputFor();
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.equal(timeout, 0);
    if (topic === "getTabIdAndDocType") { assert.equal(arg, undefined); }
    else if (topic === "pcb/extensionAPI/component-getAllPinsByPrimitiveId") {
      assert.ok("primitiveId" in input.arguments); assert.equal(arg, input.arguments.primitiveId);
    }
    else {
      assert.ok(topic === "pcb/extensionAPI/track-getAll" || topic === "pcb/extensionAPI/arc-getAll" || topic === "pcb/extensionAPI/via-getAll" ||
        topic === "pcb/extensionAPI/component-getAll" || topic === "pcb/extensionAPI/pad-getAll");
      assert.ok(arg !== null && typeof arg === "object"); assert.deepEqual(Object.keys(arg), []);
    }
  } });
  runInContext(`globalThis.rows=${JSON.stringify(defaults)};globalThis.children=[{...rows.Pad[1]},{...rows.Pad[0]}];globalThis.calls=0;globalThis.dataReads=0;globalThis.getterReads=0;
globalThis.identity={tabId:${JSON.stringify(input.target.tabId)},docType:3};
globalThis.topics={'pcb/extensionAPI/track-getAll':'Line','pcb/extensionAPI/arc-getAll':'Arc','pcb/extensionAPI/via-getAll':'Via','pcb/extensionAPI/component-getAll':'Component','pcb/extensionAPI/pad-getAll':'Pad'};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');checkCall(topic,arg,timeout);calls++;await Promise.resolve();if(topic!=='getTabIdAndDocType')dataReads++;${options.afterCall ?? ""}return {message:topic==='getTabIdAndDocType'?identity:topic==='pcb/extensionAPI/component-getAllPinsByPrimitiveId'?children:rows[topics[topic]],bridge:undefined,source:undefined};}}
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
    evaluateChild: (source: string): unknown => runInContext(source, childContext, { timeout: 1000 }) as unknown };
}

void test("current geometry reader admits the target project fragment and rejects foreign or changing URLs", async () => {
  const before = "location.href+='id='+target.projectUuid+',tab=*'+target.tabId;document.URL=location.href;";
  const valid = environment({ before });
  validateCurrentPcbGeometryResult(inputFor(), decodeExactReadEnvelope(await valid.run()));
  assert.equal(valid.evaluateChild("calls"), 6);
  const foreign = environment({ before: "location.href+='id='+ 'f'.repeat(64);document.URL=location.href;" });
  await assert.rejects(foreign.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  assert.equal(foreign.evaluateChild("calls"), 0);
  const changed = environment({ before, afterCall: "parent.location.href='https://client/editor?cll=warn#id='+parent.target.projectUuid;parent.document.URL=parent.location.href;" });
  await assert.rejects(changed.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  assert.equal(changed.evaluateChild("calls"), 1);
});

void test("current geometry copies ordered cross-realm native fields without public rounding or point getters", async () => {
  const expected = [
    [{ primitiveId: "line-b", primitiveType: "Line", net: "MixedCase", primitiveLock: false, layer: 1,
      startX: 1.1234567, startY: -2, endX: 3, endY: 4, lineWidth: 10 },
    { primitiveId: "line-a", primitiveType: "Line", net: null, primitiveLock: true, layer: 1,
      startX: 1.1234567, startY: -2, endX: 3, endY: 4, lineWidth: 10 }],
    [{ primitiveId: "arc-a", primitiveType: "Arc", net: "MixedCase", primitiveLock: false, layer: 1,
      startX: 1.1234567, startY: -2, endX: 3, endY: 4, lineWidth: 10, arcAngle: 45.1234567, interactiveMode: 1 }],
    [{ primitiveId: "via-a", primitiveType: "Via", net: "", primitiveLock: true, x: 1.234567, y: -2,
      holeDiameter: 10.246912, diameter: 20.246912, viaType: 0, designRuleBlindViaName: null,
      startLayer: 1, endLayer: 2, maskExpansionMode: 1, topMaskExpansion: 1.5, bottomMaskExpansion: -2.5 }],
    [{ primitiveId: "component-b", primitiveType: "Component", primitiveLock: false, layer: 1, x: 10.1234567, y: -20, rotation: -45.1234567,
      designator: "U1", name: "={Manufacturer Part}", manufacturer: "Example Devices", manufacturerPart: "ABC-1", supplier: "Example Supplier", supplierPart: "S123" },
    { primitiveId: "component-a", primitiveType: "Component", primitiveLock: true, layer: 2, x: -30, y: 40, rotation: 180, designator: "", name: "" }],
    [{ primitiveId: "pad-b", primitiveType: "Pad", primitiveLock: true, net: "MixedCase", layer: 12, padNumber: "A1",
      x: 1.1234567, y: 2, rotation: 45.1234567, metallization: true, padType: 0, hole: null },
    { primitiveId: "pad-a", primitiveType: "Pad", primitiveLock: false, net: null, layer: 1, padNumber: "",
      x: -3, y: 4, rotation: -90, metallization: false, padType: 2, hole: null }],
  ];
  for (const [index, method] of methods.entries()) {
    const input = inputFor(method);
    const fixture = environment({ input,
      beforeChild: "class Point {constructor(p){this.x=p.x;this.y=p.y;this._hashed=123;}get hashed(){getterReads++;throw new Error('PRIVATE_MUTATOR');}}rows.Via[0].center=new Point(rows.Via[0].center);rows.Component[0].position=new Point(rows.Component[0].position);rows.Pad[0].center=new Point(rows.Pad[0].center);rows.Pad[1].holeAspect=null;rows.Pad[1].holeRotation=NaN;for(const family of Object.values(rows))for(const row of family)Object.defineProperty(row,'unprojected',{get(){getterReads++;throw new Error('PRIVATE_EXTRA');}});" });
    const result = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await fixture.run()));
    assert.deepEqual(result["value"], expected[index]); assert.equal(fixture.evaluateChild("getterReads"), 0);
    assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("dataReads"), 2);
    assert.deepEqual(result["units"], { linear: "mil", arcAngle: "degrees", rotation: "degrees" });
    for (const field of ["cadAuthority", "persistenceVerified", "sourceMembershipVerified"]) { assert.equal(result[field], false); }
  }
});

void test("current geometry schemas limit input and retain empty collection and exact native projection claims", async () => {
  const input = inputFor();
  assert.equal(validateCurrentPcbGeometryArguments(input)["valid"], true);
  for (const invalid of [{ ...input, code: "private()" }, { ...input, arguments: { net: "test" } },
    { ...input, method: "eda.pcb_PrimitiveLine.get" }, { ...input, target: { ...target, tabId: "wrong" } }]) {
    assert.throws(() => buildCurrentPcbGeometryProgram(invalid)); assert.equal(validateCurrentPcbGeometryArguments(invalid)["valid"], false);
  }
  assert.equal(queryCurrentPcbGeometry({ includeSchemas: true })["total"], 11);
  assert.match(JSON.stringify(queryCurrentPcbGeometry({ method: methods[0], includeSchemas: true })), /inputSchema/u);
  for (const method of methods) {
    const request = inputFor(method);
    const fixture = environment({ input: request, beforeChild: "rows={Line:[],Arc:[],Via:[],Component:[],Pad:[]};" });
    const emptyResult = validateCurrentPcbGeometryResult(request, decodeExactReadEnvelope(await fixture.run()));
    assert.deepEqual(emptyResult["value"], []);
  }
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object"); const payload = { ...raw };
  for (const invalid of [{ ...payload, target: { ...target, branchUuid: "d".repeat(32) } },
    { ...payload, method: methods[1] }, { ...payload, cadAuthority: true }, { ...payload, extra: "PRIVATE" },
    { ...payload, rows: [{ primitiveType: "Line" }] }]) { assert.throws(() => validateCurrentPcbGeometryResult(input, invalid)); }
  const arcInput = inputFor(methods[1]);
  const arcRaw: unknown = decodeExactReadEnvelope(await environment({ input: arcInput }).run());
  assert.ok(arcRaw !== null && typeof arcRaw === "object" && "rows" in arcRaw && Array.isArray(arcRaw.rows));
  const arcRow: unknown = arcRaw.rows[0]; assert.ok(arcRow !== null && typeof arcRow === "object");
  assert.throws(() => validateCurrentPcbGeometryResult(arcInput, { ...arcRaw, rows: [{ ...arcRow, interactiveMode: 3 }] }));
});

void test("current geometry explicit IDs return exact caller order with distinct observed and returned counts", async () => {
  const cases = [["eda.pcb_PrimitiveLine.get", ["line-a", "line-b"]], ["eda.pcb_PrimitiveArc.get", ["arc-a"]],
    ["eda.pcb_PrimitiveVia.get", ["via-a"]], ["eda.pcb_PrimitiveComponent.get", ["component-a", "component-b"]],
    ["eda.pcb_PrimitivePad.get", ["pad-a", "pad-b"]]] as const;
  for (const [method, primitiveIds] of cases) {
    const input = inputFor(method, [...primitiveIds]);
    const fixture = environment({ input, beforeChild: "rows.Via[0].center._hashed=7;rows.Component[0].position._hashed=8;rows.Pad[0].center._hashed=9;" });
    const raw: unknown = decodeExactReadEnvelope(await fixture.run());
    const result = validateCurrentPcbGeometryResult(input, raw);
    const value = result["value"]; assert.ok(Array.isArray(value));
    assert.deepEqual(value.map((row: Record<string, unknown>) => row["primitiveId"]), primitiveIds);
    assert.equal(result["returnedRowCount"], primitiveIds.length); assert.equal(result["observedRowCount"], primitiveIds.length);
    assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("dataReads"), 2);
    assert.match(JSON.stringify(queryCurrentPcbGeometry({ method })), /"parameters":\["primitiveIds"\]/u);
    if (method === "eda.pcb_PrimitiveLine.get") {
      assert.throws(() => validateCurrentPcbGeometryResult(inputFor(method, ["line-b", "line-a"]), raw));
      assert.ok(raw !== null && typeof raw === "object");
      assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, observedRowCount: 1 }));
    }
  }
  const input = inputFor("eda.pcb_PrimitiveLine.get", ["line-a"]);
  const raw: unknown = decodeExactReadEnvelope(await environment({ input }).run());
  const result = validateCurrentPcbGeometryResult(input, raw);
  assert.equal(result["returnedRowCount"], 1); assert.equal(result["observedRowCount"], 2);
  assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
  const row: unknown = raw.rows[0]; assert.ok(row !== null && typeof row === "object");
  for (const invalid of [{ ...raw, observedRowCount: 0 }, { ...raw, observedRowCount: 257 }, { ...raw, observedRowCount: 1.5 },
    { ...raw, observedRowCount: undefined }, { ...raw, rows: [] }, { ...raw, rows: [{ ...row, primitiveId: "line-b" }] },
    { ...raw, rows: [row, row] }, { ...raw, returnedRowCount: 1 }]) {
    assert.throws(() => validateCurrentPcbGeometryResult(input, invalid));
  }
  assert.throws(() => validateCurrentPcbGeometryResult(inputFor("eda.pcb_PrimitiveLine.get", ["line-a", "line-b"]), raw));
});

void test("current geometry explicit IDs refuse malformed requests, missing IDs and unselected-family defects", async () => {
  const input = inputFor("eda.pcb_PrimitiveLine.get", ["line-a"]);
  for (const primitiveIds of ["line-a", [], ["line-a", "line-a"], [""], ["x".repeat(257)],
    Array.from({ length: 257 }, (_, index) => String(index)), [1], [null]]) {
    const invalid = { ...input, arguments: { primitiveIds } };
    assert.throws(() => buildCurrentPcbGeometryProgram(invalid));
    assert.equal(validateCurrentPcbGeometryArguments(invalid)["valid"], false);
  }
  for (const invalid of [{ ...input, arguments: { primitiveIds: ["line-a"], layer: 1 } },
    { ...input, method: "eda.pcb_PrimitiveLine.getAll" }]) {
    assert.throws(() => buildCurrentPcbGeometryProgram(invalid));
  }
  const missing = environment({ input: inputFor("eda.pcb_PrimitiveLine.get", ["line-a", "absent"]) });
  await assert.rejects(missing.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  assert.equal(missing.evaluateChild("dataReads"), 2);
  for (const options of [
    { afterCall: "if(dataReads===2)rows.Line[0].startX++;" },
    { beforeChild: "rows.Line[0].startX=NaN;" },
    { beforeChild: "rows.Line=Array.from({length:257},(_,i)=>({...rows.Line[0],globalIndex:i===0?'line-a':String(i)}));" },
    { beforeChild: "rows.Line=Array.from({length:256},(_,i)=>({...rows.Line[0],globalIndex:i===0?'line-a':String(i),net:'漢'.repeat(1024)}));" },
  ]) {
    await assert.rejects(environment({ input, ...options }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
});

void test("current geometry rejects malformed scalars, native accessors, duplicate identities and both bounds", async () => {
  for (const beforeChild of ["rows.Line=undefined;", "delete rows.Line[0];", "rows.Line.push(rows.Line[0]);",
    "rows.Line[0].startX=-0;", "rows.Line[0].startX=NaN;", "rows.Line[0].startX=Infinity;", "rows.Line[0].startX=1e13;",
    "rows.Line[0].startX='2';", "delete rows.Line[0].net;", "rows.Line[0].net=undefined;", "rows.Line[0].locked=1;",
    "rows.Line[0].layerId=1.5;", "rows.Line[0].globalIndex='';", "rows.Line[0].globalIndex='x'.repeat(257);",
    "rows.Line[0].net='x'.repeat(1025);", "rows.Line=Array.from({length:257},(_,i)=>({...rows.Line[0],globalIndex:String(i)}));",
    "rows.Line=Array.from({length:256},(_,i)=>({...rows.Line[0],globalIndex:String(i),net:'漢'.repeat(1024)}));",
    "Object.defineProperty(rows.Line[0],'startX',{get(){getterReads++;throw new Error('PRIVATE_ACCESSOR');}});"]) {
    const fixture = environment({ beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  for (const beforeChild of ["rows.Via[0].center={x:1,y:2,z:3};", "rows.Via[0].center=Object.create({x:1,y:2});",
    "Object.defineProperty(rows.Via[0].center,'x',{get(){getterReads++;throw new Error('PRIVATE_POINT');}});",
    "rows.Via[0].type=3;", "rows.Via[0].expansion=1.5;", "rows.Via[0].topExpansion=2e11;", "rows.Via[0].name=undefined;"]) {
    const fixture = environment({ input: inputFor(methods[2]), beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  await assert.rejects(environment({ input: inputFor(methods[1]), beforeChild: "rows.Arc[0].arcType=3;" }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
});

void test("current Component and Pad projections refuse invalid required fields without inspecting omitted shape or library data", async () => {
  for (const method of [methods[3], methods[4]]) {
    const input = inputFor(method);
    const fixture = environment({ input, beforeChild: "for(const [row,key] of [[rows.Component[0],'net'],[rows.Component[0],'pads'],[rows.Component[0],'footprint'],[rows.Component[0].attrsMap,'Device'],[rows.Component[0].attrsMap,'Unselected'],[rows.Pad[0],'padRule'],[rows.Pad[0],'holeOffset']])Object.defineProperty(row,key,{get(){getterReads++;throw new Error('PRIVATE_OMITTED');}});" });
    const raw: unknown = decodeExactReadEnvelope(await fixture.run());
    validateCurrentPcbGeometryResult(input, raw);
    assert.equal(fixture.evaluateChild("getterReads"), 0);
    assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
    const row: unknown = raw.rows[0]; assert.ok(row !== null && typeof row === "object");
    const invalid = method === methods[3] ? { ...row, layer: 12 } : { ...row, padType: 3 };
    assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, rows: [invalid] }));
  }
  for (const [method, beforeChild] of [[methods[3], "rows.Component[0].layerId=12;"], [methods[3], "rows.Component[0].position.x=NaN;"],
    [methods[3], "delete rows.Component[0].rotation;"], [methods[4], "rows.Pad[0].layerId=3;"],
    [methods[4], "rows.Pad[0].padTypeAspect=3;"], [methods[4], "rows.Pad[0].plated=1;"],
    [methods[4], "rows.Pad[0].net=undefined;"], [methods[4], "rows.Pad[0].num=undefined;"]] as const) {
    await assert.rejects(environment({ input: inputFor(method), beforeChild }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  await assert.rejects(environment({ input: inputFor(methods[4]), afterCall: "if(dataReads===2)rows.Pad[0].rotation++;" }).run(),
    { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
});

const componentAttributes = [["Designator", "designator"], ["Name", "name"], ["Manufacturer", "manufacturer"],
  ["Manufacturer Part", "manufacturerPart"], ["Supplier", "supplier"], ["Supplier Part", "supplierPart"]] as const;

void test("current Component metadata preserves raw strings and omits missing or own-undefined optional fields", async () => {
  const input = inputFor("eda.pcb_PrimitiveComponent.get", ["component-a", "component-b"]);
  const fixture = environment({ input, beforeChild: "rows.Component[1].attrsMap={};for(const key of Object.keys(rows.Component[0].attrsMap))Object.defineProperty(rows.Component[1].attrsMap,key,{value:undefined,enumerable:true,configurable:true});",
    afterCall: "if(dataReads===2)rows.Component[1].attrsMap={};" });
  const raw: unknown = decodeExactReadEnvelope(await fixture.run());
  const result = validateCurrentPcbGeometryResult(input, raw), value = result["value"];
  assert.ok(Array.isArray(value));
  assert.deepEqual(value, [{ primitiveId: "component-a", primitiveType: "Component", primitiveLock: true, layer: 2,
    x: -30, y: 40, rotation: 180 }, { primitiveId: "component-b", primitiveType: "Component", primitiveLock: false, layer: 1,
    x: 10.1234567, y: -20, rotation: -45.1234567, designator: "U1", name: "={Manufacturer Part}",
    manufacturer: "Example Devices", manufacturerPart: "ABC-1", supplier: "Example Supplier", supplierPart: "S123" }]);
  assert.equal(result["returnedRowCount"], 2); assert.equal(result["observedRowCount"], 2);
  assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("dataReads"), 2);
  const empty = environment({ input: inputFor(methods[3]),
    beforeChild: "for(const row of rows.Component)for(const key of ['Designator','Name','Manufacturer','Manufacturer Part','Supplier','Supplier Part'])row.attrsMap[key]='';" });
  const emptyResult = validateCurrentPcbGeometryResult(inputFor(methods[3]), decodeExactReadEnvelope(await empty.run()));
  const emptyRows = emptyResult["value"]; assert.ok(Array.isArray(emptyRows));
  for (const row of emptyRows) {
    const checkedRow: unknown = row; assert.ok(checkedRow !== null && typeof checkedRow === "object");
    for (const [, field] of componentAttributes) {
      assert.deepEqual(Object.getOwnPropertyDescriptor(checkedRow, field), { value: "", writable: true, enumerable: true, configurable: true });
    }
  }
});

void test("current Component metadata refuses malformed or inherited values without invoking selected or unrelated accessors", async () => {
  const input = inputFor(methods[3]);
  const malformedMaps = ["delete rows.Component[0].attrsMap;", "rows.Component[0].attrsMap=undefined;",
    "rows.Component[0].attrsMap=null;", "rows.Component[0].attrsMap=[];",
    "rows.Component[0].attrsMap=Object.create({Manufacturer:'inherited'});",
    "Object.defineProperty(rows.Component[0],'attrsMap',{get(){getterReads++;throw new Error('PRIVATE_MAP');}});",
    "Object.defineProperty(Object.prototype,'Supplier',{get(){getterReads++;throw new Error('PRIVATE_INHERITED');}});"];
  for (const beforeChild of malformedMaps) {
    const fixture = environment({ input, beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  for (const [key] of componentAttributes) {
    for (const expression of ["null", "false", "123", "{}", "[]", "'x'.repeat(1025)"]) {
      const fixture = environment({ input, beforeChild: `rows.Component[0].attrsMap[${JSON.stringify(key)}]=${expression};` });
      await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    }
    const accessor = environment({ input,
      beforeChild: `Object.defineProperty(rows.Component[0].attrsMap,${JSON.stringify(key)},{get(){getterReads++;throw new Error('PRIVATE_ATTRIBUTE');}});` });
    await assert.rejects(accessor.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(accessor.evaluateChild("getterReads"), 0);
  }
});

void test("current Component metadata participates in whole-family sampling and bounded host validation", async () => {
  const input = inputFor("eda.pcb_PrimitiveComponent.get", ["component-a"]);
  for (const [key] of componentAttributes) {
    const changed = environment({ input, afterCall: `if(dataReads===2)rows.Component[0].attrsMap[${JSON.stringify(key)}]='changed';` });
    await assert.rejects(changed.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(changed.evaluateChild("dataReads"), 2);
  }
  for (const options of [{ afterCall: "if(dataReads===2)delete rows.Component[1].attrsMap.Name;" },
    { beforeChild: "rows.Component[0].attrsMap.Manufacturer=42;" },
    { beforeChild: "rows.Component=Array.from({length:256},(_,i)=>({...rows.Component[0],globalIndex:i===0?'component-a':String(i),attrsMap:{Name:'漢'.repeat(1024)}}));" }]) {
    await assert.rejects(environment({ input, ...options }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  const bounded = environment({ input, beforeChild: "for(const row of rows.Component)for(const key of ['Designator','Name','Manufacturer','Manufacturer Part','Supplier','Supplier Part'])row.attrsMap[key]='x'.repeat(1024);" });
  const raw: unknown = decodeExactReadEnvelope(await bounded.run());
  validateCurrentPcbGeometryResult(input, raw);
  assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
  const row: unknown = raw.rows[0]; assert.ok(row !== null && typeof row === "object");
  for (const [, field] of componentAttributes) {
    for (const invalid of [null, false, 123, {}, [], "x".repeat(1025)]) {
      assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, rows: [{ ...row, [field]: invalid }] }));
    }
  }
  assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, rows: [{ ...row, libraryUuid: "unproven" }] }));
});

void test("current Pad holes preserve null and exact mil dimensions with pad-relative rotation", async () => {
  const input = inputFor(methods[4]);
  const fixture = environment({ input, beforeChild: "rows.Pad[0].holeAspect=['ROUND',12.1234567];rows.Pad[0].holeOffset={x:-1.234567,y:2};rows.Pad[0].holeRotation=-30;rows.Pad[1].holeAspect=['SLOT',0,20.1234567];rows.Pad[1].holeOffset={x:0,y:0};rows.Pad[1].holeRotation=90;" });
  const raw: unknown = decodeExactReadEnvelope(await fixture.run());
  const result = validateCurrentPcbGeometryResult(input, raw), value = result["value"];
  assert.ok(Array.isArray(value));
  assert.deepEqual(value.map((row: Record<string, unknown>) => row["hole"]), [
    { shape: "ROUND", diameter: 12.1234567, offsetX: -1.234567, offsetY: 2, rotation: -30 },
    { shape: "SLOT", diameter: 0, length: 20.1234567, offsetX: 0, offsetY: 0, rotation: 90 },
  ]);
  const absent = environment({ input, beforeChild: "for(const row of rows.Pad){row.holeRotation=NaN;Object.defineProperty(row,'holeOffset',{get(){getterReads++;throw new Error('PRIVATE_HOLELESS');}});}" });
  const absentResult = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await absent.run()));
  assert.equal(absent.evaluateChild("getterReads"), 0);
  const absentRows = absentResult["value"]; assert.ok(Array.isArray(absentRows));
  for (const valueRow of absentRows) {
    const row: unknown = valueRow; assert.ok(row !== null && typeof row === "object" && "hole" in row);
    assert.equal(row.hole, null);
  }
  assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
  const row: unknown = raw.rows[0]; assert.ok(row !== null && typeof row === "object");
  for (const hole of [undefined, {}, { shape: "ROUND", diameter: -1, offsetX: 0, offsetY: 0, rotation: 0 },
    { shape: "ROUND", diameter: 1, length: 2, offsetX: 0, offsetY: 0, rotation: 0 },
    { shape: "SLOT", diameter: 1, offsetX: 0, offsetY: 0, rotation: 0 }]) {
    assert.throws(() => validateCurrentPcbGeometryResult(input, { ...raw, rows: [{ ...row, hole }] }));
  }
});

void test("current Pad holes refuse malformed tuples and changing fields without invoking accessors", async () => {
  const input = inputFor(methods[4]);
  const setup = "rows.Pad[0].holeAspect=['SLOT',12,20];rows.Pad[0].holeOffset={x:1,y:2};rows.Pad[0].holeRotation=45;";
  for (const mutation of ["delete rows.Pad[0].holeAspect;", "rows.Pad[0].holeAspect=undefined;", "rows.Pad[0].holeAspect={};",
    "rows.Pad[0].holeAspect=['ROUND',12,20];", "rows.Pad[0].holeAspect=['SLOT',12];", "rows.Pad[0].holeAspect=['OVAL',12];",
    "rows.Pad[0].holeAspect[1]=-1;", "rows.Pad[0].holeAspect[2]=-1;", "rows.Pad[0].holeAspect[1]=-0;",
    "rows.Pad[0].holeAspect[1]=NaN;", "rows.Pad[0].holeAspect[1]='12';", "rows.Pad[0].holeAspect[2]=1e13;",
    "delete rows.Pad[0].holeAspect[1];", "rows.Pad[0].holeAspect.extra=1;", "rows.Pad[0].holeAspect[Symbol('extra')]=1;",
    "rows.Pad[0].holeRotation=NaN;", "rows.Pad[0].holeOffset.x=Infinity;", "rows.Pad[0].holeOffset=Object.create({x:1,y:2});",
    "Object.defineProperty(rows.Pad[0].holeAspect,'1',{get(){getterReads++;throw new Error('PRIVATE_HOLE');}});",
    "Object.defineProperty(rows.Pad[0],'holeAspect',{get(){getterReads++;throw new Error('PRIVATE_HOLE');}});",
    "Object.defineProperty(rows.Pad[0].holeOffset,'x',{get(){getterReads++;throw new Error('PRIVATE_HOLE');}});"]) {
    const fixture = environment({ input, beforeChild: setup + mutation });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  for (const mutation of ["rows.Pad[0].holeAspect[1]++;", "rows.Pad[0].holeAspect[2]++;", "rows.Pad[0].holeRotation++;",
    "rows.Pad[0].holeOffset.x++;", "rows.Pad[0].holeOffset.y++;", "rows.Pad[0].holeAspect=null;"]) {
    await assert.rejects(environment({ input, beforeChild: setup, afterCall: `if(dataReads===2){${mutation}}` }).run(),
      { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
});

function componentPadsInput(primitiveId = "component-b"): CurrentPcbGeometryRequest {
  return parseCurrentPcbGeometryRequest({ method: "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId", arguments: { primitiveId }, target });
}

void test("current component child-pad association preserves full native IDs and child order using global Pad geometry", async () => {
  const input = componentPadsInput();
  const fixture = environment({ input, beforeChild: "rows.Pad.push({...rows.Pad[0],globalIndex:'unrelated-pad'});for(const row of children)for(const key of ['center','rotation','holeAspect','holeOffset','holeRotation','parentId'])Object.defineProperty(row,key,{get(){getterReads++;throw new Error('PRIVATE_CHILD_GEOMETRY');}});" });
  const result = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await fixture.run())), value = result["value"];
  assert.ok(Array.isArray(value));
  assert.deepEqual(value.map((row: Record<string, unknown>) => row["primitiveId"]), ["pad-a", "pad-b"]);
  assert.deepEqual(value.map((row: Record<string, unknown>) => row["x"]), [-3, 1.1234567]);
  assert.equal(result["componentPrimitiveId"], "component-b"); assert.equal(result["observedComponentCount"], 2);
  assert.equal(result["observedPadCount"], 3); assert.equal(result["observedRowCount"], 3); assert.equal(result["returnedRowCount"], 2);
  assert.equal(result["relationshipEvidence"], "native-component-child-list-and-global-pad-membership");
  assert.equal(result["reciprocalParentVerified"], false); assert.equal(result["symbolPinMappingVerified"], false);
  assert.equal(fixture.evaluateChild("calls"), 10); assert.equal(fixture.evaluateChild("dataReads"), 6); assert.equal(fixture.evaluateChild("getterReads"), 0);
  assert.match(JSON.stringify(queryCurrentPcbGeometry({ method: input.method })), /"parameters":\["primitiveId"\]/u);
  const empty = environment({ input, beforeChild: "children=[];" });
  const emptyResult = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await empty.run()));
  assert.deepEqual(emptyResult["value"], []); assert.equal(emptyResult["observedPadCount"], 2);
  const noPads = environment({ input, beforeChild: "children=[];rows.Pad=[];" });
  const noPadsResult = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await noPads.run()));
  assert.deepEqual(noPadsResult["value"], []); assert.equal(noPadsResult["observedPadCount"], 0);
});

void test("current component child-pad association refuses missing, colliding, malformed or contradictory membership", async () => {
  const input = componentPadsInput();
  for (const argumentsValue of [{}, { primitiveId: "" }, { primitiveId: [] }, { primitiveId: "x".repeat(257) },
    { primitiveId: "component-b", primitiveIds: ["pad-a"] }, { primitiveId: "component-b", topic: "private" }]) {
    assert.throws(() => buildCurrentPcbGeometryProgram({ ...input, arguments: argumentsValue }));
  }
  const missing = environment({ input: componentPadsInput("missing") });
  await assert.rejects(missing.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  assert.equal(missing.evaluateChild("dataReads"), 1);
  for (const beforeChild of ["children=null;", "children=undefined;", "children.push(children[0]);", "delete children[0];",
    "children[0].globalIndex='component-b';", "children[0].globalIndex='missing';", "children[0].globalIndex='';",
    "children[0].num='contradiction';", "children[0].net='contradiction';", "children[0].layerId=12;",
    "children[0].locked=true;", "children[0].plated=true;", "children[0].padTypeAspect=0;",
    "rows.Component.push(rows.Component[0]);", "rows.Component[1].globalIndex=rows.Pad[0].globalIndex;",
    "rows.Pad.push(rows.Pad[0]);", "rows.Pad[0].num=undefined;", "children[0].net=undefined;",
    "rows.Component=[];", "rows.Component=Array.from({length:257},(_,i)=>({globalIndex:i===0?'component-b':String(i)}));",
    "children=Array.from({length:257},(_,i)=>({...children[0],globalIndex:String(i)}));",
    "Object.defineProperty(children[0],'globalIndex',{get(){getterReads++;throw new Error('PRIVATE_CHILD');}});",
    "Object.defineProperty(rows.Component[0],'globalIndex',{get(){getterReads++;throw new Error('PRIVATE_COMPONENT');}});"]) {
    const fixture = environment({ input, beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
});

void test("current component child-pad association seals complete compound samples and host metadata", async () => {
  const input = componentPadsInput();
  for (const afterCall of ["if(dataReads===4)rows.Component.reverse();", "if(dataReads===4)rows.Component[1].globalIndex='other';",
    "if(dataReads===5)rows.Pad.reverse();", "if(dataReads===5)rows.Pad[0].center.x++;", "if(dataReads===6)children.reverse();",
    "if(dataReads===6)children.pop();", "if(dataReads===3)parent.activeTab='other';",
    "if(dataReads===2)Bus.prototype.rpcCall=async()=>({message:[]});"]) {
    await assert.rejects(environment({ input, afterCall }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  const oversized = environment({ input, beforeChild: "rows.Pad=Array.from({length:256},(_,i)=>({...rows.Pad[0],globalIndex:String(i),num:'漢'.repeat(1024)}));children=[];" });
  await assert.rejects(oversized.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  const raw: unknown = decodeExactReadEnvelope(await environment({ input }).run());
  assert.ok(raw !== null && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows));
  for (const invalid of [{ ...raw, componentPrimitiveId: "other" }, { ...raw, observedPadCount: 1 },
    { ...raw, observedComponentCount: 0 }, { ...raw, observedComponentCount: 257 }, { ...raw, reciprocalParentVerified: true },
    { ...raw, symbolPinMappingVerified: true }, { ...raw, rows: [raw.rows[0], raw.rows[0]] }]) {
    assert.throws(() => validateCurrentPcbGeometryResult(input, invalid));
  }
});

void test("current geometry refuses stable-ID geometry drift, target drift and retained receiver changes", async () => {
  for (const afterCall of ["if(dataReads===2)rows.Line[0].startX++;", "if(dataReads===2)rows.Line[0].net='changed';",
    "if(dataReads===2)rows.Line.reverse();", "identity.docType=23;", "identity.tabId='other';",
    "parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "Bus.prototype.rpcCall=async()=>({message:[]});"]) {
    await assert.rejects(environment({ afterCall }).run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
  }
  for (const before of ["attributes.fromFile='true';", "gVars.isHistoryMode=true;", "tab.parentLibraryUuid='other';"]) {
    const fixture = environment({ before }); await assert.rejects(fixture.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" });
    assert.equal(fixture.evaluateChild("calls"), 0);
  }
});

void test("current geometry preserves bounded failure messages and does not retry a failed or hung native call", async () => {
  const failed = environment({ afterCall: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  await assert.rejects(failed.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(failed.evaluateChild("calls"), 1);
  const hung = environment({ afterCall: "return await new Promise(()=>{});", fastDeadline: true });
  await assert.rejects(hung.run(), { message: "CURRENT_PCB_GEOMETRY_READ_FAILED" }); assert.equal(hung.evaluateChild("calls"), 1);
});

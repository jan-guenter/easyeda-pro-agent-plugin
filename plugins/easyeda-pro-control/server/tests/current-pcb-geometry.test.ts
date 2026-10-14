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
const methods = ["eda.pcb_PrimitiveLine.getAll", "eda.pcb_PrimitiveArc.getAll", "eda.pcb_PrimitiveVia.getAll"] as const;
function inputFor(method: typeof methods[number] = methods[0]): CurrentPcbGeometryRequest {
  return parseCurrentPcbGeometryRequest({ method, arguments: {}, target });
}
const track = { globalIndex: "line-b", net: "MixedCase", locked: false, layerId: 1,
  startX: 1.1234567, startY: -2, endX: 3, endY: 4, width: 10 };
const defaults = { Line: [track, { ...track, globalIndex: "line-a", net: null, locked: true }],
  Arc: [{ ...track, globalIndex: "arc-a", arcAngle: 45.1234567, arcType: 1 }],
  Via: [{ globalIndex: "via-a", net: "", locked: true, center: { x: 1.234567, y: -2 }, holeRadius: 5.123456,
    radius: 10.123456, type: 0, name: null, startLayer: 1, endLayer: 2, expansion: 1, topExpansion: 0.15, bottomExpansion: -0.25 }] };
interface Options { before?: string; beforeChild?: string; afterCall?: string; input?: CurrentPcbGeometryRequest; fastDeadline?: boolean; }
function environment(options: Options = {}): { run: () => Promise<unknown>; evaluateChild: (source: string) => unknown } {
  const input = options.input ?? inputFor();
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.equal(timeout, 0);
    if (topic === "getTabIdAndDocType") { assert.equal(arg, undefined); }
    else {
      assert.ok(topic === "pcb/extensionAPI/track-getAll" || topic === "pcb/extensionAPI/arc-getAll" || topic === "pcb/extensionAPI/via-getAll");
      assert.ok(arg !== null && typeof arg === "object"); assert.deepEqual(Object.keys(arg), []);
    }
  } });
  runInContext(`globalThis.rows=${JSON.stringify(defaults)};globalThis.calls=0;globalThis.dataReads=0;globalThis.getterReads=0;
globalThis.identity={tabId:${JSON.stringify(input.target.tabId)},docType:3};
globalThis.topics={'pcb/extensionAPI/track-getAll':'Line','pcb/extensionAPI/arc-getAll':'Arc','pcb/extensionAPI/via-getAll':'Via'};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');checkCall(topic,arg,timeout);calls++;await Promise.resolve();if(topic!=='getTabIdAndDocType')dataReads++;${options.afterCall ?? ""}return {message:topic==='getTabIdAndDocType'?identity:rows[topics[topic]],bridge:undefined,source:undefined};}}
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
  ];
  for (const [index, method] of methods.entries()) {
    const input = inputFor(method);
    const fixture = environment({ input,
      beforeChild: "class Point {constructor(p){this.x=p.x;this.y=p.y;}get hashed(){getterReads++;throw new Error('PRIVATE_MUTATOR');}}rows.Via[0].center=new Point(rows.Via[0].center);for(const family of Object.values(rows))for(const row of family)Object.defineProperty(row,'unprojected',{get(){getterReads++;throw new Error('PRIVATE_EXTRA');}});" });
    const result = validateCurrentPcbGeometryResult(input, decodeExactReadEnvelope(await fixture.run()));
    assert.deepEqual(result["value"], expected[index]); assert.equal(fixture.evaluateChild("getterReads"), 0);
    assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("dataReads"), 2);
    assert.deepEqual(result["units"], { linear: "mil", arcAngle: "degrees" });
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
  assert.equal(queryCurrentPcbGeometry({ includeSchemas: true })["total"], 3);
  assert.match(JSON.stringify(queryCurrentPcbGeometry({ method: methods[0], includeSchemas: true })), /inputSchema/u);
  for (const method of methods) {
    const request = inputFor(method);
    const fixture = environment({ input: request, beforeChild: "rows={Line:[],Arc:[],Via:[]};" });
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

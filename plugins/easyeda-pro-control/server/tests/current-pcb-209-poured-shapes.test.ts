import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_POURED_SHAPES_FUNCTION, decodeCurrentPcb209PouredShapesReply } from "../src/current-pcb-209-poured-shapes.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\PouredShapeFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209PouredShapesReply({ result: { type: "string", value } }, target); }
function inputRows(): Record<string, Record<string, unknown>[]> {
  const fill = { globalIndex: "fill-a", pourPrimitiveId: "pour-a", partition: "", layerId: 1, net: "Mixed Net", style: "solid",
    gridLineWidth: 0.123456789, clearance: 0.25, optimization: true, optimizationWidth: 0.8,
    copperPath: [[0, 0, "L", 3, 0, 3, 4, "ARC", 90, 5, 6, "C", 1, 2, 3, 4, 5, 6], ["CIRCLE", 20, -4, 3], [7, 8, "C", 9, 10]] };
  return { poured: [fill, { ...fill, globalIndex: "fill-b", pourPrimitiveId: "pour-b", partition: "partition-one", net: null, style: "45grid",
    optimization: null, copperPath: [] }, { ...fill, globalIndex: "fill-c", net: "", style: "none", optimization: false, copperPath: [[1, 2, "L", 3, 4]] }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={poured:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(poured)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
${afterCall}return {message:family===null?identity:rows[family]};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};globalThis.location={href:"https://client/editor?entry=pcb"};${childBefore}`, child);
  const context = createContext({ child: runInContext("globalThis", child) as unknown, TextEncoder, setTimeout, clearTimeout, queueMicrotask });
  runInContext(`globalThis.sealed=${JSON.stringify(target)};globalThis.tabId=sealed.documentUuid+"@"+sealed.projectUuid;
globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:"https://client/editor?cll=warn#id="+sealed.projectUuid+",tab=*"+tabId,origin:"https://client"};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";
globalThis.tab={tabId,data:{doctype:3,pid:sealed.projectUuid}};globalThis.activeTab=tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:sealed.projectUuid,branchUuid:sealed.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.attributes={c_dbid:tabId,c_doctype:"3",src:"editor?entry=pcb","pcb-canvas":"true"};
globalThis.frame={tagName:"IFRAME",id:"frame_"+tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==="editframe";}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==="uuid"?tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;${before}`, context);
  const raw = async (): Promise<string> => {
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_POURED_SHAPES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209PouredShapesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 Poured preserves native contours, scalar states and parent groups in six calls", async () => {
  const value = fixture(inputRows(), "", "", "rows.poured[1].optimization=undefined;");
  const result = await value.run();
  assert.equal(value.childRead("calls"), 6); assert.equal(value.childRead("readCounts.poured"), 2);
  const families = records.parse(result["families"]); assert.deepEqual(families.map(row => row["family"]), ["Poured"]);
  const rows = records.parse(families[0]?.["rows"]);
  assert.equal(rows[0]?.["gridLineWidth"], 0.123456789); assert.equal(rows[0]?.["net"], "Mixed Net");
  assert.deepEqual(rows[0]?.["copperPath"], inputRows()["poured"]?.[0]?.["copperPath"]);
  assert.equal(rows[1]?.["style"], "45grid"); assert.equal(rows[1]?.["net"], null); assert.equal(rows[2]?.["net"], "");
  assert.equal(rows[1]?.["optimizationState"], "undefined"); assert.equal(rows[1]?.["optimization"], null);
  assert.equal(rows[2]?.["optimizationState"], "present"); assert.equal(rows[2]?.["optimization"], false);
  assert.deepEqual(result["parentGroups"], [{ pourPrimitiveId: "pour-a", primitiveIds: ["fill-a", "fill-c"] },
    { pourPrimitiveId: "pour-b", primitiveIds: ["fill-b"] }]);
  assert.deepEqual(result["units"], { linear: "native-distance-10mil-per-unit", pathCoordinates: "native-distance-10mil-per-unit", pathSweep: "degrees" });
  for (const key of ["startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified", "reciprocalParentVerified",
    "copperRebuildPerformed", "copperFreshnessVerified", "connectivityVerified", "fabricationGeometryVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) {
    assert.equal(result[key], false);
  }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["parentGroups"]), true);
  const empty = await fixture({ poured: [] }).run(); assert.deepEqual(empty["parentGroups"], []);
  const absent = await fixture(inputRows(), "", "", "delete rows.poured[1].optimization;").run();
  assert.equal(records.parse(records.parse(absent["families"])[0]?.["rows"])[1]?.["optimizationState"], "absent");
  const nullValue = await fixture().run();
  assert.equal(records.parse(records.parse(nullValue["families"])[0]?.["rows"])[1]?.["optimizationState"], "null");
});

void test("209 Poured rechecks the original receiver frame and target around every await", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:[]});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';"]) {
    for (let at = 1; at <= 6; at += 1) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_POURED_SHAPES_REFUSED/u);
      const expected = mutation.startsWith("identity.") && [2, 5].includes(at) ? at + 1 : at;
      assert.equal(value.childRead("calls"), expected);
    }
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];", "sealed.unexpected=true;"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_POURED_SHAPES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 Poured complete samples include contours, groups, order and optimization state", async () => {
  for (const mutation of ["rows.poured[0].copperPath[1][1]++;", "rows.poured[0].copperPath.reverse();", "rows.poured[0].copperPath=[];",
    "rows.poured[0].pourPrimitiveId='other';", "rows.poured.reverse();", "rows.poured[0].gridLineWidth++;",
    "rows.poured[0].partition='other';", "rows.poured[0].net='';", "rows.poured[0].style='90grid';",
    "rows.poured[1].optimization=undefined;", "delete rows.poured[1].optimization;"]) {
    await assert.rejects(fixture(inputRows(), `if(calls===4){${mutation}}`).run(), /PCB209_POURED_SHAPES_REFUSED/u);
  }
});

void test("209 Poured refuses malformed paths, scalars and accessor or duplicate rows", async () => {
  for (const mutation of ["rows.poured[0].copperPath=[[]];", "rows.poured[0].copperPath=[[0,0]];", "rows.poured[0].copperPath=[[0,0,'L',1]];",
    "rows.poured[0].copperPath=[[0,0,'ARC',90,1,2,3]];", "rows.poured[0].copperPath=[[0,0,'C',1,2,3]];",
    "rows.poured[0].copperPath=[['CIRCLE',0,0,-1]];", "rows.poured[0].copperPath=[['CIRCLE',0,0,1,2]];",
    "rows.poured[0].copperPath=[[0,0,'CARC',90,1,2]];", "rows.poured[0].copperPath=[[0,0,'R',1,2]];",
    "rows.poured[0].copperPath=[[0,0,'L',1,NaN]];", "rows.poured[0].copperPath=[[0,0,'L',1,-0]];",
    "rows.poured[0].copperPath[0].private=true;", "delete rows.poured[0].copperPath[0][1];",
    "Object.defineProperty(rows.poured[0].copperPath[0],'1',{get(){throw new Error('PRIVATE');}});",
    "rows.poured[0].gridLineWidth=-1;", "rows.poured[0].clearance=Infinity;", "rows.poured[0].optimizationWidth=1e13;",
    "rows.poured[0].optimization=1;", "Object.defineProperty(rows.poured[0],'optimization',{get(){throw new Error('PRIVATE');}});",
    "rows.poured[0].partition=1;", "rows.poured[0].style='unknown';", "rows.poured[0].pourPrimitiveId='';",
    "rows.poured[1].globalIndex='fill-a';", "rows.poured[0].extra=true;", "rows.poured[0].net=undefined;",
    "delete rows.poured[0].layerId;", "rows.poured[0].partition=String.fromCharCode(0xd800);"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_POURED_SHAPES_REFUSED/u);
  }
});

void test("209 Poured enforces complete row, contour, token, byte bounds and deadline", async () => {
  for (const mutation of ["rows.poured=Array.from({length:257},(_,i)=>({...rows.poured[0],globalIndex:'fill'+i}));",
    "rows.poured[0].copperPath=Array.from({length:257},()=>['CIRCLE',0,0,1]);",
    "rows.poured[0].copperPath=[[0,0,'L',...Array(8190).fill(1)]];",
    "rows.poured[0].copperPath=Array.from({length:5},()=>[0,0,'L',...Array(8188).fill(1)]);",
    "rows.poured=Array.from({length:256},(_,i)=>({...rows.poured[0],globalIndex:'fill'+i,net:'x'.repeat(1024),partition:'y'.repeat(1024)}));",
    "rows.poured[0].globalIndex='😀'.repeat(129);"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_POURED_SHAPES_REFUSED/u);
  }
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_POURED_SHAPES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

void test("209 Poured decoder independently checks targets, row identities, paths, states and groups", async () => {
  const raw = await fixture().raw();
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replace(target.projectUuid, "a".repeat(64))), /PCB209_POURED_SHAPES_TARGET/u);
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_POURED_SHAPES_TARGET/u);
  for (const [before, after] of [['"samples":2', '"samples":1'], ['"cadAuthority":false', '"cadAuthority":true'],
    ['"primitiveType":"Poured"', '"primitiveType":"Image"'], ['"primitiveId":"fill-b"', '"primitiveId":"fill-a"'],
    ['"gridLineWidth":0.123456789', '"gridLineWidth":-1'], ['"optimizationState":"null"', '"optimizationState":"present"'],
    ['"pourPrimitiveId":"pour-b"', '"pourPrimitiveId":"other"'], ['"CIRCLE",20,-4,3', '"CIRCLE",20,-4,-3']] as const) {
    assert.throws(() => decode(raw.replace(before, after)));
  }
  const packet = z.record(z.string(), z.unknown()).parse(JSON.parse(raw));
  assert.throws(() => decode(JSON.stringify({ ...packet, parentGroups: [] })), /PCB209_POURED_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, parentGroups: records.parse(packet["parentGroups"]).toReversed() })), /PCB209_POURED_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, privateExtra: true })));
});

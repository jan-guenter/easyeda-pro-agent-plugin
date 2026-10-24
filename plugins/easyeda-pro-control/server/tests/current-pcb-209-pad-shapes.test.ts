import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_PAD_SHAPES_FUNCTION, decodeCurrentPcb209PadShapesReply } from "../src/current-pcb-209-pad-shapes.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\PadShapeFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209PadShapesReply({ result: { type: "string", value } }, target); }
function inputRows(): Record<string, Record<string, unknown>[]> {
  const pad = { globalIndex: "pad-a", locked: false, net: "Mixed Net", layerId: 12, center: { x: 1.23456789, y: 2 }, rotation: 89.123456,
    num: "A1", plated: true, padTypeAspect: 0, holeAspect: ["ROUND", 8.7654], holeOffset: { x: -1, y: 2 }, holeRotation: 45,
    defaultPadShapeAspect: ["ELLIPSE", 10, 12], expansionType: 2, topSolderExpansion: -1, bottomSolderExpansion: 0, pasteExpansion: 0.125,
    padRule: { connectMode: 0, lineClearance: 0.5, lineWidth: 0.25, lineAngle: Math.PI / 2 },
    specialPadShapeAspect: [[1, 1, ["RECT", 20.1, 30.2, 25]], [1, 2, ["ELLIPSE", 40.3, 50.4]], [2, 2, ["OVAL", 60.5, 70.6]]] };
  return { pad: [pad, { ...pad, globalIndex: "pad-b", net: "", holeAspect: ["SLOT", 4, 8], defaultPadShapeAspect: ["RECT", 10, 12, 25],
    specialPadShapeAspect: [], padRule: { connectMode: 1 } },
    { ...pad, globalIndex: "pad-c", net: null, holeAspect: null, defaultPadShapeAspect: ["POLYGON", [0, 0, "L", 2, 4, "ARC", 90, 5, 6]],
      specialPadShapeAspect: [], padRule: null }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={pad:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(pad)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_PAD_SHAPES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209PadShapesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 Pad shapes retain ordered native groups and full base DTOs in six calls", async () => {
  const value = fixture(inputRows(), "", "", "rows.pad[2].holeRotation=NaN;");
  const result = await value.run();
  const families = records.parse(result["families"]);
  assert.equal(value.childRead("calls"), 6); assert.equal(value.childRead("readCounts.pad"), 2);
  assert.deepEqual(families.map(entry => entry["family"]), ["Pad"]);
  const rows = records.parse(families[0]?.["rows"]);
  assert.equal(rows[0]?.["x"], 1.23456789);
  assert.deepEqual(rows[0]?.["thermal"], { mode: 0, clearance: 5, spokeWidth: 2.5, angle: 90 });
  assert.deepEqual(rows[0]?.["hole"], { shape: "ROUND", diameter: 8.7654, offsetX: -1, offsetY: 2, rotation: 45 });
  assert.deepEqual(rows[1]?.["defaultCopperShape"], { shape: "RECT", width: 10, height: 12, cornerRatioPercent: 25 });
  assert.deepEqual(rows[2]?.["defaultCopperShape"], { shape: "POLYGON", pathSource: [0, 0, "L", 2, 4, "ARC", 90, 5, 6], coordinateSpace: "native-pad-style" });
  assert.equal(rows[2]?.["hole"], null); assert.equal(rows[2]?.["net"], null);
  assert.deepEqual(result["specialShapeGroups"], [{ primitiveId: "pad-a", groups: [
    { nativeStartLayer: 1, nativeEndLayer: 1, shape: { shape: "RECT", width: 20.1, height: 30.2, cornerRatioPercent: 25 } },
    { nativeStartLayer: 1, nativeEndLayer: 2, shape: { shape: "ELLIPSE", width: 40.3, height: 50.4 } },
    { nativeStartLayer: 2, nativeEndLayer: 2, shape: { shape: "OVAL", width: 60.5, height: 70.6 } }
  ] }, { primitiveId: "pad-b", groups: [] }, { primitiveId: "pad-c", groups: [] }]);
  assert.equal(result["specialShapeScope"], "native-top-inner-bottom-style-groups");
  for (const key of ["physicalLayerExpansionVerified", "startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified",
    "reciprocalParentVerified", "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["specialShapeGroups"]), true);
  const empty = await fixture({ pad: [] }).run();
  assert.deepEqual(empty["specialShapeGroups"], []); assert.equal(empty["sourceMembershipVerified"], false);
});

void test("209 Pad shapes recheck receiver frame and target around each await", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:[]});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';"]) {
    for (let at = 1; at <= 6; at += 1) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_PAD_SHAPES_REFUSED/u);
      // Native identity changes are seen by its next bracket; frame/receiver checks follow every call.
      const expected = mutation.startsWith("identity.") && [2, 5].includes(at) ? at + 1 : at;
      assert.equal(value.childRead("calls"), expected);
    }
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];", "sealed.unexpected=true;"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_PAD_SHAPES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 Pad comparison includes middle style group empty state order and base geometry", async () => {
  for (const mutation of ["rows.pad[0].specialPadShapeAspect[1][2][1]++;", "rows.pad[0].specialPadShapeAspect[0][2][3]++;",
    "rows.pad[0].specialPadShapeAspect=[];", "rows.pad[1].specialPadShapeAspect=JSON.parse(JSON.stringify(rows.pad[0].specialPadShapeAspect));",
    "rows.pad[0].center.x++;", "rows.pad[0].net='';", "rows.pad[0].padRule.lineAngle=0;", "rows.pad.reverse();"]) {
    await assert.rejects(fixture(inputRows(), `if(calls===4){${mutation}}`).run(), /PCB209_PAD_SHAPES_REFUSED/u);
  }
});

void test("209 Pad special selectors shapes and descriptors refuse incomplete or unrepresentable geometry", async () => {
  for (const mutation of ["delete rows.pad[0].specialPadShapeAspect;", "rows.pad[0].specialPadShapeAspect=null;",
    "rows.pad[0].specialPadShapeAspect.pop();", "rows.pad[0].specialPadShapeAspect.reverse();",
    "rows.pad[0].specialPadShapeAspect[1][0]=2;", "rows.pad[0].specialPadShapeAspect[1][1]=1;",
    "rows.pad[0].specialPadShapeAspect[1][2]=['NGON',10,6];", "rows.pad[0].specialPadShapeAspect[1][2]=['POLYGON',10,6];",
    "rows.pad[0].specialPadShapeAspect[1][2]=['ELLIPSE',10,6,0];", "rows.pad[0].specialPadShapeAspect[0][2].pop();",
    "rows.pad[0].specialPadShapeAspect[1][2][1]=NaN;", "rows.pad[0].specialPadShapeAspect[1][2][1]=-0;",
    "rows.pad[0].specialPadShapeAspect[1][2][1]=-1;", "rows.pad[0].specialPadShapeAspect[1][2][2]=1e13;",
    "rows.pad[0].specialPadShapeAspect[0][2][3]=101;", "rows.pad[0].specialPadShapeAspect[0][2][3]=-1;",
    "rows.pad[0].specialPadShapeAspect[1].push('private');", "rows.pad[0].specialPadShapeAspect.private=true;",
    "Object.defineProperty(rows.pad[0].specialPadShapeAspect[1],'2',{get(){throw new Error('PRIVATE');}});",
    "rows.pad[0].defaultPadShapeAspect=['NGON',10,6];", "rows.pad[0].layerId=15;", "rows.pad[1].globalIndex='pad-a';",
    "rows.pad[0].net=undefined;", "delete rows.pad[1];", "rows.pad[0].holeAspect=['ROUND',-1];",
    "rows.pad[0].num=String.fromCharCode(0xd800);"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_PAD_SHAPES_REFUSED/u);
  }
});

void test("209 Pad observation enforces row UTF16 and complete aggregate bounds", async () => {
  for (const mutation of [
    "rows.pad=Array.from({length:257},(_,i)=>({...rows.pad[0],globalIndex:'pad'+i}));",
    "rows.pad[0].num='😀'.repeat(513);",
    "rows.pad=Array.from({length:256},(_,i)=>({...rows.pad[0],globalIndex:'pad'+i,net:'x'.repeat(1024),num:'y'.repeat(1024)}));"
  ]) { await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_PAD_SHAPES_REFUSED/u); }
});

void test("209 Pad timeout stops subsequent calls and returns no partial collection", async () => {
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_PAD_SHAPES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

void test("209 Pad decoder independently validates flags family identities and special style groups", async () => {
  const raw = await fixture().raw();
  const packet: unknown = JSON.parse(raw); assert.ok(packet !== null && typeof packet === "object");
  const groups = records.parse(Reflect.get(packet, "specialShapeGroups"));
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_PAD_SHAPES_TARGET/u);
  for (const [before, after] of [['"samples":2', '"samples":1'], ['"cadAuthority":false', '"cadAuthority":true'],
    ['"primitiveType":"Pad"', '"primitiveType":"Image"'], ['"nativeEndLayer":2', '"nativeEndLayer":1'],
    ['"width":20.1', '"width":-1'], ['"primitiveId":"pad-b"', '"primitiveId":"pad-a"']] as const) {
    assert.throws(() => decode(raw.replace(before, after)));
  }
  // Target only the special rectangle ratio; the unchanged base DTO has its own historical range contract.
  assert.throws(() => decode(raw.replace('"height":30.2,"cornerRatioPercent":25', '"height":30.2,"cornerRatioPercent":101')));
  assert.throws(() => decode(JSON.stringify({ ...packet, specialShapeGroups: groups.toReversed() })), /PCB209_PAD_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, specialShapeGroups: [] })), /PCB209_PAD_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, privateExtra: true })));
  const base = z.record(z.string(), z.unknown()).parse(Reflect.get(packet, "observation"));
  const rows = records.parse(base["rows"]);
  const first = rows[0]; assert.ok(first);
  for (const field of ["padNumber", "net"]) {
    assert.throws(() => decode(JSON.stringify({ ...packet, observation: { ...base,
      rows: [{ ...first, [field]: String.fromCodePoint(0xD8_00) }, ...rows.slice(1)] } })), /PCB209_PAD_SHAPES_TEXT/u);
  }
});

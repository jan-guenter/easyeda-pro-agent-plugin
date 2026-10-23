import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_PRIMITIVES_FUNCTION, decodeCurrentPcb209PrimitivesReply } from "../src/current-pcb-209-primitives.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\PrimitiveFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209PrimitivesReply({ result: { type: "string", value } }, target); }
function inputRows(): Record<string, Record<string, unknown>[]> {
  const line = { globalIndex: "line-a", locked: false, net: "Mixed Net", layerId: 1,
    startX: 1.23456789, startY: 2, endX: 3, endY: 4, width: 5.6789 };
  return { track: [line], arc: [{ ...line, globalIndex: "arc-a", net: "", arcAngle: 89.1234567, arcType: 1 }],
    via: [{ globalIndex: "via-a", locked: true, net: null, center: { x: 2, y: 3 }, holeRadius: 4.1234567,
      radius: 8.1234567, type: 0, name: null, startLayer: 1, endLayer: 2, expansion: 1, topExpansion: -0.25, bottomExpansion: 0 }],
    string: [{ globalIndex: "string-a", locked: false, layerId: 3, position: { x: 2, y: 3 }, value: "Text\\\"\n一",
      fontFamily: "", fontSize: 12, strokeWidth: 0.8, origin: 3, rotation: Math.PI / 2, reverse: false,
      reverseExpansion: 0, mirror: true, key: "", showKey: false, showValue: true, positionIsNull: false, silkColor: "#a.492f" }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={track:0,arc:0,via:0,string:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(track|arc|via|string)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_PRIMITIVES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209PrimitivesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 original primitive program observes four ordered view families with two exact samples", async () => {
  const value = fixture(); const result = await value.run(); const families = records.parse(result["families"]);
  assert.deepEqual(families.map(entry => entry["family"]), ["Line", "Arc", "Via", "String"]);
  assert.equal(value.childRead("calls"), 12); assert.equal(value.childRead("Object.values(readCounts).every(n=>n===2)"), true);
  const rows = families.map(entry => records.parse(entry["rows"]));
  assert.deepEqual(families[0]?.["primitiveIds"], ["line-a"]);
  assert.deepEqual(families[3]?.["primitiveIds"], ["string-a"]);
  const line = rows[0]?.[0]; const arc = rows[1]?.[0]; const via = rows[2]?.[0]; const string = rows[3]?.[0];
  assert.equal(line?.["startX"], 1.23456789); assert.equal(line["net"], "Mixed Net");
  assert.equal(arc?.["net"], ""); assert.equal(arc["arcAngle"], 89.1234567);
  assert.equal(via?.["net"], null); assert.equal(via["holeDiameter"], 8.2469134); assert.equal(via["topMaskExpansion"], -2.5);
  assert.equal(string?.["text"], "Text\\\"\n一"); assert.equal(string["x"], 20); assert.equal(string["fontSize"], 120);
  assert.equal(string["rotation"], 90); assert.equal(string["silkColor"], "#a.492f"); assert.equal(string["fontFamily"], "");
  for (const key of ["startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified", "connectivityVerified",
    "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["families"]), true);
});

void test("209 empty families are observations only and do not prove an empty board", async () => {
  const result = await fixture({ track: [], arc: [], via: [], string: [] }).run();
  assert.equal(result["completeLiveBaselineVerified"], false); assert.equal(result["sourceMembershipVerified"], false);
  const families = result["families"]; assert.ok(Array.isArray(families));
  assert.deepEqual(families.map(entry => Reflect.get(entry, "rows") as unknown), [[], [], [], []]);
});

void test("209 primitive observations refuse frame, receiver and target changes around every awaited RPC", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:[]});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';"]) {
    for (const at of [1, 2, 5, 6, 7, 11, 12]) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_PRIMITIVES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 12);
    }
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];", "sealed.unexpected=true;"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_PRIMITIVES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 primitive samples retain and compare every projected scalar and family order", async () => {
  const mutations = ["rows.track[0].startX++;", "rows.track[0].locked=true;", "rows.arc[0].arcAngle++;", "rows.arc[0].arcType=2;",
    "rows.via[0].net='';", "rows.via[0].name='';", "rows.via[0].endLayer=15;", "rows.via[0].bottomExpansion=0.1;",
    "rows.string[0].value='changed';", "rows.string[0].key='changed';", "rows.string[0].showKey=true;", "rows.string[0].positionIsNull=true;",
    "rows.string[0].silkColor=null;", "rows.string[0].fontFamily='default';", "rows.string[0].mirror=false;"];
  for (const mutation of mutations) { await assert.rejects(fixture(inputRows(), `if(calls===7){${mutation}}`).run(), /PCB209_PRIMITIVES_REFUSED/u); }
  const rows = inputRows(); rows["track"]?.push({ ...rows["track"][0], globalIndex: "line-b" });
  await assert.rejects(fixture(rows, "if(calls===7)rows.track.reverse();").run(), /PCB209_PRIMITIVES_REFUSED/u);
});

void test("209 primitive native bounds and strict data descriptors reject malformed or incomplete results", async () => {
  for (const childBefore of ["rows.track[0].startX=-0;", "rows.arc[0].arcAngle=NaN;", "rows.via[0].net=undefined;",
    "delete rows.string[0].showValue;", String.raw`rows.string[0].value='\ud800';`, "rows.string[0].silkColor='';", "rows.string[0].origin=10;",
    "rows.via[0].name=42;", "rows.via[0].center.x=Infinity;", "rows.arc[0].globalIndex=rows.track[0].globalIndex;",
    "rows.track.push({...rows.track[0]});", "rows.track[1]=rows.track[0];delete rows.track[0];",
    "Object.defineProperty(rows.track[0],'net',{get(){throw new Error('PRIVATE');}});",
    "Object.setPrototypeOf(rows.track[0],{net:'inherited'});delete rows.track[0].net;",
    "Bus.prototype.rpcCall=async()=>({message:undefined});", "Bus.prototype.rpcCall=async()=>{throw new Error('PRIVATE_PATH');};"]) {
    await assert.rejects(fixture(inputRows(), "", "", childBefore).run(), /PCB209_PRIMITIVES_REFUSED/u);
  }
  const oversized = inputRows(); oversized["track"] = Array.from({ length: 257 }, (_, index) => ({ ...oversized["track"]?.[0], globalIndex: `line-${index}` }));
  await assert.rejects(fixture(oversized).run(), /PCB209_PRIMITIVES_REFUSED/u);
  const bytes = inputRows(); bytes["string"] = Array.from({ length: 7 }, (_, index) => ({ ...bytes["string"]?.[0], globalIndex: `string-${index}`, value: "x".repeat(65_536) }));
  await assert.rejects(fixture(bytes).run(), /PCB209_PRIMITIVES_REFUSED/u);
});

void test("209 primitive timeout stops later native calls without returning partial families", async () => {
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_PRIMITIVES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

void test("209 primitive decoder independently rejects false targets, family swaps, flags and cross-family IDs", async () => {
  const raw = await fixture().raw();
  const packet: unknown = JSON.parse(raw); assert.ok(packet !== null && typeof packet === "object");
  const observations = records.parse(Reflect.get(packet, "observations"));
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_PRIMITIVES_TARGET/u);
  assert.throws(() => decode(raw.replace('"samples":2', '"samples":1')));
  assert.throws(() => decode(raw.replace('"cadAuthority":false', '"cadAuthority":true')));
  assert.throws(() => decode(raw.replace('"primitiveType":"Line"', '"primitiveType":"Arc"')));
  assert.throws(() => decode(raw.replace('"arc-a"', '"line-a"')), /PCB209_PRIMITIVES_DUPLICATE/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, observations: observations.toReversed() })), /PCB209_PRIMITIVES_FAMILY/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, privateExtra: true })));
});

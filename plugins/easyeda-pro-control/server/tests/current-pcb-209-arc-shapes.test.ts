import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_ARC_SHAPES_FUNCTION, decodeCurrentPcb209ArcShapesReply } from "../src/current-pcb-209-arc-shapes.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\ArcShapeFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209ArcShapesReply({ result: { type: "string", value } }, target); }
function arc(globalIndex: string, x: number, y: number, radius: number, startAngle: number, endAngle: number, sweep: 0 | 1,
  net: string | null = "Mixed Net", arcType = 1): Record<string, unknown> {
  const turn = Math.PI * 2;
  const angle = sweep === 1 ? (endAngle + turn - startAngle) % turn : -(startAngle + turn - endAngle) % turn;
  return { globalIndex, locked: false, net, layerId: 1, center: { x, y }, radius, startAngle, endAngle, sweep,
    startX: (x + Math.cos(startAngle) * radius) * 10, startY: (y + Math.sin(startAngle) * radius) * 10,
    endX: (x + Math.cos(endAngle) * radius) * 10, endY: (y + Math.sin(endAngle) * radius) * 10,
    width: 0.123456789, arcAngle: angle * 180 / Math.PI, arcType };
}
function inputRows(): Record<string, Record<string, unknown>[]> {
  return { arc: [arc("arc-a", 1.23456789, 2, 3.543210987, 0.123, 4.56, 1),
    arc("arc-b", -20, 10, 1, Math.PI * 2, 0, 1, null, 2),
    arc("arc-c", 3, 4, 5, 4.8, 0.2, 0, ""), arc("arc-d", 10, 11, 0, 0.75, 0.75, 1)] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={arc:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(arc)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_ARC_SHAPES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209ArcShapesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 Arc shapes preserve native geometry units direction and base DTOs in six calls", async () => {
  const value = fixture();
  const result = await value.run();
  const families = records.parse(result["families"]);
  assert.equal(value.childRead("calls"), 6); assert.equal(value.childRead("readCounts.arc"), 2);
  assert.deepEqual(families.map(entry => entry["family"]), ["Arc"]);
  const rows = records.parse(families[0]?.["rows"]), shapes = records.parse(result["arcShapes"]);
  assert.equal(shapes[0]?.["centerX"], 1.23456789 * 10);
  assert.equal(shapes[0]?.["centerY"], 20);
  assert.equal(shapes[0]?.["radius"], 3.543210987 * 10);
  assert.equal(shapes[0]?.["startAngleRadians"], 0.123);
  assert.equal(shapes[0]?.["endAngleRadians"], 4.56);
  assert.equal(shapes[0]?.["sweep"], 1);
  assert.equal(shapes[1]?.["startAngleRadians"], Math.PI * 2);
  assert.equal(shapes[1]?.["endAngleRadians"], 0);
  assert.equal(rows[1]?.["arcAngle"], 0);
  assert.equal(rows[1]?.["interactiveMode"], 2);
  assert.equal(rows[1]?.["net"], null); assert.equal(rows[2]?.["net"], "");
  assert.equal(shapes[2]?.["sweep"], 0); assert.ok(Number(rows[2]?.["arcAngle"]) < 0);
  assert.equal(shapes[3]?.["radius"], 0); assert.equal(rows[3]?.["arcAngle"], 0);
  assert.equal(rows[0]?.["lineWidth"], 0.123456789);
  assert.deepEqual(result["units"], { linear: "mil", arcAngle: "degrees", endpointAngles: "radians", sweep: "native-enum-0-CW-1-CCW" });
  for (const key of ["fullCircleInterpretationVerified", "startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified",
    "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["arcShapes"]), true);
  const empty = await fixture({ arc: [] }).run(); assert.deepEqual(empty["arcShapes"], []);
});

void test("209 Arc shapes recheck receiver frame and target around every await", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:[]});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';"]) {
    for (let at = 1; at <= 6; at += 1) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_ARC_SHAPES_REFUSED/u);
      const expected = mutation.startsWith("identity.") && [2, 5].includes(at) ? at + 1 : at;
      assert.equal(value.childRead("calls"), expected);
    }
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];", "sealed.unexpected=true;"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_ARC_SHAPES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 Arc samples reject changed order metadata or native geometry without partial output", async () => {
  for (const mutation of ["rows.arc.reverse();", "rows.arc[0].net='changed';", "rows.arc[0].center.x++;",
    "rows.arc[0].radius++;", "rows.arc[0].startAngle++;", "rows.arc[0].endAngle++;", "rows.arc[0].sweep=0;",
    "rows.arc[0].arcType=2;", "rows.arc[0].width++;"]) {
    await assert.rejects(fixture(inputRows(), `if(calls===4){${mutation}}`).run(), /PCB209_ARC_SHAPES_REFUSED/u);
  }
});

void test("209 Arc native geometry refuses malformed fields and inconsistent endpoint arithmetic", async () => {
  for (const mutation of ["delete rows.arc[0].center;", "rows.arc[0].center=null;", "rows.arc[0].center.x=NaN;",
    "rows.arc[0].center.x=-0;", "rows.arc[0].center.extra=1;", "rows.arc[0].radius=-1;", "rows.arc[0].radius=Infinity;",
    "rows.arc[0].radius=1e12;", "rows.arc[0].startAngle=-1;", "rows.arc[0].endAngle=Math.PI*2+1e-8;",
    "rows.arc[0].startAngle=-0;", "rows.arc[0].sweep=2;", "rows.arc[0].sweep='1';", "rows.arc[0].arcType=0;",
    "rows.arc[0].startX+=1e-8;", "rows.arc[0].startY+=1e-8;", "rows.arc[0].endX+=1e-8;", "rows.arc[0].endY+=1e-8;",
    "rows.arc[0].arcAngle+=1e-8;", "rows.arc[1].globalIndex='arc-a';", "delete rows.arc[1];", "rows.arc[0].net=undefined;",
    "rows.arc[0].net=String.fromCharCode(0xd800);", "rows.arc[0].globalIndex=String.fromCharCode(0xd800);",
    "Object.defineProperty(rows.arc[0],'radius',{get(){throw new Error('PRIVATE');}});",
    "rows.arc[0].center=Object.create({x:1,y:2});", "rows.arc.extra=true;", "rows.arc[1].arcAngle=-0;"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_ARC_SHAPES_REFUSED/u);
  }
});

void test("209 Arc shapes enforce row text and aggregate bounds", async () => {
  for (const mutation of ["rows.arc=Array.from({length:257},(_,i)=>({...rows.arc[0],globalIndex:'arc'+i}));",
    "rows.arc[0].net='😀'.repeat(513);", "rows.arc[0].globalIndex='x'.repeat(257);",
    "rows.arc=Array.from({length:256},(_,i)=>({...rows.arc[0],globalIndex:'x'.repeat(250)+i,net:'😀'.repeat(512)}));"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_ARC_SHAPES_REFUSED/u);
  }
});

void test("209 Arc timeout stops subsequent calls and does not grant partial results", async () => {
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_ARC_SHAPES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

void test("209 Arc decoder independently rejects swapped descriptors malformed fields and inconsistent geometry", async () => {
  const raw = await fixture().raw();
  const packet = z.record(z.string(), z.unknown()).parse(JSON.parse(raw));
  const shapes = records.parse(packet["arcShapes"]);
  const observation = z.record(z.string(), z.unknown()).parse(packet["observation"]);
  const first = shapes[0], rows = records.parse(observation["rows"]); assert.ok(first);
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_ARC_SHAPES_TARGET/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, arcShapes: shapes.toReversed() })), /PCB209_ARC_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, arcShapes: [] })), /PCB209_ARC_SHAPES_ASSOCIATION/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, privateExtra: true })));
  for (const [key, value] of [["centerX", Number(first["centerX"]) + 0.01], ["centerY", Number(first["centerY"]) + 0.01],
    ["radius", Number(first["radius"]) + 0.01], ["startAngleRadians", -1], ["endAngleRadians", 7], ["sweep", 2],
    ["primitiveId", String.fromCodePoint(0xD8_00)]] as const) {
    assert.throws(() => decode(JSON.stringify({ ...packet, arcShapes: [{ ...first, [key]: value }, ...shapes.slice(1)] })));
  }
  for (const [before, after] of [['"samples":2', '"samples":1'], ['"cadAuthority":false', '"cadAuthority":true'],
    ['"primitiveType":"Arc"', '"primitiveType":"Line"']] as const) { assert.throws(() => decode(raw.replace(before, after))); }
  const firstRow = rows[0]; assert.ok(firstRow);
  assert.throws(() => decode(JSON.stringify({ ...packet, observation: { ...observation,
    rows: [{ ...firstRow, startX: Number(firstRow["startX"]) + 0.01 }, ...rows.slice(1)] } })), /PCB209_ARC_SHAPES_GEOMETRY/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, observation: { ...observation,
    rows: [{ ...firstRow, net: String.fromCodePoint(0xD8_00) }, ...rows.slice(1)] } })), /PCB209_ARC_SHAPES_TEXT/u);
});

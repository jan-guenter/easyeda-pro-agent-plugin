import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_SELECTION_RELATIONS_FUNCTION, currentPcb209SelectionRelationsComponentIdsSchema,
  decodeCurrentPcb209SelectionRelationsReply } from "../src/current-pcb-209-selection-relations.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\SelectionRelationsFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
const requested = ["component-a", "component-b"];
function decode(value: string, ids = requested): Readonly<Record<string, unknown>> { return decodeCurrentPcb209SelectionRelationsReply({ result: { type: "string", value } }, target, ids); }
function inputRows(): Record<string, Record<string, unknown>[]> {
  const component = { globalIndex: "component-a", locked: true, layerId: 2, position: { x: 12.3456789, y: -8 }, rotation: 89.123456,
    attrsMap: { Designator: "U1", Name: "={Manufacturer Part}", Manufacturer: "", "Manufacturer Part": "Part", Supplier: "LCSC", "Supplier Part": "C1" } };
  const pad = { globalIndex: "pad-a", locked: false, net: "Mixed Net", layerId: 12, center: { x: 1.23456789, y: 2 }, rotation: 89.123456,
    num: "A1", plated: true, padTypeAspect: 0, holeAspect: ["ROUND", 8.7654], holeOffset: { x: -1, y: 2 }, holeRotation: 45,
    defaultPadShapeAspect: ["ELLIPSE", 10, 12], expansionType: 2, topSolderExpansion: -1, bottomSolderExpansion: 0, pasteExpansion: 0.125,
    padRule: { connectMode: 0, lineClearance: 0.5, lineWidth: 0.25, lineAngle: Math.PI / 2 } };
  const attribute = { globalIndex: "attribute-a", locked: false, layerId: 3, position: { x: 2, y: 3 }, value: "Part 一",
    fontFamily: "", fontSize: 12, strokeWidth: 0.8, origin: 3, rotation: Math.PI / 2, reverse: false,
    reverseExpansion: 0, mirror: true, key: "Name", showKey: false, showValue: true, positionIsNull: false, silkColor: "#a.492f" };
  const track = { globalIndex: "line-a", locked: false, net: "", layerId: 1, startX: 1, startY: 2, endX: 3, endY: 4, width: 5 };
  return { track: [track], arc: [{ ...track, globalIndex: "arc-a", net: null, arcType: 1, arcAngle: 90 }],
    via: [{ globalIndex: "via-a", locked: false, net: "GND", center: { x: 3, y: 4 }, type: 0, holeRadius: 3, radius: 6,
      name: null, startLayer: 1, endLayer: 2, expansion: 1, topExpansion: 0, bottomExpansion: 0 }],
    string: [{ ...attribute, globalIndex: "string-a" }], component: [component, { ...component, globalIndex: "component-b", attrsMap: {} }],
    pad: [pad, { ...pad, globalIndex: "pad-b", net: "", holeAspect: ["SLOT", 4, 8], defaultPadShapeAspect: ["RECT", 10, 12, 25], padRule: { connectMode: 1 } },
      { ...pad, globalIndex: "pad-c", net: null, holeAspect: null, defaultPadShapeAspect: ["POLYGON", [0, 0, "L", 2, 4, "ARC", 90, 5, 6]], padRule: null }],
    attribute: [{ parentPrimitiveId: "component-a", attrs: [attribute] }, { parentPrimitiveId: "component-b", attrs: [] }],
    dimension: [{ globalIndex: "dimension-a", locked: false, layerId: 13, dimensionType: "Length Dimension", coordinateSet: [0, 1, 2, 3, 4, 5, 6, 7], unit: "mm", width: 6, precision: 1 },
      { globalIndex: "dimension-b", locked: true, layerId: 3, dimensionType: "Radius Dimension", coordinateSet: [0, 1, 2, 3, 4, 5], unit: "mil", width: 0, precision: 0 },
      { globalIndex: "dimension-c", locked: false, layerId: 4, dimensionType: "Protractor Dimension", coordinateSet: [0, 1, 2, 3, 4, 5], unit: "inch", width: 2.25, precision: 4 }],
    image: [{ globalIndex: "image-a", locked: false, layerId: 1, imageType: "Image", start: { x: 1.23456789, y: 7 }, width: 120, height: 80, rotation: 45, mirror: true },
      { globalIndex: "image-b", locked: true, layerId: 2, imageType: "Picture", start: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0, mirror: false }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = "", componentIds = requested): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={};globalThis.selected=["pad-b","string-a","attribute-a","component-a","line-a","arc-a","via-a","dimension-a","image-a"];globalThis.groups={"component-a":rows.pad,"component-b":[]};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null,kind;
if(topic==="getTabIdAndDocType"){kind="identity";if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}
else if(topic==="pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds"){kind="selected";if(arg!==undefined)throw new Error("PRIVATE_SELECTION_ARGS");}
else if(topic==="pcb/extensionAPI/component-getAllPinsByPrimitiveId"){kind="children";if(typeof arg!=="string")throw new Error("PRIVATE_CHILD_ARGS");}
else{kind="family";family=/^pcb\\/extensionAPI\\/(track|arc|via|component|pad|string|attribute|dimension|image)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]=(readCounts[family]??0)+1;}
${afterCall}return {message:kind==="identity"?identity:kind==="selected"?selected:kind==="children"?groups[arg]:rows[family]};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};globalThis.location={href:"https://client/editor?entry=pcb"};${childBefore}`, child);
  const context = createContext({ child: runInContext("globalThis", child) as unknown, TextEncoder, setTimeout, clearTimeout, queueMicrotask });
  runInContext(`globalThis.sealed=${JSON.stringify(target)};globalThis.componentIds=${JSON.stringify(componentIds)};globalThis.tabId=sealed.documentUuid+"@"+sealed.projectUuid;
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_SELECTION_RELATIONS_FUNCTION})(sealed,"observe",componentIds)`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209SelectionRelationsReply({ result: { type: "string", value: await raw() } }, target, componentIds),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 selection and relations compare complete nine-family samples and preserve ordered scalar evidence", async () => {
  const value = fixture(inputRows(), "", "", "rows.component[1].attrsMap.Name=undefined;groups['component-a']=rows.pad.map(p=>({...p,holeAspect:['ROUND',0.123],holeRotation:NaN,center:{x:999,y:999}}));");
  const result = await value.run();
  const families = records.parse(result["families"]);
  assert.deepEqual(families.map(entry => entry["family"]), ["Line", "Arc", "Via", "Component", "Pad", "String", "Attribute", "Dimension", "Image"]);
  assert.equal(value.childRead("calls"), 30); assert.equal(value.childRead("Object.values(readCounts).every(n=>n===2)"), true);
  assert.deepEqual(result["selectedPrimitiveIds"], ["pad-b", "string-a", "attribute-a", "component-a", "line-a", "arc-a", "via-a", "dimension-a", "image-a"]);
  const selected = records.parse(result["selectedRows"]);
  assert.deepEqual(selected.map(row => row["primitiveId"]), result["selectedPrimitiveIds"]);
  assert.equal(selected[0]?.["net"], ""); assert.equal(selected[5]?.["net"], null);
  assert.equal(selected[2]?.["parentPrimitiveId"], "component-a");
  const groups = records.parse(result["componentPadGroups"]), pads = records.parse(families[4]?.["rows"]);
  assert.equal(pads[0]?.["x"], 1.23456789); assert.deepEqual(pads[0]?.["hole"], { shape: "ROUND", diameter: 8.7654, offsetX: -1, offsetY: 2, rotation: 45 });
  assert.deepEqual(groups.map(group => group["ids"]), [["pad-a", "pad-b", "pad-c"], []]);
  assert.deepEqual(records.parse(groups[0]?.["scalarRows"])[2], { primitiveId: "pad-c", padNumber: "A1", net: null, layer: 12, primitiveLock: false, metallization: true, padType: 0 });
  assert.deepEqual(groups[1], { parentPrimitiveId: "component-b", ids: [], scalarRows: [] });
  assert.equal(z.record(z.string(), z.string()).parse(records.parse(result["componentMetadataStates"])[1]?.["states"])["name"], "undefined");
  for (const key of ["startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified", "reciprocalParentVerified", "symbolPinMappingVerified",
    "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["componentPadGroups"]), true);
});

void test("209 empty selection still observes all supported families and requested empty child groups", async () => {
  const value = fixture(inputRows(), "", "", "selected=[];groups['component-a']=[];", requested);
  const result = await value.run(); assert.deepEqual(result["selectedRows"], []); assert.equal(value.childRead("calls"), 30);
  assert.equal(records.parse(result["families"]).length, 9);
  const empty = fixture({ track: [], arc: [], via: [], component: [], pad: [], string: [], attribute: [], dimension: [], image: [] }, "", "", "selected=[];", []);
  const observed = await empty.run(); assert.deepEqual(observed["componentPadGroups"], []); assert.deepEqual(observed["componentMetadataStates"], []);
  assert.equal(empty.childRead("calls"), 26); assert.equal(observed["completeLiveBaselineVerified"], false);
});

void test("209 requested ID data is bounded distinct well-formed UTF16 and rejects before RPC", async () => {
  for (const ids of [["same", "same"], [""], ["😀".repeat(129)], [String.fromCodePoint(0xD8_00)], Array.from({ length: 17 }, (_, i) => `c${i}`)]) {
    assert.equal(currentPcb209SelectionRelationsComponentIdsSchema.safeParse(ids).success, false);
    const value = fixture(inputRows(), "", "", "", ids); await assert.rejects(value.raw(), /PCB209_SELECTION_RELATIONS_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
  assert.deepEqual(currentPcb209SelectionRelationsComponentIdsSchema.parse(["line\nquote\"slash\\", "😀".repeat(128)]), ["line\nquote\"slash\\", "😀".repeat(128)]);
  for (const before of ["componentIds.length=3;", "Object.defineProperty(componentIds,'0',{get(){throw new Error('PRIVATE');}});"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.raw(), /PCB209_SELECTION_RELATIONS_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 selection refuses unsupported duplicate missing changed and reordered IDs without silent skips", async () => {
  for (const mutation of ["selected=['unsupported-region'];", "selected=['pad-a','pad-a'];", "selected=[undefined];", "selected=[''];",
    "selected=Array.from({length:257},(_,i)=>'id'+i);", "Object.defineProperty(selected,'0',{get(){throw new Error('PRIVATE');}});"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
  }
  for (const call of [14, 16, 29]) {
    const value = fixture(inputRows(), `if(calls===${call})selected.reverse();`);
    await assert.rejects(value.run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
  }
  await assert.rejects(fixture(inputRows(), "if(calls===16)rows.track[0].width++;").run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
});

void test("209 component child lookup preserves null versus empty and refuses missing inconsistent or duplicate membership", async () => {
  for (const mutation of ["groups['component-a']=null;", "groups['component-a']=undefined;", "groups['component-a']=[{...rows.pad[0],globalIndex:'missing'}];",
    "groups['component-a']=[rows.pad[0],rows.pad[0]];", "groups['component-b']=[rows.pad[0]];", "groups['component-a']=[{...rows.pad[0],num:'different'}];",
    "groups['component-a']=[{...rows.pad[0],net:null}];", "groups['component-a']=[{...rows.pad[0],locked:true}];", "groups['component-a']=[{...rows.pad[0],layerId:1}];",
    "groups['component-a']=[{...rows.pad[0],plated:false}];", "groups['component-a']=[{...rows.pad[0],padTypeAspect:2}];",
    "groups['component-a']=Array(257).fill(rows.pad[0]);", "Object.defineProperty(rows.pad[0],'num',{get(){throw new Error('PRIVATE');}});"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
  }
  const missing = fixture(inputRows(), "", "", "", ["missing"]);
  await assert.rejects(missing.run(), /PCB209_SELECTION_RELATIONS_REFUSED/u); assert.equal(missing.childRead("calls"), 11);
  await assert.rejects(fixture(inputRows(), "if(calls===16)groups['component-a']=[...groups['component-a']].reverse();").run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
});

void test("209 combined reader rechecks original frame receiver and target at collection and relationship boundaries", async () => {
  for (const mutation of ["parent.frame.contentWindow={};", "Bus.prototype.rpcCall=async()=>({message:[]});", "parent.activeTab='other';"]) {
    for (const at of [1, 2, 11, 12, 14, 15, 16, 26, 27, 29, 30]) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_SELECTION_RELATIONS_REFUSED/u); assert.equal(value.childRead("calls"), at);
    }
  }
  const timeout = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(timeout.run(), /PCB209_SELECTION_RELATIONS_REFUSED/u); assert.ok(Number(timeout.childRead("calls")) <= 1);
});

void test("209 combined aggregate bound includes unselected families and maximum requested parents use58 RPCs", async () => {
  const oversized = fixture(inputRows(), "", "", "selected=[];rows.attribute[0].attrs=Array.from({length:7},(_,i)=>({...rows.attribute[0].attrs[0],globalIndex:'attribute'+i,value:'x'.repeat(65536)}));");
  await assert.rejects(oversized.run(), /PCB209_SELECTION_RELATIONS_REFUSED/u);
  const selectedLarge = fixture(inputRows(), "", "", "rows.attribute[0].attrs=Array.from({length:4},(_,i)=>({...rows.attribute[0].attrs[0],globalIndex:'attribute'+i,value:'x'.repeat(65536)}));selected=rows.attribute[0].attrs.map(row=>row.globalIndex);");
  await assert.rejects(selectedLarge.run(), /PCB209_SELECTION_RELATIONS_RESULT_BOUND/u);
  const ids = Array.from({ length: 16 }, (_, i) => `component-${i}`);
  const full = fixture(inputRows(), "", "", `selected=[];rows.component=${JSON.stringify(ids)}.map(id=>({...rows.component[0],globalIndex:id}));rows.attribute=rows.component.map(row=>({parentPrimitiveId:row.globalIndex,attrs:[]}));groups=Object.fromEntries(rows.component.map(row=>[row.globalIndex,[]]));`, ids);
  const result = await full.run(); assert.equal(full.childRead("calls"), 58); assert.equal(records.parse(result["componentPadGroups"]).length, 16);
});

void test("209 decoder independently binds requested parents selections groups scalar matches and complete metadata", async () => {
  const raw = await fixture().raw(); const packet = z.record(z.string(), z.unknown()).parse(JSON.parse(raw));
  const mutate = (change: (value: Record<string, unknown>) => void): string => { const value = structuredClone(packet); change(value); return JSON.stringify(value); };
  assert.throws(() => decode(raw, requested.toReversed()), /PCB209_SELECTION_RELATIONS_REQUEST/u);
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_SELECTION_RELATIONS_TARGET/u);
  assert.throws(() => decode(mutate(value => { value["privateExtra"] = true; })));
  assert.throws(() => decode(mutate(value => { value["selectedPrimitiveIds"] = ["missing"]; })), /PCB209_SELECTION_RELATIONS_SELECTED_MISSING/u);
  assert.throws(() => decode(mutate(value => { value["selectedPrimitiveIds"] = ["pad-a", "pad-a"]; })), /PCB209_SELECTION_RELATIONS_SELECTED_DUPLICATE/u);
  assert.throws(() => decode(mutate(value => { value["componentPadGroups"] = records.parse(value["componentPadGroups"]).toReversed(); })), /PCB209_SELECTION_RELATIONS_GROUP_ORDER/u);
  assert.throws(() => decode(mutate(value => { value["componentMetadataStates"] = []; })), /PCB209_SELECTION_RELATIONS_COMPONENT_ASSOCIATION/u);
  for (const mode of ["ids", "scalar", "missing", "duplicate"] as const) {
    const changed = mutate(value => {
      const groups = records.parse(value["componentPadGroups"]);
      const group = groups[0]; assert.ok(group);
      if (mode === "ids") { group["ids"] = []; }
      else {
        const rows = records.parse(group["scalarRows"]);
        const row = rows[0]; assert.ok(row);
        if (mode === "scalar") { row["net"] = null; }
        if (mode === "missing") { row["primitiveId"] = "missing"; group["ids"] = ["missing", "pad-b", "pad-c"]; }
        if (mode === "duplicate") { rows.push(row); group["ids"] = ["pad-a", "pad-b", "pad-c", "pad-a"]; }
        group["scalarRows"] = rows;
      }
      value["componentPadGroups"] = groups;
    });
    assert.throws(() => decode(changed), /PCB209_SELECTION_RELATIONS_CHILD_/u);
  }
  assert.throws(() => decode(raw.replace('"samples":2', '"samples":1')));
  assert.throws(() => decode(raw.replace('"cadAuthority":false', '"cadAuthority":true')));
});

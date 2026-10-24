import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION, decodeCurrentPcb209ExtendedPrimitivesReply } from "../src/current-pcb-209-extended-primitives.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\ExtendedPrimitiveFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209ExtendedPrimitivesReply({ result: { type: "string", value } }, target); }
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
  return { component: [component, { ...component, globalIndex: "component-b", attrsMap: {} }],
    pad: [pad, { ...pad, globalIndex: "pad-b", net: "", holeAspect: ["SLOT", 4, 8], defaultPadShapeAspect: ["RECT", 10, 12, 25], padRule: { connectMode: 1 } },
      { ...pad, globalIndex: "pad-c", net: null, holeAspect: null, defaultPadShapeAspect: ["POLYGON", [0, 0, "L", 2, 4, "ARC", 90, 5, 6]], padRule: null }],
    attribute: [{ parentPrimitiveId: "component-a", attrs: [attribute] }, { parentPrimitiveId: "component-b", attrs: [] }],
    dimension: [{ globalIndex: "dimension-a", locked: false, layerId: 13, dimensionType: "Length Dimension", coordinateSet: [0, 1, 2, 3, 4, 5, 6, 7], unit: "mm", width: 6, precision: 1 },
      { globalIndex: "dimension-b", locked: true, layerId: 3, dimensionType: "Radius Dimension", coordinateSet: [0, 1, 2, 3, 4, 5], unit: "mil", width: 0, precision: 0 },
      { globalIndex: "dimension-c", locked: false, layerId: 4, dimensionType: "Protractor Dimension", coordinateSet: [0, 1, 2, 3, 4, 5], unit: "inch", width: 2.25, precision: 4 }],
    image: [{ globalIndex: "image-a", locked: false, layerId: 1, imageType: "Image", start: { x: 1.23456789, y: 7 }, width: 120, height: 80, rotation: 45, mirror: true },
      { globalIndex: "image-b", locked: true, layerId: 2, imageType: "Picture", start: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0, mirror: false }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={component:0,pad:0,attribute:0,dimension:0,image:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(component|pad|attribute|dimension|image)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209ExtendedPrimitivesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}

void test("209 extended original reader compares five ordered families and preserves complete attribute parent groups", async () => {
  const value = fixture(inputRows(), "", "", "rows.component[1].attrsMap.Name=undefined;rows.pad[2].holeRotation=NaN;");
  const result = await value.run();
  const families = records.parse(result["families"]);
  assert.deepEqual(families.map(entry => entry["family"]), ["Component", "Pad", "Attribute", "Dimension", "Image"]);
  assert.equal(value.childRead("calls"), 14); assert.equal(value.childRead("Object.values(readCounts).every(n=>n===2)"), true);
  const projected = families.map(entry => records.parse(entry["rows"]));
  assert.equal(projected[0]?.[0]?.["x"], 12.3456789); assert.equal(projected[0]?.[0]?.["name"], "={Manufacturer Part}");
  assert.equal(projected[0]?.[0]?.["manufacturer"], ""); assert.equal(projected[1]?.[0]?.["x"], 1.23456789);
  assert.deepEqual(projected[1]?.[0]?.["thermal"], { mode: 0, clearance: 5, spokeWidth: 2.5, angle: 90 });
  assert.deepEqual(projected[1]?.[0]?.["hole"], { shape: "ROUND", diameter: 8.7654, offsetX: -1, offsetY: 2, rotation: 45 });
  assert.deepEqual(projected[1]?.[1]?.["defaultCopperShape"], { shape: "RECT", width: 10, height: 12, cornerRatioPercent: 25 });
  assert.deepEqual(projected[1]?.[2]?.["defaultCopperShape"], { shape: "POLYGON", pathSource: [0, 0, "L", 2, 4, "ARC", 90, 5, 6], coordinateSpace: "native-pad-style" });
  assert.equal(projected[1]?.[2]?.["hole"], null); assert.equal(projected[1]?.[2]?.["net"], null);
  assert.equal(projected[2]?.[0]?.["parentPrimitiveId"], "component-a"); assert.equal(projected[2]?.[0]?.["value"], "Part 一");
  assert.equal(projected[2]?.[0]?.["x"], 20); assert.equal(projected[2]?.[0]?.["rotation"], 90);
  assert.deepEqual(families[2]?.["attributeParentGroups"], [{ parentPrimitiveId: "component-a", ids: ["attribute-a"] }, { parentPrimitiveId: "component-b", ids: [] }]);
  assert.equal(projected[3]?.[0]?.["canvasUnit"], "mm"); assert.equal(projected[3]?.[0]?.["lineWidth"], 6);
  assert.equal(projected[4]?.[1]?.["imageType"], "Picture"); assert.equal(projected[4]?.[1]?.["width"], 0);
  const states = records.parse(result["componentMetadataStates"]);
  assert.deepEqual(states[1]?.["states"], { designator: "absent", name: "undefined", manufacturer: "absent", manufacturerPart: "absent", supplier: "absent", supplierPart: "absent" });
  for (const key of ["startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified", "reciprocalParentVerified",
    "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["componentMetadataStates"]), true);
});

void test("209 extended reader retains empty collections without claiming an empty board", async () => {
  const result = await fixture({ component: [], pad: [], attribute: [], dimension: [], image: [] }).run();
  assert.deepEqual(result["componentMetadataStates"], []);
  assert.equal(result["completeLiveBaselineVerified"], false); assert.equal(result["sourceMembershipVerified"], false);
  const families = records.parse(result["families"]);
  assert.deepEqual(families.map(entry => entry["rows"]), [[], [], [], [], []]); assert.deepEqual(families[2]?.["attributeParentGroups"], []);
});

void test("209 extended reader rechecks original receiver frame and target around all fourteen awaits", async () => {
  for (const mutation of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.frame.contentWindow={};", "globalThis.document={...document};", "Bus.prototype.rpcCall=async()=>({message:[]});",
    "identity.docType=23;", "identity.tabId='other';", "location.href='https://client/other';"]) {
    for (let at = 1; at <= 14; at += 1) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u);
      // Native identity is sampled at each bracket.
      // Frame and receiver ownership are rechecked after every local RPC.
      let expected = at;
      if (mutation.startsWith("identity.") && ![1, 7, 8, 14].includes(at)) { expected = at < 7 ? 7 : 14; }
      assert.equal(value.childRead("calls"), expected);
    }
  }
  for (const before of ["tab.parentLibraryUuid='private';", "attributes.fromFile='true';", "gVars.isHistoryMode=true;",
    "document.querySelectorAll=()=>[frame,frame];", "sealed.unexpected=true;"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 extended snapshots compare metadata presence, all families and retained order", async () => {
  for (const mutation of ["rows.component[0].attrsMap.Name='changed';", "rows.component[1].attrsMap.Name=undefined;",
    "rows.component[0].rotation++;", "rows.pad[0].net='';", "rows.pad[0].holeAspect[1]++;", "rows.pad[2].defaultPadShapeAspect[1][3]++;",
    "rows.pad[0].padRule.lineAngle=0;", "rows.pad[0].pasteExpansion++;", "rows.attribute[0].attrs[0].value='changed';",
    "rows.attribute[0].attrs[0].showKey=true;", "rows.attribute[0].attrs[0].positionIsNull=true;", "rows.attribute[0].attrs[0].silkColor=null;",
    "rows.dimension[0].unit='cm';", "rows.dimension[0].coordinateSet[0]++;", "rows.image[0].width++;", "rows.image[0].mirror=false;",
    "rows.pad.reverse();", "rows.component.reverse();rows.attribute.reverse();", "rows.dimension.reverse();", "rows.image.reverse();"]) {
    await assert.rejects(fixture(inputRows(), `if(calls===8){${mutation}}`).run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u);
  }
});

void test("209 extended groups refuse missing extra reordered duplicate and colliding identities", async () => {
  for (const mutation of ["rows.attribute.pop();", "rows.attribute.push({parentPrimitiveId:'other',attrs:[]});", "rows.attribute.reverse();",
    "rows.attribute[1].parentPrimitiveId='component-a';", "rows.attribute[0].parentPrimitiveId='other';",
    "rows.attribute[0].attrs[0].globalIndex='component-a';", "rows.attribute[0].attrs[0].globalIndex='pad-a';",
    "rows.attribute[1].attrs=[rows.attribute[0].attrs[0]];", "rows.image[0].globalIndex='dimension-a';",
    "rows.component[1].globalIndex='component-a';"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u);
  }
});

void test("209 extended projection refuses unsupported values without coercion or accessor execution", async () => {
  for (const mutation of ["rows.component[0].attrsMap.Name=null;", "rows.component[0].attrsMap.Name=42;", "rows.component[0].layerId=12;",
    "Object.defineProperty(rows.component[0].attrsMap,'Name',{get(){throw new Error('PRIVATE');}});",
    "delete rows.component[0].attrsMap.Name;Object.setPrototypeOf(rows.component[0].attrsMap,{Name:'inherited'});",
    "rows.pad[0].net=undefined;", "rows.pad[0].center.x=-0;", "rows.pad[0].holeAspect=['UNKNOWN',4];", "rows.pad[0].holeAspect=['ROUND',-1];",
    "rows.pad[0].defaultPadShapeAspect=['NGON',10,12];", "rows.pad[2].defaultPadShapeAspect=['POLYGON',[0,0,'ARC',90,1]];",
    "rows.pad[0].padRule={connectMode:3};", "rows.pad[0].expansionType=3;", "rows.pad[0].padTypeAspect=5;",
    "rows.attribute[0].attrs[0].silkColor='';", "delete rows.attribute[0].attrs[0].positionIsNull;",
    "rows.attribute[0].attrs[0].value=String.fromCharCode(0xd800);",
    "rows.dimension[0].coordinateSet.pop();", "rows.dimension[0].precision=5;", "rows.dimension[0].unit='m';", "rows.dimension[0].width=-1;",
    "rows.image[0].width=Infinity;", "rows.image[0].height=-1;", "rows.image[0].imageType='Object';",
    "Object.defineProperty(rows.image[0],'mirror',{get(){throw new Error('PRIVATE');}});",
    "delete rows.pad[1];", "Bus.prototype.rpcCall=async()=>({message:undefined});"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u);
  }
});

void test("209 extended collection polygon UTF16 and aggregate bounds refuse oversized observations", async () => {
  for (const mutation of [
    "rows.pad=Array.from({length:257},(_,i)=>({...rows.pad[0],globalIndex:'pad'+i}));",
    "rows.attribute[0].attrs=Array.from({length:257},(_,i)=>({...rows.attribute[0].attrs[0],globalIndex:'attribute'+i}));",
    "rows.component[0].attrsMap.Name='😀'.repeat(513);",
    "rows.pad[2].defaultPadShapeAspect=['POLYGON',[0,0,'L',...Array(2046).fill(1)]];",
    "rows.attribute[0].attrs=Array.from({length:7},(_,i)=>({...rows.attribute[0].attrs[0],globalIndex:'attribute'+i,value:'x'.repeat(65536)}));"
  ]) { await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u); }
});

void test("209 extended timeout stops subsequent calls and returns no partial collection", async () => {
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_EXTENDED_PRIMITIVES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

void test("209 extended decoder independently rejects target flags group and metadata-state forgeries", async () => {
  const raw = await fixture().raw();
  const packet: unknown = JSON.parse(raw); assert.ok(packet !== null && typeof packet === "object");
  const observations = records.parse(Reflect.get(packet, "observations"));
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_EXTENDED_PRIMITIVES_TARGET/u);
  assert.throws(() => decode(raw.replace('"samples":2', '"samples":1')));
  assert.throws(() => decode(raw.replace('"cadAuthority":false', '"cadAuthority":true')));
  assert.throws(() => decode(raw.replace('"primitiveType":"Pad"', '"primitiveType":"Image"')));
  assert.throws(() => decode(raw.replace('"image-a"', '"pad-a"')), /PCB209_EXTENDED_PRIMITIVES_DUPLICATE/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, observations: observations.toReversed() })), /PCB209_EXTENDED_PRIMITIVES_FAMILY/u);
  assert.throws(() => decode(JSON.stringify({ ...packet, privateExtra: true })));
  assert.throws(() => decode(raw.replace('"name":"present"', '"name":"absent"')), /PCB209_EXTENDED_PRIMITIVES_METADATA_STATE/u);
  assert.throws(() => decode(raw.replace('"parentPrimitiveId":"component-a","ids"', '"parentPrimitiveId":"other","ids"')));
  assert.throws(() => decode(JSON.stringify({ ...packet, componentMetadataStates: [] })), /PCB209_EXTENDED_PRIMITIVES_COMPONENT_ASSOCIATION/u);
});



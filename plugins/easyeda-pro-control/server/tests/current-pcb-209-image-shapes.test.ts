import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_IMAGE_SHAPES_FUNCTION, decodeCurrentPcb209ImageShapesReply, validCurrentPcb209ImagePath } from "../src/current-pcb-209-image-shapes.ts";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const path = String.raw`C:\Reviewed\ImageShapeFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const records = z.array(z.record(z.string(), z.unknown()));
function decode(value: string): unknown { return decodeCurrentPcb209ImageShapesReply({ result: { type: "string", value } }, target); }
function inputRows(): Record<string, Record<string, unknown>[]> {
  return { image: [{ globalIndex: "vector-a", locked: false, layerId: 1, imageType: "Image", start: { x: 1.23456789, y: 7 },
    width: 120, height: 80, rotation: 45, mirror: true, silkColor: "#a.492f",
    pathString: "M -0 -0.00001 L 1 2 3 4 A 5 6 0 0 1 7 8 9 10 0 1 0 11 12  M 0 0 A 4 5 0 1 1 6 7 " },
  { globalIndex: "vector-b", locked: true, layerId: 2, imageType: "Image", start: { x: 0, y: 0 },
    width: 0, height: 0, rotation: 0, mirror: false, silkColor: null, pathString: "" },
  { globalIndex: "picture-a", locked: true, layerId: 2, imageType: "Picture", start: { x: -10, y: 20 },
    width: 3, height: 4, rotation: 90, mirror: false, pathString: "", hashId: "opaque-ref:no-digest-or-path" }] };
}
function fixture(rows = inputRows(), afterCall = "", before = "", childBefore = ""): {
  run: () => Promise<Readonly<Record<string, unknown>>>; raw: () => Promise<string>; childRead: (source: string) => unknown;
} {
  const child = createContext({});
  runInContext(`globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;globalThis.readCounts={image:0};
globalThis.identity={tabId:${JSON.stringify(`${target.documentUuid}@${target.projectUuid}`)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||timeout!==0)throw new Error("PRIVATE_RECEIVER");calls++;await Promise.resolve();
let family=null;if(topic==="getTabIdAndDocType"){if(arg!==undefined)throw new Error("PRIVATE_IDENTITY_ARGS");}else{family=/^pcb\\/extensionAPI\\/(image)-getAll$/.exec(topic)?.[1];if(!family||!arg||Reflect.ownKeys(arg).length!==0)throw new Error("PRIVATE_TOPIC");readCounts[family]++;}
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
    const pending: unknown = runInContext(`(${CURRENT_PCB_209_IMAGE_SHAPES_FUNCTION})(sealed,"observe")`, context, { timeout: 1000 });
    const value: unknown = await pending; assert.ok(typeof value === "string"); return value;
  };
  return { raw, run: async () => decodeCurrentPcb209ImageShapesReply({ result: { type: "string", value: await raw() } }, target),
    childRead: (source): unknown => runInContext(source, child) as unknown };
}


void test("209 Image shapes retains bounded native path bytes and opaque Picture references in six calls", async () => {
  const value = fixture(); const result = await value.run();
  assert.equal(value.childRead("calls"), 6); assert.equal(value.childRead("readCounts.image"), 2);
  const families = records.parse(result["families"]), rows = records.parse(families[0]?.["rows"]), shapes = records.parse(result["imageShapes"]);
  assert.deepEqual(families.map(f => f["family"]), ["Image"]);
  assert.equal(rows[0]?.["x"], 1.23456789); assert.equal(rows[0]?.["horizonMirror"], true); assert.equal(rows[1]?.["width"], 0);
  assert.equal(shapes[0]?.["pathString"], inputRows()["image"]?.[0]?.["pathString"]); assert.equal(shapes[0]?.["silkColor"], "#a.492f");
  assert.equal(shapes[1]?.["pathString"], ""); assert.equal(shapes[1]?.["silkColor"], null);
  assert.deepEqual(shapes[2], { primitiveId: "picture-a", imageType: "Picture", assetReference: "opaque-ref:no-digest-or-path" });
  assert.deepEqual(result["units"], { placementLinear: "mil", rotation: "degrees", vectorPathLinear: "native-distance;10-mil-per-unit", vectorPathYAxis: "inverted-board-y" });
  for (const key of ["startupCompletionVerified", "completeLiveBaselineVerified", "sourceMembershipVerified", "renderedGeometryVerified",
    "assetContentVerified", "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["imageShapes"]), true);
});

void test("209 Image grammar keeps explicit/native repetitions and refuses unreviewed commands or malformed scalars", async () => {
  const accepted = ["", "  ", "M 0 0 L 1 1 ", "M -0 -1e-8 A 2 3 0 0 1 4 5 3 4 0 1 0 6 7 ", "M 0 0 L 2 2 M 4 4 L 5 5", "M 0 0 L 3 4 A 2e-7 3e+2 0 0 1 5 6 "];
  const refused = ["M 0 0", "L 0 0", "M 0 0 M 1 1 L 2 2", "M 0 0 1 1", "M 0 0 L 1", "M 0 0 L 1 2 Z", "M 0 0 Q 1 2 3 4",
    "M 0 0 C 1 2 3 4 5 6", "m 0 0 l 1 2", "M 0,0 L 1 1", "M 0 0 L 0x1 2", "M 0 0 L 1junk 2", "M 0 0 L NaN 2",
    "M 0 0 L Infinity 2", "M 0 0 L 1e999 2", "M 0 0 L 1\n2", "M 0 0 L 1\t2", "M 0 0 L 1 2\n",
    "M 0 0 A 1 2 1 0 1 3 4", "M 0 0 A -1 2 0 0 1 3 4", "M 0 0 A 1 2 0 2 1 3 4", "M 0 0 A 1 2 0 0 1 3", "<svg/>" ];
  for (const source of accepted) {
    assert.equal(validCurrentPcb209ImagePath(source), true, source);
    await fixture(inputRows(), "", "", `rows.image[0].pathString=${JSON.stringify(source)};`).run();
  }
  for (const source of refused) {
    assert.equal(validCurrentPcb209ImagePath(source), false, source);
    await assert.rejects(fixture(inputRows(), "", "", `rows.image[0].pathString=${JSON.stringify(source)};`).run(), /PCB209_IMAGE_SHAPES_REFUSED/u);
  }
});

void test("209 Image shapes rechecks original receiver and context around every await", async () => {
  for (const mutation of ["parent.activeTab='other';", "parent.frame.contentWindow={};", "parent.gVars.currentProject={...parent.gVars.currentProject};",
    "Bus.prototype.rpcCall=async()=>({message:[]});", "identity.docType=23;"]) {
    for (let at = 1; at <= 6; at += 1) {
      const value = fixture(inputRows(), `if(calls===${at}){${mutation}}`);
      await assert.rejects(value.run(), /PCB209_IMAGE_SHAPES_REFUSED/u);
      assert.equal(value.childRead("calls"), mutation.startsWith("identity.") && [2, 5].includes(at) ? at + 1 : at);
    }
  }
  for (const before of ["sealed.extra=true;", "attributes.fromFile='true';", "gVars.isHistoryMode=true;", "tab.parentLibraryUuid='private';"]) {
    const value = fixture(inputRows(), "", before); await assert.rejects(value.run(), /PCB209_IMAGE_SHAPES_REFUSED/u); assert.equal(value.childRead("calls"), 0);
  }
});

void test("209 Image snapshots compare paths references styles rows and ordering without partial results", async () => {
  for (const mutation of ["rows.image[0].pathString='M 1 1 L 2 2 ';", "rows.image[0].silkColor=null;", "rows.image[2].hashId='changed';",
    "rows.image[0].width++;", "rows.image[0].mirror=false;", "[rows.image[0],rows.image[1]]=[rows.image[1],rows.image[0]];"]) {
    await assert.rejects(fixture(inputRows(), `if(calls===4){${mutation}}`).run(), /PCB209_IMAGE_SHAPES_REFUSED/u);
  }
  for (const mutation of ["rows.image[1].globalIndex='vector-a';", "rows.image.reverse();", "rows.image[2].pathString='M 0 0 L 1 1';",
    "rows.image[0].width=Infinity;", "rows.image[0].height=-1;", "rows.image[0].silkColor='';", "rows.image[2].hashId=null;",
    "rows.image[0].imageType='Object';", "rows.image[0].start.x=-0;", "delete rows.image[1];",
    "Object.defineProperty(rows.image[0],'pathString',{get(){globalThis.accessorCalled=true;return '';}});",
    "Object.defineProperty(rows.image[2],'hashId',{get(){globalThis.accessorCalled=true;return '';}});"]) {
    const value = fixture(inputRows(), "", "", mutation); await assert.rejects(value.run(), /PCB209_IMAGE_SHAPES_REFUSED/u);
    assert.notEqual(value.childRead("globalThis.accessorCalled"), true);
  }
});

void test("209 Image shapes refuses per-path row UTF16 and aggregate limits", async () => {
  const longTokens = `M 0 0 L ${"1 2 ".repeat(4095)}`;
  assert.equal(validCurrentPcb209ImagePath(longTokens), false); assert.equal(validCurrentPcb209ImagePath(" ".repeat(65_537)), false);
  for (const mutation of ["rows.image[0].pathString=' '.repeat(65537);", `rows.image[0].pathString=${JSON.stringify(longTokens)};`,
    "rows.image=Array.from({length:257},(_,i)=>({...rows.image[0],globalIndex:'image'+i}));",
    "rows.image[2].hashId='😀'.repeat(513);", "rows.image[2].hashId=String.fromCharCode(0xd800);",
    "rows.image=Array.from({length:8},(_,i)=>({...rows.image[0],globalIndex:'image'+i,pathString:' '.repeat(65536)}));"]) {
    await assert.rejects(fixture(inputRows(), "", "", mutation).run(), /PCB209_IMAGE_SHAPES_REFUSED/u);
  }
});

void test("209 Image decoder independently rejects forged scope IDs types flags paths and target", async () => {
  const raw = await fixture().raw();
  assert.throws(() => decode(raw.replace('"kind":', '"kind":"duplicate","kind":')));
  assert.throws(() => decode(raw.replaceAll(target.projectUuid, "a".repeat(64))), /PCB209_IMAGE_SHAPES_TARGET/u);
  assert.throws(() => decode(raw.replace('"samples":2', '"samples":1')));
  assert.throws(() => decode(raw.replace('"cadAuthority":false', '"cadAuthority":true')));
  const packet = z.record(z.string(), z.unknown()).parse(JSON.parse(raw));
  const shapes = records.parse(packet["imageShapes"]);
  for (const changed of [shapes.toReversed(), shapes.slice(1), [...shapes, shapes[0]], [{ ...shapes[0], primitiveId: "other" }, ...shapes.slice(1)],
    [{ ...shapes[0], pathString: "M 0 0 L NaN 1" }, ...shapes.slice(1)], [{ ...shapes[0], assetReference: "extra" }, ...shapes.slice(1)]]) {
    assert.throws(() => decode(JSON.stringify({ ...packet, imageShapes: changed })));
  }
  assert.throws(() => decode(JSON.stringify({ ...packet, imageShapes: [{ ...shapes[0], silkColor: "😀".repeat(65) }, ...shapes.slice(1)] })));
  assert.throws(() => decode(JSON.stringify({ ...packet, imageShapes: [...shapes.slice(0, 2), { ...shapes[2], assetReference: "😀".repeat(513) }] })));
  assert.throws(() => decode(JSON.stringify({ ...packet, unexpected: true })));
});

void test("209 Image empty collection and empty opaque reference stay observations; deadline prevents follow-up", async () => {
  const empty = await fixture({ image: [] }).run(); assert.deepEqual(empty["imageShapes"], []); assert.equal(empty["sourceMembershipVerified"], false);
  const emptyReference = await fixture(inputRows(), "", "", "rows.image[2].hashId='';").run();
  assert.equal(records.parse(emptyReference["imageShapes"])[2]?.["assetReference"], "");
  const value = fixture(inputRows(), "", "globalThis.setTimeout=fn=>{queueMicrotask(fn);return 17;};globalThis.clearTimeout=()=>{};");
  await assert.rejects(value.run(), /PCB209_IMAGE_SHAPES_REFUSED/u); assert.ok(Number(value.childRead("calls")) <= 1);
});

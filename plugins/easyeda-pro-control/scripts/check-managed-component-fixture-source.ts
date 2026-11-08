/** Exact pinned codec/decoder/cache syntax on inert data; no app, actual
 * library cache, model constructor, native owner or file import is invoked. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { canonicalJson } from "../server/src/core.ts";
import { MANAGED_COMPONENT_FIXTURE_ATTRIBUTE_FIELDS, MANAGED_COMPONENT_FIXTURE_BODY, MANAGED_COMPONENT_FIXTURE_FIELDS, MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META,
  MANAGED_COMPONENT_FIXTURE_PROFILE, managedComponentFixtureHiddenAttribute } from "../server/src/managed-component-fixture-generator.ts";

async function main(): Promise<void> {
  const assets = process.argv[2] ?? process.env["EASYEDA_ASSETS_ROOT"], methods: Record<string, string> = {};
  if (assets === undefined || assets === "") { throw new Error("EASYEDA_ASSETS_ROOT_REQUIRED"); }
  for (const profile of MANAGED_COMPONENT_FIXTURE_PROFILE.files) {
    const bytes: Buffer = await readFile(join(assets, profile.relativePath)); assert.equal(bytes.length, profile.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.sha256);
    const source: string = bytes.toString("utf8"); for (const span of profile.methods) { const text = source.slice(span.start, span.end); assert.equal(createHash("sha256").update(text).digest("hex"), span.sha256); methods[span.name] = text; }
  }
  const columns: unknown = runInNewContext(`const m={${methods["Jg.getCOMPONENT"]},${methods["Jg.getATTR"]}};({component:m.getCOMPONENT("2.0"),attr:m.getATTR("2.0")});`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(columns), canonicalJson({ component: MANAGED_COMPONENT_FIXTURE_FIELDS, attr: MANAGED_COMPONENT_FIXTURE_ATTRIBUTE_FIELDS }));
  const id = "1".repeat(16); const footprintUuid = "2".repeat(32); const attr = managedComponentFixtureHiddenAttribute(id, "Footprint", footprintUuid);
  const component: unknown = runInNewContext(`const m={${methods["uF.feed"]},${methods["uF.check"]},${methods["uF.canBuild"]},${methods["uF.getFootprint"]},${methods["uF.filterAttr"]}};
class E{static ORIGIN={x:0,y:0};constructor(x,y){this.x=x;this.y=y;}}const Xa=value=>value===0||value==="0"?null:value==null?null:String(value),cache={uuid:${JSON.stringify(footprintUuid)}};let lookups=0;const Li={getInstance:()=>({getItem:uuid=>{lookups++;if(uuid!==cache.uuid)throw Error("unbounded footprint");return cache;}})},rh={getInstance:()=>({getItem:()=>{throw Error("device not supplied");}})};
const receiver={isNumber:value=>typeof value==="number"&&!Number.isNaN(value),attrs:[{key:"Footprint",value:cache.uuid,ticket:3}]};m.feed.call(receiver,{id:${JSON.stringify(id)},...${JSON.stringify(MANAGED_COMPONENT_FIXTURE_BODY)}});const checked=m.check.call(receiver),canBuild=m.canBuild.call(receiver);m.filterAttr.call(receiver);const selected=m.getFootprint.call(receiver);({checked,canBuild,lookups,selected:selected===cache,groupId:receiver.groupId,layer:receiver.layerId,position:receiver.position,rotation:receiver.rotation,locked:receiver.locked});`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(component), canonicalJson({ checked: true, canBuild: true, lookups: 1, selected: true, groupId: null, layer: 1, position: { x: 0, y: 0 }, rotation: 0, locked: false }));
  const decodedAttribute: unknown = runInNewContext(`let Tl;${methods["Tl.enum"]};const m={${methods["sb.feed"]},${methods["sb.check"]},${methods["Q8.getAlign"]}},Xa=value=>value===0||value==="0"?null:value==null?null:String(value),receiver={isNumber:value=>typeof value==="number"&&!Number.isNaN(value),getAlign:m.getAlign};m.feed.call(receiver,{id:"attribute-id",...${JSON.stringify(attr)}});const checked=m.check.call(receiver);({checked,key:receiver.key,value:receiver.value,groupId:receiver.groupId,parentIndex:receiver.parentIndex,layerId:receiver.layerId,origin:receiver.origin,fontSize:receiver.fontSize,strokeWidth:receiver.strokeWidth,positionIsNull:receiver.positionIsNull,showKey:receiver.showKey,showValue:receiver.showValue});`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(decodedAttribute), canonicalJson({ checked: true, key: "Footprint", value: footprintUuid, groupId: null, parentIndex: id, layerId: 3, origin: 3, fontSize: 5, strokeWidth: 0.8, positionIsNull: true, showKey: false, showValue: false }));
  const explicit: unknown = runInNewContext(`const m={${methods["lC.attrHandle"]}},sb=function(){throw Error("unexpected generated attribute");},$j=()=>{throw Error("unexpected generated attribute data");};const attrs=[{index:"explicit-footprint",key:"Footprint",value:"old-title"},{index:"explicit-designator",key:"Designator",value:"U?"}],data={attr:attrs,ids:new Set(["explicit-footprint","explicit-designator"]),canvas:[]},cache={_id:${JSON.stringify(MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META.title)},attrDataMap:new Map()};m.attrHandle.call(cache,data);({attrs,keys:[...cache.attrDataMap.keys()],idsReleased:data.ids===null});`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(explicit), canonicalJson({ attrs: [{ index: "explicit-footprint", key: "Footprint", value: MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META.title }, { index: "explicit-designator", key: "Designator", value: "U?" }], keys: ["Footprint", "Designator"], idsReleased: true }));
  assert.equal(attr["x"], null); assert.equal(attr["y"], null); assert.equal(attr["keyVisible"], false); assert.equal(attr["valueVisible"], false);
  process.stdout.write(`${JSON.stringify({ ok: true, sourceFiles: 2, sourceMethods: MANAGED_COMPONENT_FIXTURE_PROFILE.files.reduce((sum, profile) => sum + profile.methods.length, 0),
    fixedCodecCases: 2, inertComponentDecoderCases: 1, inertHiddenAttributeDecoderCases: 1, explicitAttributeCacheCases: 1, originalNativeCacheQualified: false, nativeImportabilityVerified: false, executionAuthorized: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- The offline checker awaits its bounded installed-source and inert-data checks.
await main();

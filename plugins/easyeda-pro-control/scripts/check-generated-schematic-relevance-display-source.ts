/** Execute only pinned pure serializer/sort syntax on inert data. No app,
 * model constructor, native owner, SDK action or worker is allocated. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { canonicalJson } from "../server/src/core.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE, prepareGeneratedSchematicRelevanceDisplayBodyPlan, projectGeneratedSchematicRelevanceNativeAttributeBody } from "../server/src/generated-schematic-relevance-display-source.ts";
import { MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE } from "../server/src/managed-schematic-relevance-fixture-generator.ts";

async function main(): Promise<void> {
const assets = process.argv[2] ?? process.env["EASYEDA_ASSETS_ROOT"];
if (assets === undefined || assets === "") { throw new Error("EASYEDA_ASSETS_ROOT_REQUIRED"); }
for (const profile of GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE.files) {
  const bytes: Buffer = await readFile(join(assets, profile.relativePath)); assert.equal(bytes.length, profile.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.sha256);
  const source: string = bytes.toString("utf8"); const methods: Record<string, string> = {};
  for (const [role, span] of Object.entries(profile.methods)) { const text = source.slice(span.start, span.end); assert.equal(createHash("sha256").update(text).digest("hex"), span.sha256); methods[role] = text; }
  const fixture = { ...MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, parentId: `0${"1".repeat(15)}` };
  // The stored child index is not its global normalized native model index.
  // Test the serializer with the exact native projection required by this profile.
  const nativeFixture = projectGeneratedSchematicRelevanceNativeAttributeBody(fixture, fixture.parentId);
  const result: unknown = runInNewContext(`const input=${JSON.stringify(nativeFixture)},Di=()=>false,Ni=()=>false;
const methods={${methods["attr"]},${methods["attrValue"]},${methods["blockValue"]},${methods["common"]}};
const receiver={_x:input.x,_y:input.y,_rotation:input.rotation,_color:input.color,_fontFamily:input.fontFamily,_fontSize:input.fontSize,_fontWeight:input.fontWeight,_italic:input.italic,_underline:input.underline,_strikeout:input.strikeout,_blockValue:input.value,_blockKeyVisible:input.keyVisible,_blockValueVisible:input.valueVisible,key:input.key,zIndex:input.zIndex,locked:input.locked,parent:{id:input.parentId},_parent:{id:input.parentId},shapeManager:{isSymbolShapeManager:()=>false},docManager:{isSchSheetDoc:()=>true},getAlignConsistencyValue:()=>input.align,getUploadValue:methods.getUploadValue,setCommonPropsForConsistencyManager:methods.setCommonPropsForConsistencyManager};
Object.defineProperty(receiver,"blockValue",Object.getOwnPropertyDescriptor(methods,"blockValue"));JSON.parse(JSON.stringify(methods.getConsistencyData.call(receiver)));`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(result), canonicalJson(projectGeneratedSchematicRelevanceNativeAttributeBody(fixture, fixture.parentId)));
  for (const order of [["text", "wire", "bus"], ["bus", "text", "wire"]]) {
    const sorted: unknown = runInNewContext(`const methods={${methods["sort"]},${methods["recalculate"]},${methods["childIndex"]},${methods["indexSetter"]}};
const records=[],parent={children:[],invalidZIndexChildMap:new Map(),minChildZIndex:Infinity,maxChildZIndex:-Infinity,recalculateChildrenZIndex:methods.recalculateChildrenZIndex,onChildZIndexChange:methods.onChildZIndexChange},shapeManager={actionRunner:{currentAction:null},modifyMonitor:{record:r=>records.push({attr:r.attr,oldValue:r.oldValue,newValue:r.newValue,notAddHistory:r.notAddHistory})}};
for(const id of ${JSON.stringify(order)}){const model={id,_zIndex:null,_parent:parent,shapeManager};Object.defineProperty(model,"zIndex",{get(){return this._zIndex;},set:Object.getOwnPropertyDescriptor(methods,"zIndex").set});parent.children.push(model);parent.invalidZIndexChildMap.set(model,1);}methods.trySortChildrenByZIndex.call(parent);({indices:parent.children.map(m=>({id:m.id,zIndex:m.zIndex})),records,invalid:parent.invalidZIndexChildMap.size,changed:parent._childZIndexChange===undefined});`, {}, { timeout: 1000 });
    assert.equal(canonicalJson(sorted), canonicalJson({ indices: order.map((id, zIndex) => ({ id, zIndex })), records: order.map((_, newValue) => ({ attr: "zIndex", oldValue: null, newValue, notAddHistory: true })), invalid: 0, changed: true }));
  }
  const childOrder: unknown = runInNewContext(`const methods={${methods["sort"]},${methods["recalculate"]}};const line={id:"line",zIndex:null},attr={id:"attr",zIndex:1},parent={children:[attr,line],invalidZIndexChildMap:new Map([[line,1]]),minChildZIndex:1,maxChildZIndex:1,recalculateChildrenZIndex:methods.recalculateChildrenZIndex};methods.trySortChildrenByZIndex.call(parent).map(m=>({id:m.id,zIndex:m.zIndex}));`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(childOrder), canonicalJson([{ id: "line", zIndex: 0 }, { id: "attr", zIndex: 1 }]));
  const encoderOwner = methods["source"]?.match(/let t=([A-Za-z_$][\w$]*)\.useEncoder/u)?.[1]; assert.ok(encoderOwner !== undefined);
  const encoded: unknown = runInNewContext(`const calls=[],encoder={uploadCanvas:value=>calls.push({canvas:value}),getDataStr:()=>"native-encoded",removeDataStr:()=>calls.push({removed:true})},${encoderOwner}={useEncoder:()=>encoder},methods={${methods["source"]}};const models=new Map([["text",{uploadTo:target=>{if(target!==encoder)throw Error("encoder");calls.push({model:"text"});}}],["attribute",{uploadTo:target=>{if(target!==encoder)throw Error("encoder");calls.push({model:"attribute"});}}]]);const value=methods.getSourceCode.call({docManager:{origin:{x:0,y:0},idManager:{idMap:models}},sourceCodeIdMap:new Map([["attribute",1],["text",1]])});({value,calls});`, {}, { timeout: 1000 });
  assert.equal(canonicalJson(encoded), canonicalJson({ value: "native-encoded", calls: [{ canvas: { originX: 0, originY: 0 } }, { model: "attribute" }, { model: "text" }, { removed: true }] }));
  const text = prepareGeneratedSchematicRelevanceDisplayBodyPlan({ x: 20 }); assert.equal(Object.hasOwn(text.nativeBeforeBody, "zIndex"), false); assert.equal(Object.hasOwn(text.nativeAfterBody, "zIndex"), false);
}
process.stdout.write(`${JSON.stringify({ ok: true, sourceFiles: 2, pinnedMethods: 34, inertAttributeSerializerCases: 2, inertRootPermutationCases: 4, inertChildSortCases: 2, inertSourceReencodingCases: 2,
  sourceSyntaxAndDataOnly: true, originalNativeExecutionObserved: false, pendingHistoryAbsenceVerified: false, writerAuthority: false })}\n`);

}
// oxlint-disable-next-line node/no-top-level-await -- The offline CLI awaits its own bounded source and inert-data checks.
await main();

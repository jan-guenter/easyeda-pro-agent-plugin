/** Pure pinned construction/parent-replacement fragments on an inert local
 * model graph. Monitors/history are explicit no-ops, not native authority. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE } from "../server/src/managed-schematic-relevance-fixture-generator.ts";

async function main(): Promise<void> {
  const assets = process.argv[2]; if (process.argv.length !== 3 || assets === undefined) { throw new Error("Expected exact installed assets directory"); }
  const profile = MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE; let source = "";
  for (const native of profile.native) { const nativeText: string = await readFile(join(assets, native.relativePath), "utf8");
    assert.equal(Buffer.byteLength(nativeText), native.bytes); assert.equal(createHash("sha256").update(nativeText).digest("hex"), native.sha256);
    for (const method of native.methods) { assert.equal(createHash("sha256").update(nativeText.slice(method.start, method.end)).digest("hex"), method.sha256); }
    if (native.relativePath.endsWith("sch-main.js")) { source = nativeText; }
  }
  const manager = await readFile(join(assets, profile.base.source.relativePath), "utf8");
  assert.equal(Buffer.byteLength(manager), profile.base.source.bytes); assert.equal(createHash("sha256").update(manager).digest("hex"), profile.base.source.sha256);
  for (const method of profile.managerMethods) { assert.equal(createHash("sha256").update(manager.slice(method.start, method.end)).digest("hex"), method.sha256); }
  const native = profile.native.find(value => value.relativePath.endsWith("sch-main.js")); assert.ok(native !== undefined);
  const text = (name: string): string => { const method = native.methods.find(value => value.name === name); if (method === undefined) { throw new Error(`Missing native Relevance source ${name}`); } return source.slice(method.start, method.end); };
  const methods = (owner: string, names: readonly string[]): string => names.map(name => text(`${owner}.${name}`)).join("\n");
  const code = `"use strict";const uc={isConstructFromShapeManager:true};${["jr", "vr", "Sn", "rm"].map(name => text(`predicate.${name}`)).join("\n")}
    const Model=class{${methods("Model", ["constructor", "get:parent", "set:parent", "get:visible", "remove", "onConnectedChange", "onParentChange"])}};
    const Container=class extends Model{${methods("Container", ["constructor", "appendChild", "handleInsertChild", "handleRemoveChild", "onChildZIndexChange"])}};
    const NetGroup=class extends Container{${methods("NetGroup", ["constructor", "get:isWire", "onChildChange"])}};
    const results=[];for(const connected of[false,true]){let count=0;const index=new Map,noop=()=>{},shapes={docManager:{idManager:index},lastOperateTypeManager:new Map,
      modifyMonitor:{onConnectedChange:noop},selectManager:{onConnectedChange:noop},highlightManager:{onConnectedChange:noop},bboxMonitor:{onConnectedChange:noop},historyRecorder:{onSubTreeInsertConnectedChild:noop,onSubTreeRemoveConnectedChild:noop}};
      shapes.attr=data=>Object.assign(new Model(shapes,{id:data.id||'default-'+(++count)}),{modelType:'Attr',...data});
      const group=new NetGroup(shapes,{id:'wire',type:'wire'}),old=group.children[0];group.isConnected=connected;if(connected)old.onConnectedChange(true,false);
      const explicit=shapes.attr({id:'source-relevance',key:'Relevance',value:'[]'});explicit.zIndex=1;explicit.parent=group;
      const bus=new NetGroup(shapes,{id:'bus',type:'bus'});
      results.push({defaultCount:count,wireChildren:group.children.map(value=>value.id),wireAttr:group._customAttrMap.get('Relevance').id,oldDetached:old.parent===null,
        oldIndexAbsent:!index.has(old.id),index:[...index.keys()],busChildren:bus.children.length,busAttrs:bus._customAttrMap.size});}JSON.stringify(results);`;
  const raw: unknown = runInNewContext(code, {}, { timeout: 1000 });
  assert.equal(raw, JSON.stringify([false, true].map(connected => ({ defaultCount: 1, wireChildren: ["source-relevance"], wireAttr: "source-relevance", oldDetached: true,
    oldIndexAbsent: true, index: connected ? ["source-relevance"] : [], busChildren: 0, busAttrs: 0 }))));
  const attrMethod = profile.managerMethods.find(value => value.name === "vF.onAttr"), encodeMethod = profile.managerMethods.find(value => value.name === "DF.encodeAttr"); assert.ok(attrMethod !== undefined && encodeMethod !== undefined);
  const serialization = `const Me=value=>value,rs=value=>value===0?0:-value;const encoder={${manager.slice(encodeMethod.start, encodeMethod.end)}};
    const reader={encode:encoder,getZIndex(){return 1},handleData(value){this.value=value},${manager.slice(attrMethod.start, attrMethod.end)}};
    reader.onAttr('0a00000000000001','',0,false,'0b00000000000001','Relevance','[]',false,false,0,0,0,'#000000',null,'Arial',20,false,false,false,false,'LEFT_TOP');reader.value;`;
  const encoded: unknown = runInNewContext(serialization, {}, { timeout: 1000 }); assert.ok(encoded !== null && typeof encoded === "object" && "data" in encoded && typeof encoded.data === "string");
  const { groupId, locked, zIndex, ...rest } = MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE;
  assert.equal(encoded.data, JSON.stringify({ groupId, locked, zIndex, parentId: "0b00000000000001", ...rest }));
  process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.schematic-relevance-fixture-source-check.v1", fullSourcesAndSpansMatched: true,
    actualWireDefaultAndSameKeyReplacementCases: 2, actualBusDefaultCount: 0, actualManagerAttributeSerializationMatched: true,
    originalNativeOwnerIssued: false, nativeImportExecuted: false, connectedAcceptance: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Explicit bounded offline source-check CLI.
await main();

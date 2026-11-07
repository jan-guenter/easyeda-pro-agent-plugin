/** Offline source/function metadata and finite template/hidden-ATTR checks.
 * Pinned classes run only with inert geometry dependencies. No application,
 * native cache, worker, library factory or MCP connection is started. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { join } from "node:path";
import { runInNewContext, runInThisContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES, CURRENT_PCB_209_COMPONENT_POINT_ATTRIBUTE_PROFILES, deriveCurrentPcb209ComponentCompletePointBudget } from "../server/src/current-pcb-209-component-point-complete-source-profile.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION } from "../server/src/current-pcb-209-component-point-read-program.ts";
import { CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE } from "../server/src/current-pcb-209-spatial-source-profile.ts";

const valueSchema = z.object({ value: z.unknown().optional() });
const propertySchema = z.object({ name: z.string(), value: valueSchema.optional() });
const internalSchema = z.object({ name: z.string(), value: valueSchema });
const metadataSchema = z.object({ result: z.array(propertySchema), internalProperties: z.array(internalSchema) });

function checkTemplateConstructor(methods: ReadonlyMap<string, string>): void {
  const definitions = ["D0", "n3", "cP", "ki", "et", "tE", "rE", "lC"].map(name => {
    const text = methods.get(`${name}.class`); assert.ok(text !== undefined); return `const ${name}=${text};`;
  }).join("\n");
  // Only bbox/expansion/profiler dependencies are inert. The constructor,
  // Setters, bit operations, updateBBox, clone2Template and rE are actual source.
  const result: unknown = runInNewContext(`let boxCalls=0;
const Fr=360,ln={notnull(x){if(x==null)throw Error("missing");},mustnull(x){if(x!=null)throw Error("present");}},qo=()=>{};
const ed={getPadExpansion(c,p,t,b){return{expansionType:c,pasteExpansion:p,topSolderExpansion:t,bottomSolderExpansion:b};}};
const box=()=>({left:-10,right:10,bottom:-10,top:10,transform4(){return box();}}),l3=()=>{boxCalls++;return box();};
const E={ORIGIN:{x:0,y:0,bbox:box}},Bi=class{},Ae={translate(){return{};}},T6={isRender4GPU:true};
const xe=class{ext1(){}valid(){return true;}build(){return box();}};
${definitions}
const pad=new tE("pad",1,1,"1",{x:0,y:0},0,false,"",1,0,0,0,[],false,{type:"ELLIPSE",width:20,height:20},null,null,null);
const constructed=pad._dataState;
const footprint=Object.assign(Object.create(lC.prototype),{items:new Map([["pad",pad]]),_origin:{x:0,y:0}});
footprint.updateBBox();const bounded=pad._dataState,placed=footprint.clone2Template(pad);
const ownBox=pad.bbox;
JSON.stringify({constructed,bounded,afterClone:pad._dataState,indexed:placed._dataState,refresh:pad.refreshBBox,isEmpty:pad.isEmpty,
sameSource:placed._model===pad,sameBox:placed._bbox===ownBox,boxCalls,parentAbsent:pad._parent===undefined,watcherAbsent:pad._stateWatcher===undefined});`, {}, { timeout: 1000 });
  assert.equal(result, JSON.stringify({ constructed: 5202, bounded: 5202, afterClone: 5202, indexed: 0, refresh: true, isEmpty: false,
    sameSource: true, sameBox: true, boxCalls: 3, parentAbsent: true, watcherAbsent: true }));
}
async function main(): Promise<void> {
  const root = process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
  const bytes = await readFile(join(root, CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.relativePath));
  assert.equal(bytes.length, CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.sha256);
  const source = bytes.toString("utf8"); const methods = new Map<string, string>();
  for (const profile of CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES) {
    const text = source.slice(profile.sourceStart, profile.sourceEnd); assert.equal(Buffer.byteLength(text), profile.sourceBytes); assert.equal(createHash("sha256").update(text).digest("hex"), profile.sourceSha256); methods.set(profile.key, text);
  }
  assert.equal(methods.size, 290); assert.equal(CURRENT_PCB_209_COMPONENT_POINT_ATTRIBUTE_PROFILES.length, 11);
  checkTemplateConstructor(methods);
  assert.equal(deriveCurrentPcb209ComponentCompletePointBudget(1).fullWorkflow, 404); assert.equal(deriveCurrentPcb209ComponentCompletePointBudget(16).fullWorkflow, 419);
  assert.throws(() => deriveCurrentPcb209ComponentCompletePointBudget(17));
  const envelope = { id: 419, sessionId: "s".repeat(128), method: "Runtime.callFunctionOn", params: { objectId: "o".repeat(256),
    functionDeclaration: CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION, objectGroup: "easyeda-pro-control-pcb209-component-spatial-v1",
    throwOnSideEffect: false, silent: true, awaitPromise: false, userGesture: false, generatePreview: false, returnByValue: true,
    arguments: [{ value: { kind: "point", xMil: -10_000_000, yMil: -10_000_000 } }] } };
  // IEEE754 binary64 round-trip text needs at most32 ASCII bytes. Substitute
  // Use that conservative bound for both sample coordinates without changing IDs.
  const maximumFrameBytes = Buffer.byteLength(JSON.stringify(envelope)) + 2 * (32 - String(-10_000_000).length);
  assert.ok(maximumFrameBytes <= 65_536); assert.equal(Buffer.byteLength(CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION), CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION.length);
  const session = new Session(); session.connect();
  try {
    for (const profile of CURRENT_PCB_209_COMPONENT_POINT_ATTRIBUTE_PROFILES) {
      const text = methods.get(profile.key); assert.ok(text !== undefined);
      const inferredName = JSON.stringify(profile.name);
      const prefix = profile.kind === "class" ? `globalThis.__componentPointMeta=(function(ki,Bi,rd,yr){return ({[${inferredName}]:` : 'globalThis.__componentPointMeta=({';
      const suffix = profile.kind === "class" ? `})[${inferredName}];})(class{},class{},class{},class{});` : '});';
      const compiled = prefix + text + suffix; runInThisContext(compiled, { filename: "inert-component-point-metadata.js" });
      const property = profile.key.slice(profile.key.indexOf(".") + 1).replace(/^get:/u, "");
      const expression = profile.kind === "class" ? "globalThis.__componentPointMeta" : `Object.getOwnPropertyDescriptor(globalThis.__componentPointMeta,${JSON.stringify(property)}).${profile.kind === "getter" ? "get" : "value"}`;
      const remote = z.object({ result: z.object({ objectId: z.string(), description: z.string() }) }).parse(await session.post("Runtime.evaluate", { expression, objectGroup: "inert-component-point-source" }));
      assert.equal(remote.result.description, text); const metadata = metadataSchema.parse(await session.post("Runtime.getProperties", { objectId: remote.result.objectId, ownProperties: true }));
      assert.equal(metadata.result.find(row => row.name === "name")?.value?.value, profile.name); assert.equal(metadata.result.find(row => row.name === "length")?.value?.value, profile.parameterCount);
      const point = z.object({ lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(metadata.internalProperties.find(row => row.name === "[[FunctionLocation]]")?.value.value);
      const lines = compiled.split("\n"); const offset = lines.slice(0, point.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + point.columnNumber - prefix.length;
      const original = source.slice(0, profile.sourceStart + offset).split("\n"); assert.equal(original.length - 1, profile.lineNumber); assert.equal(original.at(-1)?.length, profile.columnNumber);
    }
  } finally {
    Reflect.deleteProperty(globalThis, "__componentPointMeta"); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-component-point-source" }); session.disconnect();
  }
  const data: unknown = runInNewContext(`const modelMethods={${methods.get("rd.get:key")},${methods.get("rd.inShape")},${methods.get("rd.get:show")},${methods.get("rd.get:showKey")},${methods.get("rd.get:showValue")}},viewMethods={${methods.get("yr.get:key")},${methods.get("yr.isSelect")}};
const results=[];for(const key of ["Footprint","Designator"]){const model={_key:key,base:{showKey:false,showValue:false},_box:null};for(const name of ["key","show","showKey","showValue"])Object.defineProperty(model,name,Object.getOwnPropertyDescriptor(modelMethods,name));model.inShape=modelMethods.inShape;const view={model,textChange:false,getParent(){throw Error("unexpected parent call");},updateCurrentBox(){throw Error("unexpected graphics/cache refresh");}};Object.defineProperty(view,"key",Object.getOwnPropertyDescriptor(viewMethods,"key"));results.push(viewMethods.isSelect.call(view,0,0),viewMethods.isSelect.call(view,5,5));}results;`, {}, { timeout: 1000 });
  assert.equal(JSON.stringify(data), "[false,false,false,false]");
  process.stdout.write(`${JSON.stringify({ ok: true, fullScriptQualified: true, calleeSpans: 290, additionalHiddenAttributeSpans: 11, inertNodeMetadataCases: 11,
    hiddenAttributeFastRefusals: 4, templateConstructorBitmap: 5202, templateBBoxAndClonePreserveBitmap: true, indexedCloneBitmap: 0,
    fullWorkflowRequests: 419, normalRequests: 418, releaseReserve: 1, maximumFrameBytes, nativeChromeProvenanceVerified: false, executionAuthorized: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- The offline checker awaits only its own source and inert inspector metadata checks.
await main();

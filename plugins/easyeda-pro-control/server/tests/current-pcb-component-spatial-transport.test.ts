import { expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { queryOfflineApi } from "../src/offline-api.ts";
import { diagnosticRecord } from "../src/current-pcb-diagnostic-protocol.ts";
/* oxlint-disable import/max-dependencies -- Check distinct purpose, real stream sequence, strict native codec and unchanged older cap together. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { CurrentPcbComponentSpatialPipe, CurrentPcbSpatialPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { componentSpatialDiagnosticNativeRequest, currentPcbComponentSpatialWire } from "../src/current-pcb-component-spatial-protocol.ts";
import { currentPcbSpatialWire } from "../src/current-pcb-spatial-protocol.ts";
import { CURRENT_PCB_SPATIAL_PROFILE } from "../src/current-pcb-spatial-profile.ts";
import { CURRENT_PCB_COMPONENT_SPATIAL_PROFILE, CURRENT_PCB_COMPONENT_SPATIAL_REQUEST_DERIVATION } from "../src/current-pcb-component-spatial-profile.ts";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP } from "../src/current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION } from "../src/current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION } from "../src/current-pcb-209-component-point-read-program.ts";
import { currentPcbComponentSpatialRequestSchema } from "../src/current-pcb-component-spatial-validation.ts";
import { applyCurrentPcbComponentSpatialNativeFragment } from "../src/current-pcb-component-spatial-native-fragment.ts";

import {CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION as CLONED_BINDINGS,CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION as CLONED_READ} from "../src/current-pcb-209-component-cloned-point-read.ts";

const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
const scene = { schema: "private.pcb209-generated-component-scene.v1", projectUuid: "a".repeat(64), documentUuid: "b".repeat(32), footprintUuid: "c".repeat(32), componentId: "d".repeat(16), padId: "e".repeat(16), ownedPadId: "d".repeat(16)+"e".repeat(16), footprintAttrId: "1".repeat(16), designatorAttrId: "2".repeat(16), placedFootprintAttrId: "3".repeat(16), placedDesignatorAttrId: "4".repeat(16) } as const;
const wrapper = { spatialPhase: "wrapper", method: "Runtime.evaluate", params: { ...effects, expression: CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, uniqueContextId: "context", objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } } as const;
const binding = { spatialPhase: "bindings-component", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false, objectId: "scope", functionDeclaration: CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false, arguments: [{ objectId: "wrapper" }, { value: scene }] } } as const;
const read = { spatialPhase: "read-component", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false, objectId: "bundle", functionDeclaration: CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: true, arguments: [{ value: { kind: "point", xMil: 0.1, yMil: -0.25 } }] } } as const;
const release = { spatialPhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP } } as const;
function bytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
void test("Component419 codec preserves exact scene/points, rejects old variants/caller code and reserves final cleanup", () => {
  const discovery = queryOfflineApi({ action: "pcb209-component-spatial" }); assert.match(JSON.stringify(discovery.result), /"wrapperAction":"component-spatial"/u);
  assert.match(JSON.stringify(queryOfflineApi({ action: "pcb209-component-spatial-validate", query: { request: { action: "launch", operationId: "pcb209-spatial-component-new", confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true } } }).result), /"valid":true/u);
  assert.equal(CURRENT_PCB_COMPONENT_SPATIAL_REQUEST_DERIVATION.fullWorkflow, 419); assert.equal(CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit, 418); assert.equal(CURRENT_PCB_SPATIAL_PROFILE.requestLimit, 384);
  const fixed = currentPcbComponentSpatialWire(binding, 418, "s"); const native = componentSpatialDiagnosticNativeRequest(bytes(fixed.command));
  assert.equal(native["action"], "component-spatial419"); assert.equal(native["ownedPadId"], scene.ownedPadId);
  assert.throws(() => currentPcbSpatialWire(binding, 1, "s")); assert.throws(() => currentPcbComponentSpatialWire({ ...binding, params: { ...binding.params, arguments: [{ objectId: "wrapper" }] } }, 1, "s"));
  assert.throws(() => currentPcbComponentSpatialWire({ ...read, params: { ...read.params, arguments: [{ value: { kind: "region", mode: "inside", leftMil: -1, rightMil: 1, bottomMil: -1, topMil: 1 } }] } }, 1, "s"));
  assert.throws(() => currentPcbComponentSpatialWire(read, 419, "s")); assert.doesNotThrow(() => currentPcbComponentSpatialWire(release, 419, "s"));
  const id = "pcb209-spatial-component-case"; const bound = { operationId: id, expectedBindingSha256: "a".repeat(64) };
  assert.equal(currentPcbComponentSpatialRequestSchema.safeParse({ action: "observe-components", ...bound, queries: [read.params.arguments[0].value], acceptNativeScratchEffects: true }).success, true);
  for (const action of ["open-project", "observe-spatial", "observe-spatial-pads", "capture-generated-closed"]) { assert.equal(currentPcbComponentSpatialRequestSchema.safeParse({ action, ...bound }).success, false); }
});
void test("original Component pipe consumes one16-point stream, preserves strict old purpose and releases once", async context => {
  const input = new PassThrough(), output = new PassThrough(); let sent = 0;
  output.on("data", (chunk: Buffer): void => { const command: unknown = JSON.parse(chunk.subarray(0, -1).toString()); assert.ok(diagnosticRecord(command));
    sent += 1; let result: Record<string, unknown> = {}; if (command["method"] === "Target.attachToTarget") { result = { sessionId: "s" }; } else if (command["method"] === "Debugger.getScriptSource") { result = { scriptSource: "synthetic" }; }
    input.write(bytes({ id: command["id"], result, ...(command["sessionId"] === undefined ? {} : { sessionId: command["sessionId"] }) })); });
  const pipe = new CurrentPcbComponentSpatialPipe(input, output);
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  pipe.start(); pipe.assertSpatialCapacity(); await pipe.attachTarget("original", () => assert.fail("Unexpected event")); await pipe.getScriptSource("script"); pipe.bindSpatial({ scriptId: "script", uniqueContextId: "context" });
  await pipe.observeComponentSpatial(wrapper);
  await pipe.observeComponentSpatial({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope", functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  await pipe.observeComponentSpatial(binding);
  await pipe.observeComponentSpatial({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "bundle", functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  for (let i = 0; i < 290; i += 1) { await pipe.observeComponentSpatial({ spatialPhase: "properties", method: "Runtime.getProperties", params: { objectId: `callee${String(i)}`, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  for (let i = 0; i < 16; i += 1) { await pipe.observeComponentSpatial(read); }
  const count = sent; await assert.rejects(pipe.observeComponentSpatial(read), /READ_SEQUENCE/u); assert.equal(sent, count);
  await pipe.observeComponentSpatial(release); await assert.rejects(pipe.observeComponentSpatial(release));
  const old = new CurrentPcbSpatialPipe(new PassThrough(), new PassThrough()); assert.equal(Object.hasOwn(old, "componentSpatialPurpose"), false); assert.throws(() => currentPcbSpatialWire(read, 1, "s"));
});
void test("Component native fragment composes idempotently with registration and preserves old384 codebook", async () => {
  const source = expandCurrentPcbDiagnosticCSharpReviewSource(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8")); const next = applyCurrentPcbComponentSpatialNativeFragment(source);
  assert.equal(applyCurrentPcbComponentSpatialNativeFragment(next), next);
  const combined = generateWorkerStartupProtocol(source); assert.equal(generateWorkerStartupProtocol(combined), combined);
  for (const name of ["ComponentSpatial209", "PcbViaWrite209", "SchematicDisplayWrite209", "GeneratedFixture209"]) { assert.equal(combined.split(`if ($${name} -and (`).length - 1, 1); }
  const oldBegin = "// BEGIN GENERATED PCB209 SPATIAL PROTOCOL", oldEnd = "// END GENERATED PCB209 SPATIAL PROTOCOL";
  assert.equal(next.slice(next.indexOf(oldBegin), next.indexOf(oldEnd)), source.slice(source.indexOf(oldBegin), source.indexOf(oldEnd)));
  assert.ok(next.includes("spatial209?384:componentSpatial209?419:")); assert.ok(next.includes("CreateComponentSpatial209()"));
});

void test("cloned Component variant owns exactly11 reads and refuses representation mixing before transport",async context=>{
 const input=new PassThrough(),output=new PassThrough();let sent=0;
 output.on("data",(chunk:Buffer):void=>{const command:unknown=JSON.parse(chunk.subarray(0,-1).toString());assert.ok(diagnosticRecord(command));sent+=1;let result:Record<string,unknown>={};if(command["method"]==="Target.attachToTarget"){result={sessionId:"s"};}else if(command["method"]==="Debugger.getScriptSource"){result={scriptSource:"synthetic"};}input.write(bytes({id:command["id"],result,...(command["sessionId"]===undefined?{}:{sessionId:command["sessionId"]})}));});
 const pipe=new CurrentPcbComponentSpatialPipe(input,output);context.after(async()=>{const closed=[once(input,"close"),once(output,"close")];input.destroy();output.destroy();await Promise.all(closed);pipe.releaseClosedListeners();});pipe.start();await pipe.attachTarget("original",()=>assert.fail("Unexpected event"));await pipe.getScriptSource("script");pipe.bindSpatial({scriptId:"script",uniqueContextId:"context"});
 await pipe.observeComponentSpatial(wrapper);await pipe.observeComponentSpatial({spatialPhase:"handler",method:"Runtime.callFunctionOn",params:{...effects,objectId:"scope",functionDeclaration:CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION,objectGroup:CURRENT_PCB_SPATIAL_OBJECT_GROUP,returnByValue:false}});
 const clonedBinding={...binding,spatialPhase:"bindings-component-cloned",params:{...binding.params,functionDeclaration:CLONED_BINDINGS}} as const;const clonedRead={...read,spatialPhase:"read-component-cloned",params:{...read.params,functionDeclaration:CLONED_READ}} as const;
 assert.throws(()=>currentPcbSpatialWire(clonedBinding,1,"s"));assert.throws(()=>currentPcbComponentSpatialWire({...clonedBinding,params:{...clonedBinding.params,functionDeclaration:CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION}},1,"s"));const clonedWire=currentPcbComponentSpatialWire(clonedRead,418,"s");assert.equal(componentSpatialDiagnosticNativeRequest(bytes(clonedWire.command))["spatialPhase"],"read-component-cloned");
 await pipe.observeComponentSpatial(clonedBinding);await pipe.observeComponentSpatial({spatialPhase:"functions",method:"Runtime.callFunctionOn",params:{...effects,objectId:"bundle",functionDeclaration:CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION,objectGroup:CURRENT_PCB_SPATIAL_OBJECT_GROUP,returnByValue:false}});
 for(let i=0;i<295;i+=1){await pipe.observeComponentSpatial({spatialPhase:"properties",method:"Runtime.getProperties",params:{objectId:`callee${String(i)}`,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 let count=sent;await assert.rejects(pipe.observeComponentSpatial(read),/READ_SEQUENCE/u);assert.equal(sent,count);for(let i=0;i<11;i+=1){await pipe.observeComponentSpatial(clonedRead);}count=sent;await assert.rejects(pipe.observeComponentSpatial(clonedRead),/READ_SEQUENCE/u);assert.equal(sent,count);await pipe.observeComponentSpatial(release);await assert.rejects(pipe.observeComponentSpatial(release));
 const request={action:"observe-components-cloned-pads",operationId:"pcb209-spatial-component-cloned",expectedBindingSha256:"a".repeat(64),queries:Array.from({length:11},()=>({kind:"point",xMil:0,yMil:0})),acceptNativeScratchEffects:true};assert.equal(currentPcbComponentSpatialRequestSchema.safeParse(request).success,true);assert.equal(currentPcbComponentSpatialRequestSchema.safeParse({...request,queries:[...request.queries,request.queries[0]]}).success,false);
});

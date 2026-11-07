/** Real initial observer with explicit original native/source/body seams.
 * No original main cursor, SDK Save or mutation grant is manufactured. */
import { viaMainActorProperties, viaMainActorValue } from "./helpers/via-main-actor-replies.ts";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaMainRequestObserver } from "../src/current-pcb-via-main-request-observer.ts";
import { currentPcbViaMainNativeCases, currentPcbViaMainWire, validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";
import type { CurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

void test("Via main codebook keeps fixed request selectors separate and cannot encode a resume or second driver arm", () => {
  const commands = currentPcbViaMainNativeCases(); assert.ok(commands.length > 10);
  for (const command of commands) { const wire = currentPcbViaMainWire(command, 7); assert.equal(wire.request["action"], "pcb-via-main-observe"); assert.ok(String(wire.request["phase"]).startsWith("via-main-"));
    for (const field of ["functionDeclaration", "expression", "arguments", "sessionId", "condition", "lineNumber", "columnNumber"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    assert.throws(() => currentPcbViaMainWire({ ...command, owner: "caller" }, 7)); assert.throws(() => validateCurrentPcbViaMainCommand({ ...command, phase: command.phase.slice(9) }));
  }
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-resume", method: "Debugger.resume", params: {} }), /NO_RESUME/u);
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-driver-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "foreign" } }), /DRIVER_ARM/u);
});
for (const pending of [false, true]) { void test(`actual Via observer joins the original main actor only through a fulfilled database Promise (pending=${String(pending)})`, async () => {
  const origin = Object.freeze({ explicitOriginSeam: true }); const plan = Object.freeze({ explicitPlanSeam: true, target:{projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),rawWindowsPath:String.raw`C:\Synthetic\fixture.eprj2`} });
  const source = Object.freeze({ explicitSourceSeam: true }); const projection = Object.freeze({ schema: "private.current-pcb-via-save-projection.v2" as const, bodySha256: "d".repeat(64), primitiveId: "3".repeat(16), exactOriginalUniqueIdDeltaVerified: true as const, originalClockBodyJoinVerified: true as const, selectedSqlAuthorized: false as const, persistenceVerified: false as const });
  const owner = Object.freeze({ bindViaMainOriginalBody: (p: unknown, o: unknown): unknown => { assert.equal(p, plan); assert.equal(o, origin); return { bodySha256: projection.bodySha256, primitiveId: projection.primitiveId }; } });
  const commands: CurrentPcbViaMainCommand[] = []; let actorAdvanced = false, advanced = false, controllerAdvanced = false, delivered = false, failed = false, saveAttempted = false;
  const event = { method: "Debugger.paused", params: { reason: "other", hitBreakpoints: ["sql-driver"], callFrames: [
    { callFrameId: "driver", functionName: "", location: { scriptId: "app", lineNumber: 1164, columnNumber: 2453 }, functionLocation: { scriptId: "app", lineNumber: 1164, columnNumber: 2434 } },
    { callFrameId: "caller", functionName: "interceptHttpProtocol", location: { scriptId: "app", lineNumber: 1164, columnNumber: 51_414 }, functionLocation: { scriptId: "app", lineNumber: 1164, columnNumber: 51_072 } },
  ] } };
  const request = Object.freeze({schema:"private.selected-file-main-request.v1",mode:"fetch",method:"POST",pureUrl:`/api/v4/projects/${plan.target.projectUuid}/branches/${plan.target.branchUuid}/histories`,pureQuery:"",pathHeader:plan.target.projectUuid,originalRequestVerified:true,readonlySql:false,executionAuthorized:false,saveAuthorized:false});
  const bindings = { scriptId: "app", constructionObjectId: "original-construction", persistentDriverBreakpointId: "sql-driver", source,
    assertCurrent: (): Promise<void> => { assert.equal(failed, false); if (delivered) { event.params.hitBreakpoints[0] = "foreign-after-capture"; } return Promise.resolve(); },
    assertSaveAttempt: (): void => { assert.equal(saveAttempted, true); }, fail: (): void => { failed = true; },
    observeRequest: ():Promise<unknown>=>Promise.resolve(request), requireOriginalRequest:(packet:unknown):void=>{assert.equal(packet,request);assert.equal(advanced,false);},continuePlannedDriver:(packet:unknown):Promise<void>=>{assert.equal(packet,request);assert.equal(advanced,false);advanced=true;return Promise.resolve();},continueReadonlyRequest:():Promise<void>=>Promise.reject(new Error("unexpected readonly continuation")),
    requireOriginalActorSql:():void=>{assert.equal(actorAdvanced,true);},
    continuePlannedController:():Promise<void>=>{assert.equal(controllerAdvanced,true);assert.equal(actorAdvanced,false);actorAdvanced=true;return Promise.resolve();},
    requireOriginalControllerBody:():void=>{assert.equal(controllerAdvanced,true);},
    continuePlannedContext:():Promise<void>=>{assert.equal(advanced,true);assert.equal(controllerAdvanced,false);controllerAdvanced=true;return Promise.resolve();},
    nextEvent: (): Promise<unknown> => { delivered = true;
      if(actorAdvanced){return Promise.resolve({method:"Debugger.paused",params:{reason:"other",hitBreakpoints:["original-source-point-2"],callFrames:[{callFrameId:"editHead",functionName:"PB",location:{scriptId:"app",lineNumber:8572,columnNumber:27_776},functionLocation:{scriptId:"app",lineNumber:8572,columnNumber:27_772}},{callFrameId:"actor",functionName:"L3",location:{scriptId:"app",lineNumber:8573,columnNumber:267},functionLocation:{scriptId:"app",lineNumber:8573,columnNumber:31}}]}});}
      if(controllerAdvanced){return Promise.resolve({method:"Debugger.paused",params:{reason:"other",hitBreakpoints:["original-source-point-1"],callFrames:[{callFrameId:"controller",functionName:"createProjectHistory",location:{scriptId:"app",lineNumber:8573,columnNumber:1663},functionLocation:{scriptId:"app",lineNumber:8573,columnNumber:1648}}]}});}
      if(advanced){return Promise.resolve({method:"Debugger.paused",params:{reason:"other",hitBreakpoints:["original-source-point-3"],callFrames:[{callFrameId:"context",functionName:"",location:{scriptId:"app",lineNumber:1164,columnNumber:2540},functionLocation:{scriptId:"app",lineNumber:1164,columnNumber:2434}},event.params.callFrames[1]]}});}
      return Promise.resolve(event);
    },
    request: (input: CurrentPcbViaMainCommand, cleanup: boolean): Promise<unknown> => {
      const command = validateCurrentPcbViaMainCommand(input); commands.push(command); assert.equal(cleanup, command.method === "Debugger.removeBreakpoint");
      if(command.method==="Debugger.removeBreakpoint"){return Promise.resolve({});}
      if (command.method === "Debugger.setBreakpoint") { return Promise.resolve({ breakpointId: `original-source-point-${String(commands.length)}`, actualLocation: command.params["location"] }); }
      if(command.phase==="via-main-request-context-join"){return Promise.resolve({result:{type:"boolean",value:true}});}
      if(command.phase==="via-main-request-properties"){
        const roles:Readonly<Record<string,"controller"|"actor"|"sql"|"PB"|"queryOne"|"promise">>={"via-main-request-controller":"controller","via-main-request-actor":"actor","via-main-request-sql":"sql","native-PB":"PB","native-queryOne":"queryOne","native-dbPromise":"promise"};const role=roles[String(command.params["objectId"])];assert.ok(role!==undefined);return Promise.resolve(viaMainActorProperties(role, pending));
      }
      if(command.phase==="via-main-request-value"){return Promise.resolve({result:{type:"object",value:viaMainActorValue}});}
      const counts:Readonly<Record<string,number>>={"via-main-request-invocation":6,"via-main-request-frame":4,"via-main-request-context":6,"via-main-request-controller":12,"via-main-request-actor":10,"via-main-request-sql":7};let count=counts[command.phase]??3;if(command.phase==="via-main-request-frame"){const frameCounts:Readonly<Record<string,number>>={editHead:1,actor:9,controller:8};count=frameCounts[String(command.params["callFrameId"])]??count;}
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", objectId: command.phase, description: `Array(${String(count)})` } });
    } };
  const url = new URL("../src/current-pcb-via-main-request-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { requireOriginalCurrentPcbViaMainOrigin: (o: unknown, actual: unknown, p: unknown): unknown => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(p, plan); return bindings; } }; }
    if (name === "./current-footprint-copy-main-request-source.ts") { return { requireCurrentFootprintCopyMainRequestSource: (s: unknown): void => { assert.equal(s, source); } }; }
    if (name === "./current-pcb-via-save-projection.ts") { return { requireOriginalCurrentPcbViaSaveProjection: (p: unknown, o: unknown, actual: unknown): unknown => { assert.equal(p, projection); assert.equal(o, owner); assert.equal(actual, plan); return {dataStr:"original-held-body"}; } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaMainRequestObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit native/source/body seams above replace issuance; the real observer state and protocol run unchanged.
  const observer = Reflect.construct(Constructor, [origin, owner, plan]) as CurrentPcbViaMainRequestObserver;
  await observer.arm(); assert.equal(commands.length, 2); saveAttempted = true;
  const body = projection;
  await observer.bindOriginalBody(body); await assert.rejects(observer.bindOriginalBody(body), /BODY_BIND_CONSUMED/u);
  const packet = await observer.captureDriver(body); assert.equal(commands.length, 6); assert.equal(packet.originalFetchPostRouteVerified,true); assert.equal(packet.actualRequestBodyJoined, false); assert.equal(packet.nativeMutationResumed, false);
  await observer.requireOriginal(packet); await assert.rejects(observer.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u); await assert.rejects(observer.captureDriver(body), /DRIVER_CONSUMED/u);
  const context=await observer.continueToContext(packet);assert.equal(context.originalDriverContextJoined,true);assert.equal(context.selectedSqlAuthorized,false);assert.equal(context.actualRequestBodyJoined,false);
  await observer.requireOriginalContext(context);await assert.rejects(observer.requireOriginalContext({...context}),/ORIGINAL_CONTEXT/u);await assert.rejects(observer.continueToContext(packet),/CONTEXT_CONSUMED/u);
  const controller=await observer.continueToController(context);assert.equal(controller.actualRequestBodyJoined,true);assert.equal(controller.selectedSqlAuthorized,false);await observer.requireOriginalController(controller);
  await assert.rejects(observer.requireOriginalContext(context),/ORIGINAL_CONTEXT/u);await assert.rejects(observer.requireOriginalController({...controller}),/ORIGINAL_CONTROLLER/u);await assert.rejects(observer.continueToController(context),/CONTROLLER_CONSUMED/u);
  if (pending) {
    await assert.rejects(observer.continueToActor(controller), /FOOTPRINT_MAIN_REQUEST_REPLY/u);
    await assert.rejects(observer.continueToActor(controller), /ACTOR_CONSUMED/u);
    assert.equal(commands.some(command => command.phase === "via-main-request-sql"), false);
    assert.equal(commands.some(command => command.method === "Debugger.resume"), false); assert.equal(failed, true); return;
  }
  const actor=await observer.continueToActor(controller);assert.equal(actor.originalFulfilledDatabasePromiseJoined,true);assert.equal(actor.selectedSqlAuthorized,false);await observer.requireOriginalActor(actor);
  await assert.rejects(observer.requireOriginalController(controller),/ORIGINAL_CONTROLLER/u);await assert.rejects(observer.requireOriginalActor({...actor}),/ORIGINAL_ACTOR/u);await assert.rejects(observer.continueToActor(controller),/ACTOR_CONSUMED/u);
  const sql=commands.find(command=>command.phase==="via-main-request-sql");assert.ok(sql!==undefined);assert.deepEqual(sql.params["arguments"],[{objectId:"native-yo"}]);
  assert.equal(commands.some(command => command.method === "Debugger.resume"), false); assert.equal(failed, false);
}); }

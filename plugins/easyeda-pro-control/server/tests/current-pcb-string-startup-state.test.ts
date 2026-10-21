import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION, decodeCurrentPcbStringStartupState,
  inspectCurrentPcbStringStartupRoute } from "../src/current-pcb-string-startup-state.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const setup = `scope.object.tl={useWebgl:false,multiThreadingOnOpen:true,rebuildingRatlineInWorker:false,
needFlushService:false,modelIsBuilt:true,controllerIsBuilt:true,engineHighlightReady:true};`;
function sample(change = ""): unknown {
  const context = pcbStringObservationFixture(false, setup + change);
  return pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION));
}
void test("startup route preserves the source branch and requires original single-publication evidence", () => {
  const terminal = inspectCurrentPcbStringStartupRoute(sample());
  assert.equal(terminal.route, "single-result-terminal-compatible");
  assert.equal(terminal.startupCallbackCompletionVerified, false); assert.equal(terminal.writeDestinationsContained, false);
  assert.equal(terminal.executionAuthorized, false); assert.ok(terminal.requiredOriginalEvidence.some(value => value.includes("sole ratlineResultFromWorker")));
  assert.equal(inspectCurrentPcbStringStartupRoute(sample("scope.object.tl.multiThreadingOnOpen=false;")).route, "no-startup-worker-compatible");
  assert.equal(inspectCurrentPcbStringStartupRoute(sample("scope.object.tl.rebuildingRatlineInWorker=true;")).route, "startup-ratline-pending");
  assert.equal(inspectCurrentPcbStringStartupRoute(sample("scope.object.tl.modelIsBuilt=false;")).route, "model-not-built");
  assert.equal(inspectCurrentPcbStringStartupRoute(sample("scope.object.tl.controllerIsBuilt=false;")).route, "model-not-built");
  const deferred = inspectCurrentPcbStringStartupRoute(sample("scope.object.tl.needFlushService=true;"));
  assert.equal(deferred.state.needFlushService, true); assert.equal(deferred.executionAuthorized, false);
});

void test("fixed startup leaf rejects inherited, accessor, unknown and malformed fields without calling vendor functions", () => {
  for (const change of ["delete scope.object.tl.modelIsBuilt;", "scope.object.tl.unknown=false;", "scope.object.tl.modelIsBuilt=1;",
    "Object.defineProperty(scope.object.tl,'modelIsBuilt',{get(){getterReads++;return true}});",
    "scope.object.tl=Object.create(scope.object.tl);", "scope.object.x.env._doctype=4;",
    'scope.object.x.env._id="bad";']) {
    const context = pcbStringObservationFixture(false, setup + change);
    assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION));
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  }
  const valid = decodeCurrentPcbStringStartupState(sample());
  assert.equal(valid.documentUuid, "d".repeat(16)); assert.equal(valid.queueCompletionVerified, false);
  assert.throws(() => decodeCurrentPcbStringStartupState({ result: { type: "string", value: JSON.stringify({ ...valid, executionAuthorized: true }) } }));
});

void test("real effect-checked startup sample rejects a Proxy without triggering traps or altering source flags", async () => {
  const session = new Session(); session.connect(); let contextId = 0;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic") { contextId = params.context.id; }
  });
  try {
    await session.post("Runtime.enable");
    const context = pcbStringObservationFixture(false, setup);
    assert.ok(contextId > 0);
      const scope = await session.post("Runtime.evaluate", { expression: "scope", contextId, returnByValue: false, objectGroup: "startup-test" });
      const callback = await session.post("Runtime.evaluate", { expression: 'MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback',
        contextId, returnByValue: false, objectGroup: "startup-test" });
      assert.ok(scope.result.objectId !== undefined); assert.ok(callback.result.objectId !== undefined);
      const read = (): Promise<unknown> => session.post("Runtime.callFunctionOn", { objectId: scope.result.objectId,
        functionDeclaration: CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION, arguments: [{ objectId: callback.result.objectId }],
        returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false });
      assert.equal(decodeCurrentPcbStringStartupState(await read()).modelIsBuilt, true);
      runInContext("scope.object.tl=new Proxy(scope.object.tl,{ownKeys(target){getterReads++;return Reflect.ownKeys(target)}});", context);
      const rejected = await read(); assert.throws(() => decodeCurrentPcbStringStartupState(rejected));
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
      await session.post("Runtime.releaseObjectGroup", { objectGroup: "startup-test" });
  } finally { session.disconnect(); }
});

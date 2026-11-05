/* oxlint-disable import/max-dependencies -- Purpose-isolation regressions compare the independent legacy codec, spatial codec, fixed program, catalog and derived limits. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentPcbDiagnosticPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest, diagnosticRecord } from "../src/current-pcb-diagnostic-protocol.ts";
import { CurrentPcbSpatialPipe } from "../src/current-pcb-spatial-pipe.ts";
import { CURRENT_PCB_SPATIAL_PROFILE, CURRENT_PCB_SPATIAL_REQUEST_DERIVATION } from "../src/current-pcb-spatial-profile.ts";
import { currentPcbSpatialWire, spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP } from "../src/current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "../src/current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";

const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
const wrapper = { spatialPhase: "wrapper", method: "Runtime.evaluate", params: { ...effects,
  expression: CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, uniqueContextId: "original-context", objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
  returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } } as const;
const properties = { spatialPhase: "properties", method: "Runtime.getProperties", params: {
  objectId: "original-handle", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } as const;
const release = { spatialPhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP } } as const;
function bytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
/** Synthetic streams only. No native process, bridge, application or tool. */
function fixture(context: TestContext, spatial: boolean): Readonly<{
  pipe: CurrentPcbDiagnosticPipe | CurrentPcbSpatialPipe; sent: Record<string, unknown>[];
}> {
  const input = new PassThrough(), output = new PassThrough(), sent: Record<string, unknown>[] = [];
  output.on("data", (chunk: unknown): void => {
    assert.ok(Buffer.isBuffer(chunk));
    const value: unknown = JSON.parse(chunk.subarray(0, -1).toString());
    assert.ok(diagnosticRecord(value)); sent.push(value);
    let result: Record<string, unknown> = {};
    if (value["method"] === "Target.attachToTarget") { result = { sessionId: "original-session" }; }
    else if (value["method"] === "Debugger.getScriptSource") { result = { scriptSource: "synthetic-source" }; }
    input.write(bytes({ id: value["id"], result, ...(Object.hasOwn(value, "sessionId") ? { sessionId: value["sessionId"] } : {}) }));
  });
  const pipe = spatial ? new CurrentPcbSpatialPipe(input, output) : new CurrentPcbDiagnosticPipe(input, output);
  context.after(async () => {
    const closed = [once(input, "close"), once(output, "close")];
    input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners();
  });
  pipe.start(); return { pipe, sent };
}

void test("spatial purpose derives its fixed complete-workflow cap from the function catalog", context => {
  const { pipe, sent } = fixture(context, true); assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  assert.equal(CURRENT_PCB_SPATIAL_PROFILE.requestLimit, 384);
  assert.equal(CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit, 383);
  assert.equal(CURRENT_PCB_SPATIAL_PROFILE.sessionBytes, 64 * 1024 * 1024);
  assert.equal(CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.calleeProperties, CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length);
  assert.equal(CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.spatialStage, 7 + 1 + 1 + CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length + 16 + 1);
  assert.equal(CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.fullWorkflow + CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.headroom, 384);
  assert.ok(CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.headroom >= 0);
  pipe.assertSpatialCapacity(); assert.equal(sent.length, 0);
  assert.equal("bindSpatial" in new CurrentPcbDiagnosticPipe(new PassThrough(), new PassThrough()), false);
});

void test("legacy 103 requests remain unchanged while spatial preserves request384 for original release", async context => {
  const old = fixture(context, false);
  for (let id = 1; id <= 103; id += 1) { await old.pipe.getVersion(); }
  await assert.rejects(old.pipe.getVersion(), /PIPE_BUDGET/u); assert.equal(old.sent.length, 103);
  const fresh = fixture(context, true), pipe = fresh.pipe; assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  await assert.rejects(pipe.observeSpatial(wrapper), /PIPE_PURPOSE/u); assert.equal(fresh.sent.length, 0);
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); });
  assert.throws(() => { pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" }); }, /PIPE_SOURCE/u);
  await pipe.getScriptSource("original-script");
  pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" });
  assert.throws(() => { pipe.assertSpatialCapacity(); }, /WORKFLOW_CAPACITY/u);
  await assert.rejects(pipe.observeSpatial({ ...wrapper, params: { ...wrapper.params, uniqueContextId: "foreign-context" } }), /PIPE_CONTEXT/u);
  for (let id = 3; id <= 382; id += 1) { await pipe.getVersion(); }
  await pipe.observeSpatial(wrapper); assert.equal(fresh.sent.length, 383);
  await assert.rejects(pipe.observeSpatial(properties), /CLEANUP_RESERVE/u); assert.equal(fresh.sent.length, 383);
  await pipe.observeSpatial(release); assert.equal(fresh.sent.length, 384);
  await assert.rejects(pipe.observeSpatial(release), /PIPE_PURPOSE/u); assert.equal(fresh.sent.length, 384);
  assert.equal(pipe.status().requestCount, 384);
});

void test("spatial native reconstruction rejects legacy use, code/options and the385th request", () => {
  const fixed = currentPcbSpatialWire(properties, 383, "original-session");
  assert.equal(spatialDiagnosticNativeRequest(bytes(fixed.command))["spatialPhase"], "properties");
  assert.throws(() => diagnosticNativeRequest(bytes(fixed.command)));
  assert.equal(currentPcbSpatialWire(release, 384, "original-session").request["requestId"], 384);
  assert.throws(() => currentPcbSpatialWire(properties, 384, "original-session"), /CLEANUP_RESERVE/u);
  assert.throws(() => currentPcbSpatialWire(release, 385, "original-session"), /REQUEST_ID/u);
  assert.throws(() => currentPcbSpatialWire({ ...properties, params: { ...properties.params, accessorPropertiesOnly: true } }, 1, "s"));
  assert.throws(() => currentPcbSpatialWire({ ...wrapper, params: { ...wrapper.params, expression: "caller-code" } }, 1, "s"));
  let getterCalled = false;
  const accessor = { ...properties, params: Object.defineProperty({}, "objectId", { enumerable: true, get(): string { getterCalled = true; return "foreign"; } }) };
  assert.throws(() => currentPcbSpatialWire(accessor, 1, "s"), /COMMAND_INPUT/u); assert.equal(getterCalled, false);
  assert.throws(() => currentPcbSpatialWire(new Proxy(properties, {}), 1, "s"), /COMMAND_INPUT/u);
  const bindings = { spatialPhase: "bindings", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false,
    objectId: "original-scope", functionDeclaration: CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: false, arguments: [{ objectId: "original-wrapper" }] } } as const;
  const fixedBindings = currentPcbSpatialWire(bindings, 10, "s").command;
  assert.ok("throwOnSideEffect" in fixedBindings.params); assert.equal(fixedBindings.params.throwOnSideEffect, false);
  assert.throws(() => currentPcbSpatialWire({ ...bindings, params: { ...bindings.params, throwOnSideEffect: true } }, 10, "s"));
  const functions = currentPcbSpatialWire({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: {
    ...effects, objectId: "original-bundle", functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION,
    objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } }, 20, "original-session");
  assert.deepEqual(spatialDiagnosticNativeRequest(bytes(functions.command)), { action: "spatial209", requestId: 20,
    method: "Runtime.callFunctionOn", sessionId: "original-session", spatialPhase: "functions", objectId: "original-bundle" });
  assert.deepEqual(spatialDiagnosticNativeRequest(bytes({ id: 383, method: "Browser.getVersion" })), {
    action: "send", requestId: 383, method: "Browser.getVersion" });
  assert.throws(() => spatialDiagnosticNativeRequest(bytes({ id: 384, method: "Browser.getVersion" })), /CLEANUP_RESERVE/u);
  assert.throws(() => spatialDiagnosticNativeRequest(bytes({ id: 1, method: "Target.setAutoAttach", params: {}, sessionId: "s" })));
});

void test("spatial sequence admits16 original reads, refuses17 and retains passive final frame checks", async context => {
  const value = fixture(context, true);
  const pipe = value.pipe; assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); });
  await pipe.getScriptSource("original-script");
  pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" });
  await pipe.observeSpatial(wrapper);
  await pipe.observeSpatial({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  await pipe.observeSpatial({ spatialPhase: "bindings", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false, objectId: "handler-scope",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: false, arguments: [{ objectId: "wrapper" }] } });
  await pipe.observeSpatial({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "bundle",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  const read = { spatialPhase: "read", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false,
    objectId: "bundle", functionDeclaration: CURRENT_PCB_209_SPATIAL_READ_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: true, arguments: [{ value: { kind: "point", xMil: 0, yMil: 1 } }] } } as const;
  for (let index = 0; index < 16; index += 1) { await pipe.observeSpatial(read); }
  const used = value.sent.length;
  await assert.rejects(pipe.observeSpatial(read), /READ_SEQUENCE/u);
  await assert.rejects(pipe.observeSpatial(properties), /PIPE_SEQUENCE/u); assert.equal(value.sent.length, used);
  await pipe.observeSpatial(release);
  await pipe.getTargets(); await pipe.getFrameTree(); await pipe.getFrameOwner("original-frame"); await pipe.describeFrameOwner(1);
  assert.equal(value.sent.length, used + 5);
});

/* oxlint-disable import/max-dependencies -- Purpose-isolation regressions compare the independent legacy codec, spatial codec, fixed program, catalog and derived limits. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentPcbDiagnosticPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest, diagnosticRecord } from "../src/current-pcb-diagnostic-protocol.ts";
import { CurrentPcbSpatialPipe } from "../src/current-pcb-spatial-pipe.ts";
import { CURRENT_PCB_SPATIAL_PROFILE, CURRENT_PCB_SPATIAL_REQUEST_DERIVATION } from "../src/current-pcb-spatial-profile.ts";
import { currentPcbSpatialWire, spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP } from "../src/current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION } from "../src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "../src/current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION } from "../src/current-pcb-209-spatial-read-program.ts";

import { CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION } from "../src/current-pcb-209-spatial-pad-read.ts";

const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
const wrapper = { spatialPhase: "wrapper", method: "Runtime.evaluate", params: { ...effects,
  expression: CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, uniqueContextId: "original-context", objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
  returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } } as const;
const properties = { spatialPhase: "properties", method: "Runtime.getProperties", params: {
  objectId: "original-handle", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } as const;
const release = { spatialPhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP } } as const;
const trackRead = { spatialPhase: "read-track", method: "Runtime.callFunctionOn", params: {
  ...effects, throwOnSideEffect: false, objectId: "original-bundle", functionDeclaration: CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION,
  objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: true, arguments: [{ value: { kind: "point", xMil: 0, yMil: 0 } }] } } as const;
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

void test("mixed native grammar pins its program, forbids variant switching and consumes at most15 reads", async context => {
  const { pipe } = fixture(context, true); assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); });
  await pipe.getScriptSource("original-script");
  pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" });
  await pipe.observeSpatial(wrapper);
  await pipe.observeSpatial({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  await pipe.observeSpatial({ spatialPhase: "bindings-track", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false,
    objectId: "scope", functionDeclaration: CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: false, arguments: [{ objectId: "wrapper" }] } });
  await pipe.observeSpatial({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "bundle",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  const fixed = currentPcbSpatialWire(trackRead, 383, "s");
  assert.equal(spatialDiagnosticNativeRequest(bytes(fixed.command))["spatialPhase"], "read-track");
  assert.throws(() => currentPcbSpatialWire({ ...trackRead, params: { ...trackRead.params, functionDeclaration: CURRENT_PCB_209_SPATIAL_READ_FUNCTION } }, 10, "s"));
  await assert.rejects(pipe.observeSpatial({ ...trackRead, spatialPhase: "read", params: {
    ...trackRead.params, functionDeclaration: CURRENT_PCB_209_SPATIAL_READ_FUNCTION } }), /READ_SEQUENCE/u);
  for (let i = 0; i < 15; i += 1) { await pipe.observeSpatial(trackRead); }
  await assert.rejects(pipe.observeSpatial(trackRead), /READ_SEQUENCE/u);
  await pipe.observeSpatial(release);
});

void test("Arc native grammar retains its six-query limit, fixed program and original release", async context => {
  const { pipe, sent } = fixture(context, true); assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); });
  await pipe.getScriptSource("original-script");
  pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" });
  await pipe.observeSpatial(wrapper);
  await pipe.observeSpatial({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  await pipe.observeSpatial({ spatialPhase: "bindings-arc", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false,
    objectId: "scope", functionDeclaration: CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: false, arguments: [{ objectId: "wrapper" }] } });
  await pipe.observeSpatial({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "bundle",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  const read = { ...trackRead, spatialPhase: "read-arc", params: { ...trackRead.params, functionDeclaration: CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION } } as const;
  const fixed = currentPcbSpatialWire(read, 383, "s");
  assert.equal(spatialDiagnosticNativeRequest(bytes(fixed.command))["spatialPhase"], "read-arc");
  assert.throws(() => currentPcbSpatialWire({ ...read, params: trackRead.params }, 10, "s"));
  await assert.rejects(pipe.observeSpatial(trackRead), /READ_SEQUENCE/u);
  for (let i = 0; i < 6; i += 1) { await pipe.observeSpatial(read); }
  const used = sent.length;
  await assert.rejects(pipe.observeSpatial(read), /READ_SEQUENCE/u); assert.equal(sent.length, used);
  await pipe.observeSpatial(release); assert.equal(sent.length, used + 1);
});

void test("Pad native grammar retains sixteen point reads, fixed program and original release", async context => {
  const { pipe, sent } = fixture(context, true); assert.ok(pipe instanceof CurrentPcbSpatialPipe);
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); });
  await pipe.getScriptSource("original-script");
  pipe.bindSpatial({ uniqueContextId: "original-context", scriptId: "original-script" });
  await pipe.observeSpatial(wrapper);
  await pipe.observeSpatial({ spatialPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  await pipe.observeSpatial({ spatialPhase: "bindings-pad", method: "Runtime.callFunctionOn", params: { ...effects, throwOnSideEffect: false,
    objectId: "scope", functionDeclaration: CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP,
    returnByValue: false, arguments: [{ objectId: "wrapper" }] } });
  await pipe.observeSpatial({ spatialPhase: "functions", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "bundle",
    functionDeclaration: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP, returnByValue: false } });
  const read = { ...trackRead, spatialPhase: "read-pad", params: { ...trackRead.params, functionDeclaration: CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION } } as const;
  const fixed = currentPcbSpatialWire(read, 383, "s");
  assert.equal(spatialDiagnosticNativeRequest(bytes(fixed.command))["spatialPhase"], "read-pad");
  assert.throws(() => currentPcbSpatialWire({ ...read, params: trackRead.params }, 10, "s"));
  await assert.rejects(pipe.observeSpatial(trackRead), /READ_SEQUENCE/u);
  for (let i = 0; i < 16; i += 1) { await pipe.observeSpatial(read); }
  const beforeRegion = sent.length;
  const region = { ...read, params: { ...read.params, arguments: [{ value: { kind: "region", mode: "inside", leftMil: 0, rightMil: 10, bottomMil: 0, topMil: 10 } }] } };
  assert.throws(() => currentPcbSpatialWire(region, 382, "s")); assert.equal(sent.length, beforeRegion);
  const used = sent.length;
  await assert.rejects(pipe.observeSpatial(read), /READ_SEQUENCE/u); assert.equal(sent.length, used);
  await pipe.observeSpatial(release); assert.equal(sent.length, used + 1);
});

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

void test("spatial native birth has a private distinct type and no duplicate owner constructor signature", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(source.includes("enum Spatial209Birth { SourceQualified }"));
  assert.ok(source.includes("EasyedaDiagnosticOwner(Spatial209Birth purpose)"));
  assert.ok(source.includes("return new EasyedaDiagnosticOwner(Spatial209Birth.SourceQualified);"));
  const signatures = [...source.matchAll(/^\s+(?:public\s+)?EasyedaDiagnosticOwner\(([^)]*)\)/gmu)].map(match => {
    assert.ok(match[1] !== undefined);
    return match[1].split(",").map(parameter => parameter.trim().split(/\s+/u).slice(0, -1).join(" ")).join(",");
  });
  assert.ok(signatures.length > 1);
  assert.equal(new Set(signatures).size, signatures.length, "A C# constructor collision must refuse before Windows CI.");
});

void test("native CompileOnly exercises PowerShell-decoded fractions and invariant G17 for all six coordinates", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(source.includes("!(value is double)&&!(value is decimal)"));
  const begin = source.indexOf("  static string SpatialQuery("), end = source.indexOf("  public static string Spatial209ProtocolMessage(", begin);
  assert.ok(begin !== -1 && end > begin);
  const query = source.slice(begin, end);
  assert.equal([...query.matchAll(/ToString\("G17",CultureInfo\.InvariantCulture\)/gu)].length, 6);
  assert.equal(query.includes('ToString("R"'), false);
  const compile = source.indexOf("  if ($CompileOnly) {"), smoke = source.indexOf("    # BEGIN GENERATED PCB209 SPATIAL NUMBER SMOKE");
  const cleanupRelease = source.indexOf("    $owner.ReleaseUnlaunched()", compile);
  assert.ok(compile !== -1 && smoke > compile && cleanupRelease > smoke);
  // oxlint-disable-next-line unicorn/prefer-set-has -- This is PowerShell source text; these are substring checks rather than collection membership.
  const decoded = source.slice(smoke, cleanupRelease);
  assert.ok(decoded.includes("$spatialNumberSmokeRequest=ConvertFrom-Json -InputObject $spatialNumberSmokeJson"));
  assert.ok(decoded.includes("$spatialNumberSmokeDecoded=ConvertFrom-Json -InputObject $spatialNumberSmokeMessage.Substring"));
  assert.ok(decoded.includes("[BitConverter]::DoubleToInt64Bits($spatialNumberSmokeBefore)"));
  assert.ok(decoded.includes("[BitConverter]::DoubleToInt64Bits($spatialNumberSmokeAfter)"));
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

/** Synthetic complete sources/CDP locations/native issuers only. The actual
 * registration issuer, RPC sequencer and unchanged descriptor programs run;
 * no application, Electron debugger, native owner, clock service or writer runs. */
/* oxlint-disable import/max-dependencies -- This composed case exercises the fixed profile, protocol, native table and both actual private runners with test-only issuer/source substitutions. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as SOURCES } from "../src/current-footprint-copy-clock-registration-v2-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_CALLER as CALLER, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES as SITES } from "../src/current-footprint-copy-clock-rpc-v2-profile.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_REQUESTS as REQUESTS, currentFootprintCopyClockRpcV2Condition, validateCurrentFootprintCopyClockRpcV2Command } from "../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintCopyClockRpcV2Wire } from "../src/current-footprint-copy-clock-rpc-v2-wire.ts";
import { currentFootprintCopyClockRpcV2NativeCases, currentFootprintCopyClockRpcV2NativeSource } from "../src/current-footprint-copy-clock-rpc-v2-native.ts";
import type { CurrentFootprintCopyClockRegistrationV2Observation, CurrentFootprintCopyClockRegistrationV2Runner } from "../src/current-footprint-copy-clock-registration-v2-runner.ts";
import type { CurrentFootprintCopyClockRpcV2Observation, CurrentFootprintCopyClockRpcV2Runner } from "../src/current-footprint-copy-clock-rpc-v2-runner.ts";
import type { CurrentFootprintCopyClockRpcV2RegistrationBinding, CurrentFootprintCopyClockRpcV2RegistrationRetention, CurrentFootprintCopyClockRpcV2Transport } from "../src/current-footprint-copy-clock-rpc-v2-retention.ts";
import { SYNTHETIC_SOURCES, clockRpcV2Fixture, documentUuid } from "./helpers/footprint-clock-rpc-v2-fixture.ts";

type Module = Record<string, unknown>;
async function load(path: string, replacements: Module = {}, text?: string): Promise<Module> {
  const url = new URL(`../src/${path}`, import.meta.url); const actualRequire = createRequire(url), loaded: { exports: Module } = { exports: {} };
  const output = await transform(text ?? await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(replacements, name) ? replacements[name] : actualRequire(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
interface RegistrationModule { readonly CurrentFootprintCopyClockRegistrationV2Runner: typeof CurrentFootprintCopyClockRegistrationV2Runner;
  readonly requireCurrentFootprintCopyClockRpcV2RegistrationRetention: (token: CurrentFootprintCopyClockRpcV2RegistrationRetention, cleanup?: boolean) => CurrentFootprintCopyClockRpcV2RegistrationBinding }
interface RpcModule { readonly CurrentFootprintCopyClockRpcV2Runner: typeof CurrentFootprintCopyClockRpcV2Runner;
  readonly currentFootprintCopyClockRpcV2ObservationSchema: { parse: (value: unknown) => CurrentFootprintCopyClockRpcV2Observation } }
async function fixture(override?: (transport: CurrentFootprintCopyClockRpcV2Transport) => CurrentFootprintCopyClockRpcV2Transport): Promise<ReturnType<typeof clockRpcV2Fixture> & Readonly<{
  registration: CurrentFootprintCopyClockRegistrationV2Runner; registrationPacket: CurrentFootprintCopyClockRegistrationV2Observation;
  retention: CurrentFootprintCopyClockRpcV2RegistrationRetention; registrationModule: RegistrationModule; rpcModule: RpcModule; runner: CurrentFootprintCopyClockRpcV2Runner;
}>> {
  const f = clockRpcV2Fixture(), sourceFile = new URL("../src/current-footprint-copy-clock-registration-v2-source.ts", import.meta.url);
  let sourceText = await readFile(sourceFile, "utf8");
  for (const role of ["wrapper", "callback"] as const) { const full = SYNTHETIC_SOURCES[role]; assert.ok(full !== undefined); sourceText = sourceText.replace(SOURCES[role].sha256, sha256Text(full)); }
  const source = await load("current-footprint-copy-clock-registration-v2-source.ts", {}, sourceText), uiSource = Object.freeze({ synthetic: true });
  const registrationModule = await load("current-footprint-copy-clock-registration-v2-runner.ts", {
    "./current-footprint-copy-clock-registration-v2-source.ts": source,
    "./current-footprint-copy-ui-source.ts": { requireCurrentFootprintCopyUiSource(value: unknown): void { assert.equal(value, uiSource); } },
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only synthetic full-source pins and the separate UI issuer are substituted; the real private retention registry remains active.
  const reg = registrationModule as unknown as RegistrationModule;
  const registration = new reg.CurrentFootprintCopyClockRegistrationV2Runner(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately synthetic UI source issuer; no genuine native authority is exercised.
    uiSource as unknown as ConstructorParameters<typeof CurrentFootprintCopyClockRegistrationV2Runner>[0], f.registrationTransport,
    { sessionId: "ui", uiRoute: "route", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
  const registrationPacket = await registration.observe(), retention = registration.retainForRpc(registrationPacket);
  const rpc = await load("current-footprint-copy-clock-rpc-v2-runner.ts", {
    "./current-footprint-copy-clock-registration-v2-source.ts": source,
    "./current-footprint-copy-clock-registration-v2-runner.ts": registrationModule,
    "./current-pcb-worker-construction-runner.ts": { requireCurrentFootprintCopyClockRpcConstructionLease(value: unknown): typeof f.construction {
      assert.equal(value, f.workerLease); return f.construction;
    } },
    "./current-footprint-copy-clock-rpc-source.ts": { requireCurrentFootprintCopyClockRpcSource(value: unknown, realm: string): void { assert.equal(realm, "worker"); assert.equal(value, f.workerSource); } },
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual RPC runner with explicit synthetic worker-source/lease issuer only; registration retention stays genuine to its real completed runner.
  const rpcModule = rpc as unknown as RpcModule;
  const runner = new rpcModule.CurrentFootprintCopyClockRpcV2Runner(f.workerLease, retention, override?.(f.transport) ?? f.transport, { workerSessionId: "worker", documentUuid });
  return { ...f, registration, registrationPacket, retention, registrationModule: reg, rpcModule, runner };
}

void test("mixed original registration and two RPC traces derive49/18/67 while keeping roles, offsets and all authority flags closed", async () => {
  const f = await fixture(); assert.equal(f.registrationCommands.length, 18);
  assert.equal(f.registration.retainForRpc(f.registrationPacket), f.retention);
  assert.throws(() => f.registration.retainForRpc(structuredClone(f.registrationPacket)));
  assert.throws(() => f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(structuredClone(f.retention)));
  assert.throws(() => f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(new Proxy(f.retention, {})));
  await f.runner.arm(); assert.equal(f.commands.length, 13); await assert.rejects(f.runner.arm());
  f.runner.consumeBeforeInvocation(); f.state.started = true;
  const packet = await f.runner.collect(); assert.deepEqual(packet.samples.map(sample => [sample.ordinal, sample.lexicalOffset]), [[1, 5], [2, 11]]);
  assert.notEqual(packet.samples[0]?.replyTopicSha256, packet.samples[1]?.replyTopicSha256);
  for (const key of ["originalUiNativeOwnerJoined", "nativeBudgetReserved", "nativeMounted", "executionAuthorized", "backendClockOrSqlCompletionVerified", "nativeCreateCompletionVerified"] as const) { assert.equal(packet[key], false); }
  assert.throws(() => f.rpcModule.currentFootprintCopyClockRpcV2ObservationSchema.parse({ ...packet, executionAuthorized: true }));
  assert.throws(() => f.rpcModule.currentFootprintCopyClockRpcV2ObservationSchema.parse({ ...packet, callbackObjectId: "copied" }));
  await f.runner.requireOriginal(packet); await assert.rejects(f.runner.requireOriginal(structuredClone(packet)));
  assert.deepEqual(REQUESTS, { normal: 49, cleanup: 18, total: 67 });
  assert.equal(f.runner.diagnostics()["normalRequests"], REQUESTS.normal); assert.equal(f.runner.diagnostics()["cleanupRequests"], 16);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 10);
  const callbackReads = f.commands.filter(command => command.method === "Runtime.getProperties" && command.params["objectId"] === "callback"); assert.equal(callbackReads.length, 2);
  const resultArm = f.commands.find(command => command.role === "result"); assert.equal(resultArm?.params["condition"], currentFootprintCopyClockRpcV2Condition("result", "22222222-2222-2222-2222-222222222222"));
  assert.deepEqual(resultArm?.params["location"], { scriptId: "ui-script", lineNumber: 1, columnNumber: 86_544 });
  await f.runner.cleanup(); assert.equal(f.commands.length, REQUESTS.total); assert.equal(f.runner.diagnostics()["cleanupRequests"], REQUESTS.cleanup);
  for (const [index, command] of f.commands.entries()) {
    const wire = currentFootprintCopyClockRpcV2Wire(command, index + 1, "worker", "ui"); assert.equal(wire.request["action"], "footprint-clock-rpc-v2-send");
    assert.equal(Object.keys(wire.request).some(key => ["sessionId", "functionDeclaration", "expression", "condition"].includes(key)), false);
  }
  assert.equal(f.runner.retained().failure, null); assert.ok(f.runner.retained().replies.every(Object.isFrozen));
  assert.equal(f.state.retired, true); await assert.rejects(f.runner.cleanup());
  const released = await fixture(); await released.registration.release();
  assert.throws(() => released.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(released.retention));
  await assert.rejects(released.runner.arm()); assert.equal(released.commands.length, 0);
});

for (const state of ["sample-failed", "released", "release-pending"] as const) {
  void test(`RPC cleanup retains only original cleanup references after registration ${state}`, async () => {
    const f = await fixture(); await f.runner.arm();
    let release: Promise<void> | null = null;
    if (state === "sample-failed") {
      f.state.registrationSampleFailure = true;
      await assert.rejects(f.registration.sampleOriginal(f.registrationPacket), /original registration sample failed/u);
    } else if (state === "release-pending") {
      f.state.holdRegistrationRelease = true; release = assert.rejects(f.registration.release());
      await f.registrationRelease.entered;
    } else { await f.registration.release(); }
    const failure = f.registration.retained().failure, phase = f.runner.diagnostics()["phase"];
    assert.throws(() => f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(f.retention));
    assert.throws(() => f.registration.retainForRpc(f.registrationPacket));
    assert.throws(() => { f.runner.consumeBeforeInvocation(); }); assert.equal(f.runner.diagnostics()["phase"], phase);
    assert.equal(phase, "armed"); assert.equal(f.commands.length, 13);
    try { await f.runner.cleanup(); }
    finally { f.registrationRelease.finish(); if (release !== null) { await release; } }
    const cleanup = f.commands.slice(13), points = f.commands.filter(command => command.method === "Debugger.setBreakpoint");
    assert.equal(cleanup.filter(command => command.method === "Debugger.removeBreakpoint").length, points.length);
    assert.equal(cleanup.filter(command => command.method === "Runtime.releaseObjectGroup").length, 2);
    assert.ok(cleanup.every(command => command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.releaseObjectGroup"));
    const retained = f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(f.retention, true);
    retained.assertCleanup(); await assert.rejects(retained.assertOriginal());
    for (const token of [structuredClone(f.retention), new Proxy(f.retention, {})]) {
      assert.throws(() => f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(token, true));
    }
    assert.equal(f.state.clockCalls, 0); assert.equal(f.state.started, false); assert.equal(f.state.retired, true);
    assert.equal(f.runner.diagnostics()["executionAuthorized"], false); assert.equal(f.runner.diagnostics()["nativeMounted"], false);
    if (state === "sample-failed") { assert.equal(f.registration.retained().failure, failure); }
    await assert.rejects(f.registration.sampleOriginal(f.registrationPacket)); await assert.rejects(f.runner.cleanup());
  });
}

void test("registration transport substitution blocks RPC cleanup before any downstream command", async () => {
  const f = await fixture(); await f.runner.arm(); await f.registration.release();
  Reflect.set(f.registrationTransport, "request", (): Promise<unknown> => Promise.resolve({}));
  assert.throws(() => f.registrationModule.requireCurrentFootprintCopyClockRpcV2RegistrationRetention(f.retention, true));
  await assert.rejects(f.runner.cleanup()); assert.equal(f.commands.length, 13); assert.equal(f.state.clockCalls, 0);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
});

void test("relocated allocation and wrong preload caller location fail before continuation and retain their first reply evidence", async () => {
  for (const fault of ["relocation", "caller", "callback"] as const) {
    const f = await fixture(original => ({ ...original,
      request: async (command, cleanup): Promise<unknown> => {
        const raw = await original.request(command, cleanup);
        if (fault === "relocation" && command.role === "result") { return { breakpointId: "point-result", actualLocation: { scriptId: "ui-script", lineNumber: 1, columnNumber: 86_545 } }; }
        if (fault === "callback" && command.method === "Runtime.getProperties" && command.params["objectId"] === "callback") {
          assert.ok(raw !== null && typeof raw === "object"); const properties: unknown = Reflect.get(raw, "internalProperties"); assert.ok(Array.isArray(properties));
          const location: unknown = Reflect.get(properties[0], "value"); assert.ok(location !== null && typeof location === "object");
          const point: unknown = Reflect.get(location, "value"); assert.ok(point !== null && typeof point === "object"); Reflect.set(point, "scriptId", "ui-script");
        }
        return raw;
      },
      takeEvent(): ReturnType<CurrentFootprintCopyClockRpcV2Transport["takeEvent"]> {
        const event = original.takeEvent(); if (fault !== "caller" || event?.method !== "Debugger.paused") { return event; }
        const changed = structuredClone(event), params = changed.params; assert.ok(params !== null && typeof params === "object");
        const frames: unknown = Reflect.get(params, "callFrames"); assert.ok(Array.isArray(frames));
        for (const frame of frames) {
          assert.ok(frame !== null && typeof frame === "object");
          if (Reflect.get(frame, "functionName") === CALLER.functionName) { const location: unknown = Reflect.get(frame, "functionLocation"); assert.ok(location !== null && typeof location === "object"); Reflect.set(location, "scriptId", "callback-script"); }
        }
        return changed;
      },
    }));
    if (fault === "relocation") { await assert.rejects(f.runner.arm(), /ALLOCATION_LOCATION/u); }
    else { await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; await assert.rejects(f.runner.collect()); }
    const failure = f.runner.retained().failure; assert.ok(failure !== null); assert.equal(failure.executionAuthorized, false);
    if (fault === "relocation") { assert.equal(failure.requestIndex, 10); assert.equal(failure.reply?.sha256.length, 64); }
    assert.ok(f.commands.filter(command => command.method === "Debugger.resume").length <= 2);
    await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); assert.equal(f.runner.retained().failure, failure);
    f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.state.retired, true);
  }
  const entered = Promise.withResolvers<null>(), settled = Promise.withResolvers<null>();
  let latePause = false, retirementCalls = 0;
  const held = await fixture(original => ({ ...original,
    async retire(): Promise<void> {
      retirementCalls += 1;
      if (retirementCalls === 1) { entered.resolve(null); await settled.promise; }
      await original.retire();
    },
    takeEvent(): ReturnType<CurrentFootprintCopyClockRpcV2Transport["takeEvent"]> {
      if (latePause) { latePause = false; return { method: "Debugger.paused", sessionId: "ui", params: {} }; }
      return original.takeEvent();
    },
  }));
  await held.runner.arm(); const cleanup = held.runner.cleanup(); await entered.promise;
  latePause = true; settled.resolve(null); await assert.rejects(cleanup, /UNEXPECTED_PAUSE/u);
  assert.equal(held.runner.diagnostics()["retired"], false); assert.equal(held.runner.diagnostics()["unknownPause"], true);
  const first = held.runner.retained().failure; assert.ok(first !== null); assert.equal(first.stage, "retire"); assert.equal(first.requestIndex, null); assert.equal(first.reply, null);
  await assert.rejects(held.runner.cleanup()); await assert.rejects(held.runner.observeOriginalGenerationEnded(), /remains live/u);
  assert.equal(held.runner.retained().failure, first); assert.equal(retirementCalls, 1);
  held.state.exited = true; await held.runner.observeOriginalGenerationEnded();
  assert.equal(held.runner.diagnostics()["retired"], true); assert.equal(retirementCalls, 2); assert.equal(held.runner.retained().failure, first);
});

void test("original worker loss, wrong responder, repeated selected task and changed reply stop before the next unsafe continuation", async () => {
  for (const fault of ["lostWorkerLease", "wrongTarget", "reusedUiTask", "changedResult"] as const) {
    const f = await fixture(); await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; f.state[fault] = true;
    await assert.rejects(f.runner.collect()); const first = f.runner.retained().failure; assert.ok(first !== null);
    if (fault === "lostWorkerLease") { assert.equal(f.commands.length, 13); assert.equal(first.requestIndex, null); assert.equal(first.reply, null); }
    assert.ok(f.commands.filter(command => command.method === "Debugger.resume").length < 10);
    await assert.rejects(f.runner.collect()); await assert.rejects(f.runner.cleanup()); assert.equal(f.runner.retained().failure, first);
    f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
  }
});

void test("v2 closed native table preserves24 cases and rejects caller programs, v1 frames, extra fields and foreign sessions", () => {
  const commands = currentFootprintCopyClockRpcV2NativeCases(); assert.equal(commands.length, 24);
  const native = currentFootprintCopyClockRpcV2NativeSource(); assert.match(native, /class EasyedaFootprintCopyClockRpcV2Protocol/u); assert.match(native, /,24,5\);/u);
  for (const [index, command] of commands.entries()) {
    const realm = command.sessionId === "clockrpc_worker" ? "worker" : "ui";
    assert.equal(currentFootprintCopyClockRpcV2Wire(command, index + 1, "clockrpc_worker", "clockrpc_ui").request["realm"], realm);
    assert.throws(() => validateCurrentFootprintCopyClockRpcV2Command({ ...command, sourceOverride: "caller" }));
  }
  const arm = { phase: "rpc-arm", role: "result", method: "Debugger.setBreakpoint", sessionId: "ui", params: { location: { scriptId: "ui-script", lineNumber: SITES.result.lineNumber, columnNumber: SITES.result.columnNumber }, condition: currentFootprintCopyClockRpcV2Condition("result", "22222222-2222-2222-2222-222222222222") } };
  assert.throws(() => validateCurrentFootprintCopyClockRpcV2Command({ ...arm, params: { ...arm.params, condition: "true" } }));
  assert.throws(() => validateCurrentFootprintCopyClockRpcV2Command({ phase: "rpc-frame", method: "Debugger.evaluateOnCallFrame", sessionId: "ui", params: { callFrameId: "frame", expression: "[this,s,r,n,a,t,e,i]", objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
  assert.throws(() => currentFootprintCopyClockRpcV2Wire(arm, 1, "worker", "foreign"));
});

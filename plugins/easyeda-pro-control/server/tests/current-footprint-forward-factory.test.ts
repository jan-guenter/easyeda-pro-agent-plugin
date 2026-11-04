/** Actual factory, private registries and transport counters with an explicitly
 * synthetic installation and inert Node child. No Windows ownership is proved. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as CAPACITY } from "../src/current-footprint-copy-forward-capacity.ts";
import { CurrentFootprintCopyForwardStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { currentFootprintSavedCacheNativeCases } from "../src/current-footprint-saved-cache-native.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

void test("forward factory is born separately and retains original counters through zero-input release", async context => {
  const f = await combinedReadyFactoryFixture("ready", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  f.api.assertOriginalCurrentFootprintCopyForwardNativeOwner(owner);
  const prototype: unknown = Object.getPrototypeOf(owner); assert.ok(prototype !== null && typeof prototype === "object");
  const copied: unknown = Object.create(prototype);
  assert.throws(() => { Reflect.apply(f.api.assertOriginalCurrentFootprintCopyForwardNativeOwner, undefined, [copied]); }, /ORIGINAL/u);
  assert.equal(owner.status().profile, "worker-startup-footprint-forward209");
  const resources = owner.status().forwardResources; assert.ok(resources !== undefined);
  assert.equal(resources.counters.boundGenerations, 1); assert.equal(resources.counters.rendererRequests, 0);
  assert.equal(resources.counters.mainRequests, 0); assert.equal(resources.counters.controls, 0);
  assert.ok(resources.counters.helperStdoutBytes > 0);
  assert.equal(resources.nativeWriterMounted, false); assert.equal(resources.artifactAccountingMounted, false);
  assert.equal(resources.journalAccountingMounted, false); assert.equal(resources.counters.executionAuthorized, false);
  const saved: unknown = Reflect.apply(f.api.startCurrentFootprintCopySavedNativeOwner, undefined, [owner, {}]);
  assert.ok(saved instanceof Promise);
  await assert.rejects(saved, /FOOTPRINT_SAVED_WRITER_KIND_UNMOUNTED/u);
  assert.equal(f.state.writes, 0); await owner.releaseUnlaunched();
  assert.equal(owner.status().forwardResources?.counters.controls, 1);
  assert.equal(owner.status().helperClosed, true); assert.equal(f.child().exitCode, 0);
});

void test("forward ready failures retain original closure evidence without acquiring another factory", async () => {
  const f = await combinedReadyFactoryFixture("wrong-challenge", "forward");
  let failure: unknown;
  try { await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options); } catch (error) { failure = error; }
  assert.ok(failure instanceof Error); assert.equal(f.state.writes, 0);
  assert.equal(f.api.requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure(failure, f.options)?.helperTransportClosed, true);
  assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, f.options), null);
  assert.equal(f.api.requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure(structuredClone(failure), f.options), null);
  assert.equal(f.api.requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure(failure, { ...f.options }), null);
  assert.equal(f.api.currentFootprintCopyForwardFactoryFailureDiagnostics(failure, f.options)?.stdinBytesWritten, 0);
});

void test("the born forward owner selects the exact native cache codec before its original helper write", async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const first = currentFootprintSavedCacheNativeCases()[0]; assert.ok(first !== undefined);
  const frame = Buffer.from(`${JSON.stringify({ id: 1, ...first })}\0`);
  assert.throws(() => diagnosticNativeRequest(frame));
  await owner.syntheticForwardFrameForTest(frame);
  assert.equal(f.state.actions.at(-1), "saved-cache-native");
  assert.equal(owner.status().forwardResources?.counters.rendererRequests, 1);
  const written = f.state.writes;
  const altered = { id: 2, ...first, params: { ...first.params, functionDeclaration: "function(){return true}" } };
  const refusalFrame = Buffer.from(`${JSON.stringify(altered)}\0`);
  await assert.rejects(owner.syntheticForwardFrameForTest(refusalFrame), /WRITE_FAILED/u);
  assert.equal(f.state.writes, written); await owner.releaseUnlaunched();
});

void test("original forward sends, polls and native counter tuples charge before returning synthetic traffic", { timeout: 30_000 }, async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const request = owner.syntheticForwardRequestForTest.bind(owner);
  await request({ action: "send", requestId: 1, method: "Browser.getVersion" });
  const renderer = await request({ action: "poll" }); assert.ok(typeof renderer["bytes"] === "string");
  await request({ action: "main-send", requestId: 1, method: "Runtime.enable" });
  const main = await request({ action: "main-poll", cleanup: false });
  assert.deepEqual(main, { bytes: Buffer.from("{}\0").toString("base64") });
  const counters = owner.status().forwardResources?.counters; assert.ok(counters !== undefined);
  assert.equal(counters.rendererRequests, 1); assert.equal(counters.rendererPolls, 1);
  assert.equal(counters.rendererBytes, Buffer.byteLength(JSON.stringify({ id: 1, result: {} })) + 1);
  assert.equal(counters.mainRequests, 1); assert.equal(counters.mainPolls, 1); assert.equal(counters.mainFrames, 1);
  assert.equal(counters.mainBytes, 4); assert.ok(counters.helperStdoutBytes > 0);
  const written = f.state.writes;
  for (const action of ["footprint-copy-native-create", "footprint-copy-allocated-create-clock-begin", "footprint-copy-clock", "main-completion-begin"]) {
    await assert.rejects(request({ action }), /FORWARD_WRITER_UNMOUNTED/u);
  }
  assert.equal(f.state.writes, written); assert.equal(owner.status().forwardResources?.counters.rendererRequests, 1);
  await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0);
});

void test("normal forward reproof controls stop before the original termination and release reserve", { timeout: 30_000 }, async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const normal = CAPACITY.controls.writer.normal;
  // Fast-forward only the original ledger, then exercise its final admitted
  // Control and refused next send through the actual private owner/child pipe.
  owner.syntheticForwardControlsForTest(normal - 1, 0);
  await owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" });
  const written = f.state.writes;
  await assert.rejects(owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }), /FORWARD_CONTROL_CLEANUP_RESERVE/u);
  assert.equal(f.state.writes, written); assert.equal(owner.status().forwardResources?.cleanupOnly, true);
  assert.equal(owner.status().forwardResources?.counters.controls, normal);
  for (const action of ["window", "main-close-detach", "normal-close", "combined-abort"]) { await owner.syntheticForwardRequestForTest({ action }); }
  // The channel's final original-exit reproof follows the coordinator's samples.
  for (let index = 0; index <= CAPACITY.controls.terminationObservationsPerGeneration; index += 1) { await owner.syntheticForwardRequestForTest({ action: "termination" }); }
  const remaining = CAPACITY.controls.writer.cleanup - 4 - (CAPACITY.controls.terminationObservationsPerGeneration + 1) - 1;
  owner.syntheticForwardControlsForTest(0, remaining);
  assert.equal(owner.status().forwardResources?.counters.controls, CAPACITY.controls.writer.total - 1);
  await owner.releaseUnlaunched(); assert.equal(owner.status().forwardResources?.counters.controls, CAPACITY.controls.writer.total);
  assert.equal(f.child().exitCode, 0);
});

/** Actual channel callbacks retain the original native owner and charge both
 * original reproof exchanges. The inert child supplies no Windows authority. */
void test("forward original channel reproof trace exceeds the former normal-control cutoff", { timeout: 30_000 }, async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 1 });
  const channel = new CurrentFootprintCopyForwardStartupChannel({
    requireOriginalParent: async (): Promise<typeof parent> => {
      await owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" });
      await owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }); return parent;
    },
    assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    observeOriginalParentEvent: (): void => undefined,
    exchange: (request): Promise<unknown> => owner.syntheticForwardRequestForTest({ ...request }),
  }, (): void => undefined);
  const dependency = await channel.start(); const initial = owner.status().forwardResources?.counters.controls; assert.equal(initial, 2);
  for (let index = 0; index < 160; index += 1) { await dependency.assertOriginalOwner(); }
  assert.equal(owner.status().forwardResources?.counters.controls, 322);
  assert.equal(f.state.actions.filter(action => action === "worker-startup-reprove").length, 322);
  const stop = dependency.subscribe((): void => undefined);
  await dependency.request({ method: "Target.setAutoAttach", params: { autoAttach: true, waitForDebuggerOnStart: true, flatten: true, filter: [{ type: "worker", exclude: false }, { exclude: true }] }, sessionId: parent.sessionId });
  assert.equal(owner.status().forwardResources?.counters.rendererRequests, 1);
  assert.ok(f.state.actions.includes("worker-startup-send")); stop(); await channel.releaseAfterTermination();
  await owner.releaseUnlaunched(); assert.equal(owner.status().helperClosed, true);
});

void test("original forward channel reaches each read-only route gate and rejects registration method replacement", async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward");
  const owner = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const channel = new CurrentFootprintCopyForwardStartupChannel({ requireOriginalParent: (): Promise<never> => Promise.reject(new Error("unused")),
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), observeOriginalParentEvent: (): void => undefined,
    exchange: (): Promise<never> => Promise.reject(new Error("unused")) }, (): void => undefined);
  const opening = Object.freeze({}), result = Object.freeze({});
  const invoke = async (method: unknown): Promise<void> => {
    assert.ok(typeof method === "function"); const pending: unknown = Reflect.apply(method, owner, [opening, result]);
    assert.ok(pending instanceof Promise); await pending;
  };
  // Only the synthetic fixture installs prerequisite slots. Actual purpose,
  // Concrete channel class and retained prototype gates remain unchanged.
  owner.syntheticForwardRouteForTest(channel, opening, result);
  await assert.rejects(invoke(owner.observeFootprintCopyUi.bind(owner)), /FOOTPRINT_COPY_UI_SOURCE/u);
  owner.syntheticForwardRouteForTest(channel, opening, result);
  await assert.rejects(invoke(owner.observeFootprintCopyClockRegistration.bind(owner)), /SYNTHETIC_ROUTE_GATE_PASSED/u);
  owner.syntheticForwardRouteForTest(channel, opening, result);
  await assert.rejects(invoke(owner.observeFootprintCopyManagerRoute.bind(owner)), /SYNTHETIC_ROUTE_GATE_PASSED/u);
  Object.defineProperty(CurrentFootprintCopyForwardStartupChannel.prototype, "requestFootprintClockRegistration", {
    configurable: true, value: (): Promise<never> => Promise.reject(new Error("Substituted method must never execute")) });
  try {
    owner.syntheticForwardRouteForTest(channel, opening, result);
    await assert.rejects(invoke(owner.observeFootprintCopyClockRegistration.bind(owner)), /FOOTPRINT_CLOCK_REGISTRATION_UNAVAILABLE/u);
  } finally { Reflect.deleteProperty(CurrentFootprintCopyForwardStartupChannel.prototype, "requestFootprintClockRegistration"); }
  assert.equal(f.state.writes, 0);
});

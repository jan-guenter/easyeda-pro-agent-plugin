/** Actual factory, private registries and transport counters with an explicitly
 * synthetic installation and inert Node child. No Windows ownership is proved. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as CAPACITY } from "../src/current-footprint-copy-forward-capacity.ts";
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
  const normal = CAPACITY.controls.perGeneration - CAPACITY.controls.terminationObservationsPerGeneration -
    CAPACITY.controls.normalCloseAttemptsPerGeneration - CAPACITY.controls.abortAttemptsPerGeneration - 4;
  assert.equal(normal, 266);
  for (let index = 0; index < normal; index += 1) { await owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }); }
  const written = f.state.writes;
  await assert.rejects(owner.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }), /FORWARD_CONTROL_CLEANUP_RESERVE/u);
  assert.equal(f.state.writes, written); assert.equal(owner.status().forwardResources?.cleanupOnly, true);
  assert.equal(owner.status().forwardResources?.counters.controls, normal);
  for (const action of ["window", "main-close-detach", "normal-close", "combined-abort"]) { await owner.syntheticForwardRequestForTest({ action }); }
  // The channel's final original-exit reproof follows the coordinator's samples.
  for (let index = 0; index <= CAPACITY.controls.terminationObservationsPerGeneration; index += 1) { await owner.syntheticForwardRequestForTest({ action: "termination" }); }
  assert.equal(owner.status().forwardResources?.counters.controls, CAPACITY.controls.perGeneration - 1);
  await owner.releaseUnlaunched(); assert.equal(owner.status().forwardResources?.counters.controls, CAPACITY.controls.perGeneration);
  assert.equal(f.child().exitCode, 0);
});

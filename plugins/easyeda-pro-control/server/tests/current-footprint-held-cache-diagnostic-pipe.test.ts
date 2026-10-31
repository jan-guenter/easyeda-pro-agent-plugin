/** Synthetic byte streams only. Dummy script/result objects prove transport
 * boundaries, never pinned UI source, cache state or native ownership. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentFootprintHeldCacheDiagnosticPipe, CurrentPcbDiagnosticPipe, CurrentPcbWorkerStartupDiscoveryPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { combinedDiagnosticNativeRequest, diagnosticNativeRequest, heldCacheDiagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentFootprintSavedCacheHeldNativeCases } from "../src/current-footprint-saved-cache-held-native.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE as PROFILE } from "../src/current-footprint-held-cache-diagnostic-profile.ts";

const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
/** Preserve the real pipe's original write/reply barrier over isolated streams.
 * The native encoder independently decodes every outgoing fixed command. */
function fixture(context: TestContext): Readonly<{
  pipe: CurrentFootprintHeldCacheDiagnosticPipe;
  commands: ReturnType<typeof currentFootprintSavedCacheHeldNativeCases>;
  native: Readonly<Record<string, unknown>>[];
  prefix: () => Promise<void>;
}> {
  const input = new PassThrough(), output = new PassThrough();
  const native: Readonly<Record<string, unknown>>[] = [];
  const commands = currentFootprintSavedCacheHeldNativeCases();
  const capture = commands[0], queue = commands[7];
  assert.ok(capture?.heldCachePhase === "capture" && queue?.heldCachePhase === "queue-first");
  const binding = { sessionId: capture.sessionId, uniqueContextId: capture.params.uniqueContextId,
    projectUuid: queue.params.arguments[0].value, branchUuid: queue.params.arguments[1].value };
  const pipe = new CurrentFootprintHeldCacheDiagnosticPipe(input, output, (): void => undefined);
  output.on("data", (chunk: unknown): void => {
    assert.ok(Buffer.isBuffer(chunk)); const request = heldCacheDiagnosticNativeRequest(chunk); native.push(request);
    let result: Record<string, string> = {};
    if (request["method"] === "Target.attachToTarget") { result = { sessionId: binding.sessionId }; }
    else if (request["method"] === "Debugger.getScriptSource") { result = { scriptSource: "synthetic script; not source admission" }; }
    input.write(wire({ id: request["requestId"], ...(request["sessionId"] === undefined ? {} : { sessionId: request["sessionId"] }), result }));
  });
  context.after(async () => {
    const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners();
  });
  pipe.start();
  const prefix = async (): Promise<void> => {
    await pipe.getVersion(); await pipe.getTargets();
    await pipe.getTargets(); await pipe.attachTarget("original-target", (): void => undefined); await pipe.enablePage();
    await pipe.getFrameTree(); await pipe.getTargets(); await pipe.getFrameTree();
    await pipe.getTargets(); await pipe.getFrameTree(); await pipe.enableRuntime(); await pipe.enableDebugger();
    await pipe.getScriptSource("original-script"); await pipe.getTargets(); await pipe.getFrameTree();
    await pipe.getTargets(); await pipe.getFrameTree(); await pipe.getFrameOwner("original-ancillary"); await pipe.describeFrameOwner(1);
    assert.equal(native.length, PROFILE.discoveryRequests); pipe.bindHeldCache(binding);
  };
  return { pipe, commands, native, prefix };
}

void test("read-only held encoder accepts only fixed discovery or held commands through globalID31", () => {
  assert.equal(PROFILE.discoveryRequests, 19); assert.equal(PROFILE.normalRequestLimit, 30);
  assert.equal(PROFILE.cleanupRequestLimit, 1); assert.equal(PROFILE.requestLimit, 31);
  for (const command of currentFootprintSavedCacheHeldNativeCases()) {
    for (const id of [1, 31]) {
      const raw = wire({ id, ...command }); assert.equal(heldCacheDiagnosticNativeRequest(raw)["requestId"], id);
      for (const encode of [diagnosticNativeRequest, combinedDiagnosticNativeRequest, stringPrecreateNativeRequest]) { assert.throws(() => encode(raw)); }
    }
    for (const changed of [{ id: 32, ...command }, { id: 1, ...command, extra: true },
      { id: 1, ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }]) {
      assert.throws(() => heldCacheDiagnosticNativeRequest(wire(changed)));
    }
    const raw = wire({ id: 1, ...command }); assert.throws(() => heldCacheDiagnosticNativeRequest(Buffer.from(`${raw.subarray(0, -1).toString()} \0`)));
  }
  assert.deepEqual(heldCacheDiagnosticNativeRequest(wire({ id: 31, method: "Browser.getVersion" })), diagnosticNativeRequest(wire({ id: 31, method: "Browser.getVersion" })));
  for (const method of ["Target.setAutoAttach", "Page.captureScreenshot", "Runtime.evaluate", "Runtime.callFunctionOn", "Runtime.getProperties", "Runtime.releaseObjectGroup"]) {
    assert.throws(() => heldCacheDiagnosticNativeRequest(wire({ id: 1, method })));
  }
});

void test("read-only qualification keeps19discovery plus12held commands and exposes no worker/open handoff", async context => {
  const value = fixture(context);
  const capture = value.commands[0]; assert.ok(capture !== undefined);
  await assert.rejects(value.pipe.observeHeldCache(capture), /PURPOSE/u); assert.equal(value.native.length, 0);
  await value.prefix();
  for (const command of value.commands) { await value.pipe.observeHeldCache(command); }
  assert.equal(value.pipe.status().requestCount, 31); assert.equal(value.pipe.status().failure, null);
  assert.deepEqual(value.native.map(request => request["requestId"]), Array.from({ length: 31 }, (_, index) => index + 1));
  await assert.rejects(value.pipe.observeHeldCache(capture)); await assert.rejects(value.pipe.getVersion(), /DISCOVERY_ONLY/u);
  await assert.rejects(value.pipe.enableWorkerDiscovery((): void => undefined), /DISCOVERY_ONLY/u);
  // oxlint-disable-next-line typescript/unbound-method -- Borrow the genuine old method to prove this receiver cannot adopt a startup handoff.
  assert.throws(() => Reflect.apply(CurrentPcbWorkerStartupDiscoveryPipe.prototype.handoff, value.pipe, []), /HANDOFF_UNAVAILABLE/u);
  assert.equal(value.native.length, 31);
});

void test("read-only held phases seal context/tuple/target and permit one early original group cleanup", async context => {
  const value = fixture(context); await value.prefix();
  const capture = value.commands[0], release = value.commands.at(-1); assert.ok(capture?.heldCachePhase === "capture" && release?.heldCachePhase === "release");
  await assert.rejects(value.pipe.observeHeldCache({ ...capture, params: { ...capture.params, uniqueContextId: "foreign" } }), /CONTEXT/u);
  for (const command of value.commands.slice(0, 5)) { await value.pipe.observeHeldCache(command); }
  const recheck = value.commands[5]; assert.ok(recheck?.heldCachePhase === "recheck-before-getter");
  await assert.rejects(value.pipe.observeHeldCache({ ...recheck, params: { ...recheck.params, objectId: "foreign-tuple" } }), /TUPLE/u);
  for (const command of value.commands.slice(5, 7)) { await value.pipe.observeHeldCache(command); }
  const queue = value.commands[7]; assert.ok(queue?.heldCachePhase === "queue-first");
  await assert.rejects(value.pipe.observeHeldCache({ ...queue, params: { ...queue.params,
    arguments: [{ value: "f".repeat(64) }, queue.params.arguments[1]] } }), /TARGET/u);
  await value.pipe.observeHeldCache(release);
  assert.equal(value.native.length, 27); await assert.rejects(value.pipe.observeHeldCache(release));
  const input = new PassThrough(), output = new PassThrough();
  const old = new CurrentPcbDiagnosticPipe(input, output); old.start();
  context.after(async () => {
    const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); old.releaseClosedListeners();
  });
  // oxlint-disable-next-line typescript/unbound-method -- Borrow the new fixed method to prove an old private-field receiver cannot adopt its purpose.
  await assert.rejects(Reflect.apply(CurrentFootprintHeldCacheDiagnosticPipe.prototype.observeHeldCache, old, [capture]), /PURPOSE/u);
  assert.equal(old.status().requestCount, 0);
});

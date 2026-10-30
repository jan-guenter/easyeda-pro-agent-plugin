/** Real discovery byte streams and independently decoded fixed native table.
 * No Windows application, cache getter or CacheStorage method is invoked. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gunzipSync } from "node:zlib";
import { CurrentFootprintCombinedDiscoveryPipe, CurrentPcbWorkerStartupDiscoveryPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { combinedDiagnosticNativeRequest, diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentFootprintSavedCacheAccessorNativeCases, currentFootprintSavedCacheAccessorNativeSource } from "../src/current-footprint-saved-cache-accessor-native.ts";

const wire = (input: unknown): Buffer => Buffer.from(`${JSON.stringify(input)}\0`);
function fixture(context: TestContext, combined = true): Readonly<{
  input: PassThrough; output: PassThrough; pipe: CurrentFootprintCombinedDiscoveryPipe | CurrentPcbWorkerStartupDiscoveryPipe; sent: Buffer[];
}> {
  const input = new PassThrough(), output = new PassThrough(), sent: Buffer[] = [];
  const pipe = combined ? new CurrentFootprintCombinedDiscoveryPipe(input, output) : new CurrentPcbWorkerStartupDiscoveryPipe(input, output);
  output.on("data", (chunk: unknown) => { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); });
  context.after(async () => {
    const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners();
  });
  pipe.start(); return { input, output, pipe, sent };
}
void test("combined probe shares the discovery IDs and clean handoff while old startup purpose refuses its method", async context => {
  const cases = currentFootprintSavedCacheAccessorNativeCases(), first = cases[0]; assert.ok(first !== undefined);
  const value = fixture(context); assert.ok(value.pipe instanceof CurrentFootprintCombinedDiscoveryPipe);
  const attach = value.pipe.attachTarget("original-target", () => { assert.fail("unexpected event"); });
  value.input.write(wire({ id: 1, result: { sessionId: first.sessionId } })); await attach;
  for (const [index, command] of cases.entries()) {
    const id = index + 2, pending = value.pipe.observeSavedCacheAccessor(command);
    const sent = value.sent.at(-1); assert.ok(sent !== undefined);
    assert.deepEqual(combinedDiagnosticNativeRequest(sent), { action: "saved-cache-accessor", requestId: id,
      phase: command.cacheAccessorPhase, method: command.method, sessionId: command.sessionId,
      ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : {}),
      ...("objectId" in command.params ? { objectId: command.params.objectId } : {}) });
    assert.throws(() => diagnosticNativeRequest(sent)); assert.throws(() => stringPrecreateNativeRequest(sent));
    value.input.write(wire({ id, sessionId: command.sessionId, result: {} })); await pending;
  }
  assert.equal(value.pipe.handoff().nextRequestId, 9);
  await assert.rejects(value.pipe.observeSavedCacheAccessor(first)); assert.equal(value.sent.length, 8);
  const old = fixture(context, false);
  // oxlint-disable-next-line typescript/unbound-method -- Deliberately use the genuine new method on an old private-field receiver to prove that it cannot adopt the new purpose.
  await assert.rejects(Reflect.apply(CurrentFootprintCombinedDiscoveryPipe.prototype.observeSavedCacheAccessor, old.pipe, [first]), /SAVED_CACHE_PURPOSE/u);
  assert.equal(old.sent.length, 0); assert.equal(old.pipe.status().requestCount, 0);
});
void test("probe refuses skipped, repeated and foreign-session phases before another original write", async context => {
  const [first, second] = currentFootprintSavedCacheAccessorNativeCases(); assert.ok(first !== undefined && second !== undefined);
  const value = fixture(context); assert.ok(value.pipe instanceof CurrentFootprintCombinedDiscoveryPipe);
  const attach = value.pipe.attachTarget("original-target", () => { assert.fail("unexpected event"); });
  value.input.write(wire({ id: 1, result: { sessionId: first.sessionId } })); await attach;
  await assert.rejects(value.pipe.observeSavedCacheAccessor(second), /SAVED_CACHE_SEQUENCE/u);
  await assert.rejects(value.pipe.observeSavedCacheAccessor({ ...first, sessionId: "foreign" }), /SAVED_CACHE_PURPOSE/u);
  const capture = value.pipe.observeSavedCacheAccessor(first); value.input.write(wire({ id: 2, sessionId: first.sessionId, result: {} })); await capture;
  assert.throws(() => { value.pipe.handoff(); }, /HANDOFF_UNAVAILABLE/u);
  await assert.rejects(value.pipe.observeSavedCacheAccessor(first), /SAVED_CACHE_SEQUENCE/u);
  assert.equal(value.sent.length, 2); assert.equal(value.pipe.status().failure, null);
});
void test("combined native mapping refuses program/effect substitutions and noncanonical bytes without widening old routes", () => {
  const first = currentFootprintSavedCacheAccessorNativeCases()[0]; assert.ok(first !== undefined);
  for (const patch of [{ functionDeclaration: "function(){return true}" }, { throwOnSideEffect: false }, { awaitPromise: true }, { arguments: [{ value: "caller" }] }]) {
    assert.throws(() => combinedDiagnosticNativeRequest(wire({ id: 1, ...first, params: { ...first.params, ...patch } })));
  }
  const raw = wire({ id: 1, ...first });
  assert.throws(() => combinedDiagnosticNativeRequest(Buffer.from(`${raw.subarray(0, -1).toString()} \0`)));
  assert.throws(() => combinedDiagnosticNativeRequest(wire({ id: 104, ...first })));
  assert.equal(combinedDiagnosticNativeRequest(wire({ id: 1, method: "Browser.getVersion" }))["action"], "send");
});
void test("the packed native seven-case table equals the exact TS vocabulary and stays restricted to born combined or forward purposes", async () => {
  const source = currentFootprintSavedCacheAccessorNativeSource();
  const packedCall = /EasyedaDiagnosticOwner\.UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\)/u.exec(source);
  const packed = packedCall?.[1]; assert.ok(packed !== undefined);
  // oxlint-disable-next-line node/no-sync -- Independently decode the one fixed bounded generation table without invoking any native application code.
  const bytes = gunzipSync(Buffer.from(packed, "base64"));
  const cases = currentFootprintSavedCacheAccessorNativeCases(), rows = bytes.toString().split("\0"); assert.equal(rows.length, cases.length);
  assert.equal(packedCall?.[2], String(bytes.length)); assert.ok(bytes.length <= 16_384);
  assert.equal(packedCall?.[3], createHash("sha256").update(bytes).digest("hex"));
  assert.equal(packedCall?.[4], createHash("sha256").update(Buffer.from(packed, "base64")).digest("hex"));
  for (const [index, row] of rows.entries()) {
    const [phase, method, names, template] = row.split("\t"), original = cases[index]; assert.ok(original !== undefined && template !== undefined);
    const { cacheAccessorPhase, ...command } = original;
    assert.equal(phase, cacheAccessorPhase); assert.equal(method, command.method); assert.equal(template, JSON.stringify(command));
    let expected = "sessionId";
    if ("uniqueContextId" in command.params) { expected += ",uniqueContextId"; }
    else if ("objectId" in command.params) { expected += ",objectId"; }
    assert.equal(names, expected);
  }
  const helper = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(helper.includes(source));
  assert.match(helper, /'saved-cache-accessor' \{\s+if \(\(-not \$WorkerStartupFootprintCombined209 -and -not \$WorkerStartupFootprintForward209\)/u);
  assert.ok(helper.includes("saved-cache-accessor-cleanup-required"));
});

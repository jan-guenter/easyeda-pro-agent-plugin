/** Genuine original factory/registries with explicit synthetic source/main
 * collectors and an inert Node child. These tests issue no native writer. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentFootprintCopyForwardNativeOwner, requireCurrentFootprintForwardExecutionInputs } from "../src/current-pcb-diagnostic-owner.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

async function fixture(context: TestContext): Promise<Readonly<{
  source: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;
  owner: Awaited<ReturnType<Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["api"]["startCurrentFootprintCopyForwardNativeOwner"]>>;
  seal: () => Promise<unknown>;
}>> {
  const source = await combinedReadyFactoryFixture("execution-inputs", "forward");
  const owner = await source.api.startCurrentFootprintCopyForwardNativeOwner(source.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(source.child(), "close"); source.child().stdin.end(); await closed; } });
  owner.syntheticForwardExecutionSetupForTest(source.executionInputs.target, source.executionInputs.main);
  return { source, owner, seal: (): Promise<unknown> => {
    const input = source.executionInputs;
    // oxlint-disable-next-line typescript/unbound-method -- Reflect.apply supplies this exact original factory receiver.
    const pending: unknown = Reflect.apply(owner.sealFootprintCopyExecutionSource, owner,
      ["footprint-copy-original-execution-inputs", input.opening, input.result, input.preparation, input.checkpoint, input.runtime]);
    assert.ok(pending instanceof Promise); return pending;
  } };
}
void test("execution inputs reject copied or constructor-only forward owners before reading a token", () => {
  let accessed = false;
  const token = new Proxy({}, { get: (): never => { accessed = true; throw new Error("Must not read token properties"); } });
  for (const owner of [{}, Object.create(CurrentFootprintCopyForwardNativeOwner.prototype), new Proxy({}, {})] as unknown[]) {
    assert.throws(() => Reflect.apply(requireCurrentFootprintForwardExecutionInputs, undefined, [owner, token]));
  }
  assert.equal(accessed, false);
});
void test("native sealing retains the original source, preparation, main runner and birth ledger without a writer upgrade", async context => {
  const f = await fixture(context);
  assert.throws(() => f.owner.issueFootprintForwardExecutionInputOrigin(), /INPUTS_UNSEALED/u);
  await f.seal(); const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
  assert.equal(origin.executionAuthorized, false); assert.equal(Object.isFrozen(origin), true);
  assert.equal(f.owner.issueFootprintForwardExecutionInputOrigin(), origin);
  const bound = f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin);
  assert.equal(bound.owner, f.owner); assert.equal(bound.main, f.source.executionInputs.main);
  assert.equal(bound.opening, f.source.executionInputs.opening); assert.equal(bound.result, f.source.executionInputs.result);
  assert.equal(bound.preparation, f.source.executionInputs.preparation); assert.equal(bound.owned, f.source.executionInputs.owned);
  assert.equal(bound.source, f.owner.originalFootprintSourceBinding()); assert.equal(bound.source.before, bound.owned.before);
  assert.equal(bound.ledgerMethods.generationStatus.call(bound.ledger, "forward-writer", f.owner).rendererRequests, 0);
  assert.throws(() => f.owner.combinedMainCapability(), /COMBINED_MAIN_ORIGINAL/u);
  await assert.rejects(f.owner.syntheticForwardRequestForTest({ action: "footprint-copy-native-create" }), /FORWARD_WRITER_UNMOUNTED/u);
  assert.equal(f.source.state.writes, 0);
});
void test("original input tokens reject cloned descriptors, proxy traps and another genuine factory context", async context => {
  const f = await fixture(context), other = await fixture(context); await f.seal();
  const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
  for (const copied of [{ ...origin }, structuredClone(origin), Object.create(origin)] as unknown[]) {
    assert.throws(() => Reflect.apply(f.source.api.requireCurrentFootprintForwardExecutionInputs, undefined, [f.owner, copied]), /INPUTS_ORIGINAL/u);
  }
  let accessed = false;
  const proxy = new Proxy(origin, { get: (): never => { accessed = true; throw new Error("Must not read proxy"); } });
  assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, proxy), /INPUTS_ORIGINAL/u);
  assert.equal(accessed, false);
  assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(other.owner, origin), /ORIGINAL/u);
  assert.throws(() => Reflect.apply(f.source.api.requireCurrentFootprintForwardExecutionInputs, undefined, [f.owner, origin, "caller-mode"]), /INPUTS_MODE/u);
  assert.equal(f.source.state.writes, 0); assert.equal(other.source.state.writes, 0);
});
for (const mode of ["close", "abort", "cleanup"] as const) {
  void test(`normal original-input access stops at ${mode} while retained custody remains readable`, async context => {
    const f = await fixture(context); await f.seal(); const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
    const before = f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin);
    f.owner.syntheticForwardExecutionTransitionForTest(mode);
    assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin));
    assert.throws(() => f.owner.issueFootprintForwardExecutionInputOrigin());
    const retained = f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin, "retained");
    assert.equal(retained.source, before.source); assert.equal(retained.main, before.main); assert.equal(retained.ledger, before.ledger);
    assert.equal(f.source.state.writes, 0);
  });
}
for (const mode of ["source", "main"] as const) {
  void test(`equal replacement of the original ${mode} cannot resolve an issued input token`, async context => {
    const f = await fixture(context); await f.seal(); const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
    f.owner.syntheticForwardExecutionTransitionForTest(mode);
    assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin, "retained"), /INPUTS_CHANGED/u);
    assert.equal(f.source.state.writes, 0);
  });
}
void test("main identity drift during awaited source sealing consumes the seal without issuing an input origin", async context => {
  const f = await fixture(context); const pending = f.seal();
  f.owner.syntheticForwardExecutionTransitionForTest("main");
  await assert.rejects(pending, /SOURCE_SEAL_DRIFT/u);
  assert.throws(() => f.owner.issueFootprintForwardExecutionInputOrigin(), /INPUTS_UNSEALED/u);
  await assert.rejects(f.seal(), /SOURCE_SEAL_CONSUMED/u); assert.equal(f.source.state.writes, 0);
});
void test("failed original accounting blocks normal access but retains the same cleanup inputs after helper EOF", async context => {
  const f = await fixture(context); await f.seal(); const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
  const bound = f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin);
  assert.throws(() =>{  bound.ledger.consumeRequest("forward-writer", f.owner, "renderer", 2, false); }, /RENDERER_REQUEST/u);
  assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin), /CLEANUP_ONLY/u);
  const closed = once(f.source.child(), "close"); f.source.child().stdin.end(); await closed;
  assert.equal(f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin, "retained").owned, bound.owned);
});
void test("replacing the captured main method invalidates the retained original inputs", async context => {
  const f = await fixture(context); await f.seal(); const origin = f.owner.issueFootprintForwardExecutionInputOrigin();
  Object.defineProperty(f.source.executionInputs.main, "retained", { value: (): object => ({ completed: true }) });
  assert.throws(() => f.source.api.requireCurrentFootprintForwardExecutionInputs(f.owner, origin, "retained"), /INPUTS_CHANGED/u);
  assert.equal(f.source.state.writes, 0);
});

for (const change of [{ completed: false }, { pendingReplies: 1 }, { requestOriginIssued: true }, { releaseAttempted: true }]) {
  void test(`incomplete, pending or already consumed main state refuses input-origin issuance: ${Object.keys(change)[0] ?? "state"}`, async context => {
    const f = await fixture(context);
    const descriptor = Object.getOwnPropertyDescriptor(f.source.executionInputs.main, "retained");
    const method: unknown = descriptor?.value; assert.ok(typeof method === "function");
    const original: unknown = Reflect.apply(method, f.source.executionInputs.main, []);
    assert.ok(original !== null && typeof original === "object");
    Object.defineProperty(f.source.executionInputs.main, "retained", { value: (): object => ({ ...original, ...change }) });
    await f.seal(); assert.throws(() => f.owner.issueFootprintForwardExecutionInputOrigin(), /MAIN_UNAVAILABLE/u);
    assert.equal(f.source.state.writes, 0);
  });
}

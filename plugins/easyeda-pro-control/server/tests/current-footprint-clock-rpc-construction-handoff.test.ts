/** Actual handoff over explicit synthetic retained construction/cache
 * collaborators. Test-only source seeding grants no genuine native lease. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyCreateInvocationBinding, CurrentFootprintCopyCreateInvocationLease } from "../src/current-footprint-copy-create-invocation-lease.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "../src/current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { footprintCopyConstructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

interface TestRunner extends Pick<CurrentFootprintCopyConstructionRunner, "capture" | "whenArmed" | "proveProjectIdentity" | "proveCurrentAssignments" |
  "observeFootprintState" | "observeFootprintRegisteredAsync"> {
  seedClockRpcHandoffForTest: (cache: object, observation: object, unsubscribe: () => void) => CurrentFootprintCopyClockRpcConstructionLease;
  issueCreateInvocationLease: (lease: CurrentFootprintCopyClockRpcConstructionLease) => CurrentFootprintCopyCreateInvocationLease;
  changeCreateHandleForTest: () => void;
  prepareClockRpcObservationHandoff: (lease: CurrentFootprintCopyClockRpcConstructionLease) => Promise<void>;
}
async function retain(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The caller asserts the original operation after its asynchronous arming.
  }
}
async function fixture(valid = true, missingFailureFlag = false, lostRelease = false, context?: TestContext): Promise<Readonly<{
  requireInvocation: (lease: CurrentFootprintCopyCreateInvocationLease) => CurrentFootprintCopyCreateInvocationBinding;
  runner: TestRunner; lease: CurrentFootprintCopyClockRpcConstructionLease; state: { releases: number; cleanups: number; unsubscribed: number; released: boolean };
  requests: () => number;
}>> {
  const url = new URL("../src/current-pcb-worker-construction-runner.ts", import.meta.url);
  const source = await readFile(url, "utf8");
  const seed = `public seedClockRpcHandoffForTest(cache: object, observation: object, unsubscribe: () => void): object {
    if(this.#packet===null){const packet=Object.freeze({profile:this.#profile});this.#packet=packet;issued.set(packet,this);}
    this.#settled=true;this.#unsubscribe=unsubscribe;
    this.#footprintCacheConstruction=cache;this.#footprintCacheConstructionPacket=observation;
    const lease=Object.freeze({profile:"private.current-footprint-clock-rpc-construction-lease.v1"});this.#clockRpcLease=lease;
    Object.assign(this.#identities,{project:"project",channelBus:"bus"});this.#footprintManager="manager";this.#footprintConsistency="consistency";
    this.#footprintConstructors="constructors";this.#footprintCreateMethods="methods";
    clockRpcLeases.set(lease,Object.freeze({issuer:this,assertCleanup:()=>this.#sameTransport(),assertOriginal:async()=>this.#sameTransport()}));return lease;
  }
  public changeCreateHandleForTest(): void { this.#footprintCreateMethods="replacement"; }\n  public status():`;
  const changed = source.replace("public status():", seed); assert.notEqual(changed, source);
  const output = await transform(changed, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]);
  const candidate = loaded.exports["CurrentFootprintCopyConstructionRunner"]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The VM loads the actual class plus the explicit synthetic prerequisite seed above.
  const Constructor = candidate as new (transport: object) => TestRunner;
  const peer = context === undefined ? null : await footprintCopyConstructionInspector(context);
  const transport = peer?.transport ?? Object.freeze({ scriptId: "worker-script", assertOriginalPinnedWorker: (): Promise<void> => Promise.resolve(),
    request: (): Promise<unknown> => { throw new Error("handoff dispatched unexpected construction work"); }, subscribe: (): (() => void) => { throw new Error("handoff unexpectedly requested a new subscription"); } });
  const observation = Object.freeze({ syntheticOriginalCacheObservation: true }), runner = new Constructor(transport);
  if (peer !== null) {
    // Keep genuine private AsyncRunner and packet custody.
    // The historical clock/cache/create prerequisites use the synthetic seed.
    const capture = runner.capture(); void retain(capture); await runner.whenArmed(); const running = peer.run(); void retain(running);
    const packet = await capture; await running;
    await peer.syntheticEvaluate('PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";class bb{};PROJECT.cache=new bb;PROJECT.localCache=new bb;');
    await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
    const state = await runner.observeFootprintState(packet, assignments);
    const registered = await runner.observeFootprintRegisteredAsync(packet, assignments, state);
    assert.equal(registered.trackedQueuesEmptyAtSamples, true);
    assert.equal(registered.originalParserRegistrationArgumentsMatched, true);
  }
  const state = { releases: 0, cleanups: 0, unsubscribed: 0, released: false };
  const cache = Object.freeze({
    retained: () => Object.freeze({ observation, ...(missingFailureFlag ? {} : { failed: false }), released: state.released }),
    diagnostics: () => Object.freeze({ captureComplete: valid, pauseCount: 4, resumedPauses: valid ? 4 : 3 }),
    release: (): Promise<void> => {
      state.releases += 1;
      if (lostRelease) { return Promise.reject(new Error("synthetic lost group release acknowledgement")); }
      state.released = true; return Promise.resolve();
    },
    cleanup: (): Promise<void> => { state.cleanups += 1; throw new Error("normal handoff called failure cleanup"); },
  });
  const lease = runner.seedClockRpcHandoffForTest(cache, observation, (): void => { state.unsubscribed += 1; });
  const getBinding = loaded.exports["requireCurrentFootprintCopyCreateInvocationLease"]; assert.ok(typeof getBinding === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Lookup belongs to the same VM-loaded real issuer registry; only prerequisite state is synthetic.
  const requireInvocation = getBinding as (original: CurrentFootprintCopyCreateInvocationLease) => CurrentFootprintCopyCreateInvocationBinding;
  return { runner, lease, state, requireInvocation, requests: (): number => peer?.commands.length ?? 0 };
}
void test("completed original cache retires its group once and stops construction without failure cleanup", async () => {
  const f = await fixture(); await f.runner.prepareClockRpcObservationHandoff(f.lease);
  assert.deepEqual(f.state, { releases: 1, cleanups: 0, unsubscribed: 1, released: true });
  await assert.rejects(f.runner.prepareClockRpcObservationHandoff(f.lease), /HANDOFF/u);
});
void test("incomplete or missing failure evidence refuses before group release or listener retirement", async () => {
  for (const malformed of [false, true]) {
    const f = await fixture(malformed, malformed);
    await assert.rejects(f.runner.prepareClockRpcObservationHandoff(f.lease), /CACHE_INCOMPLETE/u);
    assert.deepEqual(f.state, { releases: 0, cleanups: 0, unsubscribed: 0, released: false });
  }
});
void test("lost original group-release acknowledgement consumes handoff without replay or listener retirement", async () => {
  const f = await fixture(true, false, true);
  await assert.rejects(f.runner.prepareClockRpcObservationHandoff(f.lease), /lost group/u);
  await assert.rejects(f.runner.prepareClockRpcObservationHandoff(f.lease), /HANDOFF/u);
  assert.deepEqual(f.state, { releases: 1, cleanups: 0, unsubscribed: 0, released: false });
});

void test("original construction issues one immutable invocation lease and consumes it once without new requests", { timeout: 30_000 }, async context => {
  const f = await fixture(true, false, false, context), requests = f.requests();
  const lease = f.runner.issueCreateInvocationLease(f.lease);
  assert.equal(f.runner.issueCreateInvocationLease(f.lease), lease);
  assert.throws(() => f.requireInvocation({ ...lease }), /INVOCATION_LEASE/u);
  const binding = f.requireInvocation(lease); await binding.assertOriginal();
  assert.equal(binding.projectObjectId, "project");
  assert.deepEqual(binding.handles, ["bus", "manager", "consistency", "constructors", "methods"]);
  assert.equal(Object.isFrozen(binding.handles), true);
  assert.equal(binding.prewriteHandles.length, 3); assert.equal(new Set(binding.prewriteHandles).size, 3);
  assert.equal(Object.isFrozen(binding.prewriteHandles), true);
  assert.equal(f.requireInvocation(lease).prewriteHandles, binding.prewriteHandles);
  assert.throws(() => { binding.requireInvocationConsumed(); }, /NOT_CONSUMED/u);
  binding.consumeBeforeInvocation(); binding.requireInvocationConsumed();
  assert.throws(() => { binding.consumeBeforeInvocation(); }, /INVOCATION_CONSUMED/u);
  f.runner.changeCreateHandleForTest();
  assert.throws(() => { binding.assertCleanup(); }, /PREPARATION_CHANGED/u);
  assert.throws(() => { binding.requireInvocationConsumed(); }, /PREPARATION_CHANGED/u);
  assert.throws(() => f.requireInvocation(lease), /PREPARATION_CHANGED/u);
  assert.deepEqual(f.state, { releases: 0, cleanups: 0, unsubscribed: 0, released: false });
  assert.equal(f.requests(), requests);
});

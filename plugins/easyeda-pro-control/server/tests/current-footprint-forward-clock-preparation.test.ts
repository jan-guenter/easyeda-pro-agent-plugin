/** Actual preparation state machine and original transport markers. Source/UI
 * collector values are explicitly synthetic, with no app or clock invocation. */
/* oxlint-disable eslint/max-classes-per-file -- Two distinct synthetic private-field native/opening receivers exercise the original prototype and reference checks. */
/* oxlint-disable import/max-dependencies -- Actual original transport/provider custody and fixed budget are tested alongside explicitly synthetic collector stages. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintForwardClockPreparationOwner, requireOriginalCurrentFootprintForwardClockPreparation } from "../src/current-footprint-forward-clock-preparation.ts";
import { CurrentFootprintCombinedStartupChannel, CurrentFootprintForwardExecutionStartupChannel, beginCurrentFootprintForwardAllocatedClockChannel, prepareCurrentFootprintForwardAllocatedClockChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentFootprintCopyWorkerStartupTransport, requireOriginalForwardClockPreparationTransport } from "../src/current-pcb-worker-startup-transport.ts";
import { forwardMainAuthorityFixture } from "./helpers/forward-main-authority-fixture.ts";
import { CURRENT_FOOTPRINT_FORWARD_CLOCK_PREPARATION_REQUESTS } from "../src/current-footprint-forward-clock-preparation-budget.ts";

async function fixture(failAt: string | null = null, driftAt: string | null = null): Promise<Readonly<{
  owner: CurrentFootprintForwardClockPreparationOwner;
  state: { busy: boolean; current: boolean; calls: string[]; failure: unknown };
  provider: object; read: typeof requireOriginalCurrentFootprintForwardClockPreparation;
}>> {
  const state = { busy: false, current: true, calls: [] as string[], failure: null as unknown };
  const reservation = Object.freeze({ profile: "private.current-footprint-forward-clock-preparation-reservation.v1" });
  const provider = Object.freeze({}); const packets = new Map<string, object>();
  const step = async (name: string): Promise<object> => {
    state.calls.push(name); await Promise.resolve();
    if (failAt === name) { throw new Error(`synthetic ${name} refusal`); }
    if (driftAt === name) { state.current = false; }
    const packet = Object.freeze({ synthetic: name }); packets.set(name, packet); return packet;
  };
  class Opening {
    readonly #step = step;
    public observeFootprintProducers(): Promise<object> { return this.#step("producers"); }
    public observeFootprintDependencies(): Promise<object> { return this.#step("dependencies"); }
    public observeFootprintRegisteredAsync(): Promise<object> { return this.#step("callbacks"); }
    public observeFootprintDestinations(): Promise<object> { return this.#step("destinations"); }
    public async prepareFootprintForwardExecutionClockLeases(): Promise<object> { await this.#step("leases"); return Object.freeze({ workerLease: Object.freeze({}), invocationLease: Object.freeze({}) }); }
  }
  const opening = new Opening();
  const before = Object.freeze({});
  const sourcePlan = Object.freeze({});
  const result = Object.freeze({ construction: { profile: "private.current-footprint-copy-construction.v1" } });
  const sealed = Object.freeze({ opening, result, source: Object.freeze({}), preparation: Object.freeze({}), owned: { before, sourcePlan, copyPlan: Object.freeze({}) }, main: Object.freeze({}) });
  class Native {
    readonly #source = sealed;
    readonly #step = step;
    public originalFootprintForwardExecutionSource(): object { return this.#source; }
    public requireOriginalForwardExecutionMainRunner(main: object, mode: string): void { assert.equal(main, this.#source.main); assert.equal(mode, "normal"); assert.equal(state.current, true, "synthetic original owner drift"); }
    public observeFootprintForwardExecutionClockRegistration(): Promise<object> { return this.#step("registration"); }
    public assertFootprintForwardExecutionClockPreparationCapacity(): void { assert.equal(this.#source.main, sealed.main); assert.equal(CURRENT_FOOTPRINT_FORWARD_CLOCK_PREPARATION_REQUESTS.normal, 242); }
  }
  const native = new Native();
  const input = Object.freeze({ owner: native, source: sealed, result: { synthetic: "published-source" } });
  const source = Object.freeze({ opening, result, before, sourcePlan, assignments: Object.freeze({}), state: Object.freeze({}), source: Object.freeze({}) });
  const path = new URL("../src/current-footprint-forward-clock-preparation.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const actualRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-worker-startup-opening.ts") { return { CurrentFootprintCopyStartupOpening: Opening }; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { CurrentFootprintForwardExecutionNativeOwner: Native, assertOriginalCurrentFootprintForwardExecutionNativeOwner: (value: unknown): void => { assert.equal(value, native); } }; }
    if (name === "./current-footprint-copy-preparation-runtime.ts") { return { requireOriginalCurrentFootprintCopyPreparationSource: async (preparation: unknown, value: unknown): Promise<object> => { assert.equal(preparation, sealed.preparation); assert.equal(value, opening); await step("source"); return source; } }; }
    if (name === "./current-footprint-forward-execution-opening.ts") { return {
      reserveOriginalCurrentFootprintForwardClockPreparation: (value: unknown): object => { assert.equal(value, provider); assert.equal(state.busy, false); state.busy = true; state.calls.push("reserve"); return reservation; },
      finishOriginalCurrentFootprintForwardClockPreparation: (value: unknown, token: unknown, failure: unknown): void => { assert.equal(value, provider); assert.equal(token, reservation); assert.equal(state.busy, true); state.busy = false; state.failure = failure; state.calls.push("finish"); },
      requireCurrentFootprintForwardExecutionOpeningInput: async (value: unknown): Promise<object> => { assert.equal(value, provider); assert.equal(state.busy, true); await step("input"); return input; },
    }; }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact maintained state machine with labelled synthetic native/source collectors; no production origin is issued by these seams.
  const api = loaded.exports as { CurrentFootprintForwardClockPreparationOwner: typeof CurrentFootprintForwardClockPreparationOwner; requireOriginalCurrentFootprintForwardClockPreparation: typeof requireOriginalCurrentFootprintForwardClockPreparation };
  const owner: unknown = Reflect.construct(api.CurrentFootprintForwardClockPreparationOwner, [provider]); assert.ok(owner instanceof api.CurrentFootprintForwardClockPreparationOwner);
  return { owner, provider, state, read: api.requireOriginalCurrentFootprintForwardClockPreparation };
}
void test("cold-v2 preparation retains exact stage references and releases its original provider custody once", async () => {
  const f = await fixture(), token = await f.owner.prepare();
  assert.deepEqual(f.state.calls, ["reserve", "input", "source", "producers", "dependencies", "callbacks", "destinations", "registration", "leases", "finish"]);
  assert.equal(f.state.busy, false); assert.equal(f.state.failure, null); assert.equal(token.nativeCreateRouteIssued, false);
  const bindings: unknown = Reflect.apply(f.read, undefined, [token, f.provider]); assert.ok(bindings !== null && typeof bindings === "object");
  assert.throws(() => Reflect.apply(f.read, undefined, [{ ...token }, f.provider]), /ORIGINAL_TOKEN/u);
  assert.throws(() => Reflect.apply(f.read, undefined, [token, {}]), /ORIGINAL_TOKEN/u);
  await assert.rejects(f.owner.prepare(), /CONSUMED/u); f.state.current = false;
  assert.throws(() => Reflect.apply(f.read, undefined, [token, f.provider]), /owner drift/u);
});
void test("collector refusal and post-reply owner drift preserve consumed partial stages without later collection", async () => {
  for (const drift of [false, true]) {
    const f = await fixture(drift ? null : "dependencies", drift ? "registration" : null);
    await assert.rejects(f.owner.prepare(), drift ? /owner drift/u : /dependencies refusal/u);
    assert.equal(f.state.busy, false); assert.notEqual(f.state.failure, null); assert.equal(f.owner.retained()["failed"], true);
    assert.equal(f.owner.retained()["producersRetained"], true); assert.equal(f.owner.retained()["leasesRetained"], false);
    assert.equal(f.owner.retained()["registrationRetained"], drift); assert.equal(f.state.calls.includes("leases"), false);
    const calls = [...f.state.calls]; await assert.rejects(f.owner.prepare(), /CONSUMED/u); assert.deepEqual(f.state.calls, calls);
  }
});
void test("actual cold-v2 transport registry refuses Combined and copied wrappers without a native exchange", async () => {
  const parent = Object.freeze({ targetId: "synthetic-parent", sessionId: "synthetic-ui", nextRequestId: 1 }); let exchanges = 0;
  const native = Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    observeOriginalParentEvent: (): void => { throw new Error("unexpected synthetic event"); }, exchange: (): Promise<never> => { exchanges += 1; return Promise.reject(new Error("No native exchange admitted")); } });
  const forward = new CurrentFootprintForwardExecutionStartupChannel(native, (): void => undefined);
  const combined = new CurrentFootprintCombinedStartupChannel(native);
  const forwardDependency = await forward.start();
  const combinedDependency = await combined.start();
  try {
    const transport = new CurrentFootprintCopyWorkerStartupTransport(forwardDependency);
    const prior = new CurrentFootprintCopyWorkerStartupTransport(combinedDependency);
    requireOriginalForwardClockPreparationTransport(transport, forwardDependency);
    assert.throws(() => { requireOriginalForwardClockPreparationTransport({}, forwardDependency); }, /FORWARD_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.throws(() => { requireOriginalForwardClockPreparationTransport(prior, combinedDependency); }, /FORWARD_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.throws(() => { requireOriginalForwardClockPreparationTransport(transport, combinedDependency); }, /FORWARD_CLOCK_ORIGINAL_TRANSPORT/u);
    const prepared: unknown = Reflect.apply(prepareCurrentFootprintForwardAllocatedClockChannel, undefined, [combinedDependency, "worker", {}, {}]); assert.ok(prepared instanceof Promise);
    await assert.rejects(prepared, /FORWARD_ALLOCATED_CLOCK_ORIGINAL_CHANNEL/u);
    const begun: unknown = Reflect.apply(beginCurrentFootprintForwardAllocatedClockChannel, undefined, [combinedDependency, {}]); assert.ok(begun instanceof Promise);
    await assert.rejects(begun, /FORWARD_ALLOCATED_CLOCK_ORIGINAL_CHANNEL/u);
    assert.equal(exchanges, 0);
  } finally { await forward.releaseAfterTermination(); await combined.releaseAfterTermination(); }
});
void test("actual original provider reserves pending preparation before await and refuses normal close or reuse", async context => {
  const f = await forwardMainAuthorityFixture(context, "clock-custody"); const reservation = f.provider.reserveClockPreparation();
  assert.equal(f.provider.retained().busy, true); const writes = f.factory.state.writes;
  await assert.rejects(f.provider.close("1"), /CLOSE_UNAVAILABLE/u); assert.throws(() => f.provider.reserveClockPreparation(), /CLOCK_PREPARATION_CONSUMED/u);
  f.provider.finishClockPreparation(reservation, null); assert.equal(f.provider.retained().busy, false);
  assert.throws(() => { f.provider.finishClockPreparation(reservation, null); }, /CLOCK_PREPARATION_ORIGINAL_RESERVATION/u);
  assert.throws(() => f.provider.reserveClockPreparation(), /CLOCK_PREPARATION_CONSUMED/u); assert.equal(f.factory.state.writes, writes);
});

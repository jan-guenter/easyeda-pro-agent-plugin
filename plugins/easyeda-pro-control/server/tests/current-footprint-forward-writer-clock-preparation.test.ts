/** Actual full preparation state machine and original transport markers. Source/UI
 * collector values are explicitly synthetic, with no app or clock invocation. */
/* oxlint-disable eslint/max-classes-per-file -- Two distinct synthetic private-field native/opening receivers exercise the original prototype and reference checks. */
/* oxlint-disable import/max-dependencies -- Actual original transport/provider custody and fixed budget are tested alongside explicitly synthetic collector stages. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintForwardWriterClockPreparationOwner, requireOriginalCurrentFootprintForwardWriterClockPreparation } from "../src/current-footprint-forward-writer-clock-preparation.ts";
import { CurrentFootprintForwardExecutionStartupChannel, CurrentFootprintForwardWriterStartupChannel, isOriginalFootprintForwardExecutionDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentFootprintCopyWorkerStartupTransport, requireOriginalForwardClockPreparationTransport, requireOriginalForwardWriterClockPreparationTransport } from "../src/current-pcb-worker-startup-transport.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_PREPARATION_REQUESTS } from "../src/current-footprint-forward-writer-clock-preparation-budget.ts";
import { CurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

async function fixture(failAt: string | null = null, driftAt: string | null = null,
  publicationFailureAfter: string | null = null, publicationSwapAfter: string | null = null, rawFailure: "null" | "undefined" | null = null): Promise<Readonly<{
  owner: CurrentFootprintForwardWriterClockPreparationOwner;
  state: { busy: boolean; current: boolean; calls: string[]; failure: unknown; operation: unknown; pending: Promise<unknown> | null };
  provider: object; read: typeof requireOriginalCurrentFootprintForwardWriterClockPreparation;
}>> {
  const state = { busy: false, current: true, calls: [] as string[], failure: null as unknown, operation: null as unknown, pending: null as Promise<unknown> | null };
  const reservation = Object.freeze({ profile: "private.current-footprint-forward-writer-clock-preparation-reservation.v1" });
  const provider = Object.freeze({}); const packets = new Map<string, object>();
  const step = async (name: string): Promise<object> => {
    state.calls.push(name); await Promise.resolve();
    if (failAt === name) {
      // oxlint-disable-next-line typescript/only-throw-error -- Preserve original non-Error collector rejections in the labelled inert fixture.
      if (rawFailure !== null) { throw rawFailure === "null" ? null : undefined; }
      throw new Error(`synthetic ${name} refusal`);
    }
    if (driftAt === name) { state.current = false; }
    const packet = Object.freeze({ synthetic: name }); packets.set(name, packet); return packet;
  };
  class Opening {
    readonly #step = step;
    public observeFootprintProducers(): Promise<object> { return this.#step("producers"); }
    public observeFootprintDependencies(): Promise<object> { return this.#step("dependencies"); }
    public observeFootprintRegisteredAsync(): Promise<object> { return this.#step("callbacks"); }
    public observeFootprintDestinations(): Promise<object> { return this.#step("destinations"); }
    public async prepareFootprintForwardWriterClockLeases(): Promise<object> { await this.#step("leases"); return Object.freeze({ workerLease: Object.freeze({}), invocationLease: Object.freeze({}) }); }
  }
  const opening = new Opening();
  const before = Object.freeze({});
  const sourcePlan = Object.freeze({});
  const result = Object.freeze({ construction: { profile: "private.current-footprint-copy-construction.v1" } });
  const sealed = Object.freeze({ opening, result, source: Object.freeze({}), preparation: Object.freeze({}), owned: { before, sourcePlan, copyPlan: Object.freeze({}) }, main: Object.freeze({}) });
  class Native {
    readonly #source = sealed;
    readonly #step = step;
    public originalFootprintForwardWriterSource(): object { return this.#source; }
    public requireOriginalForwardWriterMainRunner(main: object, mode: string): void { assert.equal(main, this.#source.main); assert.equal(mode, "normal"); assert.equal(state.current, true, "synthetic original owner drift"); }
    public observeFootprintForwardWriterClockRegistration(): Promise<object> { return this.#step("registration"); }
    public assertFootprintForwardWriterClockPreparationCapacity(): void { assert.equal(this.#source.main, sealed.main); assert.equal(CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_PREPARATION_REQUESTS.normal, 243); }
  }
  const native = new Native();
  const input = Object.freeze({ owner: native, source: sealed, result: { synthetic: "published-source" } });
  const source = Object.freeze({ opening, result, before, sourcePlan, assignments: Object.freeze({}), state: Object.freeze({}), source: Object.freeze({}) });
  const path = new URL("../src/current-footprint-forward-writer-clock-preparation.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const actualRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-worker-startup-opening.ts") { return { CurrentFootprintCopyStartupOpening: Opening }; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { CurrentFootprintForwardWriterNativeOwner: Native, assertOriginalCurrentFootprintForwardWriterNativeOwner: (value: unknown): void => { assert.equal(value, native); } }; }
    if (name === "./current-footprint-copy-preparation-runtime.ts") { return { requireOriginalCurrentFootprintCopyPreparationSource: async (preparation: unknown, value: unknown): Promise<object> => { assert.equal(preparation, sealed.preparation); assert.equal(value, opening); await step("source"); return source; } }; }
    if (name === "./current-footprint-forward-writer-opening.ts") { return {
      reserveOriginalCurrentFootprintForwardWriterClockPreparation: (value: unknown, operation: unknown): object => {
        assert.equal(value, provider); assert.equal(state.busy, false); assert.ok(operation !== null && typeof operation === "object");
        const read: unknown = loaded.exports["requireOriginalCurrentFootprintForwardWriterClockPreparationOperation"]; assert.ok(typeof read === "function");
        const retained: unknown = Reflect.apply(read, undefined, [operation, provider]); assert.ok(retained !== null && typeof retained === "object");
        const pending: unknown = Reflect.get(retained, "pending"); assert.ok(pending instanceof Promise); state.operation = operation; state.pending = pending;
        assert.throws(() => Reflect.apply(read, undefined, [{ ...operation }, provider]), /ORIGINAL_OPERATION/u);
        assert.throws(() => Reflect.apply(read, undefined, [operation, {}]), /ORIGINAL_OPERATION/u);
        state.busy = true; state.calls.push("reserve"); return reservation;
      },
      finishOriginalCurrentFootprintForwardWriterClockPreparation: (value: unknown, token: unknown, outcome: Readonly<{ failed: false }> | Readonly<{ failed: true; cause: unknown }>): void => { assert.equal(value, provider); assert.equal(token, reservation); assert.equal(state.busy, true); state.busy = false; state.failure = outcome.failed ? outcome.cause : null; state.calls.push("finish"); },
      requireCurrentFootprintForwardWriterOpeningInput: async (value: unknown): Promise<object> => {
        assert.equal(value, provider); assert.equal(state.busy, true);
        const preceding = state.calls.at(-1); await step("input");
        if (preceding === publicationFailureAfter) { throw new Error("synthetic published journal drift"); }
        if (preceding === publicationSwapAfter) { return { ...input, result: { ...input.result } }; }
        return input;
      },
    }; }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact maintained state machine with labelled synthetic native/source collectors; no production origin is issued by these seams.
  const api = loaded.exports as { CurrentFootprintForwardWriterClockPreparationOwner: typeof CurrentFootprintForwardWriterClockPreparationOwner; requireOriginalCurrentFootprintForwardWriterClockPreparation: typeof requireOriginalCurrentFootprintForwardWriterClockPreparation };
  const owner: unknown = Reflect.construct(api.CurrentFootprintForwardWriterClockPreparationOwner, [provider]); assert.ok(owner instanceof api.CurrentFootprintForwardWriterClockPreparationOwner);
  return { owner, provider, state, read: api.requireOriginalCurrentFootprintForwardWriterClockPreparation };
}
void test("full-writer preparation retains exact stage references and releases its original provider custody once", async () => {
  const f = await fixture(), pending = f.owner.prepare(); assert.equal(f.state.pending, pending); const token = await pending;
  assert.deepEqual(f.state.calls, ["reserve", "input", "source", "input", "producers", "input", "dependencies", "input", "callbacks", "input", "destinations", "input", "registration", "input", "leases", "input", "finish"]);
  assert.equal(f.state.busy, false); assert.equal(f.state.failure, null); assert.equal(token.nativeCreateRouteIssued, false);
  const bindings: unknown = Reflect.apply(f.read, undefined, [token, f.provider]); assert.ok(bindings !== null && typeof bindings === "object");
  assert.throws(() => Reflect.apply(f.read, undefined, [{ ...token }, f.provider]), /ORIGINAL_TOKEN/u);
  assert.throws(() => Reflect.apply(f.read, undefined, [token, {}]), /ORIGINAL_TOKEN/u);
  await assert.rejects(f.owner.prepare(), /CONSUMED/u); f.state.current = false;
  assert.throws(() => Reflect.apply(f.read, undefined, [token, f.provider]), /owner drift/u);
});
void test("fresh publication loss after each collector consumes preparation before any later collection", async () => {
  const stages = ["source", "producers", "dependencies", "callbacks", "destinations", "registration", "leases"];
  for (const [index, stage] of stages.entries()) {
    for (const swapped of [false, true]) {
      const f = await fixture(null, null, swapped ? null : stage, swapped ? stage : null);
      await assert.rejects(f.owner.prepare(), swapped ? /ORIGINAL_PUBLISHED_INPUT/u : /published journal drift/u);
      assert.equal(f.state.busy, false); assert.notEqual(f.state.failure, null);
      assert.deepEqual(f.state.calls.filter(call => stages.includes(call)), stages.slice(0, index + 1));
      assert.equal(f.owner.retained()["failed"], true); assert.equal(f.owner.retained()["result"], null);
      const calls = [...f.state.calls]; await assert.rejects(f.owner.prepare(), /CONSUMED/u); assert.deepEqual(f.state.calls, calls);
    }
  }
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
void test("null and undefined original collector rejections remain sticky and reach the full provider outcome", async () => {
  for (const raw of ["null", "undefined"] as const) {
    const expected = raw === "null" ? null : undefined, f = await fixture("dependencies", null, null, null, raw);
    await assert.rejects(f.owner.prepare(), (error: unknown) => error === expected);
    assert.equal(f.state.failure, expected); assert.equal(f.state.busy, false); assert.equal(f.owner.retained()["failed"], true);
    assert.equal(f.state.calls.includes("callbacks"), false); const calls = [...f.state.calls];
    await assert.rejects(f.owner.prepare(), /CONSUMED/u); assert.deepEqual(f.state.calls, calls);
  }
});
void test("actual full transport has its own lease marker and cannot acquire the historical v2 join", async () => {
  const parent = Object.freeze({ targetId: "synthetic-parent", sessionId: "synthetic-ui", nextRequestId: 1 }); let exchanges = 0;
  const native = Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    observeOriginalParentEvent: (): void => { throw new Error("unexpected synthetic event"); }, exchange: (): Promise<never> => { exchanges += 1; return Promise.reject(new Error("No native exchange admitted")); } });
  const full = new CurrentFootprintForwardWriterStartupChannel(native, (): void => { throw new Error("unexpected event"); },
    { receivedBytes: 0, eventCount: 0, eventBytes: 0 }, (): Promise<never> => Promise.reject(new Error("No bootstrap admitted")));
  const old = new CurrentFootprintForwardExecutionStartupChannel(native, (): void => { throw new Error("unexpected event"); });
  const fullDependency = await full.start(), oldDependency = await old.start();
  try {
    const historical = new CurrentFootprintCopyWorkerStartupTransport(oldDependency), transport = new CurrentFootprintCopyWorkerStartupTransport(fullDependency);
    requireOriginalForwardWriterClockPreparationTransport(transport, fullDependency); requireOriginalForwardClockPreparationTransport(historical, oldDependency);
    assert.equal(isOriginalFootprintForwardExecutionDependency(fullDependency), false);
    assert.throws(() => { requireOriginalForwardClockPreparationTransport(transport, fullDependency); }, /FORWARD_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.throws(() => { requireOriginalForwardWriterClockPreparationTransport(historical, oldDependency); }, /FORWARD_WRITER_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.throws(() => { requireOriginalForwardWriterClockPreparationTransport({}, fullDependency); }, /FORWARD_WRITER_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.throws(() => { requireOriginalForwardWriterClockPreparationTransport(transport, { ...fullDependency }); }, /FORWARD_WRITER_CLOCK_ORIGINAL_TRANSPORT/u);
    assert.equal(exchanges, 0);
  } finally { await full.releaseAfterTermination(); await old.releaseAfterTermination(); }
});
void test("copied full owner prototypes cannot reach source, Main or clock preparation before original birth", async () => {
  const copied: unknown = Object.create(CurrentFootprintForwardWriterNativeOwner.prototype);
  for (const method of ["originalFootprintForwardWriterSource", "assertFootprintForwardWriterSourceCapacity", "assertFootprintForwardWriterClockPreparationCapacity", "requireOriginalForwardWriterMainRunner"] as const) {
    const call: unknown = Reflect.get(CurrentFootprintForwardWriterNativeOwner.prototype, method); assert.ok(typeof call === "function");
    assert.throws(() => Reflect.apply(call, copied, [{}, "normal"]), /FORWARD_WRITER_ORIGINAL_BIRTH|Receiver must be an instance/u);
  }
  for (const method of ["sealFootprintForwardWriterSource", "observeFootprintForwardWriterClockRegistration"] as const) {
    const call: unknown = Reflect.get(CurrentFootprintForwardWriterNativeOwner.prototype, method); assert.ok(typeof call === "function");
    const pending: unknown = Reflect.apply(call, copied, ["footprint-forward-writer-synthetic", {}, {}, {}, {}, {}]);
    assert.ok(pending instanceof Promise); await assert.rejects(pending, /FORWARD_WRITER_ORIGINAL_BIRTH/u);
  }
});
void test("the actual full channel ends original pending metadata only after its retained root and Job exit guard", async () => {
  const parent = Object.freeze({ targetId: "synthetic-parent", sessionId: "synthetic-ui", nextRequestId: 1 }), written = Promise.withResolvers<null>();
  let exited = false, requests = 0;
  const native = Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => exited ? Promise.resolve() : Promise.reject(new Error("synthetic-original-job-still-running")),
    observeOriginalParentEvent: (): void => { throw new Error("unexpected synthetic event"); }, exchange: (request: Readonly<Record<string, string | number>>): Promise<unknown> => {
      if (request["action"] === "poll") { return Promise.resolve({ bytes: "" }); } requests += 1; written.resolve(null); return Promise.resolve({ written: true });
    } });
  const full = new CurrentFootprintForwardWriterStartupChannel(native, (): void => { throw new Error("unexpected event"); },
    { receivedBytes: 0, eventCount: 0, eventBytes: 0 }, (): Promise<never> => Promise.reject(new Error("No bootstrap admitted")));
  const dependency = await full.start(); const pending = dependency.request({ method: "Target.getTargets", params: {} });
  let originalFailure: unknown, settled = false;
  const joined = (async (): Promise<void> => { try { await pending; } catch (error) { originalFailure = error; } finally { settled = true; } })();
  await written.promise; assert.equal(full.status().pendingReplies, 1);
  await assert.rejects(dependency.assertOriginalTermination(), /original-job-still-running/u); assert.equal(settled, false); assert.equal(full.status().pendingReplies, 1);
  exited = true; await dependency.assertOriginalTermination(); await joined; assert.equal(settled, true);
  assert.ok(originalFailure instanceof Error); assert.match(originalFailure.message, /TERMINATED/u); assert.equal(full.status().pendingReplies, 0); assert.equal(requests, 1);
  await full.releaseAfterTermination(); assert.equal(requests, 1);
});

/** Real v2 sequencer, explicit synthetic native/source collectors. This
 * isolates the terminal cursor handoff; it grants no real create or clock. */
/* oxlint-disable eslint/max-classes-per-file -- Separate synthetic collectors preserve distinct original main, clock, allocation and completion states. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintForwardExecutionPairedScheduler } from "../src/current-footprint-forward-paired-scheduler.ts";

void test("v2 joins its original create through retained custody after actual main release without reviving normal admission", async () => {
  const calls: string[] = [];
  const capability = Object.freeze({});
  const mainOrigin = Object.freeze({});
  const completionOrigin = Object.freeze({});
  const copy = Object.freeze({});
  const reservation = Object.freeze({});
  const clockOrigin = Object.freeze({});
  const workerLease = Object.freeze({});
  const pending = Object.freeze({});
  const clocks = Object.freeze({});
  const mainPacket = Object.freeze({}); let ended = false, retainedChecks = 0;
  class Backend {
    #released = false;
    public requireForwardExecutionRequestOrigin(cap: unknown, origin: unknown): void { assert.equal(cap, capability); assert.equal(origin, mainOrigin); assert.equal(this.#released, false); }
    public issueForwardExecutionCompletionOrigin(cap: unknown): Promise<object> { assert.equal(cap, capability); assert.equal(this.#released, false); calls.push("completion-origin"); return Promise.resolve(completionOrigin); }
    public release(): Promise<void> { assert.equal(this.#released, false); this.#released = true; calls.push("main-release"); return Promise.resolve(); }
    public released(): boolean { return this.#released; }
  }
  class Main {
    readonly #calls = calls;
    public armForCompletion(): Promise<void> { this.#calls.push("main-arm"); return Promise.resolve(); }
    public consumeBeforeInvocation(): void { this.#calls.push("main-consume"); }
    public bindObservedClocks(): Promise<void> { this.#calls.push("main-bind-clocks"); return Promise.resolve(); }
    public collectToHeldFinalPb(): Promise<object> { this.#calls.push("main-held"); return Promise.resolve(Object.freeze({})); }
  }
  class Completion {
    #retired = false;
    public arm(): Promise<void> { assert.equal(this.#retired, false); calls.push("completion-arm"); return Promise.resolve(); }
    public collect(): Promise<object> { assert.equal(this.#retired, false); calls.push("completion-collect"); return Promise.resolve(mainPacket); }
    public requireOriginal(packet: unknown): Promise<void> { assert.equal(this.#retired, false); assert.equal(packet, mainPacket); return Promise.resolve(); }
    public cleanup(): Promise<void> { this.#retired = true; calls.push("completion-cleanup"); return Promise.resolve(); }
    public diagnostics(): Readonly<{ retired: boolean }> { return { retired: this.#retired }; }
  }
  class Clock {
    #retired = false;
    public arm(): Promise<void> { assert.equal(this.#retired, false); calls.push("clock-arm"); return Promise.resolve(); }
    public consumeBeforeInvocation(): void { assert.equal(this.#retired, false); calls.push("clock-consume"); }
    public collect(): Promise<object> { assert.equal(this.#retired, false); calls.push("clock-collect"); return Promise.resolve(clocks); }
    public requireOriginal(packet: unknown): Promise<void> { assert.equal(this.#retired, false); assert.equal(packet, clocks); return Promise.resolve(); }
    public cleanup(): Promise<void> { this.#retired = true; calls.push("clock-cleanup"); return Promise.resolve(); }
    public diagnostics(): Readonly<{ retired: boolean }> { return { retired: this.#retired }; }
  }
  class Allocation {
    #phase = "ready";
    public arm(): Promise<void> { this.#phase = "armed"; calls.push("allocation-arm"); return Promise.resolve(); }
    public consumeBeforeInvocation(): void { assert.equal(this.#phase, "armed"); calls.push("allocation-consume"); }
    public collectAndResume(): Promise<void> { this.#phase = "resumed"; calls.push("allocation-collect"); return Promise.resolve(); }
    public release(): Promise<void> { this.#phase = "released"; calls.push("allocation-release"); return Promise.resolve(); }
    public diagnostics(): Readonly<{ phase: string }> { return { phase: this.#phase }; }
  }
  const backend = new Backend();
  const nativeOwner = Object.freeze({ requireOriginalForwardExecutionMainRunner: (value: unknown, mode: unknown): boolean => { assert.equal(value, backend); assert.equal(mode, "exited"); return ended; } });
  const allocation = new Allocation();
  const route = Object.freeze({ dispatchCreate: (): Promise<object> => { calls.push("create"); return Promise.resolve(pending); },
    joinCreate: (value: unknown): Promise<string> => { assert.equal(value, pending); calls.push("create-join"); return Promise.resolve("synthetic-original-create"); }, fail: (): void => { calls.push("fail"); } });
  const binding = Object.freeze({ clockLease: workerLease, workerSessionId: "original-worker", copyPlan: copy, invocationBinding: Object.freeze({}) });
  const overrides: Readonly<Record<string, unknown>> = {
    "./current-footprint-copy-main-backend-runner.ts": { CurrentFootprintCopyMainBackendRunner: Backend },
    "./current-footprint-copy-main-request-runner.ts": { createCurrentFootprintForwardMainRequestRunner: (origin: unknown, plan: unknown): Main => { assert.equal(origin, mainOrigin); assert.equal(plan, reservation); return new Main(); } },
    "./current-footprint-copy-main-completion-runner.ts": { createCurrentFootprintForwardMainCompletionRunner: (origin: unknown): Completion => { assert.equal(origin, completionOrigin); return new Completion(); } },
    "./current-footprint-forward-execution-main-origin.ts": {},
    "./current-footprint-copy-clock-rpc-runner.ts": { CurrentFootprintCopyClockRpcRunner: Clock },
    "./current-footprint-copy-clock-rpc-origin.ts": { requireCurrentFootprintCopyClockRpcOrigin: (value: unknown): object => { assert.equal(value, clockOrigin); return { workerLease, workerSessionId: "original-worker" }; } },
    "./current-footprint-copy-allocation-runner.ts": { CurrentFootprintCopyAllocationRunner: Allocation,
      requireCurrentFootprintCopyAllocationOrigin: (value: unknown, origin: unknown): void => { assert.equal(value, allocation); assert.equal(origin, clockOrigin); },
      requireCurrentFootprintCopyAllocationCopyPlan: (value: unknown, origin: unknown, plan: unknown, invocation: unknown): void => { assert.equal(value, allocation); assert.equal(origin, clockOrigin); assert.equal(plan, copy); assert.equal(invocation, binding.invocationBinding); } },
    "./current-pcb-worker-startup-channel.ts": { requireCurrentFootprintCopyCreateClockChannelRoute: (value: unknown): object => { assert.equal(value, route); return binding; } },
    "./current-footprint-forward-execution-main-capability.ts": {
      requireCurrentFootprintForwardExecutionMainNativeOwner: (cap: unknown, value: unknown, mode: unknown): object => { assert.equal(cap, capability); assert.equal(value, backend); assert.equal(mode, "exited"); return nativeOwner; },
      requireCurrentFootprintForwardExecutionPairedCopy: (): object => copy,
      requireCurrentFootprintForwardExecutionPairedSchedule: (): void => { assert.equal(backend.released(), false, "released main cannot regain normal admission"); },
      requireRetainedCurrentFootprintForwardPairedSchedule: (): void => { assert.equal(backend.released(), true); retainedChecks += 1; },
    },
    "./current-footprint-copy-main-request-plan.ts": { isCurrentFootprintCopyMainRequestReservation: (value: unknown): boolean => value === reservation,
      requireOriginalCurrentFootprintCopyMainRequestReservationCopy: (): object => copy,
      requireCurrentFootprintCopyMainRequestReservationCopy: (value: unknown, plan: unknown): void => { assert.equal(value, reservation); assert.equal(plan, copy); } },
  };
  const path = new URL("../src/current-footprint-forward-paired-scheduler.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const actualRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(overrides, name) ? overrides[name] : actualRequire(name) as unknown, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual private-field sequencer with explicit synthetic collector boundaries above; no genuine origin or writer authority is fabricated.
  const api = loaded.exports as { CurrentFootprintForwardExecutionPairedScheduler: typeof CurrentFootprintForwardExecutionPairedScheduler };
  const candidate: unknown = Reflect.construct(api.CurrentFootprintForwardExecutionPairedScheduler, [backend, capability, mainOrigin, reservation]); assert.ok(candidate instanceof api.CurrentFootprintForwardExecutionPairedScheduler);
  const scheduler = candidate; await scheduler.armMain();
  // oxlint-disable-next-line typescript/unbound-method -- Supply the labelled synthetic originals to the actual retained sequencer receiver.
  Reflect.apply(scheduler.bindClocks, scheduler, [clockOrigin, route, allocation]); await scheduler.armClocks();
  // oxlint-disable-next-line typescript/unbound-method -- Same actual receiver and explicitly synthetic plan boundary.
  Reflect.apply(scheduler.requireExecutionReady, scheduler, [copy, 1, 2]);
  await scheduler.dispatchCreate(); await scheduler.collectClocks(); await scheduler.collectMain();
  assert.equal(backend.released(), true); const packet = await scheduler.joinCreate(); scheduler.requireOriginalResult(packet); scheduler.requireQuiescentClose();
  assert.equal(packet.profile, "private.current-footprint-forward-paired-observation.v2"); assert.equal(packet.executionAuthorized, false); assert.equal(packet.fullQualificationVerified, false);
  assert.ok(retainedChecks >= 2); assert.ok(calls.indexOf("clock-cleanup") < calls.indexOf("main-held")); assert.ok(calls.indexOf("main-release") < calls.indexOf("create-join"));
  assert.throws(() => { scheduler.requireOriginalResult(structuredClone(packet)); }, /ORIGINAL_RESULT/u); await assert.rejects(scheduler.dispatchCreate(), /PHASE/u);
  const requireSaved = loaded.exports["requireOriginalCurrentFootprintForwardSavedContinuation"]; assert.ok(typeof requireSaved === "function");
  assert.throws(() => Reflect.apply(requireSaved, undefined, [packet, nativeOwner]), /CLOSED_SAVED_CONTINUATION/u);
  ended = true;
  const historical: unknown = Reflect.apply(requireSaved, undefined, [packet, nativeOwner]); assert.ok(historical !== null && typeof historical === "object");
  assert.equal(Reflect.get(historical, "copyPlan"), copy); assert.equal(Reflect.get(historical, "paired"), packet);
  assert.throws(() => Reflect.apply(requireSaved, undefined, [{ ...packet }, nativeOwner]), /CLOSED_SAVED_CONTINUATION/u);
  assert.throws(() => Reflect.apply(requireSaved, undefined, [packet, {}]), /CLOSED_SAVED_CONTINUATION/u);
  Reflect.set(scheduler, "requireOriginalSavedContinuation", (): never => { throw new Error("substituted own getter"); });
  Reflect.set(scheduler, "requireOriginalResult", (): never => { throw new Error("substituted own check"); });
  const retained: unknown = Reflect.apply(requireSaved, undefined, [packet, nativeOwner]); assert.ok(retained !== null && typeof retained === "object");
  assert.equal(Reflect.get(retained, "paired"), packet);
});

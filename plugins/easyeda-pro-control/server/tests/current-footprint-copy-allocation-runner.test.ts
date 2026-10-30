/** Actual collector over explicitly synthetic original-issuer hooks. Equal
 * JSON does not pass the production issuer, and no native owner is created. */
/* oxlint-disable import/max-dependencies -- Test the real bounded collector/grammar with explicit synthetic origin and construction issuers. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyAllocationRunner } from "../src/current-footprint-copy-allocation-runner.ts";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES as FRAMES, CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE as SITE,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE as WRAPPER, CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SITE as WSITE,
  validateCurrentFootprintCopyAllocationCommand } from "../src/current-footprint-copy-allocation-contract.ts";
import type { CurrentFootprintCopyClockRpcOriginBindings, CurrentFootprintCopyClockRpcOriginEvent } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyCreateInvocationBinding } from "../src/current-footprint-copy-create-invocation-lease.ts";
import type { CurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { requireCurrentFootprintCopyCreateInvocationLease } from "../src/current-footprint-copy-create-invocation-lease.ts";
import { allocationVmFixture } from "./helpers/footprint-copy-allocation-fixture.ts";

async function fixture(): Promise<Readonly<{ runner: CurrentFootprintCopyAllocationRunner; state: { consumed: boolean; changed: boolean; exited: boolean; lost: string | null; badSource: boolean; failures: number };
  events: CurrentFootprintCopyClockRpcOriginEvent[]; commands: string[]; start: () => void; remainingClock: CurrentFootprintCopyClockRpcOriginEvent;
  plan: CurrentFootprintCopyV2Plan; binding: CurrentFootprintCopyCreateInvocationBinding; origin: CurrentFootprintCopyClockRpcOriginBindings;
  requireCopy: (plan: CurrentFootprintCopyV2Plan, binding: CurrentFootprintCopyCreateInvocationBinding) => void; destination: () => Promise<unknown> }>> {
  const context = allocationVmFixture(); const object = (name: string): unknown => runInContext(name, context) as unknown;
  const token = Object.freeze({ profile: "private.current-footprint-clock-rpc-origin.v1" as const });
  const lease = Object.freeze({ profile: "private.current-footprint-copy-create-invocation-lease.v1" as const });
  const clockLease = Object.freeze({ profile: "private.current-footprint-clock-rpc-construction-lease.v1" as const });
  const issuer = {}; const state = { consumed: false, changed: false, exited: false, lost: null as string | null, badSource: false, failures: 0 };
  const same = (): void => { assert.equal(state.changed, false, "original changed"); };
  const construction = { issuer, scriptId: "worker-script", projectObjectId: "PROJECT", managerObjectId: "manager", assertCleanup: same };
  const binding: CurrentFootprintCopyCreateInvocationBinding = { issuer, clockLease, projectObjectId: "PROJECT", handles: ["bus", "manager", "consistency", "constructors", "methods"],
    prewriteHandles: Object.freeze(["prewrite-scope", "prewrite-original", "prewrite-upload"]),
    assertOriginal: async (): Promise<void> => { await Promise.resolve(); same(); }, assertCleanup: same, consumeBeforeInvocation: (): void => { assert.equal(state.consumed, false); state.consumed = true; },
    requireInvocationConsumed: (): void => { same(); assert.equal(state.consumed, true, "original invocation not consumed"); } };
  const commands: string[] = [], events: CurrentFootprintCopyClockRpcOriginEvent[] = []; const values = new Map<string, unknown>();
  const capture = (id: string, value: unknown): unknown => {
    assert.ok(Array.isArray(value)); values.set(id, value); return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(value.length)})`, objectId: id } };
  };
  const remainingClock: CurrentFootprintCopyClockRpcOriginEvent = { method: "Debugger.paused", sessionId: "worker", params: { untouchedClockPause: true } };
  const origin: CurrentFootprintCopyClockRpcOriginBindings = { workerLease: clockLease, registrationLease: { profile: "private.current-footprint-clock-rpc-registration-lease.v1" }, workerSessionId: "worker",
    assertOriginal: async (): Promise<void> => { await Promise.resolve(); same(); }, assertCleanup: async (): Promise<void> => { await Promise.resolve(); same(); },
    assertOriginalGenerationExited: async (): Promise<void> => { await Promise.resolve(); assert.equal(state.exited, true, "original exit not observed"); }, fail: (): void => { state.failures += 1; }, retire: (): Promise<void> => Promise.reject(new Error("allocation cannot retire clock owner")),
    takeEvent: (): CurrentFootprintCopyClockRpcOriginEvent | null => events.shift() ?? null, pump: (): Promise<void> => Promise.resolve(),
    request: async command => {
      await Promise.resolve();
      const value = validateCurrentFootprintCopyAllocationCommand(command); commands.push(value.phase);
      if (value.phase === "allocation-resume") { events.push({ method: "Debugger.resumed", sessionId: "worker", params: {} }, remainingClock); }
      if (state.lost === value.phase) { throw new Error("lost acknowledgement"); }
      switch (value.phase) {
        case "allocation-arm": { return { breakpointId: "allocation-point", actualLocation: { scriptId: "worker-script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } }; }
        case "allocation-frame": {
          let name = "wrapper"; if (value.params.expression === FRAMES.build) { name = "build"; } else if (value.params.expression === FRAMES.create) { name = "create"; } return capture(name, object(name));
        }
        case "allocation-source": { return { scriptSource: state.badSource ? `${WRAPPER} ` : WRAPPER }; }
        case "allocation-join": {
          const callable: unknown = runInContext(`(${value.params.functionDeclaration})`, context); assert.ok(typeof callable === "function");
          const args = value.params.arguments.map(entry => values.get(entry.objectId) ?? object(entry.objectId));
          return capture("joined", Reflect.apply(callable, object("PROJECT"), args));
        }
        case "allocation-properties": {
          const entries = values.get(value.params.objectId); assert.ok(Array.isArray(entries));
          return { result: [...entries.map((entry: unknown, index: number) => ({ name: String(index), value: { type: "string", value: entry }, writable: true, enumerable: true, configurable: true, isOwn: true })),
            { name: "length", value: { type: "number", value: entries.length }, writable: true, enumerable: false, configurable: false, isOwn: true }],
            internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
        }
        case "allocation-release":
        case "allocation-remove":
        case "allocation-resume": { return {}; }
        default: { throw new Error("unsupported synthetic allocation phase"); }
      }
    } };
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, url = new URL("../src/current-footprint-copy-allocation-runner.ts", import.meta.url);
  const actualRequire = createRequire(url); const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-create-invocation-lease.ts") { return { requireCurrentFootprintCopyCreateInvocationLease: (value: unknown): typeof binding => { assert.equal(value, lease); same(); return binding; } }; }
    if (name === "./current-footprint-copy-clock-rpc-origin.ts") { return { requireCurrentFootprintCopyClockRpcOrigin: (value: unknown): typeof origin => { assert.equal(value, token); same(); return origin; } }; }
    if (name === "./current-pcb-worker-construction-runner.ts") { return { requireCurrentFootprintCopyClockRpcConstructionLease: (value: unknown): typeof construction => { assert.equal(value, clockLease); same(); return construction; } }; }
    if (name === "./current-footprint-copy-v2-native-arguments.ts") { return { currentFootprintCopyV2NativeCreateArguments: (): unknown => ({ createArgument: object("argument") }) }; }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const constructor = loaded.exports["CurrentFootprintCopyAllocationRunner"]; assert.ok(typeof constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real class runs with labeled synthetic issuers; this cast grants no production capability.
  const Constructor = constructor as typeof CurrentFootprintCopyAllocationRunner;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicitly substituted pure-plan reader sees this synthetic source identity.
  const plan = { source: { footprintUuid: "a".repeat(16) } } as CurrentFootprintCopyV2Plan;
  const runner = new Constructor(token, lease, plan); const destination = loaded.exports["requireCurrentFootprintCopyAllocatedDestination"]; assert.ok(typeof destination === "function");
  assert.throws(() => requireCurrentFootprintCopyCreateInvocationLease(lease));
  return { runner, state, events, commands, remainingClock, plan, binding, origin,
    requireCopy: (copy, originalBinding): void => { runner.requireForCopyPlan(token, copy, originalBinding); },
    destination: async (): Promise<unknown> => await Reflect.apply(destination, undefined, [runner, token]), start: (): void => {
    runner.consumeBeforeInvocation(); binding.consumeBeforeInvocation();
    events.push({ method: "Debugger.paused", sessionId: "worker", params: { reason: "other", hitBreakpoints: ["allocation-point"], callFrames: [
      { callFrameId: "build", functionName: "buildString", functionLocation: { scriptId: "worker-script", lineNumber: SITE.functionLine, columnNumber: SITE.functionColumn }, location: { scriptId: "worker-script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } },
      { callFrameId: "create", functionName: "create", functionLocation: { scriptId: "worker-script", lineNumber: SITE.createLine, columnNumber: SITE.createColumn }, location: { scriptId: "worker-script", lineNumber: SITE.createLine, columnNumber: SITE.createCallColumn } },
      { callFrameId: "wrapper", functionName: "", functionLocation: { scriptId: "wrapper-script", lineNumber: WSITE.functionLine, columnNumber: WSITE.functionColumn }, location: { scriptId: "wrapper-script", lineNumber: WSITE.callLine, columnNumber: WSITE.callColumn } },
    ] } });
  } };
}
void test("original pre-await collector issues allocated UUID only after exact invocation custody and preserves next clock event", async () => {
  const f = await fixture(); await assert.rejects(f.destination());
  assert.throws(() => { f.requireCopy(f.plan, f.binding); }, /ORIGINAL_COPY_PLAN/u);
  await f.runner.arm(); f.requireCopy(f.plan, f.binding);
  assert.throws(() => { f.requireCopy(structuredClone(f.plan), f.binding); }, /ORIGINAL_COPY_PLAN/u);
  assert.throws(() => { f.requireCopy(f.plan, { ...f.binding }); }, /ORIGINAL_COPY_PLAN/u);
  f.start(); await f.runner.collectAndResume();
  assert.equal(await f.destination(), "c".repeat(16)); assert.equal(f.events.shift(), f.remainingClock);
  await f.runner.release(); assert.equal(await f.destination(), "c".repeat(16)); assert.equal(f.commands.length, 10);
  assert.equal(f.runner.diagnostics()["normalRequests"], 7); assert.equal(f.runner.diagnostics()["cleanupRequests"], 3);
  await assert.rejects(f.runner.collectAndResume()); await assert.rejects(f.runner.release());
});
void test("matching paused arguments cannot replace the original consumed invocation", async () => {
  const f = await fixture(); await f.runner.arm(); f.start(); f.state.consumed = false;
  await assert.rejects(f.runner.collectAndResume(), /not consumed/u); assert.deepEqual(f.commands, ["allocation-arm"]);
  assert.equal(f.events.length, 1); await assert.rejects(f.destination());
});
void test("changed generated wrapper source and lost resume remain consumed until actual original exit", async () => {
  for (const kind of ["source", "resume"] as const) {
    const f = await fixture(); await f.runner.arm(); f.start();
    if (kind === "source") { f.state.badSource = true; } else { f.state.lost = "allocation-resume"; }
    await assert.rejects(f.runner.collectAndResume()); const count = f.commands.length;
    await assert.rejects(f.runner.collectAndResume()); await assert.rejects(f.runner.release()); assert.equal(f.commands.length, count);
    await assert.rejects(f.runner.observeOriginalGenerationEnded(), /not observed/u); f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
    await assert.rejects(f.destination()); assert.equal(f.runner.diagnostics()["phase"], "ended");
  }
});
void test("ambiguous allocation cannot re-arm and changed original ownership cannot issue destination", async () => {
  const lost = await fixture(); lost.state.lost = "allocation-arm"; await assert.rejects(lost.runner.arm()); await assert.rejects(lost.runner.arm());
  assert.equal(lost.commands.length, 1); assert.equal(lost.runner.diagnostics()["allocationUncertain"], true);
  const f = await fixture(); await f.runner.arm(); f.start(); await f.runner.collectAndResume(); f.state.changed = true;
  await assert.rejects(f.destination(), /original changed/u); await assert.rejects(f.runner.release());
});

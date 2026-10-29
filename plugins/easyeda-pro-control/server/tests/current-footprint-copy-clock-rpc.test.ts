/** Actual sequencer and fixed descriptor joins over synthetic CDP/native
 * issuers. These cases cannot issue a real combined-origin capability. */
/* oxlint-disable import/max-dependencies -- The test checks the real closed protocol and all three production issuers in addition to the isolated runner/VM fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyClockRpcOrigin, CurrentFootprintCopyClockRpcOriginBindings } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcObservation, CurrentFootprintCopyClockRpcRunner } from "../src/current-footprint-copy-clock-rpc-runner.ts";
import { requireCurrentFootprintCopyClockRpcOrigin } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import { requireCurrentFootprintCopyClockRpcRegistrationLease } from "../src/current-footprint-copy-clock-registration-runner.ts";
import { requireCurrentFootprintCopyClockRpcConstructionLease } from "../src/current-pcb-worker-construction-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as SITES, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE as SOURCE,
  qualifyCurrentFootprintCopyClockRpcSource, requireCurrentFootprintCopyClockRpcSource } from "../src/current-footprint-copy-clock-rpc-source.ts";
import { currentFootprintCopyClockRpcCondition, validateCurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { currentFootprintCopyClockRpcWire } from "../src/current-footprint-copy-clock-rpc-wire.ts";
import { clockRpcFixture, documentUuid } from "./helpers/footprint-clock-rpc-fixture.ts";

async function fixture(override?: (original: ReturnType<typeof clockRpcFixture>) => CurrentFootprintCopyClockRpcOriginBindings): Promise<ReturnType<typeof clockRpcFixture> & Readonly<{ runner: CurrentFootprintCopyClockRpcRunner;
  requireObservation: (packet: CurrentFootprintCopyClockRpcObservation, origin: CurrentFootprintCopyClockRpcOrigin) => Promise<void> }>> {
  const f = clockRpcFixture(); const binding = override?.(f) ?? f.binding; const url = new URL("../src/current-footprint-copy-clock-rpc-runner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const actualRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-clock-rpc-origin.ts") { return { requireCurrentFootprintCopyClockRpcOrigin: (value: unknown): typeof binding => { assert.equal(value, f.token); return binding; } }; }
    if (name === "./current-footprint-copy-clock-registration-runner.ts") { return { requireCurrentFootprintCopyClockRpcRegistrationLease: (value: unknown): typeof f.registration => { assert.equal(value, f.binding.registrationLease); return f.registration; } }; }
    if (name === "./current-pcb-worker-construction-runner.ts") { return { requireCurrentFootprintCopyClockRpcConstructionLease: (value: unknown): typeof f.construction => { assert.equal(value, f.binding.workerLease); return f.construction; } }; }
    if (name === "./current-footprint-copy-clock-rpc-source.ts") {
      const source: unknown = actualRequire(name); assert.ok(source !== null && typeof source === "object");
      return { ...source, requireCurrentFootprintCopyClockRpcSource: (value: unknown, realm: string): void => { assert.equal(value, realm === "worker" ? f.workerSource : f.uiSource); } };
    }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const candidate = loaded.exports["CurrentFootprintCopyClockRpcRunner"]; assert.equal(typeof candidate, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual runner code uses only explicitly labeled synthetic issuer hooks, never a genuine native owner.
  const Constructor = candidate as typeof CurrentFootprintCopyClockRpcRunner;
  const runner = new Constructor(f.token, documentUuid);
  const requireObservation = loaded.exports["requireCurrentFootprintCopyClockRpcObservation"]; assert.ok(typeof requireObservation === "function");
  return { ...f, binding, runner, requireObservation: async (packet, origin): Promise<void> => {
    await Reflect.apply(requireObservation, undefined, [packet, origin]);
  } };
}

void test("two actual descriptor traces keep distinct RPCs/tasks, fresh offsets and equal consumed values without a clock invocation", async () => {
  const f = await fixture();
  assert.throws(() => requireCurrentFootprintCopyClockRpcOrigin(f.token));
  assert.throws(() => requireCurrentFootprintCopyClockRpcConstructionLease(f.binding.workerLease));
  assert.throws(() => requireCurrentFootprintCopyClockRpcRegistrationLease(f.binding.registrationLease));
  await f.runner.arm(); assert.equal(f.commands.length, 13); await assert.rejects(f.runner.arm());
  f.runner.consumeBeforeInvocation(); assert.throws(() => { f.runner.consumeBeforeInvocation(); }); f.state.started = true;
  const packet = await f.runner.collect(); assert.equal(packet.samples.length, 2);
  assert.deepEqual(packet.samples.map(value => value.updateTime), [1_700_000_000_123, 1_700_000_000_123]);
  assert.deepEqual(packet.samples.map(value => value.lexicalOffset), [5, 11]);
  assert.notEqual(packet.samples[0]?.replyTopicSha256, packet.samples[1]?.replyTopicSha256);
  assert.equal(f.state.clockCalls, 2); assert.equal(packet.executionAuthorized, false); assert.equal(packet.nativeCreateCompletionVerified, false);
  assert.equal(packet.backendClockOrSqlCompletionVerified, false); assert.equal(packet.nativeBroadcastSenderHandleAuthenticated, false);
  assert.equal(f.runner.diagnostics()["normalRequests"], 49); assert.equal(f.runner.diagnostics()["cleanupRequests"], 16);
  assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, 10);
  assert.equal(f.commands.filter(value => value.method === "Runtime.releaseObjectGroup").length, 0);
  await f.runner.requireOriginal(packet); await assert.rejects(f.runner.requireOriginal(structuredClone(packet)));
  await f.requireObservation(packet, f.token); await assert.rejects(f.requireObservation(structuredClone(packet), f.token));
  await assert.rejects(f.requireObservation(packet, Object.freeze({ ...f.token })), /ORIGINAL_PACKET_ORIGIN/u);
  await f.runner.cleanup(); assert.equal(f.commands.length, 67); assert.equal(f.runner.diagnostics()["cleanupRequests"], 18);
  await assert.rejects(f.requireObservation(packet, f.token));
  for (const [index, command] of f.commands.entries()) {
    const wire = currentFootprintCopyClockRpcWire(command, index + 1, "worker", "ui");
    assert.equal(wire.request["requestId"], index + 1); assert.equal(Object.hasOwn(wire.request, "sessionId"), false);
  }
  assert.equal(f.state.retired, true); await assert.rejects(f.runner.cleanup()); await assert.rejects(f.runner.requireOriginal(packet));
});

for (const [field, expectedResumes] of [["wrongTarget", 1], ["changedResult", 3], ["reusedUiTask", 7]] as const) {
  void test(`actual ${field} refuses before its continuation and preserves original generation cleanup`, async () => {
    const f = await fixture(); f.state[field] = true; await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true;
    await assert.rejects(f.runner.collect()); const failure = f.runner.diagnostics()["firstFailure"];
    assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, expectedResumes);
    await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); await assert.rejects(f.runner.collect());
    assert.deepEqual(f.runner.diagnostics()["firstFailure"], failure); await assert.rejects(f.runner.observeOriginalGenerationEnded(), /remains live/u);
    f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.state.retired, true);
  });
}

void test("lost resume acknowledgment cannot repeat a continuation or turn delivered next-pause evidence into success", async () => {
  const f = await fixture(); await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; f.state.lostResume = true;
  await assert.rejects(f.runner.collect(), /lost original resume/u); await assert.rejects(f.runner.collect()); await assert.rejects(f.runner.cleanup());
  assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, 1);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.runner.diagnostics()["retired"], true);
});

void test("the native origin cannot replace a lost original construction lease before a continuation", async () => {
  const f = await fixture(); await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; f.state.lostWorkerLease = true;
  await assert.rejects(f.runner.collect(), /original worker lease lost/u);
  assert.equal(f.commands.length, 13); assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, 0);
  await assert.rejects(f.runner.cleanup()); f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
});

void test("uninvoked source instrumentation retires without any native continuation", async () => {
  const f = await fixture(); await f.runner.arm(); await f.runner.cleanup();
  assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, 0);
  assert.equal(f.commands.filter(value => value.method === "Debugger.removeBreakpoint").length, 6);
  assert.equal(f.commands.filter(value => value.method === "Runtime.releaseObjectGroup").length, 2);
});

void test("whole source/capability pins and exact conditions refuse substituted bodies, AST coordinates and caller code", () => {
  assert.equal(SOURCE.worker.functions.push.sha256, "5dd2e69c15d7d28dfdd72ae7debbd98f7658cd6cddcc59be370092f353a7a1dd");
  assert.throws(() => qualifyCurrentFootprintCopyClockRpcSource("worker", "synthetic source"));
  assert.throws(() => { requireCurrentFootprintCopyClockRpcSource({ profile: "private.current-footprint-copy-clock-rpc-source.v1", realm: "worker", sha256: SOURCE.worker.sha256, invocationObserved: false }, "worker"); });
  const role = "push"; const site = SITES.push; const condition = currentFootprintCopyClockRpcCondition(role, "11111111-1111-1111-1111-111111111111");
  const command = { phase: "rpc-arm", role, method: "Debugger.setBreakpoint", sessionId: "worker", params: { location: { scriptId: "worker-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, condition } };
  assert.equal(validateCurrentFootprintCopyClockRpcCommand(command).method, "Debugger.setBreakpoint");
  for (const params of [{ ...command.params, condition: "process.exit()" }, { ...command.params, location: { ...command.params.location, columnNumber: 10_165 } }]) {
    assert.throws(() => validateCurrentFootprintCopyClockRpcCommand({ ...command, params }));
  }
});

void test("actual original-generation proof cancels a pending allocation and joins its original arm before retirement", async () => {
  const entered = Promise.withResolvers<null>(), pending = Promise.withResolvers<never>();
  const f = await fixture(original => Object.freeze({ ...original.binding,
    request: (command: Parameters<CurrentFootprintCopyClockRpcOriginBindings["request"]>[0]) => {
      if (command.method === "Debugger.setBreakpoint") { entered.resolve(null); return pending.promise; }
      return original.binding.request(command, false);
    },
    assertOriginalGenerationExited: async (): Promise<void> => {
      await original.binding.assertOriginalGenerationExited();
      pending.reject(new Error("synthetic retained generation exited"));
    },
  }));
  let settled = false;
  const arm = (async (): Promise<unknown> => {
    try { await f.runner.arm(); settled = true; return null; }
    catch (error) { settled = true; return error; }
  })();
  await entered.promise;
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /remains live/u);
  assert.equal(settled, false); assert.equal(f.runner.diagnostics()["originalGenerationEnded"], false);
  assert.equal(f.runner.diagnostics()["uncertainAllocation"], true);
  f.state.exited = true;
  await f.runner.observeOriginalGenerationEnded();
  const failure = await arm; assert.ok(failure instanceof Error); assert.match(failure.message, /retained generation exited/u);
  assert.equal(settled, true); assert.equal(f.runner.diagnostics()["originalGenerationEnded"], true);
  assert.equal(f.runner.diagnostics()["retired"], true); assert.equal(f.commands.filter(value => value.method === "Debugger.resume").length, 0);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /CONSUMED/u);
});

void test("malformed final release synchronously revokes retained-origin normal retirement", async () => {
  let failed = false, retirementControls = 0;
  const f = await fixture(original => Object.freeze({ ...original.binding,
    fail: (): void => { failed = true; },
    request: async (command: Parameters<CurrentFootprintCopyClockRpcOriginBindings["request"]>[0], cleanup: boolean): Promise<unknown> => {
      const reply = await original.binding.request(command, cleanup);
      return command.method === "Runtime.releaseObjectGroup" && command.sessionId === "ui" ? { unexpected: true } : reply;
    },
    retire: (): Promise<void> => {
      if (failed && !original.state.exited) { return Promise.reject(new Error("synthetic sticky semantic refusal")); }
      retirementControls += 1; return original.binding.retire();
    },
  }));
  await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; await f.runner.collect();
  await assert.rejects(f.runner.cleanup()); assert.equal(failed, true);
  assert.equal(f.runner.diagnostics()["normalRequests"], 49); assert.equal(f.runner.diagnostics()["cleanupRequests"], 18);
  await assert.rejects(f.binding.retire(), /semantic refusal/u); assert.equal(retirementControls, 0);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(retirementControls, 1);
});
void test("generation-exit observation joins concurrent successful retirement without dispatching it twice", async () => {
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  let retirements = 0;
  const f = await fixture(original => Object.freeze({ ...original.binding,
    retire: async (): Promise<void> => { retirements += 1; entered.resolve(null); await release.promise; await original.binding.retire(); },
    assertOriginalGenerationExited: async (): Promise<void> => { await release.promise; await original.binding.assertOriginalGenerationExited(); },
  }));
  await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.started = true; await f.runner.collect();
  const cleanup = f.runner.cleanup(); await entered.promise;
  const ended = f.runner.observeOriginalGenerationEnded(); f.state.exited = true; release.resolve(null);
  await cleanup; await ended;
  assert.equal(retirements, 1); assert.equal(f.runner.diagnostics()["retired"], true);
  assert.equal(f.runner.diagnostics()["originalGenerationEnded"], true);
});

void test("lost first exit-retirement acknowledgment permits one local original-origin settlement without another native send", async () => {
  let nativeRetirements = 0, retirementCalls = 0;
  const f = await fixture(original => Object.freeze({ ...original.binding,
    retire: async (): Promise<void> => {
      retirementCalls += 1;
      if (retirementCalls === 1) {
        nativeRetirements += 1;
        throw new Error("synthetic lost first exit-retirement acknowledgment");
      }
      await original.binding.retire();
    },
  }));
  await f.runner.arm(); f.state.exited = true;
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /lost first exit-retirement/u);
  const commands = f.commands.length, failure = f.runner.diagnostics()["firstFailure"];
  assert.equal(f.runner.diagnostics()["originalGenerationEnded"], true);
  assert.equal(f.runner.diagnostics()["retired"], false);
  await assert.rejects(f.runner.arm()); await assert.rejects(f.runner.cleanup());
  await f.runner.observeOriginalGenerationEnded();
  assert.equal(f.runner.diagnostics()["retired"], true);
  assert.equal(f.runner.diagnostics()["retirementSettlementAttempted"], true);
  assert.equal(retirementCalls, 2); assert.equal(nativeRetirements, 1);
  assert.equal(f.commands.length, commands);
  assert.deepEqual(f.runner.diagnostics()["firstFailure"], failure);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /CONSUMED/u);
});

void test("a failed bounded exit-retirement settlement stays consumed", async () => {
  let retirementCalls = 0;
  const f = await fixture(original => Object.freeze({ ...original.binding,
    retire: (): Promise<void> => { retirementCalls += 1; return Promise.reject(new Error("synthetic retirement unavailable")); },
  }));
  f.state.exited = true;
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /unavailable/u);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /unavailable/u);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /CONSUMED/u);
  assert.equal(retirementCalls, 2); assert.equal(f.commands.length, 0);
});

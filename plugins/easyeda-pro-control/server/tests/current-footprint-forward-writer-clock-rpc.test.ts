/** Actual mixed-source registration and full RPC engine. Native/Core/allocation
 * issuers are explicitly synthetic; no application or document clock runs. */
/* oxlint-disable import/max-dependencies -- Join the real registration registry, source qualification, protocol and full sequencer across explicit synthetic issuer seams. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as SOURCES } from "../src/current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRegistrationV2Runner } from "../src/current-footprint-copy-clock-registration-v2-runner.ts";
import type { CurrentFootprintForwardWriterClockRpcRunner, requireCurrentFootprintForwardWriterClockRpcObservation } from "../src/current-footprint-forward-writer-clock-rpc-runner.ts";
import type { CurrentFootprintForwardWriterClockRpcOriginBindings } from "../src/current-footprint-forward-writer-clock-origin.ts";
import { CURRENT_FOOTPRINT_FORWARD_CLOCK_PREPARATION_REQUESTS as OLD_PREPARATION } from "../src/current-footprint-forward-clock-preparation-budget.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_PREPARATION_REQUESTS as PREPARATION } from "../src/current-footprint-forward-writer-clock-preparation-budget.ts";
import { SYNTHETIC_SOURCES, clockRpcV2Fixture, documentUuid } from "./helpers/footprint-clock-rpc-v2-fixture.ts";

type Module = Record<string, unknown>;
async function load(path: string, replacements: Module, text?: string): Promise<Module> {
  const url = new URL(`../src/${path}`, import.meta.url); const actualRequire = createRequire(url), loaded: { exports: Module } = { exports: {} };
  const output = await transform(text ?? await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(replacements, name) ? replacements[name] : actualRequire(name) as unknown, loaded, loaded.exports]); return loaded.exports;
}
async function fixture(): Promise<ReturnType<typeof clockRpcV2Fixture> & Readonly<{
  runner: CurrentFootprintForwardWriterClockRpcRunner; stateOfAllocation: { ready: boolean; reads: number; changeAfterRead: boolean };
  requirePacket: (packet: Awaited<ReturnType<CurrentFootprintForwardWriterClockRpcRunner["collect"]>>) => Promise<void>;
}>> {
  const f = clockRpcV2Fixture(), uiSource = Object.freeze({ synthetic: true });
  let sourceText = await readFile(new URL("../src/current-footprint-copy-clock-registration-v2-source.ts", import.meta.url), "utf8");
  for (const role of ["wrapper", "callback"] as const) { sourceText = sourceText.replace(SOURCES[role].sha256, sha256Text(SYNTHETIC_SOURCES[role])); }
  const source = await load("current-footprint-copy-clock-registration-v2-source.ts", {}, sourceText);
  const registrationModule = await load("current-footprint-copy-clock-registration-v2-runner.ts", {
    "./current-footprint-copy-clock-registration-v2-source.ts": source,
    "./current-footprint-copy-ui-source.ts": { requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, uiSource); } },
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real private registration registry runs with labelled synthetic complete source and UI issuer only.
  const Registration = registrationModule["CurrentFootprintCopyClockRegistrationV2Runner"] as typeof CurrentFootprintCopyClockRegistrationV2Runner;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- No production UI issuer or native owner is allocated by this inert fixture.
  const registration = new Registration(uiSource as unknown as ConstructorParameters<typeof Registration>[0], f.registrationTransport,
    { sessionId: "ui", uiRoute: "route", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
  const packet = await registration.observe(), retention = registration.retainForRpc(packet);
  const origin = Object.freeze({ profile: "private.current-footprint-forward-writer-clock-rpc-origin.v1" as const }); const allocation = Object.freeze({ syntheticOriginalAllocation: true });
  const stateOfAllocation = { ready: false, reads: 0, changeAfterRead: false };
  const bindings: CurrentFootprintForwardWriterClockRpcOriginBindings = Object.freeze({ ...f.transport, workerLease: f.workerLease, registration: retention, workerSessionId: "worker" });
  const rpcModule = await load("current-footprint-forward-writer-clock-rpc-runner.ts", {
    "./current-footprint-forward-writer-clock-origin.ts": { requireCurrentFootprintForwardWriterClockRpcOrigin: (value: unknown): typeof bindings => { assert.equal(value, origin); return bindings; } },
    "./current-footprint-forward-writer-allocation-runner.ts": {
      requireCurrentFootprintForwardWriterAllocationOrigin: (value: unknown, token: unknown): void => { assert.equal(value, allocation); assert.equal(token, origin); },
      requireCurrentFootprintForwardWriterAllocatedDestination: (value: unknown, token: unknown): Promise<string> => {
        assert.equal(value, allocation); assert.equal(token, origin); assert.equal(stateOfAllocation.ready, true); stateOfAllocation.reads += 1;
        return Promise.resolve(stateOfAllocation.changeAfterRead && stateOfAllocation.reads > 1 ? "e".repeat(16) : documentUuid);
      },
    },
    "./current-footprint-copy-clock-registration-v2-source.ts": source,
    "./current-footprint-copy-clock-registration-v2-runner.ts": registrationModule,
    "./current-pcb-worker-construction-runner.ts": { requireCurrentFootprintCopyClockRpcConstructionLease: (value: unknown): typeof f.construction => { assert.equal(value, f.workerLease); return f.construction; } },
    "./current-footprint-copy-clock-rpc-source.ts": { requireCurrentFootprintCopyClockRpcSource: (value: unknown, realm: string): void => { assert.equal(realm, "worker"); assert.equal(value, f.workerSource); } },
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only original Core/allocation issuers are explicitly synthetic; the full private packet map and complete fixed RPC algorithm run unchanged.
  const Runner = rpcModule["CurrentFootprintForwardWriterClockRpcRunner"] as typeof CurrentFootprintForwardWriterClockRpcRunner;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The labelled original allocation seam validates this exact object; it grants no production token.
  const runner = new Runner(origin, allocation as unknown as ConstructorParameters<typeof Runner>[1]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual exported getter uses this VM module's private packet registry.
  const requirePacket = rpcModule["requireCurrentFootprintForwardWriterClockRpcObservation"] as typeof requireCurrentFootprintForwardWriterClockRpcObservation;
  return { ...f, runner, stateOfAllocation, requirePacket: result => requirePacket(result, origin) };
}
void test("full mixed-source clocks resolve the original allocated destination and keep the exact full factual projection", async () => {
  const f = await fixture(); assert.equal(f.registrationCommands.length, 18); assert.equal(OLD_PREPARATION.normal, 242); assert.equal(PREPARATION.normal, 243);
  await f.runner.arm(); assert.equal(f.commands.length, 13); assert.equal(f.stateOfAllocation.reads, 0);
  f.stateOfAllocation.ready = true; f.runner.consumeBeforeInvocation(); f.state.started = true;
  const packet = await f.runner.collect(); assert.equal(packet.profile, "private.current-footprint-forward-writer-clock-rpc-observation.v1");
  assert.deepEqual(packet.samples.map(sample => [sample.documentUuid, sample.lexicalOffset]), [[documentUuid, 5], [documentUuid, 11]]); assert.equal(f.stateOfAllocation.reads, 4);
  assert.deepEqual(Object.keys(packet), ["profile", "samples", "distinctOriginalRequestsAndPendingTasksObserved", "originalShiftAndSelectedServiceTaskJoined", "originalCallbackResultAndPostAwaitValueMatched", "allTenResumesObserved", "allAllocatedBreakpointsRemoved", "temporaryGroupsReleased", "nativeBroadcastSenderHandleAuthenticated", "backendClockOrSqlCompletionVerified", "nativeCreateCompletionVerified", "executionAuthorized"]);
  await f.requirePacket(packet); await assert.rejects(f.requirePacket(structuredClone(packet))); await f.runner.cleanup();
  assert.equal(f.commands.length, 67); assert.equal(f.runner.diagnostics()["normalRequests"], 49); assert.equal(f.runner.diagnostics()["cleanupRequests"], 18);
  assert.equal(f.state.clockCalls, 2); assert.equal(packet.executionAuthorized, false); assert.equal(Object.isFrozen(f.runner), true);
  assert.throws(() => Object.defineProperty(f.runner, "arm", { value: (): void => { assert.fail("replacement method cannot be installed"); } }));
});
void test("changed original allocation stops the first producer before its resume and retains original-exit cleanup", async () => {
  const f = await fixture(); await f.runner.arm(); f.stateOfAllocation.ready = true; f.stateOfAllocation.changeAfterRead = true;
  f.runner.consumeBeforeInvocation(); f.state.started = true;
  await assert.rejects(f.runner.collect(), /ORIGINAL_ALLOCATION_CHANGED/u); assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 4);
  await assert.rejects(f.runner.collect()); await assert.rejects(f.runner.cleanup()); await assert.rejects(f.runner.observeOriginalGenerationEnded(), /remains live/u);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.runner.diagnostics()["retired"], true); assert.equal(f.state.clockCalls, 1);
});

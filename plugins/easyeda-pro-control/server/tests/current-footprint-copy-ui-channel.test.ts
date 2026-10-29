/* oxlint-disable import/max-dependencies -- This integration test joins the actual channel, two fixed wire grammars and a fake monotonic clock without modifying their authority checks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentFootprintCopyExecutionChannel, CurrentFootprintCopyPreparationChannel, CurrentPcb209WorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupNativeDependency, CurrentPcbWorkerStartupParent } from "../src/current-pcb-worker-startup-channel.ts";
import { currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "../src/current-pcb-209-startup-opening-program.ts";
import { currentFootprintCopyManagerRouteNativeCases } from "../src/current-footprint-copy-manager-route-native.ts";
import { currentFootprintCopyUiNativeCases } from "../src/current-footprint-copy-ui-native.ts";
import type { CurrentFootprintCopyUiCommand } from "../src/current-footprint-copy-ui-command.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE as PROFILE } from "../src/current-footprint-copy-preparation-profile.ts";
import { currentFootprintCopyClockRegistrationNativeCases } from "../src/current-footprint-copy-clock-registration-native.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as EXECUTION } from "../src/current-footprint-copy-execution-profile.ts";

async function clockConstructor(clock: { now: bigint }): Promise<typeof CurrentFootprintCopyPreparationChannel> {
  const path = new URL("../src/current-pcb-worker-startup-channel.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => specifier === "node:process" ? {
    hrtime: { bigint: (): bigint => clock.now },
  } : actualRequire(specifier) as unknown, loaded, loaded.exports]);
  const value = loaded.exports["CurrentFootprintCopyPreparationChannel"]; assert.ok(typeof value === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual channel module is loaded with only the process monotonic clock replaced above.
  return value as typeof CurrentFootprintCopyPreparationChannel;
}
async function fixture(Constructor: typeof CurrentFootprintCopyPreparationChannel | typeof CurrentPcb209WorkerStartupChannel, managerSource?: string): Promise<{
  channel: CurrentFootprintCopyPreparationChannel | CurrentPcb209WorkerStartupChannel;
  dependency: Awaited<ReturnType<CurrentFootprintCopyPreparationChannel["start"]>>;
  requests: Readonly<Record<string, string | number>>[];
  close: () => Promise<void>;
}> {
  const frames: Buffer[] = [], parent = Object.freeze({ targetId: "target", sessionId: "parent", nextRequestId: 1 });
  const requests: Readonly<Record<string, string | number>>[] = []; let terminated = false;
  const frame = (value: unknown): void => {
    const bytes = Buffer.from(`${JSON.stringify(value)}\0`);
    for (let offset = 0; offset < bytes.length; offset += 65_536) { frames.push(bytes.subarray(offset, offset + 65_536)); }
  };
  const native: CurrentPcbWorkerStartupNativeDependency = {
    requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => undefined,
    exchange(request): Promise<unknown> {
      if (request.action === "poll") { return Promise.resolve({ bytes: (frames.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      assert.ok("requestId" in request); requests.push(request);
      if (request["method"] === "Target.setAutoAttach") {
        frame({ method: "Target.attachedToTarget", sessionId: "parent", params: { sessionId: "worker", waitingForDebugger: true,
          targetInfo: { targetId: "child", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/project-worker.js" } } });
      }
      frame({ id: request["requestId"], ...(request["method"] === "Target.getTargets" ? {} :
        { sessionId: request["sessionId"] ?? "parent" }), result: request["parentPhase"] === "footprint-copy-manager-route-source" && managerSource !== undefined ? { scriptSource: managerSource } : {} });
      return Promise.resolve({ written: true });
    },
  };
  const channel = new Constructor(native), dependency = await channel.start(); dependency.subscribe(() => {
    // No worker commands run in this synthetic parent observation.
  });
  return { channel, dependency, requests, close: async (): Promise<void> => { terminated = true; await channel.releaseAfterTermination(); } };
}
async function open(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  for (const phase of ["preflight", "open-project"] as const) {
    if (phase === "open-project") {
      await value.dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent" });
    }
    const sample = currentPcbWorkerStartupNativeParentCases().find(command => command.method === "Runtime.callFunctionOn" &&
      command.params.arguments.length === 2 && command.params.arguments[1].value === phase);
    assert.ok(sample?.method === "Runtime.callFunctionOn" && sample.params.awaitPromise);
    await value.dependency.request({ ...sample, sessionId: "parent", params: { ...sample.params, functionDeclaration: CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } });
  }
}
function select(phase: CurrentFootprintCopyUiCommand["phase"]): CurrentFootprintCopyUiCommand {
  const command = currentFootprintCopyUiNativeCases().find(item => item.phase === phase); assert.ok(command);
  return command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params ?
    { ...command, sessionId: "parent", params: { ...command.params, uniqueContextId: "original-context" } } : { ...command, sessionId: "parent" };
}

void test("copy UI commands share the original opened parent and reject old purposes, foreign contexts and replay", async () => {
  const old = await fixture(CurrentPcb209WorkerStartupChannel);
  try { await assert.rejects(old.channel.requestFootprintUi(select("initial")), /FOOTPRINT_UI_PURPOSE/u); assert.equal(old.requests.length, 0); }
  finally { await old.close(); }
  const value = await fixture(CurrentFootprintCopyPreparationChannel);
  try {
    await assert.rejects(value.channel.requestFootprintUi(select("initial")), /FOOTPRINT_UI_SEQUENCE/u);
    await open(value);
    const initial = select("initial"); assert.ok(initial.method === "Runtime.callFunctionOn" && "uniqueContextId" in initial.params);
    await assert.rejects(value.channel.requestFootprintUi({ ...initial, params: { ...initial.params, uniqueContextId: "foreign" } }), /FOOTPRINT_UI_CONTEXT/u);
    await assert.rejects(value.channel.requestFootprintUi({ ...initial, sessionId: "worker" }), /FOOTPRINT_UI_SEQUENCE/u);
    await value.channel.requestFootprintUi(initial);
    await assert.rejects(value.channel.requestFootprintUi(initial), /FOOTPRINT_UI_SEQUENCE/u);
    await value.channel.requestFootprintUi(select("properties"));
    await value.channel.requestFootprintUi(select("release"));
    await assert.rejects(value.channel.requestFootprintUi(select("release")), /FOOTPRINT_UI_SEQUENCE/u);
    assert.deepEqual(value.requests.map(item => item["requestId"]), [1, 2, 3, 4, 5, 6]);
    assert.equal(value.channel.status().failed, false);
  } finally { await value.close(); }
});

void test("normal copy deadline preserves the actual original channel for cleanup until its separate terminal deadline", async () => {
  const clock = { now: 0n };
  const Constructor = await clockConstructor(clock), value = await fixture(Constructor);
  try {
    await open(value); await value.channel.requestFootprintUi(select("initial"));
    clock.now = BigInt(PROFILE.normalMilliseconds) * 1_000_000n;
    await assert.rejects(value.channel.requestFootprintUi(select("properties")), /NORMAL_LIFETIME/u);
    await assert.rejects(value.dependency.assertOriginalOwner(), /NORMAL_LIFETIME/u);
    assert.equal(value.channel.status().failed, false); assert.equal(value.channel.status().fatal, false);
    await value.channel.requestFootprintUi(select("release"));
    assert.equal(value.channel.status().pendingReplies, 0); assert.equal(value.channel.status().failed, false);
    clock.now = BigInt(PROFILE.normalMilliseconds + PROFILE.cleanupMilliseconds) * 1_000_000n;
    await assert.rejects(value.dependency.request({ method: "Runtime.runIfWaitingForDebugger", sessionId: "worker", params: {} }), /LIFETIME/u);
    assert.equal(value.channel.status().fatal, true);
  } finally { await value.close(); }
});

void test("manager route uses the existing original UI parent and consumes runtime-source acquisition exactly once", async () => {
  const cases = Array.from(currentFootprintCopyManagerRouteNativeCases(), command => ({ ...command, sessionId: "parent" }));
  const initial = cases.find(command => command.phase === "initial"), release = cases.find(command => command.phase === "release"), source = cases.find(command => command.phase === "source");
  assert.ok(initial !== undefined && source !== undefined && release !== undefined);
  const old = await fixture(CurrentPcb209WorkerStartupChannel);
  try { await assert.rejects(old.channel.requestFootprintManagerRoute(initial), /FOOTPRINT_MANAGER_ROUTE_PURPOSE/u); assert.equal(old.requests.length, 0); }
  finally { await old.close(); }
  const sourceText = "x".repeat(2_196_424), value = await fixture(CurrentFootprintCopyPreparationChannel, sourceText);
  try {
    await open(value); await assert.rejects(value.channel.requestFootprintManagerRoute(initial), /FOOTPRINT_MANAGER_ROUTE_SEQUENCE/u);
    await value.channel.requestFootprintUi(select("initial"));
    await assert.rejects(value.channel.requestFootprintManagerRoute({ ...initial, sessionId: "worker" }), /FOOTPRINT_MANAGER_ROUTE_SEQUENCE/u);
    await value.channel.requestFootprintManagerRoute(initial);
    await assert.rejects(value.channel.requestFootprintManagerRoute(initial), /FOOTPRINT_MANAGER_ROUTE_SEQUENCE/u);
    assert.deepEqual(await value.channel.requestFootprintManagerRoute(source), { scriptSource: sourceText });
    assert.ok(value.channel.status().receivedBytes > Buffer.byteLength(sourceText));
    await assert.rejects(value.channel.requestFootprintManagerRoute(source), /FOOTPRINT_MANAGER_ROUTE_SEQUENCE/u);
    await value.channel.requestFootprintUi(select("release"));
    await value.channel.requestFootprintManagerRoute(release);
    await assert.rejects(value.channel.requestFootprintManagerRoute(release), /FOOTPRINT_MANAGER_ROUTE_SEQUENCE/u);
    assert.equal(value.channel.status().failed, false); assert.equal(value.requests.at(-1)?.["parentPhase"], "footprint-copy-manager-route-release");
  } finally { await value.close(); }
});

void test("clock registration is execution-only and retains 37 normal requests plus one original cleanup request", async () => {
  const cases = Array.from(currentFootprintCopyClockRegistrationNativeCases(), command => ({ ...command, sessionId: "parent" }));
  const selected = (phase: string): typeof cases[number] => { const command = cases.find(value => value.phase === phase); assert.ok(command !== undefined); return command; };
  for (const Constructor of [CurrentFootprintCopyPreparationChannel, CurrentPcb209WorkerStartupChannel]) {
    const old = await fixture(Constructor); try { await assert.rejects(old.channel.requestFootprintClockRegistration(selected("initial")), /FOOTPRINT_CLOCK_REGISTRATION_PURPOSE/u); assert.equal(old.requests.length, 0); } finally { await old.close(); }
  }
  const value = await fixture(CurrentFootprintCopyExecutionChannel);
  try {
    await assert.rejects(value.channel.requestFootprintClockRegistration(selected("initial")), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u);
    await open(value); await value.channel.requestFootprintUi(select("initial"));
    await assert.rejects(value.channel.requestFootprintClockRegistration({ ...selected("initial"), sessionId: "worker" }), /FOOTPRINT_COPY_CLOCK_REGISTRATION_WIRE_SESSION/u);
    await value.channel.requestFootprintClockRegistration(selected("initial")); await assert.rejects(value.channel.requestFootprintClockRegistration(selected("initial")), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u);
    await assert.rejects(value.channel.requestFootprintUi(select("release")), /FOOTPRINT_UI_SEQUENCE/u);
    for (const phase of ["source", "callback", "bindings"]) { await value.channel.requestFootprintClockRegistration(selected(phase)); await assert.rejects(value.channel.requestFootprintClockRegistration(selected(phase)), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u); }
    for (let index = 0; index < 5; index += 1) { await value.channel.requestFootprintClockRegistration(selected("sample")); }
    await assert.rejects(value.channel.requestFootprintClockRegistration(selected("sample")), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u);
    for (let index = 0; index < 28; index += 1) { await value.channel.requestFootprintClockRegistration(selected("properties")); }
    await assert.rejects(value.channel.requestFootprintClockRegistration(selected("properties")), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u);
    await value.channel.requestFootprintClockRegistration(selected("release")); await assert.rejects(value.channel.requestFootprintClockRegistration(selected("release")), /FOOTPRINT_CLOCK_REGISTRATION_SEQUENCE/u);
    assert.equal(value.requests.filter(request => String(request["parentPhase"]).startsWith("footprint-copy-clock-registration-")).length, 38);
    await value.channel.requestFootprintUi(select("release")); assert.equal(value.channel.status().failed, false);
    assert.equal(EXECUTION.normalRequestLimit, 784); assert.equal(EXECUTION.requestLimit, 829); assert.equal(PROFILE.normalRequestLimit, 566); assert.equal(PROFILE.requestLimit, 600);
  } finally { await value.close(); }
});

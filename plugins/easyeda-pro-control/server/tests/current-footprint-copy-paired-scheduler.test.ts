/** Actual scheduler, channel, paired RPC, request collector, original issuer
 * and completion sequencers. Source/native prerequisites are explicitly
 * synthetic. Known UUID/body fixtures prove no real allocation qualification. */
/* oxlint-disable import/max-dependencies -- This regression composes all actual private classes and explicitly synthetic source/native worlds instead of callback-only scheduler stand-ins. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyPairedScheduler } from "../src/current-footprint-copy-paired-scheduler.ts";
import { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyClockRpcOriginBindings } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { requireCurrentFootprintCombinedPairedSchedule } from "../src/current-pcb-diagnostic-owner.ts";
import { createClockChannelFixture } from "./helpers/footprint-create-clock-channel-fixture.ts";
import { unarmedMainCompletionOriginFixture } from "./helpers/footprint-main-completion-origin-fixture.ts";
import { clockRpcFixture, documentUuid } from "./helpers/footprint-clock-rpc-fixture.ts";
import { syntheticRequestPlan } from "./helpers/footprint-main-request-collector-fixture.ts";

async function actualModule(file: string, overrides: Readonly<Record<string, unknown>>): Promise<Record<string, unknown>> {
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, url = new URL(`../src/${file}`, import.meta.url);
  const originalRequire = createRequire(url), output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
async function fixture(early: boolean): Promise<Readonly<{
  scheduler: CurrentFootprintCopyPairedScheduler;
  main: Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>>;
  channel: Awaited<ReturnType<typeof createClockChannelFixture>>;
  rpc: ReturnType<typeof clockRpcFixture>;
  route: Awaited<ReturnType<Awaited<ReturnType<typeof createClockChannelFixture>>["channel"]["beginFootprintCreateClockRpc"]>>;
}>> {
  const main = await unarmedMainCompletionOriginFixture(), rpc = clockRpcFixture();
  const queued: CurrentFootprintCopyClockRpcCommand[] = []; let firstClockPump = false, mainArmed = false;
  let binding: CurrentFootprintCopyClockRpcOriginBindings | null = null;
  const channel = await createClockChannelFixture(early, rpc.binding.workerLease, {
    begin: (): void => { assert.equal(mainArmed, true, "renderer clocks began before actual main arms"); },
    retire: (): Promise<void> => rpc.binding.retire(),
    create: (): void => { rpc.state.started = true; main.requestState.invoked = true; },
    nextCommand: (): CurrentFootprintCopyClockRpcCommand => { const selected = queued.shift(); assert.ok(selected !== undefined); return selected; },
    request: rpc.binding.request, pump: (): Promise<void> => {
      // The VM fixture starts its first pause on an explicit poll. Native V8
      // Does not emit that same held pause again on each channel idle poll.
      if (rpc.state.started && !firstClockPump) { firstClockPump = true; return rpc.binding.pump(false); }
      return Promise.resolve();
    }, takeEvent: rpc.binding.takeEvent,
  });
  // Main arms must precede renderer exclusivity. The genuine runtime still
  // Refuses this native purpose; this fixture supplies only synthetic capacity.
  const getClock = (token: unknown): CurrentFootprintCopyClockRpcOriginBindings => { assert.equal(token, rpc.token); assert.ok(binding !== null); return binding; };
  const clockSourceModule: unknown = createRequire(import.meta.url)("../src/current-footprint-copy-clock-rpc-source.ts");
  assert.ok(clockSourceModule !== null && typeof clockSourceModule === "object");
  const clockModule = await actualModule("current-footprint-copy-clock-rpc-runner.ts", {
    "./current-footprint-copy-clock-rpc-origin.ts": { requireCurrentFootprintCopyClockRpcOrigin: getClock },
    "./current-pcb-worker-construction-runner.ts": { requireCurrentFootprintCopyClockRpcConstructionLease: (token: unknown): typeof rpc.construction => { assert.equal(token, rpc.binding.workerLease); return rpc.construction; } },
    "./current-footprint-copy-clock-registration-runner.ts": { requireCurrentFootprintCopyClockRpcRegistrationLease: (token: unknown): typeof rpc.registration => { assert.equal(token, rpc.binding.registrationLease); return rpc.registration; } },
    "./current-footprint-copy-clock-rpc-source.ts": { ...clockSourceModule,
      requireCurrentFootprintCopyClockRpcSource: (token: unknown, realm: string): void => { assert.equal(token, realm === "worker" ? rpc.workerSource : rpc.uiSource); } },
  });
  const scheduleModule = await actualModule("current-footprint-copy-paired-scheduler.ts", {
    "./current-footprint-copy-main-backend-runner.ts": { CurrentFootprintCopyMainBackendRunner: main.module.Constructor },
    "./current-footprint-copy-main-request-runner.ts": main.collectorModule,
    "./current-footprint-copy-main-completion-runner.ts": { CurrentFootprintCopyMainCompletionRunner: main.Completion },
    "./current-footprint-copy-clock-rpc-runner.ts": clockModule,
    "./current-footprint-copy-clock-rpc-origin.ts": { requireCurrentFootprintCopyClockRpcOrigin: getClock },
    "./current-pcb-worker-startup-channel.ts": { requireCurrentFootprintCopyCreateClockChannelRoute: channel.requireRoute },
    "./current-pcb-diagnostic-owner.ts": { requireCurrentFootprintCombinedPairedSchedule: (capability: unknown, backend: unknown, clock: unknown): void => {
      assert.equal(capability, main.capability); assert.equal(backend, main.backend); assert.equal(clock, rpc.token); assert.equal(main.native.exited, false);
    } },
  });
  const candidate = scheduleModule["CurrentFootprintCopyPairedScheduler"]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual scheduler imports the actual VM-loaded classes and explicit synthetic native/source issuers above.
  const Scheduler = candidate as typeof CurrentFootprintCopyPairedScheduler;
  const scheduler = new Scheduler(main.backend, main.capability, main.oldOrigin, syntheticRequestPlan);
  await assert.rejects(scheduler.armClocks(), /PHASE/u); await scheduler.armMain(); mainArmed = true;
  const route = await channel.channel.beginFootprintCreateClockRpc(channel.dependency, channel.reservation);
  binding = Object.freeze({ ...rpc.binding,
    assertOriginal: route.assertOriginal, assertCleanup: route.assertCleanup, assertOriginalGenerationExited: route.assertOriginalGenerationExited,
    request: (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean): Promise<unknown> => { queued.push(command); return route.request(command, cleanup); },
    pump: route.pump, takeEvent: route.takeEvent, fail: route.fail, retire: route.retire,
  });
  scheduler.bindClocks(rpc.token, route, documentUuid); return { scheduler, main, channel, rpc, route };
}
for (const early of [true, false]) {
  void test(`actual paired schedule preserves ${early ? "early" : "pending"} create reply across clock retirement and all127 original main commands`, async () => {
    const f = await fixture(early);
    try {
      await assert.rejects(f.scheduler.collectMain(), /PHASE/u);
      await f.scheduler.armClocks(); await f.scheduler.dispatchCreate(); await f.scheduler.collectClocks();
      assert.equal(f.channel.channel.status().nextRequestId, 168); assert.equal(f.channel.channel.status().pendingReplies, early ? 0 : 1);
      assert.equal(f.main.native.beginCount, 0);
      await f.scheduler.collectMain(); assert.equal(f.main.native.beginCount, 1); assert.equal(f.main.native.tailReleases, 1);
      if (!early) { assert.ok(f.channel.state.createFrame !== null); f.channel.state.frames.push(f.channel.state.createFrame); }
      const result = await f.scheduler.joinCreate();
      assert.equal(result.serializedCreateResult, '{"success":true}'); assert.equal(result.executionAuthorized, false);
      assert.equal(result.fullQualificationVerified, false); assert.equal(result.nativeSqlCompletionVerified, false);
      assert.equal(f.rpc.commands.length, 67); assert.equal(f.channel.state.consumed, 1);
      assert.equal(f.scheduler.diagnostics()["phase"], "complete"); await assert.rejects(f.scheduler.dispatchCreate(), /PHASE/u);
    } finally { f.channel.state.exited = true; f.rpc.state.exited = true; f.main.native.exited = true; await f.channel.channel.releaseAfterTermination(); }
  });
}
void test("genuine owner crossjoin rejects copied capability and origin receipts before writer dispatch", () => {
  const capability = { profile: "private.current-footprint-combined-main-capability.v1" as const, executionAuthorized: false as const };
  const token = { profile: "private.current-footprint-clock-rpc-origin.v1" as const };
  const backend = new CurrentFootprintCopyMainBackendRunner(Object.freeze({
    assertCurrent: (): Promise<void> => Promise.resolve(), send: (): Promise<void> => Promise.resolve(), poll: (): Promise<string> => Promise.resolve("") }));
  // No synthetic issuer participates in this production negative check.
  assert.throws(() => { requireCurrentFootprintCombinedPairedSchedule(capability, backend, token); }, /COMBINED_MAIN_CAPABILITY/u);
});
void test("actual original exit unblocks a pending create join and joins the busy scheduler without a replacement reply", async () => {
  const f = await fixture(false);
  try {
    await f.scheduler.armClocks(); await f.scheduler.dispatchCreate(); await f.scheduler.collectClocks(); await f.scheduler.collectMain();
    const joined = f.scheduler.joinCreate(); const retained = assert.rejects(joined, /TERMINATED/u);
    await assert.rejects(f.scheduler.observeOriginalGenerationEnded(), /still live/u);
    assert.equal(f.scheduler.diagnostics()["busy"], true);
    f.channel.state.exited = true; f.rpc.state.exited = true; f.main.native.exited = true;
    await f.scheduler.observeOriginalGenerationEnded(); await retained;
    assert.equal(f.scheduler.diagnostics()["phase"], "ended"); assert.equal(f.channel.state.consumed, 1);
  } finally { f.channel.state.exited = true; await f.channel.channel.releaseAfterTermination(); }
});
void test("an armed main collector can settle before any renderer route exists, and another original backend cannot adopt its token", async () => {
  const main = await unarmedMainCompletionOriginFixture();
  const module = await actualModule("current-footprint-copy-paired-scheduler.ts", {
    "./current-footprint-copy-main-backend-runner.ts": { CurrentFootprintCopyMainBackendRunner: main.module.Constructor },
    "./current-footprint-copy-main-request-runner.ts": main.collectorModule,
  });
  const candidate = module["CurrentFootprintCopyPairedScheduler"]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual scheduler uses the same actual VM-loaded original backend/collector constructors above.
  const Scheduler = candidate as typeof CurrentFootprintCopyPairedScheduler;
  const scheduler = new Scheduler(main.backend, main.capability, main.oldOrigin, syntheticRequestPlan);
  const unrelated = new main.module.Constructor(Object.freeze({ assertCurrent: (): Promise<void> => Promise.resolve(),
    send: (): Promise<void> => Promise.resolve(), poll: (): Promise<string> => Promise.resolve("") }));
  assert.throws(() => { unrelated.requireRequestOrigin(main.capability, main.oldOrigin); }, /REQUEST_ORIGINAL_OWNER/u);
  await scheduler.armMain(); await assert.rejects(scheduler.observeOriginalGenerationEnded(), /GENERATION_LIVE/u);
  main.native.exited = true; await scheduler.observeOriginalGenerationEnded();
  assert.equal(scheduler.diagnostics()["phase"], "ended"); assert.equal(main.native.beginCount, 0);
});

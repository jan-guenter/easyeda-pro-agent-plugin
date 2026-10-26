import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_STARTUP_TIMING, currentPcbStartupWindowObservation } from "../src/current-pcb-209-worker-startup-timing.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";
import type { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { bootstrapLifecycleFixture } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";
// oxlint-disable-next-line import/max-dependencies -- The tests combine actual runner source, its fixed profile and the existing inert inspector boundary.
import { construction209Inspector, constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function retainFailure(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original operation is asserted separately.
  }
}
/** Only the monotonic clock is replaced. Actual runner, profile, validators,
 * original inspector callbacks and two-second request timers remain intact. */
async function timedRunner(transport: CurrentPcbWorkerConstructionTransport, now: () => number,
  legacy = false): Promise<CurrentPcb209WorkerConstructionRunner> {
  const path = new URL("../src/current-pcb-worker-construction-runner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`);
  assert.equal(typeof evaluate, "function");
  const load = (specifier: string): unknown => specifier === "./current-pcb-209-worker-startup-timing.ts"
    ? { CURRENT_PCB_209_STARTUP_TIMING, currentPcbStartupWindowObservation, currentPcbStartupMonotonicMs: now }
    : actualRequire(specifier) as unknown;
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]);
  const Constructor = loaded.exports[legacy ? "CurrentPcbWorkerConstructionRunner" : "CurrentPcb209WorkerConstructionRunner"];
  assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Both actual module constructors have this private lifecycle API; legacy is used solely for refusal checks.
  return Reflect.construct(Constructor, [transport]) as CurrentPcb209WorkerConstructionRunner;
}

void test("209 phase windows follow the serial await graph and preserve request and legacy limits", () => {
  assert.equal(CURRENT_PCB_209_STARTUP_TIMING.requestMs, 2000);
  assert.equal(CURRENT_PCB_209_STARTUP_TIMING.legacyPauseMs, 5000);
  assert.equal(CURRENT_PCB_209_STARTUP_TIMING.constructionArmMs, 50_000);
  assert.deepEqual([CURRENT_PCB_209_STARTUP_TIMING.bootstrapPauseMs, CURRENT_PCB_209_STARTUP_TIMING.sourcePauseMs,
    CURRENT_PCB_209_STARTUP_TIMING.projectPauseMs], [12_000, 14_000, 68_000]);
  assert.deepEqual(CURRENT_PCB_209_STARTUP_TIMING.constructionPauseMs, [24_000, 26_000, 26_000, 32_000, 32_000, 32_000, 26_000, 38_000, 16_000]);
});

void test("project import can remain paused beyond five seconds for bounded constructor arming", async () => {
  let now = 0;
  const fixture = await bootstrapLifecycleFixture({ timing: { now: () => now, beforeSource: () => { now += 1000; },
    beforeConstructionArmed: () => { now += 6000; } } });
  await fixture.owner.capture();
  assert.equal(fixture.owner.status().firstFailure, null);
  assert.equal(fixture.owner.status().workerScriptLoadedObserved, false);
  assert.ok(fixture.owner.status().bootstrapStages.every(stage => stage.resumeOrigin === "normal"));
  fixture.terminate(); await fixture.owner.releaseAfterTermination();
});

void test("expired project window retains first failure before cleanup resumes and rejects a later loader event", async () => {
  let now = 0;
  const fixture = await bootstrapLifecycleFixture({ timing: { now: () => now,
    beforeConstructionArmed: () => { now += 68_001; } }, loadedEvent: { role: "project" } });
  await assert.rejects(fixture.owner.capture(), /INITIAL_PAUSE_DEADLINE/u);
  const status = fixture.owner.status();
  const first = status.firstFailure;
  assert.equal(first?.code, "INITIAL_PAUSE_DEADLINE");
  assert.equal(first.step, "construction-arming"); assert.equal(first.bootstrapStage, "project");
  assert.deepEqual(first.window, { elapsedMs: 68_001, limitMs: 68_000 });
  assert.equal(first.resumeOrigin, null); assert.equal(first.resumeSeen, false);
  assert.equal(status.bootstrapStages.at(-1)?.resumeOrigin, "cleanup");
  assert.equal(status.firstEventFailure?.method, "Inspector.workerScriptLoaded");
  assert.equal(status.firstEventFailure.priorFailureCode, "INITIAL_PAUSE_DEADLINE");
  await fixture.owner.cleanup(); assert.equal(fixture.owner.status().firstFailure, first);
  assert.equal(fixture.commands.filter(command => command.method === "Debugger.resume").length, 7);
  fixture.terminate(); await fixture.owner.releaseAfterTermination();
});

void test("actual209 construction accepts aggregate pause work beyond five seconds and next pause before resume reply", { timeout: 30_000 }, async context => {
  const peer = await construction209Inspector(context);
  let earlyPauseReplies = 0, lastPauseAt = 0, now = 0, pauseNumber = 0;
  const durations: number[] = [];
  let nextPause = Promise.withResolvers<null>(), removals = 0;
  const removalBatch = Promise.withResolvers<null>();
  const transport: CurrentPcbWorkerConstructionTransport = { ...peer.transport,
    assertOriginalPinnedWorker: async () => { now += 600; await peer.transport.assertOriginalPinnedWorker(); },
    request: async command => {
      const arrived = nextPause.promise, pause = pauseNumber;
      const reply = await peer.transport.request(command);
      if (command.method === "Debugger.removeBreakpoint") {
        removals += 1;
        if (removals === 8) { now += 1900; removalBatch.resolve(null); }
        await removalBatch.promise;
      } else if (command.method === "Debugger.resume" && pause < 9) {
        await arrived; now += 1200; earlyPauseReplies += 1;
      } else { now += 400; }
      return reply;
    },
    subscribe: events => peer.transport.subscribe({ ...events,
      paused: raw => {
        lastPauseAt = now; pauseNumber += 1; events.paused(raw);
        nextPause.resolve(null); nextPause = Promise.withResolvers<null>();
      },
      resumed: () => { durations.push(now - lastPauseAt); events.resumed(); },
    }),
  };
  const runner = await timedRunner(transport, () => now);
  const capture = runner.capture(); void retainFailure(capture);
  await runner.whenArmed(); const running = peer.run(); void retainFailure(running);
  await capture; await running;
  assert.equal(earlyPauseReplies, 8); assert.equal(durations.length, 9); assert.ok(durations[0] !== undefined && durations[0] > 5000);
  assert.equal(runner.status().firstFailure, null); assert.equal(runner.status().resumeOrigin, "normal");
  assert.equal(peer.commands.filter(command => command === "Debugger.removeBreakpoint").length, 8);
  await runner.release();
});

void test("legacy actual construction still refuses an aggregate pause beyond five seconds and resumes once", { timeout: 30_000 }, async context => {
  const peer = await constructionInspector(context); let now = 0;
  const transport: CurrentPcbWorkerConstructionTransport = { ...peer.transport,
    assertOriginalPinnedWorker: async () => { now += 600; await peer.transport.assertOriginalPinnedWorker(); },
    request: async command => { const reply = await peer.transport.request(command); now += 400; return reply; },
  };
  const runner = await timedRunner(transport, () => now, true);
  const capture = runner.capture(), refused = assert.rejects(capture, /PAUSE_DEADLINE/u);
  await runner.whenArmed(); const running = peer.run(); void retainFailure(running);
  await refused; await running;
  assert.equal(runner.status().firstFailure?.window?.limitMs, 5000);
  assert.equal(runner.status().firstFailure?.code, "PAUSE_DEADLINE");
  assert.equal(runner.status().resumeOrigin, "cleanup");
  assert.deepEqual(peer.counts(), { pauses: 1, resumes: 1 }); await runner.release();
});

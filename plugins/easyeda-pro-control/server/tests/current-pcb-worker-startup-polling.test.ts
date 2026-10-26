import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import type { CurrentPcb209WorkerStartupChannel, CurrentPcbWorkerStartupNativeDependency, CurrentPcbWorkerStartupParent } from "../src/current-pcb-worker-startup-channel.ts";

async function flush(): Promise<void> { for (let index = 0; index < 16; index += 1) { await Promise.resolve(); } }

void test("startup polling separates idle time from cumulative transport work and keeps its original deadline", async context => {
  let now = 0n;
  const clock = context.mock.method(process.hrtime, "bigint", () => now);
  // The module captures the real platform function once. Substitution is local
  // To this isolated test process; production has no clock or budget parameter.
  const { CurrentPcb209WorkerStartupChannel: Channel } = await import("../src/current-pcb-worker-startup-channel.ts");
  clock.mock.restore();
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const tick = async (milliseconds: number): Promise<void> => {
    now += BigInt(milliseconds) * 1_000_000n; context.mock.timers.tick(milliseconds); await flush();
  };
  const fixture = async (scope: TestContext): Promise<Readonly<{
    channel: CurrentPcb209WorkerStartupChannel;
    dependency: Awaited<ReturnType<CurrentPcb209WorkerStartupChannel["start"]>>;
    state: { reply: boolean; terminated: boolean; sends: number; polls: number; parentEvents: number; terminations: number; peak: number; parentReads: number };
    chunks: Buffer[];
  }>> => {
    const chunks: Buffer[] = [], parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 1 });
    const state = { reply: true, terminated: false, sends: 0, polls: 0, parentEvents: 0, terminations: 0, peak: 0, parentReads: 0 };
    let active = 0;
    const native: CurrentPcbWorkerStartupNativeDependency = {
      requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => { state.parentReads += 1; return Promise.resolve(parent); },
      assertOriginalTermination: (): Promise<void> => {
        state.terminations += 1; assert.equal(state.terminated, true); return Promise.resolve();
      },
      observeOriginalParentEvent: (): void => { state.parentEvents += 1; },
      exchange: async request => {
        active += 1; state.peak = Math.max(active, state.peak);
        try {
          await Promise.resolve();
          if (request.action === "poll") { state.polls += 1; return { bytes: (chunks.shift() ?? Buffer.alloc(0)).toString("base64") }; }
          state.sends += 1; assert.ok("requestId" in request);
          if (state.reply) { chunks.push(Buffer.from(`${JSON.stringify({ id: request["requestId"], result: { targetInfos: [] } })}\0`)); }
          return { written: true };
        } finally { active -= 1; }
      },
    };
    const channel = new Channel(native), dependency = await channel.start();
    dependency.subscribe(() => { assert.fail("No worker event is part of this synthetic parent-only fixture"); });
    scope.after(async () => { state.terminated = true; if (!channel.status().released) { await channel.releaseAfterTermination(); } });
    return { channel, dependency, state, chunks };
  };

  await context.test("more than8192 idle checks remain healthy and a new command wakes the existing idle timer", async scope => {
    const value = await fixture(scope);
    await tick(0);
    for (let index = 0; index < 8192; index += 1) { await tick(250); }
    assert.equal(value.channel.status().failed, false); assert.equal(value.channel.status().idlePollCount, 8193);
    assert.equal(value.channel.status().dataPollCount, 0); assert.equal(value.channel.status().waitingPollCount, 0);
    assert.equal(value.channel.status().pollCount, 8193);
    const request = value.dependency.request({ method: "Target.getTargets", params: {} }); await flush();
    assert.equal(value.state.sends, 1); await tick(0);
    assert.deepEqual(await request, { targetInfos: [] }); assert.equal(value.channel.status().dataPollCount, 1);
    await tick(20); const polls = value.state.polls;
    value.chunks.push(Buffer.from(`${JSON.stringify({ method: "Page.lifecycleEvent", sessionId: "parent-session", params: {} })}\0`));
    await tick(249); assert.equal(value.state.polls, polls);
    await tick(1); assert.equal(value.state.parentEvents, 1); assert.equal(value.state.peak, 1);
    assert.equal(value.channel.status().idlePollCount, 8194);
  });

  await context.test("pending waits retain their cumulative limit across intervening data and release after fatal exhaustion", async scope => {
    const value = await fixture(scope); value.state.reply = false;
    const rejected = assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }), /WAIT_POLL_BUDGET/u);
    await flush(); await tick(0);
    for (let index = 1; index < 8192; index += 1) {
      if (index === 4096) {
        value.chunks.push(Buffer.from(`${JSON.stringify({ method: "Page.lifecycleEvent", sessionId: "parent-session", params: {} })}\0`));
        await tick(20); assert.equal(value.channel.status().waitingPollCount, 4096);
      }
      await tick(20);
    }
    assert.equal(value.channel.status().waitingPollCount, 8192); assert.equal(value.channel.status().fatal, false);
    await tick(20); await rejected;
    assert.equal(value.channel.status().failureCode, "WAIT_POLL_BUDGET");
    assert.equal(value.channel.status().dataPollCount, 1); assert.equal(value.channel.status().idlePollCount, 0);
    assert.equal(value.channel.status().pendingReplies, 1); assert.equal(value.state.peak, 1);
    await assert.rejects(value.channel.releaseAfterTermination()); assert.equal(value.channel.status().released, false);
    value.state.terminated = true; await value.dependency.assertOriginalTermination(); await value.channel.releaseAfterTermination();
    assert.equal(value.channel.status().released, true); assert.equal(value.channel.status().pendingReplies, 0);
    assert.equal(value.channel.status().failureCode, "WAIT_POLL_BUDGET");
  });

  await context.test("partial frames stay active and noisy data cannot reset either consumed budget", async scope => {
    const value = await fixture(scope); value.chunks.push(Buffer.from(" ")); await tick(0);
    await tick(20); assert.equal(value.channel.status().waitingPollCount, 1); assert.equal(value.channel.status().idlePollCount, 0);
    for (let index = 1; index < 8192; index += 1) { value.chunks.push(Buffer.from(" ")); await tick(20); }
    assert.equal(value.channel.status().dataPollCount, 8192); assert.equal(value.channel.status().fatal, false);
    value.chunks.push(Buffer.from(" ")); await tick(20);
    assert.equal(value.channel.status().failureCode, "DATA_POLL_BUDGET"); assert.equal(value.channel.status().waitingPollCount, 1);
    assert.equal(value.channel.status().fatal, true); assert.equal(value.state.peak, 1);
  });

  await context.test("the fixed lifetime refuses new commands before an idle timer runs and keeps native termination reachable", async scope => {
    const value = await fixture(scope); await tick(0);
    now += 3_600_000_000_000n;
    await assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }), /LIFETIME/u);
    assert.equal(value.state.sends, 0); assert.equal(value.state.polls, 1); assert.equal(value.channel.status().failureCode, "LIFETIME");
    await assert.rejects(value.dependency.assertOriginalOwner(), /LIFETIME/u);
    value.state.terminated = true; await value.dependency.assertOriginalTermination(); await value.channel.releaseAfterTermination();
    assert.equal(value.channel.status().released, true); assert.equal(value.state.terminations, 2);
  });

  await context.test("construction starts the nonrenewable lifetime even before owner admission", async () => {
    let parentReads = 0, terminations = 0;
    const channel = new Channel({
      requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => {
        parentReads += 1; return Promise.resolve(Object.freeze({ targetId: "parent", sessionId: "session", nextRequestId: 1 }));
      },
      assertOriginalTermination: (): Promise<void> => { terminations += 1; return Promise.resolve(); },
      observeOriginalParentEvent: (): void => { assert.fail("No admitted owner"); },
      exchange: (): Promise<unknown> => Promise.reject(new Error("No admitted owner")),
    });
    now += 3_600_000_000_000n;
    await assert.rejects(channel.start(), /LIFETIME/u); assert.equal(parentReads, 0);
    await channel.releaseAfterTermination(); assert.equal(terminations, 1); assert.equal(channel.status().released, true);
  });

  context.mock.timers.reset();
  await context.test("original native owner still closes and releases its synthetic helper after the channel lifetime expires", async scope => {
    const { CurrentPcbWorkerStartupOwner } = await import("../src/current-pcb-diagnostic-owner.ts");
    const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), "opening-worker-startup"],
      { stdio: ["pipe", "pipe", "pipe"] });
    const owner = new CurrentPcbWorkerStartupOwner(child, (): Promise<void> => Promise.resolve(), null,
      (): Promise<void> => Promise.resolve(), (): Promise<void> => Promise.resolve());
    owner.start();
    scope.after(async () => {
      if (!owner.status().helperClosed) {
        // Only the spawned synthetic test peer; never a production helper.
        const closed = once(child, "close"); child.stdin.end(); await closed;
      }
    });
    await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true });
    await owner.browserObservation(); await owner.inspectFrames("target-1");
    const source = "const syntheticIdentity = true;\n";
    await owner.inspectScript("frame-1", { family: "ui", relativePath: "pro-ui/test-version/js/ui.js",
      scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) });
    const handoff = await owner.handoffWorkerStartup(); now += 3_600_000_000_000n;
    await assert.rejects(handoff.dependency.request({ method: "Target.getTargets", params: {} }), /LIFETIME/u);
    assert.equal(handoff.channel.status().fatal, true); assert.equal(handoff.channel.status().released, false);
    await assert.rejects(owner.releaseClosed(), /RETAIN_LIVE_OWNER/u);
    assert.equal(await owner.observeApplicationWindow(), "456"); await owner.requestNormalClose("456");
    assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
    assert.equal(handoff.channel.status().released, true); assert.equal(owner.status().closeConsumed, true);
    assert.equal(owner.status().helperClosed, true); assert.equal(child.exitCode, 0); assert.equal(child.signalCode, null);
    const status = handoff.channel.status(); assert.ok("failureCode" in status); assert.equal(status.failureCode, "LIFETIME");
  });
});

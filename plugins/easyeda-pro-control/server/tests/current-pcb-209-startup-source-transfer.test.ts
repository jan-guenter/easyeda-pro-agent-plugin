import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcb209StartupSourceTransfer } from "../src/current-pcb-209-startup-source-transfer.ts";
import { CURRENT_PCB_209_STARTUP_TIMING } from "../src/current-pcb-209-worker-startup-timing.ts";
import { currentPcb209RatlineContinuationSourceBudget } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import { bootstrapLifecycleFixture } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";

async function flush(): Promise<void> { for (let index = 0; index < 32; index += 1) { await Promise.resolve(); } }
void test("209 startup source ceilings match the pinned native drain model and retain parent caps", () => {
  const project = currentPcb209StartupSourceTransfer("project");
  assert.deepEqual(project, { role: "project", sourceBytes: 2_181_308, frameBytes: 13_088_872, chunks: 200, deadlineMilliseconds: 6540 });
  for (const [role, ordinal] of [["preload", 1], ["preload-copy-1", 2], ["preload-copy-4", 5]] as const) {
    const existing = currentPcb209RatlineContinuationSourceBudget("child", ordinal), selected = currentPcb209StartupSourceTransfer(role);
    assert.equal(selected.sourceBytes, existing.sourceBytes); assert.equal(selected.frameBytes, existing.frameBytes);
    assert.equal(selected.deadlineMilliseconds, existing.deadlineMilliseconds);
  }
  assert.equal(CURRENT_PCB_209_STARTUP_TIMING.requestMs, 2000); assert.equal(CURRENT_PCB_209_STARTUP_TIMING.legacyPauseMs, 5000);
  assert.deepEqual([CURRENT_PCB_209_STARTUP_TIMING.bootstrapPauseMs, CURRENT_PCB_209_STARTUP_TIMING.sourcePauseMs,
    CURRENT_PCB_209_STARTUP_TIMING.projectPauseMs], [12_000, 14_000, 68_000]);
});

void test("project source arriving after two seconds is qualified once within its fixed transfer allowance", async context => {
  let now = 0;
  const delivered = Promise.withResolvers<unknown>(), entered = Promise.withResolvers<Readonly<{ scriptSource: string }>>();
  const fixture = await bootstrapLifecycleFixture({ timing: { now: () => now }, sourceReply: (role, reply) => {
    if (role === "project") { entered.resolve(reply); return delivered.promise; } return Promise.resolve(reply);
  } });
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const captured = fixture.owner.capture(), reply = await entered.promise; await flush();
  now += 2501; context.mock.timers.tick(2501); await flush();
  assert.equal(fixture.owner.status().failed, false); assert.equal(fixture.constructed(), 0);
  assert.equal(fixture.owner.status().bootstrapStages.at(-1)?.sourceQualified, false);
  delivered.resolve(reply); await captured;
  assert.equal(fixture.owner.status().sourceQualified, true); assert.equal(fixture.constructed(), 1);
  assert.equal(fixture.commands.filter(command => command.method === "Debugger.getScriptSource" && command.params.scriptId === "project-script").length, 1);
  assert.equal(fixture.commands.filter(command => command.method === "Debugger.resume").length, 7);
  fixture.terminate(); await fixture.owner.releaseAfterTermination();
});

void test("source delivery timeout retains its exact cause and late reply cannot qualify or replay the stage", async context => {
  let now = 0;
  const delivered = Promise.withResolvers<unknown>(), entered = Promise.withResolvers<Readonly<{ scriptSource: string }>>();
  const fixture = await bootstrapLifecycleFixture({ timing: { now: () => now }, sourceReply: (role, reply) => {
    if (role === "project") { entered.resolve(reply); return delivered.promise; } return Promise.resolve(reply);
  } });
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const rejected = assert.rejects(fixture.owner.capture(), /PCB_WORKER_STARTUP_DEADLINE/u), reply = await entered.promise;
  await flush(); now += 6540; context.mock.timers.tick(6540); await rejected;
  const first = fixture.owner.status().firstFailure;
  assert.equal(first?.code, "CAPTURE"); assert.equal(first.reason, "deadline"); assert.equal(first.step, "source-read");
  assert.deepEqual(first.sourceTransfer, { role: "project", limitMs: 6540, stageRemainingMs: 68_000 });
  assert.equal(fixture.owner.status().bootstrapStages.at(-1)?.resumeOrigin, "cleanup");
  const count = fixture.commands.length; delivered.resolve(reply); await flush();
  assert.equal(fixture.commands.length, count); assert.equal(fixture.constructed(), 0);
  assert.equal(fixture.owner.status().firstFailure, first); assert.equal(fixture.owner.status().sourceQualified, false);
  await fixture.owner.cleanup(); fixture.terminate(); await fixture.owner.releaseAfterTermination();
});

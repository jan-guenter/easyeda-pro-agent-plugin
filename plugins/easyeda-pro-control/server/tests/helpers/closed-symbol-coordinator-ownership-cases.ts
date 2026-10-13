import assert from "node:assert/strict";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";

void test("concurrent full coordinator refusal does not release the first full-flow ownership", async (context) => {
  const f = await fixture(context), reached = Promise.withResolvers<null>(), resume = Promise.withResolvers<null>();
  f.state.onStartup = async (): Promise<void> => {
    if (f.state.sessionSequence === 2) { reached.resolve(null); await resume.promise; }
  };
  const first = f.stage.recordFullEvidence(f.plan);
  await reached.promise;
  const concurrent = new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity);
  await assert.rejects(concurrent.recordFullEvidence(f.plan), /consumed|running/u);
  await assert.rejects(concurrent.recordBaseline(f.plan), /consumed|running/u);
  assert.equal(f.events.filter((event) => event === "launch").length, 2);
  resume.resolve(null);
  const result = await first;
  assert.equal(result.sequence, 44); assert.equal(result.completionProved, false);
  assert.equal(f.events.filter((event) => event === "launch").length, 3);
  assert.equal(f.state.writes, 1);
});

void test("later generation pending termination polls repeat proof only and keep each close one-shot", async (context) => {
  const f = await fixture(context);
  const before = f.owner.state.onFrame;
  f.owner.state.onFrame = (action): void => {
    before?.(action);
    if (action === "normal-close" && f.state.sessionSequence >= 2) {
      f.owner.state.code = "authority-prior-job-not-empty"; f.owner.state.remaining = 1;
    }
  };
  const result = await f.stage.recordFullEvidence(f.plan);
  assert.equal(result.sequence, 44); assert.equal(result.completionProved, false);
  assert.equal(f.owner.state.pendingReplies, 2);
  assert.equal(f.events.filter((event) => event === "normal-close").length, 3);
  assert.equal(f.events.filter((event) => event === "launch").length, 3);
  assert.equal(f.state.writes, 1);
});

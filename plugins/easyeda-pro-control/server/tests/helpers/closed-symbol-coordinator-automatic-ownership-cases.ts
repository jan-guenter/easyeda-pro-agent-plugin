import assert from "node:assert/strict";
import { test } from "node:test";
import { assertConsumed, fixture, phase } from "./closed-symbol-coordinator-automatic-fixture.ts";
import { pauseNextSelection, selectionCalls, waitForSelection } from "./closed-symbol-coordinator-automatic-observer.ts";
import { ClosedSymbolCoordinator, originalClosedSymbolFullEvidenceKind } from "../../src/closed-symbol-coordinator.ts";
import { selectOriginalBaselineHead } from "../../src/closed-symbol-head-selector.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";

export function registerSelectionDrift(drift: "caller" | "owner" | "lifecycle"): void {
  void test(`automatic selector rechecks ${drift} after its actual awaited result`, async (context) => {
    const f = await fixture(context, "aged"); const calls = selectionCalls(), pause = pauseNextSelection();
    const pending = f.stage.recordAutomaticFullEvidence(f.plan);
    let changed = false;
    try {
      const observed = await waitForSelection(pause, pending);
      assert.equal(observed.selected.headEligibility, "aged-unlocked"); assert.equal(f.stage.retained()["headEligibility"], undefined);
      assert.equal(f.stage.retained()["mainReference"], undefined); assert.equal(f.events.filter((value) => value === "launch").length, 1);
      if (drift === "caller") { f.plan["targetUuid"] = "e".repeat(32); }
      else if (drift === "owner") { const method = f.upstream.bridgeSessionLifecycle.bind(f.upstream); context.mock.method(f.upstream, "bridgeSessionLifecycle", method); }
      else { await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 4 }); }
      changed = true;
    } finally { pause.resume(); }
    await assert.rejects(pending, /caller|owner|invalidated|lifecycle/u); assert.equal(changed, true);
    assert.equal(selectionCalls() - calls, 1); await phase(f, 10); assert.equal(f.stage.retained()["headEligibility"], undefined);
    assert.equal(f.transport.calls, 0); assert.equal(f.state.opens, 0); assert.equal(f.state.writes, 0); await assertConsumed(f);
  });
}
export function registerConcurrent(): void {
  void test("selector pause preserves exclusive ownership and rejects cloned baseline evidence", async (context) => {
    const f = await fixture(context); const calls = selectionCalls(), pause = pauseNextSelection();
    const pending = f.stage.recordAutomaticFullEvidence(f.plan);
    try {
      const observed = await waitForSelection(pause, pending);
      const [journal, events, copy, inventory] = observed.inputs;
      assert.equal(f.stage.retained()["headEligibility"], undefined); assert.equal(observed.selected.headEligibility, "locked");
      await assert.rejects(selectOriginalBaselineHead(journal, events, structuredClone(copy), inventory), /issued|original/iu);
      await assert.rejects(selectOriginalBaselineHead(journal, events, copy, structuredClone(inventory)), /completed|original|issued/iu);
      assert.deepEqual(await selectOriginalBaselineHead(journal, events, copy, inventory), observed.selected);
      const competitor = new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity);
      await assert.rejects(competitor.recordAutomaticFullEvidence(f.plan), /consumed|active/u);
      await assert.rejects(competitor.recordFullEvidence(f.plan), /consumed|active/u);
      await assert.rejects(competitor.recordAgedFullEvidence(f.plan), /consumed|active/u);
      await assert.rejects(competitor.recordBaseline(f.plan), /consumed|active/u);
      await assert.rejects(f.stage.recordAutomaticFullEvidence(f.plan), /consumed|active/u);
      assert.equal(f.events.filter((value) => value === "launch").length, 1); assert.equal(f.transport.calls, 0);
      assert.equal(f.stage.retained()["headEligibility"], undefined);
    } finally { pause.resume(); }
    const result = await pending; assert.equal(result.sequence, 44); assert.equal(selectionCalls() - calls, 1);
    assert.equal(originalClosedSymbolFullEvidenceKind(result, f.engine, result.operationId), "locked");
    assert.equal(f.events.filter((value) => value === "launch").length, 3); assert.equal(f.state.writes, 1);
    await assertConsumed(f);
  });
}
export function registerBaselineConsumed(): void {
  void test("a separate completed baseline cannot be resumed through automatic entry", async (context) => {
    const f = await fixture(context); const calls = selectionCalls();
    const baseline = await f.stage.recordBaseline(f.plan); assert.equal(baseline.sequence, 10);
    assert.equal(selectionCalls(), calls); assert.equal(f.transport.calls, 0); await assertConsumed(f);
  });
}

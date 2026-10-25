import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineContinuationBudget, assertOriginalCurrentPcb209RatlineContinuationBudget,
  currentPcb209RatlineContinuationSourceBudget, CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as profile } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import type { CurrentPcb209RatlineContinuationReplyKind } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import { CurrentPcb209RatlineBudget, assertOriginalCurrentPcb209RatlineBudget } from "../src/current-pcb-209-ratline-budget.ts";

function prefix(): CurrentPcb209RatlineContinuationBudget {
  const budget = new CurrentPcb209RatlineContinuationBudget(); budget.consumeDiscoveryRequest(1); budget.closeDiscovery(2); return budget;
}
function consume(budget: CurrentPcb209RatlineContinuationBudget, kind: CurrentPcb209RatlineContinuationReplyKind): void {
  const id = budget.snapshot().requests + 1; budget.consumeRequest(id, kind); budget.consumeReply(id, 1);
}
void test("fresh three-realm transcript fits its original ledger and leaves exactly 56 cleanup requests", () => {
  assert.equal(profile.normalRequestLimit, 438); assert.equal(profile.cleanupRequests, 56); assert.equal(profile.requestLimit, 494);
  assert.equal(profile.requestClasses["pcb-capture"].count, 28); assert.equal(profile.requestClasses["worker-capture"].count, 67);
  const budget = prefix();
  for (let count = 1; count < profile.requestClasses.prefix.count; count += 1) { consume(budget, "prefix"); }
  budget.beginContinuation();
  for (const kind of ["preparation", "navigation", "loader", "ancestry", "pcb-source", "child-source", "subordinate-source",
    "pcb-bootstrap", "child-bootstrap", "subordinate-bootstrap", "pcb-construction", "worker-construction", "pcb-capture", "worker-capture", "origin-stack"] as const) {
    for (let count = 0; count < profile.requestClasses[kind].count; count += 1) { consume(budget, kind); }
  }
  assert.equal(budget.snapshot().requests, 438); budget.beginCleanup();
  for (let count = 0; count < 56; count += 1) { consume(budget, "cleanup"); }
  assert.equal(budget.snapshot().requests, 494);
  assert.throws(() => { consume(budget, "cleanup"); }, /REQUEST_ID_OR_PHASE/u);
});
void test("fresh source reservations retain separate 29/7/7 ordinals and complete frame bounds", () => {
  const budget = prefix(); budget.beginContinuation();
  for (const [kind, role, count] of [["pcb-source", "pcb", 29], ["child-source", "child", 7], ["subordinate-source", "subordinate", 7]] as const) {
    assert.equal(profile.sources[role].length, count);
    for (const [ordinal, slot] of profile.sources[role].entries()) {
      assert.equal(currentPcb209RatlineContinuationSourceBudget(role, ordinal), slot);
      const id = budget.snapshot().requests + 1, reservation = budget.consumeRequest(id, kind);
      assert.equal(reservation.sourceOrdinal, ordinal); assert.equal(reservation.frameBytes, slot.frameBytes);
      assert.equal(slot.frameBytes, 6 * slot.sourceBytes + profile.frames.envelope);
      budget.consumeReply(id, slot.frameBytes);
    }
    assert.equal(budget.remainingRequests(kind), 0);
  }
  assert.throws(() => { budget.consumeRequest(budget.snapshot().requests + 1, "subordinate-source"); }, /REQUEST_LIMIT/u);
  budget.beginCleanup(); consume(budget, "cleanup");
  assert.throws(() => { budget.beginContinuation(); }, /NORMAL_CLOSED/u);
});
void test("held and continuation ledgers cannot exchange original authority or copy usage", () => {
  const fresh = prefix(), held = new CurrentPcb209RatlineBudget();
  assertOriginalCurrentPcb209RatlineBudget(held); assertOriginalCurrentPcb209RatlineContinuationBudget(fresh);
  // Runtime crossing deliberately bypasses the structurally separate private fields.
  /* oxlint-disable typescript/no-unsafe-type-assertion */
  assert.throws(() => { assertOriginalCurrentPcb209RatlineContinuationBudget(held as unknown as CurrentPcb209RatlineContinuationBudget); }, /ORIGINAL/u);
  assert.throws(() => { assertOriginalCurrentPcb209RatlineBudget(fresh as unknown as CurrentPcb209RatlineBudget); }, /ORIGINAL/u);
  const copied = Object.assign(Object.create(CurrentPcb209RatlineContinuationBudget.prototype), fresh.snapshot()) as CurrentPcb209RatlineContinuationBudget;
  /* oxlint-enable typescript/no-unsafe-type-assertion */
  assert.throws(() => { assertOriginalCurrentPcb209RatlineContinuationBudget(copied); }, /ORIGINAL/u);
  assert.throws(() => { assertOriginalCurrentPcb209RatlineContinuationBudget(new Proxy(fresh, {})); }, /ORIGINAL/u);
  const before = fresh.snapshot(); fresh.endAfterOriginalTermination();
  assert.equal(fresh.snapshot().requests, before.requests); assert.throws(() => { fresh.assertNormal(); }, /NORMAL_CLOSED/u);
});
void test("composed native controls fit their additive cap and leave the cleanup reserve after normal exhaustion", () => {
  const budget = prefix();
  // Counts include the existing prefix allowance, actual composed callbacks,
  // Three packet rechecks, wrapper, optional origin and both UI pauses.
  const controls = 2976 + 756 + 5892 + 108 + 36 + 8;
  for (let count = 0; count < controls; count += 1) { budget.consumeHelperControl(); }
  assert.equal(budget.snapshot().helperControls, 9776);
  assert.throws(() => { budget.consumeHelperControl(); }, /HELPER_CONTROL_BOUND/u);
  budget.beginCleanup();
  for (let count = 0; count < 128; count += 1) { budget.consumeHelperControl(true); }
  assert.equal(budget.snapshot().helperControls, 9904);
  assert.throws(() => { budget.consumeHelperControl(true); }, /HELPER_CONTROL_BOUND/u);
});

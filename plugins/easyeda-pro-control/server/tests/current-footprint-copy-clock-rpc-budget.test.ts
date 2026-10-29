/** Pure accounting checks. No native owner, process or writer is exercised. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyClockRpcBudget, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET as LIMITS,
  requireCurrentFootprintCopyClockRpcHandoffHeadroom } from "../src/current-footprint-copy-clock-rpc-budget.ts";

void test("complete interleaved RPC unit stays inside the original normal-ID ceiling", () => {
  assert.deepEqual(LIMITS, { normal: 49, cleanup: 18, total: 67, handoffMaximum: 2,
    maximumNormalId: 802, maximumRequestId: 847, handoffAndUnit: 69 });
  const reservation = requireCurrentFootprintCopyClockRpcHandoffHeadroom(734);
  assert.deepEqual(reservation, { nextId: 734, lastReservedId: 802, handoffMaximum: 2, reservedIds: 69 });
  const budget = new CurrentFootprintCopyClockRpcBudget(736);
  let id = 736;
  // Fourteen cleanup commands precede the final normal command. A normal-class
  // Count of49 therefore does not establish the final command's native ID.
  for (let index = 0; index < 48; index += 1) { budget.consume(id, false); id += 1; }
  for (let index = 0; index < 14; index += 1) { budget.consume(id, true); id += 1; }
  budget.consume(id, false); assert.equal(id, 798); id += 1;
  for (let index = 0; index < 4; index += 1) { budget.consume(id, true); id += 1; }
  const complete = budget.snapshot();
  assert.equal(complete.nextId, 803); assert.equal(complete.lastReservedId, 802);
  assert.equal(complete.normalConsumed, 49); assert.equal(complete.cleanupConsumed, 18); assert.equal(complete.consumed, 67);
  assert.equal(complete.executionAuthorized, false); assert.equal(complete.originalGenerationExitRequired, false);
  budget.requireCompleted(); budget.retire(); assert.equal(budget.snapshot().retired, true); assert.equal(budget.snapshot().nextId, id);
  assert.throws(() => { budget.consume(id, false); }, /UNAVAILABLE/u);
  assert.throws(() => { budget.retire(); }, /UNAVAILABLE/u);
});

void test("handoff headroom preserves both original releases and refuses even an all-cleanup tail beyond802", () => {
  assert.throws(() => requireCurrentFootprintCopyClockRpcHandoffHeadroom(735), /HEADROOM/u);
  assert.equal(new CurrentFootprintCopyClockRpcBudget(736).snapshot().lastReservedId, 802);
  assert.throws(() => new CurrentFootprintCopyClockRpcBudget(737), /HEADROOM/u);
  for (const value of [-1, 0, -0, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 848, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => new CurrentFootprintCopyClockRpcBudget(value), /START_ID/u);
    assert.throws(() => requireCurrentFootprintCopyClockRpcHandoffHeadroom(value), /START_ID/u);
  }
  assert.equal(requireCurrentFootprintCopyClockRpcHandoffHeadroom(1).lastReservedId, 69);
});

void test("gaps, duplicate IDs and malformed classification poison without charging an unsent command", () => {
  for (const candidate of [19, 21, 20.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const budget = new CurrentFootprintCopyClockRpcBudget(20);
    assert.throws(() => { budget.consume(candidate, false); }, /CONTIGUOUS_ID/u);
    assert.equal(budget.snapshot().consumed, 0); assert.equal(budget.snapshot().nextId, 20);
    assert.equal(budget.snapshot().originalGenerationExitRequired, true);
    assert.throws(() => { budget.consume(20, false); }, /UNAVAILABLE/u);
  }
  const budget = new CurrentFootprintCopyClockRpcBudget(20); budget.consume(20, false);
  assert.throws(() => { budget.consume(20, false); }, /CONTIGUOUS_ID/u);
  assert.equal(budget.snapshot().consumed, 1); assert.equal(budget.snapshot().nextId, 21);
  const malformed = new CurrentFootprintCopyClockRpcBudget(20);
  assert.throws(() => { Reflect.apply(malformed.consume.bind(malformed), undefined, [20, 1]); }, /CLASSIFICATION/u);
  assert.equal(malformed.snapshot().consumed, 0);
});

void test("normal and cleanup class exhaustion refuse before dispatch even when IDs remain", () => {
  for (const cleanup of [false, true]) {
    const budget = new CurrentFootprintCopyClockRpcBudget(100), maximum = cleanup ? LIMITS.cleanup : LIMITS.normal;
    for (let index = 0; index < maximum; index += 1) { budget.consume(100 + index, cleanup); }
    assert.throws(() => { budget.consume(100 + maximum, cleanup); }, /CLASS_LIMIT/u);
    assert.equal(budget.snapshot().consumed, maximum); assert.equal(budget.snapshot().nextId, 100 + maximum);
    assert.equal(budget.snapshot().failed, true);
  }
});

void test("lost acknowledgement retains consumed IDs when retirement is refused, without a reset or exit claim", () => {
  const budget = new CurrentFootprintCopyClockRpcBudget(300);
  budget.consume(300, false); budget.consume(301, true); budget.fail();
  const failed = budget.snapshot(); assert.equal(failed.consumed, 2); assert.equal(failed.nextId, 302);
  budget.fail(); assert.deepEqual(budget.snapshot(), failed);
  assert.throws(() => { budget.consume(302, false); }, /UNAVAILABLE/u);
  assert.throws(() => { budget.requireCompleted(); }, /UNAVAILABLE/u);
  assert.throws(() => { budget.retire(); }, /UNAVAILABLE/u);
  assert.deepEqual(budget.snapshot(), failed);
  assert.equal(failed.normalConsumed, 1); assert.equal(failed.cleanupConsumed, 1); assert.equal(failed.nextId, 302);
  assert.equal(Object.isFrozen(failed), true); assert.equal(failed.executionAuthorized, false);
});

void test("uninvoked cleanup counts alone cannot retire or refund a partial unit", () => {
  const budget = new CurrentFootprintCopyClockRpcBudget(10);
  assert.throws(() => { budget.requireCompleted(); }, /INCOMPLETE/u);
  assert.equal(budget.snapshot().failed, false);
  for (let index = 0; index < 13; index += 1) { budget.consume(10 + index, false); }
  for (let index = 0; index < 8; index += 1) { budget.consume(23 + index, true); }
  assert.throws(() => { budget.retire(); }, /INCOMPLETE/u);
  assert.equal(budget.snapshot().consumed, 21); assert.equal(budget.snapshot().nextId, 31);
  assert.equal(budget.snapshot().retired, false); assert.equal(budget.snapshot().originalGenerationExitRequired, true);
  assert.equal(budget.snapshot().lastReservedId, 76); assert.equal(budget.snapshot().executionAuthorized, false);
  assert.throws(() => { budget.consume(31, false); }, /UNAVAILABLE/u);
});

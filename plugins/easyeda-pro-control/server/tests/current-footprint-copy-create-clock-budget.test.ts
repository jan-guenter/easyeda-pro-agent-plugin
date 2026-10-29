/** Pure partial accounting. No original process, clock or writer is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyCreateClockBudget, CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET as LIMITS,
  requireCurrentFootprintCopyCreateClockHandoffHeadroom } from "../src/current-footprint-copy-create-clock-budget.ts";
import { CurrentFootprintCopyClockRpcBudget } from "../src/current-footprint-copy-clock-rpc-budget.ts";

function arms(budget: CurrentFootprintCopyCreateClockBudget, first: number): void {
  for (let index = 0; index < 13; index += 1) { budget.consume(first + index, false); }
}
void test("one create at offset13 composes with all67 clock requests inside the derived normal-ID ceiling", () => {
  assert.equal(LIMITS.total, 68); assert.equal(LIMITS.normal, 50); assert.equal(LIMITS.cleanup, 18);
  const ceiling = LIMITS.maximumNormalId, first = ceiling - LIMITS.total + 1, handoff = first - LIMITS.handoffMaximum;
  assert.deepEqual(requireCurrentFootprintCopyCreateClockHandoffHeadroom(handoff), {
    nextId: handoff, lastReservedId: ceiling, handoffMaximum: 2, reservedIds: 70 });
  const budget = new CurrentFootprintCopyCreateClockBudget(first);
  arms(budget, first); budget.consumeCreate(first + 13);
  // Exercise interleaving rather than a misleading all-normal-first layout.
  let id = first + 14;
  for (let index = 0; index < 35; index += 1) { budget.consume(id, false); id += 1; }
  for (let index = 0; index < 16; index += 1) { budget.consume(id, true); id += 1; }
  budget.consume(id, false); id += 1;
  budget.consume(id, true); id += 1; budget.consume(id, true); id += 1;
  budget.requireCompleted(); budget.retire();
  assert.deepEqual(budget.snapshot(), { startId: first, nextId: ceiling + 1, lastReservedId: ceiling,
    clockNormalConsumed: 49, clockCleanupConsumed: 18, createConsumed: 1, normalConsumed: 50,
    cleanupConsumed: 18, consumed: 68, failed: false, retired: true, firstFailure: null,
    originalGenerationExitRequired: false, executionAuthorized: false });
  assert.equal(id, ceiling + 1); assert.throws(() => { budget.consumeCreate(id); }, /UNAVAILABLE/u);
  // The existing observation unit remains unchanged and has no create method.
  assert.equal(new CurrentFootprintCopyClockRpcBudget(first + 1).snapshot().lastReservedId, ceiling);
});
void test("insufficient partial headroom and malformed starts refuse before any allocation", () => {
  const firstRefused = LIMITS.maximumNormalId - LIMITS.total + 2;
  assert.throws(() => requireCurrentFootprintCopyCreateClockHandoffHeadroom(firstRefused - LIMITS.handoffMaximum), /HEADROOM/u);
  assert.throws(() => new CurrentFootprintCopyCreateClockBudget(firstRefused), /HEADROOM/u);
  for (const first of [0, -0, -1, 1.1, Number.NaN, Number.POSITIVE_INFINITY, LIMITS.maximumRequestId + 1]) {
    assert.throws(() => new CurrentFootprintCopyCreateClockBudget(first), /START_ID/u);
  }
});
void test("early, omitted, duplicated or reclassified create slots poison without charging a replacement", () => {
  const early = new CurrentFootprintCopyCreateClockBudget(20);
  assert.throws(() => { early.consumeCreate(20); }, /CREATE_SLOT/u); assert.equal(early.snapshot().consumed, 0);
  const missing = new CurrentFootprintCopyCreateClockBudget(20); arms(missing, 20);
  assert.throws(() => { missing.consume(33, false); }, /CREATE_SLOT/u);
  assert.equal(missing.snapshot().nextId, 33); assert.equal(missing.snapshot().createConsumed, 0);
  const duplicate = new CurrentFootprintCopyCreateClockBudget(20); arms(duplicate, 20); duplicate.consumeCreate(33);
  assert.throws(() => { duplicate.consumeCreate(34); }, /CREATE_SLOT/u); assert.equal(duplicate.snapshot().createConsumed, 1);
  const cleanup = new CurrentFootprintCopyCreateClockBudget(20);
  assert.throws(() => { cleanup.consume(20, true); }, /CREATE_SLOT/u);
  for (const budget of [early, missing, duplicate, cleanup]) {
    assert.equal(budget.snapshot().originalGenerationExitRequired, true);
    assert.throws(() => { budget.consume(budget.snapshot().nextId, false); }, /UNAVAILABLE/u);
  }
});
void test("gapped IDs and unknown acknowledgments cannot refund the original create", () => {
  const gap = new CurrentFootprintCopyCreateClockBudget(20); arms(gap, 20);
  assert.throws(() => { gap.consumeCreate(34); }, /CONTIGUOUS_ID/u); assert.equal(gap.snapshot().createConsumed, 0);
  const budget = new CurrentFootprintCopyCreateClockBudget(20); arms(budget, 20); budget.consumeCreate(33); budget.fail();
  assert.equal(budget.snapshot().nextId, 34); assert.equal(budget.snapshot().createConsumed, 1);
  assert.throws(() => { budget.consumeCreate(34); }, /UNAVAILABLE/u);
  assert.throws(() => { budget.retire(); }, /UNAVAILABLE/u); assert.equal(budget.snapshot().consumed, 14);
});
void test("a partial invoked unit cannot retire by presenting its consumed create as completion", () => {
  const budget = new CurrentFootprintCopyCreateClockBudget(100); arms(budget, 100); budget.consumeCreate(113);
  assert.throws(() => { budget.requireCompleted(); }, /INCOMPLETE/u);
  assert.equal(budget.snapshot().failed, false);
  assert.throws(() => { budget.retire(); }, /INCOMPLETE/u);
  assert.equal(budget.snapshot().failed, true); assert.equal(budget.snapshot().retired, false);
});

/** No native process, pipe, writer or fabricated larger profile is used. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as CAPACITY,
  requireCurrentFootprintCopyMainCompletionHeadroom } from "../src/current-footprint-copy-main-capacity.ts";

void test("known main units exceed the current observation purpose before any complete writer reservation", () => {
  assert.deepEqual([CAPACITY.minimumNormal, CAPACITY.minimumCleanup, CAPACITY.minimumTotal], [87, 41, 128]);
  assert.deepEqual(CAPACITY.heldRequest, { normal: 23, cleanup: 7, total: 30 });
  assert.deepEqual(CAPACITY.completion, { normal: 45, cleanup: 30, total: 75 });
  assert.deepEqual([CAPACITY.currentReservation.normalRequestLimit, CAPACITY.currentReservation.cleanupRequestLimit,
    CAPACITY.currentReservation.requestLimit], [42, 13, 55]);
  assert.equal(CAPACITY.wholeWriterReserved, false); assert.equal(CAPACITY.executionAuthorized, false);
  assert.equal(Object.isFrozen(CAPACITY), true); assert.equal(Object.isFrozen(CAPACITY.heldRequest), true);
  // Even an otherwise unused observation owner cannot host completion. A real
  // Held prefix reaches42 normal/10 cleanup, and must refuse before transfer.
  assert.throws(() => { requireCurrentFootprintCopyMainCompletionHeadroom(0, 0, 0); }, /HEADROOM/u);
  assert.throws(() => { requireCurrentFootprintCopyMainCompletionHeadroom(52, 42, 10); }, /HEADROOM/u);
  assert.throws(() => { requireCurrentFootprintCopyMainCompletionHeadroom(55, 42, 13); }, /HEADROOM/u);
});

void test("inconsistent counters cannot bypass the fixed native reservation", () => {
  for (const values of [[51, 42, 10], [53, 43, 10], [56, 42, 14], [0, -1, 1], [-0, 0, 0], [0, -0, 0],
    [0, 0, -0], [Number.NaN, 0, 0], [Number.POSITIVE_INFINITY, 0, 0], [1.5, 1, 0.5], [Number.MAX_SAFE_INTEGER, 0, 0]]) {
    const [id, normal, cleanup] = values; assert.ok(id !== undefined && normal !== undefined && cleanup !== undefined);
    assert.throws(() => { requireCurrentFootprintCopyMainCompletionHeadroom(id, normal, cleanup); }, /COUNTERS/u);
  }
});

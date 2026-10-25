import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { verifyOperationArtifactQueue } from "../src/operation-artifact-queue.ts";

void test("rolling phase verification passes a held first descriptor with at most four active workers", async () => {
  const ids = Array.from({ length: 12 }, (_unused, index) => index);
  const held = Promise.withResolvers<true>(), othersDone = Promise.withResolvers<true>();
  const visited: number[] = [];
  let active = 0, completed = 0, peak = 0, settled = false;
  const pending = (async (): Promise<void> => {
    await verifyOperationArtifactQueue(ids, async (id) => {
      visited.push(id); active += 1; peak = Math.max(peak, active);
      await (id === 0 ? held.promise : setImmediate());
      active -= 1;
      completed += 1;
      if (completed === ids.length - 1) { othersDone.resolve(true); }
    });
    settled = true;
  })();
  try {
    await othersDone.promise;
    assert.deepEqual(visited, ids);
    assert.equal(peak, 4);
    assert.equal(active, 1);
    assert.equal(settled, false);
  } finally { held.resolve(true); await pending; }
  assert.equal(active, 0);
  assert.equal(settled, true);
});

void test("phase failure stops new work, drains started owners and reports the lowest failing index", async () => {
  const gates = Array.from({ length: 4 }, () => Promise.withResolvers<true>());
  const closed: number[] = [], visited: number[] = [];
  const first = new Error("first descriptor failure"), later = new Error("later descriptor failure");
  let settled = false;
  const pending = (async (): Promise<void> => {
    try {
      await verifyOperationArtifactQueue([0, 1, 2, 3, 4, 5], async (id) => {
        visited.push(id);
        try {
          await gates[id]?.promise;
          if (id === 0) { throw first; }
          if (id === 2) { throw later; }
        } finally { closed.push(id); }
      });
    } finally { settled = true; }
  })();
  const rejected = assert.rejects(pending, { message: first.message });
  try {
    assert.deepEqual(visited, [0, 1, 2, 3]);
    gates[2]?.resolve(true); await setImmediate();
    assert.deepEqual(closed, [2]);
    gates[1]?.resolve(true); gates[0]?.resolve(true); await setImmediate();
    assert.equal(settled, false);
    assert.deepEqual(visited, [0, 1, 2, 3]);
  } finally { for (const gate of gates) { gate.resolve(true); } await rejected; }
  assert.deepEqual(closed.toSorted((left, right) => left - right), [0, 1, 2, 3]);
  assert.equal(settled, true);
});

void test("phase queues preserve synchronous and undefined failures and accept an empty list", async () => {
  const failure = new Error("synchronous refusal");
  await assert.rejects(verifyOperationArtifactQueue([1, 2], () => { throw failure; }), (error: unknown) => error === failure);
  // oxlint-disable-next-line eslint/prefer-promise-reject-errors, typescript/prefer-promise-reject-errors -- A missing rejection reason must still stop the queue and refuse admission.
  await assert.rejects(verifyOperationArtifactQueue([1], () => Promise.reject()), (error: unknown) => error === undefined);
  await verifyOperationArtifactQueue([], () => { assert.fail("Empty phases must not invoke a verifier."); });
});

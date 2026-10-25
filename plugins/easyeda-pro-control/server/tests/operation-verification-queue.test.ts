import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import { OPERATION_HASH_STREAMS, settleOperationVerifications } from "../src/operation-verification-queue.ts";

void test("rolling verification advances uneven journals while retaining four active verifiers and ordered results", async () => {
  const ids = Array.from({ length: 9 }, (_unused, index) => String(index));
  const started = ids.map(() => Promise.withResolvers<true>());
  const released = ids.map(() => Promise.withResolvers<true>());
  const visited: string[] = [];
  let active = 0, maximumActive = 0;
  const pending = settleOperationVerifications(ids, undefined, async (id) => {
    const index = Number(id);
    const gate = released[index], signal = started[index];
    assert.ok(signal !== undefined && gate !== undefined);
    visited.push(id); active += 1; maximumActive = Math.max(maximumActive, active);
    signal.resolve(true);
    await gate.promise;
    active -= 1;
    return id;
  });
  await started[3]?.promise;
  assert.deepEqual(visited, ["0", "1", "2", "3"]);
  for (let index = 1; index <= 5; index += 1) {
    released[index]?.resolve(true);
    await started[index + 3]?.promise;
    assert.equal(active, OPERATION_HASH_STREAMS);
  }
  assert.deepEqual(visited, ids);
  for (const gate of released) { gate.resolve(true); }
  assert.deepEqual(await pending, ids.map((id) => ({ status: "fulfilled", value: id })));
  assert.equal(maximumActive, 4);
  assert.equal(active, 0);
});

void test("uneven inert workload advances beyond the former fixed-group barrier without timing thresholds", async () => {
  const ids = Array.from({ length: 12 }, (_unused, index) => String(index));
  const held = Promise.withResolvers<true>();
  const grouped: string[] = [], rolling: string[] = [];
  const observe = async (id: string, visited: string[]): Promise<string> => {
    visited.push(id);
    if (id === "0") { await held.promise; }
    return id;
  };
  const rollingResult = settleOperationVerifications(ids, undefined, (id) => observe(id, rolling));
  const groupedResult = (async (): Promise<PromiseSettledResult<string>[]> => {
    const results: PromiseSettledResult<string>[] = [];
    for (let offset = 0; offset < ids.length; offset += 4) {
      results.push(...await Promise.allSettled(ids.slice(offset, offset + 4).map((id) => observe(id, grouped))));
    }
    return results;
  })();
  // Drain the promise jobs. The first verifier remains explicitly held; no
  // Elapsed-time threshold or filesystem cache behavior decides the comparison.
  await setImmediate();
  assert.deepEqual(rolling, ids);
  assert.deepEqual(grouped, ids.slice(0, 4));
  held.resolve(true);
  const [actual, prior] = await Promise.all([rollingResult, groupedResult]);
  assert.deepEqual(actual, prior);
});

void test("verification failures keep their original input positions and wait for every outstanding owner", async () => {
  const held = Promise.withResolvers<true>();
  const firstFailure = new Error("first failure"), laterFailure = new Error("later failure");
  const completed: string[] = [];
  let settled = false;
  const pending = settleOperationVerifications(["a", "b", "c", "d", "e"], undefined, (id) => {
    if (id === "a") { throw firstFailure; }
    if (id === "c") { return Promise.reject(laterFailure); }
    return (async (): Promise<string> => {
      if (id === "b") { await held.promise; }
      completed.push(id); return id;
    })();
  });
  const observed = (async (): Promise<PromiseSettledResult<string>[]> => {
    const result = await pending; settled = true; return result;
  })();
  await setImmediate();
  assert.equal(settled, false);
  assert.deepEqual(completed, ["d", "e"]);
  held.resolve(true);
  assert.deepEqual(await observed, [
    { status: "rejected", reason: firstFailure }, { status: "fulfilled", value: "b" },
    { status: "rejected", reason: laterFailure }, { status: "fulfilled", value: "d" }, { status: "fulfilled", value: "e" },
  ]);
  assert.equal(settled, true);
  assert.deepEqual(await settleOperationVerifications([], undefined, () => { assert.fail("Empty queue must not invoke a verifier."); }), []);
});

void test("queued verification retains only its initial bounded candidates despite concurrent map replacement", async () => {
  const held = Promise.withResolvers<true>(), ids = ["a", "b", "c", "d", "e", "f"];
  const original = Object.freeze({ payload: "original-cached-projection" });
  const candidates = new Map<string, Readonly<{ payload: string }>>([["e", original]]);
  const seen: unknown[] = [];
  const pending = settleOperationVerifications(ids, candidates, async (_id, candidate) => {
    seen.push(candidate);
    await held.promise;
    return candidate;
  });
  assert.deepEqual(seen, [undefined, undefined, undefined, undefined]);
  candidates.set("e", { payload: "replacement-from-another-scan" });
  candidates.set("f", { payload: "new-entry-from-another-scan" });
  held.resolve(true);
  const results = await pending;
  assert.equal(seen[4], original);
  assert.equal(seen[5], undefined);
  assert.deepEqual(results, [undefined, undefined, undefined, undefined, original, undefined]
    .map((value) => ({ status: "fulfilled", value })));
});

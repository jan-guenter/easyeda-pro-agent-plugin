import assert from "node:assert/strict";
import { test } from "node:test";
import { PcbSelectedReadTimings } from "../src/pcb-selected-read-timings.ts";

void test("selected read timings keep fixed bounded aggregates without action values or errors", async () => {
  let clock = 100;
  const timings = new PcbSelectedReadTimings(() => clock);
  const secret = { path: "/private/fixture.eprj2", id: "private-identity" };
  assert.equal(await timings.measure("source-read", (): Promise<typeof secret> => { clock += 12.9; return Promise.resolve(secret); }), secret);
  const failure = new Error("private failure detail");
  await assert.rejects(timings.measure("source-read", (): Promise<never> => { clock += 4; return Promise.reject(failure); }), (error: unknown) => error === failure);
  const snapshot = timings.snapshot();
  assert.deepEqual(snapshot["stages"], [{ stage: "source-read", completedCount: 1, failedCount: 1, totalElapsedMs: 16, maxElapsedMs: 12 }]);
  assert.doesNotMatch(JSON.stringify(snapshot), /private|fixture/u);
  assert.ok(Object.isFrozen(snapshot)); assert.ok(Object.isFrozen(snapshot["stages"]));
  clock += 1000;
  assert.deepEqual(timings.snapshot(), snapshot);
});

void test("selected timing clock failures, backwards time and huge intervals cannot change action semantics", async () => {
  for (const values of [[Number.NaN, 12], [1, Number.POSITIVE_INFINITY], [-1, 10], [5, 4], [0, 1e300]]) {
    let index = 0;
    const timings = new PcbSelectedReadTimings(() => { const value = values[index] ?? 0; index += 1; return value; });
    assert.equal(await timings.measure("context", (): Promise<string> => Promise.resolve("original")), "original");
    const expected = values[1] === 1e300 ? Number.MAX_SAFE_INTEGER : 0;
    assert.deepEqual(timings.snapshot()["stages"], [{ stage: "context", completedCount: 1, failedCount: 0, totalElapsedMs: expected, maxElapsedMs: expected }]);
  }
  const timings = new PcbSelectedReadTimings(() => { throw new Error("clock failed"); });
  const original = new Error("original operation failure");
  await assert.rejects(timings.measure("quarantine", (): Promise<never> => { throw original; }), (error: unknown) => error === original);
  assert.deepEqual(timings.snapshot()["stages"], [{ stage: "quarantine", completedCount: 0, failedCount: 1, totalElapsedMs: 0, maxElapsedMs: 0 }]);
});

void test("selected timing labels cannot reflect arbitrary strings and snapshots stay small and detached", async () => {
  let clock = 0;
  const timings = new PcbSelectedReadTimings(() => { clock += 1; return clock; });
  assert.equal(await Reflect.apply(timings.measure.bind(timings), undefined, ["private-unrecognized-label", (): Promise<number> => Promise.resolve(42)]), 42);
  assert.deepEqual(timings.snapshot()["stages"], []);
  for (const stage of ["quarantine", "context", "status", "source-read", "inventory-read", "selected-id-read", "inherited-capture", "inherited-reproof"] as const) {
    await timings.measure(stage, (): Promise<void> => Promise.resolve());
  }
  const snapshot = timings.snapshot(); const encoded = JSON.stringify(snapshot);
  assert.ok(Buffer.byteLength(encoded) < 2048);
  await timings.measure("context", (): Promise<void> => Promise.resolve());
  assert.equal(JSON.stringify(snapshot), encoded);
  assert.notDeepEqual(timings.snapshot(), snapshot);
});

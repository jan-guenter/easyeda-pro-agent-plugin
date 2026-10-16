import assert from "node:assert/strict";
import { test } from "node:test";
import { OrdinaryLaunchTimings } from "../src/ordinary-launch-timings.ts";

void test("ordinary timings retain bounded fixed stages without operation values or failures", async () => {
  let clock = 100;
  const timings = new OrdinaryLaunchTimings(() => clock);
  const original = new Error("private diagnostic contents"), privateValue = { path: "/private/design.eprj2" };
  assert.equal(await timings.measure("installation-initial", (): Promise<typeof privateValue> => { clock += 12.9; return Promise.resolve(privateValue); }), privateValue);
  await assert.rejects(timings.measure("installation-initial", (): Promise<never> => { clock += 4; return Promise.reject(original); }), (error: unknown) => error === original);
  const snapshot = timings.snapshot();
  assert.deepEqual(snapshot["stages"], [{ stage: "installation-initial", completedCount: 1, failedCount: 1, totalElapsedMs: 16, maxElapsedMs: 12 }]);
  assert.doesNotMatch(JSON.stringify(snapshot), /private|design\.eprj2/u);
  assert.ok(Object.isFrozen(snapshot)); assert.ok(Object.isFrozen(snapshot["stages"]));
  await timings.measure("installation-initial", (): Promise<void> => Promise.resolve());
  assert.notDeepEqual(timings.snapshot(), snapshot);
});

void test("ordinary timing clock failures and invalid readings preserve the original action outcome", async () => {
  for (const values of [[Number.NaN, 12], [1, Number.POSITIVE_INFINITY], [-1, 10], [5, 4], [0, 1e300]]) {
    let index = 0;
    const timings = new OrdinaryLaunchTimings(() => { const value = values[index] ?? 0; index += 1; return value; });
    assert.equal(await timings.measure("admission-initial", (): Promise<number> => Promise.resolve(42)), 42);
    assert.deepEqual(timings.snapshot()["stages"], [{ stage: "admission-initial", completedCount: 1, failedCount: 0,
      totalElapsedMs: values[1] === 1e300 ? Number.MAX_SAFE_INTEGER : 0, maxElapsedMs: values[1] === 1e300 ? Number.MAX_SAFE_INTEGER : 0 }]);
  }
  const original = new Error("original failure"), timings = new OrdinaryLaunchTimings(() => { throw new Error("clock failure"); });
  await assert.rejects(timings.measure("launch-dispatch", (): Promise<never> => { throw original; }), (error: unknown) => error === original);
  assert.deepEqual(timings.snapshot()["stages"], [{ stage: "launch-dispatch", completedCount: 0, failedCount: 1, totalElapsedMs: 0, maxElapsedMs: 0 }]);
});

void test("ordinary timing labels cannot retain caller data and the complete stage list is bounded", async () => {
  let clock = 0;
  const timings = new OrdinaryLaunchTimings(() => { clock += 1; return clock; });
  assert.equal(await Reflect.apply(timings.measure.bind(timings), undefined, ["private label", (): Promise<number> => Promise.resolve(1)]), 1);
  assert.deepEqual(timings.snapshot()["stages"], []);
  for (const stage of ["inventory-initial", "admission-initial", "installation-initial", "admission-before-helper", "helper-presence",
    "reservation", "intent-publication", "admission-after-intent", "inventory-before-dispatch", "installation-before-dispatch",
    "admission-before-dispatch", "launch-dispatch", "launched-publication", "nondispatch-publication"] as const) {
    await timings.measure(stage, (): Promise<void> => Promise.resolve());
  }
  const snapshot = timings.snapshot(), stages = snapshot["stages"];
  assert.ok(Array.isArray(stages)); assert.equal(stages.length, 14);
  assert.ok(Buffer.byteLength(JSON.stringify(snapshot)) < 4096);
});

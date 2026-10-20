import assert from "node:assert/strict";
import { test } from "node:test";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { CURRENT_PCB_DEFAULT_GLYPH_MAX_X, planCurrentPcbStringDefaultGeometry } from "../src/current-pcb-string-default-geometry.ts";

void test("default geometry preserves glyph endpoint rounding, space advance and native float sums", () => {
  const cases = [["I", 0.8], ["I  ", 0.8], [" I", 8.64], ["I I", 11.120000000000001],
    ["W", 7.800000000000001], ["!", 1.5], ["A", 6.4], ["Test", 23.99]] as const;
  for (const [text, width] of cases) {
    const result = planCurrentPcbStringDefaultGeometry(planCurrentPcbStringCreate({ x: 120, y: -450, text }));
    assert.equal(result.width, width); assert.equal(result.height, 12);
    assert.deepEqual(result.expectedBox, { layerId: 3, locked: false,
      leftLow: { x: 12, y: -45 }, leftUp: { x: 12, y: -33 },
      rightLow: { x: width + 12, y: -45 }, rightUp: { x: width + 12, y: -33 } });
    for (const [key, value] of Object.entries(result)) {
      if (key.endsWith("Verified") || key === "executionAuthorized") { assert.equal(value, false, key); }
    }
    assert.ok(Object.isFrozen(result.expectedBox)); assert.ok(Object.isFrozen(result.expectedBox.rightUp));
  }
  assert.equal(CURRENT_PCB_DEFAULT_GLYPH_MAX_X.length, 94);
  assert.ok(Object.isFrozen(CURRENT_PCB_DEFAULT_GLYPH_MAX_X));
});

void test("geometry requires an original fixed candidate and does not inspect forged getters or proxies", () => {
  const original = planCurrentPcbStringCreate({ x: 0, y: 0, text: "A" });
  let calls = 0;
  const fail = (): never => { calls += 1; throw new Error("unexpected candidate access"); };
  for (const forged of [{ ...original }, new Proxy(original, { get: fail }),
    Object.defineProperty({ ...original }, "expectedModelScalars", { get: fail })]) {
    assert.throws(() => planCurrentPcbStringDefaultGeometry(forged), /original candidate/u);
  }
  assert.equal(calls, 0);
  assert.deepEqual(planCurrentPcbStringDefaultGeometry(original).expectedBox.leftLow, { x: 0, y: 0 });
});

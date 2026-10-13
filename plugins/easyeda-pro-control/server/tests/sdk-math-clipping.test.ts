import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { closeSdkClippingArguments, sdkClippingArgumentsSchema, validateSdkClippingResult } from "../src/sdk-math-clipping.ts";
import { buildSdkMathProgram, parseSdkMathRequest, validateSdkMathResult } from "../src/sdk-math.ts";

interface Point { x: number; y: number }
function rectangle(x: number, y: number, maxX: number, maxY: number): Point[] { return [{ x, y }, { x: maxX, y }, { x: maxX, y: maxY }, { x, y: maxY }]; }
function closed(points: Point[]): Point[] { const first = points[0]; assert.ok(first); return [...points, { ...first }]; }
const first = rectangle(0, 0, 4, 4), second = rectangle(2, -2, 6, 2);
const args = { polygon1: first, polygon2: second };
const firstOnly = closed([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 0, y: 4 }]);
const secondOnly = closed([{ x: 2, y: -2 }, { x: 6, y: -2 }, { x: 6, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 0 }, { x: 2, y: 0 }]);
const merged = closed([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: -2 }, { x: 6, y: -2 }, { x: 6, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 0, y: 4 }]);
const cases = [
  { name: "intersects", value: true },
  { name: "union", value: [{ outer: merged, holes: [] }] },
  { name: "subtract", value: [{ outer: firstOnly, holes: [] }] },
  { name: "intersection", value: [{ outer: closed(rectangle(2, 0, 4, 2)), holes: [] }] },
  { name: "xor", value: [{ outer: firstOnly, holes: [] }, { outer: secondOnly, holes: [] }] },
];

function run(request: unknown, sdk: Record<string, unknown>): unknown {
  return runInNewContext(`(()=>{${buildSdkMathProgram(request)}})()`, { eda: { sys_Math: sdk }, TextEncoder }, { timeout: 1000 }) as unknown;
}

void test("five clipping adapters invoke their fixed SDK method with closed frozen operands and complete results", () => {
  for (const current of cases) {
    const request = { method: `eda.sys_Math.${current.name}`, arguments: args };
    let calls = 0;
    const sdk: Record<string, unknown> = {};
    sdk[current.name] = function calculate(this: unknown, one: Point[], two: Point[]): unknown {
      assert.equal(this, sdk);
      assert.deepEqual(structuredClone([one, two]), [closed(first), closed(second)]);
      assert.ok(Object.isFrozen(one) && Object.isFrozen(two) && Object.isFrozen(one[0]));
      calls += 1;
      return structuredClone(current.value);
    };
    const result = validateSdkMathResult(request, decodeExactReadEnvelope(run(request, sdk)));
    assert.deepEqual(result["value"], current.value);
    assert.equal(calls, 2);
  }
  assert.deepEqual(args, { polygon1: first, polygon2: second });
  assert.deepEqual(closeSdkClippingArguments({ polygon1: closed(first), polygon2: closed(second) }), { polygon1: closed(first), polygon2: closed(second) });
});

void test("clipping preserves nested holes, disconnected outer groups and empty results", () => {
  const nested = { polygon1: rectangle(0, 0, 8, 8), polygon2: rectangle(2, 2, 4, 4) };
  const holed = [{ outer: closed(nested.polygon1), holes: [closed(nested.polygon2)] }];
  assert.deepEqual(validateSdkClippingResult(nested, "eda.sys_Math.subtract", holed), holed);
  assert.deepEqual(validateSdkClippingResult(nested, "eda.sys_Math.xor", holed), holed);
  const disjoint = { polygon1: first, polygon2: rectangle(6, 6, 8, 8) };
  const split = [{ outer: closed(disjoint.polygon1), holes: [] }, { outer: closed(disjoint.polygon2), holes: [] }];
  assert.deepEqual(validateSdkClippingResult(disjoint, "eda.sys_Math.union", split), split);
  assert.deepEqual(validateSdkClippingResult(disjoint, "eda.sys_Math.intersection", []), []);
  assert.equal(validateSdkClippingResult(disjoint, "eda.sys_Math.intersects", false), false);
});

void test("clipping refuses unsupported contacts, aligned edges and inexact possible-fragment arithmetic before dispatch", () => {
  const invalid = [
    { polygon1: first, polygon2: rectangle(4, 1, 6, 3) },
    { polygon1: first, polygon2: rectangle(6, 0, 8, 2) },
    { polygon1: first, polygon2: rectangle(1.5, -2, 6, 2) },
    { polygon1: first, polygon2: rectangle(2, -2, 32_769, 2) },
    { polygon1: [{ x: 0, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 4 }, { x: 0, y: 4 }], polygon2: second },
    { polygon1: [...first, ...first], polygon2: second },
    { polygon1: Array.from({ length: 18 }, (_, index) => ({ x: index, y: index % 2 })), polygon2: second },
    { polygon1: [{ outer: first, holes: [] }], polygon2: second },
  ];
  for (const value of invalid) { assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.union", arguments: value })); }
  assert.throws(() => sdkClippingArgumentsSchema.parse({ polygon1: rectangle(0, 0, 49, 49), polygon2: rectangle(1, -1, 50, 1) }), /arithmetic is not exact/u);
  assert.deepEqual(parseSdkMathRequest({ method: "eda.sys_Math.union", arguments: { polygon1: first.toReversed(), polygon2: second } }).arguments, { polygon1: first.toReversed(), polygon2: second });
});

function unexpectedGetter(): never { return assert.fail("Clipping result getter must not execute."); }

void test("clipping rejects malformed, incomplete or contradictory SDK groups without repairs or error disclosure", () => {
  const request = { method: "eda.sys_Math.union", arguments: args };
  const bad = [[], [{ outer: merged.slice(1), holes: [] }], [{ outer: closed(first), holes: [] }], [{ outer: merged, holes: [], extra: true }],
    [{ outer: merged, holes: [closed(rectangle(20, 20, 22, 22))] }], Array.from({ length: 33 }, () => ({ outer: merged, holes: [] }))];
  for (const value of bad) { assert.throws(() => validateSdkMathResult(request, { ok: true, kind: "sdk-math", method: request.method, value })); }
  const accessor = Object.defineProperty({ holes: [] }, "outer", { get: unexpectedGetter, enumerable: true });
  assert.throws(() => run(request, { union: (): unknown[] => [accessor] }), { message: "SDK_MATH_CALCULATION_FAILED" });
  assert.throws(() => run(request, { union: (): never => { throw new Error("PRIVATE_POLYGON_FAILURE"); } }), { message: "SDK_MATH_CALCULATION_FAILED" });
  assert.throws(() => validateSdkClippingResult(args, "eda.sys_Math.intersects", false));
});

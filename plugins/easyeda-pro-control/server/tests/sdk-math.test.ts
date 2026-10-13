import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_MATH_API_SHA256, SDK_MATH_API_VERSION, buildSdkMathProgram, parseSdkMathRequest, querySdkMathCalculations, sdkMathDescriptors, validateSdkMathArguments, validateSdkMathResult } from "../src/sdk-math.ts";

const polygon = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }];
const point = { x: 2, y: 1 };
const box = { minX: 0, minY: 0, maxX: 4, maxY: 3 };
const concave = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 2, y: 1 }, { x: 0, y: 4 }];
interface Case { name: string; args: Record<string, unknown>; positional: unknown[]; value: unknown }
const cases: Case[] = [
  { name: "bboxIntersects", args: { bbox1: box, bbox2: box }, positional: [box, box], value: true },
  { name: "calculateArea", args: { polygon }, positional: [polygon], value: 12 },
  { name: "calculatePerimeter", args: { polygon }, positional: [polygon], value: 14 },
  { name: "contains", args: { polygon1: polygon, polygon2: polygon }, positional: [polygon, polygon], value: false },
  { name: "containsPoint", args: { polygon, point }, positional: [polygon, point], value: true },
  { name: "distanceToPoint", args: { polygon, point }, positional: [polygon, point], value: 0 },
  { name: "getBBox", args: { polygon }, positional: [polygon], value: box },
  { name: "getCentroid", args: { polygon }, positional: [polygon], value: { x: 2, y: 1.5 } },
  { name: "translate", args: { polygon, dx: 0, dy: 0 }, positional: [polygon, 0, 0], value: polygon },
  { name: "rotate", args: { polygon, angle: 0 }, positional: [polygon, 0, undefined, undefined], value: polygon },
  { name: "scale", args: { polygon, scaleX: 1, scaleY: 1, centerX: 0, centerY: 0 }, positional: [polygon, 1, 1, 0, 0], value: polygon },
];

function runProgram(request: unknown, sdk: Record<string, unknown>): unknown {
  return runInNewContext(`(()=>{${buildSdkMathProgram(request)}})()`, { eda: { sys_Math: sdk }, TextEncoder }, { timeout: 1000 }) as unknown;
}

function assertFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    assert.ok(Object.isFrozen(value));
    for (const child of Object.values(value)) { assertFrozen(child); }
  }
}

function unexpectedResultGetter(): never { return assert.fail("Result getter must not execute."); }

void test("all eleven math adapters bind the exact receiver and positional arguments in one bounded program", () => {
  for (const current of cases) {
    const request = { method: `eda.sys_Math.${current.name}`, arguments: current.args };
    let calls = 0;
    const sdk: Record<string, unknown> = {};
    sdk[current.name] = function calculate(this: unknown, ...args: unknown[]): unknown {
      assert.equal(this, sdk);
      assert.deepEqual(structuredClone(args), current.positional);
      for (const argument of args) { assertFrozen(argument); }
      calls += 1;
      return structuredClone(current.value);
    };
    const payload = decodeExactReadEnvelope(runProgram(request, sdk));
    const result = validateSdkMathResult(request, payload);
    assert.equal(calls, 2);
    assert.deepEqual(result["value"], current.value);
    assert.equal(result["apiVersion"], SDK_MATH_API_VERSION);
    assert.equal(result["apiSha256"], SDK_MATH_API_SHA256);
    assert.equal(JSON.stringify(result).includes("manufacturing-proof"), true);
  }
});

void test("math discovery and exact validation remain offline and separate from execution authority", () => {
  const entries = sdkMathDescriptors();
  assert.equal(entries.length, 11);
  assert.equal(new Set(entries.map((entry) => entry.path)).size, 11);
  for (const entry of entries) {
    assert.equal(entry.path, entry.method);
    assert.equal(entry.invocationEnabledByDiscovery, false);
    assert.equal(entry.provenance.liveValidation, "not-recorded");
    assert.equal(entry.provenance.version, SDK_MATH_API_VERSION);
  }
  assert.equal(querySdkMathCalculations({ method: "eda.sys_Math.getBBox", includeSchemas: true })["total"], 1);
  assert.equal(querySdkMathCalculations()["total"], 11);
  assert.equal(JSON.stringify(querySdkMathCalculations()).includes("inputSchema"), false);
  assert.equal(validateSdkMathArguments({ method: "eda.sys_Math.getBBox", arguments: { polygon } })["valid"], true);
  assert.equal(validateSdkMathArguments({ method: "eda.sys_Math.union", arguments: {} })["valid"], false);
  assert.throws(() => querySdkMathCalculations({ method: "eda.sys_Math.union" }));
});

void test("math argument admission refuses unsupported shapes, unsafe selectors and invalid geometry", () => {
  const invalid = [
    [], polygon.slice(0, 2), [{ outer: polygon, holes: [] }], [0, 0, "L", 4, 0, 4, 3, 0, 3],
    [{ x: 0, y: 0 }, { x: 4, y: 3 }, { x: 4, y: 0 }, { x: 0, y: 3 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    [polygon[0], polygon[1], polygon[1], polygon[2], polygon[3]],
    [{ x: Infinity, y: 0 }, ...polygon], [{ x: Number.NaN, y: 0 }, ...polygon],
    [{ x: 1_000_001, y: 0 }, ...polygon], [{ x: 0, y: 0, secret: true }, ...polygon],
    Array.from({ length: 130 }, (_, index) => ({ x: index, y: index % 2 })),
  ];
  for (const value of invalid) { assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.getBBox", arguments: { polygon: value } })); }
  assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.contains", arguments: { polygon1: concave, polygon2: polygon } }));
  assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.intersects", arguments: { polygon1: polygon, polygon2: polygon } }));
  assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.constructor", arguments: {} }));
  assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.getBBox", arguments: { polygon }, code: "private()" }));
  assert.throws(() => buildSdkMathProgram({ method: "eda.sys_Math.bboxIntersects", arguments: { bbox1: { ...box, minX: 5 }, bbox2: box } }));
});

void test("math schemas preserve open or closed rings and explicit transform options without repairing inputs", () => {
  for (const current of [polygon, [...polygon, polygon[0]], concave,
    [{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 0, y: 0.25 }]]) {
    const request = { method: "eda.sys_Math.getBBox", arguments: { polygon: current } };
    assert.deepEqual(parseSdkMathRequest(request), request);
  }
  for (const method of ["rotate", "scale"]) {
    const parameters = method === "rotate" ? { angle: -90 } : { scaleX: 0, scaleY: -1 };
    assert.throws(() => parseSdkMathRequest({ method: `eda.sys_Math.${method}`, arguments: { polygon, ...parameters, centerX: 0 } }));
    assert.throws(() => parseSdkMathRequest({ method: `eda.sys_Math.${method}`, arguments: { polygon, ...parameters, centerY: 0 } }));
    const request = { method: `eda.sys_Math.${method}`, arguments: { polygon, ...parameters, centerX: 0, centerY: 0 } };
    assert.deepEqual(parseSdkMathRequest(request), request);
  }
});

void test("math program refuses drift, nonfinite values, async returns and accessors without leaking SDK errors", () => {
  const request = { method: "eda.sys_Math.calculateArea", arguments: { polygon } };
  let count = 0;
  for (const calculateArea of [(): number => Number.NaN, (): number => Infinity, (): number => -1, (): Promise<number> => Promise.resolve(12),
    (): number => { count += 1; return count; }, (): never => { throw new Error("PRIVATE_GEOMETRY_FAILURE"); }]) {
    assert.throws(() => runProgram(request, { calculateArea }), { message: "SDK_MATH_CALCULATION_FAILED" });
  }
  const unsafe = Object.defineProperty({ x: 1 }, "y", { get: unexpectedResultGetter, enumerable: true });
  assert.throws(() => runProgram({ method: "eda.sys_Math.getCentroid", arguments: { polygon } }, { getCentroid: (): unknown => unsafe }), /SDK_MATH_CALCULATION_FAILED/u);
  assert.throws(() => runProgram(request, {}), /SDK_MATH_CALCULATION_FAILED/u);
});

void test("independent math result validation rejects wrong identities, extra fields and malformed outputs", () => {
  for (const current of cases) {
    const request = { method: `eda.sys_Math.${current.name}`, arguments: current.args };
    const payload = { ok: true, kind: "sdk-math", method: request.method, value: current.value };
    assert.throws(() => validateSdkMathResult(request, { ...payload, method: "eda.sys_Math.unknown" }));
    assert.throws(() => validateSdkMathResult(request, { ...payload, private: "hidden" }));
    assert.throws(() => validateSdkMathResult(request, { ...payload, value: "[Truncated]" }));
  }
  const request = { method: "eda.sys_Math.translate", arguments: { polygon, dx: 0, dy: 0 } };
  assert.throws(() => validateSdkMathResult(request, { ok: true, kind: "sdk-math", method: request.method, value: polygon.slice(1) }));
});

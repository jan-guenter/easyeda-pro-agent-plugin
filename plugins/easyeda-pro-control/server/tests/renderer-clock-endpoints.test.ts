import assert from "node:assert/strict";
import { test } from "node:test";
import { compareRendererClockEndpoints } from "../src/renderer-clock-endpoints.ts";

type Bag = Record<string, unknown>;
const BASE = Date.UTC(2026, 9, 12, 12);
function sample(ms: number, counter: bigint): Bag {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1",
    utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(ms) * 10_000n),
    utcAfterTicks: String(621_355_968_000_000_000n + BigInt(ms + 1) * 10_000n),
    qpcBefore: String(counter), qpcAfter: String(counter + 1000n), qpcFrequency: "1000000",
    highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: "a".repeat(64) };
}
function fixture(): { nativeBefore: Bag; nativeAfter: Bag; renderer: Bag; plannedWindow: Bag } {
  return { nativeBefore: sample(BASE, 10_000_000_000_000_000n), nativeAfter: sample(BASE + 1000, 10_000_000_001_000_000n),
    plannedWindow: { notBeforeMs: BASE, notAfterMs: BASE + 2000 },
    renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: BASE + 100, nowAfterMs: BASE + 900,
      isoBefore: new Date(BASE + 100).toISOString(), isoAfter: new Date(BASE + 900).toISOString(), offsetBeforeMinutes: -120, offsetAfterMinutes: -120 } };
}
void test("valid endpoints retain the offset sign and all unproved authority boundaries", () => {
  const value = compareRendererClockEndpoints(fixture());
  assert.equal(value.localOffsetMinutes, 120); assert.equal(value.endpointsAgree, true);
  assert.equal(value.utcElapsedMinimumMs, 999); assert.equal(value.utcElapsedMaximumMs, 1001);
  assert.equal(value.qpcElapsedMinimumMs, 999); assert.equal(value.qpcElapsedMaximumMs, 1001);
  for (const key of ["producerBindingVerified", "rendererBuiltinIdentityVerified", "historicalSqlDateParsingQualified",
    "utcQpcAgreementQualified", "continuousClockStabilityProved", "executionAuthorized"] as const) { assert.equal(value[key], false); }
});
const changes: [string, (value: ReturnType<typeof fixture>) => void][] = [
  ["wrong schema", (v) => { v.renderer["schema"] = "other"; }],
  ["wrong offset sign", (v) => { v.renderer["offsetBeforeMinutes"] = 120; }],
  ["late offset drift", (v) => { v.renderer["offsetAfterMinutes"] = -60; }],
  ["native offset drift", (v) => { v.nativeAfter["localOffsetMinutes"] = 60; }],
  ["native rules drift", (v) => { v.nativeAfter["zoneRulesSha256"] = "b".repeat(64); }],
  ["frequency drift", (v) => { v.nativeAfter["qpcFrequency"] = "2000000"; }],
  ["backwards native QPC", (v) => { v.nativeAfter = sample(BASE + 1000, 0n); }],
  ["backwards native UTC", (v) => { v.nativeAfter = sample(BASE - 1000, 10_000_000_001_000_000n); }],
  ["renderer early", (v) => { v.renderer["nowBeforeMs"] = BASE - 1; }],
  ["renderer late", (v) => { v.renderer["nowAfterMs"] = BASE + 1002; }],
  ["renderer backwards", (v) => { v.renderer["nowAfterMs"] = BASE; }],
  ["fractional renderer", (v) => { v.renderer["nowBeforeMs"] = BASE + 100.5; }],
  ["nonfinite renderer", (v) => { v.renderer["nowBeforeMs"] = Number.NaN; }],
  ["wrong ISO", (v) => { v.renderer["isoBefore"] = new Date(BASE).toISOString(); }],
  ["extra renderer data", (v) => { v.renderer["TZ"] = "secret"; }],
  ["window too long", (v) => { v.plannedWindow["notAfterMs"] = BASE + 60_001; }],
  ["window excludes before", (v) => { v.plannedWindow["notBeforeMs"] = BASE + 1; }],
  ["window excludes after", (v) => { v.plannedWindow["notAfterMs"] = BASE + 1000; }],
  ["backwards window", (v) => { v.plannedWindow["notAfterMs"] = BASE - 1; }],
];
for (const [name, change] of changes) {
  void test(`endpoint comparison refuses ${name}`, () => {
    const value = fixture(); change(value); assert.throws(() => compareRendererClockEndpoints(value), /(?:RENDERER_CLOCK_ENDPOINTS|CLOCK_RECEIPT)_REFUSED/u);
  });
}
void test("endpoint accessors are never invoked", () => {
  const value = fixture(); let reads = 0;
  Object.defineProperty(value.renderer, "nowBeforeMs", { get(): never { reads += 1; throw new Error("secret"); } });
  assert.throws(() => compareRendererClockEndpoints(value), /RENDERER_CLOCK_ENDPOINTS_REFUSED/u); assert.equal(reads, 0);
});
void test("UTC versus QPC divergence remains visible and is never called qualified", () => {
  const value = fixture(); value.nativeAfter = sample(BASE + 1500, 10_000_000_001_000_000n);
  const result = compareRendererClockEndpoints(value);
  assert.equal(result.utcElapsedMinimumMs, 1499); assert.equal(result.qpcElapsedMaximumMs, 1001);
  assert.equal(result.utcQpcAgreementQualified, false); assert.equal(result.continuousClockStabilityProved, false);
});
void test("fractional native tick boundaries conservatively enclose millisecond renderer values", () => {
  const value = fixture();
  value.nativeBefore["utcBeforeTicks"] = String(BigInt(String(value.nativeBefore["utcBeforeTicks"])) + 1n);
  value.nativeAfter["utcAfterTicks"] = String(BigInt(String(value.nativeAfter["utcAfterTicks"])) + 1n);
  value.renderer["nowBeforeMs"] = BASE; value.renderer["isoBefore"] = new Date(BASE).toISOString();
  value.renderer["nowAfterMs"] = BASE + 1002; value.renderer["isoAfter"] = new Date(BASE + 1002).toISOString();
  assert.equal(compareRendererClockEndpoints(value).endpointsAgree, true);
});

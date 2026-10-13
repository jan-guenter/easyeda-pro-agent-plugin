import assert from "node:assert/strict";
import { test } from "node:test";
import { controlInputs } from "../src/symbol-clock-controls.ts";
import { BASE, SCOPE } from "./helpers/symbol-clock-fixture.ts";
import { compareHistoricalSqlClock } from "../src/historical-sql-clock.ts";

function dateVector(input: string | number, offset: number): { input: string | number; epochMs: number; iso: string; offsetMinutes: number; local: number[] } {
  const utc = typeof input === "number" ? input : Date.parse(`${input.replace(" ", "T")}Z`);
  const epochMs = typeof input === "number" ? utc : utc + offset * 60_000;
  const local = new Date(epochMs - offset * 60_000);
  return { input, epochMs, iso: new Date(epochMs).toISOString(), offsetMinutes: offset,
    local: [local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds(), local.getUTCMilliseconds()] };
}
interface Data {
  profile: string; role: "renderer" | "main-reference"; scope: typeof SCOPE; clockBefore: ReturnType<typeof dateVector>; clockAfter: ReturnType<typeof dateVector>;
  epochs: ReturnType<typeof dateVector>[]; sql: ReturnType<typeof dateVector>[]; environmentTzAbsent: boolean | null;
  producerBindingVerified: boolean; appClockVerified: boolean; executionAuthorized: boolean;
}
interface NativeSample { schema: string; utcBeforeTicks: string; utcAfterTicks: string; qpcBefore: string; qpcAfter: string; qpcFrequency: string; highResolution: boolean; localOffsetMinutes: number; zoneRulesSha256: string }
interface Fixture { scope: typeof SCOPE; renderer: Data; mainReference: Data; nativeBefore: NativeSample; nativeAfter: NativeSample; plannedWindow: { notBeforeMs: number; notAfterMs: number } }
function data(role: "renderer" | "main-reference", current = -120, winter = -60): Data {
  const inputs = controlInputs(SCOPE);
  return { profile: "private.clock-controls.v1", role, scope: { ...SCOPE }, clockBefore: dateVector(BASE, current), clockAfter: dateVector(BASE + 10, current),
    epochs: inputs.epochs.map((value) => dateVector(value, new Date(value).getUTCMonth() === 0 ? winter : current)),
    sql: inputs.sql.map((value) => dateVector(value, value.slice(5, 7) === "01" ? winter : current)),
    environmentTzAbsent: role === "main-reference" ? true : null, producerBindingVerified: false, appClockVerified: false, executionAuthorized: false };
}
function native(ms: number, counter: bigint, offset: number): NativeSample {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(ms) * 10_000n),
    utcAfterTicks: String(621_355_968_000_000_000n + BigInt(ms + 1) * 10_000n), qpcBefore: String(counter), qpcAfter: String(counter + 1000n),
    qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: offset, zoneRulesSha256: "a".repeat(64) };
}
function fixture(current = -120, winter = -60): Fixture {
  return { scope: { ...SCOPE }, renderer: data("renderer", current, winter), mainReference: data("main-reference", current, winter),
    nativeBefore: native(BASE - 10, 10_000_000_000_000_000n, -current), nativeAfter: native(BASE + 1000, 10_000_000_001_010_000n, -current),
    plannedWindow: { notBeforeMs: BASE - 20, notAfterMs: BASE + 2000 } };
}
for (const [current, winter] of [[-120, -60], [240, 300], [-345, -345], [0, 0]] as const) {
  void test(`source q2 uses CURRENT offset ${current}, not historical offset ${winter}`, () => {
    const input = fixture(current, winter), result = compareHistoricalSqlClock(input), selected = input.renderer.sql[0]; assert.ok(selected);
    assert.equal(result.rendererParsedCreatedAtMs, selected.epochMs); assert.equal(result.historicalTimezoneOffsetMinutes, winter);
    assert.equal(result.currentTimezoneOffsetMinutes, current); assert.equal(result.serverLocalOffsetMinutes, -current);
    assert.equal(result.appQ2UnderCommonOsPremiseMs, selected.epochMs - current * 60_000);
    if (current !== winter) { assert.notEqual(result.appQ2UnderCommonOsPremiseMs, selected.epochMs - winter * 60_000); }
    assert.deepEqual(result.plannedWindow, input.plannedWindow); assert.notEqual(result.plannedWindow, input.plannedWindow);
    assert.equal(result.producerBindingVerified, false); assert.equal(result.preselectedIntervalProven, false);
    assert.equal(result.appClockDirectlyObserved, false); assert.equal(result.continuousClockStabilityProved, false); assert.equal(result.executionAuthorized, false);
    assert.equal(result.parserSource.utf16Offset, 1_317_965); assert.equal(result.premises.length, 4);
  });
}
for (const family of ["epochs", "sql"] as const) {
  for (let index = 0; index < 5; index += 1) {
    void test(`complete ${family} reference mismatch at ${index} refuses even when both vectors remain individually valid`, () => {
      const input = fixture(), row = input.mainReference[family][index]; assert.ok(row);
      input.mainReference[family][index] = dateVector(row.input, row.offsetMinutes + 60);
      assert.throws(() => compareHistoricalSqlClock(input), /HISTORICAL_SQL_CLOCK_REFUSED/u);
    });
  }
}
const changes: [string, (value: ReturnType<typeof fixture>) => void][] = [
  ["baseline scope", (v) => { v.mainReference.scope.createdAtLiteral = "2026-01-16 12:34:56"; }],
  ["reference epoch", (v) => { v.mainReference.scope.referenceUtcMs += 1; }],
  ["main current timezone", (v) => { v.mainReference.clockBefore = dateVector(BASE, -60); v.mainReference.clockAfter = dateVector(BASE + 10, -60); }],
  ["native timezone", (v) => { v.nativeAfter.localOffsetMinutes = 60; }],
  ["zone rules", (v) => { v.nativeAfter.zoneRulesSha256 = "b".repeat(64); }],
  ["QPC frequency", (v) => { v.nativeAfter.qpcFrequency = "2000000"; }],
  ["interval too long", (v) => { v.plannedWindow.notAfterMs = v.plannedWindow.notBeforeMs + 60_001; }],
  ["late native closure bound", (v) => { v.plannedWindow.notAfterMs = BASE + 1000; }],
  ["renderer outside interval", (v) => { v.renderer.clockAfter = dateVector(BASE + 1002, -120); }],
  ["missing vector", (v) => { v.renderer.sql.pop(); }],
  ["extra vector", (v) => { v.renderer.sql.push(dateVector(SCOPE.createdAtLiteral, -60)); }],
  ["reordered controls", (v) => { v.renderer.sql.reverse(); }],
  ["asserted main authority", (v) => { v.mainReference.producerBindingVerified = true; }],
  ["missing inherited TZ proof", (v) => { v.mainReference.environmentTzAbsent = null; }],
  ["renderer pretending environment proof", (v) => { v.renderer.environmentTzAbsent = true; }],
];
for (const [name, change] of changes) {
  void test(`historical relation refuses ${name} without widening the original interval`, () => {
    const input = fixture(); const before = { ...input.plannedWindow }; change(input);
    const selectedWindow = { ...input.plannedWindow };
    assert.throws(() => compareHistoricalSqlClock(input), /(?:HISTORICAL_SQL_CLOCK|CLOCK_CONTROLS|CLOCK_RECEIPT|RENDERER_CLOCK_ENDPOINTS)_REFUSED/u);
    assert.deepEqual(input.plannedWindow, selectedWindow); assert.equal(before.notBeforeMs, BASE - 20);
  });
}
for (const field of ["epochMs", "offsetMinutes", "iso", "local"] as const) {
  void test(`malformed baseline ${field} is rejected even if copied to both main and renderer`, () => {
    const input = fixture(); const row = input.renderer.sql[0]; assert.ok(row);
    Reflect.set(row, field, field === "local" ? [2026, 1, 15, 12, 34, 56, 1] : "invalid");
    input.mainReference.sql[0] = structuredClone(row);
    assert.throws(() => compareHistoricalSqlClock(input), /CLOCK_CONTROLS_REFUSED/u);
  });
}
void test("input accessors are never read", () => {
  const input = fixture(); let reads = 0;
  Object.defineProperty(input, "mainReference", { get(): never { reads += 1; throw new Error("private"); } });
  assert.throws(() => compareHistoricalSqlClock(input), /CLOCK_CONTROLS_REFUSED/u); assert.equal(reads, 0);
});

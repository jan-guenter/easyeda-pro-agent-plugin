import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { runInNewContext } from 'node:vm';
import type { OriginalMainReference } from '../src/closed-symbol-main-reference.ts';
import { validateMainReferenceRequest } from '../src/closed-symbol-main-reference-program.ts';
import { buildMainClockReference, buildRendererClockControls, validateClockControls } from '../src/symbol-clock-controls.ts';
import { ACTOR, fixture as browser } from './helpers/symbol-clock-fixture.ts';
import { reconstructRecordedAgedClock } from '../src/closed-symbol-recorded-aged-clock.ts';

const literal = '2026-01-15 12:34:56', referenceTime = Date.parse('2026-01-15T12:34:00Z'), selectedAppTime = Date.parse('2026-01-15T12:34:56Z');
function native(time: number): Record<string, unknown> { return { schema: 'easyeda-pro-control.windows-clock-sample.v1',
  utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(time) * 10_000n), utcAfterTicks: String(621_355_968_000_000_000n + BigInt(time + 1) * 10_000n),
  qpcBefore: String(BigInt(time) * 1000n), qpcAfter: String(BigInt(time + 1) * 1000n), qpcFrequency: '1000000', highResolution: true, localOffsetMinutes: 60, zoneRulesSha256: 'a'.repeat(64) }; }
function fixture(context: TestContext, age: number): Parameters<typeof reconstructRecordedAgedClock>[0] {
  const old = process.env['TZ']; process.env['TZ'] = 'Europe/Berlin'; context.after(() => { if (old === undefined) { delete process.env['TZ']; } else { process.env['TZ'] = old; } });
  const scope = { createdAtLiteral: literal, referenceUtcMs: referenceTime }, start = selectedAppTime + age;
  function controls(role: 'renderer' | 'main-reference', time: number): ReturnType<typeof validateClockControls> {
    const f = browser(role); Object.defineProperty(f.date, 'now', { value: (): number => time });
    const code = role === 'renderer' ? buildRendererClockControls(scope, ACTOR) : buildMainClockReference(scope);
    const raw: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${code}`, f.sandbox, { timeout: 1000 });
    return validateClockControls(structuredClone(raw), scope, role);
  }
  const main = controls('main-reference', referenceTime + 100); const descriptor = { path: '/synthetic/unread.json', bytes: 1, sha256: '0'.repeat(64) };
  const reference: OriginalMainReference = { profile: 'private.original-main-reference.v1', operationId: 'easyeda-20261012t000000z-12345678',
    request: validateMainReferenceRequest({ profile: 'private.exact-literal-main-reference.v1', nonce: 'a'.repeat(64), operationId: 'easyeda-20261012t000000z-12345678',
      closedPlanSha256: 'b'.repeat(64), baselineCopyReceiptSha256: 'c'.repeat(64), baselineLogicalSha256: 'd'.repeat(64), baselineClosureClockSha256: 'e'.repeat(64),
      nativePinsSha256: 'f'.repeat(64), historyUuid: '1'.repeat(32), ...scope }),
    observation: { reference: { mainReference: main }, nativeAfter: native(referenceTime + 101) }, intentArtifact: descriptor, resultArtifact: descriptor,
    baselineCopyReceiptSha256: 'c'.repeat(64), baselineLogicalSha256: 'd'.repeat(64), operationSha256: 'e'.repeat(64), appClockDirectlyObserved: false, executionAuthorized: false };
  return { reference, controlsBefore: controls('renderer', start + 5), controlsAfter: controls('renderer', start + 20), plannedWindow: { notBeforeMs: start, notAfterMs: start + 60_000 },
    editClockSamples: [native(start - 20), native(start - 10), native(start), native(start + 1), native(start + 30), native(start + 31)] };
}
for (const age of [0, 59_999, 60_000, 60_999, 61_000, 61_001, 120_000]) {
  void test(`fixed earliest-selection age ${age}ms`, context => {
    const input = fixture(context, age);
    if (age < 61_000) { assert.throws(() => reconstructRecordedAgedClock(input), /Recorded aged clock refused/u); }
    else { const result = reconstructRecordedAgedClock(input); assert.equal(result.agedHead.createdAtLiteral, literal); assert.equal(result.agedHead.nativeTimezoneOffsetMinutes, -60);
      assert.equal(result.historicalRelations[0]?.appQ2UnderCommonOsPremiseMs, selectedAppTime); assert.equal(result.executionAuthorized, false); assert.equal(result.authorityRestored, false); }
  });
}
for (let index = 0; index < 6; index += 1) {
  for (const [field, value] of [['localOffsetMinutes', 0], ['zoneRulesSha256', '0'.repeat(64)], ['qpcFrequency', '1'], ['qpcBefore', '1'], ['utcBeforeTicks', '1']] as const) {
    void test(`six-clock continuity refuses sample ${index} ${field}`, context => {
      const input = fixture(context, 61_000), samples = input.editClockSamples.map(sample => structuredClone(sample)); const sample = samples[index];
      assert.ok(sample !== null && typeof sample === 'object'); Reflect.set(sample, field, value);
      const tuple: [unknown, unknown, unknown, unknown, unknown, unknown] = [samples[0], samples[1], samples[2], samples[3], samples[4], samples[5]];
      assert.throws(() => reconstructRecordedAgedClock({ ...input, editClockSamples: tuple }), /Recorded aged clock|CLOCK_RECEIPT/u);
    });
  }
}

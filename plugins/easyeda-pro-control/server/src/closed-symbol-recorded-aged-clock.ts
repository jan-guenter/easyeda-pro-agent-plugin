/** Pure aged relation used only after fixed historical reference/capture replay. */
import type { OriginalMainReference } from './closed-symbol-main-reference.ts';
import type { ClockControls } from './symbol-clock-controls.ts';
import { compareHistoricalSqlClock } from './historical-sql-clock.ts';
import { validateClockSample } from './windows-clock-transport.ts';
import { isRecord } from './core.ts';

function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded aged clock refused.'); } }
export function reconstructRecordedAgedClock(input: Readonly<{
  reference: OriginalMainReference; controlsBefore: ClockControls; controlsAfter: ClockControls;
  editClockSamples: readonly [unknown, unknown, unknown, unknown, unknown, unknown];
  plannedWindow: Readonly<{ notBeforeMs: number; notAfterMs: number }>;
}>): Readonly<{ historicalRelations: readonly ReturnType<typeof compareHistoricalSqlClock>[];
  agedHead: Readonly<{ createdAtLiteral: string; nativeParsedLocalMs: number; nativeTimezoneOffsetMinutes: number }>;
  authorityRestored: false; executionAuthorized: false; completionProved: false }> {
  const { reference, plannedWindow } = input;
  need(isRecord(reference.observation['reference']) && input.editClockSamples.length === 6);
  const mainControls = reference.observation['reference']['mainReference'];
  let previous = validateClockSample(reference.observation['nativeAfter']);
  const samples = input.editClockSamples.map(validateClockSample);
  for (const sample of samples) {
    need(sample.zoneRulesSha256 === previous.zoneRulesSha256 && sample.localOffsetMinutes === previous.localOffsetMinutes && sample.qpcFrequency === previous.qpcFrequency &&
      BigInt(sample.qpcBefore) >= BigInt(previous.qpcAfter) && BigInt(sample.utcBeforeTicks) >= BigInt(previous.utcAfterTicks)); previous = sample;
  }
  const nativeBefore = samples[2]; const nativeAfter = samples[5]; need(nativeBefore !== undefined && nativeAfter !== undefined);
  const scope = { createdAtLiteral: reference.request.createdAtLiteral, referenceUtcMs: reference.request.referenceUtcMs };
  const historicalRelations = [input.controlsBefore, input.controlsAfter].map(controls => compareHistoricalSqlClock({ scope, renderer: controls,
    mainReference: mainControls, nativeBefore, nativeAfter, plannedWindow }));
  const historical = historicalRelations[0]; need(historical !== undefined && plannedWindow.notBeforeMs - historical.appQ2UnderCommonOsPremiseMs >= 61_000);
  return Object.freeze({ historicalRelations: Object.freeze(historicalRelations),
    agedHead: Object.freeze({ createdAtLiteral: scope.createdAtLiteral, nativeParsedLocalMs: historical.rendererParsedCreatedAtMs, nativeTimezoneOffsetMinutes: historical.currentTimezoneOffsetMinutes }),
    authorityRestored: false, executionAuthorized: false, completionProved: false });
}

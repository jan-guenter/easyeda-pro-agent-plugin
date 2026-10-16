/** Pure current-source conditional relation. Serialized observations cannot
 * issue current generation, scratch-reference, Windows or writer authority.
 */
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { exact, validateClockControlScope } from "./symbol-clock-controls.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE, validateCurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import type { CurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const PREMISES = Object.freeze([
  "current APP source and original generation must be independently admitted",
  "renderer and scratch reference must have original source-qualified same-runtime owners",
  "unchanged native Date and common Windows timezone rules with inherited TZ absent",
  "no intervening clock or timezone changes during the owned operation",
]);
function bad(): never { throw new Error("CURRENT_AGED_SQL_CLOCK_REFUSED"); }
const EPOCH_TICKS = 621_355_968_000_000_000n;
function endpoints(input: unknown, controls: CurrentAgedSqlClockControls): Readonly<{
  before: ReturnType<typeof validateClockSample>; after: ReturnType<typeof validateClockSample>; endMs: number;
}> {
  const value = exact(input, ["before", "after"]);
  const after = validateClockSample(value["after"]), before = validateClockSample(value["before"]);
  const startMs = Number((BigInt(before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
  const endMs = Number((BigInt(after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n);
  const first = controls.controlsBefore.clockBefore, last = controls.controlsAfter.clockAfter;
  compareRendererClockEndpoints({ nativeBefore: before, nativeAfter: after, plannedWindow: { notBeforeMs: startMs, notAfterMs: endMs },
    renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: first.epochMs, nowAfterMs: last.epochMs,
      isoBefore: first.iso, isoAfter: last.iso, offsetBeforeMinutes: first.offsetMinutes, offsetAfterMinutes: last.offsetMinutes } });
  return { before, after, endMs };
}

/** A prospective coordinator must provide the exact unlocked before-head
 * literal and original preselected backend window. This never learns a window
 * from an after-file value or changes the maintained SQL comparator's policy.
 */
export function compareCurrentAgedSqlClock(input: unknown): Readonly<{
  schema: "private.current-aged-sql-clock-comparison.v1";
  comparisonPassed: true; parserSource: typeof CURRENT_AGED_SQL_DATE_PARSER_SOURCE;
  createdAtLiteral: string; historicalTimezoneOffsetMinutes: number; currentTimezoneOffsetMinutes: number;
  appRlUnderCommonOsPremiseMs: number; minimumAgeMs: number;
  agedHead: Readonly<{ createdAtLiteral: string; nativeParsedLocalMs: number; nativeTimezoneOffsetMinutes: number }>;
  plannedBackendWindow: Readonly<{ notBeforeMs: number; notAfterMs: number }>;
  premises: readonly string[];
  producerBindingVerified: false; preselectedIntervalProven: false; appClockDirectlyObserved: false;
  continuousClockStabilityProved: false; executionAuthorized: false;
}> {
  const value = exact(input, ["scope", "renderer", "mainReference", "mainReferenceNativeClock", "rendererNativeClock", "plannedBackendWindow"]);
  const scope = validateClockControlScope(value["scope"]);
  const renderer = validateCurrentAgedSqlClockControls(value["renderer"], scope, "renderer");
  const main = validateCurrentAgedSqlClockControls(value["mainReference"], scope, "main-reference");
  const window = exact(value["plannedBackendWindow"], ["notBeforeMs", "notAfterMs"]);
  const mainEndpoints = endpoints(value["mainReferenceNativeClock"], main), rendererEndpoints = endpoints(value["rendererNativeClock"], renderer);
  if (mainEndpoints.after.zoneRulesSha256 !== rendererEndpoints.before.zoneRulesSha256 ||
      mainEndpoints.after.qpcFrequency !== rendererEndpoints.before.qpcFrequency ||
      mainEndpoints.after.localOffsetMinutes !== rendererEndpoints.before.localOffsetMinutes ||
      BigInt(mainEndpoints.after.utcAfterTicks) > BigInt(rendererEndpoints.before.utcBeforeTicks) ||
      BigInt(mainEndpoints.after.qpcAfter) > BigInt(rendererEndpoints.before.qpcBefore)) { bad(); }
  if (JSON.stringify(main.controlsBefore.epochs) !== JSON.stringify(renderer.controlsBefore.epochs) ||
      JSON.stringify(main.controlsBefore.sql) !== JSON.stringify(renderer.controlsBefore.sql) ||
      main.controlsBefore.clockBefore.offsetMinutes !== renderer.controlsBefore.clockBefore.offsetMinutes) { bad(); }
  const currentOffset = renderer.controlsBefore.clockBefore.offsetMinutes, selected = renderer.controlsBefore.sql[0];
  const notAfterMs = window["notAfterMs"], notBeforeMs = window["notBeforeMs"];
  if (selected === undefined || typeof notBeforeMs !== "number" || !Number.isSafeInteger(notBeforeMs) ||
      typeof notAfterMs !== "number" || !Number.isSafeInteger(notAfterMs) || Object.is(notBeforeMs, -0) || Object.is(notAfterMs, -0) ||
      notBeforeMs < rendererEndpoints.endMs || notAfterMs < notBeforeMs || notAfterMs - notBeforeMs > 60_000 ||
      notAfterMs > 253_402_214_399_999) { bad(); }
  // APP rl subtracts the CURRENT offset. Historical DST offset is deliberately
  // Retained separately and must not substitute for the current value.
  const adjusted = selected.epochMs - currentOffset * 60_000, minimumAgeMs = notBeforeMs - adjusted;
  if (!Number.isSafeInteger(adjusted) || !Number.isSafeInteger(minimumAgeMs) || minimumAgeMs < 61_000) { bad(); }
  return Object.freeze({ schema: "private.current-aged-sql-clock-comparison.v1", comparisonPassed: true,
    parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE, createdAtLiteral: scope.createdAtLiteral,
    historicalTimezoneOffsetMinutes: selected.offsetMinutes, currentTimezoneOffsetMinutes: currentOffset,
    appRlUnderCommonOsPremiseMs: adjusted, minimumAgeMs,
    agedHead: Object.freeze({ createdAtLiteral: scope.createdAtLiteral, nativeParsedLocalMs: selected.epochMs, nativeTimezoneOffsetMinutes: currentOffset }),
    plannedBackendWindow: Object.freeze({ notBeforeMs, notAfterMs }), premises: PREMISES,
    producerBindingVerified: false, preselectedIntervalProven: false, appClockDirectlyObserved: false,
    continuousClockStabilityProved: false, executionAuthorized: false });
}

/** Pure source-derived relation. Retained data alone never grants a write. */
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { exact, validateClockControlScope, validateClockControls } from "./symbol-clock-controls.ts";

export const APP_DATE_PARSER_SOURCE = Object.freeze({ file: "app.js", sha256: "10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb", utf16Offset: 1_317_965 });
const PREMISES = Object.freeze([
  "same reviewed custom runtime and unchanged native Date implementation",
  "same Windows OS timezone configuration and inherited TZ absent at owned launch",
  "no intervening clock or timezone changes during the owned operation",
  "main-reference producer and renderer belong to independently retained source-qualified generations",
]);
export function compareHistoricalSqlClock(input: unknown): Readonly<{
  schema: "private.historical-sql-clock-comparison.v1"; comparisonPassed: true; createdAtLiteral: string;
  rendererParsedCreatedAtMs: number; historicalTimezoneOffsetMinutes: number; currentTimezoneOffsetMinutes: number;
  appQ2UnderCommonOsPremiseMs: number; serverLocalOffsetMinutes: number; plannedWindow: Readonly<{ notBeforeMs: number; notAfterMs: number }>;
  premises: readonly string[]; parserSource: typeof APP_DATE_PARSER_SOURCE;
  producerBindingVerified: false; preselectedIntervalProven: false; appClockDirectlyObserved: false; continuousClockStabilityProved: false; executionAuthorized: false;
}> {
  const v = exact(input, ["scope", "renderer", "mainReference", "nativeBefore", "nativeAfter", "plannedWindow"]);
  const scope = validateClockControlScope(v["scope"]);
  const main = validateClockControls(v["mainReference"], scope, "main-reference"), renderer = validateClockControls(v["renderer"], scope, "renderer");
  const window = exact(v["plannedWindow"], ["notBeforeMs", "notAfterMs"]);
  const endpoints = compareRendererClockEndpoints({ nativeBefore: v["nativeBefore"], nativeAfter: v["nativeAfter"], plannedWindow: window,
    renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: renderer.clockBefore.epochMs, nowAfterMs: renderer.clockAfter.epochMs,
      isoBefore: renderer.clockBefore.iso, isoAfter: renderer.clockAfter.iso,
      offsetBeforeMinutes: renderer.clockBefore.offsetMinutes, offsetAfterMinutes: renderer.clockAfter.offsetMinutes } });
  if (JSON.stringify(main.epochs) !== JSON.stringify(renderer.epochs) || JSON.stringify(main.sql) !== JSON.stringify(renderer.sql) ||
      main.clockBefore.offsetMinutes !== renderer.clockBefore.offsetMinutes || main.clockAfter.offsetMinutes !== renderer.clockAfter.offsetMinutes) {
    throw new Error("HISTORICAL_SQL_CLOCK_REFUSED");
  }
  const selected = renderer.sql[0];
  const notAfterMs = window["notAfterMs"], notBeforeMs = window["notBeforeMs"];
  if (selected === undefined || typeof notAfterMs !== "number" || typeof notBeforeMs !== "number") { throw new TypeError("HISTORICAL_SQL_CLOCK_REFUSED"); }
  // APP q2 subtracts CURRENT getTimezoneOffset, not the parsed date's offset.
  const currentOffset = renderer.clockBefore.offsetMinutes;
  const adjusted = selected.epochMs - currentOffset * 60_000;
  if (!Number.isSafeInteger(adjusted)) { throw new TypeError("HISTORICAL_SQL_CLOCK_REFUSED"); }
  return Object.freeze({ schema: "private.historical-sql-clock-comparison.v1", comparisonPassed: true, createdAtLiteral: scope.createdAtLiteral,
    rendererParsedCreatedAtMs: selected.epochMs, historicalTimezoneOffsetMinutes: selected.offsetMinutes,
    currentTimezoneOffsetMinutes: currentOffset, appQ2UnderCommonOsPremiseMs: adjusted, serverLocalOffsetMinutes: endpoints.localOffsetMinutes,
    plannedWindow: Object.freeze({ notBeforeMs, notAfterMs }), premises: PREMISES, parserSource: APP_DATE_PARSER_SOURCE,
    producerBindingVerified: false, preselectedIntervalProven: false, appClockDirectlyObserved: false, continuousClockStabilityProved: false, executionAuthorized: false });
}

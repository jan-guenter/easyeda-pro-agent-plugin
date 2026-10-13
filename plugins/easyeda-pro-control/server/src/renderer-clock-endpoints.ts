/** Pure endpoint relation only. Inputs do not issue native or renderer authority. */
import { validateClockSample } from "./windows-clock-transport.ts";

type Bag = Record<string, unknown>;
const EPOCH_TICKS = 621_355_968_000_000_000n;
function fail(): never { throw new Error("RENDERER_CLOCK_ENDPOINTS_REFUSED"); }
function exact(input: unknown, keys: readonly string[]): Bag {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) ||
      Reflect.ownKeys(input).length !== keys.length) { fail(); }
  const result: Bag = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { fail(); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}
function milliseconds(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 8_640_000_000_000_000) { fail(); }
  return value;
}
export function compareRendererClockEndpoints(input: unknown): Readonly<{
  schema: "private.renderer-clock-endpoint-comparison.v1";
  endpointsAgree: true; localOffsetMinutes: number; utcElapsedMinimumMs: number; utcElapsedMaximumMs: number;
  qpcElapsedMinimumMs: number; qpcElapsedMaximumMs: number;
  producerBindingVerified: false; rendererBuiltinIdentityVerified: false; historicalSqlDateParsingQualified: false;
  utcQpcAgreementQualified: false; continuousClockStabilityProved: false; executionAuthorized: false;
}> {
  const v = exact(input, ["nativeBefore", "nativeAfter", "renderer", "plannedWindow"]);
  const after = validateClockSample(v["nativeAfter"]), before = validateClockSample(v["nativeBefore"]);
  const renderer = exact(v["renderer"], ["schema", "nowBeforeMs", "nowAfterMs", "isoBefore", "isoAfter", "offsetBeforeMinutes", "offsetAfterMinutes"]);
  const window = exact(v["plannedWindow"], ["notBeforeMs", "notAfterMs"]);
  const notAfter = milliseconds(window["notAfterMs"]), notBefore = milliseconds(window["notBeforeMs"]);
  if (notAfter < notBefore || notAfter - notBefore > 60_000 ||
      before.qpcFrequency !== after.qpcFrequency || before.zoneRulesSha256 !== after.zoneRulesSha256 ||
      before.localOffsetMinutes !== after.localOffsetMinutes ||
      BigInt(after.qpcBefore) < BigInt(before.qpcAfter) ||
      BigInt(after.utcBeforeTicks) < BigInt(before.utcAfterTicks)) { fail(); }
  const lower = (BigInt(before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n;
  const upper = (BigInt(after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n;
  if (lower < BigInt(notBefore) || upper > BigInt(notAfter)) { fail(); }
  const end = milliseconds(renderer["nowAfterMs"]), start = milliseconds(renderer["nowBeforeMs"]);
  if (renderer["schema"] !== "private.renderer-clock-endpoints.v1" || start > end ||
      BigInt(start) < lower || BigInt(end) > upper ||
      renderer["offsetBeforeMinutes"] !== -before.localOffsetMinutes ||
      renderer["offsetAfterMinutes"] !== -after.localOffsetMinutes ||
      renderer["isoBefore"] !== new Date(start).toISOString() ||
      renderer["isoAfter"] !== new Date(end).toISOString()) { fail(); }
  const frequency = Number(BigInt(before.qpcFrequency));
  return Object.freeze({
    schema: "private.renderer-clock-endpoint-comparison.v1", endpointsAgree: true, localOffsetMinutes: before.localOffsetMinutes,
    utcElapsedMinimumMs: Number(BigInt(after.utcBeforeTicks) - BigInt(before.utcAfterTicks)) / 10_000,
    utcElapsedMaximumMs: Number(BigInt(after.utcAfterTicks) - BigInt(before.utcBeforeTicks)) / 10_000,
    qpcElapsedMinimumMs: Number(BigInt(after.qpcBefore) - BigInt(before.qpcAfter)) * 1000 / frequency,
    qpcElapsedMaximumMs: Number(BigInt(after.qpcAfter) - BigInt(before.qpcBefore)) * 1000 / frequency,
    producerBindingVerified: false, rendererBuiltinIdentityVerified: false, historicalSqlDateParsingQualified: false,
    utcQpcAgreementQualified: false, continuousClockStabilityProved: false, executionAuthorized: false,
  });
}

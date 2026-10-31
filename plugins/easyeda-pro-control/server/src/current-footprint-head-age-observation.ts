/** Numerical joins after original native ownership has collected each input.
 * Calling this pure decoder does not itself issue provenance or native custody. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentFootprintHeadAgeMainObservation } from "./current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeSqlHead } from "./current-footprint-head-age-sql.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const bindingSchema = z.object({ helperInstance: z.string().length(32).regex(/^[a-f\d]{32}$/u), jobId: z.string().length(32).regex(/^[a-f\d]{32}$/u), rootPid: z.number().int().positive().max(2_147_483_647), rootCreated: z.string().regex(/^[1-9]\d{14,19}$/u) }).strict();
export type CurrentFootprintHeadAgeNativeBinding = Readonly<z.infer<typeof bindingSchema>>;
const reply = z.object({ schema: z.literal("easyeda-pro-control.footprint-head-age-clock.v1"), phase: z.enum(["before", "after"]), sequence: z.union([z.literal(1), z.literal(2)]),
  binding: bindingSchema, clock: z.object({ tzAbsent: z.literal(true), reason: z.null(), sample: z.unknown() }).strict() }).strict();
type Sample = ReturnType<typeof validateClockSample>;
const epochTicks = 621_355_968_000_000_000n;
/** Refuse contradictory or out-of-window data without issuing provenance. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_HEAD_AGE_OBSERVATION"); } }
/** Validate one original-clock wire response before later application reads.
 * A matching binding is a comparison input; the native owner retains authority. */
export function decodeCurrentFootprintHeadAgeClock(input: unknown, phase: "before" | "after", binding: CurrentFootprintHeadAgeNativeBinding): Sample {
  const value = reply.parse(captureCurrentPcbStringClockReply(input).value);
  need(value.phase === phase && value.sequence === (phase === "before" ? 1 : 2) && canonicalJson(value.binding) === canonicalJson(binding));
  return validateClockSample(value.clock.sample);
}
/** Use a containing millisecond interval when converting native 100ns ticks. */
export function currentFootprintHeadAgeReferenceUtc(sample: Sample): number {
  const value = Number((BigInt(sample.utcBeforeTicks) - epochTicks) / 10_000n); need(Number.isSafeInteger(value) && value >= 0); return value;
}
export interface CurrentFootprintHeadAgeComparison {
  readonly profile: "private.current-footprint-head-age-observation.v1"; readonly operationId: string;
  readonly head: CurrentFootprintHeadAgeSqlHead; readonly nativeBinding: CurrentFootprintHeadAgeNativeBinding;
  readonly main: CurrentFootprintHeadAgeMainObservation; readonly nativeBefore: Sample; readonly nativeAfter: Sample;
  readonly rawBeforeSha256: string; readonly rawAfterSha256: string;
  readonly minimumObservedAgeMs: number; readonly observedWindow: Readonly<{ notBeforeMs: number; notAfterMs: number }>;
  readonly ageVerifiedForObservedWindow: true; readonly nativeDateProvenanceVerified: false; readonly appClockDirectlyObserved: false;
  readonly preselectedWriterIntervalProven: false; readonly continuousClockStabilityProved: false;
  readonly nativeQualificationIssued: false; readonly runtimeAdmissionGranted: false; readonly replayTokenIssued: false;
  readonly executionAuthorized: false; readonly saveAuthorized: false;
}
export interface CurrentFootprintHeadAgeObservation extends Omit<CurrentFootprintHeadAgeComparison, "nativeDateProvenanceVerified" | "appClockDirectlyObserved"> {
  readonly nativeDateProvenanceVerified: true; readonly appClockDirectlyObserved: true;
}
/** Join actual application Date endpoints, actual rl results and the original
 * Windows bracket. Future writer selection requires a new explicitly bound
 * interval and cannot reuse this read-only result as execution authority. */
export function compareCurrentFootprintHeadAgeObservation(operationId: string, head: CurrentFootprintHeadAgeSqlHead,
  binding: CurrentFootprintHeadAgeNativeBinding, main: CurrentFootprintHeadAgeMainObservation, rawBefore: unknown, rawAfter: unknown): CurrentFootprintHeadAgeComparison {
  const before = decodeCurrentFootprintHeadAgeClock(rawBefore, "before", binding); const after = decodeCurrentFootprintHeadAgeClock(rawAfter, "after", binding);
  need(main.scope.createdAtLiteral === head.createdAtLiteral);
  const startMs = currentFootprintHeadAgeReferenceUtc(before); const endMs = Number((BigInt(after.utcAfterTicks) - epochTicks + 9999n) / 10_000n);
  need(main.scope.referenceUtcMs >= startMs && main.scope.referenceUtcMs <= endMs && endMs >= startMs && endMs - startMs <= 10_000 && BigInt(after.qpcAfter) - BigInt(before.qpcBefore) <= BigInt(before.qpcFrequency) * 10n);
  const first = main.controls.controlsBefore.clockBefore, last = main.controls.controlsAfter.clockAfter;
  compareRendererClockEndpoints({ nativeBefore: before, nativeAfter: after, plannedWindow: { notBeforeMs: startMs, notAfterMs: endMs }, renderer: {
    schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: first.epochMs, nowAfterMs: last.epochMs,
    isoBefore: first.iso, isoAfter: last.iso, offsetBeforeMinutes: first.offsetMinutes, offsetAfterMinutes: last.offsetMinutes } });
  const age = startMs - main.parsedBeforeMs; need(Number.isSafeInteger(age) && age >= 61_000);
  return Object.freeze({ profile: "private.current-footprint-head-age-observation.v1", operationId, head, nativeBinding: binding,
    main, nativeBefore: before, nativeAfter: after, rawBeforeSha256: sha256Json(rawBefore), rawAfterSha256: sha256Json(rawAfter),
    minimumObservedAgeMs: age, observedWindow: Object.freeze({ notBeforeMs: startMs, notAfterMs: endMs }),
    ageVerifiedForObservedWindow: true, nativeDateProvenanceVerified: false, appClockDirectlyObserved: false,
    preselectedWriterIntervalProven: false, continuousClockStabilityProved: false, nativeQualificationIssued: false,
    runtimeAdmissionGranted: false, replayTokenIssued: false, executionAuthorized: false, saveAuthorized: false });
}

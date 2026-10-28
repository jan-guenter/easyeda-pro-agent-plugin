/** Durable sample data only; no original owner or Windows provenance is minted. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintCopyRouteObservationSchema, recordedCurrentFootprintCopyRouteObservationSchema } from "../src/current-footprint-copy-route-observation.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

function sample(milliseconds: number): {
  schema: "easyeda-pro-control.windows-clock-sample.v1"; utcBeforeTicks: string; utcAfterTicks: string;
  qpcBefore: string; qpcAfter: string; qpcFrequency: string; highResolution: true; localOffsetMinutes: number; zoneRulesSha256: string;
} {
  const ticks = 639_274_896_000_000_000n + BigInt(milliseconds) * 10_000n;
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds) * 1000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "a".repeat(64) };
}
void test("durable Windows clock projection rejects pair contradictions accepted by individually valid samples", () => {
  const schema = currentFootprintCopyRouteObservationSchema.shape.windowsClock;
  const value = { profile: "private.current-footprint-copy-windows-clock.v1", phase: "before", sequence: 1,
    binding: { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "639274896000000000" },
    before: sample(1000), after: sample(1010), originalTransportIssued: true, rawReplySha256: "d".repeat(64), nativeClockSamplesVerified: true,
    backendActorProvenanceVerified: false, documentClockProvenanceVerified: false, executionAuthorized: false, saveAuthorized: false };
  assert.equal(schema.safeParse(value).success, true);
  for (const after of [sample(999), sample(11_000), { ...sample(1010), localOffsetMinutes: 60 },
    { ...sample(1010), zoneRulesSha256: "e".repeat(64) }, { ...sample(1010), qpcFrequency: "2000000" },
    { ...sample(1010), qpcBefore: sample(999).qpcBefore, qpcAfter: sample(999).qpcAfter },
    { ...sample(1010), qpcBefore: sample(11_000).qpcBefore, qpcAfter: sample(11_000).qpcAfter }]) {
    assert.equal(schema.safeParse({ ...value, after }).success, false);
  }
  assert.equal(schema.safeParse({ ...value, before: { ...sample(1000), localOffsetMinutes: -0 },
    after: { ...sample(1010), localOffsetMinutes: -0 } }).success, false);
  assert.equal(schema.safeParse({ ...value, after: { ...sample(1010), qpcBefore: "not-decimal" } }).success, false);
});

void test("current route publication requires both original registration fields while recorded history preserves their absence", () => {
  const current = currentFootprintCopyRouteObservationSchema.shape, recorded = recordedCurrentFootprintCopyRouteObservationSchema.shape;
  const registration = { profile: "private.current-footprint-copy-clock-registration.v1", runtimeWsSourceQualified: true,
    originalNotificationBusRetained: true, originalRpcWrapperAndCallbackRetained: true, originalNativeDateNowRetained: true,
    initialLexicalOffset: -59, documentClockInvocationObserved: false, responderExclusivityProven: false, backendOwnershipProven: false, executionAuthorized: false };
  const final = { profile: "private.current-footprint-copy-clock-registration-sample.v1", sampleIndex: 1, lexicalOffset: 82,
    documentClockInvocationObserved: false, executionAuthorized: false };
  assert.equal(current.clockRegistration.safeParse(registration).success, true); assert.equal(current.clockRegistrationFinalSample.safeParse(final).success, true);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Explicit absence is the regression input distinguishing mandatory current fields from optional historical fields.
  assert.equal(current.clockRegistration.safeParse(undefined).success, false); assert.equal(current.clockRegistrationFinalSample.safeParse(undefined).success, false);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Historical absence must remain absent instead of being upgraded into a current clock registration.
  assert.equal(recorded.clockRegistration.safeParse(undefined).success, true); assert.equal(recorded.clockRegistrationFinalSample.safeParse(undefined).success, true);
  assert.equal(current.clockRegistrationFinalSample.safeParse({ ...final, sampleIndex: 2 }).success, false);
  assert.equal(current.clockRegistration.safeParse({ ...registration, documentClockInvocationObserved: true }).success, false);
  assert.equal(current.clockRegistration.safeParse({ ...registration, backendOwnershipProven: true }).success, false);
  assert.equal(recorded.clockRegistration.safeParse({ ...registration, responderExclusivityProven: true }).success, false);
  assert.equal(current.clockRegistrationFinalSample.safeParse({ ...final, executionAuthorized: true }).success, false);
  const failure = { schema: "easyeda-pro-control.footprint-copy-route-failure.v1", operationId: "footprint-route-synthetic", createdAt: "2026-10-28T12:00:00.000Z", intentSha256: "a".repeat(64),
    failedStage: "clock-registration", error: "synthetic refusal", completedObservations: {}, executionAuthorized: false, saveAuthorized: false };
  assert.equal(diagnosticLifecycleRecordSchemas["footprint-copy-route-failure.json"].safeParse(failure).success, true);
  assert.equal(diagnosticLifecycleRecordSchemas["footprint-copy-route-failure.json"].safeParse({ ...failure, failedStage: "clock-registration-sample" }).success, true);
  assert.equal(diagnosticLifecycleRecordSchemas["footprint-copy-route-failure.json"].safeParse({ ...failure, failedStage: "clock-dispatch" }).success, false);
});

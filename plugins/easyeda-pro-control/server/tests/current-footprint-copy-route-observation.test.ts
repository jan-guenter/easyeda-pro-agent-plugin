/** Durable sample data only; no original owner or Windows provenance is minted. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintCopyRouteObservationSchema } from "../src/current-footprint-copy-route-observation.ts";

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

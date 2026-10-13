import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { WITNESS } from "./helpers/symbol-sql-fixture.ts";
import { syntheticClockSample } from "./helpers/windows-clock-spawn-fixture.ts";
import { compareClosedSymbolClockData, qualifyClosedSymbolTerminationClock } from "../src/closed-sql-clock.ts";

type Input = Parameters<typeof compareClosedSymbolClockData>[0];
function record(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }
function terminationClock(value: Input): Record<string, unknown> { return record(record(value.termination)["clock"]); }
function fixture(): Input {
  const operationId = "easyeda-20261012t000000z-12345678";
  const generation = { ordinal: 1, rootPid: 101, rootStartIdentity: `win32:134045000000000000:job:${"a".repeat(32)}`,
    jobId: "a".repeat(32), helperInstance: "b".repeat(32), runtimeSha256: "c".repeat(64), sessionSha256: "d".repeat(64), captureSha256: "e".repeat(64) };
  const startTicks = String(syntheticClockSample(2)["utcBeforeTicks"]);
  const start = Number((BigInt(startTicks) - 621_355_968_000_000_000n) / 10_000n);
  const witness = { ...WITNESS, serverClockMinMs: start, serverClockMaxMs: start + 60_000, serverLocalOffsetMinutes: 120 };
  const proof = { operationId, phase: "closed-edit", challengeAttempt: 1, jobId: generation.jobId, helperInstance: generation.helperInstance,
    bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256, jobEmpty: true, retainedProcessesExited: true,
    authoritySha256: "1".repeat(64), closeIntentSha256: "2".repeat(64), proofSha256: "3".repeat(64), closedAt: new Date(start + 4000).toISOString() };
  const observation = (phase: string, index: number): Record<string, unknown> => ({ schema: "easyeda-pro-control.owned-clock-attachment.v1", phase,
    helperSourceSha256: "4".repeat(64), executionScopeSha256: "5".repeat(64), base: { jobId: generation.jobId, helperInstance: generation.helperInstance },
    clock: { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: syntheticClockSample(index), after: syntheticClockSample(index + 1) } });
  const termination = observation("termination", 6);
  Object.assign(record(termination["base"]), { jobEmpty: true, retainedProcessesExited: true, checkedAt: proof.closedAt, captureBindingSha256: "6".repeat(64) });
  termination["ownerBinding"] = { operationId, phase: "closed-edit", challengeAttempt: 1, authoritySha256: proof.authoritySha256,
    closeIntentSha256: proof.closeIntentSha256, captureBindingSha256: "6".repeat(64) };
  return { operationId, generation, witnessArtifactSha256: "7".repeat(64), witness, proof, termination,
    qualification: { profile: "private.closed-symbol-witness-clock-qualification.v1", operationId, generation, rawResultArtifactSha256: "7".repeat(64), witness,
      plannedWindow: { notBeforeMs: start, notAfterMs: start + 60_000 }, launchClock: observation("launch", 0), beforeClock: observation("capture", 2), afterClock: observation("capture", 4) } };
}
void test("whole-Job endpoint relation stays inside the original selected interval without a clock-lock claim", () => {
  const value = fixture();
  const result = compareClosedSymbolClockData(value);
  assert.equal(result["entireJobExitedWithinOriginalWindow"], true); assert.equal(result["continuousClockStabilityProved"], false);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["completionProved"], false);
  assert.deepEqual(result["plannedWindow"], value.qualification["plannedWindow"]);
});
const changes: Readonly<Record<string, (value: Input) => void>> = {
  "late termination": (value) => {
    for (const name of ["before", "after"]) {
      const sample = record(terminationClock(value)[name]);
      for (const field of ["utcBeforeTicks", "utcAfterTicks"]) { sample[field] = String(BigInt(String(sample[field])) + 610_000_000n); }
    }
  },
  "widened interval": (value) => { record(value.qualification["plannedWindow"])["notAfterMs"] = value.witness.serverClockMaxMs + 1; },
  "wrong clock window": (value) => { Reflect.set(value.witness, "serverClockMinMs", value.witness.serverClockMinMs - 1000); },
  "poststate witness": (value) => { Reflect.set(value, "witness", { ...value.witness, client: "0".repeat(16) }); },
  "wrong generation": (value) => { Reflect.set(value, "generation", { ...value.generation, ordinal: 2 }); },
  "wrong witness artifact": (value) => { Reflect.set(value, "witnessArtifactSha256", "0".repeat(64)); },
  "unavailable native clock": (value) => { record(value.termination)["clock"] = { status: "unavailable", reason: "tz-present" }; },
  "TZ becomes present": (value) => { record(record(value.termination)["clock"])["tzAbsentAfter"] = false; },
  "different helper source": (value) => { record(value.termination)["helperSourceSha256"] = "0".repeat(64); },
  "different execution scope": (value) => { record(value.termination)["executionScopeSha256"] = "0".repeat(64); },
  "different Job": (value) => { record(record(value.termination)["base"])["jobId"] = "0".repeat(32); },
  "different helper": (value) => { record(record(value.termination)["base"])["helperInstance"] = "0".repeat(32); },
  "different timezone rules": (value) => { record(record(record(value.termination)["clock"])["before"])["zoneRulesSha256"] = "0".repeat(64); },
  "different offset": (value) => { record(record(record(value.termination)["clock"])["after"])["localOffsetMinutes"] = 60; },
  "different QPC frequency": (value) => { record(record(record(value.termination)["clock"])["after"])["qpcFrequency"] = "10000000"; },
  "backward QPC": (value) => { Object.assign(record(terminationClock(value)["before"]), { qpcBefore: "0", qpcAfter: "1" }); },
  "backward UTC": (value) => { Object.assign(record(terminationClock(value)["before"]), { utcBeforeTicks: syntheticClockSample(1)["utcBeforeTicks"], utcAfterTicks: syntheticClockSample(1)["utcAfterTicks"] }); },
  "wrong termination phase": (value) => { record(value.termination)["phase"] = "capture"; },
  "nonempty Job": (value) => { Reflect.set(value.proof, "jobEmpty", false); },
  "wrong native checkedAt": (value) => { record(record(value.termination)["base"])["checkedAt"] = "2020-01-01T00:00:00Z"; },
};
for (const [name, change] of Object.entries(changes)) {
  void test(`termination relation rejects ${name}`, () => { const value = fixture(); change(value); assert.throws(() => compareClosedSymbolClockData(value)); });
}
for (const field of ["operationId", "phase", "challengeAttempt", "authoritySha256", "closeIntentSha256", "captureBindingSha256"]) {
  void test(`termination relation rejects changed owner ${field}`, () => {
    const value = fixture(); record(record(value.termination)["ownerBinding"])[field] = "changed";
    assert.throws(() => compareClosedSymbolClockData(value));
  });
}
void test("structurally valid JSON proof cannot obtain a source-issued termination observation", async () => {
  const value = fixture();
  const { termination: _observation, ...input } = value;
  await assert.rejects(qualifyClosedSymbolTerminationClock(input), /Original Windows result/u);
});

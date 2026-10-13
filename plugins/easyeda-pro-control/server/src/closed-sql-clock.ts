/** Original whole-Job exit clock plus a fixed pre-dispatch interval. No clock lock. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { Generation } from "./closed-symbol-journal.ts";
import type { SymbolSqlWitness } from "./symbol-sql-comparator.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { windowsClockObservationForResult } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";

type Bag = Readonly<Record<string, unknown>>;
const EPOCH_TICKS = 621_355_968_000_000_000n;
function need(value: boolean): asserts value { if (!value) { throw new Error("Closed SQL termination clock qualification refused."); } }
function clock(value: unknown): Readonly<{ attachment: Bag; before: ReturnType<typeof validateClockSample>; after: ReturnType<typeof validateClockSample> }> {
  need(isRecord(value) && value["schema"] === "easyeda-pro-control.owned-clock-attachment.v1" && isRecord(value["clock"]));
  const sample = value["clock"];
  need(sample["status"] === "observed" && sample["tzAbsentBefore"] === true && sample["tzAbsentAfter"] === true);
  const after = validateClockSample(sample["after"]), before = validateClockSample(sample["before"]);
  need(BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) && BigInt(before.qpcAfter) <= BigInt(after.qpcBefore));
  return { attachment: value, before, after };
}

/** Pure relation: callers cannot turn this result into an issued native token. */
export function compareClosedSymbolClockData(input: Readonly<{
  operationId: string; generation: Generation; witnessArtifactSha256: string; witness: Readonly<SymbolSqlWitness>;
  qualification: Bag; proof: Readonly<Record<string, unknown>>; termination: unknown;
}>): Readonly<Record<string, unknown>> {
  const { generation, witness, qualification, proof } = input;
  need(qualification["profile"] === "private.closed-symbol-witness-clock-qualification.v1" && qualification["operationId"] === input.operationId &&
    qualification["rawResultArtifactSha256"] === input.witnessArtifactSha256 && canonicalJson(qualification["generation"]) === canonicalJson(generation) &&
    canonicalJson(qualification["witness"]) === canonicalJson(witness) && generation.ordinal === 1 &&
    canonicalJson(qualification["plannedWindow"]) === canonicalJson({ notBeforeMs: witness.serverClockMinMs, notAfterMs: witness.serverClockMaxMs }));
  const maximum = witness.serverClockMaxMs, minimum = witness.serverClockMinMs;
  need(Number.isSafeInteger(minimum) && minimum >= 0 && Number.isSafeInteger(maximum) && maximum >= minimum && maximum - minimum <= 60_000);
  const after = clock(qualification["afterClock"]), before = clock(qualification["beforeClock"]), exit = clock(input.termination), launch = clock(qualification["launchClock"]);
  const sources = [launch, before, after, exit];
  for (const [index, item] of sources.entries()) {
    const base = item.attachment["base"];
    need(isRecord(base) && base["jobId"] === generation.jobId && base["helperInstance"] === generation.helperInstance &&
      item.attachment["helperSourceSha256"] === before.attachment["helperSourceSha256"] &&
      item.attachment["executionScopeSha256"] === before.attachment["executionScopeSha256"] &&
      item.attachment["phase"] === ["launch", "capture", "capture", "termination"][index]);
    for (const sample of [item.before, item.after]) {
      need(sample.localOffsetMinutes === witness.serverLocalOffsetMinutes && sample.zoneRulesSha256 === before.before.zoneRulesSha256 &&
        sample.qpcFrequency === before.before.qpcFrequency);
      if (index > 0) {
        need(BigInt(sample.utcBeforeTicks) >= EPOCH_TICKS + BigInt(minimum) * 10_000n &&
          BigInt(sample.utcAfterTicks) <= EPOCH_TICKS + BigInt(maximum) * 10_000n);
      }
    }
    const previous = sources[index - 1];
    if (previous !== undefined) {
      need(BigInt(item.before.utcBeforeTicks) >= BigInt(previous.after.utcAfterTicks) && BigInt(item.before.qpcBefore) >= BigInt(previous.after.qpcAfter));
    }
  }
  const base = exit.attachment["base"], owner = exit.attachment["ownerBinding"];
  need(isRecord(owner) && isRecord(base) && proof["operationId"] === input.operationId && proof["phase"] === "closed-edit" && proof["challengeAttempt"] === 1 &&
    proof["jobId"] === generation.jobId && proof["helperInstance"] === generation.helperInstance &&
    proof["bridgeSessionSha256"] === generation.sessionSha256 && proof["runtimeIdentitySha256"] === generation.runtimeSha256 &&
    proof["jobEmpty"] === true && proof["retainedProcessesExited"] === true && base["jobEmpty"] === true && base["retainedProcessesExited"] === true &&
    owner["operationId"] === input.operationId && owner["phase"] === "closed-edit" && owner["challengeAttempt"] === 1 &&
    owner["authoritySha256"] === proof["authoritySha256"] && owner["closeIntentSha256"] === proof["closeIntentSha256"] &&
    owner["captureBindingSha256"] === base["captureBindingSha256"] && base["checkedAt"] === proof["closedAt"]);
  const closedAt = base["checkedAt"];
  need(typeof closedAt === "string" && Number.isFinite(Date.parse(closedAt)) && Date.parse(closedAt) >= minimum && Date.parse(closedAt) <= maximum &&
    Date.parse(closedAt) >= Number((BigInt(exit.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n) &&
    Date.parse(closedAt) <= Number((BigInt(exit.after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n));
  return Object.freeze({ profile: "private.closed-symbol-clock-completion-relation.v1", operationId: input.operationId,
    proofSha256: proof["proofSha256"], terminationObservationSha256: sha256Json(input.termination),
    plannedWindow: Object.freeze({ notBeforeMs: minimum, notAfterMs: maximum }), entireJobExitedWithinOriginalWindow: true,
    commonOsClockAndNoInterveningChangeRequired: true, continuousClockStabilityProved: false,
    producerBindingVerified: false, executionAuthorized: false, completionProved: false });
}

/** Original source-owned issuer lookup; JSON and callbacks cannot replace it. */
export async function qualifyClosedSymbolTerminationClock(input: Readonly<{
  operationId: string; generation: Generation; witnessArtifactSha256: string; witness: Readonly<SymbolSqlWitness>;
  qualification: Bag; proof: unknown;
}>): Promise<Readonly<{ termination: IssuedWindowsClockObservation; relation: Readonly<Record<string, unknown>> }>> {
  const proof = input.proof, sealed = canonicalJson(input);
  const termination = await windowsClockObservationForResult(proof, "termination");
  need(input.proof === proof && canonicalJson(input) === sealed && isRecord(proof));
  const relation = compareClosedSymbolClockData({ ...input, proof, termination });
  return Object.freeze({ termination, relation });
}

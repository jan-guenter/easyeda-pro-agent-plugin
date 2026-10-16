/** Retained native endpoint observations only. No backend actor or write clock is issued. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";

export interface CurrentSymbolClockRelationInput {
  readonly operationId: string;
  readonly runtime: WindowsControlRuntime;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchClock: IssuedWindowsClockObservation;
  readonly admissionClock: IssuedWindowsClockObservation;
  readonly cacheClock: IssuedWindowsClockObservation;
  readonly projectOpenClock: IssuedWindowsClockObservation;
  readonly terminationClock: IssuedWindowsClockObservation;
  readonly finishProof: ClosedSessionTerminationProof;
}
type Sample = ReturnType<typeof validateClockSample>;
type Stage = "launch" | "admission" | "inactive-caches" | "project-only-open" | "finish-termination";
interface Endpoint {
  readonly stage: Stage;
  readonly observation: IssuedWindowsClockObservation;
  readonly before: Sample;
  readonly after: Sample;
}
export interface CurrentSymbolClockRelation {
  readonly schema: "easyeda-pro-control.current-symbol-retained-clock-relation.v1";
  readonly operationId: string; readonly jobId: string; readonly helperInstance: string;
  readonly helperSourceSha256: string; readonly executionScopeSha256: string;
  readonly launchSha256: string; readonly finishProofSha256: string;
  readonly observations: readonly Readonly<{ stage: Stage; observationSha256: string; before: Sample; after: Sample }>[];
  readonly localOffsetMinutes: number; readonly zoneRulesSha256: string;
  readonly lifecycleElapsed: ReturnType<typeof elapsed>;
  readonly observedEndpointsOrdered: true;
  readonly commonOsClockAndNoInterveningChangeRequired: true;
  readonly timestampProducers: Readonly<{ documentUpdateTime: "not-observed"; backendEditHeadTime: "not-observed";
    backendLocalProjectTime: "not-observed"; sqliteUtcHistoryTime: "not-observed" }>;
  readonly producerBindingVerified: false; readonly backendActorVerified: false; readonly backendClockVerified: false;
  readonly clockProducerOwnershipVerified: false; readonly continuousClockStabilityProved: false;
  readonly utcQpcAgreementQualified: false; readonly writerWindowEstablished: false; readonly writerDeadlineExtended: false;
  readonly startupQualified: false; readonly openingEffectsVerified: false; readonly persistenceVerified: false;
  readonly executionAuthorized: false;
}
const EPOCH_TICKS = 621_355_968_000_000_000n;
const INPUT_KEYS = ["operationId", "runtime", "launch", "launchClock", "admissionClock", "cacheClock", "projectOpenClock", "terminationClock", "finishProof"] as const;
// oxlint-disable-next-line typescript/unbound-method -- Retain method identity; calls below explicitly retain the original runtime receiver.
const RUNTIME_CLOCK_LOOKUP = WindowsControlRuntime.prototype.clockObservationForLaunch;
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current symbol retained clock relation refused."); }
}

/** Preserve original issued objects across awaits; never parse or clone them into tokens. */
function retain(input: CurrentSymbolClockRelationInput): Readonly<{ value: CurrentSymbolClockRelationInput; current: () => void }> {
  need(isRecord(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) &&
    Reflect.ownKeys(input).length === INPUT_KEYS.length);
  const values = INPUT_KEYS.map((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"));
    return descriptor.value as unknown;
  });
  // Every property was checked as an own data field before this synchronous copy.
  const value = Object.freeze({ ...input });
  need(typeof value.operationId === "string" && /^[a-z0-9][a-z0-9-]{7,95}$/iu.test(value.operationId));
  const runtimeCurrent = (): void => {
    need(value.runtime instanceof WindowsControlRuntime && Object.getPrototypeOf(value.runtime) === WindowsControlRuntime.prototype &&
      !Object.hasOwn(value.runtime, "clockObservationForLaunch") && WindowsControlRuntime.prototype.clockObservationForLaunch === RUNTIME_CLOCK_LOOKUP);
  };
  runtimeCurrent();
  const launchText = canonicalJson(value.launch), proofText = canonicalJson(value.finishProof);
  return { value, current(): void {
    runtimeCurrent();
    need(Reflect.ownKeys(input).length === INPUT_KEYS.length);
    for (const [index, key] of INPUT_KEYS.entries()) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.value === values[index]);
    }
    need(canonicalJson(value.launch) === launchText && canonicalJson(value.finishProof) === proofText);
  } };
}

function endpoint(stage: Stage, observation: IssuedWindowsClockObservation): Endpoint {
  const clock = observation.clock;
  need(clock.status === "observed" && clock.tzAbsentBefore && clock.tzAbsentAfter &&
    !observation.producerBindingVerified && !observation.executionAuthorized);
  const after = validateClockSample(clock.after), before = validateClockSample(clock.before);
  need(BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) && BigInt(before.qpcAfter) <= BigInt(after.qpcBefore));
  return { stage, observation, before, after };
}

/** Native timestamps carry up to seven fractional digits; do not silently truncate them. */
function nativeTimestampTicks(input: unknown): bigint {
  need(typeof input === "string");
  const matched = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{3,7})Z$/u.exec(input);
  need(matched !== null && matched[1] !== undefined && matched[2] !== undefined);
  const whole = `${matched[1]}.000Z`;
  const epochMs = Date.parse(whole);
  need(Number.isSafeInteger(epochMs) && epochMs >= 0 && new Date(epochMs).toISOString() === whole);
  return EPOCH_TICKS + BigInt(epochMs) * 10_000n + BigInt(matched[2].padEnd(7, "0"));
}
function timestampWithin(value: unknown, point: Endpoint): void {
  const ticks = nativeTimestampTicks(value);
  need(ticks >= BigInt(point.before.utcBeforeTicks) && ticks <= BigInt(point.after.utcAfterTicks));
}
function safeMilliseconds(numerator: bigint, denominator: bigint, roundUp: boolean): number {
  need(numerator >= 0n && denominator > 0n);
  const result = (numerator + (roundUp ? denominator - 1n : 0n)) / denominator;
  need(result <= BigInt(Number.MAX_SAFE_INTEGER));
  return Number(result);
}
function elapsed(first: Endpoint, last: Endpoint): Readonly<{
  utcMinimumMs: number; utcMaximumMs: number; qpcMinimumMs: number; qpcMaximumMs: number;
}> {
  return Object.freeze({
    utcMinimumMs: safeMilliseconds(BigInt(last.before.utcBeforeTicks) - BigInt(first.after.utcAfterTicks), 10_000n, false),
    utcMaximumMs: safeMilliseconds(BigInt(last.after.utcAfterTicks) - BigInt(first.before.utcBeforeTicks), 10_000n, true),
    qpcMinimumMs: safeMilliseconds((BigInt(last.before.qpcBefore) - BigInt(first.after.qpcAfter)) * 1000n, BigInt(first.before.qpcFrequency), false),
    qpcMaximumMs: safeMilliseconds((BigInt(last.after.qpcAfter) - BigInt(first.before.qpcBefore)) * 1000n, BigInt(first.before.qpcFrequency), true),
  });
}

function bindCapture(point: Endpoint, input: CurrentSymbolClockRelationInput, phase: string, attempt: number): void {
  const { observation } = point, base = observation.base, owner = observation.ownerBinding;
  const admission = input.admissionClock.ownerBinding;
  need(observation.phase === "capture" && owner["operationId"] === input.operationId && owner["phase"] === phase &&
    owner["challengeAttempt"] === attempt && owner["bindingSha256"] === base["bindingSha256"] &&
    owner["bridgeSessionSha256"] === admission["bridgeSessionSha256"] && owner["runtimeIdentitySha256"] === admission["runtimeIdentitySha256"]);
  const rows = base["processes"];
  need(Array.isArray(rows));
  const roots: unknown[] = rows.filter((row: unknown) => isRecord(row) && row["role"] === "easyeda-main");
  need(roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(input.launch.root));
  timestampWithin(base["capturedAt"], point);
}

/** Call before releasing the original generation. Missing stages are a refusal,
 * not evidence that they were skipped safely. Long lifecycle durations remain
 * descriptive and never extend the independent 60-second writer comparisons.
 */
export async function qualifyCurrentSymbolClockRelation(input: CurrentSymbolClockRelationInput): Promise<CurrentSymbolClockRelation> {
  const retained = retain(input), v = retained.value;
  need(await RUNTIME_CLOCK_LOOKUP.call(v.runtime, v.launch) === v.launchClock); retained.current();
  need(await windowsClockObservationForResult(v.finishProof, "termination") === v.terminationClock); retained.current();
  const named = [["launch", v.launchClock], ["admission", v.admissionClock], ["inactive-caches", v.cacheClock],
    ["project-only-open", v.projectOpenClock], ["finish-termination", v.terminationClock]] as const;
  need(new Set(named.map(([, observation]) => observation)).size === named.length);
  const points: Endpoint[] = [];
  for (const [stage, observation] of named) {
    need(await assertIssuedWindowsClockObservation(observation) === observation); retained.current();
    points.push(endpoint(stage, observation));
  }
  const [launch, admission, cache, projectOpen, termination] = points;
  need(launch !== undefined && admission !== undefined && cache !== undefined && projectOpen !== undefined && termination !== undefined);
  for (const [index, point] of points.entries()) {
    const { observation } = point;
    need(observation.base["jobId"] === v.launch.jobId && observation.base["helperInstance"] === v.launch.helperInstance &&
      observation.helperSourceSha256 === launch.observation.helperSourceSha256 &&
      observation.executionScopeSha256 === launch.observation.executionScopeSha256);
    for (const sample of [point.before, point.after]) {
      need(sample.qpcFrequency === launch.before.qpcFrequency && sample.zoneRulesSha256 === launch.before.zoneRulesSha256 &&
        sample.localOffsetMinutes === launch.before.localOffsetMinutes);
    }
    const previous = points[index - 1];
    if (previous !== undefined) {
      need(BigInt(point.before.utcBeforeTicks) >= BigInt(previous.after.utcAfterTicks) &&
        BigInt(point.before.qpcBefore) >= BigInt(previous.after.qpcAfter));
    }
  }
  need(launch.observation.phase === "launch" && canonicalJson(launch.observation.base) === canonicalJson(v.launch) &&
    launch.observation.ownerBinding["launchSha256"] === sha256Json(v.launch));
  bindCapture(admission, v, "closed-edit", 1);
  bindCapture(cache, v, "current-symbol-inactive-caches", 1);
  bindCapture(projectOpen, v, "current-symbol-project-only-open", 2);
  for (const key of ["bindingSha256", "authoritySha256"]) {
    need(new Set([admission, cache, projectOpen].map((point) => point.observation.ownerBinding[key])).size === 3);
  }
  const base = termination.observation.base, owner = termination.observation.ownerBinding, proof = v.finishProof;
  need(termination.observation.phase === "termination" && proof["operationId"] === v.operationId && proof["phase"] === "closed-edit" &&
    proof["challengeAttempt"] === 1 && proof.launchSha256 === sha256Json(v.launch) && proof["jobId"] === v.launch.jobId &&
    proof["helperInstance"] === v.launch.helperInstance && proof["bridgeSessionSha256"] === admission.observation.ownerBinding["bridgeSessionSha256"] &&
    proof["runtimeIdentitySha256"] === admission.observation.ownerBinding["runtimeIdentitySha256"] &&
    proof.authoritySha256 === admission.observation.ownerBinding["authoritySha256"] &&
    owner["operationId"] === v.operationId && owner["phase"] === "closed-edit" && owner["challengeAttempt"] === 1 &&
    owner["authoritySha256"] === proof.authoritySha256 && owner["closeIntentSha256"] === proof.closeIntentSha256 &&
    owner["captureBindingSha256"] === admission.observation.base["bindingSha256"] &&
    base["captureBindingSha256"] === owner["captureBindingSha256"] && base["checkedAt"] === proof.closedAt &&
    base["jobEmpty"] === true && base["retainedProcessesExited"] === true && proof.jobEmpty && proof.retainedProcessesExited);
  timestampWithin(proof.closedAt, termination);
  // Recheck the two original results after all fallible issuer checks. The
  // Remaining observations are frozen and share the same qualified helper.
  need(await RUNTIME_CLOCK_LOOKUP.call(v.runtime, v.launch) === v.launchClock); retained.current();
  need(await windowsClockObservationForResult(v.finishProof, "termination") === v.terminationClock); retained.current();
  return Object.freeze({
    schema: "easyeda-pro-control.current-symbol-retained-clock-relation.v1" as const,
    operationId: v.operationId, jobId: v.launch.jobId, helperInstance: v.launch.helperInstance,
    helperSourceSha256: v.launchClock.helperSourceSha256, executionScopeSha256: v.launchClock.executionScopeSha256,
    launchSha256: sha256Json(v.launch), finishProofSha256: proof.proofSha256,
    observations: Object.freeze(points.map((point) => Object.freeze({ stage: point.stage, observationSha256: sha256Json(point.observation),
      before: point.before, after: point.after }))),
    localOffsetMinutes: launch.before.localOffsetMinutes, zoneRulesSha256: launch.before.zoneRulesSha256,
    lifecycleElapsed: elapsed(launch, termination), observedEndpointsOrdered: true as const,
    commonOsClockAndNoInterveningChangeRequired: true as const,
    timestampProducers: Object.freeze({ documentUpdateTime: "not-observed", backendEditHeadTime: "not-observed",
      backendLocalProjectTime: "not-observed", sqliteUtcHistoryTime: "not-observed" } as const),
    producerBindingVerified: false as const, backendActorVerified: false as const, backendClockVerified: false as const,
    clockProducerOwnershipVerified: false as const, continuousClockStabilityProved: false as const,
    utcQpcAgreementQualified: false as const, writerWindowEstablished: false as const, writerDeadlineExtended: false as const,
    startupQualified: false as const, openingEffectsVerified: false as const, persistenceVerified: false as const,
    executionAuthorized: false as const,
  });
}

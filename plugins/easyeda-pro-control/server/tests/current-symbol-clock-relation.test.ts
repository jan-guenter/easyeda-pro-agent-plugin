import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { isRecord } from "../src/core.ts";
import { qualifyCurrentSymbolClockRelation } from "../src/current-symbol-clock-relation.ts";
import type { CurrentSymbolClockRelationInput } from "../src/current-symbol-clock-relation.ts";
import { windowsClockObservationForResult } from "../src/windows-authority.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";

type Bag = Record<string, unknown>;
interface Options {
  readonly cachePhase?: string;
  readonly cacheAttempt?: number;
  readonly openAttempt?: number;
  readonly foreignOperation?: boolean;
  readonly foreignSession?: boolean;
  readonly foreignRuntime?: boolean;
  readonly mutateNative?: (request: Readonly<Bag>, response: Bag) => void;
}
const EPOCH_TICKS = 621_355_968_000_000_000n;
function forbidden(): never { throw new Error("Clock relation fixture must not call the upstream."); }
async function fixture(context: TestContext, options: Options = {}): Promise<{
  native: Awaited<ReturnType<typeof qualifiedClockFixture>>; input: CurrentSymbolClockRelationInput;
}> {
  const native = await qualifiedClockFixture(context);
  native.behavior.mutateResponse = (request, response): void => {
    // Real helper timestamps lie inside each observation; the generic fixture's
    // Constant timestamps are intentionally replaced only in this synthetic child.
    const originalClock = response["clock"];
    options.mutateNative?.(request, response);
    const base = response["base"], changedClock = response["clock"];
    const clock = isRecord(changedClock) && isRecord(changedClock["before"]) ? changedClock : originalClock;
    if (isRecord(clock) && isRecord(clock["before"]) && isRecord(base)) {
      const ticks = clock["before"]["utcBeforeTicks"];
      assert.ok(typeof ticks === "string");
      const epochMs = Number((BigInt(ticks) - EPOCH_TICKS) / 10_000n);
      const timestamp = new Date(epochMs).toISOString();
      if (Object.hasOwn(base, "capturedAt")) { base["capturedAt"] = timestamp; }
      if (Object.hasOwn(base, "checkedAt")) { base["checkedAt"] = timestamp; }
    }
  };
  const runtime = new WindowsControlRuntime({ pluginRoot: "/synthetic/clock-relation", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    reviewedExecutionScopeSha256: native.options.reviewedExecutionScopeSha256,
    upstream: { callTool: forbidden, bridgeSessionLifecycle: forbidden, currentAuthenticatedBridgeDispatchBinding: forbidden } }, {
    startSupervisor: (): Promise<typeof native.supervisor> => Promise.resolve(native.supervisor),
    hashExecutable: (): Promise<string> => Promise.resolve(native.options.expectedExecutableSha256),
  });
  const launch = await runtime.launch();
  const admissionInput = { ...INPUT, orphanPhase: "closed-edit" };
  const admission = await native.supervisor.capture(admissionInput);
  const cache = await native.supervisor.capture({ ...INPUT, bindingSha256: "3".repeat(64),
    operationId: options.foreignOperation === true ? "foreign-operation" : INPUT.operationId,
    orphanPhase: options.cachePhase ?? "current-symbol-inactive-caches", challengeAttempt: options.cacheAttempt ?? 1,
    bridgeSession: { ...INPUT.bridgeSession, ...(options.foreignSession === true ? { sessionId: "other-session" } : {}) },
    runtimeIdentity: { ...INPUT.runtimeIdentity, ...(options.foreignRuntime === true ? { generation: "other-runtime" } : {}) } });
  const projectOpen = await native.supervisor.capture({ ...INPUT, bindingSha256: "4".repeat(64),
    orphanPhase: "current-symbol-project-only-open", challengeAttempt: options.openAttempt ?? 2 });
  const binding = { operationId: INPUT.operationId, phase: "closed-edit", challengeAttempt: 1,
    bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, executionAuthority: admission, launch };
  const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const finishProof = await native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const input: CurrentSymbolClockRelationInput = {
    operationId: INPUT.operationId, runtime, launch, finishProof,
    launchClock: await runtime.clockObservationForLaunch(launch),
    admissionClock: await windowsClockObservationForResult(admission, "capture"),
    cacheClock: await windowsClockObservationForResult(cache, "capture"),
    projectOpenClock: await windowsClockObservationForResult(projectOpen, "capture"),
    terminationClock: await windowsClockObservationForResult(finishProof, "termination"),
  };
  return { native, input };
}

void test("current clock relation accepts original issued ordered endpoints without further native requests", async (context) => {
  const f = await fixture(context), requests = f.native.requests.length;
  const result = await qualifyCurrentSymbolClockRelation(f.input);
  assert.equal(result.operationId, INPUT.operationId);
  assert.equal(result.finishProofSha256, f.input.finishProof.proofSha256);
  assert.deepEqual(result.observations.map((point) => point.stage), ["launch", "admission", "inactive-caches", "project-only-open", "finish-termination"]);
  assert.deepEqual(result.lifecycleElapsed, { utcMinimumMs: 6999, utcMaximumMs: 9001, qpcMinimumMs: 6999, qpcMaximumMs: 9001 });
  assert.equal(result.localOffsetMinutes, 120);
  assert.equal(result.observedEndpointsOrdered, true);
  assert.equal(result.executionAuthorized, false); assert.equal(result.backendActorVerified, false);
  assert.equal(result.backendClockVerified, false); assert.equal(result.clockProducerOwnershipVerified, false);
  assert.equal(result.writerDeadlineExtended, false); assert.equal(result.writerWindowEstablished, false);
  assert.equal(result.persistenceVerified, false); assert.equal(result.utcQpcAgreementQualified, false);
  assert.equal(result.continuousClockStabilityProved, false); assert.equal(result.producerBindingVerified, false);
  assert.equal(result.openingEffectsVerified, false); assert.equal(result.startupQualified, false);
  assert.equal(result.commonOsClockAndNoInterveningChangeRequired, true);
  assert.deepEqual(result.timestampProducers, { documentUpdateTime: "not-observed", backendEditHeadTime: "not-observed",
    backendLocalProjectTime: "not-observed", sqliteUtcHistoryTime: "not-observed" });
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.observations), true);
  assert.equal(Object.isFrozen(result.observations[0]?.before), true);
  assert.equal(f.native.requests.length, requests);
});

void test("a long lifecycle is reported without expanding a writer interval", async (context) => {
  const f = await fixture(context, { mutateNative(request, response): void {
    if (request["action"] !== "clocked-prove-terminated") { return; }
    const clock = response["clock"]; assert.ok(isRecord(clock));
    for (const key of ["before", "after"]) {
      const point = clock[key]; assert.ok(isRecord(point));
      for (const field of ["utcBeforeTicks", "utcAfterTicks"]) { point[field] = String(BigInt(String(point[field])) + 1_200_000_000n); }
      for (const field of ["qpcBefore", "qpcAfter"]) { point[field] = String(BigInt(String(point[field])) + 120_000_000n); }
    }
  } });
  const result = await qualifyCurrentSymbolClockRelation(f.input);
  assert.equal(result.lifecycleElapsed.utcMaximumMs, 129_001);
  assert.equal(result.lifecycleElapsed.qpcMaximumMs, 129_001);
  assert.equal(result.writerWindowEstablished, false); assert.equal(result.writerDeadlineExtended, false);
  assert.equal(result.executionAuthorized, false);
});

for (const key of ["launch", "finishProof", "launchClock", "admissionClock", "cacheClock", "projectOpenClock", "terminationClock"] as const) {
  void test(`clock relation refuses reconstructed ${key}`, async (context) => {
    const f = await fixture(context);
    await assert.rejects(qualifyCurrentSymbolClockRelation({ ...f.input, [key]: structuredClone(f.input[key]) }));
  });
}
for (const key of ["admissionClock", "cacheClock", "projectOpenClock", "terminationClock"] as const) {
  void test(`clock relation refuses missing ${key} instead of inferring a safe skipped stage`, async (context) => {
    const f = await fixture(context);
    const input = { ...f.input };
    Object.defineProperty(input, key, { value: undefined });
    await assert.rejects(qualifyCurrentSymbolClockRelation(input));
  });
}
void test("clock relation refuses genuine stages supplied in the wrong slots", async (context) => {
  const f = await fixture(context);
  await assert.rejects(qualifyCurrentSymbolClockRelation({ ...f.input, cacheClock: f.input.projectOpenClock, projectOpenClock: f.input.cacheClock }));
  await assert.rejects(qualifyCurrentSymbolClockRelation({ ...f.input, cacheClock: f.input.admissionClock }));
});

for (const options of [{ cachePhase: "other-phase" }, { cacheAttempt: 2 }, { openAttempt: 1 },
  { foreignOperation: true }, { foreignSession: true }, { foreignRuntime: true }]) {
  void test(`clock relation refuses mismatched capture owner ${JSON.stringify(options)}`, async (context) => {
    const f = await fixture(context, options);
    await assert.rejects(qualifyCurrentSymbolClockRelation(f.input), /retained clock relation refused/u);
  });
}

for (const change of ["unavailable", "frequency", "zone", "offset", "utc-order", "qpc-order"] as const) {
  void test(`clock relation refuses genuine but inconsistent native ${change}`, async (context) => {
    const f = await fixture(context, { mutateNative(request, response): void {
      if (request["action"] !== "clocked-prove-terminated") { return; }
      if (change === "unavailable") { response["clock"] = { status: "unavailable", reason: "clock-sample" }; return; }
      const clock = response["clock"]; assert.ok(isRecord(clock));
      for (const key of ["before", "after"]) {
        const point = clock[key]; assert.ok(isRecord(point));
        if (change === "frequency") { point["qpcFrequency"] = "2000000"; }
        else if (change === "zone") { point["zoneRulesSha256"] = "a".repeat(64); }
        else if (change === "offset") { point["localOffsetMinutes"] = 60; }
        else if (change === "utc-order") {
          for (const field of ["utcBeforeTicks", "utcAfterTicks"]) { point[field] = String(BigInt(String(point[field])) - 30_000_000n); }
        } else {
          for (const field of ["qpcBefore", "qpcAfter"]) { point[field] = String(BigInt(String(point[field])) - 3_000_000n); }
        }
      }
    } });
    await assert.rejects(qualifyCurrentSymbolClockRelation(f.input), /retained clock relation refused/u);
  });
}

for (const drift of ["helper-source", "release", "new-generation"] as const) {
  void test(`clock relation revalidates original issuer after ${drift}`, async (context) => {
    const f = await fixture(context);
    if (drift === "helper-source") { await writeFile(f.native.helperPath, "synthetic drift", { mode: 0o600 }); }
    else if (drift === "release") { await f.native.supervisor.release(); }
    else { await f.native.supervisor.launch({ confirmLaunch: true }); }
    await assert.rejects(qualifyCurrentSymbolClockRelation(f.input));
  });
}
void test("clock relation refuses input accessors without invoking them and changes during issuer awaits", async (context) => {
  const f = await fixture(context);
  let calls = 0;
  const accessor = { ...f.input };
  Object.defineProperty(accessor, "cacheClock", { get() { calls += 1; return f.input.cacheClock; } });
  await assert.rejects(qualifyCurrentSymbolClockRelation(accessor)); assert.equal(calls, 0);
  const changed = { ...f.input }, pending = qualifyCurrentSymbolClockRelation(changed);
  changed.operationId = "changed-operation";
  await assert.rejects(pending, /retained clock relation refused/u);
});

void test("clock relation refuses a runtime lookalike and shadowed launch lookup", async (context) => {
  const f = await fixture(context);
  const lookalike: unknown = Object.create(WindowsControlRuntime.prototype);
  const input = { ...f.input };
  Object.defineProperty(input, "runtime", { value: lookalike });
  await assert.rejects(qualifyCurrentSymbolClockRelation(input));
  let calls = 0;
  Object.defineProperty(f.input.runtime, "clockObservationForLaunch", { value: (): Promise<typeof f.input.launchClock> => {
    calls += 1; return Promise.resolve(f.input.launchClock);
  } });
  await assert.rejects(qualifyCurrentSymbolClockRelation(f.input), /retained clock relation refused/u);
  assert.equal(calls, 0);
});

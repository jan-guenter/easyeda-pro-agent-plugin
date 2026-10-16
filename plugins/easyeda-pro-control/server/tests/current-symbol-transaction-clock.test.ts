/** Source-qualified issuer with synthetic child streams, not connected validation. */
import assert from "node:assert/strict";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import timerPromises from "node:timers/promises";
import { isRecord } from "../src/core.ts";
import { prepareCurrentSymbolTransactionClock, recordCurrentSymbolTransactionClockPost, verifyCurrentSymbolTransactionClock } from "../src/current-symbol-transaction-clock.ts";
import type { CurrentSymbolDocumentClockSample, CurrentSymbolTransactionClockInput } from "../src/current-symbol-transaction-clock.ts";
import { windowsClockObservationForResult } from "../src/windows-authority.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { IDS, OPERATION, TIMES, WITNESS, applyEffect, encrypted, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
const ACTOR = Object.freeze({ uuid: IDS.actor, username: "UI name", nickname: "UI nickname" });
type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function sample(milliseconds: number): Bag {
  const ticks = EPOCH + BigInt(milliseconds) * 10_000n;
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds - BASE) * 1000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
function document(first: number, server: number, last: number): CurrentSymbolDocumentClockSample {
  return { rendererBeforeMs: BASE + first, serverTimeMs: BASE + server, rendererAfterMs: BASE + last,
    rendererBeforeIso: new Date(BASE + first).toISOString(), rendererAfterIso: new Date(BASE + last).toISOString(),
    rendererTimezoneOffsetMinutes: -120, notifyTabId: "a".repeat(16) };
}
function utc(milliseconds: number): string { return new Date(milliseconds).toISOString().replace(/Z$/u, "0000Z"); }
function currentRaw(): string { return expectedRaw().replace('"editVersion":"3.0"', '"editVersion":"3.2.206"'); }
async function setup(context: TestContext, zeroWidth = false): Promise<{
  data: Awaited<ReturnType<typeof fixture>>;
  native: Awaited<ReturnType<typeof qualifiedClockFixture>>;
  input: CurrentSymbolTransactionClockInput;
  nextClock: () => ReturnType<NonNullable<Awaited<ReturnType<typeof qualifiedClockFixture>>["supervisor"]["observeCurrentClock"]>>;
  terminate: (otherCapture?: typeof INPUT) => ReturnType<Awaited<ReturnType<typeof qualifiedClockFixture>>["supervisor"]["proveClosedSession"]>;
  behavior: { time: number; adjust: ((action: unknown, response: Bag) => void) | undefined };
}> {
  const data = await fixture(), native = await qualifiedClockFixture(context);
  const behavior: { time: number; adjust: ((action: unknown, response: Bag) => void) | undefined } = { time: BASE - 10_000, adjust: undefined };
  native.behavior.mutateResponse = (request, response): void => {
    if (response["clock"] !== undefined) {
      response["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: sample(behavior.time), after: sample(behavior.time + 2) };
      const base = bag(response["base"]);
      for (const key of ["capturedAt", "observedAt", "checkedAt"]) { if (key in base) { base[key] = utc(behavior.time + 1); } }
      if (zeroWidth && request["action"] === "clocked-observe-owned-clock") {
        const point = sample(behavior.time);
        point["utcAfterTicks"] = point["utcBeforeTicks"]; point["qpcAfter"] = point["qpcBefore"];
        response["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: point, after: { ...point } };
        base["observedAt"] = utc(behavior.time);
      }
    }
    behavior.adjust?.(request["action"], response);
  };
  const launch = await native.supervisor.launch({ confirmLaunch: true }), launchClock = await windowsClockObservationForResult(launch, "launch");
  behavior.time = BASE - 5000;
  const executionAuthority = await native.supervisor.capture(INPUT);
  const captureClock = await windowsClockObservationForResult(executionAuthority, "capture");
  const observe = native.supervisor.observeCurrentClock; assert.ok(observe !== undefined);
  behavior.time = BASE;
  const beforeClock = await observe(executionAuthority);
  behavior.time = BASE + 100;
  const armedClock = await observe(executionAuthority);
  const input: CurrentSymbolTransactionClockInput = { before: data.before, operation: OPERATION, startupActor: ACTOR, cachedActor: ACTOR,
    comparisonIdentity: { projectUuid: IDS.project, branchUuid: IDS.branch, client: WITNESS.client, preDispatchMaxTicket: WITNESS.preDispatchMaxTicket },
    dispatchOwner: Object.freeze({ syntheticOnly: true }), launchClock, captureClock, beforeClock, armedClock,
    documentBefore: document(10, 20, 30) };
  return { data, native, input, behavior,
    nextClock() { behavior.time = BASE + 2100; return observe(executionAuthority); },
    async terminate(otherCapture) {
      behavior.time = BASE + 3000;
      const selected = otherCapture ?? INPUT;
      const selectedAuthority = otherCapture === undefined ? executionAuthority : await native.supervisor.capture(selected);
      behavior.time = BASE + 180_000;
      const binding = { operationId: selected.operationId, phase: selected.orphanPhase, challengeAttempt: selected.challengeAttempt,
        bridgeSession: selected.bridgeSession, runtimeIdentity: selected.runtimeIdentity, launch, executionAuthority: selectedAuthority };
      const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
      const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
      return native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    },
  };
}
async function completed(context: TestContext): Promise<Awaited<ReturnType<typeof setup>> & {
  plan: Awaited<ReturnType<typeof prepareCurrentSymbolTransactionClock>>;
  proof: Awaited<ReturnType<Awaited<ReturnType<typeof setup>>["terminate"]>>;
}> {
  const f = await setup(context), plan = await prepareCurrentSymbolTransactionClock(f.input);
  const afterClock = await f.nextClock();
  await recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) });
  const proof = await f.terminate(); applyEffect(f.data.path, currentRaw());
  return { ...f, plan, proof };
}

void test("clock plan owns full SQL comparison with independent immutable windows and later termination", async (context) => {
  const f = await completed(context);
  const after = await inventory(f.data.path);
  assert.deepEqual(f.plan.backendWindow, { minimumMs: BASE, maximumMs: BASE + 60_000 });
  assert.deepEqual(f.plan.documentWindow, { minimumMs: BASE + 20, maximumMs: BASE + 60_020 });
  assert.ok(Date.parse(f.proof.closedAt) > f.plan.backendWindow.maximumMs);
  const result = await verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after });
  assert.equal(result["transactionTimestampsWithinPlannedWindows"], true);
  const actor = bag(result["fullActorSqlEffect"]), sql = bag(actor["fullSqlEffect"]);
  assert.equal(actor["transactionActorMatchesExpected"], true); assert.equal(sql["exactLogicalSqlEffect"], true);
  for (const key of ["dispatchOwnershipVerified", "documentSampleProvenanceVerified", "sourceOwnershipVerified", "startupQualified",
    "producerBindingVerified", "appClockDirectlyObserved", "continuousClockStabilityProved", "futureWriteClockVerified",
    "entireJobExitedWithinOriginalWindow", "persistentUploadReplayExcluded", "reopened", "writerReady", "executionAuthorized"]) {
    assert.equal(result[key], false); assert.equal(Reflect.get(f.plan, key), false);
  }
  assert.equal(result["commonOsClockAndNoInterveningChangeRequired"], true);
  assert.ok(Object.isFrozen(f.plan) && Object.isFrozen(f.plan.backendWindow) && Object.isFrozen(result));
  await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /unconsumed/u);
});

void test("clock preparation rejects copied Windows tokens and consumes the owner without resampling", async (context) => {
  const f = await setup(context);
  await assert.rejects(prepareCurrentSymbolTransactionClock({ ...f.input, beforeClock: structuredClone(f.input.beforeClock) }), /not issued/u);
  await assert.rejects(prepareCurrentSymbolTransactionClock(f.input), /reservation already consumed/u);
});

void test("clock plan rejects JSON plan reconstruction and forged after inventory", async (context) => {
  const f = await completed(context);
  const after = await inventory(f.data.path);
  await assert.rejects(verifyCurrentSymbolTransactionClock(structuredClone(f.plan), { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /original unconsumed/u);
  await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after: structuredClone(after) }), /original inventory/u);
  await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /unconsumed/u);
});

void test("clock post consumes failed owner binding before any later post attempt", async (context) => {
  const f = await setup(context), plan = await prepareCurrentSymbolTransactionClock(f.input);
  const afterClock = await f.nextClock();
  await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: {}, afterClock, documentAfter: document(2000, 2005, 2010) }), /owner changed/u);
  await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) }), /unconsumed/u);
});

void test("clock preparation snapshots document, actor and operation before its first await", async (context) => {
  const f = await setup(context);
  const rawDocument = { ...f.input.documentBefore };
  const operation = structuredClone(OPERATION);
  const pending = prepareCurrentSymbolTransactionClock({ ...f.input, documentBefore: rawDocument, operation });
  rawDocument.serverTimeMs = 0; operation.patch.name = "changed while pending";
  const plan = await pending; assert.equal(plan.documentWindow.minimumMs, BASE + 20);
  const afterClock = await f.nextClock();
  await recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) });
  const proof = await f.terminate(); applyEffect(f.data.path, currentRaw());
  await verifyCurrentSymbolTransactionClock(plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: proof, after: await inventory(f.data.path) });
});

for (const mode of ["iso", "offset", "outside-bracket", "ordering", "accessor", "extra-bound"] as const) {
  void test(`clock preparation refuses ${mode} without issuing a plan`, async (context) => {
    const f = await setup(context), rawDocument = { ...f.input.documentBefore };
    let observed = false;
    if (mode === "iso") { rawDocument.rendererBeforeIso = "2026-02-30T00:00:00.000Z"; }
    else if (mode === "offset") { rawDocument.rendererTimezoneOffsetMinutes = 0; }
    else if (mode === "outside-bracket") { Object.assign(rawDocument, document(-1, 0, 1)); }
    else if (mode === "ordering") { Object.assign(rawDocument, document(30, 20, 10)); }
    else if (mode === "accessor") { Object.defineProperty(rawDocument, "serverTimeMs", { get() { observed = true; return BASE + 20; } }); }
    const comparisonIdentity = mode === "extra-bound" ? { ...f.input.comparisonIdentity, backendClockMaxMs: BASE + 99_999 } : f.input.comparisonIdentity;
    await assert.rejects(prepareCurrentSymbolTransactionClock({ ...f.input, comparisonIdentity, documentBefore: rawDocument }));
    assert.equal(observed, false);
  });
}

for (const mode of ["fraction-outside", "calendar", "zone-change", "backward-qpc", "late-document"] as const) {
  void test(`clock post refuses ${mode} and remains consumed`, async (context) => {
    const f = await setup(context), plan = await prepareCurrentSymbolTransactionClock(f.input);
    f.behavior.adjust = (action, response): void => {
      if (action !== "clocked-observe-owned-clock") { return; }
      const base = bag(response["base"]), clock = bag(response["clock"]);
      const before = bag(clock["before"]);
      const after = bag(clock["after"]);
      if (mode === "fraction-outside") { base["observedAt"] = utc(BASE + 2103).replace(/0000Z$/u, "0001Z"); }
      else if (mode === "calendar") { base["observedAt"] = "2026-11-31T12:34:57.1010000Z"; }
      else if (mode === "zone-change") { before["zoneRulesSha256"] = "a".repeat(64); after["zoneRulesSha256"] = "a".repeat(64); }
      else if (mode === "backward-qpc") { before["qpcBefore"] = "1"; before["qpcAfter"] = "2"; after["qpcBefore"] = "3"; after["qpcAfter"] = "4"; }
    };
    const afterClock = await f.nextClock();
    const documentAfter = mode === "late-document" ? document(61_000, 61_001, 61_002) : document(2000, 2005, 2010);
    await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter }));
    await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) }), /unconsumed/u);
  });
}

for (const mode of ["actor", "collateral", "document-time", "backend-time", "forged-termination"] as const) {
  void test(`clock result requires its own complete comparison and refuses ${mode}`, async (context) => {
    const f = await completed(context);
    if (mode === "collateral") { mutate(f.data.path, "UPDATE resources SET dataStr='not the intended effect'"); }
    else if (mode === "actor") { mutate(f.data.path, `UPDATE projects SET modifier_uuid='${"a".repeat(32)}'`); }
    else if (mode === "document-time" || mode === "backend-time") {
      const original = mode === "document-time" ? TIMES.document : TIMES.edit;
      const maximum = mode === "document-time" ? f.plan.documentWindow.maximumMs : f.plan.backendWindow.maximumMs;
      const changed = currentRaw().replaceAll(String(original), String(maximum + 1));
      mutate(f.data.path, `UPDATE history_data SET dataStr='${encrypted(changed, IDS.newHead, IDS.newKey)}' WHERE id=12`);
    }
    const terminationProof = mode === "forged-termination" ? structuredClone(f.proof) : f.proof;
    await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof, after: await inventory(f.data.path) }));
  });
}

void test("genuine termination for another original capture cannot complete the clock plan", async (context) => {
  const f = await setup(context), plan = await prepareCurrentSymbolTransactionClock(f.input);
  const afterClock = await f.nextClock();
  await recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) });
  const proof = await f.terminate({ ...INPUT, bindingSha256: "9".repeat(64), operationId: "different-original-operation" });
  applyEffect(f.data.path, currentRaw());
  await assert.rejects(verifyCurrentSymbolTransactionClock(plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: proof, after: await inventory(f.data.path) }), /clock refused/u);
});

void test("post observation cannot hide an intervening capture behind the same original binding", async (context) => {
  const f = await setup(context), plan = await prepareCurrentSymbolTransactionClock(f.input);
  await f.native.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64), operationId: "intervening-capture" });
  const afterClock = await f.nextClock();
  await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010) }), /capture.*changed/u);
});

void test("termination owner lost during full SQL comparison cannot produce success", async (context) => {
  const f = await completed(context);
  const after = await inventory(f.data.path);
  const original = timerPromises.setImmediate;
  let yielded = false;
  context.mock.method(timerPromises, "setImmediate", (): Promise<void> => {
    yielded = true; f.native.child.exitCode = 1; return original();
  });
  syncBuiltinESMExports();
  await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /retained helper or process handles are unavailable/u);
  assert.equal(yielded, true, "Loss must occur during the actual maintained SQL comparison.");
  await assert.rejects(verifyCurrentSymbolTransactionClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /unconsumed/u);
});

void test("zero-width valid Windows evidence cannot be reused as both pre-dispatch brackets", async (context) => {
  const f = await setup(context, true);
  await assert.rejects(prepareCurrentSymbolTransactionClock({ ...f.input, armedClock: f.input.beforeClock, documentBefore: document(0, 0, 0) }), /distinct original/u);
});

void test("zero-width original armed evidence cannot stand in for the post-dispatch bracket", async (context) => {
  const f = await setup(context, true), plan = await prepareCurrentSymbolTransactionClock(f.input);
  await assert.rejects(recordCurrentSymbolTransactionClockPost(plan, { dispatchOwner: f.input.dispatchOwner,
    afterClock: f.input.armedClock, documentAfter: document(100, 100, 100) }), /distinct original/u);
});

/* oxlint-disable import/max-dependencies -- These synthetic composition cases use the actual original token/SQL issuers and durable ledgers without application access. */
/** Synthetic replies only. Retired test journals stay under the isolated root. */
import assert from "node:assert/strict";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { CurrentPcbStringClockCoordinator } from "../src/current-pcb-string-clock-coordinator.ts";
import { CURRENT_PCB_STRING_LEDGER_DIRECTORY, assertNoUnresolvedCurrentPcbStringLedgers } from "../src/current-pcb-string-ledger-exclusion.ts";
import { CurrentPcbStringLifecycleLedger } from "../src/current-pcb-string-lifecycle-ledger.ts";
import { CurrentPcbStringNativeClockIssuer } from "../src/current-pcb-string-native-clock.ts";
import type { CurrentPcbStringNativeClockPhase } from "../src/current-pcb-string-native-clock.ts";
import { CurrentPcbStringServerClockRunner } from "../src/current-pcb-string-server-clock-runner.ts";
import { stringLedgerFixture } from "./helpers/current-pcb-string-ledger-fixture.ts";
import { TIMES } from "./helpers/symbol-sql-fixture.ts";

async function fixture(id: string, replyFails = false, pendingReply = false): Promise<Readonly<{
  ledger: CurrentPcbStringLifecycleLedger; issuer: CurrentPcbStringNativeClockIssuer;
  runner: CurrentPcbStringServerClockRunner; coordinator: CurrentPcbStringClockCoordinator;
  nativeCalls: CurrentPcbStringNativeClockPhase[]; serverCalls: string[];
  loseServerOwner: () => void; settleServerReply: () => void;
}>> {
  const f = await stringLedgerFixture();
  const ledger = await CurrentPcbStringLifecycleLedger.prepareOriginalProvenance(id, f.candidate, f.createPlan, f.provenance);
  const create = await ledger.reserveCreate(); await ledger.recordCreateOutcome(create, f.createResult);
  await ledger.comparePostCreate(f.publication, f.beforeRaw, f.beforeRaw, f.afterRaw, f.afterRaw, f.publication.expectedPayload);
  await ledger.compareDeliveredPublication(f.capture);
  const binding = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 1234, rootCreated: "134370398619813012" });
  const nativeCalls: CurrentPcbStringNativeClockPhase[] = [], serverCalls: string[] = [], start = TIMES.document - 1000;
  const issuer = new CurrentPcbStringNativeClockIssuer({ request(request): Promise<unknown> {
    nativeCalls.push(request.phase);
    const milliseconds = start + { before: 0, armed: 500, post: 1500, termination: 2500 }[request.phase];
    const sample = (sub: number): Record<string, unknown> => {
      const ticks = 621_355_968_000_000_000n + BigInt(milliseconds) * 10_000n + BigInt(sub);
      return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 1n),
        qpcBefore: String((milliseconds - start) * 1000 + sub), qpcAfter: String((milliseconds - start) * 1000 + sub + 1),
        qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: "c".repeat(64) };
    };
    return Promise.resolve({ schema: "easyeda-pro-control.pcb-string-native-clock.v1", phase: request.phase,
      sequence: request.sequence, binding, clock: { before: { tzAbsent: true, reason: null, sample: sample(0) },
        after: { tzAbsent: true, reason: null, sample: sample(2) } } });
  }, assertCurrent(): void {
    // Synthetic retained native owner.
  } }, binding);
  const delayed = Promise.withResolvers<unknown>(); let serverCurrent = true, serverReply: unknown;
  const runner = new CurrentPcbStringServerClockRunner(f.provenance, { request(): Promise<unknown> {
    serverCalls.push("server-time"); if (replyFails) { return Promise.reject(new Error("synthetic lost reply")); }
    const milliseconds = start + 200, stamp = { milliseconds, iso: new Date(milliseconds).toISOString(), timezoneOffsetMinutes: -120 };
    serverReply = { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-string-server-clock.v1",
      identity: f.provenance.identity, workerUserText: f.provenance.workerUserText, busUuid: "11111111-1111-1111-1111-111111111111",
      rpcTicketBefore: 0, rpcTicketAfter: 1, serverTimeMs: milliseconds, clock: { before: stamp, after: stamp } }) } };
    return pendingReply ? delayed.promise : Promise.resolve(serverReply);
  }, assertCurrent(): void {
    assert.equal(serverCurrent, true, "synthetic original server owner lost");
  } });
  return { ledger, issuer, runner, coordinator: CurrentPcbStringClockCoordinator.prepare(ledger, issuer), nativeCalls, serverCalls,
    loseServerOwner(): void { serverCurrent = false; }, settleServerReply(): void { delayed.resolve(serverReply); } };
}
async function retainCase(name: string): Promise<void> {
  await assert.rejects(assertNoUnresolvedCurrentPcbStringLedgers(), /unresolved/u);
  // Only this test process's builtin-preload-created synthetic root is selected.
  // Preserve failures under a distinct sibling, never erase journals to reset a live owner.
  await rename(join(controlDataDirectory(), CURRENT_PCB_STRING_LEDGER_DIRECTORY),
    join(controlDataDirectory(), `${CURRENT_PCB_STRING_LEDGER_DIRECTORY}-retained-${name}`));
}
void test("clock coordinator reserves before a caller can observe, pins class methods and preserves false authority", async () => {
  const f = await fixture("string-ledger-clock-original"); let hooks = 0;
  const replacement = (): never => { hooks += 1; throw new Error("replacement method"); };
  for (const [owner, method] of [[f.issuer, "observe"], [f.ledger, "reserveServerClock"], [f.runner, "requireOriginalProvenance"],
    [f.runner, "status"]] as const) {
    Object.defineProperty(owner, method, { value: replacement });
  }
  const operation = f.coordinator.reserveServerClock(f.runner);
  await assert.rejects(f.coordinator.reserveServerClock(f.runner), /busy/u);
  const attempt = await operation;
  assert.equal(hooks, 0); assert.equal(attempt.kind, "server-clock"); assert.equal(attempt.dispatchAuthorized, false);
  assert.deepEqual(f.nativeCalls, ["before"]); assert.deepEqual(f.serverCalls, []);
  const record = f.ledger.records().at(-1); assert.ok(record);
  const bytes = await readFile(record.path, "utf8"); assert.match(bytes, /server-clock-intent/u); assert.match(bytes, /commandSha256/u);
  const packet = await f.runner.observe(); await f.coordinator.acceptServerClock(attempt, packet);
  assert.deepEqual(f.nativeCalls, ["before", "armed"]); assert.deepEqual(f.serverCalls, ["server-time"]);
  const status = f.coordinator.status(); assert.equal(status.phase, "save-clock-armed");
  assert.equal(status.startupOwnershipVerified, false); assert.equal(status.destinationContainmentVerified, false);
  assert.equal(status.eligibilityVerified, false); assert.equal(status.executionAuthorized, false);
  assert.equal(status.ledger.serverClockResultRecorded, true); assert.equal(status.ledger.saveClockPlanRecorded, true);
  await assert.rejects(f.coordinator.acceptServerClock(attempt, packet), /phase consumed/u);
  await assert.rejects(f.coordinator.recordSavePost(), /Save acknowledgment/u);
  assert.deepEqual(f.nativeCalls, ["before", "armed"]); await retainCase("original");
});
void test("clock coordinator rejects copied tokens and packets without armed sampling or retry", async () => {
  const f = await fixture("string-ledger-clock-copy");
  const attempt = await f.coordinator.reserveServerClock(f.runner), packet = await f.runner.observe();
  assert.throws(() => f.coordinator.acceptServerClock(structuredClone(attempt), packet), /original server clock reservation/u);
  await assert.rejects(f.coordinator.acceptServerClock(attempt, structuredClone(packet)), /original completed/u);
  assert.equal(f.coordinator.status().phase, "failed"); assert.deepEqual(f.nativeCalls, ["before"]);
  assert.equal(f.ledger.status().serverClockResultRecorded, false);
  await assert.rejects(f.coordinator.reserveServerClock(f.runner), /phase consumed/u);
  await assert.rejects(f.runner.observe(), /consumed/u); await retainCase("copy");
});
void test("clock coordinator cannot retrofit a durable intent onto an already observed RPC", async () => {
  const f = await fixture("string-ledger-clock-late"); await f.runner.observe();
  await assert.rejects(f.coordinator.reserveServerClock(f.runner), /unstarted original/u);
  assert.deepEqual(f.nativeCalls, []); assert.equal(f.ledger.status().serverClockAttemptConsumed, false);
  assert.equal(f.coordinator.status().phase, "failed"); await retainCase("late");
});
void test("clock coordinator stops a failed original RPC durably and never calls it again", async () => {
  const f = await fixture("string-ledger-clock-failed", true);
  const attempt = await f.coordinator.reserveServerClock(f.runner);
  await assert.rejects(f.runner.observe(), /synthetic lost reply/u);
  const result = await f.coordinator.stopServerClock(attempt);
  assert.equal(result.phase, "failed"); assert.equal(result.serverClockAttemptConsumed, true);
  assert.equal(result.serverClockResultRecorded, false); assert.deepEqual(f.nativeCalls, ["before"]);
  const record = f.ledger.records().at(-1); assert.ok(record);
  const bytes = await readFile(record.path, "utf8"); assert.match(bytes, /server-clock-stopped/u);
  assert.match(bytes, /"rpcCancellationProved":false/u); assert.match(bytes, /"retryAuthorized":false/u);
  await assert.rejects(f.coordinator.stopServerClock(attempt), /phase consumed/u);
  await assert.rejects(f.runner.observe(), /consumed/u); assert.deepEqual(f.serverCalls, ["server-time"]);
  await retainCase("failed");
});
void test("clock coordinator rechecks durable intent before retaining a reply or sampling armed", async () => {
  const f = await fixture("string-ledger-clock-tampered");
  const attempt = await f.coordinator.reserveServerClock(f.runner), packet = await f.runner.observe();
  const intent = f.ledger.records().at(-1); assert.ok(intent);
  await writeFile(intent.path, "{}\n");
  await assert.rejects(f.coordinator.acceptServerClock(attempt, packet));
  assert.equal(f.coordinator.status().phase, "failed"); assert.equal(f.ledger.status().phase, "failed");
  assert.equal(f.ledger.status().serverClockResultRecorded, false); assert.deepEqual(f.nativeCalls, ["before"]);
  assert.deepEqual(f.serverCalls, ["server-time"]); await retainCase("tampered");
});
void test("pending server RPC can be stopped after owner loss without allowing late reply or retry", async () => {
  const f = await fixture("string-ledger-clock-pending", false, true);
  const provenance = f.ledger.originalSaveProvenance();
  const attempt = await f.coordinator.reserveServerClock(f.runner);
  const pending = f.runner.observe(); assert.equal(f.runner.status().phase, "observing"); f.loseServerOwner();
  const failure = f.runner.retainedFailureState(provenance);
  assert.equal(Object.isFrozen(failure), true); assert.equal(failure.phase, "observing");
  assert.equal(failure.rpcMayRemainPending, true); assert.equal(failure.currentOwnerVerified, false);
  assert.throws(() => f.runner.retainedFailureState(structuredClone(provenance)), /original String provenance/u);
  assert.throws(() => f.runner.requireOriginalProvenance(provenance), /owner lost/u);
  const result = await f.coordinator.stopServerClock(attempt); assert.equal(result.phase, "failed");
  const record = f.ledger.records().at(-1); assert.ok(record);
  const bytes = await readFile(record.path, "utf8"); assert.match(bytes, /"phase":"observing"/u);
  assert.match(bytes, /"rpcMayRemainPending":true/u); assert.match(bytes, /"currentOwnerVerified":false/u);
  assert.match(bytes, /"rpcCancellationProved":false/u);
  f.settleServerReply(); await assert.rejects(pending, /owner lost/u);
  assert.equal(f.runner.status().rawReplyRetained, true); assert.equal(failure.phase, "observing");
  await assert.rejects(f.runner.observe(), /consumed/u); await assert.rejects(f.coordinator.reserveServerClock(f.runner), /phase consumed/u);
  assert.equal(f.ledger.status().saveClockPlanRecorded, false); assert.equal(f.ledger.status().serverClockResultRecorded, false);
  assert.deepEqual(f.nativeCalls, ["before"]); assert.deepEqual(f.serverCalls, ["server-time"]); await retainCase("pending");
});

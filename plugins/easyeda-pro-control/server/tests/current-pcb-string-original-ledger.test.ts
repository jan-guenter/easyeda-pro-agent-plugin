/* oxlint-disable import/max-dependencies -- This complete original-class composition joins the retained clock coordinator and ledger with synthetic replies and SQL, without native calls. */
/** Original-class composition over synthetic replies/SQLite, no native calls. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CurrentPcbStringClockCoordinator } from "../src/current-pcb-string-clock-coordinator.ts";
import { CurrentPcbStringLifecycleLedger } from "../src/current-pcb-string-lifecycle-ledger.ts";
import { assertNoUnresolvedCurrentPcbStringLedgers } from "../src/current-pcb-string-ledger-exclusion.ts";
import { CurrentPcbStringNativeClockIssuer } from "../src/current-pcb-string-native-clock.ts";
import { CurrentPcbStringServerClockRunner } from "../src/current-pcb-string-server-clock-runner.ts";
import { prepareCurrentPcbStringSaveProvenance } from "../src/current-pcb-string-save-provenance.ts";
import { stringLedgerActorCollection, stringLedgerFixture } from "./helpers/current-pcb-string-ledger-fixture.ts";
import { TIMES, inventory } from "./helpers/symbol-sql-fixture.ts";

void test("original-source ledger durably joins clocks, one Save and closed SQL while remaining globally unresolved", async () => {
  const actor = await stringLedgerActorCollection(), f = await stringLedgerFixture();
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepareOriginalSources("string-ledger-fake", f.candidate, f.createPlan,
    actor.runner, structuredClone(actor.packet), f.before), /original/u);
  const originalProvenance = prepareCurrentPcbStringSaveProvenance(actor.runner, actor.packet, f.before);
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepareOriginalProvenance("string-ledger-copy", f.candidate, f.createPlan,
    structuredClone(originalProvenance)), /original String provenance/u);
  const preparation = CurrentPcbStringLifecycleLedger.prepareOriginalProvenance("string-ledger-owned", f.candidate, f.createPlan,
    originalProvenance);
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepareOriginalSources("string-ledger-concurrent", f.candidate, f.createPlan,
    actor.runner, actor.packet, f.before), /preparation busy/u);
  const ledger = await preparation;
  assert.equal(ledger.status().originalSourcesRetained, true);
  await assert.rejects(assertNoUnresolvedCurrentPcbStringLedgers(), /unresolved/u);
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepareOriginalSources("string-ledger-new-id", f.candidate, f.createPlan,
    actor.runner, actor.packet, f.before), /unresolved/u);
  const create = await ledger.reserveCreate(); assert.equal(create.dispatchAuthorized, false);
  await ledger.recordCreateOutcome(create, f.createResult);
  await ledger.comparePostCreate(f.publication, f.beforeRaw, f.beforeRaw, f.afterRaw, f.afterRaw, f.publication.expectedPayload);
  await ledger.compareDeliveredPublication(f.capture);
  const provenance = ledger.originalSaveProvenance();
  assert.equal(provenance, originalProvenance);
  let terminated = false;
  const binding = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 1234, rootCreated: "134370398619813012" });
  const start = TIMES.document - 1000;
  const native = new CurrentPcbStringNativeClockIssuer({ request(request): Promise<unknown> {
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
  }, assertCurrent(phase): void { assert.equal(phase === "termination", terminated); } }, binding);
  let serverCalls = 0;
  const server = new CurrentPcbStringServerClockRunner(provenance, { request(): Promise<unknown> {
    serverCalls += 1; assert.equal(ledger.status().serverClockAttemptConsumed, true);
    assert.match(ledger.records().at(-1)?.path ?? "", /server-clock-intent/u);
    const milliseconds = start + 200, stamp = { milliseconds, iso: new Date(milliseconds).toISOString(), timezoneOffsetMinutes: -120 };
    return Promise.resolve({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-string-server-clock.v1",
      identity: provenance.identity, workerUserText: provenance.workerUserText, busUuid: "11111111-1111-1111-1111-111111111111",
      rpcTicketBefore: 0, rpcTicketAfter: 1, serverTimeMs: milliseconds, clock: { before: stamp, after: stamp } }) } });
  }, assertCurrent(): void { assert.equal(terminated, false); } });
  assert.throws(() => server.requireOriginalProvenance(structuredClone(provenance)), /original String provenance/u);
  const coordinator = CurrentPcbStringClockCoordinator.prepare(ledger, native);
  assert.throws(() => CurrentPcbStringClockCoordinator.prepare(ledger, native), /unused original/u);
  const reservation = await coordinator.reserveServerClock(server);
  assert.equal(reservation.dispatchAuthorized, false); assert.equal(serverCalls, 0);
  assert.equal(coordinator.status().serverRpcSenderImplemented, false);
  await assert.rejects(coordinator.reserveServerClock(server), /phase consumed/u);
  const serverPacket = await server.observe();
  await coordinator.acceptServerClock(reservation, serverPacket);
  assert.equal(serverCalls, 1);
  const clockRecord = ledger.records().at(-1); assert.ok(clockRecord);
  assert.match(await readFile(clockRecord.path, "utf8"), /save-clock-plan/u);
  const save = await ledger.reserveSave(provenance, f.history, { ...f.witness,
    backendClockMinMs: start, backendClockMaxMs: start + 60_000 });
  assert.equal(save.dispatchAuthorized, false); await ledger.recordSaveOutcome(save, f.saveResult);
  await coordinator.recordSavePost();
  terminated = true; actor.expire(); f.apply();
  await coordinator.compareClosedSql(await inventory(f.path));
  await ledger.compareReopenedString(f.afterRaw, f.afterRaw);
  const status = await ledger.compareFinalSql(await inventory(f.path));
  assert.equal(status.phase, "comparisons-complete-awaiting-native-lifecycle-proof"); assert.equal(status.recordCount, 15);
  assert.equal(status.serverClockAttemptConsumed, true); assert.equal(status.serverClockResultRecorded, true);
  assert.equal(status.saveClockPlanRecorded, true); assert.equal(status.saveClockPostRecorded, true);
  assert.equal(status.originalSaveVerified, false); assert.equal(status.nativeOwnerVerified, false);
  assert.equal(status.completeLifecycleVerified, false); assert.equal(status.executionAuthorized, false);
  await assert.rejects(assertNoUnresolvedCurrentPcbStringLedgers(), /unresolved/u);
  await assert.rejects(ledger.reserveSave(provenance, f.history, f.witness), /phase changed/u);
});

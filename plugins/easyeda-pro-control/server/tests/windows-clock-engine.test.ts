import assert from "node:assert/strict";
import { test } from "node:test";
import { clockEngineFixture, clockTrackedJournal } from "./helpers/windows-clock-engine-fixture.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { assertIssuedWindowsClockObservation } from "../src/windows-authority.ts";

void test("runtime preserves cloned public launch semantics but only its original return can look up clock", async (context) => {
  const f = await clockEngineFixture(context);
  const clock = await f.runtime.clockObservationForLaunch(f.launch);
  assert.equal(clock.phase, "launch"); assert.equal(clock.clock.status, "observed");
  assert.notStrictEqual(f.runtime.status().launch, f.launch); assert.deepEqual(f.runtime.status().launch, f.launch);
  await assert.rejects(f.runtime.clockObservationForLaunch(structuredClone(f.launch)), /unchanged original/u);
  const status = f.runtime.status(); assert.ok(status.launch !== null);
  await assert.rejects(f.runtime.clockObservationForLaunch(status.launch), /unchanged original/u);
  assert.equal(f.child.requests.length, 1);
});
void test("original runtime launch loses lookup after new generation or release", async (context) => {
  const f = await clockEngineFixture(context), old = await f.runtime.clockObservationForLaunch(f.launch);
  const next = await f.runtime.launch(); assert.notEqual(next.jobId, f.launch.jobId);
  await assert.rejects(f.runtime.clockObservationForLaunch(f.launch)); await assert.rejects(assertIssuedWindowsClockObservation(old));
  const nextClock = await f.runtime.clockObservationForLaunch(next); assert.equal(nextClock.phase, "launch");
  await f.runtime.release(); await assert.rejects(f.runtime.clockObservationForLaunch(next));
});
void test("engine closed capture exposes only exact original native evidence and survives scope end", async (context) => {
  const f = await clockEngineFixture(context);
  const capture = await f.engine.captureClosedSessionAuthority("clock-engine-original", "closed-edit", 2);
  const clock = await f.engine.clockObservationForClosedCapture(capture);
  assert.equal(clock.ownerBinding["challengeAttempt"], 2); assert.equal(clock.ownerBinding["phase"], "closed-edit");
  assert.equal(clock.ownerBinding["operationId"], "clock-engine-original");
  await assert.rejects(f.engine.clockObservationForClosedCapture(structuredClone(capture)), /unchanged original/u);
  const other = new EasyedaControlEngine(f.upstream, { executionAuthorityValidator: f.runtime }); await other.controlFingerprintPromise;
  await assert.rejects(other.clockObservationForClosedCapture(capture), /unchanged original/u);
  f.state.scope = false;
  assert.strictEqual(await f.engine.clockObservationForClosedCapture(capture), clock);
  await f.engine.releaseClosedSessionAuthority(capture);
  await assert.rejects(f.engine.clockObservationForClosedCapture(capture), /unchanged original/u);
  // A retained immutable clock remains a fact while its helper/generation stays owned.
  assert.strictEqual(await assertIssuedWindowsClockObservation(clock), clock);
});
void test("engine rejects nested capture mutation and changed validator", async (context) => {
  const f = await clockEngineFixture(context);
  const capture = await f.engine.captureClosedSessionAuthority("clock-engine-mutation", "closed-edit", 2);
  const original = capture.bridgeSession.sequence;
  Object.assign(capture.bridgeSession, { sequence: original + 1 });
  await assert.rejects(f.engine.clockObservationForClosedCapture(capture), /unchanged original/u);
  Object.assign(capture.bridgeSession, { sequence: original });
  Object.assign(f.engine, { executionAuthorityValidator: f.child.supervisor });
  await assert.rejects(f.engine.clockObservationForClosedCapture(capture), /unchanged original/u);
});
void test("tracked actual managed journal owns its original capture, not a loaded or cloned journal", async (context) => {
  const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, "clock-tracked-original");
  const dispatch = await f.engine.markOrphanedCallRisk(journal, "clock-observer");
  const clock = await f.engine.clockObservationForTrackedDispatch(journal, "clock-observer");
  assert.equal(clock.ownerBinding["operationId"], journal.operationId);
  assert.equal(clock.ownerBinding["phase"], "clock-observer");
  await assert.rejects(f.engine.clockObservationForTrackedDispatch(structuredClone(journal), "clock-observer"), /original operation-bound/u);
  await assert.rejects(f.engine.clockObservationForTrackedDispatch(journal, "other-phase"), /original operation-bound/u);
  await f.engine.clearOrphanedCallRisk(journal, "clock-observer", dispatch);
  await assert.rejects(f.engine.clockObservationForTrackedDispatch(journal, "clock-observer"), /original operation-bound/u);
  assert.strictEqual(await assertIssuedWindowsClockObservation(clock), clock);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { clockEngineFixture, clockTrackedJournal } from "./helpers/windows-clock-engine-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { assertCurrentIssuedWindowsClockObservation } from "../src/windows-authority.ts";
import type { IssuedCurrentWindowsClockObservation } from "../src/windows-authority.ts";
import type { RuntimeExecutionAuthorityValidator } from "../src/engine.ts";

const PHASE = "fresh-clock-final-boundary";

void test("fresh tracked clock forwards original capture without runtime probes, history scans or new native capture", async (context) => {
  const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, "fresh-clock-original");
  await f.engine.markOrphanedCallRisk(journal, PHASE);
  const reads = f.state.runtimeReads;
  const clock = await f.engine.freshClockObservationForTrackedDispatch(journal, PHASE);
  assert.equal(clock.phase, "owned-observation"); assert.equal(clock.ownerBinding["operationId"], journal.operationId);
  assert.equal(clock.ownerBinding["phase"], PHASE); assert.equal(clock.executionAuthorized, false);
  assert.strictEqual(assertCurrentIssuedWindowsClockObservation(clock), clock);
  assert.equal(f.state.runtimeReads, reads);
  assert.deepEqual(f.child.requests.map((request) => request["action"]), ["clocked-launch", "clocked-capture", "clocked-observe-owned-clock"]);
  assert.equal(f.child.spawnCalls(), 1);
});

void test("runtime forwarding refuses a cloned capture without a native clock request", async (context) => {
  const f = await clockEngineFixture(context);
  const evidence = await f.runtime.capture(INPUT);
  await assert.rejects(f.runtime.observeCurrentClock(structuredClone(evidence)), /original source-qualified retained capture/u);
  assert.equal(f.child.requests.length, 2);
  const observation = await f.runtime.observeCurrentClock(evidence);
  assert.equal(observation.phase, "owned-observation");
});

for (const change of ["clone", "phase", "operation", "challenge", "authority", "session", "runtime", "dispatch", "cleared"] as const) {
  void test(`fresh tracked lookup refuses ${change} before native sampling`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `fresh-clock-${change}`);
    const dispatch = await f.engine.markOrphanedCallRisk(journal, PHASE);
    const originalOperationId = journal.operationId;
    let phase = PHASE, target = journal;
    if (change === "clone") { target = structuredClone(journal); }
    else if (change === "phase") { phase = "different"; }
    else if (change === "operation") { journal.operationId += "-different"; }
    else if (change === "challenge") { journal.runtimeRestartChallengeAttempt = 999; }
    else if (change === "authority") { Object.assign(journal.executionAuthorityBeforeOrphan ?? {}, { authoritySha256: "0".repeat(64) }); }
    else if (change === "session") { Object.assign(journal.bridgeSessionBeforeOrphan ?? {}, { sequence: 999 }); }
    else if (change === "runtime") { Object.assign(journal.runtimeIdentityBeforeOrphan ?? {}, { generation: "other-runtime" }); }
    else if (change === "dispatch") { Object.assign(journal.bridgeDispatchBeforeOrphan ?? {}, { leaseId: "0".repeat(43) }); }
    else { await f.engine.clearOrphanedCallRisk(journal, PHASE, dispatch); }
    await assert.rejects(f.engine.freshClockObservationForTrackedDispatch(target, phase), /original tracked|unchanged original/u);
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 0);
    journal.operationId = originalOperationId;
  });
}

for (const change of ["scope", "session", "lease", "validator-method", "supervisor-method", "supervisor-capture", "session-method", "dispatch-method"] as const) {
  void test(`fresh tracked lookup refuses ${change} replacement before its first observation`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `fresh-clock-binding-${change}`);
    let leaseChanged = false;
    assert.ok(f.upstream.currentAuthenticatedBridgeDispatchBinding);
    const originalDispatch = f.upstream.currentAuthenticatedBridgeDispatchBinding.bind(f.upstream);
    Object.assign(f.upstream, { currentAuthenticatedBridgeDispatchBinding() {
      const lease = originalDispatch(); return lease !== undefined && leaseChanged ? { ...lease, leaseId: "z".repeat(43) } : lease;
    } });
    await f.engine.markOrphanedCallRisk(journal, PHASE);
    if (change === "scope") { f.state.scope = false; }
    else if (change === "session") { f.state.sequence += 1; }
    else if (change === "lease") { leaseChanged = true; }
    else if (change === "validator-method") { Object.assign(f.runtime, { observeCurrentClock(): never { throw new Error("must not call replacement"); } }); }
    else if (change === "supervisor-method") { Object.assign(f.child.supervisor, { observeCurrentClock(): never { throw new Error("must not call replacement"); } }); }
    else if (change === "supervisor-capture") { Object.assign(f.child.supervisor, { capture(): never { throw new Error("must not call replacement"); } }); }
    else if (change === "session-method") { Object.assign(f.upstream, { bridgeSessionLifecycle(): never { throw new Error("must not call replacement"); } }); }
    else { Object.assign(f.upstream, { currentAuthenticatedBridgeDispatchBinding(): never { throw new Error("must not call replacement"); } }); }
    await assert.rejects(f.engine.freshClockObservationForTrackedDispatch(journal, PHASE));
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 0);
  });
}

for (const change of ["scope", "session", "journal", "validator-method", "supervisor-method"] as const) {
  void test(`fresh tracked lookup rechecks ${change} across the clock await`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `fresh-clock-await-${change}`);
    await f.engine.markOrphanedCallRisk(journal, PHASE);
    f.child.behavior.mutateResponse = (request): void => {
      if (request["action"] !== "clocked-observe-owned-clock") { return; }
      if (change === "scope") { f.state.scope = false; }
      else if (change === "session") { f.state.sequence += 1; }
      else if (change === "journal") { journal.runtimeRestartChallengeAttempt = 999; }
      else if (change === "validator-method") { Object.assign(f.runtime, { observeCurrentClock(): never { throw new Error("replacement"); } }); }
      else { Object.assign(f.child.supervisor, { observeCurrentClock(): never { throw new Error("replacement"); } }); }
    };
    await assert.rejects(f.engine.freshClockObservationForTrackedDispatch(journal, PHASE));
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 1);
  });
}

for (const change of ["release", "normal-close", "replacement-launch"] as const) {
  void test(`fresh runtime read refuses ${change}`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `fresh-clock-owner-${change}`);
    await f.engine.markOrphanedCallRisk(journal, PHASE);
    if (change === "release") { await f.runtime.release(); }
    else if (change === "normal-close") { await f.runtime.normalClose("12345"); }
    else { await f.runtime.launch(); }
    await assert.rejects(f.engine.freshClockObservationForTrackedDispatch(journal, PHASE));
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 0);
  });
}

for (const forged of [false, true]) {
  void test(`engine refuses ${forged ? "serialized" : "genuine foreign-operation"} clock returned by retained validator`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `fresh-clock-foreign-${String(forged)}`);
    const other = await f.runtime.capture(INPUT);
    const response: { clock?: IssuedCurrentWindowsClockObservation } = {};
    const validator: RuntimeExecutionAuthorityValidator = {
      capture: f.runtime.capture.bind(f.runtime), proveTerminated: f.runtime.proveTerminated.bind(f.runtime),
      observeCurrentClock(): Promise<IssuedCurrentWindowsClockObservation> { assert.ok(response.clock); return Promise.resolve(response.clock); },
    };
    Object.assign(f.engine, { executionAuthorityValidator: validator });
    await f.engine.markOrphanedCallRisk(journal, PHASE);
    const genuine = await f.runtime.observeCurrentClock(other);
    response.clock = forged ? structuredClone(genuine) : genuine;
    await assert.rejects(f.engine.freshClockObservationForTrackedDispatch(journal, PHASE), /not issued|another original operation/u);
  });
}

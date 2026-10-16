import assert from "node:assert/strict";
import { test } from "node:test";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { RuntimeExecutionAuthorityValidator } from "../src/engine.ts";
import { assertCurrentIssuedWindowsClockObservation } from "../src/windows-authority.ts";
import type { IssuedCurrentWindowsClockObservation } from "../src/windows-authority.ts";
import { clockEngineFixture } from "./helpers/windows-clock-engine-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";

void test("fresh closed clock uses original capture in a new same-session lease without admission or runtime probes", async (context) => {
  const f = await clockEngineFixture(context);
  let leaseId = "l".repeat(43);
  assert.ok(f.upstream.currentAuthenticatedBridgeDispatchBinding);
  const binding = f.upstream.currentAuthenticatedBridgeDispatchBinding.bind(f.upstream);
  Object.assign(f.upstream, { currentAuthenticatedBridgeDispatchBinding() {
    const current = binding(); return current === undefined ? current : { ...current, leaseId };
  } });
  const capture = await f.engine.captureClosedSessionAuthority("fresh-closed-original", "closed-edit", 2);
  const reads = f.state.runtimeReads;
  context.mock.method(f.engine, "assertBridgeAndRecoveryAdmission", (): never => { throw new Error("must not scan again"); });
  f.state.scope = false;
  await assert.rejects(f.engine.freshClockObservationForClosedCapture(capture), /exact authenticated/u);
  f.state.scope = true; leaseId = "z".repeat(43);
  const clock = await f.engine.freshClockObservationForClosedCapture(capture);
  assert.strictEqual(assertCurrentIssuedWindowsClockObservation(clock), clock);
  assert.equal(clock.ownerBinding["operationId"], "fresh-closed-original");
  assert.equal(clock.ownerBinding["phase"], "closed-edit"); assert.equal(clock.ownerBinding["challengeAttempt"], 2);
  assert.equal(clock.phase, "owned-observation"); assert.equal(clock.executionAuthorized, false);
  assert.equal(f.state.runtimeReads, reads); assert.equal(f.child.spawnCalls(), 1);
  assert.deepEqual(f.child.requests.map((request) => request["action"]), ["clocked-launch", "clocked-capture", "clocked-observe-owned-clock"]);
});

for (const change of ["clone", "other-engine", "receipt", "released", "session", "validator-method", "session-method", "dispatch-method", "upstream"] as const) {
  void test(`fresh closed clock refuses ${change} before native sampling`, async (context) => {
    const f = await clockEngineFixture(context);
    const capture = await f.engine.captureClosedSessionAuthority(`fresh-closed-${change}`, "closed-edit", 2);
    let engine = f.engine, receipt = capture;
    if (change === "clone") { receipt = structuredClone(capture); }
    else if (change === "other-engine") { engine = new EasyedaControlEngine(f.upstream, { executionAuthorityValidator: f.runtime }); await engine.controlFingerprintPromise; }
    else if (change === "receipt") { Object.assign(capture.runtimeIdentity, { generation: "other-generation" }); }
    else if (change === "released") { await f.engine.releaseClosedSessionAuthority(capture); }
    else if (change === "session") { f.state.sequence += 1; }
    else if (change === "validator-method") { Object.assign(f.runtime, { observeCurrentClock(): never { throw new Error("must not call replacement"); } }); }
    else if (change === "session-method") { Object.assign(f.upstream, { bridgeSessionLifecycle(): never { throw new Error("must not call replacement"); } }); }
    else if (change === "dispatch-method") { Object.assign(f.upstream, { currentAuthenticatedBridgeDispatchBinding(): never { throw new Error("must not call replacement"); } }); }
    else { Object.assign(f.engine, { upstream: { ...f.upstream } }); }
    await assert.rejects(engine.freshClockObservationForClosedCapture(receipt), /original closed|unchanged original/u);
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 0);
  });
}

for (const change of ["scope", "session", "receipt", "lease", "validator-method"] as const) {
  void test(`fresh closed clock rechecks ${change} after its native await`, async (context) => {
    const f = await clockEngineFixture(context);
    let leaseChanged = false;
    assert.ok(f.upstream.currentAuthenticatedBridgeDispatchBinding);
    const binding = f.upstream.currentAuthenticatedBridgeDispatchBinding.bind(f.upstream);
    Object.assign(f.upstream, { currentAuthenticatedBridgeDispatchBinding() {
      const current = binding(); return current !== undefined && leaseChanged ? { ...current, leaseId: "z".repeat(43) } : current;
    } });
    const capture = await f.engine.captureClosedSessionAuthority(`fresh-closed-await-${change}`, "closed-edit", 2);
    f.child.behavior.mutateResponse = (request): void => {
      if (request["action"] !== "clocked-observe-owned-clock") { return; }
      if (change === "scope") { f.state.scope = false; }
      else if (change === "session") { f.state.sequence += 1; }
      else if (change === "receipt") { Object.assign(capture.runtimeIdentity, { generation: "other-generation" }); }
      else if (change === "lease") { leaseChanged = true; }
      else { Object.assign(f.runtime, { observeCurrentClock(): never { throw new Error("replacement"); } }); }
    };
    await assert.rejects(f.engine.freshClockObservationForClosedCapture(capture));
    assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 1);
  });
}

for (const forged of [false, true]) {
  void test(`fresh closed clock refuses ${forged ? "serialized" : "foreign-operation"} samples from its retained validator`, async (context) => {
    const f = await clockEngineFixture(context), other = await f.runtime.capture(INPUT);
    const response: { clock?: IssuedCurrentWindowsClockObservation } = {};
    const validator: RuntimeExecutionAuthorityValidator = {
      capture: f.runtime.capture.bind(f.runtime), proveTerminated: f.runtime.proveTerminated.bind(f.runtime),
      releaseCapture: f.runtime.releaseCapture.bind(f.runtime),
      observeCurrentClock(): Promise<IssuedCurrentWindowsClockObservation> { assert.ok(response.clock); return Promise.resolve(response.clock); },
    };
    Object.assign(f.engine, { executionAuthorityValidator: validator });
    const capture = await f.engine.captureClosedSessionAuthority(`fresh-closed-foreign-${String(forged)}`, "closed-edit", 2);
    const genuine = await f.runtime.observeCurrentClock(other);
    response.clock = forged ? structuredClone(genuine) : genuine;
    await assert.rejects(f.engine.freshClockObservationForClosedCapture(capture), /not issued|another original closed/u);
  });
}

void test("closed capture retains its clock method before native acquisition", async (context) => {
  const f = await clockEngineFixture(context);
  f.child.behavior.mutateResponse = (request): void => {
    if (request["action"] === "clocked-capture") {
      Object.assign(f.runtime, { observeCurrentClock(): never { throw new Error("must not call replacement"); } });
    }
  };
  await assert.rejects(f.engine.captureClosedSessionAuthority("fresh-closed-acquisition", "closed-edit", 2), /retained methods changed/u);
  assert.equal(f.child.requests.filter((request) => request["action"] === "clocked-observe-owned-clock").length, 0);
});

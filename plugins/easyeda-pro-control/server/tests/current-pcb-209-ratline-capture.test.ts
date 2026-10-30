import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlinePcbCapture, CurrentPcb209RatlineWorkerCapture } from "../src/current-pcb-209-ratline-capture-runner.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES, inspectCurrentPcb209RatlineCaptureSource } from "../src/current-pcb-209-ratline-capture-profile.ts";
import { ratlineCaptureFixtureSource } from "./helpers/current-pcb-209-ratline-capture-fixture.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

void test("fixed209 inert capture fixture reports child exit before inspector address instead of waiting indefinitely", async context => {
  const diagnostic = Promise.withResolvers<string>();
  await assert.rejects(ratlineCaptureInspector({ after: context.after.bind(context), diagnostic: (message): void => { diagnostic.resolve(message); } }, "pcb", 0, false, true), /RATLINE_FIXTURE_CHILD_EXIT/u);
  const text = await diagnostic.promise;
  // oxlint-disable-next-line eslint/no-control-regex -- The regression rejects literal terminal controls in diagnostic console output.
  assert.equal(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/u.test(text), false);
  const value: unknown = JSON.parse(text);
  assert.ok(value !== null && typeof value === "object" && "role" in value && "childPid" in value && "childExitCode" in value &&
    "childStderr" in value && "childStderrTruncated" in value && "initialFailurePending" in value && "pendingRequestCount" in value);
  assert.equal(value.role, "pcb"); assert.ok(Number.isSafeInteger(value.childPid)); assert.equal(value.childExitCode, 0);
  assert.equal(value.pendingRequestCount, 0);
  assert.deepEqual(value.initialFailurePending, { pendingRequestCount: 0, pendingMethods: [], pendingMethodsTruncated: false });
  assert.ok(typeof value.childStderr === "string"); assert.ok(Buffer.byteLength(value.childStderr) <= 32_768);
  assert.equal(value.childStderr, ""); assert.equal(value.childStderrTruncated, false);
});

for (const role of ["pcb", "worker"] as const) {
  void test(`fixed209 ${role} captures actual synthetic V8 factory, result and terminal return pauses`, async context => {
    const fixture = await ratlineCaptureInspector(context, role);
    const runner = role === "pcb" ? new CurrentPcb209RatlinePcbCapture(fixture.transport) : new CurrentPcb209RatlineWorkerCapture(fixture.transport);
    const pending = runner.capture(); await runner.whenArmed(); const running = fixture.run();
    const packet = await pending; await running;
    assert.equal(packet.pauses, CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role].sequence.length);
    assert.equal(packet.nativeWorkerId, 0); assert.equal(packet.resultPayload, '{"ratlineRes":[],"workerName":0}');
    assert.equal(packet.nativeWorkerTargetIdentityVerified, false); assert.equal(packet.callbackReturnCompletionVerified, false);
    assert.equal(packet.copperCompletionVerified, false); assert.equal(packet.executionAuthorized, false);
    const originals = await runner.requireOriginal(packet); assert.ok(originals["childWorker"] !== undefined); assert.ok(originals["childBridge"] !== undefined);
    if (role === "worker") { assert.ok(originals["selfBridge"] !== undefined); assert.ok(originals["canvasBus"] !== undefined); assert.equal(packet.world?.documentUuid, "b".repeat(32)); }
    assert.equal(fixture.counts().pauses, fixture.counts().resumes); assert.equal(fixture.counts().subscribers, 1);
    await assert.rejects(runner.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
    await assert.rejects(runner.capture(), /CONSUMED/u);
    fixture.lose(); await assert.rejects(runner.requireOriginal(packet));
    fixture.regain(); await assert.rejects(runner.requireOriginal(packet), /FAILED_OR_RELEASED/u);
    await assert.rejects(runner.releaseAfterTermination()); assert.equal(fixture.counts().subscribers, 1);
    await fixture.terminate(); await runner.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
    assert.equal(fixture.commands.includes("Runtime.evaluate"), false);
  });
  void test(`fixed209 ${role} owner loss resumes original pause and retains cleanup ownership`, async context => {
    const fixture = await ratlineCaptureInspector(context, role, 1);
    const runner = role === "pcb" ? new CurrentPcb209RatlinePcbCapture(fixture.transport) : new CurrentPcb209RatlineWorkerCapture(fixture.transport);
    const pending = runner.capture(); const rejected = assert.rejects(pending); await runner.whenArmed(); const running = fixture.run();
    await rejected; await running;
    await assert.rejects(runner.whenArmed());
    assert.equal(runner.status()["failed"], true); assert.equal(runner.status()["unresolvedBreakpoints"], false);
    assert.equal(fixture.counts().pauses, 1); assert.equal(fixture.counts().resumes, 1); assert.equal(fixture.counts().subscribers, 1);
    await fixture.terminate(); await runner.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
  });
  void test(`fixed209 ${role} extra real pause during final reproof refuses issuance and retains cleanup`, async context => {
    const fixture = await ratlineCaptureInspector(context, role, 0, true);
    const runner = role === "pcb" ? new CurrentPcb209RatlinePcbCapture(fixture.transport) : new CurrentPcb209RatlineWorkerCapture(fixture.transport);
    const pending = runner.capture(), rejected = assert.rejects(pending);
    await runner.whenArmed(); const running = fixture.run();
    await rejected; await running;
    assert.equal(runner.status()["failed"], true);
    assert.equal(runner.status()["unresolvedBreakpoints"], false);
    assert.equal(fixture.counts().pauses, CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role].sequence.length + 1);
    assert.equal(fixture.counts().resumes, fixture.counts().pauses);
    assert.equal(fixture.counts().subscribers, 1);
    await assert.rejects(runner.whenArmed());
    await fixture.terminate(); await runner.releaseAfterTermination();
    assert.equal(fixture.counts().subscribers, 0);
  });
  void test(`fixed209 ${role} synthetic sources cannot pass whole installed-source qualification`, () => {
    const inspected = inspectCurrentPcb209RatlineCaptureSource(role, ratlineCaptureFixtureSource(role));
    assert.equal(inspected["completeSourceMatches"], false); assert.equal(inspected["sourceProfileMatches"], false);
    assert.equal(inspected["originalNativeOwnershipVerified"], false); assert.equal(inspected["executionAuthorized"], false);
  });
}

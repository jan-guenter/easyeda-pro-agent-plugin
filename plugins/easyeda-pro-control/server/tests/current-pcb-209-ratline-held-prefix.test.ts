/** Actual V8 pause delivery from inert vendor excerpts. Child result delivery
 * Is deliberately withheld; these tests establish no connected EasyEDA proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlinePcbCapture, CurrentPcb209RatlinePcbHeldCapture } from "../src/current-pcb-209-ratline-capture-runner.ts";
import type { CurrentPcb209RatlineCaptureTransport } from "../src/current-pcb-209-ratline-capture-runner.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "../src/current-pcb-209-ratline-budget.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

void test("held PCB prefix settles both original V8 pauses and survives deliberate hold beyond the full result deadline", async context => {
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { holdPcbResult: true, expectedPauses: 2 });
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const runner = new CurrentPcb209RatlinePcbHeldCapture(fixture.transport);
  const pending = runner.capture(); await runner.whenArmed(); const running = fixture.run();
  const packet = await pending; await running;
  assert.equal(packet.profile, "private.current-pcb209-ratline-pcb-held-prefix-capture.v1");
  assert.equal(packet.pauses, 2); assert.equal(packet.originalFactoryPauseReleased, true);
  assert.equal(Object.hasOwn(packet, "resultPayload"), false); assert.equal(Object.hasOwn(packet, "originalTerminalReturnPauseRetained"), false);
  assert.equal(packet.nativeWorkerTargetIdentityVerified, false); assert.equal(packet.executionAuthorized, false);
  assert.equal(fixture.commands.filter(value => value === "Debugger.setBreakpoint").length, 2);
  assert.equal(fixture.commands.filter(value => value === "Debugger.removeBreakpoint").length, 2);
  assert.deepEqual(fixture.counts(), { pauses: 2, resumes: 2, subscribers: 1 });
  assert.equal(runner.status()["scope"], "pcb-held-prefix"); assert.equal(runner.status()["settled"], true);
  const requests = fixture.commands.length;
  context.mock.timers.tick(2 * CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.captureWaitMilliseconds);
  const handles = await runner.requireOriginal(packet);
  assert.ok(handles["childWorker"] !== undefined && handles["childBridge"] !== undefined && handles["manager"] !== undefined);
  assert.equal(runner.status()["failed"], false); assert.equal(fixture.commands.length, requests);
  await assert.rejects(runner.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
  fixture.lose(); await assert.rejects(runner.requireOriginal(packet)); fixture.regain();
  await assert.rejects(runner.requireOriginal(packet), /FAILED_OR_RELEASED/u);
  await assert.rejects(runner.releaseAfterTermination());
  context.mock.timers.reset(); await fixture.terminate(); await runner.releaseAfterTermination();
  assert.equal(fixture.counts().subscribers, 0);
});

void test("full PCB capture still requires its result after both original prefix pauses", async context => {
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { holdPcbResult: true });
  const runner = new CurrentPcb209RatlinePcbCapture(fixture.transport);
  const pending = runner.capture(), rejected = assert.rejects(pending);
  await runner.whenArmed(); await fixture.run();
  assert.equal(runner.status()["scope"], "full"); assert.equal(runner.status()["settled"], false);
  assert.equal(runner.status()["events"], 2);
  await runner.abort(); await rejected;
  assert.equal(runner.status()["failed"], true); assert.equal(runner.status()["unresolvedBreakpoints"], false);
  assert.equal(fixture.commands.filter(value => value === "Debugger.removeBreakpoint").length, 5);
  await fixture.terminate(); await runner.releaseAfterTermination();
});

for (const failure of ["malformed-pause", "owner-loss", "final-extra-pause"] as const) {
  void test(`held PCB prefix refuses ${failure} with original V8 pause cleanup`, async context => {
    const fixture = await ratlineCaptureInspector(context, "pcb", failure === "owner-loss" ? 1 : 0,
      failure === "final-extra-pause", false, { holdPcbResult: true, expectedPauses: 2 });
    const transport: CurrentPcb209RatlineCaptureTransport = { ...fixture.transport,
      subscribe: events => fixture.transport.subscribe({ ...events, paused: input => {
        if (failure === "malformed-pause") { events.paused({ reason: "other", hitBreakpoints: [], callFrames: [] }); }
        else { events.paused(input); }
      } }),
    };
    const runner = new CurrentPcb209RatlinePcbHeldCapture(transport);
    const pending = runner.capture(), rejected = assert.rejects(pending);
    await runner.whenArmed(); const running = fixture.run(); await rejected; await running;
    assert.equal(runner.status()["settled"], true); assert.equal(runner.status()["failed"], true);
    assert.equal(runner.status()["unresolvedBreakpoints"], false);
    assert.equal(fixture.counts().pauses, failure === "final-extra-pause" ? 3 : 1);
    assert.equal(fixture.counts().resumes, fixture.counts().pauses);
    await fixture.terminate(); await runner.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
  });
}

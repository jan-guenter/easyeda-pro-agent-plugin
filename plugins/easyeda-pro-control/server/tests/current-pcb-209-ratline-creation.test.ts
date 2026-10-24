import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlinePcbCreation, CurrentPcb209RatlineWorkerCreation } from "../src/current-pcb-209-ratline-creation-runner.ts";
import { inspectCurrentPcb209RatlineCreationSource } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { ratlineCreationInspector } from "./helpers/current-pcb-209-ratline-creation-inspector.ts";
import { ratlineCaptureFixtureSource } from "./helpers/current-pcb-209-ratline-capture-fixture.ts";

for (const role of ["pcb", "worker"] as const) {
  void test(`fixed209 ${role} construction captures actual V8 boundaries, holds child and consumes parent continuation`, async context => {
    const fixture = await ratlineCreationInspector(context, role);
    const runner = role === "pcb" ? new CurrentPcb209RatlinePcbCreation(fixture.transport) : new CurrentPcb209RatlineWorkerCreation(fixture.transport);
    const pending = runner.capture(); await runner.whenArmed(); const running = fixture.run();
    const packet = await pending;
    assert.deepEqual(fixture.counts(), { pauses: 2, resumes: 1, childStarts: 0, subscribers: 1 });
    assert.equal(packet.childTargetId, "child"); assert.equal(packet.nativeWorkerTargetIdentityVerified, false); assert.equal(packet.executionAuthorized, false);
    const original = await runner.requireOriginal(packet); assert.ok(original.workerObjectId.length > 0);
    await assert.rejects(runner.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
    await assert.rejects(runner.capture(), /CONSUMED/u);
    const continuing = runner.continueOriginalParent(packet);
    await assert.rejects(runner.continueOriginalParent(packet), /CONTINUATION_CONSUMED/u);
    await continuing; await running;
    assert.deepEqual(fixture.counts(), { pauses: 2, resumes: 2, childStarts: 0, subscribers: 1 });
    fixture.lose(); await assert.rejects(runner.requireOriginal(packet)); await runner.abort();
    assert.equal(fixture.counts().childStarts, 1);
    await assert.rejects(runner.releaseAfterTermination()); assert.equal(fixture.counts().subscribers, 1);
    await fixture.terminate(); await runner.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
    assert.equal(inspectCurrentPcb209RatlineCreationSource(role, ratlineCaptureFixtureSource(role))["completeSourceMatches"], false);
  });
  void test(`fixed209 ${role} foreign attachment during final proof poisons issuance and releases both original children once`, async context => {
    const fixture = await ratlineCreationInspector(context, role, true);
    const runner = role === "pcb" ? new CurrentPcb209RatlinePcbCreation(fixture.transport) : new CurrentPcb209RatlineWorkerCreation(fixture.transport);
    const pending = runner.capture(), refusal = assert.rejects(pending); await runner.whenArmed(); const running = fixture.run();
    await refusal; await running; await runner.abort();
    assert.equal(runner.status()["failed"], true); assert.equal(fixture.counts().childStarts, 2);
    assert.equal(fixture.counts().pauses, fixture.counts().resumes);
    await fixture.terminate(); await runner.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
  });
}

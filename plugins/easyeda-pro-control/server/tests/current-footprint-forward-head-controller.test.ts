/** Fixed orchestration over real SQLite and explicitly synthetic CDP replies.
 * No original Main/native issuance, embedded side-effect check or live effect
 * is qualified by the synthetic host acknowledgment used here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintForwardHeadController, CURRENT_FOOTPRINT_FORWARD_HEAD_REQUESTS as LIMITS,
  validateCurrentFootprintForwardHeadCommand } from "../src/current-footprint-forward-head-controller.ts";
import { requireCurrentFootprintCopyHeadNumber } from "../src/current-footprint-copy-head-reference.ts";
import { forwardHeadControllerFixture } from "./helpers/forward-head-controller-fixture.ts";

void test("head controller joins one original returned Promise and row before its separately consumed release", async context => {
  const f = await forwardHeadControllerFixture(context), packet = await f.controller.observe();
  assert.deepEqual(f.state.phases, ["capture", "require", "read", "await", "completed"]); assert.equal(f.state.queries, 1);
  assert.equal(packet.row.headNum, 0); assert.equal(packet.nativeIssuerVerified, false); assert.equal(packet.executionAuthorized, false);
  assert.equal(packet.currentHeadExclusionVerified, false); assert.equal(packet.nativeAgeVerified, false); assert.equal(packet.saveAuthorized, false);
  f.controller.requireOriginal(packet); assert.throws(() => { f.controller.requireOriginal({ ...packet }); }, /ORIGINAL_RESULT/u);
  await assert.rejects(f.controller.observe(), /CONSUMED/u); await f.controller.release();
  assert.equal(f.controller.retained().released, true); assert.equal(f.state.releases, 1);
  await assert.rejects(f.controller.release(), /RELEASE_CONSUMED/u); assert.equal(f.state.phases.length, LIMITS.total);
});
void test("actual local Inspector executes the fixed side-effect guard and awaits the real query Promise", async context => {
  const f = await forwardHeadControllerFixture(context, { nativeInspector: true });
  const packet = await f.controller.observe(); assert.equal(packet.row.headNum, 0); assert.equal(f.state.queries, 1);
  assert.equal(packet.nativeIssuerVerified, false); await f.controller.release(); assert.equal(f.state.releases, 1);
});
void test("same-UUID head number drift refuses completion against the original completed reader", async context => {
  const f = await forwardHeadControllerFixture(context, { changedNumber: true });
  const { reference, before, sourcePlan } = f.inputs;
  assert.equal(requireCurrentFootprintCopyHeadNumber(reference, before, sourcePlan), 0);
  assert.throws(() => requireCurrentFootprintCopyHeadNumber({ ...reference }, before, sourcePlan), /ORIGINAL_REFERENCE/u);
  await assert.rejects(f.controller.observe(), /ORIGINAL_HEAD_NUMBER/u); assert.equal(f.controller.retained().result, null);
  await f.controller.release(); assert.equal(f.state.queries, 1);
});
void test("a substitute Promise cannot satisfy the fixed original query completion", async context => {
  const f = await forwardHeadControllerFixture(context, { replacePromise: true });
  await assert.rejects(f.controller.observe(), /SELECTED_FILE_MAIN_SQL_FENCE_BINDING/u);
  await assert.rejects(f.controller.observe(), /CONSUMED/u); assert.equal(f.state.queries, 1); await f.controller.release();
});
void test("the synchronous pending reservation excludes concurrent observation and cleanup", async context => {
  const f = await forwardHeadControllerFixture(context), pending = f.controller.observe();
  await assert.rejects(f.controller.observe(), /CONSUMED/u); await assert.rejects(f.controller.release(), /RELEASE_CONSUMED/u);
  const packet = await pending; f.controller.requireOriginal(packet); assert.equal(f.state.queries, 1); await f.controller.release();
});
void test("the exact queued read is retained before its original continuation and a lost resume cannot replay", async context => {
  const f = await forwardHeadControllerFixture(context, { continueOpening: "acknowledged" }); await f.controller.observe();
  assert.deepEqual(f.state.phases, ["capture", "require", "read", "resume-original", "await", "completed"]); await f.controller.release();
  const lost = await forwardHeadControllerFixture(context, { continueOpening: "lost" });
  await assert.rejects(lost.controller.observe(), /resume lost acknowledgment/u); assert.equal(lost.controller.retained().promiseRetained, true);
  assert.deepEqual(lost.state.phases, ["capture", "require", "read", "resume-original"]); assert.equal(lost.state.queries, 1);
  await assert.rejects(lost.controller.observe(), /CONSUMED/u); assert.equal(lost.state.queries, 1); await lost.controller.release();
});
void test("a repeated dispatch acknowledgment fails before any read effect and cannot revive normal work", async context => {
  const f = await forwardHeadControllerFixture(context, { duplicateAckAt: "read" });
  await assert.rejects(f.controller.observe(), /ORIGINAL_PENDING_REQUEST/u); assert.equal(f.state.queries, 0);
  assert.equal(f.controller.retained().failed, true); await assert.rejects(f.controller.observe(), /CONSUMED/u); await f.controller.release();
});
for (const phase of ["capture", "require", "read", "await", "completed"] as const) {
  void test(`missing ${phase} acknowledgment consumes the attempt and runs no later phase`, async context => {
    const f = await forwardHeadControllerFixture(context, { missingAckAt: phase });
    await assert.rejects(f.controller.observe(), /NATIVE_WRITE_ACK/u); assert.equal(f.state.phases.at(-1), phase);
    assert.equal(f.controller.retained().result, null); assert.equal(f.controller.retained().replies.length, f.state.phases.length);
    const observed = [...f.state.phases]; await assert.rejects(f.controller.observe(), /CONSUMED/u); assert.deepEqual(f.state.phases, observed);
    await f.controller.release(); assert.equal(f.state.releases, 1);
  });
  void test(`post-${phase} host drift retains the actual reply and stops downstream dispatch`, async context => {
    const f = await forwardHeadControllerFixture(context, { driftAt: phase });
    await assert.rejects(f.controller.observe(), /host drift/u); assert.equal(f.state.phases.at(-1), phase);
    assert.equal(f.controller.retained().replies.length, f.state.phases.length); assert.equal(f.controller.retained().result, null);
    const phases = [...f.state.phases]; await assert.rejects(f.controller.observe(), /CONSUMED/u); assert.deepEqual(f.state.phases, phases);
    // Explicit synthetic reavailability of this same host is only for its
    // Fixed cleanup group; it cannot revive observation or issue native proof.
    f.state.current = true; await f.controller.release();
  });
}
void test("a missing release response is consumed and cannot be replayed", async context => {
  const f = await forwardHeadControllerFixture(context, { rejectAt: "release" }); await f.controller.observe();
  await assert.rejects(f.controller.release(), /release lost reply/u); assert.equal(f.controller.retained().released, false);
  await assert.rejects(f.controller.release(), /RELEASE_CONSUMED/u); assert.equal(f.state.phases.filter(phase => phase === "release").length, 1);
});
void test("strict commands refuse arbitrary programs and release targets before dispatch", () => {
  assert.throws(() => validateCurrentFootprintForwardHeadCommand({ phase: "read", method: "Runtime.evaluate", params: { expression: "1" } }));
  assert.throws(() => validateCurrentFootprintForwardHeadCommand({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: "foreign" } }));
});
void test("input accessors are rejected without running them or issuing a request", async context => {
  const f = await forwardHeadControllerFixture(context); let called = 0;
  const input = { ...f.inputs }; Object.defineProperty(input, "frameObjectId", { get: (): string => { called += 1; return "frame"; } });
  assert.throws(() => new CurrentFootprintForwardHeadController({ assertCurrent: (): void => undefined,
    send: (): Promise<never> => Promise.reject(new Error("No native request permitted")), pendingRequestId: (): null => null }, input), /INPUT_DATA/u);
  assert.equal(called, 0);
});

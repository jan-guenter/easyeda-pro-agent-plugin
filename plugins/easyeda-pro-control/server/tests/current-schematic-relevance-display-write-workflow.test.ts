/** Orchestration/real durable journal checks only. Native/SQL/acceptance seams
 * are explicitly synthetic; these results are not connected writer validation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { schematicDisplayWorkflowFixture } from "./helpers/schematic-display-workflow-fixture.ts";

void test("one fixed write joins its real journal, concurrent Save lanes and separate reader before completion", async () => {
  const f = await schematicDisplayWorkflowFixture(); const pending = f.workflow.execute(); assert.equal(f.workflow.execute(), pending);
  const result = await pending; f.workflow.requireOriginalResult(result); assert.throws(() => f.workflow.requireOriginalResult({ ...result }), /ORIGINAL_RESULT/u);
  assert.equal(f.counters.launches, 1); assert.equal(f.counters.modifications, 1); assert.equal(f.counters.saves, 1); assert.equal(f.counters.aborts, 0); assert.equal(f.counters.releases, 1); assert.equal(f.counters.leaseReleased, true);
  for (const call of ["save-observer", "local-observer", "drain-observer", "generate-save", "normal-close", "capture-closed", "release-writer", "reader"]) {
    assert.ok(f.calls.includes(call), `Missing required workflow call: ${call}`);
  }
  for (const call of ["save-observer", "local-observer", "drain-observer"]) { assert.ok(f.calls.indexOf(call) < f.calls.indexOf("generate-save")); }
  assert.ok(f.calls.indexOf("normal-close") < f.calls.indexOf("capture-closed")); assert.ok(f.calls.indexOf("release-writer") < f.calls.indexOf("reader"));
  assert.equal(f.workflow.operationResult("inspect").state, "completed");
  const rows: unknown = f.journal().retained()["records"]; assert.ok(Array.isArray(rows)); assert.equal(rows.length, 47);
});
void test("actual Modify continuation failure never reaches Save and once-aborts only the original writer", async () => {
  const f = await schematicDisplayWorkflowFixture("modify-failure"); await assert.rejects(f.workflow.execute(), f.failure);
  await f.workflow.abort(true); assert.equal(f.counters.modifications, 1); assert.equal(f.counters.saves, 0); assert.equal(f.counters.aborts, 1); assert.equal(f.counters.releases, 1); assert.equal(f.counters.leaseReleased, true);
  const closure = f.workflow.requireOriginalFailureClosure(); const binding: unknown = f.requireFailure(closure); assert.ok(binding !== null && typeof binding === "object" && "value" in binding);
  assert.throws(() => f.requireFailure({ ...closure }), /ORIGINAL_FAILURE_CLOSURE/u); assert.equal(f.workflow.operationResult("inspect").verification.saved, false);
  const diagnostic = f.workflow.diagnostic(); assert.equal(diagnostic.stage, "writer-original-run"); assert.equal(diagnostic.errorCode, f.failure.message);
  await f.workflow.abort(true); assert.equal(f.workflow.diagnostic(), diagnostic);
});
void test("a poisoned closed-data release still releases the original native helper but grants no closure or acceptance", async () => {
  const f = await schematicDisplayWorkflowFixture("capture-poison"); await assert.rejects(f.workflow.execute(), f.failure);
  assert.equal(f.counters.saves, 1); assert.equal(f.counters.releases, 1); assert.equal(f.counters.leaseReleased, false);
  assert.throws(() => f.workflow.requireOriginalFailureClosure(), /ORIGINAL_FAILURE_CLOSURE_PENDING/u); assert.equal(f.workflow.operationResult("inspect").state, "needs-cleanup");
});
void test("reader failure after released writer keeps both generations false and does not duplicate parent release", async () => {
  const f = await schematicDisplayWorkflowFixture("reader-failure"); await assert.rejects(f.workflow.execute(), f.failure);
  assert.equal(f.counters.releases, 1); assert.equal(f.counters.readerAborts, 1); assert.equal(f.counters.leaseReleased, true);
  const rows: unknown = f.journal().retained()["records"]; assert.ok(Array.isArray(rows)); assert.equal(rows.filter((row: unknown) => row !== null && typeof row === "object" && "kind" in row && row.kind === "release-result").length, 1);
  f.requireFailure(f.workflow.requireOriginalFailureClosure()); const result = f.workflow.operationResult("inspect"); assert.equal(result.verification.saved, false); assert.equal(result.verification.reopened, false);
});
void test("lost allocation-intent ACK settles its actual journal without entering the factory or inventing an old terminal kind", async () => {
  const f = await schematicDisplayWorkflowFixture("allocation-intent-lost-ack"); await assert.rejects(f.workflow.execute(), f.failure);
  assert.equal(f.calls.includes("factory"), false); assert.equal(f.counters.launches, 0); assert.equal(f.counters.leaseReleased, true);
  f.requireFailure(f.workflow.requireOriginalFailureClosure()); assert.equal(f.workflow.operationResult("inspect").cleanup.allocation, "not-entered");
});
void test("a global historical blocker fails before reserving this operation or entering a factory", async () => {
  const f = await schematicDisplayWorkflowFixture("global-blocker"); await assert.rejects(f.workflow.execute(), f.failure);
  assert.equal(f.calls.includes("factory"), false); assert.equal(f.counters.leaseReleased, true); assert.equal(f.workflow.requireOriginalFailurePublicationSource(), null);
  assert.equal(f.workflow.operationResult("inspect").cleanup.nativeResourcesRetained, false);
});

/** The actual coordinator retains original Promises/private fields. Closed
 * data, source transfer and an unavailable composition are inert dependencies. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { createOriginalSourceError } from "../src/original-source-error.ts";
import type { CurrentSchematicRelevanceDisplayWriteCoordinator } from "../src/current-schematic-relevance-display-write-coordinator.ts";

const prepare = Object.freeze({ action: "prepare", operationId: "sch209-relevance-display-original-coordinator", fixtureOperationId: "synthetic-relevance-fixture", patch: Object.freeze({ x: 25, bold: true }) });
const execute = Object.freeze({ action: "execute", operationId: prepare.operationId, confirmDisposableDisplayTransaction: true, confirmOneSave: true, confirmForwardOnly: true, acceptNormalOpenEffects: true });
const abort = Object.freeze({ action: "abort", operationId: prepare.operationId, confirmOriginalJobOnly: true });
async function fixture(): Promise<Readonly<{ coordinator: CurrentSchematicRelevanceDisplayWriteCoordinator; state: { consumed: number; planned: number }; barrier: ReturnType<typeof Promise.withResolvers<object>>; prepared: object; plan: object }>> {
  const barrier = Promise.withResolvers<object>(), options = Object.freeze({ explicitSyntheticOptions: true }), plan = Object.freeze({ explicitSyntheticPlan: true });
  const prepared = Object.freeze({ explicitSyntheticClosedCheckpoint: true }), source = Object.freeze({ explicitSyntheticStagedSource: true }), state = { consumed: 0, planned: 0 };
  const original = Object.freeze({ qualification: Object.freeze({ explicitSyntheticInitialQualification: true }), archive: Buffer.from("inert archive") });
  const path = new URL("../src/current-schematic-relevance-display-write-coordinator.ts", import.meta.url), sourceRequire = createRequire(path);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-string-clock-reply.ts") { return { captureCurrentPcbStringClockReply: (value: unknown): void => { assert.equal(value, options); } }; }
    if (name === "./current-schematic-relevance-display-write-observers.ts") { return { requireCurrentSchematicRelevanceDisplayWriteCompositionSource: (): never => { throw createOriginalSourceError("SCHEMATIC_RELEVANCE_DISPLAY_SETUP", "ORIGINAL_MODIFY_COMPLETION_UNAVAILABLE"); } }; }
    if (name === "./managed-schematic-relevance-fixture-opening-source.ts") { return { consumeManagedSchematicRelevanceFixtureSourceForFreshNativePreparation: (value: unknown): object => { assert.equal(value, source); state.consumed += 1; assert.equal(state.consumed, 1); return original; } }; }
    if (name === "./managed-schematic-relevance-fixture-open-checkpoint.ts") { return { prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint: (value: unknown): Promise<object> => { assert.equal(value, original); return barrier.promise; } }; }
    if (name === "./current-schematic-relevance-display-write-plan.ts") { return {
      prepareCurrentSchematicRelevanceDisplayWritePlan: (value: unknown, input: unknown): Promise<object> => { assert.equal(value, prepared); state.planned += 1; assert.deepEqual(input, { schema: "easyeda-pro-control.schematic209-relevance-display-write-request.v1", operationId: prepare.operationId, patch: prepare.patch }); return Promise.resolve(plan); },
      requireOriginalCurrentSchematicRelevanceDisplayWritePlan: (value: unknown): void => { assert.equal(value, plan); },
    }; }
    return sourceRequire(name);
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicRelevanceDisplayWriteCoordinator"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production coordinator with only the named inert data/transfer seams above; no application/native factory is supplied.
  const coordinator = Reflect.construct(Constructor, [options, source, prepare]) as CurrentSchematicRelevanceDisplayWriteCoordinator;
  return Object.freeze({ coordinator, state, barrier, prepared, plan });
}
void test("preparation consumes one original source synchronously and every repeated prepare retains its same Promise", async () => {
  const f = await fixture(); assert.equal(f.state.consumed, 1); const pending = f.coordinator.run(prepare); assert.equal(f.coordinator.run(prepare), pending);
  f.barrier.resolve(f.prepared); const result = await pending; assert.equal(result.state, "prepared"); assert.equal(f.state.planned, 1);
  assert.equal(f.coordinator.requireOriginalPreparation(), f.plan); assert.equal(result.cleanup.allocation, "not-entered"); assert.equal(result.effects.modifyAttempted, false);
  await assert.rejects(f.coordinator.run(execute), /ORIGINAL_MODIFY_COMPLETION_UNAVAILABLE/u); assert.equal(f.coordinator.failureObserved(), true);
  const refused = f.coordinator.inspect(); assert.equal(refused.cleanup.generation, "none"); assert.equal(refused.cleanup.nativeResourcesRetained, false);
  assert.equal(refused.cleanup.publicationPending, false); assert.equal(refused.verification.saved, false);
  assert.equal(f.coordinator.diagnostic().stage, "before-allocation"); assert.equal(f.coordinator.diagnostic().errorCode, "SCHEMATIC_RELEVANCE_DISPLAY_SETUP_ORIGINAL_MODIFY_COMPLETION_UNAVAILABLE");
});
void test("abort during preparation retains original settlement and cannot produce a native execution failure or result", async () => {
  const f = await fixture(), pending = f.coordinator.run(prepare); const stopped = f.coordinator.run(abort); assert.equal(f.coordinator.run(abort), stopped);
  f.barrier.resolve(f.prepared); await assert.rejects(pending, /PREPARATION_ABORTED/u); const result = await stopped;
  assert.equal(f.state.planned, 0); assert.equal(result.cleanup.generation, "none"); assert.equal(result.cleanup.abortAttempted, false);
  assert.equal(result.cleanup.publicationPending, false); assert.equal(result.verification.saved, false); assert.equal(result.verification.reopened, false);
  assert.throws(() => f.coordinator.requireOriginalPreparation(), /ORIGINAL_PREPARATION_REQUIRED/u);
  await assert.rejects(f.coordinator.run({ action: "release", operationId: prepare.operationId }), /PREPARATION_ABORTED/u);
});
void test("abort after preparation and before the execute continuation creates no native execution failure or failure publication", async () => {
  const f = await fixture(); f.barrier.resolve(f.prepared); await f.coordinator.run(prepare);
  const execution = f.coordinator.run(execute), stopped = f.coordinator.run(abort);
  await assert.rejects(execution, /EXECUTION_ABORTED_BEFORE_BIRTH/u); const result = await stopped;
  assert.equal(f.coordinator.failureObserved(), false); assert.equal(f.coordinator.hasActiveReservation(), false);
  assert.equal(f.coordinator.diagnostic().originalFailureObserved, false);
  assert.equal(result.cleanup.generation, "none"); assert.equal(result.cleanup.allocation, "not-entered");
  assert.equal(result.cleanup.abortAttempted, false); assert.equal(result.cleanup.publicationPending, false);
  assert.equal(result.effects.modifyAttempted, false); assert.equal(result.effects.saveAttempted, false);
  await f.coordinator.shutdownOriginal();
});
void test("a failed original checkpoint keeps its rejection and cannot prepare another plan", async () => {
  const f = await fixture(), failure = new Error("SYNTHETIC_ORIGINAL_CHECKPOINT_FAILURE"), pending = f.coordinator.run(prepare);
  f.barrier.reject(failure); await assert.rejects(pending, failure); assert.equal(f.coordinator.run(prepare), pending);
  assert.equal(f.state.consumed, 1); assert.equal(f.state.planned, 0); assert.equal(f.coordinator.inspect().cleanup.nativeResourcesRetained, false);
  assert.equal(f.coordinator.hasActiveReservation(), false);
});

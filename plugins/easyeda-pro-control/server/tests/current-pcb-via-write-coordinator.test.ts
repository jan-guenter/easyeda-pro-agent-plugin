/** Actual action scheduling with explicit inert original-source/workflow seams.
 * No private source, process owner, helper, CAD operation or Save is issued. */
/* oxlint-disable eslint/max-classes-per-file -- Two explicit inert classes replace separate production workflow and sidecar modules while the actual coordinator scheduling remains unchanged. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcbViaWriteCoordinator } from "../src/current-pcb-via-write-coordinator.ts";
import { CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS } from "../src/current-pcb-via-write-contract.ts";

const request = { action: "prepare", fixtureOperationId: "original-closed-data", operationId: "pcb209-via-write-coordinator-test",
  via: { netName: "", xMil: 100, yMil: 100, holeDiameterMil: 20, diameterMil: 40 } } as const;
type Mode = "no-journal" | "terminal" | "sidecar" | "lost-ack";
async function fixture(mode: Mode = "no-journal"): Promise<Readonly<{ coordinator: CurrentPcbViaWriteCoordinator; calls: string[]; releasePreparation: () => void; releasePublication: () => void; failExecution: () => void }>> {
  const calls: string[] = [], url = new URL("../src/current-pcb-via-write-coordinator.ts", import.meta.url);
  const originalRequire = createRequire(url); const source = await readFile(url, "utf8");
  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const sourceData = Object.freeze({ inertSourceData: true }), sourceToken = Object.freeze({ inertOriginalSource: true });
  const checkpoint = Object.freeze({ inertCheckpoint: true }), options = Object.freeze({ inertOptions: true }), plan = Object.freeze({ inertPlan: true, operationId: request.operationId });
  const execution = Promise.withResolvers<never>(), preparation = Promise.withResolvers<true>(), publication = Promise.withResolvers<true>();
  const journal = Object.freeze({ inertOriginalJournal: true }), token = Object.freeze({ inertOriginalFailureToken: true });
  const failureSource = Object.freeze({ token, plan, journal });
  const bindings = Object.freeze({ plan, journal, value: Object.freeze({ originalInertClosure: true }), assertCurrent: (): Promise<void> => Promise.resolve() });
  const inspection = Object.freeze({ operationId: request.operationId, saved: false, reopened: false });
  let aborted = false, consumed = false, failed = false, started = false;
  /* oxlint-disable eslint/class-methods-use-this -- The inert replacement preserves the production instance method signatures without inventing production private state. */
  class Workflow {
    public constructor(actualOptions: unknown, actualPlan: unknown) { assert.equal(actualOptions, options); assert.equal(actualPlan, plan); calls.push("workflow"); }
    public execute(): Promise<never> { assert.equal(started, false); assert.equal(aborted, false); started = true; calls.push("execute"); return execution.promise; }
    public requireOriginalFailurePublicationSource(): typeof failureSource | null { assert.equal(started && failed, true); calls.push("original-failure-source"); return mode === "no-journal" ? null : failureSource; }
    public settlePublication(): Promise<void> { calls.push("journal-settlement"); return Promise.resolve(); }
    public settleCleanup(): Promise<void> { calls.push("original-cleanup-settlement"); return Promise.resolve(); }
    public requireOriginalResult(): never { throw new Error("This test never issues a completion proof."); }
    public abort(actual: true): Promise<void> { assert.equal(actual, true); aborted = true; calls.push("abort"); return Promise.resolve(); }
    public operationResult(action: string): object {
      let state = "prepared"; if (started && !failed) { state = "running"; } else if (aborted || failed) { state = "verification-pending"; }
      return { schema: "easyeda-pro-control.pcb209-via-write-operation.v1", action, operationId: request.operationId, state,
        effects: { createAttempted: false, createAcknowledged: false, saveAttempted: false, saveOutcome: "not-attempted" },
        verification: { saved: false, reopened: false, completeSqlVerified: false, peerRosterPreserved: false },
        cleanup: { generation: "none", allocation: "not-entered", nativeResourcesRetained: false, abortAttempted: aborted,
          originalTerminationVerified: false, helperReleaseVerified: false, publicationPending: false }, forwardOnly: true, inverseAvailable: false };
    }
  }
  /* oxlint-enable eslint/class-methods-use-this */
  const replacements: Readonly<Record<string, unknown>> = {
    "./managed-fixture-opening-source.ts": { consumeManagedFixtureOpeningSource: (actual: unknown): object => { assert.equal(actual, sourceToken); assert.equal(consumed, false); consumed = true; calls.push("consume-source"); return sourceData; } },
    "./managed-fixture-generated-open-checkpoint.ts": { prepareGeneratedFixtureOpenCheckpoint: async (actual: unknown): Promise<object> => { assert.equal(actual, sourceData); calls.push("checkpoint"); await preparation.promise; return checkpoint; } },
    "./current-pcb-via-write-plan.ts": { prepareCurrentPcbViaWritePlan: (actual: unknown, input: unknown): Promise<object> => { assert.equal(actual, checkpoint); assert.deepEqual(input, { schema: "easyeda-pro-control.pcb209-via-write-request.v1", operationId: request.operationId, via: request.via }); calls.push("plan"); return Promise.resolve(plan); } },
    "./current-pcb-via-write-workflow.ts": { CurrentPcbViaWriteWorkflow: Workflow,
      requireOriginalCurrentPcbViaWriteFailureClosure: (t: unknown, p: unknown, j: unknown): typeof bindings => { assert.equal(t, token); assert.equal(p, plan); assert.equal(j, journal); return bindings; } },
    "./artifacts.ts": { loadOperation: (id: string): Promise<object> => { assert.equal(id, request.operationId); calls.push("fresh-original-journal"); return Promise.resolve(journal); } },
    "./current-pcb-via-write-journal-codec.ts": { currentPcbViaWriteHistoricalTerminal: (j: unknown): boolean => { assert.equal(j, journal); return mode === "terminal"; } },
    "./current-pcb-via-write-abandonment.ts": { CurrentPcbViaWriteAbandonmentPublication: class {
      readonly #result = inspection;
      public constructor(t: unknown, p: unknown, j: unknown) { assert.equal(t, token); assert.equal(p, plan); assert.equal(j, journal); calls.push("original-sidecar"); }
      public async publish(): Promise<typeof inspection> { calls.push("original-sidecar-write"); if (mode === "lost-ack") { throw new Error("lost original sidecar ACK"); } await publication.promise; calls.push("original-sidecar-write-settled"); return this.#result; }
      public settle(): Promise<typeof inspection> { calls.push("original-sidecar-readonly-settlement"); return Promise.resolve(this.#result); }
    } },
  };
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements[name] ?? originalRequire(name), loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteCoordinator"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert source/checkpoint/plan/workflow imports differ; actual private coordinator state and scheduling run unchanged.
  const coordinator = Reflect.construct(Constructor, [options, sourceToken, request]) as CurrentPcbViaWriteCoordinator;
  return { coordinator, calls, releasePreparation: (): void => { preparation.resolve(true); }, releasePublication: (): void => { publication.resolve(true); }, failExecution: (): void => { failed = true; execution.reject(new Error("original execution failure")); } };
}
void test("equal-looking source JSON refuses before checkpoint or native allocation", () => {
  assert.throws(() => Reflect.construct(CurrentPcbViaWriteCoordinator, [Object.freeze({}), {}, request]), /Original unconsumed/u);
});
void test("confirmed execution reserves before its preparation await and consumes only one original execution", async () => {
  const f = await fixture(); assert.deepEqual(f.calls, ["consume-source", "checkpoint"]);
  const execute = { action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS } as const;
  const pending = f.coordinator.run(execute); assert.equal(f.coordinator.hasActiveReservation(), true);
  await assert.rejects(f.coordinator.run(execute), /EXECUTE_CONSUMED/u); f.releasePreparation();
  await pending; assert.deepEqual(f.calls, ["consume-source", "checkpoint", "plan", "workflow", "execute"]);
  assert.equal(f.coordinator.hasActiveReservation(), true); f.failExecution();
  await nextTurn();
  assert.equal(f.coordinator.failureObserved(), true); assert.equal(f.coordinator.hasActiveReservation(), false);
});
void test("abort during preparation joins that original work and creates no workflow or native execution", async () => {
  const f = await fixture(); const pending = f.coordinator.run({ action: "abort", operationId: request.operationId, confirmOriginalJobOnly: true });
  f.releasePreparation(); await pending;
  assert.deepEqual(f.calls, ["consume-source", "checkpoint"]); assert.equal(f.coordinator.failureObserved(), true);
  assert.equal(f.coordinator.hasActiveReservation(), false);
  await assert.rejects(f.coordinator.run({ action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS }), /EXECUTE_CONSUMED/u);
});
void test("host shutdown retains one cleanup Promise and cannot turn preparation into native execution", async () => {
  const f = await fixture(); f.releasePreparation(); await f.coordinator.run(request);
  const original = f.coordinator.shutdownOriginal(); assert.equal(f.coordinator.shutdownOriginal(), original); await original;
  assert.equal(f.calls.includes("execute"), false); assert.equal(f.calls.filter(value => value === "abort").length, 1);
  assert.equal(f.coordinator.hasActiveReservation(), false);
  await assert.rejects(f.coordinator.run({ action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS }), /EXECUTE_CONSUMED/u);
});

void test("one original sidecar remains pending through inspection and journal settlement waits its exact write", async () => {
  const f = await fixture("sidecar"); f.releasePreparation(); await f.coordinator.run(request);
  await f.coordinator.run({ action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS });
  f.failExecution(); await nextTurn(); assert.equal(f.coordinator.hasActiveReservation(), true);
  assert.equal(f.coordinator.inspect().cleanup.publicationPending, true); assert.equal(f.coordinator.inspect().verification.saved, false);
  const settle = f.coordinator.run({ action: "settle-publication", operationId: request.operationId }); await nextTurn();
  assert.equal(f.calls.includes("journal-settlement"), false); f.releasePublication(); await settle;
  assert.ok(f.calls.indexOf("original-sidecar-write-settled") < f.calls.indexOf("journal-settlement"));
  assert.equal(f.calls.filter(value => value === "original-sidecar-write").length, 1);
  assert.equal(f.calls.filter(value => value === "original-sidecar-readonly-settlement").length, 1);
  assert.equal(f.coordinator.hasActiveReservation(), false); assert.equal(f.coordinator.inspect().verification.reopened, false);
});
void test("lost sidecar ACK retains quarantine until same readonly settlement and shutdown cannot replay publication", async () => {
  const f = await fixture("lost-ack"); f.releasePreparation(); await f.coordinator.run(request);
  await f.coordinator.run({ action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS }); f.failExecution(); await nextTurn();
  assert.equal(f.coordinator.hasActiveReservation(), true);
  await assert.rejects(f.coordinator.run({ action: "release", operationId: request.operationId }), /lost original sidecar/u);
  assert.equal(f.calls.filter(value => value === "original-sidecar-write").length, 1);
  await f.coordinator.run({ action: "settle-publication", operationId: request.operationId }); assert.equal(f.coordinator.hasActiveReservation(), false);
  await f.coordinator.shutdownOriginal(); assert.equal(f.calls.filter(value => value === "original-sidecar-write").length, 1);
});
void test("a genuine already-terminal refusal needs fresh original journal proof and creates no abandonment", async () => {
  const f = await fixture("terminal"); f.releasePreparation(); await f.coordinator.run(request);
  await f.coordinator.run({ action: "execute", operationId: request.operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS }); f.failExecution(); await nextTurn();
  assert.ok(f.calls.includes("fresh-original-journal")); assert.equal(f.calls.includes("original-sidecar"), false);
  assert.equal(f.coordinator.hasActiveReservation(), false); assert.equal(f.coordinator.inspect().verification.saved, false);
});

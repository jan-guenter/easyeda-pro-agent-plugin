/* oxlint-disable eslint/max-classes-per-file -- The actual extracted index dispatcher selects between these seven synthetic lifecycle classes. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";

type Row = Record<string, unknown>;
type Run = (request: Readonly<{ action: string }>, empty?: boolean, ratline?: boolean) => Promise<Readonly<{ result: Row }>>;
async function fixture(): Promise<Readonly<{ run: Run; owners: readonly Readonly<{ hasActiveReservation: () => boolean }>[]; flush: () => Promise<void>;
  state: { holdInspect: Promise<unknown> | null; blockGate: boolean; rejectEnqueue: boolean } }>> {
  const owners: Owner[] = [], state = { holdInspect: null as Promise<unknown> | null, blockGate: false, rejectEnqueue: false };
  const queue: (() => Promise<void>)[] = [];
  class Owner {
    #lease = false;
    public constructor() { owners.push(this); }
    public async run(request: Readonly<{ action: string }>): Promise<Row> {
      if (request.action === "launch") { assert.equal(this.#lease, false); this.#lease = true; }
      else if (request.action === "release-closed") { assert.equal(this.#lease, true); this.#lease = false; }
      else { assert.equal(request.action, "inspect"); await state.holdInspect; }
      return { synthetic: true, active: this.#lease };
    }
    public hasActiveReservation(): boolean { return this.#lease; }
  }
  class Owner209 extends Owner {}
  class Empty209 extends Owner {}
  class Continuation209 extends Owner {}
  class Footprint209 extends Owner {}
  class FootprintRoute209 extends Owner {}
  class Ratline209 extends Owner {
    public observeWorkerStartupRatline(): Promise<Row> {
      assert.equal(this.hasActiveReservation(), true); return Promise.resolve({ synthetic: true, held: true });
    }
  }
  // None of these startup operations is invoked. Stable methods exist only so
  // The unmodified production index can capture and reprove its method graph.
  for (const name of ["captureWorkerStartup", "handoffWorkerStartup", "openWorkerStartup", "handoffStartup", "openStartup", "requireStartup",
    "observeWorkerStartupAssignments", "observeStartupAssignments", "requireStartupAssignments", "observeWorkerStartupFootprint", "observeStartupFootprint", "observeWorkerStartupActor", "observeStartupActor",
    "observeWorkerStartupFootprintSource", "observeStartupFootprintSource",
    "prepareWorkerStartupFootprintCopy", "prepareStartupFootprintCopy",
    "prepareWorkerStartupFootprintBindings", "prepareStartupFootprintCopyBindings",
    "observeWorkerStartupFootprintUi", "observeStartupFootprintCopyUi",
    "prepareWorkerStartupFootprintDependencies", "prepareStartupFootprintCopyDependencies",
    "observeWorkerStartupFootprintManagerRoute", "observeStartupFootprintCopyManagerRoute",
    "observeWorkerStartupChannel", "observeStartupChannel", "observeWorkerStartupEmpty", "observeStartupEmpty", "prepareWorkerStartupEmpty", "prepareStartupEmpty", "observeWorkerStartupRatline", "observeStartupRatline",
    "observeWorkerStartupRatlineContinuation", "observeStartupRatlineContinuation"]) {
    Object.defineProperty(Owner.prototype, name, { value: (): never => { throw new Error(`Unexpected synthetic operation ${name}`); } });
  }
  const bridgeGate = { run: <T>(work: () => Promise<T>): Promise<T> => {
    if (state.rejectEnqueue) { throw new Error("synthetic synchronous enqueue failure"); }
    if (!state.blockGate) { return Promise.resolve().then(work); }
    const pending = Promise.withResolvers<T>();
    queue.push(async (): Promise<void> => { try { pending.resolve(await work()); } catch (error) { pending.reject(error); } });
    return pending.promise;
  } };
  const upstream = Object.freeze({ synthetic: true });
  const engine = { upstream, controlFingerprintPromise: Promise.resolve("synthetic"), executionAuthorityValidator: (): void => {
    // Stable synthetic validator.
  },
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  const data = { diagnostic209: true, CurrentPcbWorkerStartupLifecycle: Owner, CurrentPcb209WorkerStartupLifecycle: Owner209,
    CurrentPcb209EmptyStartupLifecycle: Empty209, CurrentPcb209RatlineStartupLifecycle: Ratline209,
    CurrentPcb209RatlineContinuationLifecycle: Continuation209, CurrentFootprintCopyPreparationLifecycle: Footprint209,
    CurrentFootprintCopyRoutePreparationLifecycle: FootprintRoute209, engine, bridgeGate, upstream,
    retainedControlRoot: Object.freeze({ path: "/synthetic-control" }), controlDataDirectory: (): string => "/synthetic-control", resolve,
    CURRENT_PCB_DIAGNOSTIC_PROFILE: Object.freeze({ powershell: { sha256: "a".repeat(64), bytes: 1 } }),
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentDisposableOpenCoordinator: undefined,
    currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentFootprintMainLifecycle: undefined };
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const begin = source.indexOf("  let startupOriginal:"), end = source.indexOf("\n  if (facadeToolRegistered", begin);
  // The preparation route extends this actual source slice beyond 20,000 characters.
  // Match the bounded extraction used by the ordinary-release registration fixture.
  assert.ok(begin > 0 && end > begin && end - begin < 24_000);
  const helpersBegin = source.indexOf("function disposableOwnData("), helpersEnd = source.indexOf("\n}", source.indexOf("function disposableOwnerMethod(", helpersBegin)) + 2;
  assert.ok(helpersBegin > 0 && helpersEnd > helpersBegin && helpersEnd - helpersBegin < 2500);
  // Evaluate the actual source bodies unchanged, supplying only synthetic
  // Collaborators. The module itself is never imported or started by this test.
  const wrapper = `export function create(context) { const { ${Object.keys(data).join(",")} } = context;
    let currentPcbWorkerStartupLifecycle;
    ${source.slice(helpersBegin, helpersEnd)}
    ${source.slice(begin, end)}
    return runStartup;
  }`;
  const generated = await transform(wrapper, { loader: "ts", format: "cjs", target: "node24",
    define: { "import.meta.dirname": JSON.stringify(resolve(import.meta.dirname, "../src")) } });
  const loaded: { exports: Row } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(module,exports){${generated.code}\n})`);
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [loaded, loaded.exports]);
  const create = loaded.exports["create"]; assert.ok(typeof create === "function");
  const run: unknown = Reflect.apply(create, undefined, [data]); assert.ok(typeof run === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked callable is the unchanged actual index function, whose public promise result is asserted in every case below.
  const dispatch: Run = (request, empty, ratline): ReturnType<Run> => Reflect.apply(run, undefined, [request, empty, ratline]) as ReturnType<Run>;
  return { run: dispatch, owners, state, flush: async (): Promise<void> => { const job = queue.shift(); assert.ok(job); await job(); } };
}

void test("actual startup dispatcher allows purpose change after historical inspect, but retains an in-flight inspect", async () => {
  const inspection = Promise.withResolvers<null>(), value = await fixture(); value.state.holdInspect = inspection.promise;
  const pending = value.run({ action: "inspect" });
  assert.throws(() => value.run({ action: "inspect" }, true), /original call or reservation remains/u);
  assert.equal(value.owners.length, 1); inspection.resolve(null);
  const inspected = await pending; assert.deepEqual(inspected.result, { synthetic: true, active: false });
  const changed = await value.run({ action: "inspect" }, true); assert.deepEqual(changed.result, { synthetic: true, active: false });
  assert.equal(value.owners.length, 2);
});

void test("actual startup dispatcher preserves queued launch and active lease, then permits a settled released purpose change", async () => {
  const value = await fixture(); value.state.blockGate = true;
  const launch = value.run({ action: "launch" }); assert.equal(value.owners[0]?.hasActiveReservation(), false);
  assert.throws(() => value.run({ action: "launch" }, true), /original call or reservation remains/u); assert.equal(value.owners.length, 1);
  await value.flush(); const launched = await launch; assert.deepEqual(launched.result, { synthetic: true, active: true });
  assert.throws(() => value.run({ action: "inspect" }, true), /original call or reservation remains/u); assert.equal(value.owners.length, 1);
  value.state.blockGate = false;
  const released = await value.run({ action: "release-closed" }); assert.deepEqual(released.result, { synthetic: true, active: false });
  const changed = await value.run({ action: "launch" }, true); assert.deepEqual(changed.result, { synthetic: true, active: true });
  assert.equal(value.owners.length, 2); assert.equal(value.owners[0]?.hasActiveReservation(), false);
  assert.equal(value.owners[1]?.hasActiveReservation(), true);
});

void test("actual startup dispatcher clears admitted-call count after synchronous gate refusal", async () => {
  const value = await fixture(); value.state.rejectEnqueue = true;
  assert.throws(() => value.run({ action: "launch" }), /synthetic synchronous enqueue failure/u);
  assert.equal(value.owners[0]?.hasActiveReservation(), false);
  const changed = await value.run({ action: "inspect" }, true); assert.deepEqual(changed.result, { synthetic: true, active: false });
  assert.equal(value.owners.length, 2);
});

void test("actual startup dispatcher keeps the ratline purpose distinct across queued and released owners", async () => {
  const value = await fixture();
  await value.run({ action: "inspect" }, true);
  await value.run({ action: "inspect" }, false, true); assert.equal(value.owners.length, 2);
  assert.throws(() => value.run({ action: "inspect" }, true, true), /one fixed startup purpose/u);
  value.state.blockGate = true;
  const launch = value.run({ action: "launch" }, false, true);
  assert.throws(() => value.run({ action: "inspect" }, true), /original call or reservation remains/u);
  await value.flush(); await launch;
  assert.throws(() => value.run({ action: "inspect" }), /original call or reservation remains/u);
  value.state.blockGate = false;
  const observed = await value.run({ action: "observe-ratline-held-import" }, false, true);
  assert.deepEqual(observed.result, { synthetic: true, held: true });
  await value.run({ action: "release-closed" }, false, true);
  await value.run({ action: "inspect" }); assert.equal(value.owners.length, 3);
});

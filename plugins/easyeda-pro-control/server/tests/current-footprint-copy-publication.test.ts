/** Actual lifecycle/journal composition with synthetic native/source/plan boundaries.
 * This proves publication ordering and refusal semantics, not connected ownership. */
/* oxlint-disable import/max-dependencies -- The composed lifecycle keeps its real journal, adapter, complete SQL reader and explicit synthetic native boundaries in one test. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Json, sha256Text } from "../src/core.ts";
import { currentFootprintCopyPreparationSchema } from "../src/current-footprint-copy-preparation.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { currentFootprintSourceReadPacketSchema } from "../src/current-footprint-source-read-runner.ts";
import { publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupHandoff } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcb209WorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { readExactSqlInventory } from "../src/sqlite-inventory.ts";

type Row = Record<string, unknown>;
interface Fixture {
  readonly coordinator: CurrentPcb209WorkerStartupLifecycle;
  readonly owner: Row;
  readonly state: { terminated: boolean };
}
interface FixtureModule {
  readonly fixture: (context: TestContext, id: string, dependencies: Row) => Fixture;
  readonly readyForOpening: (id: string, value: Fixture) => Promise<void>;
  readonly directory: (id: string) => string;
  readonly OPEN_RESULT: CurrentPcb209WorkerStartupOpeningResult["opening"];
  readonly STARTUP_OPEN_INPUT: Row;
}
async function loadSource(path: URL, source: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const generated = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const actualRequire = createRequire(path), loaded: { exports: Row } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : actualRequire(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
async function loadFile(relative: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const path = new URL(relative, import.meta.url); return loadSource(path, await readFile(path, "utf8"), replacements);
}
async function loadFixture(lifecycle: Row): Promise<FixtureModule> {
  const path = new URL("current-pcb-diagnostic-lifecycle.test.ts", import.meta.url);
  const complete = await readFile(path, "utf8");
  const offset = complete.indexOf("\nvoid test("); assert.ok(offset > 10_000 && offset < 40_000);
  let source = complete.slice(0, offset);
  const substitutions = [
    ["diagnostic-test|pcb209-test|string-precreate-test|worker-startup-test", "diagnostic-test|pcb209-test|pcb209-startup-test|string-precreate-test|worker-startup-test"],
    ['const startupPurpose = id.startsWith("worker-startup-");', 'const startupPurpose = id.startsWith("worker-startup-") || id.startsWith("pcb209-startup-");'],
    ['profile: ownerPurpose, stringPrecreateConsumed:', 'profile: startupPurpose ? "worker-startup209" : ownerPurpose, stringPrecreateConsumed:'],
    ['if (opening209) { coordinator =', 'if (opening209 && !startupPurpose) { coordinator ='],
    ['return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });',
      'return Promise.resolve({ sourceVerified: true, family: profile.family, sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, relativePath: profile.relativePath, executionAuthorized: false });'],
  ] as const;
  for (const [before, after] of substitutions) { assert.equal(source.split(before).length, 2); source = source.replace(before, after); }
  source += "\nexport { fixture, readyForOpening, directory, OPEN_RESULT, STARTUP_OPEN_INPUT };\n";
  const loaded = await loadSource(path, source, new Map([["../src/current-pcb-diagnostic-lifecycle.ts", {
    ...lifecycle, CurrentPcbWorkerStartupLifecycle: lifecycle["CurrentPcb209WorkerStartupLifecycle"],
  }]]));
  for (const name of ["fixture", "readyForOpening", "directory"]) { assert.equal(typeof loaded[name], "function"); }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained non-test fixture exports are evaluated with the explicit current209 substitutions above.
  return loaded as unknown as FixtureModule;
}
function unused(): never { throw new Error("Unexpected synthetic native operation"); }
async function fixture(context: TestContext, mode: "success" | "capacity" | "publication" | "reproof"):
Promise<Readonly<{ value: Fixture; id: string; binding: string; prepare: () => Promise<Row>; calls: string[]; directory: string }>> {
  const calls: string[] = [], id = `pcb209-startup-test-preparation-${mode}`;
  let module: FixtureModule | null = null, result: CurrentPcb209WorkerStartupOpeningResult | null = null;
  let before: Awaited<ReturnType<typeof readExactSqlInventory>> | null = null, plan: Row | null = null;
  let state: ReturnType<typeof currentFootprintCopyStatePacketSchema.parse> | null = null;
  let packet: ReturnType<typeof currentFootprintSourceReadPacketSchema.parse> | null = null;
  let prepared: ReturnType<typeof currentFootprintCopyPreparationSchema.parse> | null = null;
  const assignments = Object.freeze({ profile: "private.current-pcb-worker-construction-assignments.v1",
    callbackKinds: ["uploadStructure", "structure", "cooperation", "upload"], originalConstructionCallbacksMatched: true,
    originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true, continuousAssignmentOwnershipVerified: false,
    nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false, writeDestinationsContained: false,
    atomicSnapshotVerified: false, queueCompletionVerified: false, executionAuthorized: false });
  class Opening {
    readonly #original = Object.freeze({ synthetic: true });
    public async open(_target: unknown, check: () => Promise<void>): Promise<CurrentPcb209WorkerStartupOpeningResult> { assert.equal(this.#original.synthetic, true); await check(); assert.ok(result); return result; }
    public status(): Row { return { completed: true, synthetic: this.#original.synthetic }; }
    public retainedOpeningResult(): CurrentPcb209WorkerStartupOpeningResult["opening"] | null { assert.equal(this.#original.synthetic, true); return result?.opening ?? null; }
    public requireOriginal(selected: unknown): Promise<object> { assert.equal(selected, result); return Promise.resolve(this.#original); }
    public proveCurrentAssignments(): Promise<object> { assert.equal(this.#original.synthetic, true); return Promise.resolve(assignments); }
    public requireCurrentAssignments(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public retainedActorObservation(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeActorClock = unused;
    public requireActorClock = unused;
    public retainedChannelObservation(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeCurrentChannel = unused;
    public requireCurrentChannel = unused;
    public retainedFootprintState(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeFootprintState(): Promise<typeof state> { assert.equal(this.#original.synthetic, true); return Promise.resolve(state); }
    public requireFootprintState(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public retainedFootprintSource(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeFootprintSource(): Promise<typeof packet> { assert.equal(this.#original.synthetic, true); return Promise.resolve(packet); }
    public requireFootprintSource(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public releaseAfterTermination(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
  }
  const classes = new Map<string, unknown>([["./current-pcb-209-worker-startup-opening.ts", { CurrentPcb209WorkerStartupOpening: Opening }],
    ["./current-footprint-source-plan.ts", { prepareCurrentFootprintSourcePlan: (inventory: NonNullable<typeof before>): Promise<Row> => {
      before = inventory; plan = Object.freeze({ maximumTicket: 100, beforeSqlSha256: inventory.logicalSha256, beforeCheckpointSha256: inventory.checkpointSha256 });
      return Promise.resolve(plan);
    } }],
    ["./current-footprint-copy-preparation-runtime.ts", {
      prepareCurrentFootprintCopyOwned: async (input: Row): Promise<NonNullable<typeof prepared>> => {
        assert.ok(module && before && plan && packet); assert.ok(input["opening"] instanceof Opening);
        assert.equal(input["result"], result); assert.equal(input["assignments"], assignments); assert.equal(input["state"], state);
        assert.equal(input["sourcePlan"], plan); assert.equal(input["source"], packet); assert.equal(input["before"], before);
        const path = join(module.directory(id), "worker-startup-footprint-preparation-intent.json"), raw = await readFile(path, "utf8");
        assert.match(raw, /footprint-preparation-intent/u); calls.push("prepared-after-intent");
        prepared = currentFootprintCopyPreparationSchema.parse({ profile: "private.current-footprint-copy-owned-preparation.v1",
          beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256, sourcePlanSha256: sha256Json(plan),
          sourcePacketSha256: sha256Json(packet), copyPlanSha256: "a".repeat(64), nativeArgumentsSha256: "b".repeat(64),
          originalOpeningRetained: true, originalSourceObservationRetained: true, lifecyclePublicationVerified: false,
          copyLaunchPurposeQualified: false, completeCapacityReserved: false, producerBindingVerified: false,
          actorAndClocksVerified: false, executionAuthorized: false, persistenceVerified: false });
        return prepared;
      },
      requireCurrentFootprintCopyOwned: (selected: unknown, opening: unknown): Promise<void> => {
        assert.equal(selected, prepared); assert.ok(opening instanceof Opening); calls.push("reproof");
        return mode === "reproof" ? Promise.reject(new Error("synthetic original owner lost")) : Promise.resolve();
      },
    }]]);
  const adapter = await loadFile("../src/current-pcb-worker-startup-lifecycle-adapter.ts", classes);
  classes.set("./current-pcb-worker-startup-lifecycle-adapter.ts", adapter);
  const lifecycle = await loadFile("../src/current-pcb-diagnostic-lifecycle.ts", classes); module = await loadFixture(lifecycle);
  let publicationRefused = false;
  const value = module.fixture(context, id, { create209StartupOpening: (): Opening => new Opening(),
    publishRecord: async (...args: Parameters<typeof publishCurrentPcbDiagnosticLifecycleRecord>): Promise<void> => {
      if (mode === "publication" && args[1] === "worker-startup-footprint-preparation-result.json" && !publicationRefused) {
        publicationRefused = true; throw new Error("synthetic publication refusal");
      }
      await publishCurrentPcbDiagnosticLifecycleRecord(...args);
    },
  });
  result = Object.freeze({ opening: module.OPEN_RESULT, construction: Object.freeze({ profile: "private.current-pcb209-worker-construction.v1", pauses: 9,
    originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false,
    wrapperAssignmentRelationVerified: false, nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false }),
    workerIdentity: { projectUuid: module.OPEN_RESULT.projectUuid, branchUuid: module.OPEN_RESULT.branchUuid, windowTabId: "fixture-tab" },
    ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  state = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: result.workerIdentity,
    client: "1234567890abcdef", maximumTicket: 100, capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true,
    atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
  packet = currentFootprintSourceReadPacketSchema.parse({ profile: "private.current-footprint-source-read.v1",
    request: { identity: result.workerIdentity, footprintUuid: "1234567890abcdef", client: state.client, maximumTicket: 100 },
    content: "synthetic source", sourceSha256: sha256Text("synthetic source"), sourceSamples: 2, stateSamples: 4, route: "native-cache-equivalent",
    sourceGetterDispatched: false, cacheRead: { keys: 1, bytes: 100, atoms: 1 }, cacheWrites: 0, networkRequests: 0,
    exactKeyedSourceVerified: true, comparison: "complete-checkpoint-records-native-order", checkpointByteOrderMatched: false, nativeOrderStable: true,
    keyedRecordsSha256: "a".repeat(64), observedOrderSha256: "b".repeat(64), canvasRecords: 1, tombstones: 0,
    cacheEffectsPossible: false, cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false });
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const channel = new CurrentPcbWorkerStartupChannel({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(value.state.terminated); return Promise.resolve(); }, observeOriginalParentEvent: unused, exchange: unused });
  const handoff: CurrentPcbWorkerStartupHandoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({
    context: (): Readonly<{ sessionId: string; uniqueContextId: string }> => ({ sessionId: parent.sessionId, uniqueContextId: "parent-context" }),
    reprove: (): Promise<void> => Promise.resolve(), begin: unused, finish: unused, observeParent: unused,
    ancillaryFrame: (): null => null, observeAncillary: unused, ancillaryObservation: (): null => null,
  }) });
  value.owner["handoffWorkerStartup"] = (): Promise<CurrentPcbWorkerStartupHandoff> => Promise.resolve(handoff);
  const status = value.owner["status"]; assert.ok(typeof status === "function"); let nextRequestId = 100;
  value.owner["status"] = (): Row => {
    const observed: unknown = Reflect.apply(status, value.owner, []); assert.ok(observed !== null && typeof observed === "object");
    return { ...observed, workerStartupChannel: { ...channel.status(), nextRequestId } };
  };
  context.after(async (): Promise<void> => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  await module.readyForOpening(id, value);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = inspected["bindingSha256"];
  assert.ok(typeof binding === "string"); await value.coordinator.handoffWorkerStartup(id, binding);
  await value.coordinator.openWorkerStartup(id, binding, module.STARTUP_OPEN_INPUT);
  await value.coordinator.observeWorkerStartupAssignments(id, binding);
  await value.coordinator.observeWorkerStartupFootprint(id, binding);
  await value.coordinator.observeWorkerStartupFootprintSource(id, binding, { footprintUuid: "1234567890abcdef" });
  nextRequestId = mode === "capacity" ? 218 : 217;
  const directory = module.directory(id);
  return { value, id, binding, calls, directory, prepare: (): Promise<Row> => value.coordinator.prepareWorkerStartupFootprintCopy(id, binding) };
}
for (const mode of ["success", "capacity", "reproof", "publication"] as const) {
  void test(`footprint preparation publishes original inputs once and preserves cleanup: ${mode}`, async context => {
    const f = await fixture(context, mode);
    if (mode === "success") {
      const result = await f.prepare(); assert.equal(result["preparationPublished"], true); assert.equal(result["executionAuthorized"], false);
      assert.deepEqual(f.calls, ["prepared-after-intent", "reproof"]);
      assert.match(await readFile(join(f.directory, "worker-startup-footprint-preparation-result.json"), "utf8"), /"copyLaunchPurposeQualified":false/u);
    } else {
      const expected = { capacity: /FOOTPRINT_PREPARATION_CAPACITY/u, publication: /publication refusal/u, reproof: /original owner lost/u }[mode];
      await assert.rejects(f.prepare(), expected);
      assert.deepEqual(f.calls, mode === "capacity" ? [] : ["prepared-after-intent", "reproof"]);
      await assert.rejects(readFile(join(f.directory, "worker-startup-footprint-preparation-result.json")), { code: "ENOENT" });
    }
    await assert.rejects(f.prepare(), /WORKER_STARTUP_FOOTPRINT_PREPARATION_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["workerStartupFootprintPreparationAttemptConsumed"], true);
    assert.equal(inspection["workerStartupFootprintPreparationRetained"], mode !== "capacity");
    if (mode === "publication") {
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspection["intentSha256"] });
      assert.match(await readFile(join(f.directory, "worker-startup-footprint-preparation-result.json"), "utf8"), /"executionAuthorized":false/u);
      assert.deepEqual(f.calls, ["prepared-after-intent", "reproof"]);
    }
  });
}

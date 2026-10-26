/** Actual opening coordinator with inert constructor/actor boundaries. This
 * counts delegation, not native construction, checkpoint or source authority. */
/* oxlint-disable max-classes-per-file -- Two inert class boundaries exercise the actual opening coordinator and captured construction prototypes together. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import type { CurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import type { CurrentPcb209WorkerStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
// oxlint-disable-next-line import/max-dependencies -- The actual source coordinator and its typed boundaries are joined to the existing module-injection test pattern.
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";

void test("actual209 source delegates each reprove original project identity and assignments", async () => {
  const path = new URL("../src/current-pcb-209-worker-startup-opening.ts", import.meta.url);
  const actualRequire = createRequire(path), checks: string[] = [];
  const rawWindowsPath = String.raw`C:\Synthetic\source-delegates.eprj2`;
  const target = Object.freeze({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32),
    documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
  const identity = Object.freeze({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: "original-window" });
  const assignments = Object.freeze({ synthetic: "assignments" }), construction = Object.freeze({ synthetic: "construction" });
  const source = Object.freeze({ synthetic: "source" }), state = Object.freeze({ synthetic: "state" });
  const producers = Object.freeze({ synthetic: "producers" });
  const dependencies = Object.freeze({ synthetic: "dependencies" });
  const runner = Object.freeze({
    proveProjectIdentity: (): Promise<typeof identity> => Promise.resolve(identity),
    requireProjectIdentity: (packet: unknown, selected: unknown): Promise<void> => {
      assert.equal(packet, construction); assert.equal(selected, identity); checks.push("identity"); return Promise.resolve();
    },
    proveCurrentAssignments: (): Promise<typeof assignments> => Promise.resolve(assignments),
    requireCurrentAssignments: (packet: unknown, selected: unknown): Promise<void> => {
      assert.equal(packet, construction); assert.equal(selected, assignments); checks.push("assignments"); return Promise.resolve();
    },
    observeFootprintState: (): Promise<typeof state> => Promise.resolve(state),
    observeFootprintSource: (): Promise<typeof source> => Promise.resolve(source),
    requireFootprintSource: (): Promise<void> => Promise.resolve(),
  });
  class ProducerRunner {
    public observeFootprintProducers(selected: unknown, assigned: unknown, observed: unknown): Promise<typeof producers> {
      assert.equal(this, runner); assert.equal(selected, construction); assert.equal(assigned, assignments); assert.equal(observed, state);
      checks.push("producers-observe"); return Promise.resolve(producers);
    }
    public requireFootprintProducers(selected: unknown, assigned: unknown, observed: unknown, packet: unknown): Promise<void> {
      assert.equal(this, runner); assert.equal(selected, construction); assert.equal(assigned, assignments); assert.equal(observed, state);
      assert.equal(packet, producers); checks.push("producers-require"); return Promise.resolve();
    }
    public retainedFootprintProducers(): Readonly<Record<string, unknown>> { assert.equal(this, runner); return producers; }
    public observeFootprintDependencies(selected: unknown, assigned: unknown, observed: unknown, producerInput: unknown): Promise<typeof dependencies> {
      assert.equal(this, runner); assert.equal(selected, construction); assert.equal(assigned, assignments); assert.equal(observed, state);
      assert.equal(producerInput, producers); checks.push("dependencies-observe"); return Promise.resolve(dependencies);
    }
    public requireFootprintDependencies(selected: unknown, assigned: unknown, observed: unknown, producerInput: unknown, packet: unknown): Promise<void> {
      assert.equal(this, runner); assert.equal(selected, construction); assert.equal(assigned, assignments); assert.equal(observed, state);
      assert.equal(producerInput, producers); assert.equal(packet, dependencies); checks.push("dependencies-require"); return Promise.resolve();
    }
    public retainedFootprintDependencies(): Readonly<Record<string, unknown>> { assert.equal(this, runner); return dependencies; }
  }
  class Transport {
    readonly #packet = construction;
    #identityBound = false;
    #workersBound = false;
    public bindExpectedProject(selected: unknown): void { assert.deepEqual(selected, identity); this.#identityBound = true; }
    public bindExistingWorkers(selected: unknown): void { assert.deepEqual(selected, {}); this.#workersBound = true; }
    public capture(): Promise<typeof construction> { assert.ok(this.#identityBound && this.#workersBound); return Promise.resolve(this.#packet); }
    public whenArmed(): Promise<void> { assert.ok(this.#identityBound && this.#workersBound); return Promise.resolve(); }
    public requireOriginal(packet: unknown): Promise<typeof runner> { assert.equal(packet, this.#packet); return Promise.resolve(runner); }
  }
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-pcb-worker-construction-runner.ts") { return { CurrentPcb209WorkerConstructionRunner: ProducerRunner }; }
    if (specifier === "./current-pcb-worker-startup-transport.ts") { return { CurrentPcb209WorkerStartupTransport: Transport }; }
    if (specifier === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (): void => undefined };
    }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerStartupOpening"]; assert.ok(typeof Constructor === "function");
  const context = Object.freeze({ sessionId: "parent", uniqueContextId: "original-context" });
  const binding: CurrentPcbWorkerStartupOpeningBinding = Object.freeze({ context: () => context,
    reprove: (): Promise<void> => Promise.resolve(), begin: () => context, finish: (): void => undefined,
    observeParent: (): void => undefined, ancillaryFrame: (): null => null,
    observeAncillary: (): never => assert.fail("No ancillary observation belongs to this fixture"), ancillaryObservation: (): null => null });
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentSessionId: "parent", parentTargetId: "parent-target",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: (): never => assert.fail("Synthetic transport has no native subscription"),
    request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => {
      if (command.method === "Target.getTargets" || command.method === "Page.getFrameTree") { return Promise.resolve({}); }
      assert.equal(command.method, "Runtime.callFunctionOn"); assert.ok("uniqueContextId" in command.params);
      const phase = command.params.arguments[1]?.value; assert.ok(phase === "preflight" || phase === "open-project");
      const dispatched = phase === "open-project";
      return Promise.resolve({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-opening.v1",
        phase, projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
        ok: true, status: dispatched ? "opened-prefix-observed" : "ready", failure: null, cleanupFailure: null,
        dispatchAttempted: dispatched, publicResult: dispatched ? true : null, prefixObserved: dispatched, nativeWorkMayRemain: dispatched,
        observation: { projectPresent: dispatched, branchUuid: dispatched ? target.branchUuid : null, windowTabId: identity.windowTabId,
          containerCount: 1, tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA - V3.2.209",
          expectedOpenedTitle: "EasyEDA - V3.2.209", documentTitle: "EasyEDA - V3.2.209" } }) } });
    } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real source coordinator is instantiated with the two explicitly synthetic imported boundaries above.
  const owner = Reflect.construct(Constructor, [{ dependency, opening: binding, actorClockSourceQualification: {} }]) as CurrentPcb209WorkerStartupOpening;
  const opened = await owner.open(target, (): Promise<void> => Promise.resolve());
  const assigned = await owner.proveCurrentAssignments(opened), observed = await owner.observeFootprintState(opened, assigned);
  checks.length = 0;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The inert runner deliberately never interprets this plan; only the actual opening delegate's owner checks are under test.
  const plan = Object.freeze({}) as CurrentFootprintSourcePlan;
  const packet = await owner.observeFootprintSource(opened, assigned, observed, plan);
  assert.deepEqual(checks, ["identity", "assignments"]);
  await owner.requireFootprintSource(opened, assigned, observed, plan, packet);
  assert.deepEqual(checks, ["identity", "assignments", "identity", "assignments"]);
  checks.length = 0;
  const producerPacket = await owner.observeFootprintProducers(opened, assigned, observed);
  assert.deepEqual(checks, ["identity", "assignments", "producers-observe"]);
  assert.equal(owner.retainedFootprintProducers(), producers);
  await owner.requireFootprintProducers(opened, assigned, observed, producerPacket);
  assert.deepEqual(checks, ["identity", "assignments", "producers-observe", "identity", "assignments", "producers-require"]);
  await assert.rejects(owner.requireFootprintProducers(opened, assigned, observed, structuredClone(producerPacket)), /ORIGINAL_FOOTPRINT_PRODUCER_PACKET/u);
  await assert.rejects(owner.observeFootprintProducers(opened, assigned, observed), /FOOTPRINT_PRODUCER_CONSUMED/u);
  checks.length = 0;
  const dependencyPacket = await owner.observeFootprintDependencies(opened, assigned, observed, producerPacket);
  assert.deepEqual(checks, ["identity", "assignments", "dependencies-observe"]);
  assert.equal(owner.retainedFootprintDependencies(), dependencies);
  await owner.requireFootprintDependencies(opened, assigned, observed, producerPacket, dependencyPacket);
  assert.deepEqual(checks, ["identity", "assignments", "dependencies-observe", "identity", "assignments", "dependencies-require"]);
  await assert.rejects(owner.requireFootprintDependencies(opened, assigned, observed, producerPacket, structuredClone(dependencyPacket)), /ORIGINAL_FOOTPRINT_DEPENDENCY_PACKET/u);
  await assert.rejects(owner.observeFootprintDependencies(opened, assigned, observed, producerPacket), /FOOTPRINT_DEPENDENCY_CONSUMED/u);
  ProducerRunner.prototype.requireFootprintDependencies = (): never => assert.fail("A substituted dependency method must not execute");
  await assert.rejects(owner.requireFootprintDependencies(opened, assigned, observed, producerPacket, dependencyPacket), /FOOTPRINT_DEPENDENCY_METHOD_CHANGED/u);
  const before = checks.length;
  ProducerRunner.prototype.requireFootprintProducers = (): never => assert.fail("A substituted method must not execute");
  await assert.rejects(owner.requireFootprintProducers(opened, assigned, observed, producerPacket), /FOOTPRINT_PRODUCER_METHOD_CHANGED/u);
  assert.equal(checks.length, before);
});

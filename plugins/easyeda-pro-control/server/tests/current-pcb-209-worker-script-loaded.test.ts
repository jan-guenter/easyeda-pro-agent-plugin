import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbWorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import { bootstrapLifecycleFixture } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";
import type { BootstrapFixtureOptions } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";
import { workerStartupInspector } from "./helpers/current-pcb-worker-startup-inspector.ts";

void test("209 worker-loaded notification leaves the actual constructor runner pending until its nine V8 pauses", { timeout: 30_000 }, async context => {
  const inspector = await construction209Inspector(context);
  let observedBeforeConstruction = false;
  const value = await bootstrapLifecycleFixture({ loadedEvent: { role: "project" }, construction: {
    transport: inspector.transport, run: (): Promise<unknown> => {
      assert.equal(value.owner.status().workerScriptLoadedObserved, true);
      assert.equal(value.owner.status().settled, false);
      assert.deepEqual(inspector.counts(), { pauses: 0, resumes: 0 });
      observedBeforeConstruction = true;
      return inspector.run();
    },
  } });
  const packet = await value.owner.capture();
  assert.equal(observedBeforeConstruction, true);
  assert.equal(packet.pauses, 9); assert.equal(packet.executionAuthorized, false);
  assert.equal(packet.nativeStartupIntegrationVerified, false);
  assert.deepEqual(inspector.counts(), { pauses: 9, resumes: 9 });
  assert.equal(await inspector.completed(), true);
  assert.equal(value.owner.status().firstEventFailure, null);
  assert.equal(value.owner.status().workerScriptLoadedObserved, true);
  const runner = await value.owner.requireOriginal(packet); await runner.release(); await value.owner.cleanup();
  value.terminate(); await value.owner.releaseAfterTermination();
});

const refused: readonly Readonly<{ name: string; event: NonNullable<BootstrapFixtureOptions["loadedEvent"]>; observed: boolean }>[] = [
  { name: "before complete source qualification", event: { role: "bootstrap" }, observed: false },
  { name: "before the original project resume", event: { role: "project", beforeResume: true }, observed: false },
  { name: "with an extra parameter", event: { role: "project", params: { success: true } }, observed: false },
  { name: "twice", event: { role: "project", repeat: true }, observed: true },
  { name: "from the parent", event: { role: "project", sessionId: "parent-session" }, observed: false },
  { name: "from a foreign worker", event: { role: "project", sessionId: "foreign-worker" }, observed: false },
];
for (const sample of refused) {
  void test(`209 worker-loaded notification refuses ${sample.name} without completing construction`, { timeout: 30_000 }, async context => {
    const inspector = await construction209Inspector(context);
    // Keep execution at the loaded-event boundary. The real runner still owns
    // And removes its actual V8 breakpoints; no later constructor is invoked.
    const value = await bootstrapLifecycleFixture({ loadedEvent: sample.event, construction: {
      transport: inspector.transport, run: (): Promise<unknown> => Promise.resolve({}),
    } });
    await assert.rejects(value.owner.capture(), /EVENT|OWNER_LOST/u);
    assert.equal(value.owner.status().failed, true);
    assert.equal(value.owner.status().workerScriptLoadedObserved, sample.observed);
    assert.equal(value.owner.status().firstEventFailure?.method, "Inspector.workerScriptLoaded");
    const requests = value.commands.length; await value.owner.cleanup(); assert.equal(value.commands.length, requests);
    await assert.rejects(value.owner.capture(), /CONSUMED/u);
    value.terminate(); await value.owner.releaseAfterTermination();
  });
}

void test("legacy startup still refuses worker-loaded notification after actual constructor capture", { timeout: 30_000 }, async context => {
  const inspector = await workerStartupInspector(context);
  let listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  const owner = new CurrentPcbWorkerStartupTransport({ ...inspector.dependency,
    subscribe: (event): (() => void) => { listener = event; return inspector.dependency.subscribe(event); },
  }, inspector.profile);
  const packet = await owner.capture(); await inspector.completion;
  assert.ok(listener !== null);
  // The subscription is assigned by the actual asynchronous capture above.
  Reflect.apply(listener, undefined, [{ method: "Inspector.workerScriptLoaded", sessionId: "worker-session", params: {} }]);
  assert.equal(owner.status().failed, true); assert.equal(owner.status().workerScriptLoadedObserved, false);
  await assert.rejects(owner.requireOriginal(packet), /EVENT/u);
  await owner.cleanup(); await inspector.stopped(); await owner.releaseAfterTermination();
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY } from "../src/current-pcb-worker-construction-contract.ts";
import { CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

const EXPECTED = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window_1" });
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original awaited operation retains its own failure.
  }
}
void test("actual constructor-captured project identity is original, reobserved and invalidated on selected branch drift", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); void observe(capture);
  await runner.whenArmed(); const running = fixture.run(); void observe(running);
  const packet = await capture; await running;
  // Fixture constructors are inert excerpts. Populate only synthetic identity
  // Fields after their construction, as the later project initialization does.
  await fixture.syntheticEvaluate(`PROJECT.uuid=${JSON.stringify(EXPECTED.projectUuid)};PROJECT._branchUuid=${JSON.stringify(EXPECTED.branchUuid)};globalThis._TAB_ID_="window_1"`);
  const identity = await runner.proveProjectIdentity(packet);
  assert.deepEqual(identity, EXPECTED); assert.equal(Object.isFrozen(identity), true);
  await assert.rejects(runner.proveProjectIdentity(packet), /PROJECT_IDENTITY_CONSUMED/u);
  await assert.rejects(runner.requireProjectIdentity(packet, { ...identity }), /ORIGINAL_PROJECT_IDENTITY/u);
  await runner.requireProjectIdentity(packet, identity);
  await fixture.syntheticEvaluate(`PROJECT._branchUuid=${JSON.stringify("c".repeat(32))}`);
  await assert.rejects(runner.requireProjectIdentity(packet, identity), /PROJECT_IDENTITY_CHANGED/u);
  assert.equal(runner.status().failed, true); await runner.release();
});

void test("matching fields on a replacement PROJECT cannot replace the constructor-captured receiver", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); void observe(capture);
  await runner.whenArmed(); const running = fixture.run(); void observe(running);
  const packet = await capture; await running;
  await fixture.syntheticEvaluate(`PROJECT.uuid=${JSON.stringify(EXPECTED.projectUuid)};PROJECT._branchUuid=${JSON.stringify(EXPECTED.branchUuid)};globalThis._TAB_ID_="window_1";globalThis.PROJECT={...PROJECT}`);
  await assert.rejects(runner.proveProjectIdentity(packet));
  assert.equal(runner.status().failed, true); await runner.release();
});

void test("identity program refuses missing, accessor and malformed fields without invoking accessors", () => {
  let getterCalls = 0;
  const getter = (): string => { getterCalls += 1; return "private"; };
  for (const field of ["uuid", "_branchUuid"] as const) {
    const bus = {}, project = { uuid: EXPECTED.projectUuid, _branchUuid: EXPECTED.branchUuid, workerBus: bus };
    Object.defineProperty(project, field, { get: getter });
    assert.throws(() => runInNewContext(`(${CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY}).call(PROJECT,bus)`,
      { PROJECT: project, bus, _TAB_ID_: EXPECTED.windowTabId }), /WORKER_CONSTRUCTION_IDENTITY/u);
  }
  assert.equal(getterCalls, 0);
  for (const windowTabId of [undefined, null, "", "window\n", "a".repeat(129)]) {
    const bus = {}, project = { uuid: EXPECTED.projectUuid, _branchUuid: EXPECTED.branchUuid, workerBus: bus };
    assert.throws(() => runInNewContext(`(${CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY}).call(PROJECT,bus)`,
      { PROJECT: project, bus, _TAB_ID_: windowTabId }), /WORKER_CONSTRUCTION_IDENTITY/u);
  }
});

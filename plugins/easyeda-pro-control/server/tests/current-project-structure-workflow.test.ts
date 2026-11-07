/** Coordinator-only external seams. These tests exercise the actual workflow
 * while replacing observer transports, never asserting native ownership. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentProjectStructureObservationWorkflow } from "../src/current-project-structure-observation-workflow.ts";

/** Keep the real coordinator's private fields and result registry. Only this
 * isolated test's original-owner and observer boundaries are synthetic. */
async function fixture(failed: "worker" | "main" | null): Promise<Readonly<{
  workflow: CurrentProjectStructureObservationWorkflow; first: Error; settlePeer: () => void;
  state: { mainCancelled: boolean; workerCancelled: boolean; mainCleaned: boolean; workerCleaned: boolean; held: boolean };
  requireJoined: (value: unknown) => unknown;
}>> {
  const first = new Error("first original observer failure"), late = Promise.withResolvers<never>();
  const state = { mainCancelled: false, workerCancelled: false, mainCleaned: false, workerCleaned: false, held: true };
  const plan = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 101, structureText: "complete frozen tree" });
  const target = Object.freeze({ ...plan, rawWindowsPath: "C:\\Synthetic\\fixture.eprj2" });
  const mainLease = Object.freeze({ syntheticMainLease: true }), owner = Object.freeze({ syntheticOwnerBoundary: true }), workerLease = Object.freeze({ syntheticWorkerLease: true });
  const mainPacket = Object.freeze({ ...plan, projectPath: target.rawWindowsPath }), workerPacket = Object.freeze({ ...plan });
  const capability = Object.freeze({ syntheticCapability: true }), construction = Object.freeze({ syntheticConstruction: true });
  const main = Object.freeze({ issueStructureLease: (actualCapability: unknown, actualConstruction: unknown): Promise<object> => {
    assert.equal(actualCapability, capability); assert.equal(actualConstruction, construction); return Promise.resolve(mainLease);
  } });
  const input = Object.freeze({ main, target, construction, capability });
  class Observer {
    readonly #kind: "main" | "worker";
    public constructor(lease: unknown, value?: unknown) {
      if (lease === mainLease) { this.#kind = "main"; assert.deepEqual(value, plan); }
      else { assert.equal(lease, workerLease); this.#kind = "worker"; }
    }
    public arm(): Promise<void> { assert.ok(this.#kind.length > 0); return Promise.resolve(); }
    public observation(): Promise<object> {
      if (failed === this.#kind) { return Promise.reject(first); }
      return failed === null ? Promise.resolve(this.#kind === "main" ? mainPacket : workerPacket) : late.promise;
    }
    public cancel(): void { if (this.#kind === "main") { state.mainCancelled = true; } else { state.workerCancelled = true; } }
    public cleanup(): Promise<void> { if (this.#kind === "main") { state.mainCleaned = true; } else { state.workerCleaned = true; } return Promise.resolve(); }
    public release(): Promise<void> { assert.equal(this.#kind, "main"); state.held = false; return Promise.resolve(); }
  }
  const path = new URL("../src/current-project-structure-observation-workflow.ts", import.meta.url), sourceRequire = createRequire(path);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const run: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof run === "function");
  Reflect.apply(run, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { requireOriginalProjectStructureObservationInput: (actual: unknown, lease: unknown): object => {
      assert.equal(actual, owner); assert.equal(lease, workerLease); return input;
    } }; }
    if (name === "./current-project-structure-worker-observer.ts") { return { CurrentProjectStructureWorkerObserver: Observer,
      requireCurrentProjectStructureWorkerObservation: (packet: unknown): object => { assert.equal(packet, workerPacket); return { lease: workerLease }; } }; }
    if (name === "./current-project-structure-main-observer.ts") { return { CurrentProjectStructureMainObserver: Observer,
      requireCurrentProjectStructureMainObservation: (packet: unknown): object => {
        assert.equal(packet, mainPacket); if (!state.held) { throw new Error("MAIN_LEASE_RELEASED"); } return { issuer: main };
      } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentProjectStructureObservationWorkflow"], requireJoined = loaded.exports["requireCurrentProjectStructureJoinedObservation"];
  assert.ok(typeof Constructor === "function" && typeof requireJoined === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked maintained coordinator receives only explicitly synthetic boundary objects in this isolated orchestration test.
  const workflow = Reflect.construct(Constructor, [owner, workerLease, plan]) as CurrentProjectStructureObservationWorkflow;
  return { workflow, first, state, settlePeer: (): void => { late.reject(new Error("original peer request settled after cancellation")); },
    requireJoined: (value: unknown): unknown => Reflect.apply(requireJoined, undefined, [value]) as unknown };
}

for (const failed of ["worker", "main"] as const) {
  void test(`first ${failed} failure cancels its peer and retains the original pending request through settlement`, async () => {
    const f = await fixture(failed); await f.workflow.arm();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The assertion predicate checks exact preservation of the first failure while the peer's original request remains pending.
    const pending = assert.rejects(f.workflow.observation(), (error: unknown): boolean => { assert.equal(error, f.first); return true; });
    await nextTurn(); assert.equal(f.state.mainCancelled, true); assert.equal(f.state.workerCancelled, true);
    await assert.rejects(f.workflow.cleanup(), /CLEANUP_STATE/u); assert.equal(f.state.mainCleaned, false); assert.equal(f.state.workerCleaned, false);
    f.settlePeer(); await pending;
    await f.workflow.cleanup(); assert.equal(f.state.mainCleaned, true); assert.equal(f.state.workerCleaned, true); await f.workflow.release();
    await assert.rejects(f.workflow.arm());
  });
}
void test("joined observation retains live custody through cleanup and becomes historical after intended release", async () => {
  const f = await fixture(null); await f.workflow.arm(); const result = await f.workflow.observation();
  assert.equal(result.executionAuthorized, false); assert.equal(result.completeSqlEffectVerified, false);
  f.requireJoined(result); await f.workflow.cleanup(); f.requireJoined(result); await f.workflow.release();
  assert.throws(() => f.requireJoined(result), /MAIN_LEASE_RELEASED/u);
  assert.equal(Object.isFrozen(result), true); assert.equal(result.structureText, "complete frozen tree");
  assert.throws(() => f.requireJoined({ ...result }), /ORIGINAL_RESULT/u);
});

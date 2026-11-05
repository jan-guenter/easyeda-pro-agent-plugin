/** Original synthetic V8 constructor/closure events. The dedicated native
 * marker is an explicit external seam; these tests grant no native authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInNewContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COLD_PRODUCER_CALLS as CALLS, CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS } from "../src/current-footprint-cold-producer-roster.ts";
import type { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK } from "../src/current-pcb-worker-construction-assignment.ts";
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

/** Use the real construction core and inspector with only the purpose marker
 * replaced. The actual native-marker tests separately reject supplied owners. */
async function original(context: TestContext, warm: "task" | "publish" | null): Promise<Readonly<{
  fixture: Awaited<ReturnType<typeof construction209Inspector>>;
  runner: CurrentPcb209WorkerConstructionRunner; coldRequests: () => number;
}>> {
  const fixture = await construction209Inspector(context);
  const path = new URL("../src/current-pcb-worker-construction-runner.ts", import.meta.url), sourceRequire = createRequire(path);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const run: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof run === "function");
  Reflect.apply(run, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name !== "./current-footprint-copy-construction-purpose.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, isOriginalProjectStructureConstructionTransport: (): boolean => true };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerConstructionRunner"]; assert.ok(typeof Constructor === "function");
  let cold = false, requests = 0;
  const transport = { ...fixture.transport, request: async (command: Parameters<typeof fixture.transport.request>[0]): Promise<unknown> => {
    if (command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CALLS.project) {
      cold = true;
      if (warm !== null) { await fixture.syntheticEvaluate(warm === "task" ? "PROJECT.task1.add(Promise.resolve());true" : "PROJECT.publishTimer=31;true"); }
    }
    if (cold) { requests += 1; }
    const result = await fixture.transport.request(command);
    if (cold && command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK) { cold = false; }
    return result;
  } };
  const created: unknown = Reflect.construct(Constructor, [transport]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained constructor is loaded with only its explicitly synthetic native marker; every constructor event and scope comes from this inert original V8 process.
  const runner = created as CurrentPcb209WorkerConstructionRunner;
  return { fixture, runner, coldRequests: (): number => requests };
}

void test("cold bootstrap captures real serial/debounce/buffer/cooperation scopes before RPC registration", { timeout: 30_000 }, async context => {
  const f = await original(context, null); const capture = f.runner.capture(); await f.runner.whenArmed();
  const running = f.fixture.run(); const packet = await capture; await running;
  assert.equal(f.coldRequests(), CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS);
  const roster = await f.runner.originalColdProducerRoster(packet);
  assert.equal(roster.originalBootstrapBeforeRpcRegistrationObserved, true);
  assert.equal(roster.completeUploadFrontierVerified, false); assert.equal(roster.detachedCacheAndRetryOutcomesVerified, false);
  assert.equal(roster.executionAuthorized, false); assert.equal(Object.isFrozen(roster), true);
  await assert.rejects(f.runner.originalColdProducerRoster({ ...packet }), /ORIGINAL_PACKET/u);
  assert.equal(await f.runner.originalColdProducerRoster(packet), roster);
  await f.runner.release(); await assert.rejects(f.runner.originalColdProducerRoster(packet), /RELEASED/u);
});
for (const warm of ["task", "publish"] as const) { void test(`existing ${warm} work at original bootstrap refuses and settles the original paused constructor`, { timeout: 30_000 }, async context => {
  const f = await original(context, warm); const capture = f.runner.capture(); await f.runner.whenArmed();
  const running = f.fixture.run(); await assert.rejects(capture); await running;
  assert.equal(f.runner.status().failed, true); assert.equal(f.fixture.counts().pauses, f.fixture.counts().resumes);
  const commands = f.fixture.commands.length; await assert.rejects(f.runner.capture()); assert.equal(f.fixture.commands.length, commands);
  await f.runner.release();
}); }
void test("cold descriptor reads refuse an accessor without invoking its hook", () => {
  const context = { calls: 0 };
  assert.throws(() => { runInNewContext(`globalThis.PROJECT={get task1(){calls++;return new Set}};(${CALLS.project}).call(PROJECT);`, context); }, /FOOTPRINT_COLD_PRODUCER/u);
  assert.equal(context.calls, 0);
});

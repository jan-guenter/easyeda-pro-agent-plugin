/** Original synthetic V8 constructor/closure events. The dedicated native
 * marker is an explicit external seam; these tests grant no native authority. */
/* oxlint-disable import/max-dependencies -- Keep the genuine construction and observer registries linked while comparing independent fixed source, native grammar and original inert V8 events. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { runInNewContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COLD_PRODUCER_CALLS as CALLS, CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS } from "../src/current-footprint-cold-producer-roster.ts";
import type { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import type { CurrentFootprintDetachedCacheObservation } from "../src/current-footprint-detached-cache-observer.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK } from "../src/current-pcb-worker-construction-assignment.ts";
import { CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS as DETACHED, CURRENT_FOOTPRINT_DETACHED_CACHE_SITES as DETACHED_SITES } from "../src/current-footprint-detached-cache-profile.ts";
import { detachedCacheConstructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

/** Use the real construction core and inspector with only the purpose marker
 * replaced. The actual native-marker tests separately reject supplied owners. */
async function original(context: TestContext, warm: "task" | "publish" | null,
  late?: Readonly<{ arrived: () => void; release: Promise<null> }>): Promise<Readonly<{
  fixture: Awaited<ReturnType<typeof detachedCacheConstructionInspector>>;
  runner: CurrentPcb209WorkerConstructionRunner; coldRequests: () => number;
  entry: Promise<null>; requireDetached: (result: unknown) => Promise<void>;
}>> {
  const fixture = await detachedCacheConstructionInspector(context);
  const path = new URL("../src/current-pcb-worker-construction-runner.ts", import.meta.url), sourceRequire = createRequire(path);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const observerPath = new URL("../src/current-footprint-detached-cache-observer.ts", import.meta.url);
  const observerCompiled = await transform(await readFile(observerPath, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const observer: { exports: Record<string, unknown> } = { exports: {} };
  const observerRun: unknown = runInThisContext(`(function(require,module,exports){${observerCompiled.code}\n})`); assert.ok(typeof observerRun === "function");
  Reflect.apply(observerRun, undefined, [(name: string): unknown => {
    if (name !== "./current-footprint-detached-cache-lease.ts") { return sourceRequire(name) as unknown; }
    return { requireCurrentFootprintDetachedCacheLease: (lease: unknown): unknown => {
      const lookup = loaded.exports["requireCurrentFootprintDetachedCacheLease"]; assert.ok(typeof lookup === "function"); return Reflect.apply(lookup, undefined, [lease]) as unknown;
    } };
  }, observer, observer.exports]);
  const run: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof run === "function");
  Reflect.apply(run, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-detached-cache-observer.ts") { return observer.exports; }
    const actual: unknown = sourceRequire(name);
    if (name !== "./current-footprint-copy-construction-purpose.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, isOriginalProjectStructureConstructionTransport: (): boolean => true };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerConstructionRunner"]; assert.ok(typeof Constructor === "function");
  let cold = false, delayed = false, maintenance = false, requests = 0;
  const entry = Promise.withResolvers<null>();
  const transport = { ...fixture.transport, request: async (command: Parameters<typeof fixture.transport.request>[0]): Promise<unknown> => {
    if (command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CALLS.project) {
      cold = true;
      if (warm !== null) { await fixture.syntheticEvaluate(warm === "task" ? "PROJECT.task1.add(Promise.resolve());true" : "PROJECT.publishTimer=31;true"); }
    }
    if (cold) { requests += 1; }
    const result = await fixture.transport.request(command);
    if (late !== undefined && !delayed && command.method === "Debugger.setBreakpoint" && command.params.location.columnNumber === DETACHED_SITES.entry.columnNumber) {
      delayed = true; late.arrived(); await late.release;
    }
    if (cold && command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK) { cold = false; }
    if (command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === DETACHED.admit) { maintenance = true; }
    else if (maintenance && command.method === "Debugger.resume") { entry.resolve(null); }
    return result;
  } };
  const created: unknown = Reflect.construct(Constructor, [transport]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained constructor is loaded with only its explicitly synthetic native marker; every constructor event and scope comes from this inert original V8 process.
  const runner = created as CurrentPcb209WorkerConstructionRunner;
  return { fixture, runner, coldRequests: (): number => requests, entry: entry.promise,
    requireDetached: async (result: unknown): Promise<void> => {
      const lookup = observer.exports["requireCurrentFootprintDetachedCacheObservation"]; assert.ok(typeof lookup === "function");
      const pending: unknown = Reflect.apply(lookup, undefined, [result]); assert.ok(pending instanceof Promise); await pending;
    } };
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

/** Synthetic Cache methods deliberately retain their original pending Promise;
 * the exact vendor IIFE must await both before its actual normal-return pause. */
async function prepareMaintenance(f: Awaited<ReturnType<typeof original>>): Promise<void> {
  await f.fixture.syntheticEvaluate(`globalThis.SYNTHETIC_PUT=Promise.withResolvers();globalThis.SYNTHETIC_DELETE=Promise.withResolvers();globalThis.SYNTHETIC_PENDING=new Map([["first","data"]]);globalThis.SYNTHETIC_BATCH={url:["first"],data:["data"]};globalThis.SYNTHETIC_RESPONSE={success:true,result:"original-result"};globalThis.cg=value=>value;PROJECT.branchUuid="${"b".repeat(32)}";PROJECT.localCache={put:async()=>{await SYNTHETIC_PUT.promise;},delete:async()=>{await SYNTHETIC_DELETE.promise;return true;}};`);
}
void test("dropped maintenance completion waits its original put and delete, then closes live custody at cleanup", { timeout: 30_000 }, async context => {
  const f = await original(context, null); const capture = f.runner.capture(); await f.runner.whenArmed();
  const running = f.fixture.run(); const packet = await capture; await running; await prepareMaintenance(f);
  const triggered = f.fixture.syntheticEvaluate("PROJECT.syntheticMaintenance();true"); await f.entry; await triggered;
  let completed = false;
  const pending = (async (): Promise<CurrentFootprintDetachedCacheObservation> => { const result = await f.runner.closeOriginalDetachedCacheProducer(packet); completed = true; return result; })();
  await nextTurn(); assert.equal(completed, false);
  await f.fixture.syntheticEvaluate("SYNTHETIC_PUT.resolve();true"); await nextTurn(); assert.equal(completed, false);
  await f.fixture.syntheticEvaluate("SYNTHETIC_DELETE.resolve();true");
  const result = await pending; assert.equal(result.entered, 1); assert.equal(result.returned, 1);
  assert.equal(result.headIndexCachePutCompletionVerified, false); assert.equal(result.completeUploadFrontierVerified, false); assert.equal(result.executionAuthorized, false);
  await f.requireDetached(result); await assert.rejects(f.requireDetached({ ...result }));
  await assert.rejects(f.runner.closeOriginalDetachedCacheProducer(packet));
  await f.runner.release(); await assert.rejects(f.requireDetached(result));
});
void test("changed original response before the detached return refuses completion and retains the original cleanup pause", { timeout: 30_000 }, async context => {
  const f = await original(context, null); const capture = f.runner.capture(); await f.runner.whenArmed();
  const running = f.fixture.run(); const packet = await capture; await running; await prepareMaintenance(f);
  const triggered = f.fixture.syntheticEvaluate("PROJECT.syntheticMaintenance();true"); await f.entry; await triggered;
  const pending = assert.rejects(f.runner.closeOriginalDetachedCacheProducer(packet));
  await f.fixture.syntheticEvaluate("SYNTHETIC_RESPONSE.success=false;SYNTHETIC_PUT.resolve();SYNTHETIC_DELETE.resolve();true"); await pending;
  assert.equal(f.runner.status().failed, true); const resumes = f.fixture.counts().resumes;
  await f.runner.release(); assert.equal(f.fixture.counts().resumes, resumes + 1);
});
void test("late original detached breakpoint allocation remains retained without retry until cleanup can remove that same ID", { timeout: 30_000 }, async context => {
  const arrived = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  const f = await original(context, null, { arrived: (): void => { arrived.resolve(null); }, release: release.promise });
  const capture = f.runner.capture(); await f.runner.whenArmed(); const running = f.fixture.run();
  const refused = assert.rejects(capture); await arrived.promise; await refused; await running;
  const allocations = f.fixture.commands.filter(command => command === "Debugger.setBreakpoint").length;
  await assert.rejects(f.runner.release()); release.resolve(null); await nextTurn();
  await f.runner.release(); assert.equal(f.fixture.commands.filter(command => command === "Debugger.setBreakpoint").length, allocations);
});
void test("a post-close maintenance entry stays stopped before its first cache write and cleanup cannot resume it", { timeout: 30_000 }, async context => {
  const f = await original(context, null); const capture = f.runner.capture(); await f.runner.whenArmed();
  const running = f.fixture.run(); const packet = await capture; await running; await prepareMaintenance(f);
  await f.fixture.syntheticEvaluate("globalThis.SYNTHETIC_CACHE_CALLED=false;PROJECT.localCache.put=async()=>{SYNTHETIC_CACHE_CALLED=true;};true");
  const result = await f.runner.closeOriginalDetachedCacheProducer(packet); assert.equal(result.entered, 0);
  const paused = Promise.withResolvers<null>();
  const location = z.looseObject({ columnNumber: z.number() });
  const frame = z.looseObject({ location });
  const event = z.looseObject({ callFrames: z.array(frame).min(1) });
  const unsubscribe = f.fixture.transport.subscribe({ paused: (input: unknown): void => {
    const value = event.parse(input);
    if (value.callFrames[0]?.location.columnNumber === DETACHED_SITES.entry.columnNumber) { paused.resolve(null); }
  }, resumed: (): void => {
    // Only the original stopped entry is awaited.
  }, lost: (): void => {
    // The fixture owns its independent teardown.
  } });
  await f.fixture.syntheticEvaluate("setTimeout(()=>{PROJECT.syntheticMaintenance()},0);true"); await paused.promise; await nextTurn();
  const resumes = f.fixture.counts().resumes; await assert.rejects(f.runner.release());
  assert.equal(f.fixture.counts().resumes, resumes); await assert.rejects(f.requireDetached(result));
  const value = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(false) }).strict() }).strict()
    .parse(await f.fixture.syntheticEvaluate("SYNTHETIC_CACHE_CALLED")); assert.equal(value.result.value, false); unsubscribe();
});

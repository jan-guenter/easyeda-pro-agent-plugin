/** Actual original setup scheduling with explicit inert issuer seams. No native
 * owner, worker, setter, Save or completed SQL proof is created by this test. */
/* oxlint-disable eslint/max-classes-per-file -- Distinct inert observer classes replace their separate native modules while the maintained group runs unchanged. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { GeneratedSchematicDisplayDispatch } from "../src/generated-schematic-display-journal.ts";
import { CurrentSchematicDisplayWriteObservers } from "../src/current-schematic-display-write-observers.ts";

async function fixture(): Promise<Readonly<{ group: CurrentSchematicDisplayWriteObservers; calls: string[]; dispatch: GeneratedSchematicDisplayDispatch;
  birth: () => Promise<void>; exit: () => void; sameOwner: () => unknown; copiedArguments: () => unknown }>> {
  const calls: string[] = []; const prepared = Object.freeze({ inertPrepared: true }); const args = Object.freeze({ inertArguments: true }); const dispatch = Object.freeze({ profile: "private.generated-schematic-display-dispatch.v1" as const });
  const callbacks: ((origin: object) => Promise<void>)[] = []; const pending = Promise.withResolvers<never>(); let cache = false, exited = false, sync = false;
  const packet = Object.freeze({ inertAccessor: true }); const origin = Object.freeze({ inertMain: true }); const event0 = Object.freeze({ role: "headEntry" }), event1 = Object.freeze({ role: "syncEntry" });
  const events: object[] = [event0, event1];
  const owner = Object.freeze({
    armSchematicDisplaySaveWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { assert.equal(_args, args); calls.push("save-arm"); callbacks.push(setup); },
    armSchematicDisplaySaveStructureWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { assert.equal(_args, args); calls.push("structure-arm"); callbacks.push(setup); },
    armSchematicDisplayStructureTransportWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { assert.equal(_args, args); calls.push("transport-arm"); callbacks.push(setup); },
    armSchematicDisplayProducerPrefixWorker: (_args: unknown): void => { assert.equal(_args, args); calls.push("guard-arm"); },
    armSchematicDisplayProducerObservationWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { assert.equal(_args, args); calls.push("producer-arm"); callbacks.push(setup); },
    createSchematicDisplayAccessorOrigin: async (_args: unknown, setup: (origin: object) => Promise<void>): Promise<object> => { assert.equal(_args, args); calls.push("accessor-origin"); await setup({}); return {}; },
    enrollSchematicDisplayProducerPrefix: (_args: unknown): Promise<object> => { assert.equal(_args, args); assert.ok(cache && sync); calls.push("original-prefix"); return Promise.resolve({}); },
    prepareSchematicDisplayPreModifyMain: (_args: unknown, marker: unknown): Promise<object> => { assert.equal(_args, args); assert.equal(marker, dispatch); calls.push("original-main"); return Promise.resolve(origin); },
  });
  /* oxlint-disable eslint/class-methods-use-this -- Inert classes deliberately provide no production private authority. */
  class Save { public arm(): Promise<void> { calls.push("save-source-armed"); return Promise.resolve(); } }
  class Structure { public arm(): Promise<void> { calls.push("structure-source-armed"); return Promise.resolve(); } public observeConstruction(): Promise<void> { calls.push("original-construction"); return Promise.resolve(); } }
  class Transport { public arm(): Promise<void> { calls.push("transport-source-armed"); return Promise.resolve(); } }
  class Producer {
    public arm(): Promise<void> { calls.push("producer-source-armed"); return Promise.resolve(); }
    public startupProgress(): object { return { initialCache: { completed: cache }, initialSync: { completed: sync }, periodicSync: { active: false } }; }
    public observeHeldCall(): Promise<object> { calls.push("original-producer-read"); const next = events.shift(); return next === undefined ? pending.promise : Promise.resolve(next); }
    public continueInitialCacheCall(value: unknown): Promise<void> { assert.equal(value, event0); calls.push("original-cache"); cache = true; return Promise.resolve(); }
    public continueInitialSyncCall(value: unknown): Promise<void> { assert.equal(value, event1); calls.push("original-sync"); sync = true; return Promise.resolve(); }
  }
  class Accessor { public observe(): Promise<object> { calls.push("original-accessor"); return Promise.resolve(packet); } public requireData(value: unknown, actual: unknown, input: unknown): void { assert.equal(value, packet); assert.equal(actual, owner); assert.equal(input, args); } }
  /* oxlint-enable eslint/class-methods-use-this */
  const replacements: Readonly<Record<string, unknown>> = {
    "./current-schematic-display-write-owner.ts": {
      assertOriginalCurrentSchematicDisplayWriteOwner: (actual: unknown): void => { assert.equal(actual, owner); }, originalCurrentSchematicDisplayWriteTarget: (): object => prepared,
      originalCurrentSchematicDisplayWriteTermination: (): object => { assert.ok(exited); return {}; },
      requireOriginalCurrentSchematicDisplayPreModifyMainOrigin: (actual: unknown, o: unknown, a: unknown): object => { assert.equal(actual, origin); assert.equal(o, owner); assert.equal(a, args); return { assertCurrent: (): Promise<void> => Promise.resolve() }; },
    },
    "./generated-schematic-display-source.ts": { requireOriginalGeneratedSchematicDisplayNativeArguments: (a: unknown, p: unknown): void => { assert.equal(a, args); assert.equal(p, prepared); } },
    "./current-schematic-display-save-observer.ts": { CurrentSchematicDisplaySaveObserver: Save },
    "./current-project-save-structure-observer.ts": { CurrentProjectSaveStructureObserver: Structure },
    "./current-project-structure-transport-observer.ts": { CurrentProjectStructureTransportObserver: Transport },
    "./current-project-save-producer-observer.ts": { CurrentProjectSaveProducerObserver: Producer, requireOriginalCurrentProjectSaveProducerHeldCall: (value: unknown): unknown => { assert.ok(value === event0 || value === event1); return value; } },
    "./current-schematic-display-accessor-observer.ts": { CurrentSchematicDisplayAccessorObserver: Accessor },
  };
  const url = new URL("../src/current-schematic-display-write-observers.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements[name] ?? sourceRequire(name), loaded, loaded.exports]); const Constructor = loaded.exports["CurrentSchematicDisplayWriteObservers"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only explicit inert original-owner/observer modules differ; production group private scheduling and consumption remain unchanged.
  const group = Reflect.construct(Constructor, [owner, args]) as CurrentSchematicDisplayWriteObservers;
  return { group, calls, dispatch, birth: async (): Promise<void> => { for (const setup of callbacks) { await setup({}); } }, exit: (): void => { exited = true; pending.reject(new Error("original inert generation exited")); },
    sameOwner: (): unknown => Reflect.construct(Constructor, [owner, args]), copiedArguments: (): unknown => Reflect.construct(Constructor, [owner, { ...args }]) };
}
void test("equal-looking arguments or another group cannot acquire original SCH observer custody", async () => {
  assert.throws(() => Reflect.construct(CurrentSchematicDisplayWriteObservers, [{}, {}]), /SCHEMATIC_DISPLAY_ORIGINAL_FACTORY/u);
  const f = await fixture(); assert.throws(f.sameOwner, /OWNER_CONSUMED/u); assert.throws(f.copiedArguments); assert.deepEqual(f.calls, []);
});
void test("original startup, accessors and published-intent Main setup precede any future modification", async () => {
  const f = await fixture(); f.group.armBeforeNavigation(); assert.deepEqual(f.calls, ["save-arm", "structure-arm", "transport-arm", "guard-arm", "producer-arm"]);
  await f.birth(); await f.group.waitForStartupObservations(); assert.ok(f.calls.indexOf("original-construction") < f.calls.indexOf("original-cache"));
  await f.group.observeAccessors();
  // The dispatch is an explicit inert marker in this fixture; no production
  // Journal token or native action is created.
  await f.group.prepareModification(f.dispatch); await f.group.requirePrepared(f.dispatch);
  assert.ok(f.calls.indexOf("original-accessor") < f.calls.indexOf("original-prefix")); assert.ok(f.calls.indexOf("original-prefix") < f.calls.indexOf("original-main"));
  assert.equal(f.group.status().modifyAuthorized, false); assert.equal(f.group.status().saveAuthorized, false);
  assert.equal(f.group.status().pendingOriginalProducerRead, true); f.exit(); await f.group.settleOriginalCallsAfterExit();
});
void test("cancellation retains the original pending read until original exit without another poll", async () => {
  const f = await fixture(); f.group.armBeforeNavigation(); await f.birth(); await f.group.waitForStartupObservations();
  const reads = f.calls.filter(value => value === "original-producer-read").length; f.group.cancel();
  await assert.rejects(f.group.waitForStartupObservations(), /SETUP_CANCELLED/u); await assert.rejects(f.group.settleOriginalCallsAfterExit());
  f.exit(); await f.group.settleOriginalCallsAfterExit(); assert.equal(f.calls.filter(value => value === "original-producer-read").length, reads);
});

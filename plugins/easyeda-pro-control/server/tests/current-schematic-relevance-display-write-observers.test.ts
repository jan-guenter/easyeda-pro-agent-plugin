/** Synthetic original-registry seam exercises only retained scheduling. No
 * production checkpoint, native owner, application call or permission is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CurrentSchematicRelevanceDisplayWriteObservers } from "../src/current-schematic-relevance-display-write-observers.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

function armOnly(): object { return { arm: (): Promise<void> => Promise.resolve() }; }
async function fixture(): Promise<Readonly<{ group: CurrentSchematicRelevanceDisplayWriteObservers; construction: PromiseWithResolvers<true>; packet: PromiseWithResolvers<object>; producer: PromiseWithResolvers<object>; exit: () => void; calls: string[]; setups: Promise<unknown>[] }>> {
  const construction = Promise.withResolvers<true>(), packet = Promise.withResolvers<object>(), producer = Promise.withResolvers<object>();
  const calls: string[] = [], setups: Promise<unknown>[] = []; let exited = false;
  const owner = Object.freeze({
    armSchematicDisplaySaveWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { setups.push(setup(Object.freeze({}))); },
    armSchematicDisplaySaveStructureWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { setups.push(setup(Object.freeze({}))); },
    armSchematicDisplayStructureTransportWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { setups.push(setup(Object.freeze({}))); },
    armSchematicDisplayProducerPrefixWorker: (): void => { calls.push("prefix-arm"); },
    armSchematicDisplayProducerObservationWorker: (_args: unknown, setup: (origin: object) => Promise<void>): void => { setups.push(setup(Object.freeze({}))); }
  });
  const args = Object.freeze({}), prepared = Object.freeze({});
  function structure(): object { return { ...armOnly(),
    observeConstruction: (): Promise<true> => { calls.push("construction"); return construction.promise; },
    observePacket: (): Promise<object> => { calls.push("packet-read"); return packet.promise; }
  }; }
  function producerObserver(): object { return { ...armOnly(), startupProgress: (): object => ({}),
    observeHeldCall: (): Promise<object> => { calls.push("producer-read"); return producer.promise; }
  }; }
  const loaded = await loadSyntheticRegistryModule(new URL("../src/current-schematic-relevance-display-write-observers.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-schematic-relevance-display-write-owner.ts") { return { ...actual,
      assertOriginalCurrentSchematicRelevanceDisplayWriteOwner: (value: unknown): void => { assert.equal(value, owner); },
      originalCurrentSchematicRelevanceDisplayWriteTarget: (value: unknown): object => { assert.equal(value, owner); return prepared; },
      originalCurrentSchematicRelevanceDisplayWriteTermination: (value: unknown): object => { assert.equal(value, owner); assert.equal(exited, true); return Object.freeze({}); }
    }; }
    if (name === "./generated-schematic-relevance-display-source.ts") { return { ...actual,
      requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, target: unknown): void => { assert.equal(value, args); assert.equal(target, prepared); }
    }; }
    if (name === "./current-schematic-relevance-display-save-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplaySaveObserver: armOnly }; }
    if (name === "./current-project-save-structure-observer.ts") { return { ...actual, CurrentProjectSaveStructureObserver: structure }; }
    if (name === "./current-project-structure-transport-observer.ts") { return { ...actual, CurrentProjectStructureTransportObserver: armOnly }; }
    if (name === "./current-project-save-producer-observer.ts") { return { ...actual, CurrentProjectSaveProducerObserver: producerObserver }; }
    return actual;
  });
  const constructor = loaded["CurrentSchematicRelevanceDisplayWriteObservers"]; assert.ok(typeof constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit inert registry seams above exercise the actual group implementation and issue no production capability.
  const group = Reflect.construct(constructor, [owner, args]) as CurrentSchematicRelevanceDisplayWriteObservers;
  return { group, construction, packet, producer, calls, setups, exit: (): void => { exited = true; } };
}
async function turn(): Promise<void> { const next = Promise.withResolvers<true>(); setImmediate(() => { next.resolve(true); }); await next.promise; }
void test("one structure reader starts after construction while opening remains pending, and later Save joins it", async () => {
  const f = await fixture(); f.group.armBeforeNavigation(); await Promise.all(f.setups);
  assert.equal(f.calls.filter(call => call === "packet-read").length, 0);
  f.construction.resolve(true); await turn();
  assert.equal(f.calls.filter(call => call === "packet-read").length, 1); assert.ok(f.calls.includes("producer-read"));
  const original = Object.freeze({ profile: "private.current-project-save-structure-packet.v1" }); f.packet.resolve(original);
  assert.equal(await f.group.waitForOriginalSaveStructurePacket(), original); assert.equal(await f.group.waitForOriginalSaveStructurePacket(), original);
  assert.equal(f.calls.filter(call => call === "packet-read").length, 1);
  f.exit(); f.producer.reject(new Error("original Job exited")); await f.group.settleOriginalCallsAfterExit();
});
void test("exit settlement joins the original pending structure read without starting another", async () => {
  const f = await fixture(); f.group.armBeforeNavigation(); await Promise.all(f.setups); f.construction.resolve(true); await turn(); f.exit();
  let settled = false; const cleanup = (async (): Promise<void> => { await f.group.settleOriginalCallsAfterExit(); settled = true; })();
  f.producer.reject(new Error("original Job exited")); await turn(); assert.equal(settled, false);
  f.packet.reject(new Error("original structure lane exited")); await cleanup;
  assert.equal(settled, true); assert.equal(f.calls.filter(call => call === "packet-read").length, 1);
  assert.equal(f.group.status().failed, true);
});

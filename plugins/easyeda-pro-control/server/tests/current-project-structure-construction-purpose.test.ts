/** Genuine purpose registry through original inert channels; no native process
 * or app/model construction is executed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentProjectStructureStartupChannel, isOriginalProjectStructureDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { bindFootprintPreparationConstructionTransport, isOriginalProjectStructureConstructionTransport, requireOriginalProjectStructureConstructionDependency } from "../src/current-footprint-copy-construction-purpose.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";

void test("structure construction binds once and never replaces its genuine original dependency", async () => {
  let exited = false;
  const native = Object.freeze({ requireOriginalParent: (): Promise<Readonly<{ targetId: string; sessionId: string; nextRequestId: number }>> => Promise.resolve(Object.freeze({ targetId: "parent", sessionId: "session", nextRequestId: 1 })),
    assertOriginalTermination: (): Promise<void> => { assert.equal(exited, true); return Promise.resolve(); }, observeOriginalParentEvent: (): void => undefined,
    exchange: (): Promise<never> => Promise.reject(new Error("No native command should be dispatched by purpose binding")) });
  const first = new CurrentProjectStructureStartupChannel(native), second = new CurrentProjectStructureStartupChannel(native);
  try {
    const original = await first.start(), other = await second.start(); assert.equal(isOriginalProjectStructureDependency(original), true); assert.equal(isOriginalProjectStructureDependency(other), true);
    const transport: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: "original", assertOriginalPinnedWorker: (): Promise<void> => Promise.resolve(), request: (): Promise<never> => Promise.reject(new Error("No constructor call permitted")), subscribe: (): (() => void) => (): void => undefined });
    bindFootprintPreparationConstructionTransport(Object.freeze({ ...original }), transport); assert.equal(isOriginalProjectStructureConstructionTransport(transport), false);
    bindFootprintPreparationConstructionTransport(original, transport); requireOriginalProjectStructureConstructionDependency(transport, original);
    assert.throws(() => { bindFootprintPreparationConstructionTransport(original, transport); }, /PROJECT_STRUCTURE_CONSTRUCTION_ISSUED/u);
    assert.throws(() => { bindFootprintPreparationConstructionTransport(other, transport); }, /PROJECT_STRUCTURE_CONSTRUCTION_ISSUED/u);
    requireOriginalProjectStructureConstructionDependency(transport, original); assert.throws(() => { requireOriginalProjectStructureConstructionDependency(transport, other); }, /ORIGINAL_DEPENDENCY/u);
    assert.throws(() => { requireOriginalProjectStructureConstructionDependency(Object.freeze({ ...transport }), original); }, /ORIGINAL_DEPENDENCY/u);
  } finally { exited = true; await first.releaseAfterTermination(); await second.releaseAfterTermination(); }
});

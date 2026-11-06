/** Fixed v2 routing/counter tests. No native process or CAD execution. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_FORWARD_COLD_PHASES } from "../src/current-footprint-forward-cold-wire.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_REQUESTS as COLD, CURRENT_FOOTPRINT_FORWARD_NATIVE_LIMITS as LIMITS } from "../src/current-footprint-forward-native-limits.ts";
import { CurrentFootprintCopyForwardResourceLedger as Ledger, CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as OLD, CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as V2 } from "../src/current-footprint-copy-forward-capacity.ts";
import { currentProjectStructureWorkerNativeCases } from "../src/current-project-structure-worker-native.ts";
import { currentProjectStructureWorkerWire } from "../src/current-project-structure-worker-wire.ts";
import { currentFootprintCopyForwardStartupWire, currentFootprintForwardExecutionStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CurrentFootprintCopyForwardStartupChannel, CurrentFootprintForwardExecutionStartupChannel,
  isOriginalFootprintForwardExecutionDependency } from "../src/current-pcb-worker-startup-channel.ts";

void test("only the original v2 channel issues cold-purpose identity", async () => {
  const parent = Object.freeze({ targetId: "original", sessionId: "ui", nextRequestId: 1 });
  const native = Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), observeOriginalParentEvent: (): void => {
      // No event is emitted by this inert channel.
    },
    exchange: (): never => { throw new Error("No native command is expected."); } });
  const v2 = new CurrentFootprintForwardExecutionStartupChannel(native, (): void => {
      // No event is emitted by this inert channel.
    });
  const old = new CurrentFootprintCopyForwardStartupChannel(native, (): void => {
      // No event is emitted by this inert channel.
    });
  const actual = await v2.start(), historical = await old.start();
  assert.equal(isOriginalFootprintForwardExecutionDependency(actual), true);
  assert.equal(isOriginalFootprintForwardExecutionDependency({ ...actual }), false);
  assert.equal(isOriginalFootprintForwardExecutionDependency(historical), false);
  await v2.releaseAfterTermination(); await old.releaseAfterTermination();
});

void test("v2 sends only fixed cold phases while preserving the structure and old-forward grammars", () => {
  let selected = 0;
  for (const command of currentProjectStructureWorkerNativeCases()) {
    const original = currentProjectStructureWorkerWire(command, 1);
    if (CURRENT_FOOTPRINT_FORWARD_COLD_PHASES.includes(String(original.request["phase"]))) {
      selected += 1;
      const wire = currentFootprintForwardExecutionStartupWire(command, LIMITS.requestLimit);
      assert.equal(wire.request["action"], "footprint-forward-cold-send"); assert.equal(wire.request["requestId"], LIMITS.requestLimit);
      assert.equal(original.request["action"], "structure-worker-send");
      assert.throws(() => currentFootprintCopyForwardStartupWire(command, 1));
      assert.ok(!Object.keys(wire.request).some(key => key === "functionDeclaration" || key === "expression" || key === "condition"));
    } else if (original.request["phase"] === "call-same") {
      // This exact read was already in the unchanged startup grammar.
      assert.equal(currentFootprintForwardExecutionStartupWire(command, 1).request["action"], "worker-startup-send");
    } else { assert.throws(() => currentFootprintForwardExecutionStartupWire(command, 1)); }
  }
  assert.equal(selected, CURRENT_FOOTPRINT_FORWARD_COLD_PHASES.length);
  assert.throws(() => currentFootprintForwardExecutionStartupWire({}, LIMITS.requestLimit + 1));
});

void test("v2 reserves the cold suffix without increasing released forward counters", () => {
  assert.equal(OLD.writer.renderer.requestLimit, 1002);
  assert.equal(LIMITS.normalClass, 942 + COLD.normal); assert.equal(LIMITS.cleanupClass, 61 + COLD.cleanup);
  assert.equal(V2.writer.renderer.requestLimit, LIMITS.requestLimit);
  const ledger = new Ledger("forward-execution-v2"), original = Object.freeze({}); ledger.bind("forward-writer", original);
  for (let id = 1; id <= LIMITS.cleanupClass; id += 1) { ledger.consumeRequest("forward-writer", original, "renderer", id, true); }
  for (let id = LIMITS.cleanupClass + 1; id <= LIMITS.requestLimit; id += 1) { ledger.consumeRequest("forward-writer", original, "renderer", id, false); }
  assert.equal(ledger.generationStatus("forward-writer", original).rendererNormalRequests, LIMITS.normalClass);
  assert.throws(() => { ledger.consumeRequest("forward-writer", original, "renderer", LIMITS.requestLimit + 1, false); });
});

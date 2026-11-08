import assert from "node:assert/strict";
import { test } from "node:test";
import { captureOriginalSchematicDisplayManagerRequest, originalSchematicDisplayManagerControl } from "../../scripts/control-session-schematic-display-adapter.ts";
import { parseSessionManagerRequest } from "../../scripts/control-session-manager.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL as tool } from "../src/current-schematic-relevance-display-write-contract.ts";

void test("schematic manager cleanup retains the original write operation and accepts no ownership selector", () => {
  const input = { request: { action: "prepare", fixtureOperationId: "fixture-import-original", operationId: "sch209-relevance-display-manager-original", patch: { x: 25 } } };
  const original = captureOriginalSchematicDisplayManagerRequest(tool, input); assert.ok(original !== null);
  assert.equal(original.operationId, input.request.operationId); assert.equal(captureOriginalSchematicDisplayManagerRequest("easyeda_control_current_pcb_via_write", input), null);
  assert.equal(captureOriginalSchematicDisplayManagerRequest(tool, { ...input, originalOwner: true }), null);
  assert.deepEqual(originalSchematicDisplayManagerControl(original, "abort"), { tool, arguments: { request: { action: "abort", operationId: input.request.operationId, confirmOriginalJobOnly: true } } });
  assert.throws(() => originalSchematicDisplayManagerControl(original, "execute"));
  for (const extra of [{ operationId: "sch209-relevance-display-manager-foreign" }, { confirmOriginalJobOnly: true }, { tool }]) {
    assert.throws(() => parseSessionManagerRequest(JSON.stringify({ id: "side", action: "in-flight-original", generation: 1, originalRequestId: "original", request: { action: "abort", ...extra } })));
  }
});

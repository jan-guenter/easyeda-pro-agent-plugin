import assert from "node:assert/strict";
import { test } from "node:test";
import { captureOriginalViaManagerRequest, originalViaManagerControl } from "../../scripts/control-session-via-adapter.ts";
import { parseSessionManagerRequest } from "../../scripts/control-session-manager.ts";

void test("Via manager captures the write operation instead of its fixture source and refuses selector ownership overrides", () => {
  const tool = "easyeda_control_current_pcb_via_write";
  const input = { request: { action: "prepare", fixtureOperationId: "fixture-import-original", operationId: "pcb209-via-write-original",
    via: { netName: "", xMil: 1, yMil: 2, holeDiameterMil: 3, diameterMil: 4 } } };
  const original = captureOriginalViaManagerRequest(tool, input); assert.ok(original !== null);
  assert.equal(original.operationId, input.request.operationId); assert.equal(captureOriginalViaManagerRequest("easyeda_control_pcb209_worker_startup", input), null);
  assert.equal(captureOriginalViaManagerRequest(tool, { ...input, originalOwner: true }), null);
  assert.deepEqual(originalViaManagerControl(original, "abort"), { tool, arguments: { request: { action: "abort", operationId: input.request.operationId, confirmOriginalJobOnly: true } } });
  assert.throws(() => originalViaManagerControl(original, "execute"));
  for (const override of [{ operationId: "pcb209-via-write-foreign" }, { confirmOriginalJobOnly: true }, { tool }]) {
    assert.throws(() => parseSessionManagerRequest(JSON.stringify({ id: "side", action: "in-flight-original", generation: 1,
      originalRequestId: "original", request: { action: "abort", ...override } })));
  }
});

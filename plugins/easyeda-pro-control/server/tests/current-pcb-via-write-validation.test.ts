/** Schema/router checks allocate no original fixture, owner or native process. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { queryOfflineApi } from "../src/offline-api.ts";
import { CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS, CURRENT_PCB_VIA_WRITE_TOOL } from "../src/current-pcb-via-write-contract.ts";

void test("offline Via discovery includes exact schemas while retaining false execution and persistence claims", () => {
  const response = queryOfflineApi({ action: "pcb209-via-write", query: { includeSchemas: true } });
  const result: unknown = response.result; assert.ok(result !== null && typeof result === "object");
  assert.ok("tool" in result && result.tool === CURRENT_PCB_VIA_WRITE_TOOL);
  for (const field of ["executionAuthorized", "connectedValidation", "ordinaryProjectsSupported", "inverseAvailable"]) {
    assert.ok(field in result && Reflect.get(result, field) === false);
  }
  assert.ok("inputSchema" in result && "outputSchema" in result);
});
void test("offline validation requires exact original-attempt acknowledgements and accepts no injected owner", () => {
  const request = { action: "execute", operationId: "pcb209-via-write-offline-validation", ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS };
  const response = queryOfflineApi({ action: "pcb209-via-write-validate", query: { request } });
  const result: unknown = response.result; assert.ok(result !== null && typeof result === "object" && "valid" in result && result.valid === true);
  for (const invalid of [{ action: request.action, operationId: request.operationId }, { ...request, nativeOwner: {} }]) {
    const failed: unknown = queryOfflineApi({ action: "pcb209-via-write-validate", query: { request: invalid } }).result;
    assert.ok(failed !== null && typeof failed === "object" && "valid" in failed && failed.valid === false);
  }
});

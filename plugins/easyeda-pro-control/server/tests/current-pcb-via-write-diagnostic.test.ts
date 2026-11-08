import assert from "node:assert/strict";
import { test } from "node:test";
import { createOriginalSourceError } from "../src/original-source-error.ts";
import { currentPcbViaWriteDiagnostic, currentPcbViaWriteDiagnosticSchema, currentPcbViaWriteErrorCode } from "../src/current-pcb-via-write-diagnostic.ts";

void test("Via diagnostics preserve only original source-issued codes and false authority", () => {
  const original = createOriginalSourceError("PCB_VIA_WORKFLOW", "ORIGINAL_OWNER");
  const code = currentPcbViaWriteErrorCode(original); assert.equal(code, "PCB_VIA_WORKFLOW_ORIGINAL_OWNER");
  for (const value of [new Error(original.message), structuredClone(original), { errorCode: code }, "PCB_VIA_WORKFLOW_ORIGINAL_OWNER", null, createOriginalSourceError("PCB_VIA_WORKFLOW", "ORIGINAL_OWNER\n")]) { assert.equal(currentPcbViaWriteErrorCode(value), "ORIGINAL_ERROR_UNCLASSIFIED"); }
  const result = currentPcbViaWriteDiagnostic("main", code);
  assert.equal(Object.isFrozen(result), true); assert.equal(result.originalFailureObserved, true);
  assert.equal(result.executionAuthorized, false); assert.equal(result.persistenceVerified, false); assert.equal(result.stackIncluded, false);
  for (const extra of [{ stage: "/private/path" }, { stage: "main\n" }, { errorCode: `${code}\n` }, { errorCode: null }, { executionAuthorized: true }, { stackIncluded: true }]) { assert.equal(currentPcbViaWriteDiagnosticSchema.safeParse({ ...result, ...extra }).success, false); }
});
void test("untrusted Error properties and proxies are not read for Via diagnostics", () => {
  let effects = 0;
  const forbidden = (): never => { effects += 1; throw new Error("UNTRUSTED_ERROR_GETTER"); };
  const error = new Error("private vendor message"); for (const name of ["message", "stack", "cause"]) { Object.defineProperty(error, name, { get: forbidden }); }
  assert.equal(currentPcbViaWriteErrorCode(error), "ORIGINAL_ERROR_UNCLASSIFIED");
  assert.equal(currentPcbViaWriteErrorCode(new Proxy(error, { get: forbidden, getOwnPropertyDescriptor: forbidden })), "ORIGINAL_ERROR_UNCLASSIFIED");
  const original = createOriginalSourceError("PCB_DIAGNOSTIC_OWNER", "MAIN_SOURCE_REFUSED"); Object.defineProperty(original, "message", { get: forbidden });
  assert.equal(currentPcbViaWriteErrorCode(original), "PCB_DIAGNOSTIC_OWNER_MAIN_SOURCE_REFUSED"); assert.equal(effects, 0);
});

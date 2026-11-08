import assert from "node:assert/strict";
import { test } from "node:test";
import { issueCurrentPcbDiagnosticNativeRefusal } from "../src/current-pcb-diagnostic-native-refusal.ts";
import { currentPcbViaWriteDiagnosticSchema, currentPcbViaWriteErrorCode } from "../src/current-pcb-via-write-diagnostic.ts";
import { currentSchematicRelevanceDisplayWriteDiagnosticSchema, currentSchematicRelevanceDisplayWriteErrorCode } from "../src/current-schematic-relevance-display-write-diagnostic.ts";
import { originalNativeOrSourceErrorCode } from "../src/original-native-error-code.ts";
import { createOriginalSourceError, originalSourceErrorCode } from "../src/original-source-error.ts";

void test("original native refusal codes reach both writers without changing source-only classification", () => {
  const error = issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-main-context");
  assert.equal(originalSourceErrorCode(error), null);
  assert.equal(originalNativeOrSourceErrorCode(error), "PCB_DIAGNOSTIC_MAIN_CONTEXT");
  assert.equal(currentPcbViaWriteErrorCode(error), "PCB_DIAGNOSTIC_MAIN_CONTEXT");
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(error), "PCB_DIAGNOSTIC_MAIN_CONTEXT");
  const source = createOriginalSourceError("PCB_VIA_WORKFLOW", "ORIGINAL_OWNER");
  assert.equal(originalNativeOrSourceErrorCode(source), "PCB_VIA_WORKFLOW_ORIGINAL_OWNER");
  for (const schema of [currentPcbViaWriteDiagnosticSchema, currentSchematicRelevanceDisplayWriteDiagnosticSchema]) {
    const name = schema === currentPcbViaWriteDiagnosticSchema ? "pcb209-via-write" : "schematic209-relevance-display-write";
    assert.equal(schema.safeParse({ schema: `easyeda-pro-control.${name}-diagnostic.v1`, stage: "main", originalFailureObserved: true,
      errorCode: currentPcbViaWriteErrorCode(error), executionAuthorized: false, persistenceVerified: false, stackIncluded: false }).success, true);
  }
});
void test("native refusal copies, trailing data, Error getters and proxies supply no provenance", () => {
  const error = issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-main-context");
  for (const value of [new Error(error.message), structuredClone(error), { nativeCode: "pcb-diagnostic-main-context" }, "pcb-diagnostic-main-context", null]) {
    assert.equal(originalNativeOrSourceErrorCode(value), null);
  }
  assert.throws(() => issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-main-context\n"));
  let effects = 0;
  const forbidden = (): never => { effects += 1; throw new Error("UNTRUSTED_ERROR_PROPERTY"); };
  const nativeCode = Object.defineProperty({}, "toString", { get: forbidden });
  assert.throws(() => issueCurrentPcbDiagnosticNativeRefusal(nativeCode), /NATIVE_REFUSAL_CODE/u);
  for (const key of ["message", "stack", "cause"]) { Object.defineProperty(error, key, { get: forbidden }); }
  assert.equal(originalNativeOrSourceErrorCode(error), "PCB_DIAGNOSTIC_MAIN_CONTEXT");
  assert.equal(originalNativeOrSourceErrorCode(new Proxy(error, { get: forbidden, getOwnPropertyDescriptor: forbidden })), null);
  assert.equal(effects, 0);
});

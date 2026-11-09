import assert from "node:assert/strict";
import { test } from "node:test";
import { createOriginalSourceError, originalSourceErrorCode } from "../src/original-source-error.ts";
import { currentSchematicRelevanceDisplayWriteDiagnostic, currentSchematicRelevanceDisplayWriteDiagnosticSchema, currentSchematicRelevanceDisplayWriteErrorCode } from "../src/current-schematic-relevance-display-write-diagnostic.ts";

void test("readonly diagnostics require the actual source-issued Error identity and never parse an uppercase private message", () => {
  const original = createOriginalSourceError("PCB_DIAGNOSTIC_OWNER", "MAIN_SOURCE_REFUSED");
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(original), "PCB_DIAGNOSTIC_OWNER_MAIN_SOURCE_REFUSED");
  for (const value of [new Error(original.message), new Error("PRIVATE_NAME:/private/evidence/file.json"), { errorCode: "PCB_DIAGNOSTIC_OWNER_MAIN_SOURCE_REFUSED" }, createOriginalSourceError("PCB_DIAGNOSTIC_OWNER", "PRIVATE_NAME:/private/path")]) { assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(value), "ORIGINAL_ERROR_UNCLASSIFIED"); }
  assert.equal(originalSourceErrorCode(structuredClone(original)), null);
  for (const value of [new Error("/private/evidence/file.json"), new Error("A".repeat(129)), new Error("A".repeat(9000)), undefined, "CALLER_ERROR"]) { assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(value), "ORIGINAL_ERROR_UNCLASSIFIED"); }
  const value = currentSchematicRelevanceDisplayWriteDiagnostic("writer-main-construction", "PCB_DIAGNOSTIC_OWNER_MAIN_SOURCE_REFUSED");
  assert.equal(value.originalFailureObserved, true); assert.equal(value.executionAuthorized, false); assert.equal(value.persistenceVerified, false); assert.equal(value.stackIncluded, false); assert.equal(Object.isFrozen(value), true);
  assert.equal(currentSchematicRelevanceDisplayWriteDiagnosticSchema.safeParse({ ...value, stage: "/private/path" }).success, false);
  assert.equal(currentSchematicRelevanceDisplayWriteDiagnosticSchema.safeParse({ ...value, errorCode: null }).success, false);
});
void test("message/stack/cause getters and Error proxies are never evaluated", () => {
  let effects = 0; const value = new Error("ORIGINAL_FIRST_CODE");
  const forbidden = (): never => { effects += 1; throw new Error("FORBIDDEN_GETTER"); };
  for (const name of ["message", "stack", "cause"]) { Object.defineProperty(value, name, { configurable: true, get: forbidden }); }
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(value), "ORIGINAL_ERROR_UNCLASSIFIED");
  const proxy = new Proxy(new Error("ORIGINAL_FIRST_CODE"), { getOwnPropertyDescriptor: (): never => { effects += 1; throw new Error("FORBIDDEN_PROXY"); }, get: (): never => { effects += 1; throw new Error("FORBIDDEN_PROXY"); } });
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(proxy), "ORIGINAL_ERROR_UNCLASSIFIED"); assert.equal(effects, 0);
});

void test("source error issuance cannot adopt a caller Error or coerce getters, and message mutation cannot replace its original code", () => {
  let effects = 0; const proxy = new Proxy({}, { get: (): never => { effects += 1; throw new Error("NO_COERCION"); } });
  assert.throws(() => createOriginalSourceError(proxy, "CODE"), TypeError); assert.throws(() => createOriginalSourceError("PCB_DIAGNOSTIC_OWNER", proxy), TypeError); assert.equal(effects, 0);
  const original = createOriginalSourceError("FOOTPRINT_MAIN_CONSTRUCTION", "REGISTRATION_SOURCE_REFUSED");
  Object.defineProperty(original, "message", { get: (): never => { effects += 1; throw new Error("PRIVATE_MESSAGE"); } });
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(original), "FOOTPRINT_MAIN_CONSTRUCTION_REGISTRATION_SOURCE_REFUSED");
  assert.equal(currentSchematicRelevanceDisplayWriteErrorCode(new Proxy(original, { get: (): never => { effects += 1; throw new Error("NO_GETTER"); } })), "ORIGINAL_ERROR_UNCLASSIFIED"); assert.equal(effects, 0);
});

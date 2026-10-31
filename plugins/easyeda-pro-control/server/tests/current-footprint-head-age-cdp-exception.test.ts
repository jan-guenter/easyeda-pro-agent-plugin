/** Actual local inspector failures and strict private evidence. These tests
 * use no EasyEDA owner, native helper, application process or project. */
import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { canonicalJson, sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CDP_EXCEPTION_MAX_BYTES, captureCurrentFootprintHeadAgeCdpException,
  currentFootprintHeadAgeCdpExceptionForError, decodeCurrentFootprintHeadAgeCdpReply } from "../src/current-footprint-head-age-cdp-exception.ts";
import { assertFootprintHeadAgeJournalBudget, captureFootprintHeadAgeValidationRecord } from "../src/current-footprint-head-age-validation-schema.ts";

const privateText = "private/owner/path and exception source must stay private";
function reply(): Record<string, unknown> {
  return { result: { type: "object", subtype: "error", className: "Error", description: privateText, objectId: "local-error" },
    exceptionDetails: { exceptionId: 1, text: "Uncaught", lineNumber: 14, columnNumber: 7, scriptId: "local",
      exception: { type: "object", subtype: "error", className: "Error", description: privateText, objectId: "local-exception" },
      future: { source: "unknown field retained", values: [1, false, null] } } };
}
function failure(input: unknown): Error {
  try { decodeCurrentFootprintHeadAgeCdpReply(input); } catch (error) { assert.ok(error instanceof Error); return error; }
  throw new Error("Expected native CDP failure.");
}
void test("strict successful reply excludes exceptions and preserves the original returned value", () => {
  assert.deepEqual(decodeCurrentFootprintHeadAgeCdpReply({ result: { type: "object", value: { marker: true } } }), { marker: true });
  const impossible = { ...reply(), result: { type: "object", value: { marker: true } } };
  const error = failure(impossible); assert.match(error.message, /^FOOTPRINT_HEAD_AGE_CDP_EXCEPTION:head-age-observe:[a-f0-9]{64}$/u);
  const forged = new Error(error.message); assert.equal(currentFootprintHeadAgeCdpExceptionForError(forged), null);
  const copied = structuredClone(reply()); assert.equal(currentFootprintHeadAgeCdpExceptionForError(copied), null);
});
void test("genuine failure retains the entire bounded canonical envelope without exposing foreign text", () => {
  const raw = reply(); const error = failure(raw); const evidence = currentFootprintHeadAgeCdpExceptionForError(error); assert.ok(evidence);
  assert.deepEqual(evidence.reply, raw); assert.equal(evidence.replySha256, sha256Text(canonicalJson(raw)));
  assert.equal(evidence.phase, "head-age-observe"); assert.equal(evidence.code, "FOOTPRINT_HEAD_AGE_CDP_EXCEPTION");
  assert.doesNotMatch(error.message, /private|description|Uncaught/u);
  assert.ok(Object.isFrozen(evidence)); assert.ok(Object.isFrozen(evidence.reply));
  assert.deepEqual(captureCurrentFootprintHeadAgeCdpException(structuredClone(evidence)), evidence);
  assert.equal(currentFootprintHeadAgeCdpExceptionForError(captureCurrentFootprintHeadAgeCdpException(evidence)), null);
  assert.throws(() => captureCurrentFootprintHeadAgeCdpException({ ...evidence, replySha256: "0".repeat(64) }));
});
void test("malformed, oversized and ambiguous replies refuse without success or forged private evidence", () => {
  const raw = reply();
  for (const input of [undefined, null, {}, { result: { type: "object" } }, { result: { type: "object", value: true, objectId: "extra" } },
    { ...raw, unexpected: true }, { ...raw, exceptionDetails: {} }, { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: -1, columnNumber: 1 } },
    { ...raw, result: { type: "invalid" } }, { ...raw, result: null },
    { ...raw, result: { type: "object", description: {} } },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, exception: {} } },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, stackTrace: { callFrames: [{}] } } },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, executionContextId: "1" } },
    { ...raw, future: "x".repeat(CURRENT_FOOTPRINT_HEAD_AGE_CDP_EXCEPTION_MAX_BYTES) },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, unknown: Array.from({ length: 513 }, () => null) } },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, unknown: Array.from({ length: 6 }, () => "x".repeat(12_000)) } },
    { ...raw, exceptionDetails: { exceptionId: 1, text: "x", lineNumber: 1, columnNumber: 1, unknown: "\u0000".repeat(12_000) } }]) {
    const error = failure(input); assert.equal(error.message, "FOOTPRINT_HEAD_AGE_CDP_REPLY_REFUSED:head-age-observe");
    assert.equal(currentFootprintHeadAgeCdpExceptionForError(error), null);
  }
});
void test("diagnostic capture and genuine-error lookup invoke no accessors, proxies or serialization hooks", () => {
  let calls = 0;
  const trap = new Proxy({}, { getOwnPropertyDescriptor(): never { calls += 1; throw new Error("must not run"); }, ownKeys(): never { calls += 1; throw new Error("must not run"); } });
  assert.equal(currentFootprintHeadAgeCdpExceptionForError(trap), null);
  for (const input of [trap, { get exceptionDetails(): never { calls += 1; throw new Error("must not run"); } },
    { ...reply(), toJSON(): never { calls += 1; throw new Error("must not run"); } }]) { failure(input); }
  assert.equal(calls, 0);
});
void test("journal reserves one raw exception or observation and refuses repeated or forged exception packets", () => {
  const evidence = currentFootprintHeadAgeCdpExceptionForError(failure(reply())); assert.ok(evidence);
  const base = { schema: "easyeda-pro-control.footprint-head-age-validation-record.v1", operationId: "footprint-head-age-exception-budget", sequence: 1,
    createdAt: "2026-10-31T00:00:00.000Z", previousSha256: null, kind: "failure", evidence: { action: "observe-head-age", failure: "fixed", headAgeCdpException: evidence } };
  const record = captureFootprintHeadAgeValidationRecord(base); assertFootprintHeadAgeJournalBudget([record]);
  assert.deepEqual(record.evidence["headAgeCdpException"], evidence);
  assert.throws(() =>{  assertFootprintHeadAgeJournalBudget([record, { ...record, sequence: 2 }]); });
  assert.throws(() =>{  assertFootprintHeadAgeJournalBudget([{ ...record, evidence: { ...record.evidence, headAgeObservation: { synthetic: true } } }]); });
  assert.throws(() =>{  assertFootprintHeadAgeJournalBudget([{ ...record, kind: "observe-head-age-result" }]); });
  assert.throws(() => captureFootprintHeadAgeValidationRecord({ ...base, evidence: { ...base.evidence, headAgeCdpException: { ...evidence, replySha256: "0".repeat(64) } } }));
});
void test("real local V8 process accessor refusal is retained completely without patching the process global", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "process"); assert.ok(original); assert.equal(Object.hasOwn(original, "value"), false);
  const session = new Session(); session.connect();
  try {
    const selected = await session.post("Runtime.evaluate", { expression: "[]", returnByValue: false }); assert.notEqual(selected.result.objectId, undefined);
    if (selected.result.objectId === undefined) { throw new Error("Missing local inspector array."); }
    const params: Runtime.CallFunctionOnParameterType = { objectId: selected.result.objectId,
      functionDeclaration: "function(){const d=Object.getOwnPropertyDescriptor(globalThis,'process');if(!d||!Object.hasOwn(d,'value'))throw new Error('LOCAL_HEAD_AGE_PROCESS_ACCESSOR');return true;}",
      returnByValue: true, generatePreview: false, silent: true, awaitPromise: false };
    const response = await session.post("Runtime.callFunctionOn", params);
    assert.notEqual(response.exceptionDetails, undefined); const error = failure(response); const evidence = currentFootprintHeadAgeCdpExceptionForError(error); assert.ok(evidence);
    assert.match(error.message, /^FOOTPRINT_HEAD_AGE_CDP_EXCEPTION:head-age-observe:[a-f0-9]{64}$/u);
    assert.deepEqual(evidence.reply, response); assert.match(canonicalJson(evidence.reply), /LOCAL_HEAD_AGE_PROCESS_ACCESSOR/u);
    assert.doesNotMatch(error.message, /LOCAL_HEAD_AGE_PROCESS_ACCESSOR/u);
    assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, "process"), original);
  } finally { session.disconnect(); }
});

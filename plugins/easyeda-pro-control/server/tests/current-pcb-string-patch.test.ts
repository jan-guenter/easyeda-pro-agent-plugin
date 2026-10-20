import assert from "node:assert/strict";
import { test } from "node:test";
import { planCurrentPcbStringPatch } from "../src/current-pcb-string-patch.ts";
import { parseCurrentPcbStringSource } from "../src/current-pcb-string-source.ts";

const documentUuid = "a".repeat(16), primitiveId = "b".repeat(16);
const native = { globalIndex: primitiveId, partitionId: "", groupId: 0, parentId: null, modelType: 0,
  layerId: 3, key: "", showKey: false, value: "Original", showValue: true, fontFamily: "default",
  fontSize: 12.3456789123, rotation: 0.123456789123, locked: false, position: { x: 1.23456789123, y: 0 },
  origin: 3, strokeWidth: 0.8123456789, reverse: false, reverseExpansion: 0.123456789,
  silkColor: "#000000", mirror: true, positionIsNull: false, zIndex: -1 };
function round(value: number): number { return Math.round(value * 10_000 + 1e-10) / 10_000; }
const body = { partitionId: "", groupId: 0, layerId: 3, x: round(native.position.x * 10), y: 0, text: native.value,
  fontFamily: "default", fontSize: round(native.fontSize * 10), strokeWidth: round(native.strokeWidth * 10), bold: 0,
  italic: 0, origin: "LEFT_BOTTOM", angle: round(native.rotation / Math.PI * 180), reverse: false,
  expansion: round(native.reverseExpansion * 10), mirror: true, locked: false, zIndex: -1, specialColor: "#000000" };
function record(header: Record<string, unknown>, content: Record<string, unknown>): string {
  return `${JSON.stringify(header)}||${JSON.stringify(content)}`;
}
function source(patch: Record<string, unknown> = {}): string {
  return [record({ type: "DOCHEAD", ticket: 9 }, { uuid: documentUuid, docType: "PCB", client: "retain-client" }),
    record({ type: "CANVAS", id: "CANVAS", ticket: 1 }, { unknown: ["retain", false, null] }),
    record({ type: "STRING", id: primitiveId, ticket: 2, unknown: "retained header" }, { ...body, ...patch }),
    record({ type: "RULE", id: "rule", ticket: 3 }, { preserve: true })].join("|\n");
}
function candidate(patch: unknown, overrides: Record<string, unknown> = {}): Readonly<Record<string, unknown>> {
  return planCurrentPcbStringPatch(source(), documentUuid, { ...native, ...overrides }, patch);
}

void test("current STRING patch preserves mandatory native fields without round-tripping optional geometry", () => {
  const result = candidate({ x: 120, y: -45, text: 'Text "quote" \\ slash |={Value}' });
  assert.deepEqual(result["candidateArguments"], { primitiveId, data: { layer: 3, reverse: false, mirror: true,
    primitiveLock: false, x: 120, y: -45, text: 'Text "quote" \\ slash |={Value}' } });
  assert.deepEqual(result["expectedNativeSnapshot"], { ...native, position: { x: 12, y: -4.5 }, value: 'Text "quote" \\ slash |={Value}' });
  assert.deepEqual(result["changedEncodedFields"], ["x", "y", "text"]);
  assert.equal(result["noOp"], false);
  assert.ok(native.fontSize * 10 !== body.fontSize);
  assert.ok(native.rotation / Math.PI * 180 !== body.angle);
});

void test("current STRING patch preserves peers, source order, headers and unknown fields only as a comparison projection", () => {
  const original = source({ future: { opaque: [1, false, null] }, toJSON: "inert" });
  const result = planCurrentPcbStringPatch(original, documentUuid, native, { text: "New" });
  const projected = result["expectedSourceProjection"]; assert.equal(typeof projected, "string");
  if (typeof projected !== "string") { throw new TypeError("Expected supplied projection."); }
  const after = parseCurrentPcbStringSource(projected, documentUuid), before = parseCurrentPcbStringSource(original, documentUuid);
  for (const [index, row] of before.records.entries()) {
    if (index === 2) { assert.deepEqual(after.records[index]?.header, row.header); }
    else { assert.equal(after.records[index]?.raw, row.raw); }
  }
  assert.deepEqual(after.strings[0]?.body, { ...before.strings[0]?.body, text: "New" });
  assert.equal(result["sourceHeadersPreservedOnlyForComparison"], true);
  assert.equal(result["unknownFieldsPreservedOnlyForComparison"], true);
  assert.ok(Object.isFrozen(result["expectedNativeSnapshot"]));
});

void test("current STRING patch models the view coordinate threshold, no-ops and sub-encoding changes", () => {
  for (const y of [0, 1e-10, 5e-8, 1e-7]) {
    const result = candidate({ y, text: "Original" });
    assert.equal(result["noOp"], true); assert.equal(result["candidateArguments"], null);
    assert.equal(result["expectedSourceProjection"], source());
    assert.deepEqual(result["ignoredRequestedFields"], ["y", "text"]);
  }
  assert.throws(() => candidate({ y: 1.0001e-7 }), /invisible in encoded source/u);
  assert.throws(() => candidate({ y: 0.00001 }), /invisible in encoded source/u);
  const result = candidate({ y: 0.001, x: native.position.x * 10, text: native.value });
  assert.deepEqual(result["candidateArguments"], { primitiveId, data: { layer: 3, reverse: false, mirror: true, primitiveLock: false, y: 0.001 } });
  assert.deepEqual(result["ignoredRequestedFields"], ["x", "text"]);
});

void test("current STRING patch refuses ambiguous native ownership, display, font and locked baselines", () => {
  for (const overrides of [{ globalIndex: "c".repeat(16) }, { parentId: "" }, { groupId: 1 }, { partitionId: "p" },
    { key: "Name" }, { showKey: true }, { showValue: false }, { modelType: 1 }, { positionIsNull: true },
    { fontFamily: "custom" }, { locked: true }, { layerId: 1 }, { fontSize: 0 }, { strokeWidth: native.fontSize },
    { value: "Unsupported Ω" }, { font: {} }, { formulaName: "" }]) {
    assert.throws(() => candidate({ text: "New" }, overrides));
  }
  for (const key of Object.keys(native)) {
    const incomplete: Record<string, unknown> = { ...native }; Reflect.deleteProperty(incomplete, key);
    assert.throws(() => planCurrentPcbStringPatch(source(), documentUuid, incomplete, { x: 120 }));
  }
});

void test("current STRING patch requires every encoded native field to match the raw source", () => {
  for (const overrides of [{ value: "Other" }, { fontSize: native.fontSize + 1 }, { rotation: 0.5 },
    { position: { x: 2, y: 0 } }, { position: { x: native.position.x, y: 1 } }, { origin: 1 },
    { strokeWidth: 1 }, { reverse: true }, { reverseExpansion: 1 }, { silkColor: null }, { mirror: false }, { zIndex: 2 }, { layerId: 4 }]) {
    assert.throws(() => candidate({ text: "New" }, overrides), /differs from source/u);
  }
  assert.throws(() => planCurrentPcbStringPatch(source({ specialColor: null }), documentUuid, native, { x: 120 }), /differs from source/u);
});

void test("current STRING patch refuses unsupported patch fields, text, numeric loss and data accessors", () => {
  for (const patch of [{}, { text: "" }, { text: "Unicode Ω" }, { text: "\r" }, { text: "\n" }, { text: "\t" }, { text: "\0" }, { text: "x".repeat(65_537) },
    { x: -0 }, { x: Infinity }, { x: Number.NaN }, { x: "12" }, { x: 1e12 }, { x: undefined }, { fontFamily: "default" },
    { reverse: false }, { primitiveLock: false }, { executionAuthorized: true }, { text: { toString: "New" } }]) {
    assert.throws(() => candidate(patch));
  }
  let calls = 0;
  const patch = Object.defineProperty({}, "x", { get() { calls += 1; return 12; }, enumerable: true });
  assert.throws(() => candidate(patch));
  const malicious = Object.defineProperty({ ...native }, "value", { get() { calls += 1; return "Original"; }, enumerable: true });
  assert.throws(() => planCurrentPcbStringPatch(source(), documentUuid, malicious, { text: "New" }));
  assert.equal(calls, 0);
  assert.throws(() => candidate({ x: -1e-323 }), /unsupported coordinate division/u);
  assert.throws(() => candidate({ x: -0.00001 }), /lossy predicted encoding/u);
});

void test("current STRING patch rejects top-level, nested and revoked proxies without invoking traps", () => {
  let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("Proxy trap invoked"); };
  const trapped = new Proxy({}, { get: trap, getPrototypeOf: trap, getOwnPropertyDescriptor: trap, ownKeys: trap });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const value of [trapped, revoked.proxy]) {
    assert.throws(() => planCurrentPcbStringPatch(source(), documentUuid, value, { text: "New" }), /non-data or nested input/u);
    assert.throws(() => candidate(value), /non-data or nested input/u);
    assert.throws(() => candidate({ text: "New" }, { position: value }), /non-data or nested input/u);
    assert.throws(() => candidate({ text: value }), /non-data or nested input/u);
  }
  assert.equal(calls, 0);
});

void test("current STRING patch never treats matching caller data as verification or execution authority", () => {
  const result = candidate({ text: "New" });
  for (const field of ["completeSourceProvenanceVerified", "liveReceiverVerified", "parentOwnershipVerified",
    "completeLiveBaselineVerified", "completeStoredBaselineVerified", "nativeModelTypeVerified", "queueCompletionVerified",
    "completeEffectVerified", "renderingVerified", "persistenceVerified", "writerSupported", "executionAuthorized"]) {
    assert.equal(result[field], false);
  }
  assert.equal(Object.hasOwn(result, "dispatchToken"), false);
});

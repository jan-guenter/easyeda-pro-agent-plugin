import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringPostCreate } from "../src/current-pcb-string-postcreate.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const binding = { primitiveId: "d".repeat(16), client: "e".repeat(16), uniqueId: "synthetic-token", maximumTicket: 41 };
const request = { x: 120, y: -450, text: "Test" };
function record(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }
function array(value: unknown): unknown[] { assert.ok(Array.isArray(value)); return value; }
function rawReply(value: unknown): unknown { return { result: { type: "string", value: JSON.stringify(value) } }; }
function rawText(value: string): unknown { return { result: { type: "string", value } }; }

/** Self-authored source-shaped observations. Raw fields are specified separately
 * from candidate output; geometry/dataState are deliberately not its prediction. */
function rawModel(): Record<string, unknown> {
  return { globalIndex: binding.primitiveId, modelType: "Text", zIndex: { kind: "absent" },
    partition: { kind: "absent" }, groupId: { kind: "absent" }, parent: { kind: "absent" }, number: { kind: "absent" },
    dataState: 65, matrixChange: false, key: "", value: "Test", position: { x: 12, y: -45 }, rotation: 0,
    base: { kind: "U8", num: 1, type: 0, origin: 3, strokeWidth: 0.8, mirror: false, showKey: false,
      showValue: true, fontFamily: "default", fontSize: 12, reverse: false, reverseExpansion: 0, positionIsNull: false,
      silkColor: { kind: "value", value: { r: 0, g: 0, b: 0, alpha: 1 } },
      layerId: { kind: "absent" }, locked: { kind: "absent" } },
    box: { kind: "value", value: { layerId: 3, locked: false, leftLow: { x: 12, y: -45 },
      leftUp: { x: 12, y: -33 }, rightLow: { x: 37, y: -45 }, rightUp: { x: 37, y: -33 } } },
    stateWatcher: { kind: "value", value: "reciprocal-yr" } };
}
function rawState(models: readonly unknown[] = []): Record<string, unknown> {
  return { schema: "easyeda-pro-control.pcb-diagnostic-raw-strings.v1", documentUuid: target.documentUuid,
    managerModelCount: models.length, models };
}
function fixture(): Readonly<{
  candidate: ReturnType<typeof planCurrentPcbStringCreate>;
  createPlan: ReturnType<typeof planCurrentPcbStringCreateObservation>;
  publicationPlan: ReturnType<typeof planCurrentPcbStringPublication>;
  result: Record<string, unknown>; before: Record<string, unknown>; after: Record<string, unknown>;
  input: Record<string, unknown>;
}> {
  const candidate = planCurrentPcbStringCreate(request);
  const createPlan = planCurrentPcbStringCreateObservation(candidate, target);
  const publicationPlan = planCurrentPcbStringPublication(candidate, createPlan, binding);
  const result = { profile: "private.current-pcb-string-create-dormant-result.v1", planSha256: createPlan.planSha256,
    completed: true, stage: "complete", dispatchAttempts: 1, acknowledgedPrimitiveId: binding.primitiveId,
    matchingBeforeSamples: 2, matchingAfterSamples: 2,
    readback: { globalIndex: binding.primitiveId, layerId: 3, key: "", showKey: false, value: "Test", showValue: true,
      fontFamily: "default", fontSize: 12, strokeWidth: 0.8, position: { x: 12, y: -45 }, origin: 3,
      rotation: 0, reverse: false, reverseExpansion: 0, mirror: false, locked: false, positionIsNull: false, silkColor: "#000000" },
    deadlineExpired: false };
  const after = rawState([rawModel()]), before = rawState();
  const input: Record<string, unknown> = { createResultJson: JSON.stringify(result),
    beforeFirst: rawReply(before), beforeSecond: rawReply(before), afterFirst: rawReply(after), afterSecond: rawReply(after),
    publication: structuredClone(publicationPlan.expectedPayload) };
  return { candidate, createPlan, publicationPlan, result, before, after, input };
}
function compare(value: ReturnType<typeof fixture>): ReturnType<typeof compareCurrentPcbStringPostCreate> {
  return compareCurrentPcbStringPostCreate(value.candidate, value.createPlan, value.publicationPlan, value.input);
}
function replaceAfter(value: ReturnType<typeof fixture>, model: Record<string, unknown>): void {
  const after = rawState([model]);
  value.input["afterFirst"] = rawReply(after); value.input["afterSecond"] = rawReply(after);
}

void test("post-create relation joins supplied acknowledgment, raw birth fields and exact one-String publication", () => {
  const value = fixture();
  const result = compare(value);
  assert.equal(result.suppliedCreateRawPublicationRelationMatches, true);
  assert.equal(result.primitiveId, binding.primitiveId); assert.equal(result.documentUuid, target.documentUuid);
  assert.equal(result.beforeStringCount, 0); assert.equal(result.afterStringCount, 1); assert.equal(result.expectedTicket, 42);
  assert.equal(result.publicationPlanSha256, value.publicationPlan.planSha256);
  assert.equal(result.publicationProjectionSha256, value.publicationPlan.expectedPayloadSha256);
  assert.match(result.relationSha256, /^[a-f0-9]{64}$/u);
  assert.notEqual(result.beforeRawModelProjectionSha256, result.afterRawModelProjectionSha256);
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.remaining));
  assert.deepEqual(compare(value), result);
});

void test("post-create raw relation refuses lossy DTO agreement over changed hidden state", () => {
  const changes: readonly ((model: Record<string, unknown>) => void)[] = [
    model => { model["value"] = "Other"; }, model => { model["position"] = { x: 12.001, y: -45 }; },
    model => { model["matrixChange"] = true; }, model => { model["rotation"] = 1; },
    model => { record(model["base"])["type"] = 1; }, model => { record(model["base"])["num"] = 2; },
    model => { record(model["base"])["fontSize"] = 13; }, model => { record(model["base"])["showValue"] = false; },
    model => { record(model["base"])["strokeWidth"] = 0.9; }, model => { record(model["base"])["fontFamily"] = "other"; },
    model => { record(model["base"])["origin"] = 5; }, model => { record(model["base"])["reverseExpansion"] = 1; },
    model => { record(model["base"])["silkColor"] = { kind: "null" }; },
    model => { record(model["base"])["silkColor"] = { kind: "value", value: { r: 0, g: 0, b: 0, alpha: 0 } }; },
    model => { record(record(model["box"])["value"])["layerId"] = 4; },
    model => { record(record(model["box"])["value"])["locked"] = true; },
    model => { model["box"] = { kind: "undefined" }; }, model => { model["stateWatcher"] = { kind: "undefined" }; },
  ];
  for (const change of changes) {
    const model = rawModel(), value = fixture(); change(model); replaceAfter(value, model);
    assert.throws(() => compare(value), /post-create relation/u);
  }
});

void test("post-create relation preserves raw absent defaults instead of normalizing falsey ownership markers", () => {
  for (const field of ["zIndex", "partition", "groupId", "parent", "number"]) {
    for (const kind of ["null", "undefined"]) {
      const model = rawModel(), value = fixture(); model[field] = { kind }; replaceAfter(value, model);
      assert.throws(() => compare(value), /fresh .* marker differs/u);
    }
  }
  for (const [field, data] of [["zIndex", -1], ["zIndex", 0], ["partition", ""], ["groupId", 0], ["number", -1]] as const) {
    const model = rawModel(), value = fixture(); model[field] = { kind: "value", value: data }; replaceAfter(value, model);
    assert.throws(() => compare(value), /fresh .* marker differs/u);
  }
  const hidden = fixture(), model = rawModel();
  const base = record(model["base"]);
  base["kind"] = "ib"; base["layerId"] = { kind: "value", value: 3 }; base["locked"] = { kind: "value", value: false };
  replaceAfter(hidden, model); assert.throws(() => compare(hidden), /visible base kind/u);
});

void test("post-create relation refuses a filtered-away object, existing String or another document", () => {
  for (const fields of [["beforeFirst", "beforeSecond"], ["afterFirst", "afterSecond"]] as const) {
    const value = fixture();
    const state = fields[0] === "beforeFirst" ? value.after : value.before;
    for (const field of fields) { value.input[field] = rawReply(state); }
    assert.throws(() => compare(value), /manager count differs/u);
  }
  const additional = rawModel(), extra = fixture(); additional["globalIndex"] = "f".repeat(16);
  extra.input["afterFirst"] = rawReply(rawState([rawModel(), additional]));
  extra.input["afterSecond"] = extra.input["afterFirst"];
  assert.throws(() => compare(extra), /manager count differs/u);
  const wrongDocument = fixture(); wrongDocument.before["documentUuid"] = "f".repeat(16);
  wrongDocument.input["beforeFirst"] = rawReply(wrongDocument.before);
  assert.throws(() => compare(wrongDocument), /document differs/u);
  const changed = rawModel(), wrongId = fixture(); changed["globalIndex"] = "f".repeat(16);
  replaceAfter(wrongId, changed); assert.throws(() => compare(wrongId), /native ID differs/u);
});

void test("post-create relation composes original plans and rejects incomplete or cross-plan acknowledgments", () => {
  const value = fixture();
  for (const field of ["candidate", "createPlan", "publicationPlan"] as const) {
    const copy = { ...value, [field]: { ...value[field] } };
    assert.throws(() => compare(copy), /original/u);
  }
  const otherTarget = { ...target, branchUuid: "f".repeat(32) };
  const otherCreate = planCurrentPcbStringCreateObservation(value.candidate, otherTarget);
  const otherPublication = planCurrentPcbStringPublication(value.candidate, otherCreate, binding);
  assert.throws(() => compare({ ...value, publicationPlan: otherPublication }), /original plans differ/u);
  const otherCandidate = planCurrentPcbStringCreate({ ...request, x: 130 });
  assert.throws(() => compare({ ...value, candidate: otherCandidate }), /encoded body differs/u);
  const incomplete = fixture(); Object.assign(incomplete.result, { completed: false, stage: "final-check" });
  incomplete.input["createResultJson"] = JSON.stringify(incomplete.result);
  assert.throws(() => compare(incomplete), /completed create ID differs/u);
  const wrongAck = fixture(); wrongAck.result["acknowledgedPrimitiveId"] = "f".repeat(16);
  record(wrongAck.result["readback"])["globalIndex"] = "f".repeat(16);
  wrongAck.input["createResultJson"] = JSON.stringify(wrongAck.result);
  assert.throws(() => compare(wrongAck), /completed create ID differs/u);
});

void test("post-create relation rejects an additional publication record or substituted ticket", () => {
  for (const change of ["extra", "ticket"]) {
    const value = fixture();
    const payload = array(value.input["publication"]);
    const pending = array(record(record(payload[0])[target.documentUuid])["pend"]);
    if (change === "extra") { pending.push(structuredClone(pending[0])); }
    else { array(pending[0])[1] = 43; }
    assert.throws(() => compare(value), /Current PCB String publication/u);
  }
});

void test("post-create retains unmodeled fields but never calls equal samples complete geometry or settled state", () => {
  const model = rawModel(), value = fixture();
  model["dataState"] = 129;
  record(record(record(model["box"])["value"])["leftUp"])["y"] = -30;
  replaceAfter(value, model);
  const changed = compare(value), original = compare(fixture());
  assert.notEqual(changed.afterRawModelProjectionSha256, original.afterRawModelProjectionSha256);
  assert.notEqual(changed.relationSha256, original.relationSha256);
  value.input["afterSecond"] = rawReply(rawState([rawModel()]));
  assert.throws(() => compare(value), /sample pair differs/u);
  for (const [key, data] of Object.entries(changed)) {
    if (key.endsWith("Verified") || ["connectedValidation", "writerSupported", "executionAuthorized",
      "repeatAcrossInvocationsPrevented"].includes(key)) { assert.equal(data, false, key); }
  }
  assert.equal(changed.remaining.length, 5);
  assert.equal(Object.hasOwn(changed, "dispatchToken"), false); assert.equal(Object.hasOwn(changed, "saveCode"), false);
});

void test("post-create input refuses callbacks and preserves strict diagnostic JSON parsing", () => {
  const value = fixture(); let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("UNEXPECTED_CALLBACK"); };
  const accessor = Object.defineProperty({ ...value.input }, "afterFirst", { enumerable: true, get: trap });
  const proxy = new Proxy(value.input, { ownKeys: trap, getPrototypeOf: trap });
  for (const input of [accessor, proxy, { ...value.input, executionAuthorized: true }]) {
    assert.throws(() => compare({ ...value, input }));
  }
  for (const field of ["candidate", "createPlan", "publicationPlan"] as const) {
    const proxyPlan = new Proxy(value[field], { get: trap, ownKeys: trap, getPrototypeOf: trap });
    assert.throws(() => compare({ ...value, [field]: proxyPlan }));
  }
  assert.equal(calls, 0);
  for (const raw of [
    JSON.stringify(value.after).replace('"managerModelCount":1', '"managerModelCount":1,"managerModelCount":1'),
    JSON.stringify(value.after).replace('"rotation":0', '"rotation":-0'),
    JSON.stringify(value.after).replace('"modelType":"Text"', '"modelType":"Text","writerSupported":true'),
  ]) {
    const changed = fixture(); changed.input["afterFirst"] = rawText(raw);
    assert.throws(() => compare(changed), /RAW_STRINGS_REPLY/u);
  }
});

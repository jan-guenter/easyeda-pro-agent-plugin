import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringPublication, planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const binding = { primitiveId: "d".repeat(16), client: "e".repeat(16), uniqueId: "synthetic-compiler-token", maximumTicket: 41 };
function fixture(text = "PCB publication"): Readonly<{ candidate: ReturnType<typeof planCurrentPcbStringCreate>;
  create: ReturnType<typeof planCurrentPcbStringCreateObservation>; plan: ReturnType<typeof planCurrentPcbStringPublication> }> {
  const candidate = planCurrentPcbStringCreate({ x: 120, y: -450, text });
  const create = planCurrentPcbStringCreateObservation(candidate, target);
  const plan = planCurrentPcbStringPublication(candidate, create, binding);
  return { candidate, create, plan };
}
function payload(): unknown[] {
  const value: unknown = structuredClone(fixture().plan.expectedPayload); assert.ok(Array.isArray(value)); return value;
}
function object(value: unknown): Record<string, unknown> {
  assert.ok(isRecord(value)); return value;
}
function array(value: unknown): unknown[] { assert.ok(Array.isArray(value)); return value; }
function doc(value: readonly unknown[]): Record<string, unknown> { return object(object(value[0])[target.documentUuid]); }
function pend(value: readonly unknown[]): unknown[] { return array(doc(value)["pend"]); }
function row(value: readonly unknown[]): unknown[] { return array(pend(value)[0]); }

// Source-shaped compiler fixture, not execution of the vendor renderer or a
// Native receiver. cachePendData/publishPendData come from PCB217199c8 at3145459.
// Publication must copy the data before the producer clears its pending array.
function producerFixture(body: string): { publication: unknown; cacheAfterPublish: unknown; received: readonly unknown[][] } {
  const cache: Record<string, { type: string; pend: unknown[][] }> = {};
  const document = { type: "PCB", pend: [[binding.primitiveId, binding.maximumTicket + 1, "STRING", body]] };
  cache[target.documentUuid] = document;
  const publication: unknown = structuredClone([cache, binding.client, binding.uniqueId, target.documentUuid]);
  document.pend.length = 0;
  const received: unknown[][] = [], tuple = array(publication);
  const documents = object(tuple[0]);
  // Workerb849bd12 subscriber@2112925 forwards ID/ticket/type/body in this order.
  for (const [documentUuid, value] of Object.entries(documents)) {
    const entry = object(value);
    for (const pending of array(entry["pend"])) {
      const [id, ticket, type, content] = array(pending);
      received.push([ticket, tuple[1], documentUuid, id, content, type, entry["type"], undefined, undefined, true, undefined, tuple[2]]);
    }
  }
  return { publication, cacheAfterPublish: cache, received };
}

void test("String publication matches native-shaped producer and receiver tuple order, preserving origin and body", () => {
  const { candidate, create, plan } = fixture(), native = producerFixture(candidate.expectedBodyText);
  const result = compareCurrentPcbStringPublication(plan, native.publication);
  assert.equal(result.suppliedPayloadMatchesPrediction, true);
  assert.equal(plan.expectedTicket, 42); assert.equal(plan.expectedPendCacheLength, candidate.expectedBodyText.length + 1);
  assert.equal(plan.createPlanSha256, create.planSha256);
  assert.deepEqual(native.received, [[42, binding.client, target.documentUuid, binding.primitiveId, candidate.expectedBodyText,
    "STRING", "PCB", undefined, undefined, true, undefined, binding.uniqueId]]);
  assert.deepEqual(native.cacheAfterPublish, { [target.documentUuid]: { type: "PCB", pend: [] } });
  assert.throws(() => compareCurrentPcbStringPublication(plan,
    [native.cacheAfterPublish, binding.client, binding.uniqueId, target.documentUuid]), /array size/u);
});

void test("String publication rejects any extra document, pending record, deletion, cache field or changed byte", () => {
  const { plan } = fixture();
  const changes: readonly ((value: unknown[]) => void)[] = [
    value => { object(value[0])["other"] = { type: "PCB", pend: [] }; },
    value => { object(value[0])["BLOB"] = { type: "BLOB", pend: [] }; },
    value => { object(value[0])["FONT"] = { type: "FONT", pend: [] }; },
    value => { pend(value).push(structuredClone(row(value))); },
    value => { row(value)[3] = ""; }, value => { row(value)[2] = "BOARD"; },
    value => { row(value)[2] = "POURED"; }, value => { row(value)[2] = "INNER"; },
    value => { doc(value)["extra"] = false; }, value => { row(value).push("extra"); },
    value => { value.push(target.projectUuid); }, value => { value.pop(); },
    value => { row(value)[3] = `${String(row(value)[3])}\n`; },
    value => { row(value)[3] = String(row(value)[3]).replace('"specialColor":"#000000"', '"specialColor":null'); },
    value => { row(value)[3] = String(row(value)[3]).replace('"x":120', '"x":120,"x":120'); },
  ];
  for (const change of changes) { const value = payload(); change(value); assert.throws(() => compareCurrentPcbStringPublication(plan, value)); }
  for (const key of ["type", "pend"]) {
    const value = payload(); assert.equal(Reflect.deleteProperty(doc(value), key), true);
    assert.throws(() => compareCurrentPcbStringPublication(plan, value));
  }
});

void test("String publication checks every supplied compiler and record identity without coercion", () => {
  const { plan } = fixture();
  for (const [index, replacement] of [[1, "f".repeat(16)], [2, "other-token"], [3, "f".repeat(16)]] as const) {
    const value = payload(); value[index] = replacement; assert.throws(() => compareCurrentPcbStringPublication(plan, value), /envelope/u);
  }
  for (const [index, replacement] of [[0, "f".repeat(16)], [1, 41], [1, 43], [1, "42"], [1, -0],
    [1, Number.NaN], [1, Infinity], [2, "ATTR"], [2, null]] as const) {
    const value = payload(); row(value)[index] = replacement;
    assert.throws(() => compareCurrentPcbStringPublication(plan, value), /record identity/u);
  }
  const wrongOrigin = payload(); wrongOrigin[3] = "BLOB";
  // The worker ignores tuple[3]. Our comparison still preserves that producer field.
  assert.throws(() => compareCurrentPcbStringPublication(plan, wrongOrigin), /envelope/u);
  const wrongType = payload(); doc(wrongType)["type"] = "FOOTPRINT";
  assert.throws(() => compareCurrentPcbStringPublication(plan, wrongType), /envelope/u);
});

void test("String publication refuses proxies, accessors, inherited or decorated data before invoking callbacks", () => {
  const { plan } = fixture(); let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("unexpected callback"); };
  for (const part of ["outer", "documents", "document", "pend", "record"] as const) {
    const value = payload(); const proxy = new Proxy({}, { getPrototypeOf: trap, ownKeys: trap });
    if (part === "outer") { assert.throws(() => compareCurrentPcbStringPublication(plan, proxy)); }
    else {
      if (part === "documents") { value[0] = proxy; }
      else if (part === "document") { object(value[0])[target.documentUuid] = proxy; }
      else if (part === "pend") { doc(value)["pend"] = proxy; }
      else { pend(value)[0] = proxy; }
      assert.throws(() => compareCurrentPcbStringPublication(plan, value));
    }
  }
  for (const select of [(value: unknown[]): unknown[] => value, (value: unknown[]): Record<string, unknown> => object(value[0]), doc, pend, row]) {
    const value = payload(); Object.defineProperty(select(value), "toJSON", { value: trap });
    assert.throws(() => compareCurrentPcbStringPublication(plan, value));
  }
  const accessor = payload(); Object.defineProperty(row(accessor), "3", { get: trap, enumerable: true });
  const sparse = payload(); assert.equal(Reflect.deleteProperty(row(sparse), "2"), true);
  const inherited = payload(); Object.setPrototypeOf(doc(inherited), { type: "PCB" });
  const decorated = payload(); Object.defineProperty(pend(decorated), Symbol("extra"), { value: true });
  const nonEnumerable = payload(); Object.defineProperty(row(nonEnumerable), "3", { value: row(nonEnumerable)[3], enumerable: false });
  const coercion = payload(); row(coercion)[3] = { toString: trap, toJSON: trap };
  for (const value of [accessor, sparse, inherited, decorated, nonEnumerable, coercion]) {
    assert.throws(() => compareCurrentPcbStringPublication(plan, value));
  }
  assert.equal(calls, 0);
});

void test("String publication plans require original matching create plans and bounded supplied bindings", () => {
  const { candidate, create, plan } = fixture();
  assert.throws(() => planCurrentPcbStringPublication({ ...candidate }, create, binding), /original candidate/u);
  assert.throws(() => planCurrentPcbStringPublication(candidate, { ...create }, binding), /original dormant plan/u);
  const other = fixture("Other text");
  assert.throws(() => planCurrentPcbStringPublication(candidate, other.create, binding), /create plans differ/u);
  assert.throws(() => compareCurrentPcbStringPublication({ ...plan }, plan.expectedPayload), /original publication plan/u);
  for (const update of [{ primitiveId: "x" }, { client: "x" }, { uniqueId: "" }, { uniqueId: "x".repeat(129) },
    { maximumTicket: -0 }, { maximumTicket: -1 }, { maximumTicket: 0.5 }, { maximumTicket: "41" },
    { maximumTicket: Number.MAX_SAFE_INTEGER }, { executionAuthorized: true }]) {
    assert.throws(() => planCurrentPcbStringPublication(candidate, create, { ...binding, ...update }));
  }
  let calls = 0;
  const getter = Object.defineProperty({ ...binding }, "uniqueId", { get() { calls += 1; return "token"; }, enumerable: true });
  assert.throws(() => planCurrentPcbStringPublication(candidate, create, getter));
  const proxy = new Proxy(candidate, { getPrototypeOf(): object { calls += 1; return Object.prototype; } });
  assert.throws(() => planCurrentPcbStringPublication(proxy, create, binding)); assert.equal(calls, 0);
});

void test("String publication preserves boundary text and freezes prediction independently of caller data", () => {
  for (const text of [String.raw`quote"\pipe||={Value}`, "x".repeat(256)]) {
    const { candidate, plan } = fixture(text);
    assert.equal(compareCurrentPcbStringPublication(plan, producerFixture(candidate.expectedBodyText).publication).pendingRecordCount, 1);
    assert.equal(Object.isFrozen(plan), true); assert.equal(Object.isFrozen(plan.expectedPayload), true);
    assert.equal(Object.isFrozen(plan.expectedPayload[0][target.documentUuid]?.pend[0]), true);
  }
  const { candidate, create } = fixture(), input = { ...binding };
  const plan = planCurrentPcbStringPublication(candidate, create, input); input.uniqueId = "changed";
  assert.equal(plan.binding.uniqueId, binding.uniqueId);
  const boundary = planCurrentPcbStringPublication(candidate, create, { ...binding, maximumTicket: Number.MAX_SAFE_INTEGER - 1 });
  assert.equal(boundary.expectedTicket, Number.MAX_SAFE_INTEGER);
});

void test("String publication matches grant no producer, interval, worker, Save or persistent authority", () => {
  const { plan } = fixture(), comparison = compareCurrentPcbStringPublication(plan, plan.expectedPayload);
  for (const result of [plan, comparison]) {
    for (const key of ["livePublicationVerified", "originalNativeIdVerified", "producerOwnershipVerified", "workerDeliveryVerified",
      "completeIntervalVerified", "completeLiveBaselineVerified", "completeStoredBaselineVerified", "queueCompletionVerified",
      "completeEffectVerified", "persistenceVerified", "writerSupported", "executionAuthorized"]) {
      assert.equal(Reflect.get(result, key), false);
    }
    for (const key of ["dispatchToken", "saveCode", "workerOwner", "clockObservation", "projectBindingVerified"]) {
      assert.equal(Object.hasOwn(result, key), false);
    }
  }
  // Repeated pure comparisons do not consume/observe a real publication interval.
  assert.deepEqual(compareCurrentPcbStringPublication(plan, plan.expectedPayload), comparison);
});

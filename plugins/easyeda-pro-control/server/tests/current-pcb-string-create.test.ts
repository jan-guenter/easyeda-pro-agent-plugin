import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCurrentPcbStringCreateBody, planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "../src/current-pcb-string-create.ts";

// Producer-shaped synthetic fixture from PCB217199c8, not a vendor-bundle import
// Or execution. string-create@10393687 passes these arguments to Jr.addText;
// Jr@7959947 applies Co@3214604 and defaults Tz@1309844. A real constructor,
// Font loader, parent manager, command queue and renderer are NOT exercised.
interface FixtureModel {
  readonly type: number; readonly modelType: string; readonly layerId: number; readonly key: string;
  readonly showKey: boolean; readonly value: string; readonly showValue: boolean; readonly fontFamily: string;
  readonly fontSize: number; readonly strokeWidth: number; readonly position: Readonly<{ x: number; y: number }>;
  readonly origin: number; readonly rotation: number; readonly reverse: boolean; readonly reverseExpansion: number;
  readonly mirror: boolean; readonly locked: boolean; readonly positionIsNull: boolean; readonly zIndex: number;
  readonly silkColor: string;
}
function nativeCreateFixture(args: CurrentPcbStringCreateCandidate["candidateArguments"]): FixtureModel {
  const model: FixtureModel = { type: 0, modelType: "Text", layerId: args.layer, key: "", showKey: false,
    value: args.text, showValue: true, fontFamily: args.fontFamily, fontSize: Math.max(args.fontSize / 10, 0.003937),
    strokeWidth: Math.max(args.lineWidth / 10, 0.003937), position: { x: args.x / 10, y: args.y / 10 },
    origin: args.alignMode, rotation: args.rotation / 180 * Math.PI, reverse: args.reverse,
    reverseExpansion: args.expansion, mirror: args.mirror, locked: args.primitiveLock,
    positionIsNull: false, zIndex: -1, silkColor: "#000000" };
  return model;
}
// Native getSTRING("2.0")@4000773 preserves this order. O3.getData@4418517 is
// Expressed as a separate field selector so the test does not merely stringify
// The planner's own body. Only the parentless default-font subset is modeled.
const fields = ["partitionId", "groupId", "layerId", "x", "y", "text", "fontFamily", "fontSize", "strokeWidth",
  "bold", "italic", "origin", "angle", "reverse", "expansion", "mirror", "locked", "zIndex", "specialColor"] as const;
function round(value: number): number { return Math.round(value * 10_000 + 1e-10) / 10_000; }
function fixtureField(field: typeof fields[number], model: FixtureModel): string | number | boolean | null {
  switch (field) {
    case "partitionId": { return ""; }
    case "groupId": { return 0; }
    case "layerId": { return model.layerId; }
    case "x": { return round(model.position.x * 10); }
    case "y": { return round(model.position.y * 10); }
    case "text": { return model.value; }
    case "fontFamily": { return model.fontFamily; }
    case "fontSize": { return round(model.fontSize * 10); }
    case "strokeWidth": { return round(model.strokeWidth * 10); }
    case "bold": { return 0; }
    case "italic": { return 0; }
    case "origin": { assert.equal(model.origin, 3); return "LEFT_BOTTOM"; }
    case "angle": { return round(model.rotation / Math.PI * 180); }
    case "reverse": { return model.reverse; }
    case "expansion": { return round(model.reverseExpansion * 10); }
    case "mirror": { return model.mirror; }
    case "locked": { return model.locked; }
    case "zIndex": { return model.zIndex; }
    case "specialColor": { return model.layerId === 3 || model.layerId === 4 ? model.silkColor : null; }
    default: { throw new Error("Unsupported fixture encoder field."); }
  }
}
function fixtureEncode(model: FixtureModel): string {
  return JSON.stringify(Object.fromEntries(fields.map(field => [field, fixtureField(field, model)])));
}
const request = { x: 120, y: -450, text: "A PCB text" };

void test("current String create fixes every native argument and distinguishes numeric type from modelType", () => {
  const result = planCurrentPcbStringCreate(request);
  assert.deepEqual(result.candidateArguments, { layer: 3, x: 120, y: -450, text: "A PCB text", fontFamily: "default", fontSize: 120,
    lineWidth: 8, alignMode: 3, rotation: 0, reverse: false, expansion: 0, mirror: false, primitiveLock: false });
  assert.deepEqual(result.expectedModelScalars, nativeCreateFixture(result.candidateArguments));
  assert.equal(result.expectedModelScalars.type, 0); assert.equal(result.expectedModelScalars.modelType, "Text");
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.candidateArguments), true);
  assert.equal(Object.isFrozen(result.expectedBody), true); assert.equal(Object.isFrozen(result.expectedModelScalars.position), true);
});

void test("current String create body agrees with the pinned producer-shaped encoder on the admitted grid and ASCII", () => {
  const ascii = Array.from({ length: 95 }, (_, index) => String.fromCodePoint(32 + index)).join("");
  for (const value of [request, { x: 0, y: 0, text: " A " }, { x: -1_000_000, y: 1_000_000, text: ascii },
    { x: 1_000_000, y: -1_000_000, text: "x".repeat(256) }, { x: -10, y: 10, text: 'quote"\\pipe||={Value}' }]) {
    const result = planCurrentPcbStringCreate(value);
    const encoded = fixtureEncode(nativeCreateFixture(result.candidateArguments));
    assert.equal(result.expectedBodyText, encoded); assert.deepEqual(Object.keys(result.expectedBody), fields);
    assert.equal(compareCurrentPcbStringCreateBody(result, encoded).suppliedBodyMatchesPrediction, true);
    assert.equal(result.expectedBody.text, value.text);
  }
});

void test("current String create refuses non-grid, lossy, unbounded and non-ASCII requests without coercion", () => {
  for (const patch of [{ x: -0 }, { y: -0 }, { x: 1 }, { y: 0.1 }, { x: 1_000_010 }, { y: -1_000_010 },
    { x: Infinity }, { y: Number.NaN }, { x: "10" }, { text: "" }, { text: "   " }, { text: "x".repeat(257) },
    { text: "Ω" }, { text: "\tX" }, { text: "X\n" }, { text: "X\r" }, { text: "\0X" }, { text: "X\u007F" },
    { text: "\uD800" }, { text: undefined }, { x: null }, { y: {} }]) {
    assert.throws(() => planCurrentPcbStringCreate({ ...request, ...patch }));
  }
  for (const value of [null, false, 0, "request", [], new Map(), new Date(0), { x: 10, text: "X" },
    { ...request, layer: 3 }, { ...request, primitiveId: "b".repeat(16) }, { ...request, ticket: 1 },
    { ...request, emptyRootPcbVerified: true }, { ...request, executionAuthorized: true }]) {
    assert.throws(() => planCurrentPcbStringCreate(value));
  }
});

void test("current String create reads only plain own enumerable data and copies the admitted request", () => {
  let calls = 0;
  const accessor = Object.defineProperty({ ...request }, "text", { get() { calls += 1; return "X"; }, enumerable: true });
  const proxy = new Proxy(request, { getPrototypeOf(): object { calls += 1; return Object.prototype; } });
  const coercion = { toString: (): string => { calls += 1; return "X"; } };
  const inherited: unknown = Object.create(request);
  for (const value of [accessor, proxy, { ...request, text: coercion }, { ...request, toJSON: coercion.toString },
    Object.defineProperty({ ...request }, "x", { value: 120, enumerable: false }),
    inherited, { ...request, [Symbol("extra")]: 1 }]) {
    assert.throws(() => planCurrentPcbStringCreate(value));
  }
  assert.equal(calls, 0);
  const own = { ...request }, result = planCurrentPcbStringCreate(own); own.text = "Changed";
  assert.equal(result.candidateArguments.text, request.text);
  const nullPrototype: unknown = Object.setPrototypeOf({ ...request }, null);
  assert.equal(planCurrentPcbStringCreate(nullPrototype).expectedBodyText, result.expectedBodyText);
});

void test("current String create comparison requires the original candidate and exact serialized bytes", () => {
  const result = planCurrentPcbStringCreate(request);
  assert.throws(() => compareCurrentPcbStringCreateBody({ ...result }, result.expectedBodyText), /original candidate/u);
  assert.throws(() => compareCurrentPcbStringCreateBody(structuredClone(result), result.expectedBodyText), /original candidate/u);
  const reordered = JSON.stringify(Object.fromEntries(Object.entries(result.expectedBody).toReversed()));
  for (const value of [null, result.expectedBody, `${result.expectedBodyText}\n`, ` ${result.expectedBodyText}`, reordered,
    result.expectedBodyText.replace('"specialColor":"#000000"', '"specialColor":null'),
    result.expectedBodyText.replace('"specialColor":"#000000"', '"specialColor":"black"'),
    result.expectedBodyText.replace('"angle":0', '"angle":-0'), result.expectedBodyText.replace('"x":120', '"x":120.0'),
    JSON.stringify({ ...result.expectedBody, unknown: false }), result.expectedBodyText.replace('"x":120', '"x":120,"x":120'),
    result.expectedBodyText.replace('"text":"A PCB text"', '"text":"Other"'), "x".repeat(4097)]) {
    assert.throws(() => compareCurrentPcbStringCreateBody(result, value), /exact encoded body/u);
  }
  assert.equal(compareCurrentPcbStringCreateBody(result, result.expectedBodyText).suppliedBodyMatchesPrediction, true);
});

void test("current String create predictions and matching bodies provide no identity, source or writer authority", () => {
  const result = planCurrentPcbStringCreate(request);
  const comparison = compareCurrentPcbStringCreateBody(result, result.expectedBodyText);
  for (const value of [result, comparison]) {
    for (const field of ["originalNativeIdVerified", "liveReceiverVerified", "emptyRootPcbVerified", "sourceOwnershipVerified",
      "nativeModelVerified", "completeLiveBaselineVerified", "completeStoredBaselineVerified", "queueCompletionVerified",
      "completeEffectVerified", "renderingVerified", "persistenceVerified", "writerSupported", "executionAuthorized"]) {
      assert.equal(Reflect.get(value, field), false);
    }
    for (const field of ["primitiveId", "globalIndex", "ticket", "header", "documentUuid", "source", "dispatchToken"]) {
      assert.equal(Object.hasOwn(value, field), false);
    }
  }
  assert.equal(Object.hasOwn(result.candidateArguments, "primitiveId"), false);
});

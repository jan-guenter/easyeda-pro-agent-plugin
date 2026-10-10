/* oxlint-disable eslint/max-classes-per-file -- Two SDK prototype fixtures and one coordinator subclass model separate trusted receivers in these tests. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";

import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload } from "../src/public-sdk-read.ts";

const METHOD = "eda.pcb_MathPolygon.splitPolygon";
type PolygonSource = (number | string)[];
const rectangle: PolygonSource = ["R", 0, 0, 10, 20, 0, 0];
const circle: PolygonSource = ["CIRCLE", 20, 30, 5];
const line: PolygonSource = [0, 0, "L", 10, 0, 10, 10];
const arc: PolygonSource = [0, 0, "ARC", 90, 10, 10];
const clockwiseArc: PolygonSource = [0, 0, "CARC", -90, 10, 10];
const cubic: PolygonSource = [0, 0, "C", 1, 2, 3, 4, 5, 6];
const groups = [[rectangle, circle, line], [arc, clockwiseArc, cubic], [rectangle]];
const request = { method: METHOD, arguments: { complexPolygons: groups } };

class Polygon {
  public readonly source: PolygonSource;
  public constructor(source: PolygonSource) { this.source = source; }
  public getSource(): PolygonSource { return this.source; }
}
class ComplexPolygon {
  public readonly sources: PolygonSource[];
  public constructor(sources: PolygonSource[]) { this.sources = sources; }
  public getSource(): PolygonSource | PolygonSource[] { return this.sources.length === 1 ? this.sources[0] ?? [] : this.sources; }
  public toPolygon(): Polygon[] { return this.sources.map((source) => new Polygon(source)); }
}
interface FixtureOptions {
  construct?: (input: PolygonSource[]) => unknown;
  split?: (input: ComplexPolygon[]) => unknown;
}
function fixture(options: FixtureOptions = {}): { api: Record<string, unknown>; calls: () => { creates: number; splits: number } } {
  let creates = 0, splits = 0;
  const api = {
    createComplexPolygon(this: unknown, input: PolygonSource[]): unknown {
      assert.equal(this, api); creates += 1;
      return options.construct === undefined ? new ComplexPolygon(input) : options.construct(input);
    },
    splitPolygon(this: unknown, ...input: ComplexPolygon[]): unknown {
      assert.equal(this, api); splits += 1;
      assert.ok(input.every((value) => value instanceof ComplexPolygon));
      return options.split === undefined ? input.flatMap((value) => value.toPolygon()) : options.split(input);
    },
  };
  return { api, calls: () => ({ creates, splits }) };
}
async function run(api: Record<string, unknown>, input: unknown = request): Promise<unknown> {
  const code = buildPublicSdkReadCode(input);
  const execute: unknown = runInThisContext(`(async (eda) => { ${code} })`, { timeout: 1000 });
  assert.equal(typeof execute, "function");
  if (typeof execute !== "function") { throw new TypeError("Invalid test reader."); }
  const result: unknown = await Reflect.apply(execute, undefined, [{ pcb_MathPolygon: api }]);
  return result;
}

void test("split constructor chain preserves every polygon command, order, duplicate and receiver", async () => {
  const current = fixture();
  const payload = decodeExactReadEnvelope(await run(current.api));
  const result = validatePublicSdkReadPayload(payload, request);
  assert.deepEqual(result["value"], groups.flat());
  assert.deepEqual(current.calls(), { creates: 3, splits: 1 });
  assert.equal(result["assurance"], "bounded-public-sdk-observation-not-native-or-persistence-proof");
  assert.equal(Object.hasOwn(result, "implementationKind"), false);
  const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === METHOD);
  assert.equal(descriptor?.parameterSupport, "narrowed");
  assert.equal(descriptor?.result.kind, "polygons");
  assert.deepEqual(descriptor?.parameters, ["complexPolygons"]);
});

void test("single bare source and the maximum small group inventory retain exact flattened order", async () => {
  const maximumSource = [0, 0, "L", ...Array.from({ length: 1014 }, () => 1), "L", 2, 2, "ARC", 90, 3, 3];
  assert.equal(maximumSource.length, 1024);
  for (const complexPolygons of [[circle], [maximumSource], Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => rectangle))]) {
    const input = { method: METHOD, arguments: { complexPolygons } };
    const current = fixture();
    const result = validatePublicSdkReadPayload(decodeExactReadEnvelope(await run(current.api, input)), input);
    assert.equal(Array.isArray(result["value"]), true);
    assert.equal(current.calls().creates, complexPolygons.length);
    assert.equal(current.calls().splits, 1);
  }
});

void test("split refuses malformed, non-JSON and excessive input before constructors or split", async () => {
  const sparse: unknown[] = []; sparse[1] = circle;
  const inputs: unknown[] = [[], [Array.from({ length: 9 }, () => circle)], Array.from({ length: 9 }, () => circle),
    [[0, 0, "L", 1]], [[0, 0, "C", 1, 2]], [["CIRCLE", 0, 0, Number.NaN]], [["R", 0, 0, 1, 1, Infinity, 0]],
    [[0, 0, "L", ...Array.from({ length: 1022 }, () => 1)]], [new ComplexPolygon([circle])], sparse,
    Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => [0, 0, "L", ...Array.from({ length: 400 }, () => 1)]))];
  for (const complexPolygons of inputs) {
    const current = fixture();
    await assert.rejects(run(current.api, { method: METHOD, arguments: { complexPolygons } }));
    assert.deepEqual(current.calls(), { creates: 0, splits: 0 });
  }
  for (const extra of [{ callback: "evil" }, { code: "evil" }, { methodName: "create" }]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ method: METHOD, arguments: { complexPolygons: [circle], ...extra } }).success, false);
  }
  let gets = 0;
  const getter = Object.defineProperty([], "0", { enumerable: true, get: () => { gets += 1; return circle; } });
  assert.equal(publicSdkReadRequestSchema.safeParse({ method: METHOD, arguments: { complexPolygons: getter } }).success, false);
  assert.equal(gets, 0);
});

void test("split validates constructor output and independent input parity before dispatch", async () => {
  for (const construct of [(): unknown => undefined, (): unknown => ({}), (): unknown => Promise.resolve(new ComplexPolygon([circle])),
    (): unknown => new ComplexPolygon([circle]), (input: PolygonSource[]): unknown => { input[0]?.push(100); return new ComplexPolygon(input); },
    (): never => { throw new Error("private constructor error"); }]) {
    const current = fixture({ construct });
    await assert.rejects(run(current.api), /complete bounded observation/u);
    assert.deepEqual(current.calls(), { creates: 1, splits: 0 });
  }
  const missing = fixture(); delete missing.api["createComplexPolygon"];
  await assert.rejects(run(missing.api), /sdk-polygon-constructor/u);
  assert.deepEqual(missing.calls(), { creates: 0, splits: 0 });
});

void test("split refuses missing, reordered, changed, substituted, sparse, accessor and asynchronous outputs", async () => {
  let accessorCalls = 0;
  const outputs: ((input: ComplexPolygon[]) => unknown)[] = [(): unknown => undefined, () => [], () => Promise.resolve([]),
    (input) => input.flatMap((value) => value.toPolygon()).toReversed(),
    (input) => [...input.flatMap((value) => value.toPolygon()), new Polygon(circle)],
    (input) => input.flatMap((value) => value.toPolygon()).map((_value) => new Polygon(circle)),
    (input) => input.flatMap((value) => value.toPolygon()).map((_value) => ({})),
    (input) => input.flatMap((value) => value.toPolygon()).map((_value) => ({ getSource: (): never => { throw new Error("private getter error"); } })),
    (input) => { const result = input.flatMap((value) => value.toPolygon()); Reflect.deleteProperty(result, "0"); return result; },
    (input) => { const result = input.flatMap((value) => value.toPolygon()); Object.defineProperty(result, "0", { get: () => { accessorCalls += 1; return new Polygon(circle); } }); return result; },
    (input) => Object.assign(input.flatMap((value) => value.toPolygon()), { extra: true }),
    (input) => { const result = input.flatMap((value) => value.toPolygon()); result[0]?.source.push(100); return result; },
    () => { throw new Error("private split error"); }];
  for (const split of outputs) {
    const current = fixture({ split });
    await assert.rejects(run(current.api), /complete bounded observation/u);
    assert.equal(current.calls().splits, 1);
  }
  assert.equal(accessorCalls, 0);
});

void test("host split validator independently rejects forged sources, order and undefined evidence", async () => {
  const payload = decodeExactReadEnvelope(await run(fixture().api));
  assert.ok(payload !== null && typeof payload === "object" && !Array.isArray(payload));
  for (const replacement of [{ value: groups.flat().toReversed() }, { value: groups.flat().slice(1) }, { value: [circle] },
    { undefinedPaths: ["/value/0/1"] }, { present: false }]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, ...replacement }, request));
  }
});

const context: ExpectedContext = { project: { uuid: "polygon-project", path: "/tmp/polygon-fixture.eprj2" }, document: { uuid: "polygon-board", documentType: 3, tabId: "polygon-tab" } };
function coordinator(options: { driftContext?: number; driftProfile?: number; quarantine?: number; transportFailure?: boolean; nativeFailure?: boolean; differingObservation?: boolean } = {}): {
  engine: EasyedaControlEngine; counts: () => { calls: number; contexts: number; profiles: number; gates: number };
} {
  let calls = 0, contexts = 0, gates = 0, profiles = 0;
  class FixtureEngine extends EasyedaControlEngine {
    // oxlint-disable-next-line eslint/class-methods-use-this -- Overrides the instance-bound production gate for a synthetic coordinator test.
    protected override assertPublicSdkImplementation(): Promise<void> {
      profiles += 1;
      return profiles === options.driftProfile ? Promise.reject(new Error("fixture runtime drift")) : Promise.resolve();
    }
  }
  const engine = new FixtureEngine({ async callTool(name, arguments_): Promise<unknown> {
    calls += 1;
    assert.equal(name, "easyeda_execute");
    assert.ok(typeof arguments_?.["code"] === "string" && arguments_["code"].includes("polygon-project") && arguments_["code"].includes("polygon-board"));
    if (options.transportFailure === true) { throw new Error("fixture transport failure"); }
    const result = await run(fixture(options.nativeFailure === true ? { split: (): never => { throw new Error("fixture split failure"); } } : {}).api);
    if (options.differingObservation === true && calls === 2) {
      // Keep transport framing valid: the second observation's altered sources
      // Must fail the independent host parity check, not merely its byte count.
      const payload = decodeExactReadEnvelope(result);
      assert.ok(payload !== null && typeof payload === "object");
      return { structuredContent: { ok: true, result: encodeExactReadEnvelope({ ...payload, value: [circle] }) } };
    }
    return { structuredContent: { ok: true, result } };
  } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return gates === options.quarantine ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
  engine.assertContext = (expected): Promise<ContextProbePayload> => { contexts += 1; return contexts === options.driftContext ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "polygon-tab" } }); };
  return { engine, counts: () => ({ calls, contexts, profiles, gates }) };
}

void test("real SDK coordinator accepts two exact polygon observations with all shared guards", async () => {
  const current = coordinator();
  const result = await current.engine.publicSdkRead(request, context);
  assert.equal(result["authority"], "public-sdk-observation-not-complete-design-proof");
  assert.deepEqual(current.counts(), { calls: 2, contexts: 5, profiles: 2, gates: 3 });
});

void test("real SDK coordinator refuses polygon context, runtime, quarantine, transport and native failures without retry", async () => {
  for (const options of [{ driftContext: 3 }, { driftProfile: 1 }, { driftProfile: 2 }, { quarantine: 3 }, { transportFailure: true }, { nativeFailure: true }, { differingObservation: true }]) {
    const current = coordinator(options);
    await assert.rejects(current.engine.publicSdkRead(request, context));
    let expectedCalls = 1;
    if (options.driftProfile === 1) { expectedCalls = 0; }
    else if (options.driftProfile === 2 || options.differingObservation === true) { expectedCalls = 2; }
    assert.equal(current.counts().calls, expectedCalls);
  }
});

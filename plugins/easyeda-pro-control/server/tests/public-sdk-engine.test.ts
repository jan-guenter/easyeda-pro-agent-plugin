import assert from "node:assert/strict";
import { test } from "node:test";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { buildPublicSdkReadCode, publicSdkReadRequestSchema } from "../src/public-sdk-read.ts";

type ReaderFunction = (eda: unknown) => Promise<unknown>;
type ReaderConstructor = new (...arguments_: string[]) => ReaderFunction;
const asyncPrototype: unknown = Object.getPrototypeOf(async (): Promise<null> => { await Promise.resolve(); return null; });
if (asyncPrototype === null || typeof asyncPrototype !== "object" || !("constructor" in asyncPrototype) || typeof asyncPrototype.constructor !== "function") {
  throw new Error("Async reader constructor is unavailable in this test runtime.");
}
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only compilation runs the maintained generated reader, never caller code.
const AsyncFunction = asyncPrototype.constructor as ReaderConstructor;
const context: ExpectedContext = { project: { uuid: "disposable-project", path: "/tmp/disposable-sdk.eprj2" },
  document: { uuid: "disposable-pcb", documentType: 3, tabId: "disposable-tab" } };
const request = { method: "eda.sys_Environment.getEditorCurrentVersion", arguments: {} };

function fixture(options: { versions?: string[]; failDispatch?: boolean; failContext?: number; quarantine?: number; failProfile?: number } = {}): {
  engine: EasyedaControlEngine; observations: () => { calls: number; contexts: number; gates: number }; implementationChecks: () => number;
} {
  let calls = 0;
  let contexts = 0;
  let gates = 0;
  let profiles = 0;
  class FixtureEngine extends EasyedaControlEngine {
    // oxlint-disable-next-line eslint/class-methods-use-this -- Test override of an instance-bound runtime gate; static would not intercept the production call.
    protected override assertPublicSdkImplementation(): Promise<void> {
      profiles += 1;
      return profiles === options.failProfile ? Promise.reject(new Error("fixture delegated implementation drift")) : Promise.resolve();
    }
  }
  const body = buildPublicSdkReadCode(publicSdkReadRequestSchema.parse(request));
  const engine = new FixtureEngine({ async callTool(name, arguments_): Promise<unknown> {
    calls += 1;
    assert.equal(name, "easyeda_execute");
    assert.ok(arguments_ !== undefined);
    assert.ok(typeof arguments_["code"] === "string");
    assert.ok(arguments_["code"].includes("disposable-project"));
    assert.ok(arguments_["code"].includes("disposable-pcb"));
    if (options.failDispatch === true) { throw new Error("fixture transport failure"); }
    const version = options.versions?.[calls - 1] ?? "fixture-version";
    const result = await new AsyncFunction("eda", body)({ sys_Environment: { getEditorCurrentVersion: (): string => version } });
    return { structuredContent: { ok: true, result } };
  } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => {
    gates += 1;
    if (options.quarantine === gates) { return Promise.reject(new Error("fixture quarantined")); }
    return Promise.resolve(true);
  };
  engine.assertContext = (expected): Promise<ContextProbePayload> => {
    contexts += 1;
    if (options.failContext === contexts) { return Promise.reject(new Error("fixture context drift")); }
    return Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "disposable-tab" } });
  };
  return { engine, observations: () => ({ calls, contexts, gates }), implementationChecks: () => profiles };
}

void test("SDK engine binds the target and returns two matching observations without claiming design proof", async () => {
  const current = fixture();
  const result = await current.engine.publicSdkRead(request, context);
  assert.equal(result["authority"], "public-sdk-observation-not-complete-design-proof");
  assert.deepEqual(current.observations(), { calls: 2, contexts: 5, gates: 3 });
  assert.equal(current.implementationChecks(), 2);
  assert.equal(context.document.tabId, "disposable-tab");
});

void test("SDK engine refuses differing samples without a third attempt", async () => {
  const current = fixture({ versions: ["before", "after"] });
  await assert.rejects(current.engine.publicSdkRead(request, context), /changed between consecutive samples/u);
  assert.equal(current.observations().calls, 2);
});

void test("SDK engine does not retry an uncertain first call", async () => {
  const current = fixture({ failDispatch: true });
  await assert.rejects(current.engine.publicSdkRead(request, context), /fixture transport failure/u);
  assert.deepEqual(current.observations(), { calls: 1, contexts: 2, gates: 2 });
});

void test("SDK engine stops on post-call context drift and new quarantine", async () => {
  for (const options of [{ failContext: 3 }, { quarantine: 3 }]) {
    const current = fixture(options);
    await assert.rejects(current.engine.publicSdkRead(request, context), /fixture (context drift|quarantined)/u);
    assert.equal(current.observations().calls, 1);
  }
});

void test("SDK engine refuses caller code, writes and wrong editor before native observation", async () => {
  for (const invalid of [{ ...request, code: "arbitrary()" },
    { method: "eda.pcb_Document.save", arguments: {} },
    { method: "eda.pcb_PrimitivePad.get", arguments: { primitiveIds: "pad-1" } }]) {
    const current = fixture();
    await assert.rejects(current.engine.publicSdkRead(invalid, { ...context, document: { ...context.document, documentType: 1 } }));
    assert.equal(current.observations().calls, 0);
  }
});

void test("SDK reader refuses missing delegated implementation identity before any context or native call", async () => {
  let calls = 0;
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => {
    calls += 1;
    return Promise.reject(new Error("No upstream call is allowed."));
  } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => Promise.resolve(true);
  await assert.rejects(engine.publicSdkRead(request, context), /reviewed installed UI, manager and schematic implementations/u);
  assert.equal(calls, 0);
});

void test("SDK reader rejects delegated implementation drift both before dispatch and before publishing observations", async () => {
  for (const failProfile of [1, 2]) {
    const current = fixture({ failProfile });
    await assert.rejects(current.engine.publicSdkRead(request, context), /delegated implementation drift/u);
    assert.equal(current.observations().calls, failProfile === 1 ? 0 : 2);
    assert.equal(current.implementationChecks(), failProfile);
  }
});

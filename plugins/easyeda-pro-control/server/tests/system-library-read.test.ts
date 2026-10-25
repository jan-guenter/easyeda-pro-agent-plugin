import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";

const METHOD = "eda.lib_LibrariesList.getSystemLibraryUuid";
// Public installed UI constant, not a private library or fixture identity.
const SYSTEM_UUID = "0819f05c4eef4c71ace90d822a990e87";
const request = { method: METHOD, arguments: {} };
const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/system-library-fixture.eprj2" },
  document: { uuid: "fixture-board", documentType: 3, tabId: "fixture-tab" } };
const forbidden = (): never => assert.fail("Account/library enumeration or asset access must not run.");

async function run(code: string, value: unknown, reject = false): Promise<unknown> {
  const api = {
    getSystemLibraryUuid(this: unknown, ...args: unknown[]): Promise<unknown> {
      assert.equal(this, api); assert.deepEqual(args, []);
      return reject ? Promise.reject(new Error("private native exception")) : Promise.resolve(value);
    },
  };
  for (const method of ["getAllLibrariesList", "getPersonalLibraryUuid", "getFavoriteLibraryUuid", "getProjectLibraryUuid"]) {
    Object.defineProperty(api, method, { get: forbidden });
  }
  const eda = { lib_LibrariesList: api,
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } };
  return await runInNewContext(`(async()=>{${code}})()`, { TextEncoder, eda }, { timeout: 1000 }) as unknown;
}

void test("system-library UUID uses strict empty arguments and does not admit neighboring account methods", () => {
  for (const documentType of [1, 2, 3, 4]) { assert.deepEqual(validatePublicSdkReadRequest(request, documentType), request); }
  for (const documentType of [0, 5, 15, 29]) { assert.throws(() => validatePublicSdkReadRequest(request, documentType)); }
  for (const args of [{ libraryUuid: SYSTEM_UUID }, { projectUuid: "fixture-project" }, { callback: "code" }, [], null]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, arguments: args }).success, false);
  }
  assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, code: "arbitrary" }).success, false);
  for (const method of ["getAllLibrariesList", "getPersonalLibraryUuid", "getFavoriteLibraryUuid"]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, method: `eda.lib_LibrariesList.${method}` }).success, false);
  }
  const descriptor = publicSdkReadDescriptors().find((row) => row.path === METHOD); assert.ok(descriptor);
  assert.equal(descriptor.implementation.kind, "public-method"); assert.equal(descriptor.result.optional, false);
  assert.equal(descriptor.implementation.test, "server/tests/system-library-read.test.ts");
  assert.equal(descriptor.liveValidation, "not-yet-validated"); assert.deepEqual(descriptor.parameters, []);
  assert.ok(descriptor.limitations.some((item) => item.includes("No account/library enumeration")));
});

void test("system-library reader awaits its receiver-bound getter and retains only the observed UUID", async () => {
  const payload = decodeExactReadEnvelope(await run(buildPublicSdkReadCode(request), SYSTEM_UUID));
  const result = validatePublicSdkReadPayload(payload, request);
  assert.equal(result["value"], SYSTEM_UUID);
  assert.equal(result["assurance"], "bounded-public-sdk-observation-not-native-or-persistence-proof");
  assert.deepEqual(result["undefinedPaths"], []);
});

void test("system-library reader and independent host validation reject missing and malformed identities", async () => {
  const code = buildPublicSdkReadCode(request);
  for (const value of [undefined, null, false, 1, "", "x".repeat(32), "a".repeat(31), "a".repeat(33), SYSTEM_UUID.toUpperCase(), `${SYSTEM_UUID}\n`, [SYSTEM_UUID], { uuid: SYSTEM_UUID }]) {
    await assert.rejects(run(code, value), /sdk-system-library-uuid/u);
    assert.throws(() => validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: METHOD, present: true, value, undefinedPaths: [] }, request));
  }
  for (const payload of [
    { ok: true, kind: "public-sdk-read", method: METHOD, present: false, value: null, undefinedPaths: ["/value"] },
    { ok: true, kind: "public-sdk-read", method: METHOD, present: true, value: SYSTEM_UUID, undefinedPaths: ["/value/private"] },
  ]) { assert.throws(() => validatePublicSdkReadPayload(payload, request)); }
  await assert.rejects(run(code, SYSTEM_UUID, true), { message: `Public SDK read could not produce a complete bounded observation; method=${METHOD}|stage=call|code=native-error|getter=none` });
});

void test("coverage retains both system-library getter routes while account discovery stays omitted and live validation unclaimed", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  const current = rows.get(METHOD); assert.ok(current);
  assert.equal(current.status, "implemented-public-subset"); assert.equal(current.omission, null);
  assert.equal(current.currentGenerationLiveValidation, "not-recorded"); assert.equal(current.runtimeAdmission, "not-granted-by-inventory");
  assert.deepEqual(current.routes.map((route) => route.tool).toSorted(), ["easyeda_control_public_readers", "easyeda_control_sdk_read"]);
  const legacy = current.routes.find((route) => route.tool === "easyeda_control_sdk_read"); assert.ok(legacy);
  assert.deepEqual(legacy.tests, ["system-library-read.test.ts"]);
  const installed = current.routes.find((route) => route.tool === "easyeda_control_public_readers"); assert.ok(installed);
  assert.deepEqual(installed.tests, ["sdk-public-readers.test.ts", "sdk-public-readers-batch.test.ts", "sdk-public-readers-runtime.test.ts", "sdk-public-readers-ui.test.ts", "sdk-public-readers-registration.test.ts", "facade-mode.test.ts"]);
  assert.match(installed.scope, /EasyEDA 3\.2\.209\/API 0\.3\.59 only; older profiles do not register this route/u);
  for (const route of [legacy, installed]) {
    assert.equal(route.selector, METHOD); assert.equal(route.implementation, "public-method");
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  }
  for (const method of ["getAllLibrariesList", "getPersonalLibraryUuid", "getFavoriteLibraryUuid"]) {
    const row = rows.get(`eda.lib_LibrariesList.${method}`); assert.ok(row);
    assert.equal(row.status, "omitted"); assert.deepEqual(row.routes, []); assert.ok(row.omission);
    assert.equal(row.omission.code, "installed-209-library-discovery-mutates-ui");
    assert.match(row.omission.reason, /not passive owner-ID reads/u);
  }
});

type Fault = "none" | "context" | "initial-profile" | "final-profile" | "quarantine" | "transport" | "native" | "state";
function coordinator(fault: Fault): { engine: EasyedaControlEngine; counts: () => { calls: number; contexts: number; profiles: number; gates: number } } {
  let calls = 0, contexts = 0, gates = 0, profiles = 0;
  class FixtureEngine extends EasyedaControlEngine {
    // oxlint-disable-next-line eslint/class-methods-use-this -- Synthetic seam substitutes only source admission; the maintained coordinator and generated context checks still execute.
    protected override assertPublicSdkImplementation(): Promise<void> {
      profiles += 1;
      return fault === "initial-profile" || fault === "final-profile" && profiles === 2 ? Promise.reject(new Error("fixture runtime drift")) : Promise.resolve();
    }
  }
  const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
    calls += 1; assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string");
    if (fault === "transport") { throw new Error("fixture transport failure"); }
    const value = fault === "state" && calls === 2 ? "a".repeat(32) : SYSTEM_UUID;
    const result = await run(args["code"], value, fault === "native");
    return { structuredContent: { ok: true, result } };
  } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => {
    gates += 1; return fault === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true);
  };
  engine.assertContext = (expected): Promise<ContextProbePayload> => {
    contexts += 1; return fault === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-tab" } });
  };
  return { engine, counts: () => ({ calls, contexts, profiles, gates }) };
}

void test("real stable-reader coordinator checks context, profile and quarantine around two system UUID observations", async () => {
  const current = coordinator("none");
  const result = await current.engine.publicSdkRead(request, context);
  assert.equal(result["value"], SYSTEM_UUID); assert.equal(result["authority"], "public-sdk-observation-not-complete-design-proof");
  assert.deepEqual(current.counts(), { calls: 2, contexts: 5, profiles: 2, gates: 3 });
});

void test("real system UUID coordinator refuses drift, disconnect and native errors without retry", async () => {
  for (const fault of ["context", "initial-profile", "final-profile", "quarantine", "transport", "native", "state"] as const) {
    const current = coordinator(fault);
    await assert.rejects(current.engine.publicSdkRead(request, context), /fixture|native-error|changed between consecutive samples/u);
    let expectedCalls = 1;
    if (fault === "initial-profile") { expectedCalls = 0; }
    else if (["final-profile", "state"].includes(fault)) { expectedCalls = 2; }
    assert.equal(current.counts().calls, expectedCalls, fault);
  }
});

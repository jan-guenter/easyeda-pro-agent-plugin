import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import {
  SDK_PUBLIC_READERS_209_LANGUAGES,
  SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION,
  buildSdkPublicReadersProgram,
  parseSdkPublicReadersRequest,
  querySdkPublicReadersMethods,
  sdkPublicReadersDescriptors,
  validateSdkPublicReadersArguments,
  validateSdkPublicReadersResult,
} from "../src/sdk-public-readers.ts";

const languageRequest = { method: "eda.sys_I18n.getAllSupportedLanguages", arguments: {} };
const viewportRequest = { method: "eda.sys_Window.getViewportSize", arguments: {} };
const supportRequest = (language: string): unknown => ({ method: "eda.sys_I18n.isLanguageSupported", arguments: { language } });
function runProgram(request: unknown, environment: Record<string, unknown>): unknown {
  return runInNewContext(`(()=>{${buildSdkPublicReadersProgram(request)}})()`, { TextEncoder, ...environment }, { timeout: 1000 }) as unknown;
}
function result(request: unknown, environment: Record<string, unknown>): Record<string, unknown> {
  return validateSdkPublicReadersResult(request, decodeExactReadEnvelope(runProgram(request, environment)));
}

void test("all three public readers preserve the exact receiver and positional arguments in two synchronous samples", () => {
  const languages = [...SDK_PUBLIC_READERS_209_LANGUAGES], viewport = { width: 1920, height: 1080 };
  const cases = [
    { request: languageRequest, namespace: "sys_I18n", name: "getAllSupportedLanguages", expected: languages, positional: [] },
    { request: supportRequest("zh-Hans"), namespace: "sys_I18n", name: "isLanguageSupported", expected: true, positional: ["zh-Hans"] },
    { request: viewportRequest, namespace: "sys_Window", name: "getViewportSize", expected: viewport, positional: [] },
  ];
  for (const entry of cases) {
    const owner: Record<string, unknown> = {}; let calls = 0;
    owner[entry.name] = function read(this: unknown, ...args: unknown[]): unknown {
      assert.equal(this, owner); assert.deepEqual(structuredClone(args), entry.positional); calls += 1;
      return structuredClone(entry.expected);
    };
    const value = result(entry.request, { eda: { [entry.namespace]: owner }, window: {} });
    assert.equal(calls, 2); assert.deepEqual(value["value"], entry.expected);
    assert.equal(value["apiVersion"], "0.3.59.1ca9efb5");
    assert.match(String(value["authority"]), /not-project-state-or-runtime-admission/u);
  }
});

void test("public reader catalog exposes exact schemas and reviewed source offsets without execution authority", () => {
  assert.equal(sdkPublicReadersDescriptors().length, 9);
  assert.equal(querySdkPublicReadersMethods()["total"], 9);
  assert.equal(JSON.stringify(querySdkPublicReadersMethods()).includes("inputSchema"), false);
  const filtered = querySdkPublicReadersMethods({ method: viewportRequest.method, includeSchemas: true });
  assert.equal(filtered["total"], 1); assert.match(JSON.stringify(filtered), /inputSchema/u);
  for (const descriptor of sdkPublicReadersDescriptors()) {
    assert.equal(descriptor.invocationEnabledByDiscovery, false);
    assert.equal(descriptor.provenance.liveValidation, "not-recorded");
    assert.equal(descriptor.provenance.version, "0.3.59.1ca9efb5");
    assert.ok(descriptor.source.utf16Offsets.length > 0);
  }
  assert.equal(validateSdkPublicReadersArguments(supportRequest("EN"))["valid"], true);
  assert.equal(validateSdkPublicReadersArguments(supportRequest("en"))["executionAuthorized"], false);
  for (const request of [supportRequest(""), supportRequest(" en"), supportRequest("en\n"), supportRequest("a".repeat(65)),
    { ...viewportRequest, arguments: { code: "private()" } }, { ...languageRequest, private: true },
    { method: "eda.sys_I18n.text", arguments: {} }, { method: "eda.sys_Window.open", arguments: {} }]) {
    assert.throws(() => parseSdkPublicReadersRequest(request)); assert.throws(() => buildSdkPublicReadersProgram(request));
    assert.equal(validateSdkPublicReadersArguments(request)["valid"], false);
  }
});

void test("public language support retains case-sensitive and alias-free membership", () => {
  for (const language of ["en", "EN", "zh-Hans", "zh-hans", "zh-CN", "zh_CN", "en-boont", "x-unknown"]) {
    const expected = SDK_PUBLIC_READERS_209_LANGUAGES.some((item) => item === language);
    const request = supportRequest(language);
    const value = result(request, { eda: { sys_I18n: { isLanguageSupported: (input: string): boolean => {
      assert.equal(input, language); return expected;
    } } } });
    assert.equal(value["value"], expected);
    assert.throws(() => result(request, { eda: { sys_I18n: { isLanguageSupported: (): boolean => !expected } } }), /SDK_PUBLIC_READERS_READ_FAILED/u);
  }
});

void test("language catalog refuses omissions, duplicates, reorder, inherited indexes, accessors and extra fields", () => {
  const languageValues: unknown[] = [[], SDK_PUBLIC_READERS_209_LANGUAGES.slice(1), [...SDK_PUBLIC_READERS_209_LANGUAGES, "new"],
    SDK_PUBLIC_READERS_209_LANGUAGES.toReversed(), Promise.resolve([...SDK_PUBLIC_READERS_209_LANGUAGES])];
  const duplicate = [...SDK_PUBLIC_READERS_209_LANGUAGES]; duplicate[0] = "bn"; languageValues.push(duplicate);
  const accessor = [...SDK_PUBLIC_READERS_209_LANGUAGES];
  Object.defineProperty(accessor, "0", { get: (): never => { throw new Error("PRIVATE_ACCESSOR"); } }); languageValues.push(accessor);
  const extra = Object.assign([...SDK_PUBLIC_READERS_209_LANGUAGES], { omitted: true }); languageValues.push(extra);
  const symbol = [...SDK_PUBLIC_READERS_209_LANGUAGES]; Object.defineProperty(symbol, Symbol("hidden"), { value: 1 }); languageValues.push(symbol);
  const inherited = [...SDK_PUBLIC_READERS_209_LANGUAGES];
  Reflect.deleteProperty(inherited, "0"); Object.setPrototypeOf(inherited, { "0": "ar" }); languageValues.push(inherited);
  for (const value of languageValues) {
    assert.throws(() => runProgram(languageRequest, { eda: { sys_I18n: { getAllSupportedLanguages: (): unknown => value } } }), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
  }
});

void test("viewport preserves zero and integer bounds but rejects malformed, fractional or non-finite dimensions", () => {
  for (const viewport of [{ width: 0, height: 0 }, { width: SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION, height: 1 }]) {
    const value = result(viewportRequest, { window: {}, eda: { sys_Window: { getViewportSize: (): unknown => viewport } } });
    assert.deepEqual(value["value"], viewport); assert.equal(value["units"], "css-pixels"); assert.equal(value["viewportScope"], "public-api-extension-page");
  }
  const invalidValues: unknown[] = [null, [], {}, { width: 2 }, { width: 2, height: 3, deviceScaleFactor: 1 },
    Promise.resolve({ width: 2, height: 3 }), Object.create({ width: 2, height: 3 }) as unknown,
    ...[-1, -0, Number.NaN, Infinity, 0.5, "1", SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION + 1].map((width) => ({ width, height: 3 }))];
  const accessor = Object.defineProperty({ height: 3 }, "width", { enumerable: true, get: (): never => { throw new Error("PRIVATE_VIEWPORT"); } });
  invalidValues.push(accessor);
  for (const viewport of invalidValues) {
    assert.throws(() => runProgram(viewportRequest, { window: {}, eda: { sys_Window: { getViewportSize: (): unknown => viewport } } }), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
  }
});

void test("public readers reject namespace, method or window replacement and viewport instability without a third call", () => {
  for (const replacement of ["namespace", "method", "window", "dimensions"] as const) {
    let calls = 0; const owner: Record<string, unknown> = {};
    const eda: Record<string, unknown> = { sys_Window: owner };
    const environment: Record<string, unknown> = { eda, window: {} };
    // The VM copies its top-level environment. The window replacement case
    // Deliberately evaluates a fixed callback against that context itself.
    owner["getViewportSize"] = (): unknown => {
      calls += 1;
      if (replacement === "namespace") { eda["sys_Window"] = {}; }
      if (replacement === "method") { owner["getViewportSize"] = (): unknown => ({ width: 3, height: 4 }); }
      return { width: replacement === "dimensions" ? calls : 3, height: 4 };
    };
    if (replacement === "window") {
      assert.throws(() => runInNewContext(`eda.sys_Window.getViewportSize=()=>{window={};return {width:3,height:4};};(()=>{${buildSdkPublicReadersProgram(viewportRequest)}})()`,
        { ...environment, TextEncoder }, { timeout: 1000 }), /SDK_PUBLIC_READERS_READ_FAILED/u);
    } else {
      assert.throws(() => runProgram(viewportRequest, environment), /SDK_PUBLIC_READERS_READ_FAILED/u);
      assert.equal(calls, replacement === "dimensions" ? 2 : 1);
    }
  }
  for (const method of [(): Promise<boolean> => Promise.resolve(true), (): never => { throw new Error("PRIVATE_FAILURE"); }, (): string => "true"]) {
    assert.throws(() => runProgram(supportRequest("en"), { eda: { sys_I18n: { isLanguageSupported: method } } }), { message: "SDK_PUBLIC_READERS_READ_FAILED" });
  }
});

void test("public readers copy complete first observations before the next sample and independently validate transport", () => {
  const shared = { width: 3, height: 4 }; let calls = 0;
  assert.throws(() => runProgram(viewportRequest, { window: {}, eda: { sys_Window: { getViewportSize: (): unknown => {
    calls += 1; shared.width = calls; return shared;
  } } } }), /SDK_PUBLIC_READERS_READ_FAILED/u);
  const payload = { ok: true, kind: "sdk-public-readers", method: viewportRequest.method, value: { width: 3, height: 4 } };
  for (const value of [{ ...payload, method: languageRequest.method }, { ...payload, hidden: true }, { ...payload, value: { width: 3, height: 4, hidden: true } },
    { ...payload, value: { width: -0, height: 4 } }, { ...payload, value: { width: "3", height: 4 } }]) {
    assert.throws(() => validateSdkPublicReadersResult(viewportRequest, value));
  }
  assert.throws(() => validateSdkPublicReadersResult(languageRequest, { ...payload, method: languageRequest.method, value: SDK_PUBLIC_READERS_209_LANGUAGES.slice(1) }));
  assert.throws(() => validateSdkPublicReadersResult(supportRequest("EN"), { ...payload, method: "eda.sys_I18n.isLanguageSupported", value: true }));
});
